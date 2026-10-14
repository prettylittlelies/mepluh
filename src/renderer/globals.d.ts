import type { MepluhNative } from "@shared/ipc";
import type { MepluhApi } from "./api";

declare global {
    var MepluhNative: MepluhNative;
    var Mepluh: MepluhApi;
    const MEPLUH_VERSION: string;
}
