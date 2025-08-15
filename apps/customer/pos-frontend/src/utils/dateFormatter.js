import { formatInTimeZone } from "date-fns-tz";
import { toDate } from "date-fns";

export const formatDate = (
  dateInput,
  timezone = "UTC",
  formatString = "dd MMM yyyy, hh:mm a"
) => {
  if (!dateInput) return "";

  console.groupCollapsed(`[dateFormatter] Formatting timestamp`);
  console.log(`  - 1. Received Input (from component): `, dateInput);
  console.log(`  - 2. Received Timezone (from settings): `, timezone);

  try {
    const dateObject = toDate(new Date(dateInput));
    console.log(
      `  - 3. Parsed to Date Object (UTC): `,
      dateObject.toISOString()
    );

    const formattedDate = formatInTimeZone(
      dateObject,
      timezone,
      `${formatString} (z)`
    );
    console.log(`  - 4. Final Formatted Output: `, formattedDate);
    console.groupEnd();

    return formattedDate;
  } catch (error) {
    console.error("  - X. Date formatting error:", error);
    console.groupEnd();
    return new Date(dateInput).toLocaleString();
  }
};
