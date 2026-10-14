import { ID } from "./design";
import { el, type SvgNode } from "./svg";

const FULL_REGION = { x: "-10%", y: "-10%", width: "120%", height: "120%" } as const;

const displacementFilter = (id: string, frequency: string, octaves: number, seed: number, scale: number): SvgNode =>
    el(
        "filter",
        { id, ...FULL_REGION, "color-interpolation-filters": "sRGB" },
        el("feTurbulence", { type: "turbulence", baseFrequency: frequency, numOctaves: octaves, seed, result: "flow" }),
        el("feDisplacementMap", { in: "SourceGraphic", in2: "flow", scale, xChannelSelector: "R", yChannelSelector: "G" })
    );

const glassFilter = (): SvgNode =>
    el(
        "filter",
        { id: ID.glass, ...FULL_REGION, "color-interpolation-filters": "sRGB" },
        el("feGaussianBlur", { in: "SourceAlpha", stdDeviation: 4, result: "height" }),
        el(
            "feSpecularLighting",
            { in: "height", surfaceScale: 7, specularConstant: 1.7, specularExponent: 22, "lighting-color": "#ffffff", result: "specular" },
            el("fePointLight", { x: 380, y: -160, z: 300 })
        ),
        el("feComposite", { in: "specular", in2: "SourceAlpha", operator: "in", result: "highlight" }),
        el("feMorphology", { in: "SourceAlpha", operator: "erode", radius: 1.4, result: "core" }),
        el("feComposite", { in: "SourceAlpha", in2: "core", operator: "out", result: "rim" }),
        el("feColorMatrix", { in: "rim", type: "matrix", values: "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.7 0", result: "rimLight" }),
        el("feMerge", {}, el("feMergeNode", { in: "SourceGraphic" }), el("feMergeNode", { in: "highlight" }), el("feMergeNode", { in: "rimLight" }))
    );

const grainFilter = (): SvgNode =>
    el(
        "filter",
        { id: ID.grain, x: 0, y: 0, width: "100%", height: "100%" },
        el("feTurbulence", { type: "fractalNoise", baseFrequency: 0.85, numOctaves: 3, stitchTiles: "stitch", seed: 3, result: "noise" }),
        el("feColorMatrix", { in: "noise", type: "matrix", values: "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.07 0" })
    );

export const filters = (): readonly SvgNode[] => [
    displacementFilter(ID.ripple, "0.0016 0.008", 1, 11, 30),
    displacementFilter(ID.refraction, "0.0032 0.0085", 1, 29, 30),
    glassFilter(),
    grainFilter()
];
