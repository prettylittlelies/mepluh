import { declarations, renderHeader, type BuiltinTheme } from "./themeFile";

const header = renderHeader({
    name: "Transparency",
    description: "Frosted-glass Medal. Pair with the WindowEffects plugin (Acrylic or Mica) so the desktop shows through. Tune --glass-opacity in Custom CSS.",
    author: "Mepluh",
    version: "1.0.0",
    requires: "WindowEffects"
});

const variables = {
    "--glass-opacity": "45%",
    "--glass-tint": "oklch(18% .004 286)",
    "--color-first-layer": "transparent",
    "--color-second-layer": "color-mix(in oklab, var(--glass-tint) var(--glass-opacity), transparent)",
    "--color-third-layer": "color-mix(in oklab, var(--glass-tint) calc(var(--glass-opacity) + 15%), transparent)",
    "--color-neutral-950": "color-mix(in oklab, var(--glass-tint) calc(var(--glass-opacity) + 25%), transparent)"
};

export const transparencyTheme: BuiltinTheme = {
    fileName: "transparency.theme.css",
    css: `${header}

:root,
:host {
${declarations(variables)}
}

html,
body,
#root,
#app {
    background: transparent !important;
}

.bg-black,
.bg-first-layer {
    background-color: transparent !important;
}

[data-testid="settings-page-container"],
[role="dialog"] {
    backdrop-filter: blur(24px) saturate(140%);
}
`
};
