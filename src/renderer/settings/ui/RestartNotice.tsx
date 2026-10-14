import { medalUi } from "../../medal/components";
import type { RendererPluginManager } from "../../pluginManager";
import { Card } from "./Card";

export const RestartNotice = ({ manager }: { readonly manager: RendererPluginManager }) => {
    const { Button, Icon } = medalUi().components;
    if (!manager.needsRestart) return null;
    return (
        <Card tone="brand" className="w-full">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Icon shape="warning" size={20} className="text-brand-primary-400" />
                    <span className="text-sm text-foreground-0">Some changes take effect after Medal restarts.</span>
                </div>
                <Button variant="brand" size="md" onClick={() => void MepluhNative.relaunch()}>
                    Restart Medal
                </Button>
            </div>
        </Card>
    );
};
