export interface ThemeHeader {
    readonly name: string;
    readonly description: string;
    readonly author: string;
    readonly version: string;
    readonly website?: string;
    readonly requires?: string;
}

export interface BuiltinTheme {
    readonly fileName: string;
    readonly css: string;
}

export const renderHeader = (header: ThemeHeader): string =>
    ["/**", ...Object.entries(header).map(([key, value]) => ` * @${key} ${String(value)}`), " */"].join("\n");

export const declarations = (variables: Readonly<Record<string, string>>): string =>
    Object.entries(variables)
        .map(([name, value]) => `    ${name}: ${value};`)
        .join("\n");
