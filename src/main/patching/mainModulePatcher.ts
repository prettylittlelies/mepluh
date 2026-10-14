import Module from "node:module";
import { extname } from "node:path";
import type { SourcePatcher } from "@shared/patcher";
import type { PatchLedger } from "./patchLedger";

interface CompilableModule {
    _compile(content: string, filename: string): unknown;
}

const SCRIPT_EXTENSION = ".js";

export class MainModulePatcher {
    public constructor(
        private readonly patcher: SourcePatcher,
        private readonly ledger: PatchLedger
    ) {}

    public hook(): void {
        if (this.patcher.isEmpty) return;
        const prototype = (Module as unknown as { prototype: CompilableModule }).prototype;
        const compile = prototype._compile;
        const { patcher, ledger } = this;
        prototype._compile = function (this: CompilableModule, content: string, filename: string) {
            const patchable = ledger.owns(filename) && extname(filename).toLowerCase() === SCRIPT_EXTENSION;
            return compile.call(this, patchable ? ledger.transform(patcher, filename, content) : content, filename);
        };
    }
}
