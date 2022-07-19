<script lang="ts">
  import { navigate } from "svelte-routing";

  export let bookId: string;
  export let pageNumberUrl: string;

  import { Container, Spinner } from "sveltestrap";
  import { ALKITAB_BACKEND_PORT, ALKITAB_BACKEND_URL } from "../stores";

  let pageNumber = parseInt(pageNumberUrl);

  let promise = getBook(bookId);
  async function getBook(bookId: string): Promise<void> {
    console.log(pageNumber);
    console.log({ pageNumberUrl });

    console.log(
      `http://${ALKITAB_BACKEND_URL}:${ALKITAB_BACKEND_PORT}/api/library/book/${bookId}?page=${pageNumber}&limit=1`
    );
    const response = await self.fetch(
      `http://${ALKITAB_BACKEND_URL}:${ALKITAB_BACKEND_PORT}/api/library/book/${bookId}?page=${pageNumber}&limit=1`,
      { method: "GET" }
    );
    if (response.ok) {
      const body = await response.json();
      console.log(body.pages);
      return body.pages;
    } else {
      throw new Error("error");
    }
  }

  async function getNextPage(): Promise<void> {
    pageNumber += 1;
    promise = getBook(bookId);
    navigate(`/library/${bookId}/${pageNumber}`);
  }

  async function getPreviousPage(): Promise<void> {
    if (pageNumber > 1) {
      pageNumber -= 1;
      promise = getBook(bookId);
      navigate(`/library/${bookId}/${pageNumber}`);
    }
  }
</script>

<!-- <Container class="text-centering pt-5 d-flex flex-column" id="book-container"> -->
<div
  class="container text-centering pt-5 d-flex flex-column"
  id="book-container"
>
  <div class="">
    {#await promise}
      <p>Loading... <Spinner /></p>
    {:then pages}
      {@html pages[0]}
    {:catch error}
      <p style="color: red">{error.message}</p>
    {/await}
  </div>
  <div
    class="pt-auto mt-auto mb-4 d-flex justify-content-between align-items-center"
  >
    <button
      disabled={pageNumber <= 1}
      class="btn btn-warning"
      type="button"
      on:click={getPreviousPage}
    >
      Previous Page</button
    >
    <p class="mt-auto mb-0">Page: {pageNumber}/</p>
    <button class="btn btn-warning" type="button" on:click={getNextPage}>
      Next Page</button
    >
  </div>
</div>

<!-- </Container> -->
<style lang="scss">
  #book-container {
    min-height: 87vh;
  }
</style>
