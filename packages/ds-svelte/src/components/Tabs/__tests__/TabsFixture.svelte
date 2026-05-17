<script lang="ts">
/**
 * Test fixture for Tabs compound component.
 * Composes Tabs + TabsList + TabsTab + TabsPanel into a standard
 * two-tab setup so @testing-library/svelte can render the compound.
 */
import Tabs from "../Tabs.svelte";
import TabsList from "../TabsList.svelte";
import TabsTab from "../TabsTab.svelte";
import TabsPanel from "../TabsPanel.svelte";

interface Props {
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  activationMode?: "automatic" | "manual";
  loop?: boolean;
  unmountInactive?: boolean;
  orientation?: "horizontal" | "vertical";
}

let {
  defaultValue = "a",
  value,
  onValueChange,
  activationMode,
  loop,
  unmountInactive,
  orientation,
}: Props = $props();
</script>

<Tabs
  {defaultValue}
  {value}
  {onValueChange}
  {activationMode}
  {loop}
  {unmountInactive}
  {orientation}
>
  <TabsList>
    <TabsTab value="a">Tab A</TabsTab>
    <TabsTab value="b">Tab B</TabsTab>
  </TabsList>
  <TabsPanel value="a">Panel A content</TabsPanel>
  <TabsPanel value="b">Panel B content</TabsPanel>
</Tabs>
