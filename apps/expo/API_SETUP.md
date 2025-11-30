# API Setup Guide for Expo App

This guide walks you through setting up all required APIs for the ride-sharing app.

## Required APIs

1. **Google Maps SDK for iOS/Android** - For map rendering
2. **Google Places API** - For location autocomplete
3. **Google Directions API** - For route calculation
4. **Google Maps JavaScript API** (optional) - For web fallback

## Step 1: Enable Google Cloud APIs

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your Project ID

### 1.2 Enable Required APIs

Navigate to **APIs & Services > Library** and enable:

1. **Maps SDK for Android**
   - Search for "Maps SDK for Android"
   - Click "Enable"

2. **Maps SDK for iOS**
   - Search for "Maps SDK for iOS"
   - Click "Enable"

3. **Places API (New)**
   - Search for "Places API (New)"
   - Click "Enable"
   - ⚠️ Make sure to enable the NEW version, not the legacy one

4. **Directions API**
   - Search for "Directions API"
   - Click "Enable"

5. **Geocoding API** (recommended)
   - Search for "Geocoding API"
   - Click "Enable"

## Step 2: Create API Keys

### 2.1 Create API Key for Mobile

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > API Key**
3. Name it "Expo Mobile App Key"
4. Click **Restrict Key** (important for security)
5. Under **Application restrictions**, select **Android apps** or **iOS apps**
6. Under **API restrictions**, select:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API (New)
   - Directions API
   - Geocoding API
7. Click **Save**
8. Copy the API key

### 2.2 Optional: Create Separate Keys

For better security and billing tracking, create separate keys for:
- iOS app
- Android app
- Each API (Places, Directions)

## Step 3: Configure Environment Variables

### 3.1 Update `app.config.ts`

Open `/Users/razen/projects/tanstack-start-elysia-better-auth-bun/apps/expo/app.config.ts`:

```typescript
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  android: {
    ...config.android,
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
  },
  ios: {
    ...config.ios,
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    },
  },
  extra: {
    ...config.extra,
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
});
```

### 3.2 Create `.env` File

Create `/Users/razen/projects/tanstack-start-elysia-better-auth-bun/apps/expo/.env`:

```bash
# Google Maps API Key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE

# Optional: Separate keys for better tracking
# EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=YOUR_PLACES_KEY
# EXPO_PUBLIC_GOOGLE_DIRECTIONS_API_KEY=YOUR_DIRECTIONS_KEY
```

### 3.3 Add to `.gitignore`

Ensure `.env` is in your `.gitignore`:

```
# Environment variables
.env
.env.local
.env.*.local
```

## Step 4: Install Required Packages

The following packages should already be installed:

```bash
# Maps
npx expo install react-native-maps

# Google Sign-In (if using)
npx expo install @react-native-google-signin/google-signin
```

## Step 5: Verify API Key Access

### 5.1 Check in Code

The API key is accessed in `/Users/razen/projects/tanstack-start-elysia-better-auth-bun/apps/expo/src/hooks/usePlacesAutocomplete.ts`:

```typescript
const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey;
```

And in `/Users/razen/projects/tanstack-start-elysia-better-auth-bun/apps/expo/src/hooks/useDirections.ts`:

```typescript
const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey;
```

### 5.2 Test API Key

Run this command to verify your API key works:

```bash
curl "https://maps.googleapis.com/maps/api/directions/json?origin=Toronto&destination=Montreal&key=YOUR_API_KEY"
```

You should get a JSON response with route data, not an error.

## Step 6: Configure Billing (Required!)

⚠️ **IMPORTANT**: Google Maps APIs require billing to be enabled, even for the free tier.

1. Go to **Billing** in Google Cloud Console
2. Link a billing account to your project
3. Set up budget alerts (recommended: $50/month alert)

### API Pricing (as of 2024)

- **Maps SDK**: $7 per 1,000 loads (free: 28,000 per month)
- **Places API**: $17 per 1,000 requests (free: varies by request type)
- **Directions API**: $5 per 1,000 requests (free: 40,000 per month)
- **Geocoding API**: $5 per 1,000 requests (free: 40,000 per month)

