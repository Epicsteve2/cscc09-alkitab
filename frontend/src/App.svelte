<script lang="ts">
  import Home from "./routes/Home.svelte";
  import TestPage from "./routes/TestPage.svelte";
  import Credits from "./routes/Credits.svelte";
  import Login from "./routes/Login.svelte";
  import AddBooks from "./routes/AddBooks.svelte";
  import NotFound from "./routes/NotFound.svelte";

  import AlkitabNavbar from "./lib/Navbar.svelte";
  import Footer from "./lib/Footer.svelte";

  import { Router, Route } from "svelte-routing";
  export let url = "";
</script>

<Router {url}>
  <div class="fluid-container d-flex flex-column min-vh-100">
    <AlkitabNavbar />

    <Route path="test" component={TestPage} />
    <Route path="/" component={Home} />
    <Route path="/credits" component={Credits} />
    <Route path="/login-signup" component={Login} />
    <Route path="/add-books" component={AddBooks} />
    <Route component={NotFound} />

    <Footer />
  </div>
</Router>

<style lang="scss">
</style>
