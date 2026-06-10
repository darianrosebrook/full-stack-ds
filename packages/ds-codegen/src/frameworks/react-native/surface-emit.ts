import type {
  ComponentIR,
  DomNodeIR,
  NormalizedChannelIR,
  NormalizedDismissalTriggerIR,
  SurfaceIR,
} from "../../ir.js";

/**
 * React Native presence-surface substrate (FEAT-MOBILE-RN-SURFACE-001).
 *
 * Non-anchored surfaces lower by their taxonomy facts:
 *   - blocking modality (dialog, sheet)        → RN `Modal` host
 *       escape dismissal      → Modal.onRequestClose (Android back / iOS gesture)
 *       outside-click         → overlay-part Pressable onPress
 *       positioning centered  → animationType "fade"
 *       positioning viewport-edge / fullscreen → animationType "slide"
 *   - non-blocking modality (toast)            → in-tree host, no Modal
 *       aria-live on the dom tree lowers to accessibilityLiveRegion
 *
 * Anchored kinds (tooltip, popover, coachmark) need an anchor-measurement
 * substrate React Native does not have yet; they stay on the generic path
 * and are documented as a known gap.
 */
export type RnSurfaceMode = "modal" | "non-blocking";

export interface RnSurfaceLowering {
  surface: SurfaceIR;
  mode: RnSurfaceMode;
  /**
   * Channel carrying the surface open state, resolved from the content
   * part's `if` guard (e.g. Dialog's modal node guards on the openness
   * channel). Falls back to the component's single boolean channel.
   */
  openChannel: NormalizedChannelIR | undefined;
  /** Escape-mode dismissal trigger wiring (Modal.onRequestClose), if declared. */
  escapeTrigger: NormalizedDismissalTriggerIR | undefined;
  escapeDeclared: boolean;
  /** Outside-click dismissal trigger wiring (overlay press), if declared. */
  outsideTrigger: NormalizedDismissalTriggerIR | undefined;
  outsideDeclared: boolean;
}

const RN_SURFACE_STRATEGIES = new Set(["centered", "viewport-edge", "fullscreen"]);

export function rnSurfaceLowering(ir: ComponentIR): RnSurfaceLowering | null {
  const surface = ir.surface;
  if (!surface) return null;
  const strategy = surface.positioning?.strategy;
  if (!strategy || !RN_SURFACE_STRATEGIES.has(strategy)) return null;

  const triggers = ir.behavior.normalizedDismissalTriggers;
  return {
    surface,
    mode: surface.modality === "blocking" ? "modal" : "non-blocking",
    openChannel: resolveOpenChannel(ir, surface),
    escapeTrigger: triggers.find((trigger) => trigger.event === "escape"),
    escapeDeclared: surface.dismissal.includes("escape"),
    outsideTrigger: triggers.find(
      (trigger) => trigger.event === "overlayClick" || trigger.event === "outsideClick",
    ),
    outsideDeclared: surface.dismissal.includes("outside-click"),
  };
}

function resolveOpenChannel(
  ir: ComponentIR,
  surface: SurfaceIR,
): NormalizedChannelIR | undefined {
  const contentPart = surface.content?.part.name;
  if (contentPart && ir.dom) {
    const ifProp = findPartIfProp(ir.dom, contentPart);
    if (ifProp) {
      const byGuard = ir.behavior.normalizedChannels.find(
        (channel) => channel.name === ifProp || channel.valueProp === ifProp,
      );
      if (byGuard) return byGuard;
    }
  }
  const booleans = ir.behavior.normalizedChannels.filter(
    (channel) => channel.valueType === "boolean",
  );
  return booleans.length === 1 ? booleans[0] : undefined;
}

function findPartIfProp(node: DomNodeIR, partName: string): string | undefined {
  if (node.part === partName && node.ifProp) return node.ifProp;
  for (const child of node.children) {
    const found = findPartIfProp(child, partName);
    if (found) return found;
  }
  return undefined;
}

/**
 * Factory-level surface routing stays disabled: the substrate integrates
 * through the generic component path (component-source.ts consumes
 * rnSurfaceLowering), which keeps the tokens/styles/test plumbing shared
 * with every other component.
 */
export function isSurfaceComponent(_ir: ComponentIR): boolean {
  return false;
}

export interface ReactNativeSurfaceFiles {
  componentFile: string;
  stylesFile: string;
  hookFile: string | null;
}

export function generateReactNativeSurfaceFiles(
  _ir: ComponentIR,
): ReactNativeSurfaceFiles {
  throw new Error(
    "generateReactNativeSurfaceFiles: RN surfaces emit through the generic component path (rnSurfaceLowering), not a separate factory branch.",
  );
}
