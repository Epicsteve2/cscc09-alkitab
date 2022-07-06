<script lang="ts">
  import { Navbar, Nav } from "sveltestrap/src";
  import { Link } from "svelte-routing";
</script>

<footer class="mt-auto">
  <Navbar color="warning">
    <Nav class="mx-auto">
      <Link to="credits" class="px-3 nav-link">Credits</Link>
      <a
        class="px-3 nav-link"
        href="https://github.com/UTSCC09/project-we-use-linux-btw">GitHub</a
      >
    </Nav>
  </Navbar>
</footer>

<style lang="scss">
</style>
