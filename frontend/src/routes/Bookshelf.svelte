<script lang="ts">
  import { links } from "svelte-routing";
  import { Container, Spinner } from "sveltestrap";

  import { currentUser } from "../stores";
  import { getBooks, API_URL } from "../api-service";

  let getBooksPromise = getBooks();
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
          <div class="col">
            <div class="card h-100">
              <div class="row g-0">
                <div class="col-md-4">
                  <a href={`/library/${book._id}/1`} use:links>
                    <img
                      src={`${API_URL}/api/library/book/${book._id}/cover`}
                      class="rounded-start book-cover-image"
                      alt="cover for {book.title}"
                    /></a
                  >
                </div>
                <div class="col-md-8">
                  <div class="card-body mb-5">
                    <h5 class="card-title">
                      {book.title}
                    </h5>
                    <p class="card-subtitle mb-2 text-muted">
                      {new Date(book.createdAt).toLocaleString()}
                    </p>
                    <p class="card-text">
                      Number of pages: {book.numPages}
                    </p>
                  </div>
                  <a
                    href={`/library/${book._id}/1`}
                    class="btn btn-warning position-absolute end-0 bottom-0 mb-3 mx-3"
                    use:links>Read book</a
                  >
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/await}
  {/if}
</Container>

<style lang="scss">
  .book-cover-image {
    width: 100%;
    height: 13vw;
    object-fit: cover;
  }
</style>
