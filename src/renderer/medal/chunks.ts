export type ChunkModule = Readonly<Record<string, unknown>>;

const cache = new Map<string, Promise<ChunkModule>>();

const chunkUrl = (chunk: string): string => new URL(`./chunks/${chunk}.js`, document.baseURI).href;

export const importChunk = (chunk: string): Promise<ChunkModule> => {
    const cached = cache.get(chunk);
    if (cached) return cached;
    const pending = import(chunkUrl(chunk)) as Promise<ChunkModule>;
    cache.set(chunk, pending);
    return pending;
};

export const importExport = async (chunk: string, name: string): Promise<unknown> => {
    const module = await importChunk(chunk);
    if (!(name in module)) throw new Error(`Medal chunk "${chunk}" no longer exports "${name}"`);
    return module[name];
};
