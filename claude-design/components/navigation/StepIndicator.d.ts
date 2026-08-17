/** Horizontal progress marker for the five-step booking flow. */
export interface StepIndicatorProps {
  /** Ordered step labels, e.g. ['Pet','Services','Groomer','Date & time','Review']. */
  steps?: string[];
  /** Zero-based index of the current step. */
  current?: number;
  /** Only completed steps are clickable. */
  onStepClick?: (index: number) => void;
  /** Numbers only, no labels — for narrow/mobile widths. */
  compact?: boolean;
  style?: React.CSSProperties;
}
export declare function StepIndicator(props: StepIndicatorProps): JSX.Element;
