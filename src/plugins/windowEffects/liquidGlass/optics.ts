export interface GlassOptics {
    readonly refractiveIndex: number;
    readonly bezelThickness: number;
}

export const GLASS_OPTICS: GlassOptics = { refractiveIndex: 1.5, bezelThickness: 1 };

const SAMPLES = 128;
const EPSILON = 1e-3;

export const surfaceHeight = (t: number): number => Math.pow(1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 4), 1 / 4);

const surfaceSlope = (t: number): number => (surfaceHeight(t + EPSILON) - surfaceHeight(t - EPSILON)) / (2 * EPSILON);

const lateralShift = (t: number, { refractiveIndex, bezelThickness }: GlassOptics): number => {
    const incidence = Math.atan(surfaceSlope(t) * bezelThickness);
    const refraction = Math.asin(Math.sin(incidence) / refractiveIndex);
    return surfaceHeight(t) * Math.tan(incidence - refraction);
};

export const buildRefractionProfile = (optics: GlassOptics = GLASS_OPTICS): Float32Array => {
    const raw = Float32Array.from({ length: SAMPLES + 1 }, (_, index) => lateralShift(index / SAMPLES, optics));
    const peak = raw.reduce((max, value) => Math.max(max, Math.abs(value)), 0) || 1;
    return raw.map(value => value / peak);
};

export const sampleProfile = (profile: Float32Array, t: number): number => {
    const position = Math.min(Math.max(t, 0), 1) * (profile.length - 1);
    const index = Math.floor(position);
    const next = Math.min(index + 1, profile.length - 1);
    const weight = position - index;
    return (profile[index] ?? 0) * (1 - weight) + (profile[next] ?? 0) * weight;
};
