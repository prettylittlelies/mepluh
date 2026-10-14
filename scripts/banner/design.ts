export const CANVAS = { width: 1280, height: 360 } as const;

export const PALETTE = {
    ground: "#09090b",
    hairline: "#ffffff",
    ink: "#f4f4f5",
    muted: "#71717a",
    accent: "#cfff53"
} as const;

export const TYPE = {
    display: "Inter, 'Segoe UI Variable Display', 'Segoe UI', system-ui, sans-serif",
    mono: "'JetBrains Mono', 'Cascadia Code', Consolas, monospace"
} as const;

export const WORDMARK = {
    text: "mepluh",
    size: 196,
    weight: 800,
    tracking: -9,
    baseline: 228
} as const;

export const HAIRLINES = {
    ambient: { spacing: 5, thickness: 1, opacity: 0.16 },
    refracted: { spacing: 6, thickness: 1.5, opacity: 0.62 }
} as const;

export const META = {
    left: "A CLIENT MOD FOR MEDAL",
    right: "github.com/prettylittlelies/mepluh",
    baseline: 318,
    inset: 64,
    size: 13,
    tracking: 3
} as const;

export const ID = {
    ambientLines: "ambient-lines",
    refractedLines: "refracted-lines",
    ripple: "ripple",
    refraction: "refraction",
    glass: "glass",
    grain: "grain",
    fade: "fade",
    fadeMask: "fade-mask",
    letterforms: "letterforms"
} as const;
