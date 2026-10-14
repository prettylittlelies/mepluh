export class SpecularLight {
    private frame = 0;
    private pointer: { readonly x: number; readonly y: number } | undefined;

    public constructor(private readonly surfaces: () => Iterable<HTMLElement>) {}

    public start(): void {
        window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    }

    public stop(): void {
        window.removeEventListener("pointermove", this.onPointerMove);
        cancelAnimationFrame(this.frame);
    }

    public illuminate(element: HTMLElement): void {
        if (!this.pointer) return;
        const bounds = element.getBoundingClientRect();
        if (bounds.width === 0 || bounds.height === 0) return;
        element.style.setProperty("--lg-light-x", `${((this.pointer.x - bounds.left) / bounds.width) * 100}%`);
        element.style.setProperty("--lg-light-y", `${((this.pointer.y - bounds.top) / bounds.height) * 100}%`);
    }

    private readonly onPointerMove = (event: PointerEvent): void => {
        this.pointer = { x: event.clientX, y: event.clientY };
        if (this.frame) return;
        this.frame = requestAnimationFrame(() => {
            this.frame = 0;
            for (const surface of this.surfaces()) this.illuminate(surface);
        });
    };
}
