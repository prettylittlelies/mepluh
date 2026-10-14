import type { PatchHooks } from "./native";

declare global {
    var MepluhMain: { plugin(name: string): PatchHooks | undefined } | undefined;
}
