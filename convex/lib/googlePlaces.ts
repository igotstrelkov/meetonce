const GOOGLE_PLACES_BASE_URL =
  "https://places.googleapis.com/v1/places:searchText";

// Dublin city center coordinates
const DUBLIN_CENTER = {
  latitude: 53.3498,
  longitude: -6.2603,
};

export interface GooglePlaceResult {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
}

interface GooglePlacesApiResponse {
  places?: {
    id: string;
    displayName: { text: string };
    formattedAddress: string;
    location: {
      latitude: number;
      longitude: number;
    };
    rating?: number;
    userRatingCount?: number;
    priceLevel?: string;
  }[];
}

function mapPriceLevel(level?: string): number | undefined {
  if (!level) return undefined;
  const mapping: Record<string, number> = {
    PRICE_LEVEL_FREE: 0,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  };
  return mapping[level];
}

export async function searchCoffeeShops(
  query: string
): Promise<GooglePlaceResult[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY is not configured");
  }

  const response = await fetch(GOOGLE_PLACES_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel",
    },
    body: JSON.stringify({
      textQuery: query,
      includedType: "cafe",
      locationBias: {
        circle: {
          center: DUBLIN_CENTER,
          radius: 15000.0, // 15km radius to cover greater Dublin
        },
      },
      maxResultCount: 20,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Places API error: ${errorText}`);
  }

  const data: GooglePlacesApiResponse = await response.json();

  if (!data.places || data.places.length === 0) {
    return [];
  }

  return data.places.map((place) => ({
    placeId: place.id,
    name: place.displayName.text,
    address: place.formattedAddress,
    latitude: place.location.latitude,
    longitude: place.location.longitude,
    rating: place.rating,
    userRatingsTotal: place.userRatingCount,
    priceLevel: mapPriceLevel(place.priceLevel),
  }));
}
