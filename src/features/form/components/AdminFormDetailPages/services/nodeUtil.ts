import type { InternalNode } from "@xyflow/react";

export const getIntersectionPoint = (source: InternalNode, target: InternalNode) => {
	const sw = source.measured?.width || 0;
	const sh = source.measured?.height || 0;
	const tw = target.measured?.width || 0;
	const th = target.measured?.height || 0;

	const csx = source.internals.positionAbsolute.x + sw / 2;
	const csy = source.internals.positionAbsolute.y + sh / 2;
	const ctx = target.internals.positionAbsolute.x + tw / 2;
	const cty = target.internals.positionAbsolute.y + th / 2;

	const angle = Math.atan2(cty - csy, ctx - csx);
	const sourceInnerLength = Math.min(sw / 2 / Math.abs(Math.cos(angle)), sh / 2 / Math.abs(Math.sin(angle)));
	const targetInnerLength = Math.min(tw / 2 / Math.abs(Math.cos(angle)), th / 2 / Math.abs(Math.sin(angle)));
	const sourceRadius = sourceInnerLength;
	const targetRadius = targetInnerLength;

	const sx = csx + sourceRadius * Math.cos(angle);
	const sy = csy + sourceRadius * Math.sin(angle);
	const tx = ctx - targetRadius * Math.cos(angle);
	const ty = cty - targetRadius * Math.sin(angle);

	return { sx: sx, sy: sy, tx: tx, ty: ty };
};
