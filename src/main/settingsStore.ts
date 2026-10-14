import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { Logger } from "@shared/logger";
import type { PluginDefinition } from "@shared/plugin";
import type { PluginSettings, SettingsSnapshot } from "@shared/settings";
import { resolvePluginSettings, resolveSnapshot } from "@shared/settingsResolver";

export class SettingsStore {
    private snapshot: SettingsSnapshot;

    public constructor(
        private readonly file: string,
        private readonly plugins: readonly PluginDefinition[],
        private readonly log: Logger
    ) {
        this.snapshot = resolveSnapshot(plugins, this.read());
    }

    public get current(): SettingsSnapshot {
        return this.snapshot;
    }

    public update(name: string, settings: PluginSettings): void {
        const plugin = this.plugins.find(candidate => candidate.name === name);
        if (!plugin) throw new Error(`Unknown plugin "${name}"`);
        this.snapshot = { plugins: { ...this.snapshot.plugins, [name]: resolvePluginSettings(plugin, settings) } };
        this.persist();
    }

    private read(): Partial<SettingsSnapshot> | undefined {
        try {
            return JSON.parse(readFileSync(this.file, "utf8")) as Partial<SettingsSnapshot>;
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== "ENOENT") this.log.warn("Discarding unreadable settings", error);
            return undefined;
        }
    }

    private persist(): void {
        const temporary = `${this.file}.tmp`;
        mkdirSync(dirname(this.file), { recursive: true });
        writeFileSync(temporary, JSON.stringify(this.snapshot, null, 4));
        renameSync(temporary, this.file);
    }
}
