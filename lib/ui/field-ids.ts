/**
 * Derives the ids that tie a form control to its hint and error text.
 *
 * The design system's `Field` renders a hint and an error but leaves them
 * visually associated only. Screen readers need `aria-describedby`, so the ids
 * are computed here once and spread onto the control by the caller.
 */

export interface FieldIdOptions {
  readonly hasHint?: boolean;
  readonly hasError?: boolean;
}

export interface FieldIds {
  readonly controlId: string;
  readonly hintId: string | undefined;
  readonly errorId: string | undefined;
  /** Value for `aria-describedby`, or undefined when there is nothing to describe. */
  readonly describedBy: string | undefined;
  readonly invalid: boolean;
}

/**
 * Builds the id set for one labelled field.
 *
 * The error is listed before the hint so assistive technology announces what is
 * wrong before it repeats the guidance.
 *
 * @param controlId - The form control's own id, unique within the document.
 * @param options - Whether a hint and an error are currently rendered.
 * @returns Ids for the hint and error nodes plus the control's ARIA wiring.
 */
export const fieldIds = (
  controlId: string,
  { hasHint = false, hasError = false }: FieldIdOptions,
): FieldIds => {
  const hintId = hasHint ? `${controlId}-hint` : undefined;
  const errorId = hasError ? `${controlId}-error` : undefined;
  const described = [errorId, hintId].filter(
    (id): id is string => id !== undefined,
  );

  return {
    controlId,
    hintId,
    errorId,
    describedBy: described.length === 0 ? undefined : described.join(" "),
    invalid: hasError,
  };
};
