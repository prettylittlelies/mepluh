import type { Logger } from "./logger";
import type { OptionsSchema, ResolvedOptions } from "./options";

export interface Replacement {
    readonly match: RegExp | string;
    readonly replace: string;
}

export interface Patch {
    readonly find: RegExp | string;
    readonly replacement: Replacement | readonly Replacement[];
}

export interface PluginChannel {
    invoke<TResult>(handler: string, ...args: readonly unknown[]): Promise<TResult>;
    on(event: string, listener: (payload: unknown) => void): () => void;
}

export interface RendererContext<TSchema extends OptionsSchema> {
    readonly options: ResolvedOptions<TSchema>;
    readonly channel: PluginChannel;
    readonly log: Logger;
}

export type PluginCategory = "Core" | "Privacy" | "Appearance" | "Developer" | "Experimental";

export interface PluginDefinition<TSchema extends OptionsSchema = OptionsSchema> {
    readonly name: string;
    readonly description: string;
    readonly category: PluginCategory;
    readonly enabledByDefault: boolean;
    readonly required?: boolean;
    readonly options?: TSchema;
    readonly patches?: readonly Patch[];
    readonly styles?: string;
    start?(context: RendererContext<TSchema>): void | Promise<void>;
    stop?(): void;
}

export const definePlugin = <TSchema extends OptionsSchema, TExtra extends object = object>(
    definition: PluginDefinition<TSchema> & TExtra
): PluginDefinition<TSchema> & TExtra => definition;
