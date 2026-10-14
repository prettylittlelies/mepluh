import type { SettingsTabId } from "@shared/settingsTabs";
import type { Component } from "../medal/types";
import type { RendererPluginManager } from "../pluginManager";
import { createCustomCssTab } from "./css/CustomCssTab";
import { createOverviewTab } from "./overview/OverviewTab";
import { createPatchReportTab } from "./patches/PatchReportTab";
import { createPluginsTab } from "./plugins/PluginsTab";

type TabFactory = (manager: RendererPluginManager) => Component<object>;

const factories: Readonly<Record<SettingsTabId, TabFactory>> = {
    overview: createOverviewTab,
    plugins: createPluginsTab,
    css: createCustomCssTab,
    patches: createPatchReportTab
};

export const createTabs = (manager: RendererPluginManager): Readonly<Record<SettingsTabId, Component<object>>> =>
    Object.fromEntries(Object.entries(factories).map(([id, factory]) => [id, factory(manager)])) as Record<SettingsTabId, Component<object>>;
