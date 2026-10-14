import { join } from "node:path";
import { CANVAS, META } from "./design";
import { filters } from "./filters";
import { definitions, layers } from "./layers";
import { el, render } from "./svg";

const output = join(import.meta.dir, "..", "..", "assets", "banner.svg");

const document = el(
    "svg",
    {
        xmlns: "http://www.w3.org/2000/svg",
        width: CANVAS.width,
        height: CANVAS.height,
        viewBox: `0 0 ${CANVAS.width} ${CANVAS.height}`,
        role: "img",
        "aria-label": `mepluh, ${META.left.toLowerCase()}`
    },
    el("defs", {}, ...filters(), ...definitions()),
    ...layers()
);

await Bun.write(output, `${render(document)}\n`);
console.log(`wrote ${output}`);
