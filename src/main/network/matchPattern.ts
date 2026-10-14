const ALL_URLS = "<all_urls>";
const PATTERN = /^(\*|https?|wss?|file|ftp):\/\/(\*|\*\.[^/*]+|[^/*]*)(\/.*)$/;

const escapeRegExp = (value: string): string => value.replace(/[.+?^${}()|[\]\\]/g, "\\$&");

const compile = (pattern: string): RegExp => {
    if (pattern === ALL_URLS) return /^(?:https?|wss?|file|ftp):\/\//;
    const parts = PATTERN.exec(pattern);
    if (!parts) throw new SyntaxError(`Invalid match pattern "${pattern}"`);
    const [, scheme = "*", host = "*", path = "/*"] = parts;
    const schemeSource = scheme === "*" ? "(?:https?|wss?)" : escapeRegExp(scheme);
    const hostSource = host === "*" ? "[^/]*" : host.startsWith("*.") ? `(?:[^/]+\\.)?${escapeRegExp(host.slice(2))}` : escapeRegExp(host);
    const pathSource = path.split("*").map(escapeRegExp).join(".*");
    return new RegExp(`^${schemeSource}://${hostSource}(?::\\d+)?${pathSource}$`, "i");
};

export class MatchPatternSet {
    private readonly expressions: readonly RegExp[];

    public constructor(patterns: readonly string[]) {
        this.expressions = patterns.map(compile);
    }

    public get isEmpty(): boolean {
        return this.expressions.length === 0;
    }

    public test(url: string): boolean {
        return this.expressions.some(expression => expression.test(url));
    }
}

export const MATCH_ALL = new MatchPatternSet([ALL_URLS]);
