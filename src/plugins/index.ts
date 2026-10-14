import type { PluginDefinition } from "@shared/plugin";
import customCss from "./customCss";
import devTools from "./devTools";
import featureFlags from "./featureFlags";
import noAds from "./noAds";
import noPromotions from "./noPromotions";
import noTelemetry from "./noTelemetry";
import settings from "./settings";
import windowEffects from "./windowEffects";

export const plugins: readonly PluginDefinition[] = [settings, noAds, noPromotions, noTelemetry, featureFlags, customCss, windowEffects, devTools];
