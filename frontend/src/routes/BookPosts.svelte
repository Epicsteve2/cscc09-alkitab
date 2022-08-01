<script lang="ts">
  import { Container, Spinner } from "sveltestrap";

  import { getBookPosts } from "../api-service";

  let getBookPostsPromise = getBookPosts();
</script>

<Container>
  <h1 class="text-center py-3">List of book posts</h1>
  {#await getBookPostsPromise}
    <h3>Loading books posts... <Spinner /></h3>
  {:then bookPostList}
    {#each bookPostList.posts as bookPost}
      <div>
        <p>Book name: {bookPost.bookName}</p>
        <p>Number of owners: {bookPost.numberOfOwners}</p>
      </div>
    {/each}
  {/await}
</Container>

<style lang="scss">
</style>
