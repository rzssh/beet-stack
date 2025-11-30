# Expo App Development Guide

## Core Principle: Ship Features, Not Docs

**Focus on:**
- Building working features iteratively
- Testing as you build (use seed data: `rider@taxi.app` / `rider123`, `driver@taxi.app` / `driver123`)
- Minimal abstractions - only create helpers when you need them 3+ times
- Backend-heavy - business logic stays on server, frontend is just UI

**Don't:**
- Create documentation files
- Over-engineer before you need it
- Create abstractions for future use cases
- Add features that weren't requested

## Project Architecture

This is a React Native Expo app using:
- **TanStack Form** - Form state management with validation
- **TanStack Query** - Server state management
- **Eden Treaty** - Type-safe API client from Elysia
- **NativeWind** - Tailwind CSS for React Native
- **Better Auth** - Authentication
- **React Native Maps** - Map rendering
- **Bottom Sheet** - Modal sheets with keyboard awareness
- **Keyboard Controller** - Advanced keyboard handling

## Core Principles

### 1. Server-First State Management

**Always prefer server state over local state**

Use shared hooks with Eden Treaty for server data:

```typescript
// apps/expo/src/hooks/useActiveRide.ts
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "~/lib/hooks";
import { rideQueries } from "~/utils/api";

export function useActiveRide() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    ...rideQueries.active(),
    enabled: isAuthenticated,
    refetchInterval: 5000,
  });
}
```

**Why shared hooks?**
- Single query instance (no duplicate network calls)
- Shared cache across components
- Automatic refetch coordination
- Type-safe across all consumers

### 2. Eden Treaty API Client

Located at `apps/expo/src/utils/api.tsx`, provides type-safe queries and mutations:

```typescript
import { treaty } from "@elysiajs/eden";
import { queryOptions } from "@tanstack/react-query";
import type { App as WebApp } from "@acme/web/app";

const api = treaty<WebApp>(getBaseUrl());

// Query factories
export const rideQueries = {
  active: () => queryOptions({
    queryKey: ["rides", "active"],
    queryFn: async () => {
      const res = await api.rides.active.get();
      if (res.error) throw new Error(res.error.value as string);
      return res.data;
    },
  }),
};

// Mutation factories
export const rideMutations = {
  request: () => ({
    mutationFn: async (data: RequestRideInput) => {
      const res = await api.rides.request.post(data);
      if (res.error) throw new Error(res.error.value as string);
      return res.data;
    },
  }),
};
```

### 3. State Management Hierarchy

**Use the right tool for the job:**

1. **Server State** → TanStack Query + Eden Treaty
   - User data, ride data, driver data
   - Always prefer shared hooks
   - Example: `useActiveRide()`, `useAuth()`

2. **Form State** → TanStack Form
   - Input values, validation, submission
   - Use `form.Subscribe` for reactive UI
   - Example: Login form, ride request form

3. **Local Component State** → useState/useReducer
   - UI-only state (modals, loading, focus)
   - Temporary state not needed elsewhere
   - Example: `isSearching`, `searchStartTime`

4. **Global State** → Zustand (sparingly)
   - Only for true global state shared via context
   - NOT for server data (use TanStack Query)
   - Example: Theme, user preferences

**Anti-pattern:**
```typescript
// ❌ DON'T - Duplicating server state in Zustand
const [rides, setRides] = useState([]);
useEffect(() => {
  fetchRides().then(setRides);
}, []);

// ✅ DO - Use shared query hook
const { data: rides } = useActiveRide();
```

## TanStack Form Patterns

### Form Validation

Validate at field or form level:

```typescript
import { useForm } from "@tanstack/react-form";

const form = useForm({
  defaultValues: {
    email: "",
    password: "",
  },
  validators: {
    onChange: ({ value }) => {
      if (!value.email) return { form: "Email is required" };
      if (!value.password) return { form: "Password is required" };
      return undefined;
    },
  },
  onSubmit: async ({ value }) => {
    await loginMutation.mutateAsync(value);
  },
});
```

