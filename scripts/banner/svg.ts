export type AttributeValue = string | number;
export type Attributes = Readonly<Record<string, AttributeValue>>;
export type SvgChild = SvgNode | string;

export interface SvgNode {
    readonly tag: string;
    readonly attributes: Attributes;
    readonly children: readonly SvgChild[];
}

export const el = (tag: string, attributes: Attributes = {}, ...children: readonly SvgChild[]): SvgNode => ({ tag, attributes, children });

const escape = (value: string): string => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const formatNumber = (value: number): string => String(Number(value.toFixed(3)));

const renderAttributes = (attributes: Attributes): string =>
    Object.entries(attributes)
        .map(([name, value]) => ` ${name}="${escape(typeof value === "number" ? formatNumber(value) : value)}"`)
        .join("");

export const render = (node: SvgChild, depth = 0): string => {
    const indent = "  ".repeat(depth);
    if (typeof node === "string") return `${indent}${escape(node)}`;
    const open = `${indent}<${node.tag}${renderAttributes(node.attributes)}`;
    if (node.children.length === 0) return `${open}/>`;
    if (node.children.every(child => typeof child === "string")) return `${open}>${node.children.map(child => escape(child as string)).join("")}</${node.tag}>`;
    return [`${open}>`, ...node.children.map(child => render(child, depth + 1)), `${indent}</${node.tag}>`].join("\n");
};

export const ref = (id: string): string => `url(#${id})`;
