<script lang="ts">
  import { Container, ListGroup, ListGroupItem } from "sveltestrap";
</script>

<Container class="py-3">
  <ListGroup>
    <ListGroupItem
      color="warning"
      href="https://sveltestrap.js.org/?path=/story/components--navbar"
      action
      tag="a">Bootstrap header and footer</ListGroupItem
    >
    <ListGroupItem
      color="warning"
      href="https://getbootstrap.com/docs/5.1/examples/sign-in/"
      action
      tag="a">Bootstrap Sign In</ListGroupItem
    >
    <ListGroupItem
      color="warning"
      href="https://icons8.com/icon/l6iocFkbmCrh/book"
      action
      tag="a"
      >Favicon licensed under <a
        href="https://intercom.help/icons8-7fb7577e8170/en/articles/5534926-universal-multimedia-licensing-agreement-for-icons8"
      >
        Universal Multimedia Licensing Agreement for Icons8
      </a>
    </ListGroupItem>
    <ListGroupItem
      color="warning"
      href="https://superuser.com/a/1199622"
      action
      tag="a"
      >NGINX redirect all http requests to <code>index.html</code>
    </ListGroupItem>
    <ListGroupItem
      color="warning"
      href="https://timdeschryver.dev/blog/environment-variables-with-sveltekit"
      action
      tag="a"
      >Svelte environment variables
    </ListGroupItem>
    <ListGroupItem
      color="warning"
      href="https://stackoverflow.com/a/58078233"
      action
      tag="a"
      >CORS issues #1. Local development
    </ListGroupItem>
    <ListGroupItem
      color="warning"
      href="https://github.com/mongo-express/mongo-express/issues/146#issuecomment-329531989"
      action
      tag="a"
      >NGINX setup for mongo-express. <br />Also check out
      <a href="https://stackoverflow.com/a/45408398"
        >Firefox issue redirecting <code>localhost</code> to
        <code>https</code></a
      >
    </ListGroupItem>
    <ListGroupItem
      color="warning"
      href="https://github.com/portainer/portainer/issues/4429#issuecomment-731652600"
      action
      tag="a"
      >NGINX setup for portainer.
    </ListGroupItem>
    <ListGroupItem
      color="warning"
      href="https://gist.github.com/Stanback/7145487"
      action
      tag="a"
      >CORS issues #2. Fix with NGINX
    </ListGroupItem>
    <ListGroupItem
      color="warning"
      href="https://serverfault.com/a/1095428"
      action
      tag="a"
      >CORS issues #3. Remove secure cookies for dev only<br /><b>EDIT</b>: I
      didn't actually need this in the end</ListGroupItem
    >
    <ListGroupItem
      color="warning"
      href="https://github.com/github/fetch/issues/386#issuecomment-243229388"
      action
      tag="a"
      >CORS issues #4. Forgot to set <code>credentials</code>. <br />
      Apparently, you need to set <code>credentials</code> to also be able to return
      cookies from the backend as well... 😡
    </ListGroupItem>
    <!--
    <ListGroupItem
      color="warning"
      href=""
      action
      tag="a"
      >
    </ListGroupItem>
    -->
  </ListGroup>
</Container>

<style lang="scss">
</style>
