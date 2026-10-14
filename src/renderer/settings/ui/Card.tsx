import type { Children } from "../../medal/types";

interface CardProps {
    readonly children?: Children;
    readonly tone?: "default" | "brand";
    readonly className?: string;
}

const tones = {
    default: "rounded-xl border border-stroke-0/16 bg-second-layer p-4",
    brand: "rounded-xl border border-brand-primary-700 bg-brand-primary-950 p-5"
} as const;

export const Card = ({ children, tone = "default", className = "" }: CardProps) => (
    <div className={`flex min-w-0 flex-col gap-3 ${tones[tone]} ${className}`}>{children}</div>
);
