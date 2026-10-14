import { IDENTIFIER_PATTERN, IDENTIFIER_TOKEN, SELF_TOKEN } from "./constants";
import type { Patch, PluginDefinition, Replacement } from "./plugin";

export type PatchRealm = "renderer" | "main";

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

const SELF_REFERENCES: Readonly<Record<PatchRealm, (plugin: string) => string>> = {
    renderer: plugin => `globalThis.Mepluh.plugin(${JSON.stringify(plugin)})`,
    main: plugin => `globalThis.MepluhMain?.plugin(${JSON.stringify(plugin)})`
};

const canonicalize = (pattern: RegExp): RegExp =>
    new RegExp(pattern.source.replaceAll(IDENTIFIER_TOKEN, IDENTIFIER_PATTERN), pattern.flags);

const toArray = <T>(value: T | readonly T[]): readonly T[] => (Array.isArray(value) ? value : [value as T]);

const patchesFor = (plugin: PluginDefinition, realm: PatchRealm): readonly Patch[] => (realm === "main" ? plugin.mainPatches : plugin.patches) ?? [];

const compileReplacement = (plugin: string, realm: PatchRealm, { match, replace }: Replacement): CompiledReplacement => ({
    match: typeof match === "string" ? match : canonicalize(match),
    replace: replace.replaceAll(SELF_TOKEN, SELF_REFERENCES[realm](plugin)),
    label: String(match)
});

const compilePatch = (plugin: string, realm: PatchRealm, patch: Patch): CompiledPatch => ({
    plugin,
    find: typeof patch.find === "string" ? patch.find : canonicalize(patch.find),
    replacements: toArray(patch.replacement).map(replacement => compileReplacement(plugin, realm, replacement))
});

const matchesFind = (source: string, find: RegExp | string): boolean =>
    typeof find === "string" ? source.includes(find) : find.test(source);

export class SourcePatcher {
    private readonly patches: readonly CompiledPatch[];

    public constructor(plugins: readonly PluginDefinition[], realm: PatchRealm) {
        this.patches = plugins.flatMap(plugin => patchesFor(plugin, realm).map(patch => compilePatch(plugin.name, realm, patch)));
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
