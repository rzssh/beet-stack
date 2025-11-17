import { t } from "elysia";

export const countResponseModel = t.Object(
	{
		count: t.Number(),
	},
	{
		description: "Count response",
	},
);

export const countIncrementResponseModel = t.Object(
	{
		success: t.Boolean(),
		message: t.String(),
		count: t.Number(),
	},
	{
		description: "Count increment response",
	},
);
