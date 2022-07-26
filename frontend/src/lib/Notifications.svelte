<script lang="ts">
  import ErrorToast from "./ErrorToast.svelte";
  import { notifications } from "../stores";
</script>

<div class="toast-container position-absolute top-0 start-0 mt-5 ms-5">
  {#each $notifications as notification}
    <ErrorToast
      errorMessage={notification.body}
      errorHeader={notification.header}
    />
  {/each}
</div>

<style lang="scss">
</style>
