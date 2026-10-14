import type { Logger } from "@shared/logger";
import type { OptionsSchema, ResolvedOptions } from "@shared/options";
import type { PluginDefinition } from "@shared/plugin";
import type { ModPaths } from "./paths";

export interface Blocklist {
    readonly urls: readonly string[];
    readonly partitions: readonly string[];
}

export interface MainContext<TSchema extends OptionsSchema> {
    readonly options: ResolvedOptions<TSchema>;
    readonly paths: ModPaths;
    readonly log: Logger;
    broadcast(event: string, payload: unknown): void;
}

export type NativeHandler<TSchema extends OptionsSchema> = (context: MainContext<TSchema>, ...args: readonly unknown[]) => unknown;

export interface PluginNative<TSchema extends OptionsSchema> {
    readonly blocklist?: Partial<Blocklist>;
    readonly handlers?: Readonly<Record<string, NativeHandler<TSchema>>>;
    readonly hooks?: Readonly<Record<string, NativeHandler<TSchema>>>;
    start?(context: MainContext<TSchema>): void;
}

export interface NativeHost {
    readonly paths: ModPaths;
    readonly log: Logger;
    options<TSchema extends OptionsSchema>(plugin: PluginDefinition<TSchema>): ResolvedOptions<TSchema>;
    broadcast(plugin: string, event: string, payload: unknown): void;
}

export type BoundHandler = (args: readonly unknown[]) => unknown;
export type PatchHooks = Readonly<Record<string, (...args: readonly unknown[]) => unknown>>;

export interface ActivatedNative {
    readonly handlers: ReadonlyMap<string, BoundHandler>;
    readonly hooks: PatchHooks;
}

export interface NativeBinding {
    readonly plugin: PluginDefinition;
    readonly blocklist: Blocklist;
    start(host: NativeHost): ActivatedNative;
}

const bind = <TSchema extends OptionsSchema>(context: MainContext<TSchema>, functions: Readonly<Record<string, NativeHandler<TSchema>>> | undefined) =>
    Object.entries(functions ?? {}).map(([name, handler]) => [name, (args: readonly unknown[]) => handler(context, ...args)] as const);

export const defineNative = <TSchema extends OptionsSchema>(plugin: PluginDefinition<TSchema>, native: PluginNative<TSchema>): NativeBinding => ({
    plugin,
    blocklist: {
        urls: native.blocklist?.urls ?? [],
        partitions: native.blocklist?.partitions ?? []
    },
    start(host) {
        const context: MainContext<TSchema> = {
            options: host.options(plugin),
            paths: host.paths,
            log: host.log.child(plugin.name),
            broadcast: (event, payload) => host.broadcast(plugin.name, event, payload)
        };
        native.start?.(context);
        return {
            handlers: new Map(bind(context, native.handlers)),
            hooks: Object.fromEntries(bind(context, native.hooks).map(([name, call]) => [name, (...args: readonly unknown[]) => call(args)]))
        };
    }
});
