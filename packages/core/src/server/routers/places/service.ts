import { env } from "~/env";

export interface LocationBias {
  circle: {
    center: {
      latitude: number;
      longitude: number;
    };
    radius: number;
  };
}

export interface AutocompleteSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText?: string;
}

export interface PlaceDetails {
  placeId: string;
  address: string;
  lat: number;
  lng: number;
  name?: string;
}

export class PlacesService {
  private readonly apiKey = env.GOOGLE_MAPS_API_KEY;
  private readonly autocompleteUrl =
    "https://places.googleapis.com/v1/places:autocomplete";
  private readonly detailsUrlTemplate =
    "https://places.googleapis.com/v1/places";

  async autocomplete(
    input: string,
    sessionToken: string,
    locationBias?: LocationBias,
  ): Promise<AutocompleteSuggestion[]> {
    const requestBody: any = {
      input,
      sessionToken,
      languageCode: "en",
    };

    if (locationBias) {
      requestBody.locationBias = locationBias;
    }

    const response = await fetch(this.autocompleteUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": this.apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Places autocomplete failed: ${response.status} ${errorText}`,
      );
    }

    const data = await response.json();

    if (!data.suggestions || !Array.isArray(data.suggestions)) {
      return [];
    }

    return data.suggestions.map((suggestion: any) => ({
      placeId:
        suggestion.placePrediction?.placeId ??
        suggestion.placePrediction?.place,
      description: suggestion.placePrediction?.text?.text ?? "",
      mainText:
        suggestion.placePrediction?.structuredFormat?.mainText?.text ?? "",
      secondaryText:
        suggestion.placePrediction?.structuredFormat?.secondaryText?.text,
    }));
  }

  async getDetails(placeId: string): Promise<PlaceDetails> {
    const url = `${this.detailsUrlTemplate}/${placeId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": this.apiKey,
        "X-Goog-FieldMask":
          "id,displayName,formattedAddress,location,addressComponents",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Place details failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (!data.location?.latitude || !data.location?.longitude) {
      throw new Error("Place has no valid location");
    }

    return {
      placeId: data.id ?? placeId,
      address: data.formattedAddress ?? "",
      lat: data.location.latitude,
      lng: data.location.longitude,
      name: data.displayName?.text,
    };
  }
}

export const placesService = new PlacesService();
