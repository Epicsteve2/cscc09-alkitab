<script lang="ts">
  import { Container, Spinner } from "sveltestrap";
  import { getSharedBooks } from "../api-service";
  import { currentUser } from "../stores";

  let getSharedBooksPromise = getSharedBooks($currentUser);
</script>

<Container>
  <h1 class="text-center py-3">List of your shared books</h1>
  {#await getSharedBooksPromise}
    <h3>Loading books posts... <Spinner /></h3>
  {:then sharedBooksList}
    {#each sharedBooksList.books as sharedBook}
      <div>
        <p>Book ID: {sharedBook}</p>
      </div>
    {/each}
  {/await}
</Container>

<style lang="scss">
</style>
