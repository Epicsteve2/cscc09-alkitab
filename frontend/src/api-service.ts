import {
  ALKITAB_BACKEND_PORT,
  ALKITAB_BACKEND_URL,
  currentUser,
  notifications,
} from "./stores";

import { navigate } from "svelte-routing";

// Use custom URL for development
export const API_URL = import.meta.env.DEV
  ? `http://${ALKITAB_BACKEND_URL}:${ALKITAB_BACKEND_PORT}`
  : "";

export async function register(
  username: string,
  password: string
): Promise<Object> {
  const response = await self.fetch(`${API_URL}/api/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: username,
      password: password,
    }),
    credentials: "include",
  });

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
  const response = await self.fetch(`${API_URL}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: username,
      password: password,
    }),
    credentials: "include",
  });

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

export async function sendEpubFile(username: string, epubFile: File) {
  const formData = new FormData();
  formData.append("username", username);
  formData.append("book", epubFile);

  const response = await self.fetch(`${API_URL}/api/library/book`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (response.ok) {
    let sendFileResponse = await response.json();
    navigate("/", { replace: true });
    return sendFileResponse;
  } else {
    let errorMessage: string = await response.text();
    notifications.addNotification("Send book error", errorMessage);
    throw new Error(errorMessage);
  }
}

interface BookList {
  _id: string;
  pages: Array<String>;
  user: String;
  bookPost: String;
  numPages: Number;
  title: String;
  coverImg: {
    id: String;
    mimeType: String;
    path: String;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export async function getBooks(): Promise<BookList[]> {
  const response = await self.fetch(`${API_URL}/api/library`, {
    method: "GET",
    credentials: "include",
  });

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
    `${API_URL}/api/library/book/${bookId}?page=${pageNumber}&limit=1`,
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

export async function logout(): Promise<Object> {
  const response = await self.fetch(`${API_URL}/api/users/logout`, {
    method: "GET",
    credentials: "include",
  });

  if (response.ok) {
    let logoutResponse = await response.json();
    currentUser.set("");
    navigate("/", { replace: true });
    return logoutResponse;
  } else {
    let errorMessage: string = await response.text();
    notifications.addNotification("Logout error", errorMessage);
    throw new Error(errorMessage);
  }
}

export async function whoami(): Promise<Object> {
  const response = await fetch(`${API_URL}/api/users/whoami`, {
    credentials: "include",
  });

  if (response.ok) {
    const getCurrentUser = await response.json();
    currentUser.set(getCurrentUser.user || "");
    return getCurrentUser;
  } else {
    const errorMessage: string = await response.text();
    notifications.addNotification("whoami error", errorMessage);
    throw new Error(errorMessage);
  }
}

export interface BookPostInterface {
  _id: string;
  bookName: string;
  numberOfOwners: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export async function addBookPost(
  bookName: string
): Promise<{ newPosting: object }> {
  const response = await self.fetch(`${API_URL}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bookName: bookName,
    }),
    credentials: "include",
  });

  if (response.ok) {
    const addBookPostResponse = await response.json();
    return addBookPostResponse;
  } else {
    const errorMessage: string = await response.text();
    notifications.addNotification("Adding book post error", errorMessage);
    throw new Error(errorMessage);
  }
}

export async function getBookPosts(): Promise<{ posts: BookPostInterface[] }> {
  const response = await fetch(`${API_URL}/api/bookpost/`);

  if (response.ok) {
    const bookPostList = await response.json();
    return bookPostList;
  } else {
    const errorMessage: string = await response.text();
    notifications.addNotification("get book posts error", errorMessage);
    throw new Error(errorMessage);
  }
}

export async function shareBook(
  bookId: string,
  sharee: string,
  sharer?: string
): Promise<{ msg: string }> {
  const response = await fetch(`${API_URL}/api/sharedbooks/share`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bookId: bookId,
      sharee: sharee,
      ...(sharer && { sharee: sharer }),
    }),
    credentials: "include",
  });

  if (response.ok) {
    const shareBookResponse = await response.json();
    return shareBookResponse;
  } else {
    const errorMessage: string = await response.text();
    notifications.addNotification("share book posts error", errorMessage);
    throw new Error(errorMessage);
  }
}

export async function getSharedBooks(
  user?: string
): Promise<{ books: [string] }> {
  const queryParams = user ? `?user=${user}` : "";
  const response = await fetch(`${API_URL}/api/sharedbooks${queryParams}`);

  if (response.ok) {
    const sharedBookList = await response.json();
    return sharedBookList;
  } else {
    const errorMessage: string = await response.text();
    notifications.addNotification("get shared books error", errorMessage);
    throw new Error(errorMessage);
  }
}
