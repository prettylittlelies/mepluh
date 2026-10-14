export const SETTINGS_TABS = [
    { id: "overview", label: "Mepluh", route: "mepluh" },
    { id: "plugins", label: "Plugins", route: "mepluh-plugins" },
    { id: "themes", label: "Themes", route: "mepluh-themes" },
    { id: "css", label: "Custom CSS", route: "mepluh-css" },
    { id: "patches", label: "Patch Report", route: "mepluh-patches" }
] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number];
export type SettingsTabId = SettingsTab["id"];

export const settingsPath = (id: SettingsTabId): string => `/settings/${SETTINGS_TABS.find(tab => tab.id === id)?.route ?? ""}`;
