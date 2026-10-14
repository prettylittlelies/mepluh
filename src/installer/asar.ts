import { open, writeFile } from "node:fs/promises";

interface AsarFileEntry {
    readonly offset: string;
    readonly size: number;
}

interface AsarDirectoryEntry {
    readonly files: Readonly<Record<string, AsarEntry>>;
}

type AsarEntry = AsarFileEntry | AsarDirectoryEntry;

const UINT32_BYTES = 4;
const HEADER_PREFIX_BYTES = 16;

const align = (length: number): number => Math.ceil(length / UINT32_BYTES) * UINT32_BYTES;

const resolveEntry = (root: AsarDirectoryEntry, path: string): AsarFileEntry => {
    const entry = path.split("/").reduce<AsarEntry | undefined>((node, segment) => (node && "files" in node ? node.files[segment] : undefined), root);
    if (!entry || !("offset" in entry)) throw new Error(`"${path}" is not a file inside the archive`);
    return entry;
};

export const readAsarFile = async (archive: string, path: string): Promise<Buffer> => {
    const handle = await open(archive, "r");
    try {
        const prefix = Buffer.alloc(HEADER_PREFIX_BYTES);
        await handle.read(prefix, 0, HEADER_PREFIX_BYTES, 0);
        const headerSize = prefix.readUInt32LE(4);
        const jsonLength = prefix.readUInt32LE(12);

        const json = Buffer.alloc(jsonLength);
        await handle.read(json, 0, jsonLength, HEADER_PREFIX_BYTES);
        const entry = resolveEntry(JSON.parse(json.toString("utf8")) as AsarDirectoryEntry, path);

        const content = Buffer.alloc(entry.size);
        await handle.read(content, 0, entry.size, 2 * UINT32_BYTES + headerSize + Number(entry.offset));
        return content;
    } finally {
        await handle.close();
    }
};

export const writeFlatAsar = async (archive: string, files: Readonly<Record<string, string>>): Promise<void> => {
    const contents = Object.entries(files).map(([name, text]) => [name, Buffer.from(text, "utf8")] as const);
    let offset = 0;
    const entries = Object.fromEntries(
        contents.map(([name, buffer]) => {
            const entry: AsarFileEntry = { offset: String(offset), size: buffer.length };
            offset += buffer.length;
            return [name, entry];
        })
    );

    const json = Buffer.from(JSON.stringify({ files: entries } satisfies AsarDirectoryEntry), "utf8");
    const header = Buffer.alloc(2 * UINT32_BYTES + align(json.length));
    header.writeUInt32LE(UINT32_BYTES + align(json.length), 0);
    header.writeUInt32LE(json.length, UINT32_BYTES);
    json.copy(header, 2 * UINT32_BYTES);

    const sizePickle = Buffer.alloc(2 * UINT32_BYTES);
    sizePickle.writeUInt32LE(UINT32_BYTES, 0);
    sizePickle.writeUInt32LE(header.length, UINT32_BYTES);

    await writeFile(archive, Buffer.concat([sizePickle, header, ...contents.map(([, buffer]) => buffer)]));
};
