<script lang="ts">
  import { Navbar, Nav } from "sveltestrap/src";
  import { links } from "svelte-routing";
</script>

<footer class="mt-auto">
  <Navbar color="warning">
    <Nav class="mx-auto">
      <a href="/credits" class="px-3 nav-link footer-link" use:links>Credits</a>
      <a
        class="px-3 nav-link footer-link"
        href="https://github.com/UTSCC09/project-we-use-linux-btw">GitHub</a
      >
    </Nav>
  </Navbar>
</footer>

<style lang="scss">
  .footer-link {
    color: orangered;
  }
</style>
