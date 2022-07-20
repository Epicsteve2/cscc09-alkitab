import { writable } from "svelte/store";

export const ALKITAB_BACKEND_URL: String =
  import.meta.env.VITE_ALKITAB_BACKEND_URL || "localhost";
export const ALKITAB_BACKEND_PORT: String =
  import.meta.env.VITE_ALKITAB_BACKEND_PORT || "8080";

export const currentUser = writable("");
