import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#18181b" },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "600" },
        contentStyle: { backgroundColor: "#09090B" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Profile",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="personal-data"
        options={{
          title: "Personal Data",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="saved-addresses"
        options={{
          title: "Saved Addresses",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="billing"
        options={{
          title: "Billing",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="connected-accounts"
        options={{
          title: "Connected Accounts",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="driver-registration"
        options={{
          title: "Become a Driver",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="security"
        options={{
          title: "Security",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}
