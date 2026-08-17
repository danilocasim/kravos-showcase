import { Card } from "../../../components/core/card";
import { Icon, type IconName } from "../../../components/core/icon";

export const StatTile = ({ label, value, icon, accent = false }: { readonly label: string; readonly value: string | number; readonly icon: IconName; readonly accent?: boolean }) => (
  <Card padding="sm" className="flex items-center gap-3">
    <span className={`grid size-9 flex-none place-items-center rounded-md ${accent ? "bg-apricot-100 text-apricot-700" : "bg-primary-soft text-spruce-700"}`}>
      <Icon name={icon} size={18} />
    </span>
    <div>
      <p className="font-(family-name:--font-display) text-xl leading-none font-bold text-heading">{value}</p>
      <p className="mt-1 [font:var(--type-caption)] text-muted">{label}</p>
    </div>
  </Card>
);
