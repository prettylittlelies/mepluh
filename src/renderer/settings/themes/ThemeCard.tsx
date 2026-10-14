import type { ThemeMeta } from "@shared/themes";
import { medalUi } from "../../medal/components";
import { Card } from "../ui/Card";

interface ThemeCardProps {
    readonly theme: ThemeMeta;
    readonly enabled: boolean;
    readonly onChange: (enabled: boolean) => void;
}

export const ThemeCard = ({ theme, enabled, onChange }: ThemeCardProps) => {
    const { Badge, Switch, Link } = medalUi().components;
    return (
        <Card className={enabled ? "border-brand-primary-400" : ""}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate text-base font-semibold text-foreground-0">{theme.name}</span>
                    <span className="truncate text-xs text-foreground-500">by {theme.author}</span>
                </div>
                <Switch checked={enabled} onCheckedChange={onChange} />
            </div>
            <div className="flex flex-wrap items-center gap-1">
                <Badge variant={theme.source === "builtin" ? "brand" : "secondary"}>{theme.source === "builtin" ? "Built-in" : "Local"}</Badge>
                {theme.version && <Badge variant="outline">v{theme.version}</Badge>}
                {theme.requires && <Badge variant="info">Needs {theme.requires}</Badge>}
            </div>
            {theme.description && <span className="line-clamp-2 text-sm text-foreground-300">{theme.description}</span>}
            {theme.website && (
                <Link href={theme.website} newWindow>
                    Website
                </Link>
            )}
        </Card>
    );
};
