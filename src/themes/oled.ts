import { declarations, renderHeader, type BuiltinTheme } from "./themeFile";

const header = renderHeader({
    name: "OLED",
    description: "True black everywhere so OLED pixels switch off. Surfaces are separated by hairline borders instead of grey fills.",
    author: "Mepluh",
    version: "1.0.0"
});

const variables = {
    "--color-first-layer": "#000000",
    "--color-second-layer": "#000000",
    "--color-third-layer": "#0a0a0a",
    "--color-neutral-950": "#000000",
    "--color-neutral-1000": "#000000",
    "--color-foreground-950": "#000000",
    "--color-foreground-1000": "#000000"
};

export const oledTheme: BuiltinTheme = {
    fileName: "oled.theme.css",
    css: `${header}

:root,
:host {
${declarations(variables)}
    color-scheme: dark;
}

html,
body,
#root {
    background-color: #000000 !important;
}

.bg-second-layer,
.bg-third-layer {
    box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.08);
}
`
};
