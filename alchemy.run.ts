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
      // shortcut: domain left off for one deploy, since the old Worker holds rvnza.com until it's deleted; add `domain: "rvnza.com"` back right after.
    });

    return { url: site.url };
  }),
);
