import type { PluginDefinition } from "@shared/plugin";
import type { SettingsRouteLoader } from "./settings/route";

export interface MepluhApi {
    readonly version: string;
    plugin(name: string): PluginDefinition | undefined;
    readonly loadSettingsRoute: SettingsRouteLoader;
}
