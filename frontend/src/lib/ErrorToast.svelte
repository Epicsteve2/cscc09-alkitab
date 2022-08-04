<script lang="ts">
  export let errorMessage: string;
  export let errorHeader: string;

  import { Toast, ToastBody, ToastHeader } from "sveltestrap/src";

  import type { SvelteComponentTyped } from "svelte";

  let nodeRef: SvelteComponentTyped;
</script>

<Toast bind:this={nodeRef}>
  <ToastHeader
    toggle={() => {
      nodeRef.$destroy();
    }}>{errorHeader}</ToastHeader
  >
  <ToastBody>
    <p>{errorMessage}</p>
  </ToastBody>
</Toast>

<style lang="scss">
  p {
    color: red;
  }
</style>
