import { formatInTimeZone } from "date-fns-tz";

/**
 * Formats a UTC date string into a human-readable string in the tenant's specified time zone.
 * @param {string} utcDateString - The ISO 8601 UTC date string from the API (e.g., "2023-10-27T14:30:00.000Z").
 * @param {string} timeZone - The IANA time zone name from settings (e.g., "America/New_York").
 * @param {string} formatString - The desired output format (e.g., 'PPpp', 'yyyy-MM-dd HH:mm').
 * @returns {string} The formatted date string.
 */
export const formatDateInTimezone = (
  utcDateString,
  timeZone,
  formatString = "PPpp"
) => {
  if (!utcDateString || !timeZone) {
    return "Invalid Date";
  }
  try {
    // 'PPpp' is a date-fns format for a long, localized date and time (e.g., "Oct 27, 2023, 10:30:00 AM")
    return formatInTimeZone(utcDateString, timeZone, formatString);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};
