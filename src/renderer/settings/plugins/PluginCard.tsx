import type { PluginDefinition } from "@shared/plugin";
import { medalUi } from "../../medal/components";
import type { RendererPluginManager } from "../../pluginManager";
import { Card } from "../ui/Card";
import { PluginSettingsDialog } from "./PluginSettingsDialog";

interface PluginCardProps {
    readonly manager: RendererPluginManager;
    readonly plugin: PluginDefinition;
}

const SettingsButton = ({ onClick }: { readonly onClick: () => void }) => {
    const { Button, Icon, Tooltip, TooltipTrigger, TooltipContent } = medalUi().components;
    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <Button variant="ghost" size="sm" onClick={onClick}>
                        <Icon shape="settings-filled" size={16} />
                    </Button>
                }
            />
            <TooltipContent side="top">Plugin settings</TooltipContent>
        </Tooltip>
    );
};

export const PluginCard = ({ manager, plugin }: PluginCardProps) => {
    const { React, components } = medalUi();
    const { Badge, Switch } = components;
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const settings = manager.settingsOf(plugin);
    const configurable = Object.keys(plugin.options ?? {}).length > 0;

    return (
        <Card className={settings.enabled ? "" : "opacity-70"}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate text-base font-semibold text-foreground-0">{plugin.name}</span>
                    <div className="flex flex-wrap items-center gap-1">
                        <Badge variant="secondary">{plugin.category}</Badge>
                        {plugin.required === true && <Badge variant="info">Required</Badge>}
                        {plugin.patches?.length ? <Badge variant="outline">{plugin.patches.length} patches</Badge> : null}
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                    {configurable && <SettingsButton onClick={() => setDialogOpen(true)} />}
                    <Switch checked={settings.enabled} disabled={plugin.required === true} onCheckedChange={enabled => void manager.setEnabled(plugin, enabled)} />
                </div>
            </div>
            <span className="line-clamp-2 text-sm text-foreground-300">{plugin.description}</span>
            {configurable && <PluginSettingsDialog manager={manager} plugin={plugin} open={dialogOpen} onOpenChange={setDialogOpen} />}
        </Card>
    );
};
