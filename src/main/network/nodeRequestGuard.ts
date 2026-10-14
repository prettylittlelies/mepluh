import http, { type ClientRequest, type RequestOptions } from "node:http";
import https from "node:https";
import type { Logger } from "@shared/logger";
import type { MatchPatternSet } from "./matchPattern";

type RequestFunction = (...args: readonly unknown[]) => ClientRequest;

interface HttpModule {
    request: RequestFunction;
    get: RequestFunction;
}

const isOptions = (value: unknown): value is RequestOptions => typeof value === "object" && value !== null && !(value instanceof URL);

const describeTarget = (defaultProtocol: string, [first, second]: readonly unknown[]): string => {
    if (typeof first === "string" || first instanceof URL) return String(first);
    const options = isOptions(first) ? first : isOptions(second) ? second : {};
    const host = options.hostname ?? options.host ?? "localhost";
    const port = options.port ? `:${options.port}` : "";
    return `${options.protocol ?? defaultProtocol}//${host}${port}${options.path ?? "/"}`;
};

export class NodeRequestGuard {
    public constructor(
        private readonly patterns: MatchPatternSet,
        private readonly log: Logger
    ) {}

    public install(): void {
        if (this.patterns.isEmpty) return;
        this.wrapModule(http as unknown as HttpModule, "http:");
        this.wrapModule(https as unknown as HttpModule, "https:");
        this.wrapFetch();
    }

    private blocks(url: string): boolean {
        if (!this.patterns.test(url)) return false;
        this.log.debug("Blocked", url);
        return true;
    }

    private wrapModule(target: HttpModule, protocol: string): void {
        (["request", "get"] as const).forEach(method => {
            const original = target[method];
            target[method] = (...args) => {
                const request = original(...args);
                if (this.blocks(describeTarget(protocol, args))) request.destroy(new Error("Request blocked by Mepluh"));
                return request;
            };
        });
    }

    private wrapFetch(): void {
        const original = globalThis.fetch;
        globalThis.fetch = Object.assign(
            (input: string | URL | Request, init?: RequestInit) =>
                this.blocks(input instanceof Request ? input.url : String(input))
                    ? Promise.reject(new TypeError("Request blocked by Mepluh"))
                    : original(input, init),
            original
        );
    }
}
