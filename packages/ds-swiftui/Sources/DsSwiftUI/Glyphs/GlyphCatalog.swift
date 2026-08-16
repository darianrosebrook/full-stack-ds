import SwiftUI

// @generated:start catalog
/// FSDS glyph catalog, generated from packages/ds-iconography (29+ icons, closed M/L/H/V/A/Z vocabulary). Rendered through the hand-maintained SVGPath runtime; strokes inherit foregroundStyle (the currentColor analog).
public enum GlyphCatalog {
    public struct GlyphVariant: Sendable {
        public let viewBox: CGFloat
        public let paths: [GlyphStroke]
    }

    public struct GlyphStroke: Sendable {
        public let d: String
        public let width: CGFloat
    }

    public static let variants: [String: [Int: GlyphVariant]] = [
        "alarm": [
            16: GlyphVariant(
                viewBox: 16,
                paths: [
                    GlyphStroke(d: "M8 3A5.5 5.5 0 1 1 8 14A5.5 5.5 0 1 1 8 3", width: 1.5),
                    GlyphStroke(d: "M8 6.25V8.9L9.5 10.4", width: 1.5),
                    GlyphStroke(d: "M4.25 2.5L2.25 4.5M11.75 2.5L13.75 4.5M4.25 12.3L2.75 14M11.75 12.3L13.25 14", width: 1.5),
                ]
            ),
            24: GlyphVariant(
                viewBox: 24,
                paths: [
                    GlyphStroke(d: "M12 5A8 8 0 1 1 12 21A8 8 0 1 1 12 5", width: 1.5),
                    GlyphStroke(d: "M12 9V13L14 15", width: 1.5),
                    GlyphStroke(d: "M5 3L2 6M19 3L22 6M6.38 18.7L4 21M17.64 18.67L20 21", width: 1.5),
                ]
            ),
        ],
        "arrow-down": [
            16: GlyphVariant(
                viewBox: 16,
                paths: [
                    GlyphStroke(d: "M8 3V13", width: 1.5),
                    GlyphStroke(d: "M4 9L8 13L12 9", width: 1.5),
                ]
            ),
            24: GlyphVariant(
                viewBox: 24,
                paths: [
                    GlyphStroke(d: "M12 4V20", width: 1.5),
                    GlyphStroke(d: "M6 14L12 20L18 14", width: 1.5),
                ]
            ),
        ],
        "arrow-left": [
            16: GlyphVariant(
                viewBox: 16,
                paths: [
                    GlyphStroke(d: "M13 8H3", width: 1.5),
                    GlyphStroke(d: "M7 4L3 8L7 12", width: 1.5),
                ]
            ),
            24: GlyphVariant(
                viewBox: 24,
                paths: [
                    GlyphStroke(d: "M20 12H4", width: 1.5),
                    GlyphStroke(d: "M10 6L4 12L10 18", width: 1.5),
                ]
            ),
        ],
        "arrow-right": [
            16: GlyphVariant(
                viewBox: 16,
                paths: [
                    GlyphStroke(d: "M3 8H13", width: 1.5),
                    GlyphStroke(d: "M9 4L13 8L9 12", width: 1.5),
                ]
            ),
            24: GlyphVariant(
                viewBox: 24,
                paths: [
                    GlyphStroke(d: "M4 12H20", width: 1.5),
                    GlyphStroke(d: "M14 6L20 12L14 18", width: 1.5),
                ]
            ),
        ],
        "arrow-up": [
            16: GlyphVariant(
                viewBox: 16,
                paths: [
                    GlyphStroke(d: "M8 13V3", width: 1.5),
                    GlyphStroke(d: "M4 7L8 3L12 7", width: 1.5),
                ]
            ),
            24: GlyphVariant(
                viewBox: 24,
                paths: [
                    GlyphStroke(d: "M12 20V4", width: 1.5),
                    GlyphStroke(d: "M6 10L12 4L18 10", width: 1.5),
                ]
            ),
        ],
        "arrow-up-down": [
            16: GlyphVariant(
                viewBox: 16,
                paths: [
                    GlyphStroke(d: "M14 10L11 13L8 10M11 13V3M2 6L5 3L8 6M5 3V13", width: 1.5),
                ]
            ),
            24: GlyphVariant(
                viewBox: 24,
                paths: [
                    GlyphStroke(d: "M21 16L17 20L13 16M17 20V4M3 8L7 4L11 8M7 4V20", width: 1.5),
                ]
            ),
        ],
        "at-sign": [
            16: GlyphVariant(
                viewBox: 16,
                paths: [
                    GlyphStroke(d: "M8 5.33A2.67 2.67 0 1 1 8 10.67A2.67 2.67 0 1 1 8 5.33", width: 1.5),
                    GlyphStroke(d: "M10.67 5.33V8.67A2 2 0 0 0 14.67 8.67V8A6.67 6.67 0 1 0 12 13.33", width: 1.5),
                ]
            ),
            24: GlyphVariant(
                viewBox: 24,
                paths: [
                    GlyphStroke(d: "M12 8A4 4 0 1 1 12 16A4 4 0 1 1 12 8", width: 1.5),
                    GlyphStroke(d: "M16 8V13A3 3 0 0 0 22 13V12A10 10 0 1 0 18 20", width: 1.5),
                ]
            ),
        ],
        "baseline": [
            16: GlyphVariant(
                viewBox: 16,
                paths: [
                    GlyphStroke(d: "M2.5 13.5H13.5M4 11L8 3L12 11M5.33 8H10.67", width: 1.5),
                ]
            ),
            24: GlyphVariant(
                viewBox: 24,
                paths: [
                    GlyphStroke(d: "M4 20H20M6 16L12 4L18 16M8 12H16", width: 1.5),
                ]
            ),
        ],
        "calculator": [
            16: GlyphVariant(
                viewBox: 16,
                paths: [
                    GlyphStroke(d: "M4.5 1.5H11.5A1.5 1.5 0 0 1 13 3V13A1.5 1.5 0 0 1 11.5 14.5H4.5A1.5 1.5 0 0 1 3 13V3A1.5 1.5 0 0 1 4.5 1.5", width: 1.5),
                    GlyphStroke(d: "M5.5 4.5H10.5M10.5 7.5H10.51M8 7.5H8.01M5.5 7.5H5.51M8 10.5H8.01M5.5 10.5H5.51M8 13H8.01M5.5 13H5.51M10.5 10.5V13", width: 1.5),
                ]
            ),
            24: GlyphVariant(
                viewBox: 24,
                paths: [
                    GlyphStroke(d: "M6 2H18A2 2 0 0 1 20 4V20A2 2 0 0 1 18 22H6A2 2 0 0 1 4 20V4A2 2 0 0 1 6 2", width: 1.5),
                    GlyphStroke(d: "M8 6H16M16 10H16.01M12 10H12.01M8 10H8.01M12 14H12.01M8 14H8.01M12 18H12.01M8 18H8.01M16 14V18", width: 1.5),
                ]
            ),
        ],
        "check": [
            16: GlyphVariant(
                viewBox: 16,
                paths: [
                    GlyphStroke(d: "M3.5 8.5L6.5 11.5L12.5 4.5", width: 1.5),
                ]
            ),
            24: GlyphVariant(
                viewBox: 24,
                paths: [
                    GlyphStroke(d: "M5 12.5L9.5 17L19 6.5", width: 1.5),
                ]
            ),
        ],
        "chevron-down": [
            16: GlyphVariant(
                viewBox: 16,
                paths: [
                    GlyphStroke(d: "M4 6L8 10L12 6", width: 1.5),
                ]
            ),
            24: GlyphVariant(
                viewBox: 24,
                paths: [
                    GlyphStroke(d: "M6 9L12 15L18 9", width: 1.5),
                ]
            ),
        ],
        "chevron-right": [
            16: GlyphVariant(
                viewBox: 16,
                paths: [
                    GlyphStroke(d: "M6 4L10 8L6 12", width: 1.5),
                ]
            ),
            24: GlyphVariant(
                viewBox: 24,
                paths: [
                    GlyphStroke(d: "M9 6L15 12L9 18", width: 1.5),
                ]
            ),
        ],
        "circle": [
            16: GlyphVariant(
                viewBox: 16,
                paths: [
                    GlyphStroke(d: "M8 2.5A5.5 5.5 0 1 1 8 13.5A5.5 5.5 0 1 1 8 2.5", width: 1.5),
                ]
            ),
            24: GlyphVariant(
                viewBox: 24,
                paths: [
                    GlyphStroke(d: "M12 3.5A8.5 8.5 0 1 1 12 20.5A8.5 8.5 0 1 1 12 3.5", width: 1.5),
                ]
            ),
        ],
        "circle-dot": [
            16: GlyphVariant(
                viewBox: 16,
                paths: [
                    GlyphStroke(d: "M8 2A6 6 0 1 1 8 14A6 6 0 1 1 8 2", width: 1.5),
                    GlyphStroke(d: "M8 8H8.01", width: 2),
                ]
            ),
            24: GlyphVariant(
                viewBox: 24,
                paths: [
                    GlyphStroke(d: "M12 2A10 10 0 1 1 12 22A10 10 0 1 1 12 2", width: 1.5),
                    GlyphStroke(d: "M12 12H12.01", width: 2),
                ]
            ),
        ],
        "external-link": [
            16: GlyphVariant(
                viewBox: 16,
                paths: [
                    GlyphStroke(d: "M9 3H4.5A1.5 1.5 0 0 0 3 4.5V11.5A1.5 1.5 0 0 0 4.5 13H11.5A1.5 1.5 0 0 0 13 11.5V7", width: 1.5),
                    GlyphStroke(d: "M9 3H13V7M13 3L7 9", width: 1.5),
                ]
            ),
            24: GlyphVariant(
                viewBox: 24,
                paths: [
                    GlyphStroke(d: "M13 4H6.5A2.5 2.5 0 0 0 4 6.5V17.5A2.5 2.5 0 0 0 6.5 20H17.5A2.5 2.5 0 0 0 20 17.5V11", width: 1.5),
                    GlyphStroke(d: "M14 4H20V10M20 4L11 13", width: 1.5),
                ]
            ),
        ],
        "home": [
            16: GlyphVariant(
                viewBox: 16,
                paths: [
                    GlyphStroke(d: "M3 7.5L8 3L13 7.5V13H9.5V9.5H6.5V13H3V7.5Z", width: 1.5),
                ]
            ),
            24: GlyphVariant(
                viewBox: 24,
                paths: [
                    GlyphStroke(d: "M4.5 11L12 4.5L19.5 11V19.5H14.5V14.5H9.5V19.5H4.5V11Z", width: 1.5),
                ]
            ),
        ],
        "info": [
            16: GlyphVariant(
                viewBox: 16,
                paths: [
                    GlyphStroke(d: "M8 2.5A5.5 5.5 0 1 1 8 13.5A5.5 5.5 0 1 1 8 2.5", width: 1.5),
                    GlyphStroke(d: "M8 7.5V11", width: 1.5),
                    GlyphStroke(d: "M8 5.25H8.01", width: 1.5),
                ]
            ),
            24: GlyphVariant(
                viewBox: 24,
                paths: [
                    GlyphStroke(d: "M12 3.5A8.5 8.5 0 1 1 12 20.5A8.5 8.5 0 1 1 12 3.5", width: 1.5),
                    GlyphStroke(d: "M12 11V16", width: 1.5),
                    GlyphStroke(d: "M12 8H12.01", width: 1.5),
                ]
            ),
        ],
        "maximize": [
            16: GlyphVariant(
                viewBox: 16,
                paths: [
                    GlyphStroke(d: "M6 3H3V6M10 3H13V6M3 10V13H6M13 10V13H10", width: 1.5),
                ]
            ),
            24: GlyphVariant(
                viewBox: 24,
                paths: [
                    GlyphStroke(d: "M9 4H4V9M15 4H20V9M4 15V20H9M20 15V20H15", width: 1.5),
                ]
            ),
        ],
        "menu": [
            16: GlyphVariant(
                viewBox: 16,
                paths: [
                    GlyphStroke(d: "M3 4.5H13M3 8H13M3 11.5H13", width: 1.5),
                ]
            ),
            24: GlyphVariant(
                viewBox: 24,
                paths: [
                    GlyphStroke(d: "M4 6H20M4 12H20M4 18H20", width: 1.5),
                ]
            ),
        ],
        "minimize": [
            16: GlyphVariant(
                viewBox: 16,
                paths: [
                    GlyphStroke(d: "M3 6H6V3M13 6H10V3M3 10H6V13M13 10H10V13", width: 1.5),
                ]
            ),
            24: GlyphVariant(
                viewBox: 24,
                paths: [
                    GlyphStroke(d: "M4 9H9V4M20 9H15V4M4 15H9V20M20 15H15V20", width: 1.5),
                ]
            ),
        ],
        "more-horizontal": [
            16: GlyphVariant(
                viewBox: 16,
                paths: [
                    GlyphStroke(d: "M3.5 8H3.51M8 8H8.01M12.5 8H12.51", width: 2.5),
                ]
            ),
            24: GlyphVariant(
                viewBox: 24,
                paths: [
                    GlyphStroke(d: "M5 12H5.01M12 12H12.01M19 12H19.01", width: 3),
                ]
            ),
        ],
        "more-vertical": [
            16: GlyphVariant(
                viewBox: 16,
                paths: [
                    GlyphStroke(d: "M8 3.5H8.01M8 8H8.01M8 12.5H8.01", width: 2.5),
                ]
            ),
            24: GlyphVariant(
                viewBox: 24,
                paths: [
                    GlyphStroke(d: "M12 5H12.01M12 12H12.01M12 19H12.01", width: 3),
                ]
            ),
        ],
        "panel-left": [
            16: GlyphVariant(
                viewBox: 16,
                paths: [
                    GlyphStroke(d: "M3.5 3H12.5A1.5 1.5 0 0 1 14 4.5V11.5A1.5 1.5 0 0 1 12.5 13H3.5A1.5 1.5 0 0 1 2 11.5V4.5A1.5 1.5 0 0 1 3.5 3Z", width: 1.5),
                    GlyphStroke(d: "M6 3V13", width: 1.5),
                ]
            ),
            24: GlyphVariant(
                viewBox: 24,
                paths: [
                    GlyphStroke(d: "M5.5 4H18.5A2.5 2.5 0 0 1 21 6.5V17.5A2.5 2.5 0 0 1 18.5 20H5.5A2.5 2.5 0 0 1 3 17.5V6.5A2.5 2.5 0 0 1 5.5 4Z", width: 1.5),
                    GlyphStroke(d: "M9 4V20", width: 1.5),
                ]
            ),
        ],
        "panel-right": [
            16: GlyphVariant(
                viewBox: 16,
                paths: [
                    GlyphStroke(d: "M3.5 3H12.5A1.5 1.5 0 0 1 14 4.5V11.5A1.5 1.5 0 0 1 12.5 13H3.5A1.5 1.5 0 0 1 2 11.5V4.5A1.5 1.5 0 0 1 3.5 3Z", width: 1.5),
                    GlyphStroke(d: "M10 3V13", width: 1.5),
                ]
            ),
            24: GlyphVariant(
                viewBox: 24,
                paths: [
                    GlyphStroke(d: "M5.5 4H18.5A2.5 2.5 0 0 1 21 6.5V17.5A2.5 2.5 0 0 1 18.5 20H5.5A2.5 2.5 0 0 1 3 17.5V6.5A2.5 2.5 0 0 1 5.5 4Z", width: 1.5),
                    GlyphStroke(d: "M15 4V20", width: 1.5),
                ]
            ),
        ],
        "placeholder": [
            17: GlyphVariant(
                viewBox: 17,
                paths: [
                    GlyphStroke(d: "M16.5 8.5A8 8 0 1 1 0.5 8.5A8 8 0 1 1 16.5 8.5", width: 1),
                    GlyphStroke(d: "M11.5 8.5A3 3 0 1 1 5.5 8.5A3 3 0 1 1 11.5 8.5", width: 1),
                ]
            ),
        ],
        "search": [
            16: GlyphVariant(
                viewBox: 16,
                paths: [
                    GlyphStroke(d: "M7 3A4 4 0 1 1 7 11A4 4 0 1 1 7 3", width: 1.5),
                    GlyphStroke(d: "M10 10L13.5 13.5", width: 1.5),
                ]
            ),
            24: GlyphVariant(
                viewBox: 24,
                paths: [
                    GlyphStroke(d: "M10.5 4.5A6 6 0 1 1 10.5 16.5A6 6 0 1 1 10.5 4.5", width: 1.5),
                    GlyphStroke(d: "M15 15L19.5 19.5", width: 1.5),
                ]
            ),
        ],
        "triangle-alert": [
            16: GlyphVariant(
                viewBox: 16,
                paths: [
                    GlyphStroke(d: "M8 2.25L14.5 13.25H1.5L8 2.25Z", width: 1.5),
                    GlyphStroke(d: "M8 6.5V9", width: 1.5),
                    GlyphStroke(d: "M8 11.25H8.01", width: 1.5),
                ]
            ),
            24: GlyphVariant(
                viewBox: 24,
                paths: [
                    GlyphStroke(d: "M12 3.5L21.5 19.5H2.5L12 3.5Z", width: 1.5),
                    GlyphStroke(d: "M12 9.5V14", width: 1.5),
                    GlyphStroke(d: "M12 16.75H12.01", width: 1.5),
                ]
            ),
        ],
        "user": [
            16: GlyphVariant(
                viewBox: 16,
                paths: [
                    GlyphStroke(d: "M8 4.25A2.25 2.25 0 1 1 8 8.75A2.25 2.25 0 1 1 8 4.25", width: 1.5),
                    GlyphStroke(d: "M3.5 13.5A4.5 4.5 0 0 1 12.5 13.5", width: 1.5),
                ]
            ),
            24: GlyphVariant(
                viewBox: 24,
                paths: [
                    GlyphStroke(d: "M12 6.5A3 3 0 1 1 12 12.5A3 3 0 1 1 12 6.5", width: 1.5),
                    GlyphStroke(d: "M5.5 20A6.5 6.5 0 0 1 18.5 20", width: 1.5),
                ]
            ),
        ],
        "x": [
            16: GlyphVariant(
                viewBox: 16,
                paths: [
                    GlyphStroke(d: "M4 4L12 12", width: 1.5),
                    GlyphStroke(d: "M12 4L4 12", width: 1.5),
                ]
            ),
            24: GlyphVariant(
                viewBox: 24,
                paths: [
                    GlyphStroke(d: "M6 6L18 18", width: 1.5),
                    GlyphStroke(d: "M18 6L6 18", width: 1.5),
                ]
            ),
        ],
    ]

