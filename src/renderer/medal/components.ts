import { importExport } from "./chunks";
import type { Children, Component, JsxRuntime, MedalNode, ReactApi } from "./types";

interface WrapperProps {
    readonly children?: Children;
    readonly className?: string;
}

type ButtonVariant = "brand" | "primary" | "secondary" | "danger" | "ghost" | "outline";
type BadgeVariant = "brand" | "primary" | "secondary" | "danger" | "success" | "warning" | "info" | "outline" | "ghost" | "accent";

export interface ToastOptions {
    readonly variant?: "default" | "success" | "error" | "info";
    readonly title: string;
    readonly description?: string;
}

export interface MedalComponents {
    readonly Page: Component<WrapperProps>;
    readonly Section: Component<WrapperProps & { readonly id?: string; readonly header?: MedalNode; readonly disabled?: boolean }>;
    readonly SectionTitle: Component<WrapperProps>;
    readonly Label: Component<WrapperProps>;
    readonly Description: Component<WrapperProps>;
    readonly Handler: Component<{ readonly children?: Children | ((labelId: string) => Children); readonly className?: string }>;
    readonly ErrorText: Component<WrapperProps>;
    readonly Header: Component<{ readonly icon?: MedalNode; readonly title: Children; readonly description?: Children }>;
    readonly Row: Component<{
        readonly id?: string;
        readonly className?: string;
        readonly title: Children;
        readonly description?: Children;
        readonly handler?: Children;
        readonly error?: Children;
    }>;
    readonly SubSection: Component<WrapperProps & { readonly title?: Children; readonly description?: Children }>;
    readonly Switch: Component<{ readonly checked: boolean; readonly onCheckedChange: (checked: boolean) => void; readonly disabled?: boolean; readonly "aria-labelledby"?: string }>;
    readonly Textarea: Component<{
        readonly value: string;
        readonly onChange: (event: { readonly currentTarget: HTMLTextAreaElement }) => void;
        readonly onBlur?: () => void;
        readonly resize?: "none" | "manual" | "auto";
        readonly rows?: number;
        readonly spellCheck?: boolean;
        readonly className?: string;
        readonly placeholder?: string;
    }>;
    readonly Button: Component<{
        readonly variant?: ButtonVariant;
        readonly size?: "sm" | "md" | "lg";
        readonly onClick?: () => void;
        readonly disabled?: boolean;
        readonly className?: string;
        readonly children?: Children;
    }>;
    readonly Notice: Component<WrapperProps>;
    readonly Icon: Component<{ readonly shape: string; readonly size?: number; readonly className?: string }>;
    readonly Badge: Component<WrapperProps & { readonly variant?: BadgeVariant }>;
    readonly Separator: Component<{ readonly className?: string; readonly orientation?: "horizontal" | "vertical" }>;
    readonly Link: Component<WrapperProps & { readonly to?: string; readonly href?: string; readonly newWindow?: boolean }>;
    readonly EmptyState: Component<{ readonly icon: MedalNode; readonly header: Children; readonly subtext?: Children; readonly button?: MedalNode; readonly compact?: boolean }>;
    readonly Skeleton: Component<{ readonly className?: string }>;
    readonly InputGroup: Component<WrapperProps>;
    readonly InputGroupInput: Component<{
        readonly value: string;
        readonly onChange: (event: { readonly target: HTMLInputElement }) => void;
        readonly placeholder?: string;
        readonly className?: string;
    }>;
    readonly InputGroupAddon: Component<WrapperProps & { readonly align?: "inline-start" | "inline-end" }>;
    readonly Select: Component<{ readonly value: string; readonly onValueChange: (value: string) => void; readonly children?: Children }>;
    readonly SelectTrigger: Component<WrapperProps & { readonly "aria-label"?: string }>;
    readonly SelectValue: Component<WrapperProps>;
    readonly SelectContent: Component<WrapperProps>;
    readonly SelectItem: Component<WrapperProps & { readonly value: string }>;
    readonly Tabs: Component<WrapperProps & { readonly value: string; readonly onValueChange: (value: string) => void; readonly variant?: "underline" | "pill" }>;
    readonly TabsList: Component<WrapperProps>;
    readonly TabsTrigger: Component<WrapperProps & { readonly value: string }>;
    readonly Dialog: Component<{ readonly open: boolean; readonly onOpenChange: (open: boolean) => void; readonly children?: Children }>;
    readonly DialogContent: Component<WrapperProps>;
    readonly DialogHeader: Component<WrapperProps>;
    readonly DialogFooter: Component<WrapperProps>;
    readonly DialogTitle: Component<WrapperProps>;
    readonly DialogDescription: Component<WrapperProps>;
    readonly Tooltip: Component<{ readonly children?: Children }>;
    readonly TooltipTrigger: Component<{ readonly render: MedalNode }>;
    readonly TooltipContent: Component<WrapperProps & { readonly side?: "top" | "bottom" | "left" | "right" }>;
}

