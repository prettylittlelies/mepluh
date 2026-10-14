import type { RendererPluginManager } from "../pluginManager";
import type { ThemeManager } from "../themeManager";

export interface SettingsContext {
    readonly plugins: RendererPluginManager;
    readonly themes: ThemeManager;
}
