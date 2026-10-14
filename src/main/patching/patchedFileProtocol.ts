import { net, protocol } from "electron";
import { extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import type { Logger } from "@shared/logger";
import type { SourcePatcher } from "@shared/patcher";
import type { PatchLedger } from "./patchLedger";

type Handler = (request: Request) => Response | Promise<Response>;
type Handle = (scheme: string, handler: Handler) => void;

const FILE_SCHEME = "file";
const SCRIPT_EXTENSIONS: ReadonlySet<string> = new Set([".js", ".mjs"]);
const passthrough: Handler = request => net.fetch(request, { bypassCustomProtocolHandlers: true });

export class PatchedFileProtocol {
    private readonly cache = new Map<string, Promise<string>>();
    private readonly handle: Handle;

    public constructor(
        private readonly patcher: SourcePatcher,
        private readonly ledger: PatchLedger,
        private readonly log: Logger
    ) {
        this.handle = protocol.handle.bind(protocol);
    }

    public hook(): void {
        if (this.patcher.isEmpty) return;
        protocol.handle = (scheme, handler) => {
            if (scheme !== FILE_SCHEME) return this.handle(scheme, handler);
            if (protocol.isProtocolHandled(FILE_SCHEME)) protocol.unhandle(FILE_SCHEME);
            this.register(handler);
        };
    }

    public installFallback(): void {
        if (!this.patcher.isEmpty && !protocol.isProtocolHandled(FILE_SCHEME)) this.register(passthrough);
    }

    private register(inner: Handler): void {
        this.handle(FILE_SCHEME, request => this.serve(request, inner));
    }

    private async serve(request: Request, inner: Handler): Promise<Response> {
        const response = await inner(request);
        const path = normalize(fileURLToPath(request.url.split("?")[0] ?? request.url));
        if (!response.ok || !this.isPatchable(path)) return response;
        try {
            const headers = new Headers(response.headers);
            headers.delete("content-length");
            return new Response(await this.load(path, response), { status: response.status, statusText: response.statusText, headers });
        } catch (error) {
            this.log.error("Failed to patch", path, error);
            return inner(request);
        }
    }

    private isPatchable(path: string): boolean {
        return this.ledger.owns(path) && SCRIPT_EXTENSIONS.has(extname(path).toLowerCase());
    }

    private load(path: string, response: Response): Promise<string> {
        const cached = this.cache.get(path);
        if (cached) return cached;
        const pending = response.text().then(source => this.ledger.transform(this.patcher, path, source));
        this.cache.set(path, pending);
        pending.catch(() => this.cache.delete(path));
        return pending;
    }
}
