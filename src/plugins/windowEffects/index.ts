import { definePlugin } from "@shared/plugin";
import { LiquidGlass } from "./liquidGlass";
import { GLASS_VARIANTS, isGlassVariant } from "./liquidGlass/variants";

export const WINDOW_MATERIALS = [
    { value: "liquid-glass", label: "Liquid Glass (refractive)" },
    { value: "acrylic", label: "Acrylic (frosted blur)" },
    { value: "mica", label: "Mica (wallpaper tint)" },
    { value: "tabbed", label: "Tabbed Mica" }
] as const;

export type WindowMaterial = (typeof WINDOW_MATERIALS)[number]["value"];

export const NATIVE_BACKDROP: Readonly<Record<WindowMaterial, "acrylic" | "mica" | "tabbed">> = {
    "liquid-glass": "acrylic",
    acrylic: "acrylic",
    mica: "mica",
    tabbed: "tabbed"
};

let liquidGlass: LiquidGlass | undefined;

export default definePlugin({
    name: "WindowEffects",
    description: "Native Windows 11 backdrops plus Liquid Glass: refractive, light-reactive glass on Medal's navigation layer.",
    category: "Appearance",
    enabledByDefault: false,
    options: {
        material: {
            type: "select",
            description: "Backdrop material",
            default: "liquid-glass",
            choices: WINDOW_MATERIALS
        },
        glassVariant: {
            type: "select",
            description: "Liquid Glass variant",
            default: "regular",
            choices: GLASS_VARIANTS
        }
    },
    start({ options }) {
        if (options.material !== "liquid-glass") return;
        liquidGlass = new LiquidGlass(isGlassVariant(options.glassVariant) ? options.glassVariant : "regular");
        if (document.body) liquidGlass.mount();
        else document.addEventListener("DOMContentLoaded", () => liquidGlass?.mount(), { once: true });
    },
    stop() {
        liquidGlass?.unmount();
        liquidGlass = undefined;
    }
});
