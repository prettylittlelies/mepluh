import { renderDisplacementMap, type SurfaceGeometry } from "./displacementMap";
import type { VariantTuning } from "./variants";

const SVG_NS = "http://www.w3.org/2000/svg";
const CHANNELS = [
    { name: "r", matrix: "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" },
    { name: "g", matrix: "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" },
    { name: "b", matrix: "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" }
] as const;

export interface GlassFilter {
    readonly id: string;
    setStrength(fraction: number): void;
    remove(): void;
}

const node = <K extends keyof SVGElementTagNameMap>(tag: K, attributes: Readonly<Record<string, string | number>>, ...children: readonly SVGElement[]): SVGElementTagNameMap[K] => {
    const element = document.createElementNS(SVG_NS, tag);
    Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, String(value)));
    element.append(...children);
    return element;
};

export class FilterRegistry {
    private readonly defs = node("defs", {});
    private readonly root = node("svg", { width: 0, height: 0, "aria-hidden": "true", style: "position:absolute;width:0;height:0;pointer-events:none" }, this.defs);
    private counter = 0;

    public mount(): void {
        document.body.append(this.root);
    }

    public unmount(): void {
        this.root.remove();
    }

    public create(geometry: SurfaceGeometry, refraction: number, tuning: VariantTuning): GlassFilter {
        const id = `mepluh-liquid-glass-${++this.counter}`;
        const { width, height } = geometry;
        const scales = CHANNELS.map((_, index) => refraction * (1 - tuning.dispersion * index));
        const displacements = CHANNELS.map(({ name, matrix }, index) => [
            node("feDisplacementMap", { in: "blurred", in2: "map", scale: 0, xChannelSelector: "R", yChannelSelector: "G", result: `shift-${name}`, "data-scale": scales[index] ?? 0 }),
            node("feColorMatrix", { in: `shift-${name}`, type: "matrix", values: matrix, result: `channel-${name}` })
        ]);

        const filter = node(
            "filter",
            { id, x: 0, y: 0, width, height, filterUnits: "userSpaceOnUse", primitiveUnits: "userSpaceOnUse", "color-interpolation-filters": "sRGB" },
            node("feGaussianBlur", { in: "SourceGraphic", stdDeviation: tuning.blur, result: "blurred" }),
            node("feImage", { href: renderDisplacementMap(geometry), x: 0, y: 0, width, height, preserveAspectRatio: "none", result: "map" }),
            ...displacements.flat(),
            node("feBlend", { in: "channel-r", in2: "channel-g", mode: "screen", result: "rg" }),
            node("feBlend", { in: "rg", in2: "channel-b", mode: "screen", result: "rgb" }),
            node("feColorMatrix", { in: "rgb", type: "saturate", values: tuning.saturation })
        );
        this.defs.append(filter);

        const maps = [...filter.querySelectorAll("feDisplacementMap")];
        return {
            id,
            setStrength: fraction => maps.forEach(map => map.setAttribute("scale", String(Number(map.dataset["scale"] ?? 0) * fraction))),
            remove: () => filter.remove()
        };
    }
}
