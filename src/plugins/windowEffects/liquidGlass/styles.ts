import { TRANSPARENT_BACKDROPS } from "./targets";
import type { VariantTuning } from "./variants";

export const GLASS_CLASS = "mepluh-liquid-glass";
export const MATERIALIZE_MS = 320;

export const glassStyles = ({ tint, rimOpacity }: VariantTuning): string => `
${TRANSPARENT_BACKDROPS.join(",")} {
    background-color: transparent !important;
}

.${GLASS_CLASS} {
    --lg-light-x: 20%;
    --lg-light-y: 0%;
    background-color: ${tint} !important;
    backdrop-filter: var(--lg-filter) !important;
    border-color: transparent !important;
    box-shadow:
        0 10px 36px -8px rgb(0 0 0 / 0.45),
        0 2px 8px rgb(0 0 0 / 0.18),
        inset 0 1px 0 rgb(255 255 255 / 0.22),
        inset 0 -1px 0 rgb(255 255 255 / 0.06) !important;
    isolation: isolate;
}

.${GLASS_CLASS}[data-lg-positioned] {
    position: relative;
}

.${GLASS_CLASS}::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 2;
    border-radius: inherit;
    padding: 1.25px;
    pointer-events: none;
    background:
        radial-gradient(140% 140% at var(--lg-light-x) var(--lg-light-y), rgb(255 255 255 / ${rimOpacity}), rgb(255 255 255 / 0.04) 42%, rgb(255 255 255 / 0.16) 100%);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    transition: background 120ms linear;
}

.${GLASS_CLASS}[data-lg-materializing] {
    animation: mepluh-lg-materialize ${MATERIALIZE_MS}ms cubic-bezier(.2, .9, .3, 1.15) both;
}

@keyframes mepluh-lg-materialize {
    from { opacity: 0; transform: scale(.96); }
    to { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
    .${GLASS_CLASS}[data-lg-materializing] { animation: none; }
    .${GLASS_CLASS}::after { transition: none; }
}
`;
