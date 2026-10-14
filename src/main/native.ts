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
    start?(context: MainContext<TSchema>): void;
}

export interface NativeHost {
    readonly paths: ModPaths;
    readonly log: Logger;
    options<TSchema extends OptionsSchema>(plugin: PluginDefinition<TSchema>): ResolvedOptions<TSchema>;
    broadcast(plugin: string, event: string, payload: unknown): void;
}

export type BoundHandler = (args: readonly unknown[]) => unknown;

export interface NativeBinding {
    readonly plugin: PluginDefinition;
    readonly blocklist: Blocklist;
    start(host: NativeHost): ReadonlyMap<string, BoundHandler>;
}

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
        return new Map(Object.entries(native.handlers ?? {}).map(([name, handler]) => [name, (args: readonly unknown[]) => handler(context, ...args)]));
    }
});
