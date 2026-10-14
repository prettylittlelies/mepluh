import type { SurfaceGeometry } from "./displacementMap";
import type { FilterRegistry, GlassFilter } from "./filterRegistry";
import { GLASS_CLASS, MATERIALIZE_MS } from "./styles";
import type { VariantTuning } from "./variants";

const MIN_SIZE = 8;

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

const measure = (element: HTMLElement): SurfaceGeometry | undefined => {
    const { width, height } = element.getBoundingClientRect();
    if (width < MIN_SIZE || height < MIN_SIZE) return undefined;
    const radius = Number.parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0;
    const shortest = Math.min(width, height);
    return { width: Math.round(width), height: Math.round(height), radius, bezel: clamp(shortest * 0.14, 6, 30) };
};

const refractionFor = ({ width, height }: SurfaceGeometry): number => clamp(Math.min(width, height) * 0.3, 12, 64);

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

export class GlassSurface {
    private filter: GlassFilter | undefined;
    private geometry: SurfaceGeometry | undefined;

    public constructor(
        public readonly element: HTMLElement,
        private readonly registry: FilterRegistry,
        private readonly tuning: VariantTuning
    ) {}

    public attach(): void {
        this.element.classList.add(GLASS_CLASS);
        if (getComputedStyle(this.element).position === "static") this.element.setAttribute("data-lg-positioned", "");
        this.rebuild(true);
    }

    public rebuild(materialize = false): void {
        const geometry = measure(this.element);
        if (!geometry || (this.geometry && geometry.width === this.geometry.width && geometry.height === this.geometry.height && geometry.radius === this.geometry.radius)) return;
        this.geometry = geometry;
        this.filter?.remove();
        this.filter = this.registry.create(geometry, refractionFor(geometry), this.tuning);
        this.element.style.setProperty("--lg-filter", `url(#${this.filter.id})`);
        if (materialize) this.materialize(this.filter);
        else this.filter.setStrength(1);
    }

    public detach(): void {
        this.filter?.remove();
        this.filter = undefined;
        this.element.classList.remove(GLASS_CLASS);
        this.element.removeAttribute("data-lg-positioned");
        this.element.removeAttribute("data-lg-materializing");
        this.element.style.removeProperty("--lg-filter");
        this.element.style.removeProperty("--lg-light-x");
        this.element.style.removeProperty("--lg-light-y");
    }

    private materialize(filter: GlassFilter): void {
        this.element.setAttribute("data-lg-materializing", "");
        const start = performance.now();
        const step = (now: number): void => {
            if (this.filter !== filter) return;
            const progress = Math.min((now - start) / MATERIALIZE_MS, 1);
            filter.setStrength(easeOutCubic(progress));
            if (progress < 1) requestAnimationFrame(step);
            else this.element.removeAttribute("data-lg-materializing");
        };
        requestAnimationFrame(step);
    }
}
