import type { ComponentContract, ContractInteraction } from "./contract.js";
import type { DomNodeIR, NormalizedChannelIR, PartIR } from "./ir.js";

export interface ActivationIR {
  channel: NormalizedChannelIR;
  operation: "toggle" | "open" | "close";
  cancelNativeDefault: boolean;
  disabledProp?: string;
}

export interface InteractionIR {
  channel: NormalizedChannelIR;
  content: PartIR;
  presence: ContractInteraction["presence"];
  triggers: Array<{ part: PartIR; operation: ContractInteraction["triggers"][number]["operation"] }>;
  disabledProp?: string;
  focusContainer: boolean;
}

/** Contract authority for the state/host/content relationship. Geometry and
 * modality remain in SurfaceIR; a channel need not have an invoking host. */
export function buildInteractionIR(
  contract: ComponentContract,
  parts: PartIR[],
  channels: NormalizedChannelIR[],
  dom: DomNodeIR | undefined,
): InteractionIR | undefined {
  const input = contract.interaction;
  if (!input) return undefined;
  const fail = (message: string): never => { throw new Error(`[${contract.name}] interaction ${message}`); };
  const channel = channels.find(c => c.name === input.channel) ?? fail(`channel "${input.channel}" does not exist`);
  const content = parts.find(p => p.name === input.content) ?? fail(`content part "${input.content}" does not exist`);
  if (channel.callbackKind !== "value") fail("requires a value channel");
  if (input.disabledProp) {
    const disabled = Object.values(contract.props ?? {}).flatMap(group => group?.members ?? []).find(p => p.name === input.disabledProp);
    if (!disabled) fail(`disabled prop "${input.disabledProp}" does not exist`);
    if (disabled?.type !== "boolean") fail(`disabled prop "${input.disabledProp}" must be boolean`);
  }
  // Anchored surfaces already own gesture delivery. Reject a competing
  // relationship or operation rather than admitting inert interaction facts.
  const surface = contract.surface;
  if (surface?.anchor && "part" in surface.anchor) {
    const operation = surface.openTriggers?.includes("click") ? "toggle" : "open";
    if (input.content !== surface.content?.part || input.presence !== "unmount" ||
        input.triggers.length !== 1 || input.triggers[0].part !== surface.anchor.part || input.triggers[0].operation !== operation) {
      fail("must agree with the anchored surface relationship and gesture operation");
    }
    if (channel !== channels.find(c => c.valueType === "boolean")) fail("must use the anchored surface open channel");
  }
  const nodes = new Map<string, DomNodeIR>();
  function visit(node: DomNodeIR): void {
    if (node.part) nodes.set(node.part, node);
    node.children.forEach(visit);
  }
  if (dom) visit(dom);
  const contentNode = nodes.get(content.name);
  if (dom && !contentNode) fail(`content part "${content.name}" is not rendered`);
  const focusContainer = contract.focus?.strategy === "trap";
  if (focusContainer && contentNode) contentNode.focusContainer = true;
  if (input.presence === "unmount" && contentNode) {
    if (contentNode.ifProp && (contentNode.ifNegated || ![channel.name, channel.valueProp].includes(contentNode.ifProp))) {
      fail(`content guard must follow channel "${channel.name}"`);
    }
    contentNode.ifProp = channel.valueProp;
  }
  if (input.presence === "clamp" && contract.textOverflow?.kind !== "line-clamp") {
    fail("clamp presence requires line-clamp textOverflow");
  }
  const seen = new Set<string>();
  const triggers = input.triggers.map(trigger => {
    if (seen.has(trigger.part)) fail(`duplicate trigger "${trigger.part}"`);
    seen.add(trigger.part);
    const part = parts.find(p => p.name === trigger.part) ?? fail(`trigger part "${trigger.part}" does not exist`);
    if (!part.details?.interactive) fail(`trigger "${part.name}" must be interactive`);
    const repeated = trigger.operation === "select" || trigger.operation === "toggle-item";
    const compatible = trigger.operation === "select" ? channel.valueType === "string"
      : trigger.operation === "toggle-item" ? channel.valueType?.replace(/\s/g, "") === "string|string[]"
      : channel.valueType === "boolean";
    if (!compatible) {
      fail(`operation "${trigger.operation}" is incompatible with ${channel.valueType}`);
    }
    const node = nodes.get(part.name);
    if (dom && !node) fail(`trigger part "${part.name}" is not rendered`);
    // Repeated item and surface controllers own their target-specific event
    // delivery. Plain DOM activations are synthesized here, exactly once.
    if (node && !repeated) {
      if (node.events.click) fail(`owns trigger click; remove anatomy.dom click on "${part.name}"`);
      // The event identifies the channel setter; ActivationIR owns its operation.
      node.events.click = { kind: "channel", channel: channel.name, field: "onChange" };
      node.activation = {
        channel,
        operation: trigger.operation as ActivationIR["operation"],
        cancelNativeDefault: node.tag === "summary",
        disabledProp: input.disabledProp,
      };
      if (input.disabledProp) {
        node.bindings[node.tag === "button" ? "disabled" : "aria-disabled"] = { kind: "prop", prop: input.disabledProp };
      }
    }
    return { part, operation: trigger.operation };
  });
  return { channel, content, presence: input.presence, triggers, disabledProp: input.disabledProp, focusContainer };
}
