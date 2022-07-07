<script lang="ts">
  import Home from "./routes/Home.svelte";
  import TestPage from "./routes/TestPage.svelte";
  import Credits from "./routes/Credits.svelte";
  import Login from "./routes/Login.svelte";
  import AddBooks from "./routes/AddBooks.svelte";
  import NotFound from "./routes/NotFound.svelte";

  import AlkitabNavbar from "./lib/Navbar.svelte";
  import Footer from "./lib/Footer.svelte";

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
</script>

<main>
  <Router {url}>
    <div class="fluid-container d-flex flex-column min-vh-100">
      <AlkitabNavbar />
      <div>
        <Route path="test" component={TestPage} />
        <Route path="/" component={Home} />
        <Route path="/credits" component={Credits} />
        <Route path="/login-signup" component={Login} />
        <Route path="/add-books" component={AddBooks} />
        <Route component={NotFound} />
      </div>
      <Footer />
    </div>
  </Router>
</main>

<style lang="scss">
</style>
