import { writable } from "svelte/store";

export const ALKITAB_BACKEND_URL: String =
  import.meta.env.VITE_ALKITAB_BACKEND_URL || "localhost";
export const ALKITAB_BACKEND_PORT: String =
  import.meta.env.VITE_ALKITAB_BACKEND_PORT || "3000";

//   export let apiService = () => {
//   let module = {};
//   const send = async (method: string, url: string, data: object) => {
//     const config = {
//       method: method,
//     };
//     if (!["GET", "DELETE"].includes(method)) {
//       config.headers = {
//         "Content-Type": "application/json",
//       };
//       if (data) config.body = JSON.stringify(data);
//     }

//     return fetch(url, config).then((response) => response.json());
//   };

//   module.sendFiles = async (method: string, url: string, data: object) => {
//     const config = {
//       method: method,
//     };

//     const formData = new FormData();
//     for (const [key, value] of Object.entries(data)) {
//       formData.append(key, value);
//     }

//     config.body = formData;

//     return fetch(url, config).then((response) => response.json());
//   };

//   const register = async (username: string, password: string) => {
//     return send("POST", "/api/users/register", {
//       username: username,
//       password: password,
//     });
//   };
// };