**Field-level validation:**

```typescript
<form.Field
  name="email"
  validators={{
    onChange: ({ value }) =>
      !value.includes("@") ? "Invalid email" : undefined,
    onBlur: ({ value }) =>
      !value ? "Email is required" : undefined,
  }}
>
  {(field) => (
    <>
      <TextInput
        value={field.state.value}
        onChangeText={field.handleChange}
        onBlur={field.handleBlur}
      />
      {field.state.meta.errors.length > 0 && (
        <Text className="text-red-400">
          {field.state.meta.errors[0]}
        </Text>
      )}
    </>
  )}
</form.Field>
```

### Reactivity with form.Subscribe

**Use `form.Subscribe` for UI reactivity** to prevent unnecessary re-renders:

```typescript
<form.Subscribe
  selector={(state) => ({
    canSubmit: state.canSubmit,
    isSubmitting: state.isSubmitting,
  })}
>
  {({ canSubmit, isSubmitting }) => (
    <Button disabled={!canSubmit || isSubmitting}>
      {isSubmitting ? <Spinner /> : <Text>Submit</Text>}
    </Button>
  )}
</form.Subscribe>
```

**When to use:**
- `form.Subscribe` → UI rendering (optimized, scoped re-renders)
- `useStore(form.store, selector)` → Logic in component body

**Example from login screen** (`apps/expo/src/app/(auth)/login.tsx`):

```typescript
const form = useForm({
  defaultValues: {
    email: "",
    password: "",
  },
  onSubmit: async ({ value }) => {
    const res = await authClient.signIn.email(value);
    if (res.error) {
      setError(res.error.message);
    }
  },
});

return (
  <form.Field name="email">
    {(field) => (
      <TextInput
        value={field.state.value}
        onChangeText={field.handleChange}
      />
    )}
  </form.Field>
);
```

### Async Initial Values

Load initial values from server:

```typescript
import { useLocationContext } from "~/providers/LocationProvider";

const { location } = useLocationContext();

const form = useForm({
  defaultValues: {
    pickupLat: location?.latitude ?? null,
    pickupLng: location?.longitude ?? null,
  },
  onSubmit: async ({ value }) => {
    // Submit with loaded values
  },
});

// Update when async data arrives
useEffect(() => {
  if (location) {
    form.setFieldValue("pickupLat", location.latitude);
    form.setFieldValue("pickupLng", location.longitude);
  }
}, [location]);
```

## Keyboard Handling

### KeyboardAvoidingView

Use when you need to prevent keyboard from hiding inputs:

```typescript
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

<KeyboardAvoidingView
  behavior="padding"
  keyboardVerticalOffset={100}
>
  <TextInput />
</KeyboardAvoidingView>
```

**Use cases:** Forms, chat interfaces

### KeyboardStickyView

For elements that stick to keyboard (like input toolbars):

```typescript
import { KeyboardStickyView } from "react-native-keyboard-controller";

<KeyboardStickyView offset={0}>
  <View className="border-t border-zinc-700 bg-zinc-800 p-4">
    <Button>Send</Button>
  </View>
</KeyboardStickyView>
```

**Use cases:** Chat send button, form action bars

### KeyboardAwareScrollView

For scrollable content with multiple inputs:

```typescript
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

<KeyboardAwareScrollView
  bottomOffset={40}
  extraKeyboardSpace={20}
>
  {/* Multiple form fields */}
</KeyboardAwareScrollView>
```

**Use cases:** Long forms, scrollable lists with inputs

## Bottom Sheet Patterns

### Basic Setup

**IMPORTANT:** Let the bottom sheet handle keyboard automatically. Don't manually control snap points when keyboard appears.

