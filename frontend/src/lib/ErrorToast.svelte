<script lang="ts">
  export let errorMessage: string;
  export let errorHeader: string;

  import { Toast, ToastBody, ToastHeader } from "sveltestrap/src";

  import type { SvelteComponentTyped } from "svelte";

  let nodeRef: SvelteComponentTyped;
</script>

<!-- TODO: This definitely causes a memory leak. Fix later -->
<Toast bind:this={nodeRef}>
  <ToastHeader
    toggle={() => {
      nodeRef.$destroy();
    }}>{errorHeader}</ToastHeader
  >
  <ToastBody>
    <p style="color: red">{errorMessage}</p>
  </ToastBody>
</Toast>

<style lang="scss">
</style>
