import type { OptionValue, PluginOption, SelectOption } from "@shared/options";
import { medalUi } from "../../medal/components";
import type { MedalNode } from "../../medal/types";

interface OptionRowProps {
    readonly id: string;
    readonly option: PluginOption;
    readonly value: OptionValue;
    readonly onChange: (value: OptionValue) => void;
}

const StringControl = ({ value, onCommit }: { readonly value: string; readonly onCommit: (value: string) => void }) => {
    const { React, components } = medalUi();
    const [draft, setDraft] = React.useState(value);
    return (
        <components.Input
            value={draft}
            inputHeight="medium"
            spellCheck={false}
            className="w-60"
            onChange={event => setDraft(event.currentTarget.value)}
            onBlur={() => draft !== value && onCommit(draft)}
        />
    );
};

const TextControl = ({ value, onCommit }: { readonly value: string; readonly onCommit: (value: string) => void }) => {
    const { React, components } = medalUi();
    const [draft, setDraft] = React.useState(value);
    return (
        <components.Textarea
            value={draft}
            rows={5}
            resize="manual"
            spellCheck={false}
            onChange={event => setDraft(event.currentTarget.value)}
            onBlur={() => draft !== value && onCommit(draft)}
        />
    );
};

const SelectControl = ({ option, value, onChange }: { readonly option: SelectOption; readonly value: string; readonly onChange: (value: string) => void }) => {
    const { Handler, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } = medalUi().components;
    const selected = option.choices.find(choice => choice.value === value) ?? option.choices[0];
    return (
        <Handler>
            {labelId => (
                <Select value={value} onValueChange={onChange}>
                    <SelectTrigger className="w-60" aria-label={labelId}>
                        <SelectValue>{selected?.label ?? value}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {option.choices.map(choice => (
                            <SelectItem key={choice.value} value={choice.value}>
                                {choice.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </Handler>
    );
};

const controlFor = (option: PluginOption, value: OptionValue, onChange: (value: OptionValue) => void): MedalNode => {
    const { Handler, Switch } = medalUi().components;
    switch (option.type) {
        case "boolean":
            return <Handler>{labelId => <Switch aria-labelledby={labelId} checked={value === true} onCheckedChange={onChange} />}</Handler>;
        case "select":
            return <SelectControl option={option} value={String(value)} onChange={onChange} />;
        case "string":
            return <StringControl value={String(value)} onCommit={onChange} />;
        case "text":
            return <TextControl value={String(value)} onCommit={onChange} />;
    }
};

export const OptionRow = ({ id, option, value, onChange }: OptionRowProps) => {
    const { Row, Label, Description } = medalUi().components;
    return <Row id={id} title={<Label>{option.label}</Label>} description={<Description>{option.description}</Description>} handler={controlFor(option, value, onChange)} />;
};
