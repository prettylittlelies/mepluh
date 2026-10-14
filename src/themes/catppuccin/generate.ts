import { declarations, renderHeader, type BuiltinTheme } from "../themeFile";
import { FLAVORS, type Flavor, type PaletteKey } from "./palettes";

const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const TINT_RATIOS: Readonly<Record<(typeof SCALE_STEPS)[number], number>> = {
    50: 14,
    100: 28,
    200: 46,
    300: 64,
    400: 84,
    500: 100,
    600: 84,
    700: 68,
    800: 54,
    900: 42,
    950: 26
};

const SCALES = {
    "brand-primary": "var(--ctp-accent)",
    "brand-secondary": "var(--ctp-red)",
    "brand-tertiary": "var(--ctp-blue)",
    "brand-quaternary": "var(--ctp-lavender)",
    danger: "var(--ctp-red)",
    success: "var(--ctp-green)",
    warning: "var(--ctp-yellow)"
} as const;

const NEUTRALS: Readonly<Record<string, PaletteKey>> = {
    "neutral-0": "text",
    "neutral-100": "subtext1",
    "neutral-200": "subtext0",
    "neutral-300": "overlay2",
    "neutral-500": "overlay1",
    "neutral-700": "overlay0",
    "neutral-800": "surface2",
    "neutral-900": "surface1",
    "neutral-950": "mantle",
    "neutral-1000": "crust",
    "foreground-0": "text",
    "foreground-300": "subtext0",
    "foreground-500": "overlay1",
    "foreground-700": "overlay0",
    "foreground-950": "base",
    "foreground-1000": "crust",
    "stroke-0": "text",
    "stroke-500": "overlay0"
};

const layers = ({ dark }: Flavor): Readonly<Record<string, PaletteKey>> =>
    dark ? { "first-layer": "crust", "second-layer": "base", "third-layer": "surface0" } : { "first-layer": "crust", "second-layer": "base", "third-layer": "mantle" };

const paletteVariables = ({ palette }: Flavor): Record<string, string> =>
    Object.fromEntries(Object.entries(palette).map(([key, hex]) => [`--ctp-${key}`, hex]));

const scaleVariables = ({ dark }: Flavor): Record<string, string> => {
    const light = "#ffffff";
    const shade = dark ? "var(--ctp-crust)" : "var(--ctp-text)";
    return Object.fromEntries(
        Object.entries(SCALES).flatMap(([scale, color]) =>
            SCALE_STEPS.map(step => {
                const ratio = TINT_RATIOS[step];
                const target = step < 500 ? light : shade;
                return [`--color-${scale}-${step}`, ratio === 100 ? color : `color-mix(in oklab, ${color} ${ratio}%, ${target})`];
            })
        )
    );
};

const aliasVariables = (aliases: Readonly<Record<string, PaletteKey>>): Record<string, string> =>
    Object.fromEntries(Object.entries(aliases).map(([token, key]) => [`--color-${token}`, `var(--ctp-${key})`]));

const renderFlavor = (flavor: Flavor): BuiltinTheme => {
    const header = renderHeader({
        name: `Catppuccin ${flavor.name}`,
        description: `Soothing pastel ${flavor.dark ? "dark" : "light"} theme for Medal. Override --ctp-accent in Custom CSS to pick any Catppuccin accent.`,
        author: "Catppuccin, ported by Mepluh",
        version: "1.0.0",
        website: "https://github.com/catppuccin/discord"
    });
    const variables = {
        ...paletteVariables(flavor),
        "--ctp-accent": "var(--ctp-mauve)",
        ...aliasVariables(layers(flavor)),
        ...aliasVariables(NEUTRALS),
        ...scaleVariables(flavor)
    };
    const css = `${header}

:root,
:host {
${declarations(variables)}
    color-scheme: ${flavor.dark ? "dark" : "light"};
}

::selection {
    background-color: color-mix(in oklab, var(--ctp-accent) 35%, transparent);
}
`;
    return { fileName: `catppuccin-${flavor.id}.theme.css`, css };
};

export const catppuccinThemes: readonly BuiltinTheme[] = FLAVORS.map(renderFlavor);