```typescript
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";

const bottomSheetRef = useRef<BottomSheet>(null);
const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

<BottomSheet
  ref={bottomSheetRef}
  index={1} // Start at middle snap point
  snapPoints={snapPoints}
  enablePanDownToClose={false} // Prevent accidental closing
  keyboardBehavior="extend" // Let keyboard extend the sheet
  keyboardBlurBehavior="restore" // Restore position when keyboard dismissed
  android_keyboardInputMode="adjustResize"
  backgroundStyle={{ backgroundColor: "#18181b" }}
  handleIndicatorStyle={{ backgroundColor: "#71717a" }}
>
  <BottomSheetScrollView
    contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
  >
    {/* Scrollable content */}
  </BottomSheetScrollView>
</BottomSheet>
```

**For non-scrollable content, use `BottomSheetView`:**

```typescript
import { BottomSheetView } from "@gorhom/bottom-sheet";

<BottomSheet ref={bottomSheetRef} snapPoints={snapPoints}>
  <BottomSheetView style={{ flex: 1, padding: 16 }}>
    {/* Non-scrollable content */}
  </BottomSheetView>
</BottomSheet>
```

### Keyboard-Aware Inputs

Always use `BottomSheetTextInput` inside bottom sheets:

```typescript
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";

<BottomSheetTextInput
  style={{
    backgroundColor: "#27272a",
    borderRadius: 12,
    padding: 16,
    color: "#fff",
  }}
  placeholder="Type here..."
  placeholderTextColor="#71717a"
/>
```

### DON'T Manually Control Snap Points for Keyboard

**❌ ANTI-PATTERN - This causes issues:**

```typescript
// DON'T DO THIS - conflicts with keyboard handling
const [isInputFocused, setIsInputFocused] = useState(false);

useEffect(() => {
  if (isInputFocused) {
    bottomSheetRef.current?.snapToIndex(1);
  } else {
    bottomSheetRef.current?.snapToIndex(0);
  }
}, [isInputFocused]);
```

**✅ CORRECT - Trust the bottom sheet's keyboard handling:**

```typescript
// Set keyboardBehavior="extend" and let it handle everything
<BottomSheet
  keyboardBehavior="extend"
  keyboardBlurBehavior="restore"
>
  <BottomSheetTextInput /> {/* Keyboard handled automatically */}
</BottomSheet>
```

### Programmatic Control (Non-Keyboard)

Use these methods for non-keyboard interactions:

```typescript
const bottomSheetRef = useRef<BottomSheet>(null);

// Expand to max
bottomSheetRef.current?.expand();

// Collapse to min
bottomSheetRef.current?.collapse();

// Go to specific index
bottomSheetRef.current?.snapToIndex(2);

// Close completely
bottomSheetRef.current?.close();
```

### Autocomplete Lists

Use `BottomSheetFlatList` for suggestion lists:

```typescript
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";

<BottomSheetFlatList
  data={suggestions}
  keyExtractor={(item) => item.id}
  keyboardShouldPersistTaps="handled"
  style={{ maxHeight: 300 }}
  renderItem={({ item }) => (
    <Pressable onPress={() => handleSelect(item)}>
      <Text>{item.label}</Text>
    </Pressable>
  )}
/>
```

## Styling Guidelines

### NativeWind Dark Theme

**Consistent color palette:**

```typescript
// Backgrounds
bg-zinc-900   // Main background
bg-zinc-800   // Cards, inputs
bg-zinc-700   // Borders, dividers

// Text
text-white          // Primary text
text-zinc-400       // Muted text
text-zinc-500       // Disabled text

// Inputs
bg-zinc-800 border-zinc-700           // Default
border-zinc-600                       // Focused
bg-zinc-800/50                        // Disabled

// Status colors
text-green-400 bg-green-500           // Success
text-red-400 bg-red-900/20 border-red-700  // Error
text-blue-400 bg-blue-500             // Info
```

### Spacing Conventions

```typescript
gap-4        // Between elements (16px)
p-4          // Card padding
px-5 py-4    // Input padding
rounded-xl   // Border radius (12px)
rounded-full // Pills, avatars
```

### Avoid These Tailwind Classes

