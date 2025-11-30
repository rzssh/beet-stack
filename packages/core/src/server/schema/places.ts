import { t } from "elysia";

export const placesAutocompleteInput = t.Object({
  input: t.String({ minLength: 2, maxLength: 200 }),
  sessionToken: t.String({ minLength: 1 }),
  locationBias: t.Optional(
    t.Object({
      circle: t.Object({
        center: t.Object({
          latitude: t.Number({ minimum: -90, maximum: 90 }),
          longitude: t.Number({ minimum: -180, maximum: 180 }),
        }),
        radius: t.Number({ minimum: 1, maximum: 50000 }),
      }),
    }),
  ),
});

export const placeDetailsParams = t.Object({
  id: t.String({ minLength: 1 }),
});

export const autocompleteSuggestion = t.Object({
  placeId: t.String(),
  description: t.String(),
  mainText: t.String(),
  secondaryText: t.Optional(t.String()),
});

export const placeDetails = t.Object({
  placeId: t.String(),
  address: t.String(),
  lat: t.Number(),
  lng: t.Number(),
  name: t.Optional(t.String()),
});
