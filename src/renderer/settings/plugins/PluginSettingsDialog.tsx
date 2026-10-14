import type { PluginDefinition } from "@shared/plugin";
import { medalUi } from "../../medal/components";
import type { RendererPluginManager } from "../../pluginManager";
import { OptionRow } from "./OptionRow";

interface PluginSettingsDialogProps {
    readonly manager: RendererPluginManager;
    readonly plugin: PluginDefinition;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
}

export const PluginSettingsDialog = ({ manager, plugin, open, onOpenChange }: PluginSettingsDialogProps) => {
    const { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button, Badge } = medalUi().components;
    const settings = manager.settingsOf(plugin);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl p-6">
                <DialogHeader>
                    <DialogTitle>{plugin.name}</DialogTitle>
                    <DialogDescription>{plugin.description}</DialogDescription>
                    <div className="flex items-center justify-center gap-2">
                        <Badge variant="secondary">{plugin.category}</Badge>
                        {!manager.isHotSwappable(plugin) && <Badge variant="warning">Restart required</Badge>}
                    </div>
                </DialogHeader>
                <div className="flex flex-col divide-y divide-stroke-0/16">
                    {Object.entries(plugin.options ?? {}).map(([key, option]) => (
                        <OptionRow
                            key={key}
                            id={`mepluh-${plugin.name}-${key}`.toLowerCase()}
                            name={key}
                            option={option}
                            value={settings.options[key] ?? option.default}
                            onChange={value => void manager.setOption(plugin, key, value)}
                        />
                    ))}
                </div>
                <DialogFooter>
                    <Button variant="primary" size="md" onClick={() => onOpenChange(false)}>
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
