export type ActionResult =
  | { readonly status: "success" }
  | { readonly status: "pending"; readonly code: string; readonly message: string }
  | {
      readonly status: "error";
      readonly code: string;
      readonly message: string;
      readonly fieldErrors?: Readonly<Record<string, string>>;
    };

export const initialActionResult: ActionResult = { status: "success" };
