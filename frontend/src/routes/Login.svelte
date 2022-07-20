<script lang="ts">
  import {
    Container,
    Toast,
    ToastBody,
    ToastHeader,
    Spinner,
  } from "sveltestrap";

  import {
    ALKITAB_BACKEND_PORT,
    ALKITAB_BACKEND_URL,
    currentUser,
  } from "../stores";

  import { navigate } from "svelte-routing";

  let username = "";
  let password = "";

  let loginPromise: Promise<Object> = Promise.resolve("");
  async function login(username: string, password: string): Promise<Object> {
    const response = await self.fetch(
      `http://${ALKITAB_BACKEND_URL}:${ALKITAB_BACKEND_PORT}/api/users/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      }
    );

    toastIsOpen = true;

    if (response.ok) {
      let loginResponse = await response.json();

      currentUser.set(loginResponse.username);

      // window.location.replace("/");
      navigate("/", { replace: true });

      return Promise.resolve("");
    } else {
      let errorMessage: string = await response.text();
      console.log({ errorMessage });
      throw new Error(errorMessage);
    }
  }

  let registerPromise: Promise<Object> = Promise.resolve("");
  async function register(username: string, password: string): Promise<Object> {
    const response = await self.fetch(
      `http://${ALKITAB_BACKEND_URL}:${ALKITAB_BACKEND_PORT}/api/users/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      }
    );

    toastIsOpen = true;

    if (response.ok) {
      // window.location.replace("/");
      let registerResponse = await response.json();

      currentUser.set(registerResponse.username);

      navigate("/", { replace: true });
      return registerResponse;
    } else {
      let errorMessage: string = await response.text();
      throw new Error(errorMessage);
    }
  }

  function handleRegister() {
    registerPromise = register(username, password);
  }

  let toastIsOpen = true;

  function toggleToast() {
    toastIsOpen = !toastIsOpen;
  }
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
        on:click|preventDefault={handleRegister}>Register</button
      >
    </div>
  </form>
  {#await loginPromise}
    <Spinner size="sm" />
  {:catch error}
    <div class="toast-container position-absolute top-0 start-0 mt-5 ms-5">
      <Toast isOpen={toastIsOpen}>
        <ToastHeader toggle={toggleToast}>Login Error</ToastHeader>
        <ToastBody>
          <p style="color: red">{error.message}</p>
        </ToastBody>
      </Toast>
    </div>
  {/await}
  {#await registerPromise}
    <Spinner size="sm" />
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
</Container>

<style lang="scss">
  #login-container {
    max-width: 500px;
  }
</style>
