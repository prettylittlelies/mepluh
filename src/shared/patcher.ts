import { IDENTIFIER_PATTERN, IDENTIFIER_TOKEN, SELF_TOKEN } from "./constants";
import type { Patch, PluginDefinition, Replacement } from "./plugin";

export interface PatchFailure {
    readonly plugin: string;
    readonly match: string;
}

export interface PatchResult {
    readonly source: string;
    readonly applied: readonly string[];
    readonly failures: readonly PatchFailure[];
}

interface CompiledReplacement {
    readonly match: RegExp | string;
    readonly replace: string;
    readonly label: string;
}

interface CompiledPatch {
    readonly plugin: string;
    readonly find: RegExp | string;
    readonly replacements: readonly CompiledReplacement[];
}

const canonicalize = (pattern: RegExp): RegExp =>
    new RegExp(pattern.source.replaceAll(IDENTIFIER_TOKEN, IDENTIFIER_PATTERN), pattern.flags);

const selfReference = (plugin: string): string => `globalThis.Mepluh.plugin(${JSON.stringify(plugin)})`;

const toArray = <T>(value: T | readonly T[]): readonly T[] => (Array.isArray(value) ? value : [value as T]);

const compileReplacement = (plugin: string, { match, replace }: Replacement): CompiledReplacement => ({
    match: typeof match === "string" ? match : canonicalize(match),
    replace: replace.replaceAll(SELF_TOKEN, selfReference(plugin)),
    label: String(match)
});

const compilePatch = (plugin: string, patch: Patch): CompiledPatch => ({
    plugin,
    find: typeof patch.find === "string" ? patch.find : canonicalize(patch.find),
    replacements: toArray(patch.replacement).map(replacement => compileReplacement(plugin, replacement))
});

const matchesFind = (source: string, find: RegExp | string): boolean =>
    typeof find === "string" ? source.includes(find) : find.test(source);

export class SourcePatcher {
    private readonly patches: readonly CompiledPatch[];

    public constructor(plugins: readonly PluginDefinition[]) {
        this.patches = plugins.flatMap(plugin => (plugin.patches ?? []).map(patch => compilePatch(plugin.name, patch)));
    }

    public get isEmpty(): boolean {
        return this.patches.length === 0;
    }

    public apply(original: string): PatchResult {
        const applied = new Set<string>();
        const failures: PatchFailure[] = [];
        let source = original;

        for (const patch of this.patches) {
            if (!matchesFind(source, patch.find)) continue;
            for (const { match, replace, label } of patch.replacements) {
                const next = source.replace(match, replace);
                if (next === source) {
                    failures.push({ plugin: patch.plugin, match: label });
                    continue;
                }
                source = next;
                applied.add(patch.plugin);
            }
        }

        return { source, applied: [...applied], failures };
    }
}
