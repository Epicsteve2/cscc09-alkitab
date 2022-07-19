<script lang="ts">
  export let bookId: string;

  import { ALKITAB_BACKEND_PORT, ALKITAB_BACKEND_URL } from "../stores";

  let pageNumber = 1;

  let promise = getBook(bookId);
  async function getBook(bookId: string): Promise<void> {
    console.log(pageNumber);
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
  }

  async function getPreviousPage(): Promise<void> {
    pageNumber -= 1;
    promise = getBook(bookId);
  }
</script>

{#await promise}
  <p>...waiting</p>
{:then pages}
  <p>{@html pages[0]}</p>
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}

<button class="btn btn-warning " type="button" on:click={getNextPage}>
  Next Page</button
>
<button class="btn btn-warning " type="button" on:click={getPreviousPage}>
  Previous Page</button
>
