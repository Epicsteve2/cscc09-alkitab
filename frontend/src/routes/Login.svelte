<script lang="ts">
  import { notifications } from "../stores";

  import { Container, Spinner } from "sveltestrap";

  import { register, login } from "../api-service";

  let username = "";
  let password = "";

  let loginPromise: Promise<Object> = Promise.resolve("");
  let registerPromise: Promise<Object> = Promise.resolve("");
</script>

<Container class="py-3 ">
  <form id="login-container" class="mx-auto">
    <h1 class="text-center my-5">Alkitab 📚</h1>
    <h3 class="py-3">Login</h3>
    <div class="form-outline mb-4">
      <input
        type="text"
        id="username-form"
        class="form-control"
        bind:value={username}
      />
      <label class="form-label" for="username-form">Username</label>
    </div>

    <div class="form-outline mb-4">
      <input
        type="password"
        id="password-form"
        class="form-control"
        bind:value={password}
      />
      <label class="form-label" for="password-form">Password</label>
    </div>

    <div class="d-grid pb-4 gap-3">
      <button
        class="btn btn-warning "
        type="button"
        on:click|preventDefault={() => {
          loginPromise = login(username, password);
        }}>Sign In</button
      >
      <button
        class="btn btn-warning "
        type="button"
        on:click|preventDefault={() => {
          if (username.length < 3) {
            notifications.addNotification(
              "Register error",
              "Username too short. Username must be more than 3 characters"
            );
            return;
          }
          if (password.length < 5) {
            notifications.addNotification(
              "Register error",
              "Password too short. Password must be more than 5 characters"
            );
            return;
          }

          registerPromise = register(username, password);
        }}>Register</button
      >
    </div>
    {#await registerPromise}
      <Spinner size="sm" />
    {/await}
    {#await loginPromise}
      <Spinner size="sm" />
    {/await}
  </form>
</Container>

<style lang="scss">
  #login-container {
    max-width: 500px;
  }
</style>
