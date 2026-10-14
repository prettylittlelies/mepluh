import { CANVAS, HAIRLINES, ID, META, PALETTE, TYPE, WORDMARK } from "./design";
import { el, ref, type SvgNode } from "./svg";

const canvasRect = (attributes: Readonly<Record<string, string | number>>): SvgNode => el("rect", { width: CANVAS.width, height: CANVAS.height, ...attributes });

const wordmark = (attributes: Readonly<Record<string, string | number>>): SvgNode =>
    el(
        "text",
        {
            x: CANVAS.width / 2,
            y: WORDMARK.baseline,
            "text-anchor": "middle",
            "font-family": TYPE.display,
            "font-size": WORDMARK.size,
            "font-weight": WORDMARK.weight,
            "letter-spacing": WORDMARK.tracking,
            ...attributes
        },
        WORDMARK.text
    );

const metaText = (text: string, x: number, anchor: "start" | "end"): SvgNode =>
    el(
        "text",
        { x, y: META.baseline, "text-anchor": anchor, "font-family": TYPE.mono, "font-size": META.size, "letter-spacing": META.tracking, fill: PALETTE.muted },
        text
    );

const hairlinePattern = (id: string, { spacing, thickness, opacity }: (typeof HAIRLINES)[keyof typeof HAIRLINES]): SvgNode =>
    el(
        "pattern",
        { id, width: CANVAS.width, height: spacing, patternUnits: "userSpaceOnUse" },
        el("rect", { width: CANVAS.width, height: thickness, fill: PALETTE.hairline, "fill-opacity": opacity })
    );

export const definitions = (): readonly SvgNode[] => [
    hairlinePattern(ID.ambientLines, HAIRLINES.ambient),
    hairlinePattern(ID.refractedLines, HAIRLINES.refracted),
    el(
        "linearGradient",
        { id: ID.fade, x1: 0, y1: 0, x2: 1, y2: 0 },
        el("stop", { offset: 0, "stop-color": "#000" }),
        el("stop", { offset: 0.18, "stop-color": "#fff" }),
        el("stop", { offset: 0.82, "stop-color": "#fff" }),
        el("stop", { offset: 1, "stop-color": "#000" })
    ),
    el("mask", { id: ID.fadeMask }, canvasRect({ fill: ref(ID.fade) })),
    el("clipPath", { id: ID.letterforms }, wordmark({}))
];

export const layers = (): readonly SvgNode[] => [
    canvasRect({ fill: PALETTE.ground }),
    el("g", { mask: ref(ID.fadeMask) }, canvasRect({ fill: ref(ID.ambientLines), filter: ref(ID.ripple) })),
    el(
        "g",
        { "clip-path": ref(ID.letterforms) },
        canvasRect({ fill: PALETTE.ground }),
        canvasRect({ fill: ref(ID.refractedLines), filter: ref(ID.refraction) })
    ),
    wordmark({ fill: PALETTE.ink, "fill-opacity": 0.06, filter: ref(ID.glass) }),
    el("rect", { x: META.inset, y: META.baseline - META.size + 3, width: 18, height: 2, fill: PALETTE.accent }),
    metaText(META.left, META.inset + 30, "start"),
    metaText(META.right, CANVAS.width - META.inset, "end"),
    canvasRect({ filter: ref(ID.grain), "pointer-events": "none" })
];
