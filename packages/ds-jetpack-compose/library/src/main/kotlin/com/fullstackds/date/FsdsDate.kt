// FsdsDate — day-granular operations over java.util.Date, the JVM
// realization of the contract's closed `dateDayOfMonth` projection plus the
// day comparisons a date grid needs (selection, today, range bounds).
//
// A java.util.Date carries an instant, not a calendar day, so every helper
// resolves the zone exactly once and compares calendar days rather than
// millisecond instants: two Dates 12 hours apart must compare equal when
// they fall on the same local day, and must compare unequal across midnight.
//
// This file is NOT generated; it is committed substrate, like FsdsTheme.kt
// and FsdsSvgPath.kt. Zero androidx.compose.material imports: java.time
// only, so it stays usable from any JVM target.

package com.fullstackds.date

import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.util.Date

object FsdsDate {
    /** The zone day boundaries are resolved in. Overridable so a caller (or a
     *  test) can pin the calendar day without mutating the process default. */
    var zone: ZoneId = ZoneId.systemDefault()

    /** The local calendar day an instant falls on. */
    fun dayOf(date: Date): LocalDate =
        Instant.ofEpochMilli(date.time).atZone(zone).toLocalDate()

    /** The contract's `dateDayOfMonth` projection: the rendered day label. */
    fun dayOfMonth(date: Date): Int = dayOf(date).dayOfMonth

    /** Same local calendar day — `null` is never the same day as anything. */
    fun isSameDay(date: Date, other: Date?): Boolean =
        other != null && dayOf(date) == dayOf(other)

    /** Does any entry fall on the same local day as `date`? */
    fun isSameDayAsAny(date: Date, others: List<Date>): Boolean =
        others.any { isSameDay(date, it) }

    fun isToday(date: Date): Boolean = dayOf(date) == LocalDate.now(zone)

    /** Day-granular bound checks: a bound equal to the day itself is inside. */
    fun isBefore(date: Date, bound: Date?): Boolean =
        bound != null && dayOf(date).isBefore(dayOf(bound))

    fun isAfter(date: Date, bound: Date?): Boolean =
        bound != null && dayOf(date).isAfter(dayOf(bound))

    /** Insert-or-remove by local day, preserving the existing entry's order —
     *  the range arm's toggle, so a re-activated day leaves no duplicate. */
    fun toggle(selection: List<Date>, date: Date): List<Date> =
        if (isSameDayAsAny(date, selection)) {
            selection.filterNot { isSameDay(date, it) }
        } else {
            selection + date
        }
}
