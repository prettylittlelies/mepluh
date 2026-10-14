import type { Patch } from "./plugin";

export const chunkMarker = (chunk: string): string => `sourceMappingURL=${chunk}.js.map`;

export const nullComponentExport = (chunk: string): Patch => ({
    find: chunkMarker(chunk),
    replacement: {
        match: /export\{\i as (\w+)\}/,
        replace: "const __mepluhNull=()=>null;export{__mepluhNull as $1}"
    }
});
