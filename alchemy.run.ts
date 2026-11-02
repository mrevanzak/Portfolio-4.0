import * as Cloudflare from "@alchemy.run/cloudflare";
import * as Alchemy from "alchemy";
import * as Output from "alchemy/Output";
import * as Effect from "effect/Effect";

export default Alchemy.Stack(
  "Portfolio",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    // The site is assets-only, so no Worker code runs and Workers observability stays at 0;
    // page views come from the Web Analytics beacon instead.
    const analytics = yield* Cloudflare.Rum.Site("Analytics", { host: "rvnza.com" });

    const site = yield* Cloudflare.Website.StaticSite("Website", {
      // Renaming replaces the Worker: a new one is created, the domain moves over, the old one is deleted.
      name: "rvnza",
      command: Output.interpolate`PUBLIC_CF_BEACON_TOKEN=${analytics.siteToken} bun run build`,
      outdir: "dist",
      // Content comes from Notion at build time, so file hashes can't tell when to rebuild.
      memo: false,
      domain: "rvnza.com",
    });

    return { url: site.url };
  }),
);
