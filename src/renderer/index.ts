import { Logger } from "@shared/logger";
import { plugins } from "@plugins";
import { RendererPluginManager } from "./pluginManager";
import { createSettingsRouteLoader } from "./settings/route";

const manager = new RendererPluginManager(plugins);

globalThis.Mepluh = Object.freeze({
    version: MEPLUH_VERSION,
    plugin: (name: string) => manager.find(name),
    loadSettingsRoute: createSettingsRouteLoader(manager)
});

manager.startEnabled();
new Logger("renderer").info(`v${MEPLUH_VERSION} ready`);
