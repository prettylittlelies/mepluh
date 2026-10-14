import type { PluginCategory, PluginDefinition } from "@shared/plugin";

export const STATUS_FILTERS = {
    all: "All plugins",
    enabled: "Enabled",
    disabled: "Disabled",
    configurable: "Has settings"
} as const;

export type StatusFilter = keyof typeof STATUS_FILTERS;
export type CategoryFilter = PluginCategory | "All";

export interface PluginFilter {
    readonly query: string;
    readonly status: StatusFilter;
    readonly category: CategoryFilter;
}

export const isStatusFilter = (value: string): value is StatusFilter => value in STATUS_FILTERS;

const matchesStatus = (plugin: PluginDefinition, enabled: boolean, status: StatusFilter): boolean => {
    switch (status) {
        case "all":
            return true;
        case "enabled":
            return enabled;
        case "disabled":
            return !enabled;
        case "configurable":
            return Object.keys(plugin.options ?? {}).length > 0;
    }
};

const matchesQuery = (plugin: PluginDefinition, query: string): boolean => {
    const needle = query.trim().toLowerCase();
    return needle === "" || `${plugin.name} ${plugin.description} ${plugin.category}`.toLowerCase().includes(needle);
};

export const filterPlugins = (
    plugins: readonly PluginDefinition[],
    isEnabled: (plugin: PluginDefinition) => boolean,
    { query, status, category }: PluginFilter
): readonly PluginDefinition[] =>
    plugins.filter(
        plugin => (category === "All" || plugin.category === category) && matchesStatus(plugin, isEnabled(plugin), status) && matchesQuery(plugin, query)
    );

export const categoriesOf = (plugins: readonly PluginDefinition[]): readonly CategoryFilter[] => ["All", ...new Set(plugins.map(plugin => plugin.category))];
