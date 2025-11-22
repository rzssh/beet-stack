import * as SecureStore from "expo-secure-store";
import { createMobileAuthClient } from "@acme/auth/client";

import { getBaseUrl } from "./base-url";

export const authClient = createMobileAuthClient(getBaseUrl(), SecureStore);
