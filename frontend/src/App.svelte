<script lang="ts">
  import Bookshelf from "./routes/Bookshelf.svelte";
  import Credits from "./routes/Credits.svelte";
  import Login from "./routes/Login.svelte";
  import AddBooks from "./routes/AddBooks.svelte";
  import NotFound from "./routes/NotFound.svelte";
  import Book from "./routes/Book.svelte";
  import BookPosts from "./routes/BookPosts.svelte";
  import SharedBooks from "./routes/SharedBooks.svelte";

  import AlkitabNavbar from "./lib/Navbar.svelte";
  import Footer from "./lib/Footer.svelte";
  import Notifications from "./lib/Notifications.svelte";

  import { Router, Route } from "svelte-routing";
  export let url = "";
</script>

<Router {url}>
  <div class="fluid-container d-flex flex-column min-vh-100">
    <AlkitabNavbar />

    <Route path="/" component={Bookshelf} />
    <Route path="/credits" component={Credits} />
    <Route path="/login-signup" component={Login} />
    <Route path="/add-books" component={AddBooks} />
    <Route path="/book-posts" component={BookPosts} />
    <Route path="/shared-books" component={SharedBooks} />
    <Route path="/library/:bookId/:pageNumberUrl" let:params>
      <Book bookId={params.bookId} pageNumberUrl={params.pageNumberUrl} />
    </Route>
    <Route component={NotFound} />

    <Footer />
  </div>
  <Notifications />
</Router>

<style lang="scss">
</style>
