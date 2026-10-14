import { rm } from "node:fs/promises";
import { join } from "node:path";
import manifest from "../package.json" with { type: "json" };
import { builtinThemes } from "../src/themes";

const root = join(import.meta.dir, "..");
const outdir = join(root, "dist");
const monacoEsm = join(root, "node_modules", "monaco-editor", "esm", "vs");

interface Target {
    readonly label: string;
    readonly entry: string;
    readonly naming: string;
    readonly platform: "node" | "browser";
    readonly format: "cjs" | "iife";
    readonly directory?: string;
}

const targets: readonly Target[] = [
    { label: "main", entry: join(root, "src/main/index.ts"), naming: "main.js", platform: "node", format: "cjs" },
    { label: "preload", entry: join(root, "src/preload/index.ts"), naming: "preload.js", platform: "node", format: "cjs" },
    { label: "renderer", entry: join(root, "src/renderer/index.ts"), naming: "renderer.js", platform: "browser", format: "iife" },
    { label: "monaco", entry: join(root, "src/editor/monaco.ts"), naming: "monaco.[ext]", platform: "browser", format: "iife", directory: "monaco" },
    { label: "editor worker", entry: join(monacoEsm, "editor/editor.worker.js"), naming: "editor.worker.js", platform: "browser", format: "iife", directory: "monaco" },
    { label: "css worker", entry: join(monacoEsm, "language/css/css.worker.js"), naming: "css.worker.js", platform: "browser", format: "iife", directory: "monaco" }
];

const build = async ({ label, entry, naming, platform, format, directory }: Target): Promise<void> => {
    const result = await Bun.build({
        entrypoints: [entry],
        outdir: directory ? join(outdir, directory) : outdir,
        naming,
        target: platform,
        format,
        external: ["electron"],
        minify: { syntax: true, whitespace: true },
        sourcemap: directory ? "none" : "inline",
        define: { MEPLUH_VERSION: JSON.stringify(manifest.version), "process.env.NODE_ENV": JSON.stringify("production") }
    });
    if (!result.success) throw new AggregateError(result.logs, `Failed to build ${label}`);
    console.log(`built ${label}`);
};

const embedCodiconFont = async (): Promise<void> => {
    const font = Buffer.from(await Bun.file(join(monacoEsm, "base/browser/ui/codicons/codicon/codicon.ttf")).arrayBuffer()).toString("base64");
    const stylesheet = Bun.file(join(outdir, "monaco", "monaco.css"));
    await Bun.write(stylesheet, `@font-face{font-family:"codicon";font-display:block;src:url(data:font/ttf;base64,${font}) format("truetype")}
${await stylesheet.text()}`);
};

const writeThemes = async (): Promise<void> => {
    await Promise.all(builtinThemes.map(({ fileName, css }) => Bun.write(join(outdir, "themes", fileName), css)));
    console.log(`built ${builtinThemes.length} themes`);
};

await rm(outdir, { recursive: true, force: true });
await Promise.all([...targets.map(build), writeThemes()]);
await embedCodiconFont();
