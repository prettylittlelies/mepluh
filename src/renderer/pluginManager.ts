import { Logger } from "@shared/logger";
import type { OptionsSchema, OptionValue } from "@shared/options";
import type { PluginChannel, PluginDefinition, RendererContext } from "@shared/plugin";
import type { PluginSettings, SettingsSnapshot } from "@shared/settings";
import { optionsOf } from "@shared/settingsResolver";
import { styles } from "./styleRegistry";

export type ChangeEffect = "applied" | "restart";

const log = new Logger("plugins");

export class RendererPluginManager {
    private readonly running = new Set<string>();
    private readonly pendingRestart = new Set<string>();
    private readonly listeners = new Set<() => void>();
    private snapshot: SettingsSnapshot;
    private revision = 0;

    public constructor(public readonly plugins: readonly PluginDefinition[]) {
        this.snapshot = MepluhNative.settings.get();
    }

    public get version(): number {
        return this.revision;
    }

    public readonly subscribe = (listener: () => void): (() => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    public get needsRestart(): boolean {
        return this.pendingRestart.size > 0;
    }

    public find(name: string): PluginDefinition | undefined {
        return this.plugins.find(plugin => plugin.name === name);
    }

    public settingsOf(plugin: PluginDefinition): PluginSettings {
        return this.snapshot.plugins[plugin.name] ?? { enabled: plugin.enabledByDefault, options: {} };
    }

    public isHotSwappable(plugin: PluginDefinition): boolean {
        return !plugin.patches?.length && !MepluhNative.nativePlugins.includes(plugin.name);
    }

    public startEnabled(): void {
        this.plugins.filter(plugin => this.settingsOf(plugin).enabled).forEach(plugin => this.start(plugin));
    }

    public async setEnabled(plugin: PluginDefinition, enabled: boolean): Promise<ChangeEffect> {
        return this.commit(plugin, { ...this.settingsOf(plugin), enabled });
    }

    public async setOption(plugin: PluginDefinition, key: string, value: OptionValue): Promise<ChangeEffect> {
        const current = this.settingsOf(plugin);
        return this.commit(plugin, { ...current, options: { ...current.options, [key]: value } });
    }

    private async commit(plugin: PluginDefinition, next: PluginSettings): Promise<ChangeEffect> {
        await MepluhNative.settings.set(plugin.name, next);
        this.snapshot = MepluhNative.settings.get();
        const effect = this.apply(plugin, next);
        this.revision++;
        this.listeners.forEach(listener => listener());
        return effect;
    }

    private apply(plugin: PluginDefinition, next: PluginSettings): ChangeEffect {
        if (!this.isHotSwappable(plugin)) {
            this.pendingRestart.add(plugin.name);
            return "restart";
        }
        this.stop(plugin);
        if (next.enabled) this.start(plugin);
        return "applied";
    }

    private start(plugin: PluginDefinition): void {
        if (this.running.has(plugin.name)) return;
        this.running.add(plugin.name);
        if (plugin.styles) styles.set(`plugin:${plugin.name}`, plugin.styles);
        const context: RendererContext<OptionsSchema> = {
            options: optionsOf(plugin, this.snapshot),
            channel: this.channelFor(plugin.name),
            log: log.child(plugin.name)
        };
        Promise.resolve()
            .then(() => plugin.start?.(context))
            .catch((error: unknown) => log.error(`Failed to start ${plugin.name}`, error));
    }

    private stop(plugin: PluginDefinition): void {
        if (!this.running.delete(plugin.name)) return;
        styles.delete(`plugin:${plugin.name}`);
        try {
            plugin.stop?.();
        } catch (error) {
            log.error(`Failed to stop ${plugin.name}`, error);
        }
    }

    private channelFor(name: string): PluginChannel {
        return {
            invoke: <TResult>(handler: string, ...args: readonly unknown[]) => MepluhNative.invoke(name, handler, args) as Promise<TResult>,
            on: (event, listener) => MepluhNative.subscribe(name, (received, payload) => received === event && listener(payload))
        };
    }
}
