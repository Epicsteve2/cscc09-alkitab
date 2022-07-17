<script lang="ts">
  import { onMount } from "svelte";

  import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    Toast,
    ToastBody,
    ToastHeader,
    Spinner,
  } from "sveltestrap/src";

  import {
    ALKITAB_BACKEND_URL,
    ALKITAB_BACKEND_PORT,
    currentUser,
  } from "../stores";

  let isLoggedIn: boolean;

  onMount(async () => {
    const whoamiResponse = await fetch(
      `http://${ALKITAB_BACKEND_URL}:${ALKITAB_BACKEND_PORT}/api/users/whoami`
    );
    let getCurrentUser = await whoamiResponse.json();
    currentUser.set(getCurrentUser.user || "");
  });

  currentUser.subscribe((value) => {
    isLoggedIn = Boolean(value);
  });

  import { Link } from "svelte-routing";

  let isOpen: boolean = false;

  function handleUpdate(event) {
    isOpen = event.detail.isOpen;
  }

  let toastIsOpen = false;

  let logoutPromise: Promise<Object> = Promise.resolve("");
  async function logout(): Promise<Object> {
    const response = await self.fetch(
      `http://${ALKITAB_BACKEND_URL}:${ALKITAB_BACKEND_PORT}/api/users/logout`,
      { method: "GET" }
    );

    toastIsOpen = true;

    if (response.ok) {
      currentUser.set("");

      window.location.replace("/");
      return Promise.resolve("");
    } else {
      let errorMessage: string = await response.text();
      console.log({ errorMessage });
      throw new Error(errorMessage);
    }
  }

  function toggleToast() {
    toastIsOpen = !toastIsOpen;
  }
</script>

<header>
  <Navbar color="warning" light expand="md">
    <NavbarBrand href="/" class="">Alkitab 📚</NavbarBrand>
    <NavbarToggler on:click={() => (isOpen = !isOpen)} />
    <Collapse {isOpen} navbar expand="md" on:update={handleUpdate}>
      <Nav navbar class="me-auto">
        <NavItem class="px-2">
          <Link to="/" class="nav-link">Bookshelf</Link>
        </NavItem>
        <NavItem class="px-2">
          <Link to="/add-books" class="nav-link">Add books</Link>
        </NavItem>
        <NavItem class="px-2">
          <Link to="/podcasts" class="nav-link">Podcasts</Link>
        </NavItem>
        <NavItem class="px-2">
          <Link to="/test" class="nav-link">Test Page</Link>
        </NavItem>
      </Nav>
      <Nav navbar>
        <NavItem class="px-2">
          {#if !isLoggedIn}
            <Link to="/login-signup" class="nav-link">Login/Signup</Link>
          {:else}
            <div
              on:click={() => {
                logoutPromise = logout();
              }}
            >
              Logout
            </div>
          {/if}
        </NavItem>
      </Nav>
    </Collapse>
  </Navbar>
  {#await logoutPromise}
    <Spinner size="sm" />
  {:catch error}
    <div class="toast-container position-absolute top-0 start-0 mt-5 ms-5">
      <Toast isOpen={toastIsOpen}>
        <ToastHeader toggle={toggleToast}>Register Error</ToastHeader>
        <ToastBody>
          <p style="color: red">{error.message}</p>
        </ToastBody>
      </Toast>
    </div>
  {/await}
</header>

<style lang="scss">
</style>
