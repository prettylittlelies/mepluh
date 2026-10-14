import { medalUi } from "../../medal/components";
import { Card } from "./Card";

interface StatTileProps {
    readonly icon: string;
    readonly label: string;
    readonly value: string | number;
}

export const StatTile = ({ icon, label, value }: StatTileProps) => {
    const { Icon } = medalUi().components;
    return (
        <Card>
            <div className="flex items-center gap-2 text-foreground-300">
                <Icon shape={icon} size={16} />
                <span className="text-xs font-semibold">{label}</span>
            </div>
            <span className="text-2xl font-bold text-foreground-0">{value}</span>
        </Card>
    );
};
