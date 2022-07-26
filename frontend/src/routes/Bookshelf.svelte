<script lang="ts">
  import { Link } from "svelte-routing";
  import { Container, Spinner } from "sveltestrap";

  import { currentUser } from "../stores";
  import { getBooks } from "../api-service";

  let getBooksPromise = getBooks();
</script>

<Container>
  {#if !$currentUser}
    <h1 class="text-center pt-5">Please log in to see your bookshelf 🔒</h1>
  {:else}
    <h1 class="text-center pt-5">{$currentUser}'s Bookshelf</h1>
    {#await getBooksPromise}
      <h3>Loading books... <Spinner /></h3>
    {:then bookList}
      <ul>
        {#each bookList as book}
          <li>
            <b>Title</b>: {book.title} <br />
            <b>ID</b>: {book._id} <br />
            <b>Number of pages</b>: {book.numPages} <br />
            <b>Uploaded date</b>: {book.createdAt} <br />
            <b>Link to book</b>: <Link to={"/library/" + book._id + "/1"}
              >Book</Link
            ><br />
          </li>
        {/each}
      </ul>
    {/await}
  {/if}
</Container>

<style lang="scss">
</style>
