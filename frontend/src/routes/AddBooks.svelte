<script lang="ts">
  import { Container, Spinner } from "sveltestrap";

  import { currentUser } from "../stores";
  import { sendEpubFile } from "../api-service";

  let fileInput: FileList;
  let sendFilePromise: Promise<Object> = Promise.resolve("");
</script>

<Container class="pt-5">
  {#if !$currentUser}
    <h1 class="text-center pt-5">Please log in to to add books🔒</h1>
  {:else}
    <h1 class="text-center py-3">Add books</h1>
    <form class="position-relative mx-auto" id="add-file-form">
      <label for="form-add-book" class="form-label mb-3"
        >Add an <code>.epub</code>
        file</label
      >
      <input
        class="form-control mb-3"
        type="file"
        id="form-add-book"
        accept="application/epub+zip"
        bind:files={fileInput}
        required
      />
      <button
        class="btn btn-warning mb-3 position-absolute end-0"
        on:click|preventDefault={() => {
          sendFilePromise = sendEpubFile($currentUser, fileInput[0]);
        }}>Submit</button
      >
      {#await sendFilePromise}
        <Spinner size="sm" />
      {/await}
    </form>
  {/if}
</Container>

<style lang="scss">
  #add-file-form {
    max-width: 500px;
  }
</style>
