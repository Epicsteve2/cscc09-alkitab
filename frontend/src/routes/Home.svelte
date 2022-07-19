<script lang="ts">
  import { Link } from "svelte-routing";

  import {
    Container,
    Spinner,
    Toast,
    ToastBody,
    ToastHeader,
  } from "sveltestrap";

  import {
    currentUser,
    ALKITAB_BACKEND_PORT,
    ALKITAB_BACKEND_URL,
  } from "../stores";

  let getBooksPromise = getBooks();

  async function getBooks(): Promise<Object[]> {
    const response = await self.fetch(
      `http://${ALKITAB_BACKEND_URL}:${ALKITAB_BACKEND_PORT}/api/library`,
      { method: "GET" }
    );

    if (response.ok) {
      let bookList = await response.json();
      return bookList;
    } else {
      let errorMessage: string = await response.text();
      console.log({ errorMessage });
      throw new Error(errorMessage);
    }
  }

  let toastIsOpen = true;

  function toggleToast() {
    toastIsOpen = !toastIsOpen;
  }

  interface BookList {
    _id: string;
    user: string;
    sharedUsers: any[];
    bookPost: string;
    title: string;
    numPages: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }

  const hardcodedBookList: BookList[] = [
    {
      _id: "62d49d8861ec7f391e7a0bec",
      user: "Mashiro",
      sharedUsers: [],
      bookPost: "Mock",
      title: "Around the World in 28 Languages",
      numPages: 547,
      createdAt: "2022-07-17T23:38:50.088Z",
      updatedAt: "2022-07-17T23:38:50.088Z",
      __v: 0,
    },
  ];
</script>

<Container>
  {#if !$currentUser}
    <!-- {#if $currentUser} -->
    <h1 class="text-center pt-5">Please log in to see your bookshelf 🔒</h1>
  {:else}
    <h1 class="text-center pt-5">{$currentUser}'s Bookshelf</h1>
    {#await getBooksPromise}
      <h3>Loading books... <Spinner /></h3>
    {:then bookList}
      <ul>
        <!-- {#each bookList as book} -->
        {#each hardcodedBookList as book}
          <li>
            <b>Title</b>: {book.title} <br />
            <b>ID</b>: {book._id} <br />
            <b>Number of pages</b>: {book.numPages} <br />
            <b>Uploaded date</b>: {book.createdAt} <br />
            <b>Link to book</b>: <Link to={"/library/" + book._id}>Book</Link
            ><br />
          </li>
        {/each}
      </ul>
    {:catch error}
      <div class="toast-container position-absolute top-0 start-0 mt-5 ms-5">
        <Toast isOpen={toastIsOpen}>
          <ToastHeader toggle={toggleToast}>Register Error</ToastHeader>
          <ToastBody>
            <p style="color: red">{error.message}</p>
          </ToastBody>
        </Toast>
      </div>
    {/await}
  {/if}
</Container>

<style lang="scss">
</style>
