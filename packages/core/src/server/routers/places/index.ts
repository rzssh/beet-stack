import { Elysia } from "elysia";
import { createAttachMiddleware } from "~/server/middleware/attach";
import {
  autocompleteSuggestion,
  placeDetails,
  placeDetailsParams,
  placesAutocompleteInput,
} from "~/server/schema/places";
import { placesService } from "./service";

export const placesRoutes = new Elysia({ prefix: "/places" })
  .use(createAttachMiddleware())
  .decorate("placesService", placesService)
  .model({
    autocompleteInput: placesAutocompleteInput,
    suggestion: autocompleteSuggestion,
    details: placeDetails,
    detailsParams: placeDetailsParams,
  })
  .guard({ auth: true }, (app) =>
    app
      .post(
        "/autocomplete",
        async ({ body, placesService, status }) => {
          try {
            const suggestions = await placesService.autocomplete(
              body.input,
              body.sessionToken,
              body.locationBias,
            );
            return suggestions;
          } catch (error) {
            console.error("Places autocomplete error:", error);
            return status(500, {
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to fetch autocomplete suggestions",
            });
          }
        },
        { body: "autocompleteInput" },
      )
      .get(
        "/:id/details",
        async ({ params, placesService, status }) => {
          try {
            const details = await placesService.getDetails(params.id);
            return details;
          } catch (error) {
            console.error("Place details error:", error);
            return status(500, {
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to fetch place details",
            });
          }
        },
        { params: "detailsParams" },
      ),
  );
