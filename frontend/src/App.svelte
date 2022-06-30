<script lang="ts">
  import Home from "./routes/Home.svelte";
  import TestPage from "./routes/TestPage.svelte";

  // svelte-routing
  import { Router, Link, Route } from "svelte-routing";
  export let url = "";
</script>

<main>
  <Router {url}>
    <nav>
      <Link to="/">Home</Link>
      <Link to="test">Test</Link>
    </nav>
    <div>
      <Route path="test" component={TestPage} />
      <Route path="/" component={Home} />
    </div>
  </Router>
</main>

<style lang="scss">
  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
  }
</style>
