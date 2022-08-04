<script lang="ts">
  import { Container, Spinner } from "sveltestrap";
  import BookCard from "../lib/BookCard.svelte";

  import { currentUser } from "../stores";
  import { getBooks } from "../api-service";

  let getBooksPromise: Promise<any>;
  if ($currentUser) getBooksPromise = getBooks();
  else getBooksPromise = Promise.resolve("");
</script>

<Container>
  {#if !$currentUser}
    <h1 class="text-center pt-5">Please log in to see your bookshelf 🔒</h1>
  {:else}
    <h1 class="text-center py-3">{$currentUser}'s Bookshelf</h1>
    {#await getBooksPromise}
      <h3>Loading books... <Spinner /></h3>
    {:then bookList}
      <div class="row row-cols-1 row-cols-md-3 g-4 mb-5">
        {#each bookList as book}
          <BookCard {book} />
        {/each}
      </div>
    {/await}
  {/if}
</Container>

<style lang="scss">
</style>
