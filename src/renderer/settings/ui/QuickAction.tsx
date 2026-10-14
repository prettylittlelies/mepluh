import { medalUi } from "../../medal/components";

type QuickActionTarget = { readonly onClick: () => void } | { readonly to: string };

type QuickActionProps = QuickActionTarget & {
    readonly icon: string;
    readonly label: string;
};

export const QuickAction = (props: QuickActionProps) => {
    const { Button, Icon, Link } = medalUi().components;
    const button = (
        <Button variant="secondary" size="lg" className="w-full justify-start gap-2" {...("onClick" in props ? { onClick: props.onClick } : {})}>
            <Icon shape={props.icon} size={18} />
            <span className="truncate">{props.label}</span>
        </Button>
    );
    return "to" in props ? (
        <Link to={props.to} newWindow={false} className="block w-full">
            {button}
        </Link>
    ) : (
        button
    );
};
