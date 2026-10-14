import type * as Monaco from "monaco-editor";
import { styles } from "../styleRegistry";

export type MonacoApi = typeof Monaco;

export const MEPLUH_THEME = "mepluh-dark";

const workerUrl = (source: string): string => URL.createObjectURL(new Blob([source], { type: "text/javascript" }));

const defineTheme = (monaco: MonacoApi): void =>
    monaco.editor.defineTheme(MEPLUH_THEME, {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
            "editor.background": "#0f0f10",
            "editor.lineHighlightBackground": "#ffffff08",
            "editorLineNumber.foreground": "#5a5a5a",
            "editorLineNumber.activeForeground": "#cfff53",
            "editorCursor.foreground": "#cfff53",
            "editor.selectionBackground": "#cfff5333",
            "editorWidget.background": "#151515",
            "editorWidget.border": "#2a2a2a",
            "scrollbarSlider.background": "#ffffff14",
            "scrollbarSlider.hoverBackground": "#ffffff24"
        }
    });

let pending: Promise<MonacoApi> | undefined;

export const loadMonaco = (): Promise<MonacoApi> =>
    (pending ??= MepluhNative.loadMonaco().then(({ css, workers }) => {
        const monaco = globalThis.MepluhMonaco;
        if (!monaco) throw new Error("Monaco bundle did not initialise");
        const urls = { editor: workerUrl(workers.editor), css: workerUrl(workers.css) };
        window.MonacoEnvironment = {
            getWorker: (_id, label) => new Worker(["css", "scss", "less"].includes(label) ? urls.css : urls.editor)
        };
        styles.set("core:monaco", css);
        defineTheme(monaco);
        return monaco;
    }));
