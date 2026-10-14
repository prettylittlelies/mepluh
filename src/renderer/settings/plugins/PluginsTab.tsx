import { medalUi } from "../../medal/components";
import type { SettingsContext } from "../context";
import { usePluginManager } from "../hooks";
import { RestartNotice } from "../ui/RestartNotice";
import { TabPage } from "../ui/TabPage";
import { PluginCard } from "./PluginCard";
import { categoriesOf, filterPlugins, isStatusFilter, STATUS_FILTERS, type CategoryFilter, type StatusFilter } from "./pluginFilter";

const Toolbar = ({
    query,
    onQuery,
    status,
    onStatus
}: {
    readonly query: string;
    readonly onQuery: (query: string) => void;
    readonly status: StatusFilter;
    readonly onStatus: (status: StatusFilter) => void;
}) => {
    const { InputGroup, InputGroupInput, InputGroupAddon, Icon, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } = medalUi().components;
    return (
        <div className="flex w-full items-center gap-3">
            <InputGroup className="h-10 min-w-0 flex-1">
                <InputGroupAddon align="inline-start">
                    <Icon shape="search" size={16} />
                </InputGroupAddon>
                <InputGroupInput value={query} placeholder="Search plugins" onChange={event => onQuery(event.target.value)} />
            </InputGroup>
            <Select value={status} onValueChange={value => isStatusFilter(value) && onStatus(value)}>
                <SelectTrigger className="w-48" aria-label="Filter plugins">
                    <SelectValue>{STATUS_FILTERS[status]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(STATUS_FILTERS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                            {label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export const createPluginsTab = ({ plugins: manager }: SettingsContext) => () => {
    usePluginManager(manager);
    const { React, components } = medalUi();
    const { Tabs, TabsList, TabsTrigger, EmptyState, Icon } = components;
    const [query, setQuery] = React.useState("");
    const [status, setStatus] = React.useState<StatusFilter>("all");
    const [category, setCategory] = React.useState<CategoryFilter>("All");
    const categories = categoriesOf(manager.plugins);
    const visible = filterPlugins(manager.plugins, plugin => manager.settingsOf(plugin).enabled, { query, status, category });

    return (
        <TabPage icon="shapes-filled" title="Plugins" description={`${manager.plugins.length} plugins. Toggle them here; patch-based plugins apply after a restart.`}>
            <RestartNotice manager={manager} />
            <Toolbar query={query} onQuery={setQuery} status={status} onStatus={setStatus} />
            <Tabs variant="pill" value={category} onValueChange={value => setCategory(categories.find(candidate => candidate === value) ?? "All")} className="w-full">
                <TabsList>
                    {categories.map(name => (
                        <TabsTrigger key={name} value={name}>
                            {name}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
            {visible.length === 0 ? (
                <EmptyState icon={<Icon shape="search" />} header="No plugins match" subtext="Try a different search or filter." />
            ) : (
                <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2">
                    {visible.map(plugin => (
                        <PluginCard key={plugin.name} manager={manager} plugin={plugin} />
                    ))}
                </div>
            )}
        </TabPage>
    );
};
