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

const DIALOG_WIDTH = 600;
const ROW_STACK = "flex flex-col divide-y divide-stroke-0/16 rounded-lg bg-third-layer px-5 py-4 [&>*]:py-4 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0";

export const PluginSettingsDialog = ({ manager, plugin, open, onOpenChange }: PluginSettingsDialogProps) => {
    const { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, Button, Badge } = medalUi().components;
    const settings = manager.settingsOf(plugin);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent style={{ maxWidth: DIALOG_WIDTH }}>
                <div className="flex flex-col gap-2 pe-8">
                    <div className="flex items-center gap-2">
                        <DialogTitle className="m-0 text-xl">{plugin.name}</DialogTitle>
                        <Badge variant="secondary">{plugin.category}</Badge>
                        {!manager.isHotSwappable(plugin) && <Badge variant="warning">Restart required</Badge>}
                    </div>
                    <DialogDescription>{plugin.description}</DialogDescription>
                </div>
                <div className={ROW_STACK}>
                    {Object.entries(plugin.options ?? {}).map(([key, option]) => (
                        <OptionRow
                            key={key}
                            id={`mepluh-${plugin.name}-${key}`.toLowerCase()}
                            option={option}
                            value={settings.options[key] ?? option.default}
                            onChange={value => void manager.setOption(plugin, key, value)}
                        />
                    ))}
                </div>
                <DialogFooter>
                    <Button variant="brand" size="md" onClick={() => onOpenChange(false)}>
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
