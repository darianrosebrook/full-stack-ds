package com.fullstackds.date

import java.time.ZoneId
import java.util.Calendar
import java.util.Date
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

/**
 * Falsifies the day-granular contract of `FsdsDate`: a java.util.Date carries
 * an instant, so the helpers must compare (and label) local calendar days, not
 * instants. The zone is pinned per test so the assertions do not depend on the
 * machine's default and cannot pass by accident at a particular hour.
 */
class FsdsDateTest {
    private val utc = ZoneId.of("UTC")

    private fun at(year: Int, month: Int, day: Int, hour: Int = 0, minute: Int = 0): Date =
        Calendar.getInstance(java.util.TimeZone.getTimeZone("UTC")).apply {
            clear()
            set(year, month - 1, day, hour, minute, 0)
        }.time

    @Test
    fun dayOfMonthLabelsTheLocalCalendarDay() {
        FsdsDate.zone = utc
        assertEquals(1, FsdsDate.dayOfMonth(at(2026, 3, 1)))
        assertEquals(31, FsdsDate.dayOfMonth(at(2026, 3, 31)))
        // 23:30 on the last day of the month is still that day, not the next.
        assertEquals(31, FsdsDate.dayOfMonth(at(2026, 3, 31, hour = 23, minute = 30)))
    }

    @Test
    fun sameDayIgnoresTheTimeOfDayAndRejectsNull() {
        FsdsDate.zone = utc
        assertTrue(FsdsDate.isSameDay(at(2026, 3, 4), at(2026, 3, 4, hour = 23, minute = 59)))
        assertFalse(FsdsDate.isSameDay(at(2026, 3, 4, hour = 23, minute = 59), at(2026, 3, 5)))
        assertFalse(FsdsDate.isSameDay(at(2026, 3, 4), null))
    }

    @Test
    fun membershipAndToggleAreDayGranular() {
        FsdsDate.zone = utc
        val selection = listOf(at(2026, 3, 2), at(2026, 3, 9))
        assertTrue(FsdsDate.isSameDayAsAny(at(2026, 3, 9, hour = 12), selection))
        assertFalse(FsdsDate.isSameDayAsAny(at(2026, 3, 10), selection))
        // Toggling a selected day removes it, and the match is day-granular:
        // the stored entry is 00:00 and the toggle is 08:00.
        assertEquals(listOf(at(2026, 3, 2)), FsdsDate.toggle(selection, at(2026, 3, 9, hour = 8)))
        // Appending a genuinely new day never duplicates an existing one.
        assertEquals(
            selection + at(2026, 3, 10),
            FsdsDate.toggle(selection, at(2026, 3, 10)),
        )
        // Re-toggling the first selected day removes it too, late in the day.
        assertEquals(listOf(at(2026, 3, 9)), FsdsDate.toggle(selection, at(2026, 3, 2, hour = 23)))
    }

    @Test
    fun boundsAreInclusiveAtDayGranularity() {
        FsdsDate.zone = utc
        val min = at(2026, 3, 10)
        val max = at(2026, 3, 20)
        assertTrue(FsdsDate.isBefore(at(2026, 3, 9, hour = 23), min))
        assertFalse(FsdsDate.isBefore(at(2026, 3, 10, hour = 23), min))
        assertTrue(FsdsDate.isAfter(at(2026, 3, 21), max))
        assertFalse(FsdsDate.isAfter(at(2026, 3, 20, hour = 1), max))
        assertFalse(FsdsDate.isBefore(at(2026, 3, 15), null))
        assertFalse(FsdsDate.isAfter(at(2026, 3, 15), null))
    }

    @Test
    fun theZoneDecidesTheDaySoAMidnightStraddleFlips() {
        val instant = at(2026, 3, 4, hour = 23, minute = 30)
        FsdsDate.zone = utc
        assertEquals(4, FsdsDate.dayOfMonth(instant))
        // +02:00 is past midnight, so the same instant is the 5th there.
        FsdsDate.zone = ZoneId.of("Europe/Berlin")
        assertEquals(5, FsdsDate.dayOfMonth(instant))
        FsdsDate.zone = utc
    }

    @Test
    fun todayMatchesTheCurrentLocalDayOnly() {
        FsdsDate.zone = utc
        assertTrue(FsdsDate.isToday(Date()))
        assertFalse(FsdsDate.isToday(at(1970, 1, 1)))
        FsdsDate.zone = ZoneId.systemDefault()
    }
}
