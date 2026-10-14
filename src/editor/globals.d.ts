import type * as Monaco from "monaco-editor";

declare global {
    var MepluhMonaco: typeof Monaco | undefined;
}
