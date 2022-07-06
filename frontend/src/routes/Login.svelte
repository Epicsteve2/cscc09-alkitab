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

<Container class="py-3 ">
  <form id="login-container" class="mx-auto">
    <h1 class="text-center my-5">Alkitab 📚</h1>
    <h3 class="py-3">Login</h3>
    <!-- Email input -->
    <div class="form-outline mb-4">
      <input type="text" id="username-form" class="form-control" />
      <label class="form-label" for="username-form">Username</label>
    </div>

    <!-- Password input -->
    <div class="form-outline mb-4">
      <input type="password" id="password-form" class="form-control" />
      <label class="form-label" for="password-form">Password</label>
    </div>

    <!-- Submit button -->
    <div class="d-grid pb-4 gap-3">
      <button class="btn btn-warning " type="button">Sign In</button>
      <!-- <button class="btn btn-warning " type="button">Register</button> -->
    </div>

    <!-- Register buttons -->
    <div class="text-center">
      <p>Not a member? <a href="#!">Register</a></p>
    </div>
  </form>
</Container>

<!-- </div> -->
<style lang="scss">
  #login-container {
    max-width: 500px;
  }
</style>
