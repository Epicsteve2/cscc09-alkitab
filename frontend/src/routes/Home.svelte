<script lang="ts">
  import logo from "../assets/svelte.png";
  import Counter from "../lib/Counter.svelte";

  // Bootstrap testing
  import { Button, Modal } from "sveltestrap";
  let isOpen: boolean = false;
  const toggle: () => void = () => (isOpen = !isOpen);
</script>

<main>
  <img src={logo} alt="Svelte Logo" />
  <h1>Hello Typescript!</h1>

  <Counter />

  <p>
    Visit <a href="https://svelte.dev">svelte.dev</a> to learn how to build Svelte
    apps.
  </p>

  <p>
    Check out <a href="https://github.com/sveltejs/kit#readme">SvelteKit</a> for
    the officially supported framework, also powered by Vite!
  </p>

  <!-- Bootstrap testing -->
  <div>
    <p>Testing bootstrap button</p>
    <button type="button" class="btn btn-primary">Primary</button>
  </div>
  <br />

  <Button color="primary" on:click={toggle}
    >This opens up a modal (Idk what that is lol)</Button
  >
  <Modal body {isOpen} {toggle} header="Hello World!">
    <p>There's a song that we're singing. Come on</p>
    <img
      src="https://i.ytimg.com/vi/NUJIRujygvY/hqdefault.jpg"
      alt="Come on Get Happy"
      class="img-fluid"
    />
  </Modal>
</main>

<style lang="scss">
  :root {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }

  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
  }

  img {
    height: 16rem;
    width: 16rem;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4rem;
    font-weight: 100;
    line-height: 1.1;
    margin: 2rem auto;
    max-width: 14rem;
  }

  p {
    max-width: 14rem;
    margin: 1rem auto;
    line-height: 1.35;
  }

  @media (min-width: 480px) {
    h1 {
      max-width: none;
    }

    p {
      max-width: none;
    }
  }

  // Testing SCSS
  @mixin button-base() {
    @include typography(button);
    @include ripple-surface;
    @include ripple-radius-bounded;

    display: inline-flex;
    position: relative;
    height: $button-height;
    border: none;
    vertical-align: middle;

    &:hover {
      cursor: pointer;
    }

    &:disabled {
      color: $mdc-button-disabled-ink-color;
      cursor: default;
      pointer-events: none;
    }
  }
</style>
