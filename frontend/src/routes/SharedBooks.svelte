<script lang="ts">
  import { Container, Spinner } from "sveltestrap";
  import { getSharedBooks } from "../api-service";
  import { currentUser } from "../stores";
  import BookCard from "../lib/BookCard.svelte";

  let getSharedBooksPromise: Promise<any>;
  if ($currentUser) getSharedBooksPromise = getSharedBooks($currentUser);
  else getSharedBooksPromise = Promise.resolve("");
</script>

<Container>
  {#if !$currentUser}
    <h1 class="text-center pt-5">Please log in to to add books 🔒</h1>
  {:else}
    <h1 class="text-center py-3">List of your shared books</h1>
    {#await getSharedBooksPromise}
      <h3>Loading books posts... <Spinner /></h3>
    {:then sharedBooksList}
      <div class="row row-cols-1 row-cols-md-3 g-4 mb-5">
        {#each sharedBooksList.books as book}
          <BookCard {book} sharedBy={book.user} />
        {/each}
      </div>
    {/await}
  {/if}
</Container>

<style lang="scss">
</style>
