<script lang="ts">
  import { Col, Container, Row, Button } from "sveltestrap";
  import { Link } from "svelte-routing";
</script>

<main>
  <Container>
    <Row>
      <Col>.col</Col>
    </Row>
    <Row>
      <Col>.col</Col>
      <Col>.col</Col>
      <Col>.col</Col>
      <Col>.col</Col>
    </Row>
    <Row>
      <Col xs="3">.col-3</Col>
      <Col xs="auto">.col-auto - variable width content</Col>
      <Col xs="3">.col-3</Col>
    </Row>
    <Row>
      <Col xs="6">.col-6</Col>
      <Col xs="6">.col-6</Col>
    </Row>
    <Row>
      <Col xs="6" sm="4">.col-6 .col-sm-4</Col>
      <Col xs="6" sm="4">.col-6 .col-sm-4</Col>
      <Col sm="4">.col-sm-4</Col>
    </Row>
    <Row>
      <Col sm={{ size: 6, order: 2, offset: 1 }}>
        .col-sm-6 .order-sm-2 .offset-sm-1
      </Col>
    </Row>
    <Row>
      <Col sm="12" md={{ size: 6, offset: 3 }}>
        .col-sm-12 .col-md-6 .offset-md-3
      </Col>
    </Row>
    <Row>
      <Col sm={{ size: "auto", offset: 1 }}>.col-sm-auto .offset-sm-1</Col>
      <Col sm={{ size: "auto", offset: 1 }}>.col-sm-auto .offset-sm-1</Col>
    </Row>
    <Row cols={2}>
      <Col>col-1</Col>
      <Col>col-2</Col>
      <Col>col-3</Col>
      <Col>col-4</Col>
      <Col>col-5</Col>
      <Col>col-6</Col>
    </Row>
    <Row cols={{ lg: 3, md: 2, sm: 1 }}>
      <Col>col-1</Col>
      <Col>col-2</Col>
      <Col>col-3</Col>
      <Col>col-4</Col>
      <Col>col-5</Col>
      <Col>col-6</Col>
    </Row>
    <Row class="testRow">
      <Col>idk lol</Col>
    </Row>
    <Button color="primary">Buttons!</Button>
    <p>Testing SCSS</p>
    <div class="card" style="width: 18rem;">
      <img
        src="https://avatars.githubusercontent.com/u/65625612?s=200&v=4"
        class="card-img-top"
        alt="test"
      />
      <div class="card-body">
        <h5 class="card-title">Card title</h5>
        <p class="card-text">
          Some quick example text to build on the card title and make up the
          bulk of the card's content.
        </p>
        <!-- Using non-sveltestrap components -->
        <Link to="/" class="btn btn-secondary">Go home</Link>
      </div>
    </div>
  </Container>
</main>

<!-- Syntax highlighting doesn't work D:
Source: https://stackoverflow.com/a/62043156 -->
<style lang="sass">
  /* This is how you style a component */
  :global(.testRow)
    color: red

  :global(.row, .col)
    border-style: solid

  p
    border-style: solid
    margin: 1em

  @mixin button-base()
    @include typography(button)
    @include ripple-surface
    @include ripple-radius-bounded

    display: inline-flex
    position: relative
    height: $button-height
    border: none
    vertical-align: middle

    &:hover
      cursor: pointer

    &:disabled
      color: $mdc-button-disabled-ink-color
      cursor: default
      pointer-events: none
</style>
