import { t } from "elysia";

export const messageModel = t.Object(
	{
		title: t.String({
			minLength: 1,
			description: "Message title",
		}),
		content: t.String({
			minLength: 1,
			description: "Message content",
		}),
	},
	{
		description: "Message payload",
	},
);

export const messageUpdateModel = t.Object(
	{
		title: t.String({
			minLength: 1,
			description: "Message title",
		}),
		content: t.String({
			minLength: 1,
			description: "Message content",
		}),
	},
	{
		description: "Message update payload",
	},
);

export const messageIdParam = t.Object(
	{
		id: t.String({
			description: "Message ID",
		}),
	},
	{
		description: "Message ID parameter",
	},
);
