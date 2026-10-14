import type { SettingsTabId } from "@shared/settingsTabs";
import { loadMedalUi } from "../medal/components";
import type { Component } from "../medal/types";
import type { RendererPluginManager } from "../pluginManager";
import { createTabs } from "./tabs";

export interface LazyRoute {
    readonly Component: Component<object>;
}

export type SettingsRouteLoader = (tab: SettingsTabId) => Promise<LazyRoute>;

export const createSettingsRouteLoader = (manager: RendererPluginManager): SettingsRouteLoader => {
    const tabs = createTabs(manager);
    return async tab => {
        await loadMedalUi();
        return { Component: tabs[tab] };
    };
};
