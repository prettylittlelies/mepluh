import { styles } from "@renderer/styleRegistry";
import { FilterRegistry } from "./filterRegistry";
import { GlassSurface } from "./glassSurface";
import { SpecularLight } from "./specularLight";
import { glassStyles } from "./styles";
import { GLASS_SELECTOR } from "./targets";
import { VARIANT_TUNING, type GlassVariant } from "./variants";

const STYLE_ID = "plugin:WindowEffects:liquid-glass";

export class LiquidGlass {
    private readonly registry = new FilterRegistry();
    private readonly surfaces = new Map<HTMLElement, GlassSurface>();
    private readonly light = new SpecularLight(() => this.surfaces.keys());
    private readonly resizes = new ResizeObserver(entries => entries.forEach(({ target }) => this.surfaces.get(target as HTMLElement)?.rebuild()));
    private readonly mutations = new MutationObserver(() => this.scheduleScan());
    private scanFrame = 0;

    public constructor(private readonly variant: GlassVariant) {}

    public mount(): void {
        styles.set(STYLE_ID, glassStyles(VARIANT_TUNING[this.variant]));
        this.registry.mount();
        this.light.start();
        this.mutations.observe(document.body, { childList: true, subtree: true });
        this.scan();
    }

    public unmount(): void {
        this.mutations.disconnect();
        this.resizes.disconnect();
        cancelAnimationFrame(this.scanFrame);
        this.light.stop();
        this.surfaces.forEach(surface => surface.detach());
        this.surfaces.clear();
        this.registry.unmount();
        styles.delete(STYLE_ID);
    }

    private scheduleScan(): void {
        if (this.scanFrame) return;
        this.scanFrame = requestAnimationFrame(() => {
            this.scanFrame = 0;
            this.scan();
        });
    }

    private scan(): void {
        const current = new Set(document.querySelectorAll<HTMLElement>(GLASS_SELECTOR));
        this.surfaces.forEach((surface, element) => {
            if (current.has(element) && element.isConnected) return;
            surface.detach();
            this.resizes.unobserve(element);
            this.surfaces.delete(element);
        });
        current.forEach(element => {
            if (this.surfaces.has(element)) return;
            const surface = new GlassSurface(element, this.registry, VARIANT_TUNING[this.variant]);
            this.surfaces.set(element, surface);
            surface.attach();
            this.light.illuminate(element);
            this.resizes.observe(element);
        });
    }
}
