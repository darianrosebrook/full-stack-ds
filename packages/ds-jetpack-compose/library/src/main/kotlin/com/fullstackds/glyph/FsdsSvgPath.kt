// FsdsSvgPath — SVG path `d` string → Compose Path for the FSDS icon
// catalog's closed command vocabulary (M m L l H h V v A a Z). Kotlin port
// of the SwiftUI SVGPath runtime (FEAT-SWIFTUI-ICON-GLYPH-01 spike math),
// so both native targets share the same arc→cubic endpoint
// parameterization — no silent geometry drift between them.
//
// This file is NOT generated; it is committed substrate, like FsdsTheme.kt.
// Zero androidx.compose.material imports: compose-ui graphics only.

package com.fullstackds.glyph

import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Path
import kotlin.math.abs
import kotlin.math.acos
import kotlin.math.ceil
import kotlin.math.cos
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin
import kotlin.math.sqrt
import kotlin.math.tan

object FsdsSvgPath {
    fun parse(d: String): Path = Parser(d).parse()

    private class Parser(val d: String) {
        var i = 0
        var command = ' '
        val path = Path()
        var current = Offset.Zero
        var subpathStart = Offset.Zero
        var inSubpath = false

        fun parse(): Path {
            while (i < d.length) {
                skipWhitespace()
                if (i >= d.length) break
                val c = d[i]
                if (c.isLetter()) { command = c; i += 1 }
                when (command) {
                    'M' -> { val p = point(); emit(p); current = p; subpathStart = p; command = 'L' }
                    'm' -> { val p = offset(); emit(p); current = p; subpathStart = p; command = 'l' }
                    'L' -> { val p = point(); path.lineTo(p.x, p.y); current = p }
                    'l' -> { val p = offset(); path.lineTo(p.x, p.y); current = p }
                    'H' -> { val x = number().toFloat(); path.lineTo(x, current.y); current = Offset(x, current.y) }
                    'h' -> { val x = current.x + number().toFloat(); path.lineTo(x, current.y); current = Offset(x, current.y) }
                    'V' -> { val y = number().toFloat(); path.lineTo(current.x, y); current = Offset(current.x, y) }
                    'v' -> { val y = current.y + number().toFloat(); path.lineTo(current.x, y); current = Offset(current.x, y) }
                    'A' -> arc(absolute = true)
                    'a' -> arc(absolute = false)
                    'Z', 'z' -> { path.close(); current = subpathStart }
                    else -> i += 1
                }
            }
            return path
        }

        fun emit(p: Offset) {
            if (inSubpath) path.lineTo(p.x, p.y)
            else { path.moveTo(p.x, p.y); inSubpath = true }
        }

        fun arc(absolute: Boolean) {
            val rx = number(); val ry = number(); val rotation = number()
            val largeArc = number() != 0.0; val sweep = number() != 0.0
            val end = if (absolute) point() else offset()
            appendArc(
                start = current, end = end,
                rx = rx, ry = ry, rotation = Math.toRadians(rotation),
                largeArc = largeArc, sweep = sweep, path = path,
            )
            current = end
        }

        fun number(): Double {
            skipSeparators()
            val sb = StringBuilder()
            if (i < d.length && (d[i] == '-' || d[i] == '+')) { sb.append(d[i]); i += 1 }
            while (i < d.length && (d[i].isDigit() || d[i] == '.')) { sb.append(d[i]); i += 1 }
            return sb.toString().toDoubleOrNull() ?: 0.0
        }

        fun point(): Offset { val x = number(); skipSeparators(); val y = number(); return Offset(x.toFloat(), y.toFloat()) }

        fun offset(): Offset {
            val dx = number(); skipSeparators(); val dy = number()
            return Offset((current.x + dx).toFloat(), (current.y + dy).toFloat())
        }

        fun skipWhitespace() { while (i < d.length && d[i].isWhitespace()) i += 1 }

        fun skipSeparators() { while (i < d.length && (d[i].isWhitespace() || d[i] == ',')) i += 1 }
    }

    /** SVG elliptical arc → cubic Bézier segments (the standard endpoint
     *  parameterization conversion, as every SVG renderer implements). */
    fun appendArc(
        start: Offset,
        end: Offset,
        rx: Double,
        ry: Double,
        rotation: Double,
        largeArc: Boolean,
        sweep: Boolean,
        path: Path,
    ) {
        var rx = abs(rx); var ry = abs(ry)
        if (rx == 0.0 || ry == 0.0) { path.lineTo(end.x, end.y); return }
        val phi = rotation
        val cosPhi = cos(phi); val sinPhi = sin(phi)
        val dx2 = (start.x - end.x) / 2.0
        val dy2 = (start.y - end.y) / 2.0
        val x1p = cosPhi * dx2 + sinPhi * dy2
        val y1p = -sinPhi * dx2 + cosPhi * dy2
        var lambda = x1p * x1p / (rx * rx) + y1p * y1p / (ry * ry)
        if (lambda > 1.0) {
            val s = sqrt(lambda)
            rx *= s; ry *= s
            lambda = 1.0
        }
        val sign = if (largeArc != sweep) 1.0 else -1.0
        val numerator = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p
        val denominator = rx * rx * y1p * y1p + ry * ry * x1p * x1p
        val co = sign * sqrt(max(0.0, numerator / denominator))
        val cxp = co * rx * y1p / ry
        val cyp = -co * ry * x1p / rx
        val cx = cosPhi * cxp - sinPhi * cyp + (start.x + end.x) / 2.0
        val cy = sinPhi * cxp + cosPhi * cyp + (start.y + end.y) / 2.0
        fun angle(ux: Double, uy: Double, vx: Double, vy: Double): Double {
            val dot = ux * vx + uy * vy
            val len = sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy))
            var a = acos(min(1.0, max(-1.0, dot / len)))
            if (ux * vy - uy * vx < 0.0) a = -a
            return a
        }
        val theta1 = angle(1.0, 0.0, (x1p - cxp) / rx, (y1p - cyp) / ry)
        var dTheta = angle(
            (x1p - cxp) / rx, (y1p - cyp) / ry,
            (-x1p - cxp) / rx, (-y1p - cyp) / ry,
        )
        if (!sweep && dTheta > 0.0) dTheta -= 2.0 * Math.PI
        if (sweep && dTheta < 0.0) dTheta += 2.0 * Math.PI
        val segments = max(1, ceil(abs(dTheta) / (Math.PI / 2)).toInt())
        val delta = dTheta / segments
        val t = 4.0 / 3.0 * tan(delta / 4.0)
        var theta = theta1
        for (seg in 0 until segments) {
            val cos1 = cos(theta); val sin1 = sin(theta)
            val cos2 = cos(theta + delta); val sin2 = sin(theta + delta)
            fun pt(c: Double, s: Double) = Offset(
                (cx + rx * cosPhi * c - ry * sinPhi * s).toFloat(),
                (cy + rx * sinPhi * c + ry * cosPhi * s).toFloat(),
            )
            val p1 = pt(cos1 - t * sin1, sin1 + t * cos1)
            val p2 = pt(cos2 + t * sin2, sin2 - t * cos2)
            val p3 = pt(cos2, sin2)
            path.cubicTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y)
            theta += delta
        }
    }
}
