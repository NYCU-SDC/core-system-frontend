import type { BuildMetaOptions, BuildMetaResult } from "./buildMeta.shared.js";
import { buildMeta as buildMetaShared } from "./buildMeta.shared.js";

export type { BuildMetaOptions, BuildMetaResult };

export function buildMeta(options: BuildMetaOptions): BuildMetaResult {
	return buildMetaShared(options);
}
