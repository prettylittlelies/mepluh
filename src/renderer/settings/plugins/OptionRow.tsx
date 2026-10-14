import type { OptionValue, PluginOption } from "@shared/options";
import { medalUi } from "../../medal/components";

interface OptionRowProps {
    readonly id: string;
    readonly name: string;
    readonly option: PluginOption;
    readonly value: OptionValue;
    readonly onChange: (value: OptionValue) => void;
}

const TextOptionControl = ({ value, multiline, onCommit }: { readonly value: string; readonly multiline: boolean; readonly onCommit: (value: string) => void }) => {
    const { React, components } = medalUi();
    const [draft, setDraft] = React.useState(value);
    return (
        <components.Textarea
            value={draft}
            rows={multiline ? 5 : 1}
            resize={multiline ? "manual" : "none"}
            spellCheck={false}
            onChange={event => setDraft(event.currentTarget.value)}
            onBlur={() => draft !== value && onCommit(draft)}
        />
    );
};

export const OptionRow = ({ id, name, option, value, onChange }: OptionRowProps) => {
    const { Row, Label, Description, Handler, Switch } = medalUi().components;
    const title = <Label>{name}</Label>;
    const description = <Description>{option.description}</Description>;

    if (option.type === "boolean") {
        return (
            <Row
                id={id}
                title={title}
                description={description}
                handler={<Handler>{labelId => <Switch aria-labelledby={labelId} checked={value === true} onCheckedChange={onChange} />}</Handler>}
            />
        );
    }

    return (
        <Row
            id={id}
            title={title}
            description={description}
            handler={<TextOptionControl value={String(value)} multiline={option.type === "text"} onCommit={onChange} />}
        />
    );
};
