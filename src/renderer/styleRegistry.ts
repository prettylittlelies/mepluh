import { whenDomReady } from "./domReady";

export class StyleRegistry {
    private readonly elements = new Map<string, HTMLStyleElement>();

    public set(id: string, css: string): void {
        const existing = this.elements.get(id);
        if (existing) {
            existing.textContent = css;
            return;
        }
        const element = document.createElement("style");
        element.dataset["mepluh"] = id;
        element.textContent = css;
        this.elements.set(id, element);
        void whenDomReady().then(() => {
            if (this.elements.get(id) === element) document.head.append(element);
        });
    }

    public delete(id: string): void {
        this.elements.get(id)?.remove();
        this.elements.delete(id);
    }
}

export const styles = new StyleRegistry();
