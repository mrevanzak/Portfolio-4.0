import * as Cloudflare from "@alchemy.run/cloudflare";
import * as Alchemy from "alchemy";
import * as Effect from "effect/Effect";

export default Alchemy.Stack(
  "Portfolio",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    // A new id forces a new Worker: Alchemy never applies `name` to an existing one.
    const site = yield* Cloudflare.Website.StaticSite("Site", {
      name: "rvnza",
      command: "bun run build",
      outdir: "dist",
      // Content comes from Notion at build time, so file hashes can't tell when to rebuild.
      memo: false,
      domain: "rvnza.com",
      // Mirrors the dashboard toggle; Alchemy re-uploads this on every deploy, so a dashboard-only change gets reset.
      observability: {
        enabled: true,
        logs: { enabled: true, invocationLogs: true, headSamplingRate: 1, persist: true },
      },
    });

    return { url: site.url };
  }),
);
