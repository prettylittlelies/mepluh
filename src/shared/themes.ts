export type ThemeSource = "builtin" | "local";

export interface ThemeMeta {
    readonly id: string;
    readonly fileName: string;
    readonly source: ThemeSource;
    readonly name: string;
    readonly description: string;
    readonly author: string;
    readonly version?: string;
    readonly website?: string;
    readonly requires?: string;
}

export interface ThemeSettings {
    readonly enabled: readonly string[];
    readonly links: readonly string[];
}

export const DEFAULT_THEME_SETTINGS: ThemeSettings = { enabled: [], links: [] };

export const THEME_EXTENSION = ".css";

const HEADER = /^\s*\/\*\*([\s\S]*?)\*\//;
const TAG = /^\s*\*?\s*@(\w+)\s+(.+?)\s*$/;

export const themeId = (source: ThemeSource, fileName: string): string => `${source}:${fileName}`;

const parseTags = (css: string): ReadonlyMap<string, string> => {
    const header = HEADER.exec(css)?.[1] ?? "";
    return new Map(
        header
            .split(/\r?\n/)
            .map(line => TAG.exec(line))
            .filter((match): match is RegExpExecArray => match !== null)
            .map(([, key = "", value = ""]) => [key.toLowerCase(), value])
    );
};

const optional = <K extends string>(key: K, value: string | undefined): { readonly [P in K]?: string } =>
    (value === undefined ? {} : { [key]: value }) as { readonly [P in K]?: string };

export const parseThemeMeta = (source: ThemeSource, fileName: string, css: string): ThemeMeta => {
    const tags = parseTags(css);
    return {
        id: themeId(source, fileName),
        fileName,
        source,
        name: tags.get("name") ?? fileName.replace(/(\.theme)?\.css$/i, ""),
        description: tags.get("description") ?? "",
        author: tags.get("author") ?? "Unknown",
        ...optional("version", tags.get("version")),
        ...optional("website", tags.get("website")),
        ...optional("requires", tags.get("requires"))
    };
};
