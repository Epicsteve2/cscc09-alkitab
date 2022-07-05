<script lang="ts">
  import Home from "./routes/Home.svelte";
  import TestPage from "./routes/TestPage.svelte";

  import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Container,
    Row,
    Col,
  } from "sveltestrap/src";

  // svelte-routing
  import { Router, Link, Route } from "svelte-routing";
  export let url = "";

  let isOpen: boolean = false;

  function handleUpdate(event) {
    isOpen = event.detail.isOpen;
  }
</script>

<main>
  <Router {url}>
    <Navbar color="warning" light expand="md">
      <!-- <Container> Idk this container is weird, TODO: Fix-->
      <NavbarBrand href="/">Alkitab 📚</NavbarBrand>
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
        </Nav>
        <Nav navbar>
          <NavItem class="px-2">
            <NavLink href="/login-signup">Login/Signup</NavLink>
          </NavItem>
        </Nav>
      </Collapse>
      <!-- </Container> -->
    </Navbar>
    <div>
      <Route path="test" component={TestPage} />
      <Route path="/" component={Home} />
    </div>
    <footer>
      <Navbar color="light">
        <Nav class="mx-auto">
          <Link to="credits" class="px-3 nav-link">Credits</Link>
          <a
            class="px-3 nav-link"
            href="https://github.com/UTSCC09/project-we-use-linux-btw">GitHub</a
          >
        </Nav>
      </Navbar>
    </footer>
  </Router>
</main>

<style lang="scss">
</style>
