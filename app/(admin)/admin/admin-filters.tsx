"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Select } from "../../../components/forms/select";
import { Switch } from "../../../components/forms/switch";

export const AdminFilters = ({
  groomers,
  groomerId,
  showCancelled,
}: {
  readonly groomers: ReadonlyArray<{ readonly id: string; readonly displayName: string }>;
  readonly groomerId: string | null;
  readonly showCancelled: boolean;
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const update = (name: string, value: string | null): void => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === "") next.delete(name);
    else next.set(name, value);
    router.replace(`${pathname}?${next}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="grid min-w-52 gap-1 [font:var(--type-label)] text-heading">
        Groomer
        <Select
          value={groomerId ?? ""}
          onChange={(event) => update("groomerId", event.target.value)}
          placeholder="All groomers"
          options={groomers.map((groomer) => ({ value: groomer.id, label: groomer.displayName }))}
          className="h-(--control-h-sm)"
        />
      </label>
      <Switch
        label="Show cancelled"
        checked={showCancelled}
        onChange={(event) => update("cancelled", event.target.checked ? "show" : "hide")}
      />
    </div>
  );
};
