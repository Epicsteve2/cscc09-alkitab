<script lang="ts">
  import {
    Container,
    Spinner,
    Toast,
    ToastBody,
    ToastHeader,
  } from "sveltestrap";

  let fileInput: FileList;

  import {
    ALKITAB_BACKEND_PORT,
    ALKITAB_BACKEND_URL,
    currentUser,
  } from "../stores";

  import { navigate } from "svelte-routing";

  let sendFilePromise = Promise.resolve("");
  async function sendFile() {
    const formData = new FormData();
    formData.append("username", $currentUser);
    formData.append("book", fileInput[0]);

    const response = await self.fetch(
      `http://${ALKITAB_BACKEND_URL}:${ALKITAB_BACKEND_PORT}/api/library/book`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
      }
    );

    if (response.ok) {
      sendFilePromise = await response.json();

      // window.location.replace("/");
      navigate("/", { replace: true });
      return sendFilePromise;
    } else {
      let errorMessage: string = await response.text();
      console.log({ errorMessage });
      throw new Error(errorMessage);
    }
  }
  let toastIsOpen = true;

  function handleSubmit() {
    sendFilePromise = sendFile();
  }

  function toggleToast() {
    toastIsOpen = !toastIsOpen;
  }
</script>

<Container class="pt-5">
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
      on:click|preventDefault={handleSubmit}>Submit</button
    >
  </form>
  {#await sendFilePromise}
    <Spinner size="sm" />
  {:catch error}
    <div class="toast-container position-absolute top-0 start-0 mt-5 ms-5">
      <Toast isOpen={toastIsOpen}>
        <ToastHeader toggle={toggleToast}>Add Book Error</ToastHeader>
        <ToastBody>
          <p style="color: red">{error.message}</p>
        </ToastBody>
      </Toast>
    </div>
  {/await}
</Container>

<style lang="scss">
  #add-file-form {
    max-width: 500px;
  }
</style>
