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

interface BookList {
  _id: string;
  user: string;
  sharedUsers: any[];
  bookPost: string;
  title: string;
  numPages: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export async function getBooks(): Promise<BookList[]> {
  const response = await self.fetch(
    `http://${ALKITAB_BACKEND_URL}:${ALKITAB_BACKEND_PORT}/api/library`,
    { method: "GET", credentials: "include" }
  );

  if (response.ok) {
    let bookList: BookList[] = await response.json();
    return bookList;
  } else {
    let errorMessage: string = await response.text();
    notifications.addNotification("Getting books error", errorMessage);
    throw new Error(errorMessage);
  }
}

export async function getBook(
  bookId: string,
  pageNumber: number
): Promise<void> {
  const response = await self.fetch(
    `http://${ALKITAB_BACKEND_URL}:${ALKITAB_BACKEND_PORT}/api/library/book/${bookId}?page=${pageNumber}&limit=1`,
    { method: "GET", credentials: "include" }
  );

  if (response.ok) {
    const body = await response.json();
    navigate(`/library/${bookId}/${pageNumber}`);
    return body.pages;
  } else {
    let errorMessage: string = await response.text();
    notifications.addNotification("Getting book error", errorMessage);
    throw new Error(errorMessage);
  }
}
