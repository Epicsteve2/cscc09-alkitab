<script lang="ts">
  import {
    Col,
    Container,
    Row,
    Button,
    ListGroup,
    ListGroupItem,
  } from "sveltestrap";
</script>

<Container class="pt-5">
  <h1 class="text-center py-3">Add books</h1>
  <form class="position-relative mx-auto" id="add-file-form">
    <label for="form-add-book" class="form-label mb-3"
      >Add an <p class="font-monospace">.epub</p>
      file</label
    >
    <input
      class="form-control mb-3"
      type="file"
      id="form-add-book"
      accept="application/epub+zip"
    />
    <button class="btn btn-warning mb-3 position-absolute  end-0">Submit</button
    >
  </form>
</Container>

<style lang="scss">
  label > p {
    display: inline;
  }

  #add-file-form {
    max-width: 500px;
  }
</style>
