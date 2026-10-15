import type { PluginDefinition } from "@shared/plugin";
import customCss from "./customCss";
import devTools from "./devTools";
import featureFlags from "./featureFlags";
import noAds from "./noAds";
import noAutoUpdate from "./noAutoUpdate";
import noPromotions from "./noPromotions";
import noTelemetry from "./noTelemetry";
import richPresence from "./richPresence";
import settings from "./settings";
import unlockSoundAlerts from "./unlockSoundAlerts";
import windowEffects from "./windowEffects";

export const plugins: readonly PluginDefinition[] = [settings, noAds, noPromotions, noTelemetry, noAutoUpdate, featureFlags, customCss, windowEffects, richPresence, unlockSoundAlerts, devTools];
