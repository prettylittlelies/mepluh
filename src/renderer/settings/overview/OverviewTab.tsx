import { MOD_NAME } from "@shared/constants";
import type { PluginDefinition } from "@shared/plugin";
import { settingsPath } from "@shared/settingsTabs";
import { medalUi } from "../../medal/components";
import type { RendererPluginManager } from "../../pluginManager";
import { runAction, useAsync, usePluginManager } from "../hooks";
import { Card } from "../ui/Card";
import { QuickAction } from "../ui/QuickAction";
import { RestartNotice } from "../ui/RestartNotice";
import { StatTile } from "../ui/StatTile";
import { TabPage } from "../ui/TabPage";

const Hero = ({ enabled, total }: { readonly enabled: number; readonly total: number }) => {
    const { Badge, Icon } = medalUi().components;
    return (
        <Card tone="brand" className="w-full">
            <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-foreground-0">{MOD_NAME}</span>
                        <Badge variant="brand">v{MEPLUH_VERSION}</Badge>
                        <Badge variant="success">Active</Badge>
                    </div>
                    <span className="text-sm text-foreground-300">
                        A client mod for Medal. {enabled} of {total} plugins are running, ads and telemetry are handled before Medal ever sees them.
                    </span>
                </div>
                <Icon shape="stars" size={48} className="text-brand-primary-400" />
            </div>
        </Card>
    );
};

const QuickToggle = ({ manager, plugin }: { readonly manager: RendererPluginManager; readonly plugin: PluginDefinition }) => {
    const { Row, Label, Description, Handler, Switch } = medalUi().components;
    return (
        <Row
            title={<Label>{plugin.name}</Label>}
            description={<Description>{plugin.description}</Description>}
            handler={
                <Handler>
                    {labelId => (
                        <Switch
                            aria-labelledby={labelId}
                            checked={manager.settingsOf(plugin).enabled}
                            onCheckedChange={enabled => void manager.setEnabled(plugin, enabled)}
                        />
                    )}
                </Handler>
            }
        />
    );
};

export const createOverviewTab = (manager: RendererPluginManager) => () => {
    usePluginManager(manager);
    const { Section, SectionTitle } = medalUi().components;
    const [report] = useAsync(() => MepluhNative.patchReport(), []);
    const enabled = manager.plugins.filter(plugin => manager.settingsOf(plugin).enabled);
    const failures = report.status === "ready" ? report.value.entries.filter(entry => entry.status === "failed").length : "…";
    const applied = report.status === "ready" ? report.value.entries.filter(entry => entry.status === "applied").length : "…";

    return (
        <TabPage icon="settings-filled" title={MOD_NAME} description="Overview, quick actions and the toggles you reach for most.">
            <Hero enabled={enabled.length} total={manager.plugins.length} />
            <RestartNotice manager={manager} />
            <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-3">
                <StatTile icon="shapes-filled" label="Plugins enabled" value={`${enabled.length}/${manager.plugins.length}`} />
                <StatTile icon="check-circle-filled" label="Patches applied" value={applied} />
                <StatTile icon="warning-filled" label="Patches failed" value={failures} />
            </div>
            <Section header={<SectionTitle>Quick Actions</SectionTitle>}>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    <QuickAction icon="refresh" label="Relaunch Medal" onClick={() => void MepluhNative.relaunch()} />
                    <QuickAction icon="code" label="Edit Custom CSS" to={settingsPath("css")} />
                    <QuickAction icon="external-link" label="Open custom.css" onClick={() => void runAction(() => MepluhNative.openPath("customCss"), "Opened custom.css")} />
                    <QuickAction icon="library-filled" label="Open Data Folder" onClick={() => void runAction(() => MepluhNative.openPath("data"), "Opened data folder")} />
                    <QuickAction icon="shapes" label="Manage Plugins" to={settingsPath("plugins")} />
                    <QuickAction icon="stats" label="Patch Report" to={settingsPath("patches")} />
                </div>
            </Section>
            <Section header={<SectionTitle>Privacy</SectionTitle>}>
                {manager.plugins
                    .filter(plugin => plugin.category === "Privacy")
                    .map(plugin => (
                        <QuickToggle key={plugin.name} manager={manager} plugin={plugin} />
                    ))}
            </Section>
        </TabPage>
    );
};
