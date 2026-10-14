import type * as Monaco from "monaco-editor";
import { medalUi } from "../medal/components";
import { useAsync } from "../settings/hooks";
import { loadMonaco, MEPLUH_THEME, type MonacoApi } from "./monacoLoader";

interface MonacoEditorProps {
    readonly value: string;
    readonly language: string;
    readonly onChange: (value: string) => void;
    readonly onSave?: (value: string) => void;
}

const EDITOR_HEIGHT = 560;

const EDITOR_OPTIONS: Monaco.editor.IStandaloneEditorConstructionOptions = {
    theme: MEPLUH_THEME,
    automaticLayout: true,
    fontSize: 13,
    fontFamily: "'Cascadia Code', Consolas, 'Courier New', monospace",
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    padding: { top: 12, bottom: 12 },
    tabSize: 4,
    renderLineHighlight: "line",
    smoothScrolling: true,
    cursorSmoothCaretAnimation: "on"
};

const EditorSurface = ({ monaco, value, language, onChange, onSave }: MonacoEditorProps & { readonly monaco: MonacoApi }) => {
    const { React } = medalUi();
    const handlers = React.useRef({ onChange, onSave });
    handlers.current = { onChange, onSave };

    const mount = React.useCallback((host: HTMLDivElement | null) => {
        if (!host) return;
        const editor = monaco.editor.create(host, { ...EDITOR_OPTIONS, value, language });
        const subscription = editor.onDidChangeModelContent(() => handlers.current.onChange(editor.getValue()));
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => handlers.current.onSave?.(editor.getValue()));
        return () => {
            subscription.dispose();
            editor.getModel()?.dispose();
            editor.dispose();
        };
    }, []);

    return <div ref={mount} style={{ height: EDITOR_HEIGHT }} className="w-full overflow-hidden rounded-lg border border-stroke-0/16" />;
};

export const MonacoEditor = (props: MonacoEditorProps) => {
    const { Skeleton, ErrorText } = medalUi().components;
    const [monaco] = useAsync(loadMonaco, []);
    switch (monaco.status) {
        case "loading":
            return <Skeleton className="h-96 w-full" />;
        case "error":
            return <ErrorText>Monaco failed to load: {monaco.error}</ErrorText>;
        case "ready":
            return <EditorSurface monaco={monaco.value} {...props} />;
    }
};
