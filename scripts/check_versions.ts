import denoMetadata from "../deno.json" with { type: "json" };
import pkgMetadata from "../package.json" with { type: "json" };

if (Deno.args.includes("--help") || Deno.args.includes("-h")) {
  console.log("Usage: deno task check-versions [--help|-h] [--fix|-f]");
  console.log("Checks that deno.json and package.json have the same version.");
  console.log(
    "If --fix or -f is provided, it will sync package.json version to deno.json.",
  );
  Deno.exit(0);
}

const fix = Deno.args.includes("--fix") || Deno.args.includes("-f");

const denoVersion = denoMetadata.version;
const pkgVersion = pkgMetadata.version;

if (denoVersion !== pkgVersion) {
  console.error(
    "Version mismatch: deno.json has %o, package.json has %o",
    denoVersion,
    pkgVersion,
  );

  if (fix) {
    const pkgJsonPath = new URL("../package.json", import.meta.url);
    const pkgJson = JSON.parse(await Deno.readTextFile(pkgJsonPath));
    pkgJson.version = denoVersion;
    await Deno.writeTextFile(
      pkgJsonPath,
      JSON.stringify(pkgJson, null, 2) + "\n",
    );
    console.error(
      "Fixed: synced package.json version to %o. Please commit the changes.",
      denoVersion,
    );
  } else {
    Deno.exit(1);
  }
} else {
  console.log("Versions are in sync: %o", denoVersion);
}
