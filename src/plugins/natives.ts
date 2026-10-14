import type { NativeBinding } from "@main/native";
import customCss from "./customCss/native";
import devTools from "./devTools/native";
import noAds from "./noAds/native";
import noTelemetry from "./noTelemetry/native";
import richPresence from "./richPresence/native";
import windowEffects from "./windowEffects/native";

export const natives: readonly NativeBinding[] = [noAds, noTelemetry, customCss, windowEffects, richPresence, devTools];
