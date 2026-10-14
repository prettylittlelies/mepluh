import { session, webContents } from "electron";
import { IpcChannel } from "@shared/ipc";
import type { Logger } from "@shared/logger";
import type { OptionsSchema, ResolvedOptions } from "@shared/options";
import type { PluginDefinition } from "@shared/plugin";
import { isEnabled, optionsOf } from "@shared/settingsResolver";
import type { BoundHandler, NativeBinding, NativeHost } from "./native";
import type { ModPaths } from "./paths";
import type { SettingsStore } from "./settingsStore";

export class NativeRuntime implements NativeHost {
    private readonly handlers = new Map<string, ReadonlyMap<string, BoundHandler>>();
    private readonly active: readonly NativeBinding[];
    public readonly pluginNames: readonly string[];

    public constructor(
        bindings: readonly NativeBinding[],
        private readonly store: SettingsStore,
        public readonly paths: ModPaths,
        public readonly log: Logger
    ) {
        this.pluginNames = bindings.map(binding => binding.plugin.name);
        this.active = bindings.filter(binding => isEnabled(binding.plugin, store.current));
    }

    public get blocklists(): readonly NativeBinding["blocklist"][] {
        return this.active.map(binding => binding.blocklist);
    }

    public start(): void {
        for (const binding of this.active) {
            try {
                this.handlers.set(binding.plugin.name, binding.start(this));
            } catch (error) {
                this.log.error(`Failed to start native for ${binding.plugin.name}`, error);
            }
        }
    }

    public options<TSchema extends OptionsSchema>(plugin: PluginDefinition<TSchema>): ResolvedOptions<TSchema> {
        return optionsOf(plugin, this.store.current);
    }

    public broadcast(plugin: string, event: string, payload: unknown): void {
        this.send(IpcChannel.PluginEvent, plugin, event, payload);
    }

    public broadcastCore(channel: string): void {
        this.send(channel);
    }

    private send(channel: string, ...args: readonly unknown[]): void {
        webContents
            .getAllWebContents()
            .filter(contents => contents.session === session.defaultSession && !contents.isDestroyed())
            .forEach(contents => contents.send(channel, ...args));
    }

    public invoke(plugin: string, handler: string, args: readonly unknown[]): unknown {
        const bound = this.handlers.get(plugin)?.get(handler);
        if (!bound) throw new Error(`No native handler ${plugin}.${handler} is active`);
        return bound(args);
    }
}
