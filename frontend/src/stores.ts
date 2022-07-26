import { writable, Writable } from "svelte/store";

export const ALKITAB_BACKEND_URL: String =
  import.meta.env.VITE_ALKITAB_BACKEND_URL || "localhost";
export const ALKITAB_BACKEND_PORT: String =
  import.meta.env.VITE_ALKITAB_BACKEND_PORT || "8010";

export const currentUser = writable("");

interface NotifcationInterface {
  header: string;
  body: string;
}

function createNotifications() {
  const { subscribe, update }: Writable<NotifcationInterface[]> = writable([]);

  return {
    subscribe,
    addNotification: (header: string, body: string) =>
      update(
        (oldNotifications) =>
          (oldNotifications = [...oldNotifications, { header, body }])
      ),
  };
}

export const notifications = createNotifications();
