export const GLASS_VARIANTS = [
    { value: "regular", label: "Regular (adaptive, legible)" },
    { value: "clear", label: "Clear (maximum transparency)" }
] as const;

export type GlassVariant = (typeof GLASS_VARIANTS)[number]["value"];

export interface VariantTuning {
    readonly blur: number;
    readonly saturation: number;
    readonly tint: string;
    readonly dispersion: number;
    readonly rimOpacity: number;
}

export const VARIANT_TUNING: Readonly<Record<GlassVariant, VariantTuning>> = {
    regular: { blur: 2.4, saturation: 1.7, tint: "rgb(24 24 28 / 0.38)", dispersion: 0.035, rimOpacity: 0.55 },
    clear: { blur: 0.6, saturation: 1.35, tint: "rgb(24 24 28 / 0.12)", dispersion: 0.05, rimOpacity: 0.7 }
};

export const isGlassVariant = (value: string): value is GlassVariant => GLASS_VARIANTS.some(variant => variant.value === value);
