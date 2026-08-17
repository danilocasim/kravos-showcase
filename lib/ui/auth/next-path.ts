const fallbackPath = "/appointments";
const encodedSeparatorPattern = /(?:\\|%5c|%2f)/i;

/** Returns only a same-origin path suitable for a redirect Location header. */
export const safeInternalNextPath = (value: string | null): string => {
  if (
    value === null ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    encodedSeparatorPattern.test(value)
  ) {
    return fallbackPath;
  }

  try {
    const parsed = new URL(value, "https://paw-polish.invalid");
    if (parsed.origin !== "https://paw-polish.invalid") return fallbackPath;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallbackPath;
  }
};
