<script lang="ts">
  import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
  } from "sveltestrap/src";

  import { Link } from "svelte-routing";

  let isOpen: boolean = false;

  function handleUpdate(event) {
    isOpen = event.detail.isOpen;
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
          <Link to="/login-signup" class="nav-link">Login/Signup</Link>
        </NavItem>
      </Nav>
    </Collapse>
  </Navbar>
</header>

<style lang="scss">
</style>
