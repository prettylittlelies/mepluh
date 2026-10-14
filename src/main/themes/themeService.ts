import { net } from "electron";
import { existsSync, mkdirSync, watch } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import type { Logger } from "@shared/logger";
import { parseThemeMeta, THEME_EXTENSION, themeId, type ThemeMeta, type ThemeSource } from "@shared/themes";

export interface ThemeDirectories {
    readonly builtin: string;
    readonly local: string;
}

const WATCH_DEBOUNCE_MS = 150;
const ONLINE_PROTOCOLS: ReadonlySet<string> = new Set(["https:"]);

const isThemeFile = (fileName: string): boolean => fileName.toLowerCase().endsWith(THEME_EXTENSION) && basename(fileName) === fileName;

export class ThemeService {
    private readonly online = new Map<string, Promise<string>>();

    public constructor(
        private readonly directories: ThemeDirectories,
        private readonly log: Logger
    ) {}

    public async list(): Promise<readonly ThemeMeta[]> {
        const groups = await Promise.all((Object.keys(this.directories) as ThemeSource[]).map(source => this.listSource(source)));
        return groups.flat();
    }

    public async read(id: string): Promise<string> {
        const [source, fileName = ""] = id.split(/:(.*)/s) as [ThemeSource, string?];
        if (!(source in this.directories) || !isThemeFile(fileName)) throw new Error(`Invalid theme id "${id}"`);
        return readFile(join(this.directories[source], fileName), "utf8");
    }

    public fetchOnline(link: string): Promise<string> {
        const url = new URL(link);
        if (!ONLINE_PROTOCOLS.has(url.protocol)) throw new Error(`Online themes must use https (${link})`);
        const cached = this.online.get(url.href);
        if (cached) return cached;
        const pending = net.fetch(url.href, { bypassCustomProtocolHandlers: true }).then(async response => {
            if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
            return response.text();
        });
        this.online.set(url.href, pending);
        pending.catch(() => this.online.delete(url.href));
        return pending;
    }

    public watch(onChange: () => void): void {
        mkdirSync(this.directories.local, { recursive: true });
        let timer: NodeJS.Timeout | undefined;
        watch(this.directories.local, (_event, file) => {
            if (file && !isThemeFile(file)) return;
            clearTimeout(timer);
            timer = setTimeout(onChange, WATCH_DEBOUNCE_MS);
        });
    }

    private async listSource(source: ThemeSource): Promise<readonly ThemeMeta[]> {
        const directory = this.directories[source];
        if (!existsSync(directory)) return [];
        const files = (await readdir(directory)).filter(isThemeFile).sort((a, b) => a.localeCompare(b));
        const metas = await Promise.all(
            files.map(async fileName => {
                try {
                    return parseThemeMeta(source, fileName, await readFile(join(directory, fileName), "utf8"));
                } catch (error) {
                    this.log.warn(`Skipping unreadable theme ${themeId(source, fileName)}`, error);
                    return undefined;
                }
            })
        );
        return metas.filter((meta): meta is ThemeMeta => meta !== undefined);
    }
}