export interface MedalUi {
    readonly React: ReactApi;
    readonly runtime: JsxRuntime;
    readonly components: MedalComponents;
    readonly toast: (options: ToastOptions) => void;
}

type Source = readonly [chunk: string, exportName: string];

const factorySources = {
    React: ["renderer-react.production", "t"],
    runtime: ["renderer-react-jsx-runtime.production", "t"]
} as const satisfies Record<"React" | "runtime", Source>;

const toastSource: Source = ["renderer-toast", "r"];

const componentSources = {
    Page: ["renderer-SettingConfig", "n"],
    Section: ["renderer-SettingConfig", "t"],
    SectionTitle: ["renderer-SettingConfig", "s"],
    Label: ["renderer-SettingConfig", "o"],
    Description: ["renderer-SettingConfig", "r"],
    Handler: ["renderer-SettingConfig", "a"],
    ErrorText: ["renderer-SettingConfig", "i"],
    Header: ["renderer-SettingHeader", "t"],
    Row: ["renderer-SettingRow", "t"],
    SubSection: ["renderer-SettingSubSection", "n"],
    Switch: ["renderer-SettingsSwitch", "t"],
    Textarea: ["renderer-textarea", "t"],
    Button: ["renderer-Button", "t"],
    Notice: ["renderer-SettingNotice", "t"],
    Icon: ["renderer-icon-assets-provider", "t"],
    Badge: ["renderer-badge", "t"],
    Separator: ["renderer-separator.2", "t"],
    Link: ["renderer-Link", "t"],
    EmptyState: ["renderer-EmptyState", "t"],
    Skeleton: ["renderer-skeleton", "t"],
    InputGroup: ["renderer-input-group", "t"],
    InputGroupInput: ["renderer-input-group", "i"],
    InputGroupAddon: ["renderer-input-group", "n"],
    Select: ["renderer-usePreviousValue", "t"],
    SelectTrigger: ["renderer-usePreviousValue", "o"],
    SelectValue: ["renderer-usePreviousValue", "s"],
    SelectContent: ["renderer-usePreviousValue", "n"],
    SelectItem: ["renderer-usePreviousValue", "i"],
    Tabs: ["renderer-TabsRootContext", "t"],
    TabsList: ["renderer-TabsRootContext", "r"],
    TabsTrigger: ["renderer-TabsRootContext", "i"],
    Dialog: ["renderer-DialogRootContext", "t"],
    DialogContent: ["renderer-DialogRootContext", "r"],
    DialogHeader: ["renderer-DialogRootContext", "o"],
    DialogFooter: ["renderer-DialogRootContext", "a"],
    DialogTitle: ["renderer-DialogRootContext", "l"],
    DialogDescription: ["renderer-DialogRootContext", "i"],
    Tooltip: ["renderer-useHoverShared", "t"],
    TooltipTrigger: ["renderer-useHoverShared", "r"],
    TooltipContent: ["renderer-useHoverShared", "n"]
} as const satisfies Record<keyof MedalComponents, Source>;

const isRenderable = (value: unknown): boolean => typeof value === "function" || (typeof value === "object" && value !== null && "$$typeof" in value);

const resolveSource = async ([chunk, name]: Source): Promise<unknown> => {
    const value = await importExport(chunk, name);
    if (!isRenderable(value)) throw new TypeError(`${chunk}#${name} is not a component`);
    return value;
};

const resolveFactory = async <T>(source: Source): Promise<T> => {
    const factory = await resolveSource(source);
    if (typeof factory !== "function") throw new TypeError(`${source[0]}#${source[1]} is not a factory`);
    return (factory as () => T)();
};

const resolveComponents = async (): Promise<MedalComponents> => {
    const entries = await Promise.all(Object.entries(componentSources).map(async ([key, source]) => [key, await resolveSource(source)] as const));
    return Object.fromEntries(entries) as unknown as MedalComponents;
};

let loaded: MedalUi | undefined;
let pending: Promise<MedalUi> | undefined;

export const loadMedalUi = (): Promise<MedalUi> =>
    (pending ??= Promise.all([
        resolveFactory<ReactApi>(factorySources.React),
        resolveFactory<JsxRuntime>(factorySources.runtime),
        resolveComponents(),
        resolveSource(toastSource)
    ]).then(([React, runtime, components, toast]) => (loaded = { React, runtime, components, toast: toast as MedalUi["toast"] })));

export const medalUi = (): MedalUi => {
    if (!loaded) throw new Error("Medal UI accessed before loadMedalUi() resolved");
    return loaded;
};
