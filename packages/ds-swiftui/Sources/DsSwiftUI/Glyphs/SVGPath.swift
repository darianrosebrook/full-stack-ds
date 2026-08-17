import SwiftUI

// Hand-maintained glyph runtime (alongside FsdsTheme) — NOT generated.
// SVG path `d` string → SwiftUI Path for the FSDS icon catalog's closed
// command vocabulary (M m L l H h V v A a Z, spike-validated against the
// real catalog glyphs: FEAT-SWIFTUI-ICON-GLYPH-01). Arcs convert to cubic
// Béziers via the standard SVG endpoint parameterization — SwiftUI's Path
// has no native arc command.
public enum SVGPath {
    public static func parse(_ d: String) -> Path {
        var parser = Parser(d: d)
        return parser.parse()
    }

    private struct Parser {
        let chars: [Character]
        var i = 0
        var path = Path()
        var current = CGPoint.zero
        var subpathStart = CGPoint.zero
        var lastControl: CGPoint?
        var inSubpath = false

        init(d: String) { chars = Array(d) }

        mutating func parse() -> Path {
            var command: Character = " "
            while i < chars.count {
                skipWhitespace()
                guard i < chars.count else { break }
                let c = chars[i]
                if c.isLetter { command = c; i += 1 }
                switch command {
                case "M": let p = point(); emit(p)
                          current = p; subpathStart = p; command = "L"
                case "m": let p = offset(); emit(p)
                          current = p; subpathStart = p; command = "l"
                case "L": let p = point(); path.addLine(to: p); current = p
                case "l": let p = offset(); path.addLine(to: p); current = p
                case "H": let p = CGPoint(x: number(), y: current.y); path.addLine(to: p); current = p
                case "h": let p = CGPoint(x: current.x + number(), y: current.y); path.addLine(to: p); current = p
                case "V": let p = CGPoint(x: current.x, y: number()); path.addLine(to: p); current = p
                case "v": let p = CGPoint(x: current.x, y: current.y + number()); path.addLine(to: p); current = p
                case "A": arc(absolute: true)
                case "a": arc(absolute: false)
                case "Z", "z": path.closeSubpath(); current = subpathStart
                default: i += 1
                }
                lastControl = nil
            }
            return path
        }

        mutating func emit(_ p: CGPoint) {
            if inSubpath { path.addLine(to: p) } else { path.move(to: p); inSubpath = true }
        }

        mutating func arc(absolute: Bool) {
            let rx = number(), ry = number(), rotation = number()
            let largeArc = number() != 0, sweep = number() != 0
            let end = absolute ? point() : offset()
            let start = current
            appendArc(from: start, to: end, rx: rx, ry: ry, rotation: rotation * .pi / 180,
                      largeArc: largeArc, sweep: sweep, into: &path)
            current = end
        }

        mutating func number() -> CGFloat {
            skipSeparators()
            var s = ""
            if i < chars.count && (chars[i] == "-" || chars[i] == "+") { s.append(chars[i]); i += 1 }
            while i < chars.count, chars[i].isNumber || chars[i] == "." { s.append(chars[i]); i += 1 }
            return CGFloat(Double(s) ?? 0)
        }
        mutating func point() -> CGPoint { CGPoint(x: number(), y: number()) }
        mutating func offset() -> CGPoint {
            let dx = number(); skipSeparators(); let dy = number()
            return CGPoint(x: current.x + dx, y: current.y + dy)
        }
        mutating func skipWhitespace() { while i < chars.count && chars[i].isWhitespace { i += 1 } }
        mutating func skipSeparators() {
            while i < chars.count && (chars[i].isWhitespace || chars[i] == ",") { i += 1 }
        }

    }

    /// SVG elliptical arc → cubic Bézier segments (the standard endpoint
    /// parameterization conversion, as every SVG renderer implements).
    static func appendArc(
        from start: CGPoint, to end: CGPoint,
        rx: CGFloat, ry: CGFloat, rotation: CGFloat,
        largeArc: Bool, sweep: Bool,
        into path: inout Path
    ) {
        var rx = abs(rx), ry = abs(ry)
        if rx == 0 || ry == 0 { path.addLine(to: end); return }
        let phi = rotation
        let cosPhi = cos(phi), sinPhi = sin(phi)
        let dx2 = (start.x - end.x) / 2, dy2 = (start.y - end.y) / 2
        let x1p = cosPhi * dx2 + sinPhi * dy2
        let y1p = -sinPhi * dx2 + cosPhi * dy2
        var lambda = x1p * x1p / (rx * rx) + y1p * y1p / (ry * ry)
        if lambda > 1 {
            let s = sqrt(lambda)
            rx *= s; ry *= s
            lambda = 1
        }
        let sign: CGFloat = (largeArc != sweep) ? 1 : -1
        let numerator = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p
        let denominator = rx * rx * y1p * y1p + ry * ry * x1p * x1p
        let co = sign * sqrt(max(0, numerator / denominator))
        let cxp = co * rx * y1p / ry
        let cyp = -co * ry * x1p / rx
        let cx = cosPhi * cxp - sinPhi * cyp + (start.x + end.x) / 2
        let cy = sinPhi * cxp + cosPhi * cyp + (start.y + end.y) / 2
        func angle(_ ux: CGFloat, _ uy: CGFloat, _ vx: CGFloat, _ vy: CGFloat) -> CGFloat {
            let dot = ux * vx + uy * vy
            let len = sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy))
            var a = acos(min(1, max(-1, dot / len)))
            if ux * vy - uy * vx < 0 { a = -a }
            return a
        }
        let theta1 = angle(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry)
        var dTheta = angle((x1p - cxp) / rx, (y1p - cyp) / ry,
                           (-x1p - cxp) / rx, (-y1p - cyp) / ry)
        if !sweep && dTheta > 0 { dTheta -= 2 * .pi }
        if sweep && dTheta < 0 { dTheta += 2 * .pi }
        let segments = max(1, Int(ceil(abs(dTheta) / (.pi / 2))))
        let delta = dTheta / CGFloat(segments)
        let t = 4 / 3 * tan(delta / 4)
        var theta = theta1
        for _ in 0..<segments {
            let cos1 = cos(theta), sin1 = sin(theta)
            let cos2 = cos(theta + delta), sin2 = sin(theta + delta)
            func pt(_ c: CGFloat, _ s: CGFloat) -> CGPoint {
                CGPoint(
                    x: cx + rx * cosPhi * c - ry * sinPhi * s,
                    y: cy + rx * sinPhi * c + ry * cosPhi * s
                )
            }
            let p1 = pt(cos1 - t * sin1, sin1 + t * cos1)
            let p2 = pt(cos2 + t * sin2, sin2 - t * cos2)
            let p3 = pt(cos2, sin2)
            path.addCurve(to: p3, control1: p1, control2: p2)
            theta += delta
        }
    }
}
