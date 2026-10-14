export type FlagMap = Readonly<Record<string, unknown>>;

const isFlagMap = (value: unknown): value is FlagMap => typeof value === "object" && value !== null && !Array.isArray(value);

export const parseOverrides = (raw: string): FlagMap => {
    const parsed: unknown = JSON.parse(raw.trim() || "{}");
    if (!isFlagMap(parsed)) throw new TypeError("Flag overrides must be a JSON object");
    return parsed;
};
