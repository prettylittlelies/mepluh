declare const nodeBrand: unique symbol;

export interface MedalNode {
    readonly [nodeBrand]: true;
}

export type Child = MedalNode | string | number | boolean | null | undefined;
export type Children = Child | readonly Children[];

export type Component<TProps> = (props: TProps) => MedalNode | null;

export type ElementType = string | Component<never>;

export interface JsxRuntime {
    jsx(type: ElementType, props: object, key?: string): MedalNode;
    jsxs(type: ElementType, props: object, key?: string): MedalNode;
    readonly Fragment: symbol;
}

export interface ReactApi {
    useState<T>(initial: T | (() => T)): [T, (next: T | ((previous: T) => T)) => void];
    useSyncExternalStore<T>(subscribe: (onChange: () => void) => () => void, getSnapshot: () => T): T;
    useCallback<T extends (...args: never[]) => unknown>(callback: T, dependencies: readonly unknown[]): T;
    useEffect(effect: () => void | (() => void), dependencies?: readonly unknown[]): void;
    useMemo<T>(factory: () => T, dependencies: readonly unknown[]): T;
    useRef<T>(initial: T): { current: T };
}
