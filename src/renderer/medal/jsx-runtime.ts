import { medalUi } from "./components";
import type { Children, ElementType, MedalNode } from "./types";

export const Fragment: unique symbol = Symbol.for("react.fragment");

export const jsx = (type: ElementType | typeof Fragment, props: object, key?: string): MedalNode =>
    medalUi().runtime.jsx(type as ElementType, props, key);

export const jsxs = (type: ElementType | typeof Fragment, props: object, key?: string): MedalNode =>
    medalUi().runtime.jsxs(type as ElementType, props, key);

export declare namespace JSX {
    type Element = MedalNode;
    interface ElementChildrenAttribute {
        children: object;
    }
    interface IntrinsicAttributes {
        key?: string | number;
    }
    interface IntrinsicElements {
        [tag: string]: { readonly className?: string; readonly children?: Children; readonly [attribute: string]: unknown };
    }
}
