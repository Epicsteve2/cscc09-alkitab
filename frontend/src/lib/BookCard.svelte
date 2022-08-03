<script lang="ts">
  export let book: BookList;
  export let sharedBy: String = "";

  import { links } from "svelte-routing";
  import {
    Spinner,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
  } from "sveltestrap";

  import { currentUser, notifications } from "../stores";
  import { API_URL, BookList, shareBook } from "../api-service";

  let isModalOpen = false;
  function toggleModal() {
    isModalOpen = !isModalOpen;
  }

  let shareeUsername = "";

  let shareBookPromise: Promise<Object> = Promise.resolve("");
</script>

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
            <b>Number of pages</b>: {book.numPages}
            {#if sharedBy}
              <br /><b>Shared by</b>: {sharedBy}
            {/if}
            <Dropdown class="position-absolute end-0 top-0">
              <DropdownToggle tag="div" class="d-inline-block">
                <div class="triple-dot p-1" />
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem on:click={toggleModal}>Share Book</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg">
              <ModalHeader toggle={toggleModal}
                >Share <i>{book.title}</i></ModalHeader
              >
              <ModalBody>
                Enter the username of who you want to share this book with
                <input
                  class="form-control my-3"
                  type="text"
                  bind:value={shareeUsername}
                />
              </ModalBody>
              <ModalFooter>
                {#await shareBookPromise}
                  <Spinner size="sm" />
                {/await}
                <Button
                  color="primary"
                  on:click={async () => {
                    shareBookPromise = shareBook(
                      book._id,
                      shareeUsername,
                      $currentUser
                    );

                    shareBookPromise.then(() => {
                      notifications.addNotification(
                        "Share book",
                        "Book has been successfully shared!"
                      );
                      toggleModal();
                    });
                  }}>Share</Button
                >
                <Button color="secondary" on:click={toggleModal}>Cancel</Button>
              </ModalFooter>
            </Modal>
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

<style lang="scss">
  .book-cover-image {
    width: 100%;
    height: 13vw;
    object-fit: cover;
  }

  .triple-dot:after {
    content: "\2807";
  }
</style>