Free tier is usually sufficient for development and small apps.

## Step 7: Secure Your API Keys

### 7.1 Add Application Restrictions

For Android:
1. Get your SHA-1 fingerprint: `eas credentials`
2. Add it to API key restrictions

For iOS:
1. Get your Bundle ID from `app.json`
2. Add it to API key restrictions

### 7.2 Add API Restrictions

Always restrict keys to only the APIs you need:
- ✅ Places API (New)
- ✅ Directions API
- ✅ Maps SDK for Android
- ✅ Maps SDK for iOS
- ❌ Don't allow all APIs

### 7.3 Set Usage Quotas

1. Go to **APIs & Services > Quotas**
2. Set reasonable limits for each API
3. Example: 10,000 requests/day for Places API

## Step 8: Test the Setup

### 8.1 Start the Expo App

```bash
cd apps/expo
npx expo start
```

### 8.2 Verify Each Feature

1. **Map Renders**: You should see the dark-themed map
2. **Current Location**: Blue dot showing your location
3. **Autocomplete**: Type in dropoff location, see suggestions
4. **Directions**: Select a location, see the blue route line
5. **Markers**: See pickup (green 📍) and dropoff (red 🎯) markers

### 8.3 Check Console for Errors

Common errors:
- `API key not found` - Check `.env` file
- `API not enabled` - Enable the API in Google Cloud Console
- `Billing not enabled` - Add billing account
- `Quota exceeded` - Increase quotas or check for API abuse

## Troubleshooting

### Map Not Showing

**iOS:**
```bash
cd ios
pod install
cd ..
npx expo run:ios
```

**Android:**
- Check `android/app/src/main/AndroidManifest.xml` for API key
- Rebuild: `npx expo run:android`

### Autocomplete Not Working

1. Verify Places API (New) is enabled (not legacy)
2. Check API key in console: `Constants.expoConfig?.extra?.googleMapsApiKey`
3. Check network tab for 403 errors (API key issue)
4. Verify billing is enabled

### Directions Not Showing

1. Verify Directions API is enabled
2. Check console for polyline decode errors
3. Verify coordinates are valid (lat/lng in valid range)

### General API Issues

1. **Check quotas**: Navigate to **APIs & Services > Quotas & System Limits**
2. **Check billing**: Navigate to **Billing > Overview**
3. **Check usage**: Navigate to **APIs & Services > Dashboard**

## Environment Variables Summary

Required in `apps/expo/.env`:

```bash
# Google Maps (REQUIRED)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here

# Backend URLs (already configured)
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_WS_URL=ws://localhost:3000
```

## Next Steps

After setup:
1. Test ride request flow end-to-end
2. Monitor API usage in Google Cloud Console
3. Set up alerts for quota limits
4. Consider implementing API key rotation for production

## Cost Optimization Tips

1. **Cache Results**: The app already caches:
   - Autocomplete: 5 minutes
   - Place details: 1 hour
   - Directions: 5 minutes

2. **Debounce Requests**: Already implemented (300ms for autocomplete)

3. **Use Session Tokens**: Already implemented in `usePlacesAutocomplete`

4. **Restrict Keys**: Always use application and API restrictions

5. **Monitor Usage**: Set up daily budget alerts

## Production Checklist

Before deploying to production:
- [ ] API keys are restricted by application (iOS Bundle ID / Android SHA-1)
- [ ] API keys are restricted by API (only enabled APIs)
- [ ] Billing alerts are set up
- [ ] Usage quotas are configured
- [ ] `.env` files are in `.gitignore`
- [ ] Separate keys for dev/staging/production
- [ ] Key rotation strategy is in place
- [ ] Error tracking is enabled (Sentry, etc.)

## Support

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Google Maps Platform Support](https://developers.google.com/maps/support)
- [Places API (New) Migration Guide](https://developers.google.com/maps/documentation/places/web-service/op-overview)
