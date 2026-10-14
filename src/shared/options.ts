interface OptionBase<TType extends string, TValue> {
    readonly type: TType;
    readonly description: string;
    readonly default: TValue;
}

export type BooleanOption = OptionBase<"boolean", boolean>;
export type StringOption = OptionBase<"string", string>;
export type TextOption = OptionBase<"text", string>;

export type PluginOption = BooleanOption | StringOption | TextOption;
export type OptionValue = PluginOption["default"];
export type OptionsSchema = Readonly<Record<string, PluginOption>>;

export type ResolvedOptions<TSchema extends OptionsSchema> = {
    readonly [K in keyof TSchema]: TSchema[K]["default"];
};
