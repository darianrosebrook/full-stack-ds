<script lang="ts">
/**
 * Test fixture for the Accordion disclosure compound component.
 * Composes Accordion + AccordionItem + AccordionTrigger + AccordionContent
 * so @testing-library/svelte can render the compound.
 */
import Accordion from "../Accordion.svelte";
import AccordionItem from "../AccordionItem.svelte";
import AccordionTrigger from "../AccordionTrigger.svelte";
import AccordionContent from "../AccordionContent.svelte";

interface Props {
  type?: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (v: string | string[]) => void;
  collapsible?: boolean;
}

let { type = "single", value, defaultValue, onValueChange, collapsible }: Props = $props();
</script>

<Accordion {type} {value} {defaultValue} {onValueChange} {collapsible}>
  <AccordionItem>
    <AccordionTrigger value="a">First</AccordionTrigger>
    <AccordionContent value="a">Panel A</AccordionContent>
  </AccordionItem>
  <AccordionItem>
    <AccordionTrigger value="b">Second</AccordionTrigger>
    <AccordionContent value="b">Panel B</AccordionContent>
  </AccordionItem>
</Accordion>
