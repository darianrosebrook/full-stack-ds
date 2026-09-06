import { createRoot } from "react-dom/client";
import { useRef, useState, type ComponentPropsWithRef } from "react";
import { InteractionHost } from "../../packages/ds-react/src/primitives/InteractionHost";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../../packages/ds-react/src/components/Accordion/Accordion";
import { Tabs, TabsList, TabsTab, TabsPanel } from "../../packages/ds-react/src/components/Tabs/Tabs";
import { Tooltip } from "../../packages/ds-react/src/components/Tooltip/Tooltip";
import { Dialog } from "../../packages/ds-react/src/components/Dialog/Dialog";
import { ShowMore } from "../../packages/ds-react/src/components/ShowMore/ShowMore";
import "../../packages/ds-tokens/generated/tokens.css";

function CustomButton(props: ComponentPropsWithRef<"button">) { return <button {...props} />; }
function Fixture() {
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState(0);
  const [consumerCalls, setConsumerCalls] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  return <section aria-label="Interaction substrate fixture" style={{ position: "relative", background: "white", color: "black", padding: 24 }}>
    <Tooltip>
      <Tooltip.Trigger asChild>
        <InteractionHost asChild onActivate={() => { setRequests(n => n + 1); setOpen(true); }}>
          <CustomButton ref={buttonRef} id="shared-dialog-invoker" onClick={() => setConsumerCalls(n => n + 1)}>Open composed dialog</CustomButton>
        </InteractionHost>
      </Tooltip.Trigger>
      <Tooltip.Content>Shared trigger help</Tooltip.Content>
    </Tooltip>
    <output data-testid="activation-counts">{consumerCalls}:{requests}</output>
    <output data-testid="ref-host">{open ? buttonRef.current?.id : "closed"}</output>
    <Dialog open={open} onOpenChange={setOpen} ariaLabel="Composed dialog" returnFocus="#shared-dialog-invoker">
      <button onClick={() => setOpen(false)}>Finish</button>
    </Dialog>
    <Accordion type="multiple" defaultValue={["a"]}>
      <AccordionItem>
        <AccordionTrigger value="a" asChild><CustomButton>First disclosure</CustomButton></AccordionTrigger>
        <AccordionContent value="a"><button>First panel action</button></AccordionContent>
      </AccordionItem>
      <AccordionItem>
        <AccordionTrigger value="b">Second disclosure</AccordionTrigger>
        <AccordionContent value="b"><button>Second panel action</button></AccordionContent>
      </AccordionItem>
    </Accordion>
    <Tabs defaultValue="one" unmountInactive={false}>
      <TabsList><TabsTab value="one" asChild><CustomButton>First tab</CustomButton></TabsTab><TabsTab value="two">Second tab</TabsTab></TabsList>
      <TabsPanel value="one"><button>First tab action</button></TabsPanel>
      <TabsPanel value="two"><button>Second tab action</button></TabsPanel>
    </Tabs>
    <ShowMore maxLines={2}><p style={{ maxWidth: 180 }}>Long content with enough words to span many lines. The collapsed state must clip these lines, while expanding reveals every line of this text.</p></ShowMore>
  </section>;
}
const container = document.createElement("div");
container.id = "interaction-fixture";
document.body.prepend(container);
createRoot(container).render(<Fixture />);
