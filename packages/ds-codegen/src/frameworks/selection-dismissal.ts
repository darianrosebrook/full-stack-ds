import type { ComponentIR } from "../ir.js";

/** Selection dismissal is a contract policy over the composite channel. */
export function selectionDismissal(ir: ComponentIR, channel: string): { multiple?: string; enabledBy?: string; enabled: boolean; returnFocus: boolean } | undefined {
  if (ir.compositeControl?.channel.name !== channel || !ir.behavior.primaryDisclosureChannel) return undefined;
  const trigger = ir.behavior.normalizedDismissalTriggers.find(t => t.event === "selection");
  if (!trigger) return undefined;
  const update = ir.compositeControl.update;
  const gate = update.kind === "channelUpdate" && update.op === "toggleMembership" ? update.operands[1] : undefined;
  return {
    multiple: gate?.kind === "prop" ? gate.prop : undefined,
    enabledBy: trigger.enabledByProp,
    enabled: trigger.defaultEnabled !== false,
    returnFocus: Boolean(ir.behavior.focus?.returnFocus),
  };
}

export function selectionChangeHandler(ir: ComponentIR, channel: string, callback: string, readProp: (name: string) => string, close: string, focus: string, readDismissalProp = readProp): string | undefined {
  const policy = selectionDismissal(ir, channel);
  if (!policy || (!policy.enabled && !policy.enabledBy)) return undefined;
  const enabled = policy.enabledBy ? `(${readDismissalProp(policy.enabledBy)} ?? ${policy.enabled})` : String(policy.enabled);
  const single = policy.multiple ? `!${readProp(policy.multiple)}` : "true";
  const condition = enabled === "true" ? single : single === "true" ? enabled : `${enabled} && ${single}`;
  const dismissal = `${close}; ${policy.returnFocus ? `requestAnimationFrame(() => { ${focus}; });` : ""}`;
  return `(value) => { ${callback}(value); ${condition === "true" ? dismissal : `if (${condition}) { ${dismissal} }`} }`;
}
