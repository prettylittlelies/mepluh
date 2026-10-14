import { buildRefractionProfile, sampleProfile } from "./optics";

export interface SurfaceGeometry {
    readonly width: number;
    readonly height: number;
    readonly radius: number;
    readonly bezel: number;
}

interface EdgeSample {
    readonly distance: number;
    readonly normalX: number;
    readonly normalY: number;
}

const NEUTRAL = 128;
const MAP_SCALE = 0.5;
const profile = buildRefractionProfile();

const roundedRectEdge = (x: number, y: number, halfWidth: number, halfHeight: number, radius: number): EdgeSample => {
    const qx = Math.abs(x) - (halfWidth - radius);
    const qy = Math.abs(y) - (halfHeight - radius);
    const sx = Math.sign(x) || 1;
    const sy = Math.sign(y) || 1;

    if (qx > 0 && qy > 0) {
        const length = Math.hypot(qx, qy);
        return { distance: radius - length, normalX: (qx / length) * sx, normalY: (qy / length) * sy };
    }
    return qx > qy ? { distance: radius - qx, normalX: sx, normalY: 0 } : { distance: radius - qy, normalX: 0, normalY: sy };
};

const encode = (component: number): number => Math.round(NEUTRAL + component * (NEUTRAL - 1));

export const renderDisplacementMap = ({ width, height, radius, bezel }: SurfaceGeometry): string => {
    const columns = Math.max(2, Math.round(width * MAP_SCALE));
    const rows = Math.max(2, Math.round(height * MAP_SCALE));
    const canvas = document.createElement("canvas");
    canvas.width = columns;
    canvas.height = rows;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("2D canvas unavailable for displacement map");

    const image = context.createImageData(columns, rows);
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const clampedRadius = Math.min(radius, halfWidth, halfHeight);

    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            const x = ((column + 0.5) / columns) * width - halfWidth;
            const y = ((row + 0.5) / rows) * height - halfHeight;
            const edge = roundedRectEdge(x, y, halfWidth, halfHeight, clampedRadius);
            const magnitude = edge.distance >= 0 && edge.distance < bezel ? sampleProfile(profile, edge.distance / bezel) : 0;
            const offset = (row * columns + column) * 4;
            image.data[offset] = encode(-edge.normalX * magnitude);
            image.data[offset + 1] = encode(-edge.normalY * magnitude);
            image.data[offset + 2] = NEUTRAL;
            image.data[offset + 3] = 255;
        }
    }

    context.putImageData(image, 0, 0);
    return canvas.toDataURL("image/png");
};
