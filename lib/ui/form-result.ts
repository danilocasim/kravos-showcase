/**
 * Shared shape for parsing a submitted form into a validated value.
 *
 * Field errors are keyed by the control's `name` attribute so a form can render
 * each message beside the input that produced it.
 */

export type FieldErrors = Readonly<Record<string, string>>;

export type ParseResult<TValue> =
  | { readonly ok: true; readonly value: TValue }
  | { readonly ok: false; readonly fieldErrors: FieldErrors };

/**
 * Reads one text field from submitted form data.
 *
 * A missing entry and a blank entry are both treated as an empty string, so a
 * form that omits a field fails validation rather than throwing.
 *
 * @param formData - The submitted form.
 * @param name - The control's `name` attribute.
 * @returns The trimmed value, or an empty string when absent.
 */
export const readTextField = (formData: FormData, name: string): string => {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
};
