<script lang="ts">
  export let bookId: string;
  export let pageNumberUrl: string;

  import { Spinner } from "sveltestrap";
  import { getBook } from "../api-service";

  import { onMount } from "svelte";
  import io from "socket.io-client";

  import {
    ALKITAB_BACKEND_PORT,
    ALKITAB_BACKEND_URL,
  } from "../stores";

  let pageNumber = parseInt(pageNumberUrl);
  let getBookPromise = getBook(bookId, pageNumber);

  async function getNextPage(): Promise<void> {
    pageNumber += 1;
    getBookPromise = getBook(bookId, pageNumber);
  }

  async function getPreviousPage(): Promise<void> {
    if (pageNumber > 1) {
      pageNumber -= 1;
      getBookPromise = getBook(bookId, pageNumber);
    }
  }

  onMount(() => {
    const API_URL = import.meta.env.DEV
    ? `http://${ALKITAB_BACKEND_URL}:${ALKITAB_BACKEND_PORT}`
    : "";

    const socket = io(API_URL)
    socket.connect()

    socket.emit("ENTER BOOK ROOM", bookId, "ANDY");

    socket.on("JOINED_ROOM", (json)=>{
        console.log(`someone of socketId:${json.socketId} and username ${json.user} has joined the room`)
    })


})














</script>

<div
  class="container text-centering pt-5 d-flex flex-column"
  id="book-container"
>
  <div class="">
    {#await getBookPromise}
      <p>Loading... <Spinner /></p>
    {:then pages}
      {@html pages[0]}
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
    <p class="mt-auto mb-0">Page: {pageNumber}/idk lol</p>
    <button class="btn btn-warning" type="button" on:click={getNextPage}>
      Next Page</button
    >
  </div>
</div>

<style lang="scss">
  #book-container {
    min-height: 87vh;
  }
</style>
