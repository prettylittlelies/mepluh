import { Logger } from "@shared/logger";
import type { ThemeMeta, ThemeSettings } from "@shared/themes";
import { styles } from "./styleRegistry";

export type OnlineThemeStatus = { readonly state: "loading" } | { readonly state: "loaded" } | { readonly state: "failed"; readonly error: string };

const log = new Logger("themes");

const localStyleId = (id: string): string => `theme:${id}`;
const onlineStyleId = (link: string): string => `theme-online:${link}`;

export class ThemeManager {
    private readonly listeners = new Set<() => void>();
    private readonly applied = new Set<string>();
    private readonly onlineStatus = new Map<string, OnlineThemeStatus>();
    private settings: ThemeSettings;
    private catalogue: readonly ThemeMeta[] = [];
    private revision = 0;

    public constructor() {
        this.settings = MepluhNative.settings.get().themes;
    }

    public get version(): number {
        return this.revision;
    }

    public get themes(): readonly ThemeMeta[] {
        return this.catalogue;
    }

    public get links(): readonly string[] {
        return this.settings.links;
    }

    public readonly subscribe = (listener: () => void): (() => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    public isEnabled(theme: ThemeMeta): boolean {
        return this.settings.enabled.includes(theme.id);
    }

    public statusOf(link: string): OnlineThemeStatus {
        return this.onlineStatus.get(link) ?? { state: "loading" };
    }

    public async start(): Promise<void> {
        MepluhNative.themes.onChanged(() => void this.refresh());
        await this.refresh();
    }

    public async refresh(): Promise<void> {
        this.catalogue = await MepluhNative.themes.list();
        await this.applyAll();
    }

    public async setEnabled(theme: ThemeMeta, enabled: boolean): Promise<void> {
        const others = this.settings.enabled.filter(id => id !== theme.id);
        await this.save({ ...this.settings, enabled: enabled ? [...others, theme.id] : others });
    }

    public async setLinks(links: readonly string[]): Promise<void> {
        await this.save({ ...this.settings, links });
    }

    private async save(next: ThemeSettings): Promise<void> {
        await MepluhNative.themes.setSettings(next);
        this.settings = MepluhNative.settings.get().themes;
        await this.applyAll();
    }

    private async applyAll(): Promise<void> {
        const local = this.catalogue.filter(theme => this.isEnabled(theme)).map(theme => theme.id);
        const wanted = new Set([...local.map(localStyleId), ...this.settings.links.map(onlineStyleId)]);
        [...this.applied].filter(id => !wanted.has(id)).forEach(id => this.remove(id));
        this.notify();
        await Promise.all([...local.map(id => this.applyLocal(id)), ...this.settings.links.map(link => this.applyOnline(link))]);
        this.notify();
    }

    private async applyLocal(id: string): Promise<void> {
        try {
            this.apply(localStyleId(id), await MepluhNative.themes.read(id));
        } catch (error) {
            log.error(`Failed to load theme ${id}`, error);
        }
    }

    private async applyOnline(link: string): Promise<void> {
        this.onlineStatus.set(link, { state: "loading" });
        try {
            this.apply(onlineStyleId(link), await MepluhNative.themes.fetchOnline(link));
            this.onlineStatus.set(link, { state: "loaded" });
        } catch (error) {
            this.onlineStatus.set(link, { state: "failed", error: error instanceof Error ? error.message : String(error) });
        }
    }

    private apply(styleId: string, css: string): void {
        styles.set(styleId, css);
        this.applied.add(styleId);
    }

    private remove(styleId: string): void {
        styles.delete(styleId);
        this.applied.delete(styleId);
    }

    private notify(): void {
        this.revision++;
        this.listeners.forEach(listener => listener());
    }
}
