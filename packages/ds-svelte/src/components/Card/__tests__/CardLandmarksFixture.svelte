<script lang="ts">
/**
 * Test fixture for Card landmark exposure.
 * Composes two Cards, each with CardHeader + CardContent + CardFooter, so
 * @testing-library/svelte can render the compound as a page would.
 */
import Card from "../Card.svelte";
import CardHeader from "../CardHeader.svelte";
import CardContent from "../CardContent.svelte";
import CardFooter from "../CardFooter.svelte";
</script>

<Card>
  <CardHeader>One</CardHeader>
  <CardContent>Body</CardContent>
  <CardFooter>Foot</CardFooter>
</Card>
<Card>
  <CardHeader>Two</CardHeader>
  <CardContent>Body</CardContent>
  <CardFooter>Foot</CardFooter>
</Card>