**❌ DON'T USE:**
- `tracking-*` - Breaks UI rendering in React Native
- `leading-*` - Use `lineHeight` in style prop instead
- `font-*` weights above 700 - Limited font weights available

**✅ USE INSTEAD:**
```typescript
// For line height
<Text style={{ lineHeight: 24 }}>Content</Text>

// For letter spacing
<Text style={{ letterSpacing: 0.5 }}>Content</Text>
```

### Component Styling Example

```typescript
<View className="gap-4 p-4">
  <View className="rounded-xl bg-zinc-800 border-2 border-zinc-700">
    <View className="p-4">
      <Text className="text-white font-semibold">Title</Text>
      <Text className="text-zinc-400 text-sm mt-1">Description</Text>
    </View>
  </View>

  <Button className="rounded-xl bg-blue-500">
    <Text className="text-white font-semibold">Action</Text>
  </Button>
</View>
```

## File Structure Conventions

```
apps/expo/src/
├── app/                    # File-based routing (Expo Router)
│   ├── (auth)/            # Auth group
│   │   ├── login.tsx      # ✅ Example: TanStack Form usage
│   │   └── register.tsx
│   ├── (tabs)/            # Tab navigation
│   └── index.tsx          # Home screen
├── components/
│   ├── ui/                # Reusable UI components
│   ├── forms/             # Form-specific components
│   └── ride/              # Feature-specific components
├── hooks/
│   ├── useActiveRide.ts   # ✅ Shared query hook pattern
│   ├── usePlacesAutocomplete.ts
│   └── useDirections.ts
├── lib/
│   ├── auth/              # Auth client setup
│   └── hooks/             # Shared hooks (useAuth, etc.)
├── providers/             # Context providers
│   └── LocationProvider.tsx
├── utils/
│   └── api.tsx            # ✅ Eden Treaty API client
└── types/                 # TypeScript types
```

### Naming Conventions

