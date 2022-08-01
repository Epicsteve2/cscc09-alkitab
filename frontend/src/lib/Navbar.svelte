<script lang="ts">
  import { onMount } from "svelte";
  import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    Spinner,
  } from "sveltestrap/src";
  import { Link } from "svelte-routing";

  import { logout, whoami } from "../api-service";
  import { currentUser } from "../stores";

  onMount(async () => {
    whoami();
  });

  let isOpen = false;

  function handleUpdate(event) {
    isOpen = event.detail.isOpen;
  }

  let logoutPromise: Promise<Object> = Promise.resolve("");
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
        <NavItem class="px-2">
          <Link to="/book-posts" class="nav-link">Book Posts</Link>
        </NavItem>
        <NavItem class="px-2">
          <Link to="/shared-books" class="nav-link">Shared Books</Link>
        </NavItem>
      </Nav>
      <Nav navbar>
        <NavItem class="px-2">
          {#if $currentUser.length === 0}
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
    {#await logoutPromise}
      <Spinner size="sm" />
    {/await}
  </Navbar>
</header>

<style lang="scss">
</style>
