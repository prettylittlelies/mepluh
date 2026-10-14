# Mepluh

A Vencord-style client mod for the Medal desktop app (Electron + Velopack, Windows).

## Usage

```sh
bun install
bun run inject     # build, stop Medal, inject
bun run status
bun run uninject   # restore the original app.asar
```

Settings live inside Medal's own settings sidebar, rendered entirely with Medal's components (`src/renderer/medal`):

| Tab | Contents |
| --- | --- |
| Mepluh | Status hero, stat tiles, quick actions, privacy toggles |
| Plugins | Search, status filter, category tabs, plugin cards with per-plugin settings dialogs |
| Custom CSS | Embedded Monaco editor with CSS IntelliSense, live autosave, Ctrl+S |
| Patch Report | Every patch applied or failed this session, filterable by plugin |

Medal's Velopack updater replaces `%LOCALAPPDATA%\Medal\current` on every update, which removes the injection. Run `bun run inject` again after Medal updates.

## How it works

| Layer | Mechanism |
| --- | --- |
| Injection | `resources/app.asar` → `_app.asar` (plus `.unpacked`); a two-file stub `app.asar` loads `%APPDATA%\Mepluh\dist\main.js`, which boots the original app via `Module._load`. |
| Renderer patches | Medal's own `protocol.handle("file")` is wrapped, so every Vite chunk served from `_app.asar` passes through the `SourcePatcher` (`find` / `match` / `replace`, with `\i` for identifiers and `$self` for the owning plugin). |
| Renderer code | Session-registered frame preload exposes `MepluhNative` over `contextBridge` and evaluates `renderer.js` in the main world. |
| Monaco | Bundled locally by Bun (no CDN); injected through the preload so Medal's CSP does not apply, workers spawned from `blob:` URLs. |
| Medal UI | Medal's ESM chunks are imported by URL, yielding the same module instances Medal uses; TSX compiles against a `jsxImportSource` shim that forwards to Medal's React runtime. |
| Network | `WebRequest.prototype.onBeforeRequest` is composed with Medal's own listeners (Electron allows one per session); Node `http`/`https`/`fetch` are guarded for main-process telemetry. |

## Plugins

| Plugin | Default | What it does |
| --- | --- | --- |
| Settings | required | Adds the Mepluh section to Medal's settings. |
| NoAds | on | Forces the `ads-enabled` flag off, hides Qortex video slots, blocks the `persist:ads` session and `medal.tv/ads/*`. |
| NoPromotions | on | Drops sponsored library cards, promo announcements and campaign banners. |
| NoTelemetry | on | Blocks Amplitude, session replay, Sentry and LaunchDarkly event uploads. |
| FeatureFlags | off | Merges a JSON object over Medal's LaunchDarkly flags in the Redux store. |
| CustomCSS | on | Live-reloads `%APPDATA%\Mepluh\custom.css`. |
| DevTools | on | F12 / Ctrl+Shift+I on any Medal window. |

## Writing a plugin

`src/plugins/<name>/index.ts` holds the definition (patches, styles, options, renderer `start`/`stop`). An optional `native.ts` beside it holds main-process behavior (`blocklist`, `handlers`, `start`). Register them in `src/plugins/index.ts` and `src/plugins/natives.ts`.