- **Files**: kebab-case (`ride-request-form.tsx`)
- **Components**: PascalCase (`RideRequestForm`)
- **Hooks**: camelCase with `use` prefix (`useActiveRide`)
- **Utilities**: camelCase (`formatElapsed`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

## Ride Flow (Complete Implementation)

**Backend:** `packages/core/src/server/routers/rides/`
- State machine: `requested` → `accepted` → `driver_arrived` → `in_progress` → `completed` | `cancelled`
- All endpoints exist: request, accept, arrived, start, complete, cancel, rate
- Business logic enforced on server

**Frontend Components:**
- **RideRequestForm** - Rider requests ride with autocomplete
- **DriverDashboard** - Driver sees/accepts pending rides (polls every 5s)
- **DriverRideController** - Driver action buttons (arrived, start, complete)
- **RiderStatusDisplay** - Rider sees real-time status + driver info
- **RideRating** - 5-star rating after completion

**API Integration:** `src/utils/api.tsx`
- All mutations/queries already defined
- Use `rideMutations.accept()`, `rideMutations.start()`, etc.
- Use `useActiveRide()` shared hook for active ride (polls every 5s)

**Testing:**
- Seed data: `bun run db:seed` in `packages/db`
- Accounts: `rider@taxi.app` / `rider123`, `driver@taxi.app` / `driver123`
- Backend: `cd apps/server && bun run dev`
- App: `cd apps/expo && bun run ios`

## Example Files to Reference

### ✅ Login Screen - Forms Done Right

**File:** `apps/expo/src/app/(auth)/login.tsx`

**What it shows:**
- TanStack Form setup with validation
- Error handling and display
- Integration with Better Auth
- Clean UI with NativeWind
- Proper button disabled states

**Pattern to follow:**
```typescript
const form = useForm({
  defaultValues: { email: "", password: "" },
  onSubmit: async ({ value }) => {
    const res = await authClient.signIn.email(value);
    // Handle response
  },
});
```

### ✅ API Client - Type-Safe Queries

**File:** `apps/expo/src/utils/api.tsx`

**What it shows:**
- Eden Treaty setup
- Query factories with queryOptions
- Mutation factories
- Error handling pattern
- Type inference from backend

**Pattern to follow:**
```typescript
export const featureQueries = {
  list: () => queryOptions({
    queryKey: ["feature", "list"],
    queryFn: async () => {
      const res = await api.feature.get();
      if (res.error) throw new Error(res.error.value as string);
      return res.data;
    },
  }),
};
```

### ✅ Shared Hook - Server State

**File:** `apps/expo/src/hooks/useActiveRide.ts` (to be created)

**What it shows:**
- Wrapping query factory in hook
- Enabling/disabling based on auth
- Polling interval for real-time data
- Reusable across components

**Pattern to follow:**
```typescript
export function useFeatureData() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    ...featureQueries.list(),
    enabled: isAuthenticated,
    refetchInterval: 5000,
  });
}
```

### ✅ Location Provider - Async Context

**File:** `apps/expo/src/providers/LocationProvider.tsx`

**What it shows:**
- Async data via context
- Permission handling
- Background tracking
- Loading states

**Pattern to use:**
```typescript
const { location, isLoading, hasPermission } = useLocationContext();

// Wait for location before using
if (!location) return <Spinner />;
```

## Common Patterns

### 1. Debounced Search

```typescript
import { useMemo, useRef, useState } from "react";

const DEBOUNCE_MS = 300;

export function useDebounced(value: string) {
  const [debouncedValue, setDebouncedValue] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout>();

  useMemo(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!value || value.length < 2) {
      setDebouncedValue("");
      return;
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value]);

  return debouncedValue;
}
```

### 2. Elapsed Timer

```typescript
const [elapsed, setElapsed] = useState(0);
const [startTime, setStartTime] = useState<number | null>(null);

useEffect(() => {
  if (!startTime) return;

  const interval = setInterval(() => {
    setElapsed(Math.floor((Date.now() - startTime) / 1000));
  }, 1000);

  return () => clearInterval(interval);
}, [startTime]);

// Format: "0:45"
const formatElapsed = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};
```

### 3. Conditional Rendering with Queries

```typescript
const query = useFeatureData();

if (query.isLoading) return <Spinner />;
if (query.error) return <ErrorCard message={query.error.message} />;
if (!query.data) return <EmptyState />;

return <DataView data={query.data} />;
```

### 4. Mutation with Optimistic Updates

```typescript
const queryClient = useQueryClient();

const mutation = useMutation({
  ...featureMutations.create(),
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ["feature"] });
    const previous = queryClient.getQueryData(["feature"]);
    queryClient.setQueryData(["feature"], (old) => [...old, newData]);
    return { previous };
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(["feature"], context.previous);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["feature"] });
  },
});
```

## Anti-Patterns to Avoid

### ❌ DON'T: Duplicate Server State

```typescript
// ❌ Bad - storing server data in local state
const [userData, setUserData] = useState(null);
useEffect(() => {
  fetchUser().then(setUserData);
}, []);

// ✅ Good - use shared query hook
const { data: userData } = useAuth();
```

### ❌ DON'T: Use Zustand for Server Data

```typescript
// ❌ Bad - server data in Zustand
const useRideStore = create((set) => ({
  activeRide: null,
  setActiveRide: (ride) => set({ activeRide: ride }),
}));

// ✅ Good - use TanStack Query
const { data: activeRide } = useActiveRide();
```

### ❌ DON'T: Put Logic in Render

```typescript
// ❌ Bad - side effects in render
if (placeDetailsQuery.data) {
  field.handleChange(placeDetailsQuery.data.address);
  onPlaceSelected?.(placeDetailsQuery.data);
}

// ✅ Good - use useEffect
useEffect(() => {
  if (placeDetailsQuery.data) {
    field.handleChange(placeDetailsQuery.data.address);
    onPlaceSelected?.(placeDetailsQuery.data);
  }
}, [placeDetailsQuery.data]);
```

### ❌ DON'T: Forget Cleanup

```typescript
// ❌ Bad - memory leak
const interval = setInterval(() => {
  setElapsed(elapsed + 1);
}, 1000);

// ✅ Good - cleanup on unmount
useEffect(() => {
  const interval = setInterval(() => {
    setElapsed((prev) => prev + 1);
  }, 1000);

  return () => clearInterval(interval);
}, []);
```

### ❌ DON'T: Use Regular TextInput in Bottom Sheets

```typescript
// ❌ Bad - breaks keyboard behavior
import { TextInput } from "react-native";
<TextInput />

// ✅ Good - use BottomSheet components
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
<BottomSheetTextInput />
```

## Performance Best Practices

### 1. Use form.Subscribe for Reactive UI

```typescript
// ❌ Slow - causes full component re-render
const canSubmit = useStore(form.store, (state) => state.canSubmit);

// ✅ Fast - scoped re-render
<form.Subscribe selector={(state) => state.canSubmit}>
  {(canSubmit) => <Button disabled={!canSubmit} />}
</form.Subscribe>
```

### 2. Memoize Expensive Computations

```typescript
const snapPoints = useMemo(() => ["30%", "90%"], []);
const markers = useMemo(() =>
  drivers.map(d => ({ id: d.id, coordinate: d.location })),
  [drivers]
);
```

### 3. Use Virtualized Lists

```typescript
// ✅ Good for long lists
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";

<BottomSheetFlatList
  data={suggestions}
  renderItem={({ item }) => <SuggestionItem item={item} />}
  keyExtractor={(item) => item.id}
/>
```

### 4. Set Query Stale Times

```typescript
queryOptions({
  queryKey: ["autocomplete", input],
  queryFn: fetchSuggestions,
  staleTime: 5 * 60 * 1000,  // 5 minutes
  gcTime: 10 * 60 * 1000,     // 10 minutes
});
```

## Development Workflow

### 1. Adding a New Feature

1. **Identify state type** - Server state? Form state? Local state?
2. **Create shared hook** if server state
3. **Build component** with proper subscriptions
4. **Style with NativeWind** following dark theme
5. **Test on iOS and Android**

### 2. Adding API Integration

1. **Add route to backend** in `packages/core/src/server/routers/`
2. **Add query/mutation factory** in `apps/expo/src/utils/api.tsx`
3. **Create shared hook** in `apps/expo/src/hooks/`
4. **Use in component** with proper loading/error states

### 3. Debugging Tips

```typescript
// Log query state
console.log("Query:", {
  isLoading: query.isLoading,
  isFetching: query.isFetching,
  data: query.data,
  error: query.error,
});

// Log form state
console.log("Form:", form.state.values, form.state.errors);

// Use React DevTools
// Use React Query DevTools (web only)
```

## Quick Reference

### When to Use What

| Need | Tool | Example |
|------|------|---------|
| Server data | TanStack Query + shared hook | `useActiveRide()` |
| Form inputs | TanStack Form | `useForm()` |
| Global UI state | Zustand (sparingly) | Theme, preferences |
| Local UI state | useState | Modal open, focus |
| Async context | React Context | `useLocationContext()` |
| Validation | TanStack Form validators | `onChange`, `onBlur` |
| Optimistic updates | TanStack Query mutations | `onMutate`, `onError` |
| Debouncing | useMemo + setTimeout | Search input |
| Keyboard handling | react-native-keyboard-controller | `KeyboardAvoidingView` |
| Bottom sheets | @gorhom/bottom-sheet | `BottomSheet` |

### Import Paths

```typescript
// Absolute imports with ~/
import { Button } from "~/components/ui";
import { useAuth } from "~/lib/hooks";
import { rideQueries } from "~/utils/api";

// Never use relative imports
import { Button } from "../../components/ui";  // ❌
```

---

**Remember:** Keep it simple, leverage the tools we have, and follow the patterns. When in doubt, check the example files listed above.