    /// Decorative-by-default flags from the catalog semantics.
    public static let decorativeDefaults: Set<String> = [
        "alarm",
        "arrow-down",
        "arrow-left",
        "arrow-right",
        "arrow-up",
        "arrow-up-down",
        "at-sign",
        "baseline",
        "calculator",
        "check",
        "chevron-down",
        "chevron-right",
        "circle",
        "circle-dot",
        "external-link",
        "home",
        "info",
        "maximize",
        "menu",
        "minimize",
        "more-horizontal",
        "more-vertical",
        "panel-left",
        "panel-right",
        "placeholder",
        "search",
        "triangle-alert",
        "user",
        "x",
    ]

    /// Registry lookup every iconGlyph surface composes: the nearest
    /// authored grid ≤ the requested size renders and scales to frame.
    @ViewBuilder
    public static func glyph(named name: String, size: CGFloat) -> some View {
        if let byGrid = variants[name], !byGrid.isEmpty {
            let grids = byGrid.keys.sorted()
            let grid = grids.last(where: { CGFloat($0) <= size }) ?? grids[0]
            if let variant = byGrid[grid] {
                GlyphRenderer(variant: variant, frame: size)
            } else {
                unknown(name: name, size: size)
            }
        } else {
            // Unknown name: surface it through accessibility rather
            // than silently rendering nothing.
            unknown(name: name, size: size)
        }
    }

    private static func unknown(name: String, size: CGFloat) -> some View {
        UnknownGlyph(name: name, frame: size)
    }
}

private struct GlyphRenderer: View {
    let variant: GlyphCatalog.GlyphVariant
    let frame: CGFloat
    var body: some View {
        GeometryReader { geo in
            let scale = min(geo.size.width, geo.size.height) / variant.viewBox
            ZStack {
                ForEach(variant.paths.indices, id: \.self) { i in
                    SVGPath.parse(variant.paths[i].d)
                        .stroke(style: StrokeStyle(
                            lineWidth: variant.paths[i].width * scale,
                            lineCap: .round, lineJoin: .round))
                }
            }
            .scaleEffect(scale, anchor: .topLeading)
            .frame(width: variant.viewBox, height: variant.viewBox, alignment: .topLeading)
        }
        .frame(width: frame, height: frame)
    }
}

private struct UnknownGlyph: View {
    let name: String
    let frame: CGFloat
    var body: some View {
        RoundedRectangle(cornerRadius: 2)
            .strokeBorder(style: StrokeStyle(lineWidth: 1, dash: [2, 2]))
            .frame(width: frame, height: frame)
            .accessibilityLabel("unknown fsds icon: \(name)")
    }
}
// @generated:end
