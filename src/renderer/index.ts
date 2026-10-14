import { Logger } from "@shared/logger";
import { plugins } from "@plugins";
import { RendererPluginManager } from "./pluginManager";
import { createSettingsRouteLoader } from "./settings/route";
import { ThemeManager } from "./themeManager";

const log = new Logger("renderer");
const manager = new RendererPluginManager(plugins);
const themes = new ThemeManager();

globalThis.Mepluh = Object.freeze({
    version: MEPLUH_VERSION,
    plugin: (name: string) => manager.find(name),
    loadSettingsRoute: createSettingsRouteLoader({ plugins: manager, themes })
});

manager.startEnabled();
themes.start().catch((error: unknown) => log.error("Failed to start themes", error));
log.info(`v${MEPLUH_VERSION} ready`);
