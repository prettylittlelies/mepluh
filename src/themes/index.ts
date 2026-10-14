import { catppuccinThemes } from "./catppuccin/generate";
import type { BuiltinTheme } from "./themeFile";
import { transparencyTheme } from "./transparency";

export const builtinThemes: readonly BuiltinTheme[] = [transparencyTheme, ...catppuccinThemes];
