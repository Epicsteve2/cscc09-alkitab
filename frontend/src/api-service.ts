import {
  ALKITAB_BACKEND_PORT,
  ALKITAB_BACKEND_URL,
  currentUser,
  notifications,
} from "./stores";

import { navigate } from "svelte-routing";

export async function register(
  username: string,
  password: string
): Promise<Object> {
  const response = await self.fetch(
    `http://${ALKITAB_BACKEND_URL}:${ALKITAB_BACKEND_PORT}/api/users/register`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
      credentials: "include",
    }
  );

  if (response.ok) {
    let registerResponse = await response.json();
    currentUser.set(registerResponse.username);
    navigate("/", { replace: true });
    return registerResponse;
  } else {
    let errorMessage: string = await response.text();
    notifications.addNotification("Register error", errorMessage);
    throw new Error(errorMessage);
  }
}

export async function login(
  username: string,
  password: string
): Promise<Object> {
  const response = await self.fetch(
    `http://${ALKITAB_BACKEND_URL}:${ALKITAB_BACKEND_PORT}/api/users/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
      credentials: "include",
    }
  );

  if (response.ok) {
    let loginResponse = await response.json();
    currentUser.set(loginResponse.username);
    navigate("/", { replace: true });
    return loginResponse;
  } else {
    let errorMessage: string = await response.text();
    notifications.addNotification("Login error", errorMessage);
    throw new Error(errorMessage);
  }
}
