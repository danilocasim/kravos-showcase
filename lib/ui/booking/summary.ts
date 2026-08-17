import { formatDuration } from "../format/duration";
import { formatMoney } from "../format/money";

export interface ServerDerivedSummary {
  readonly subtotalCents: number;
  readonly totalDurationMinutes: number;
}

export const buildBookingSummary = ({
  subtotalCents,
  totalDurationMinutes,
}: ServerDerivedSummary) => ({
  subtotalLabel: formatMoney(subtotalCents),
  durationLabel: formatDuration(totalDurationMinutes),
});
