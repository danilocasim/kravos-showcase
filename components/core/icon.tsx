import {
  ArrowRight,
  Ban,
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  CalendarX,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleX,
  Clock,
  CreditCard,
  Dog,
  Droplets,
  Heart,
  House,
  Info,
  Lock,
  LoaderCircle,
  LogOut,
  Mail,
  MapPin,
  NotebookPen,
  PawPrint,
  Pencil,
  Plus,
  RefreshCw,
  Scissors,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

/**
 * The Lucide set the design system copied verbatim into `assets/icons/`, keyed by
 * its kebab-case file name so call sites read exactly as the component specs do.
 * Only icons a screen actually uses are registered.
 */
const iconRegistry = {
  "arrow-right": ArrowRight,
  "badge-check": BadgeCheck,
  ban: Ban,
  "calendar-check": CalendarCheck,
  "calendar-days": CalendarDays,
  "calendar-x": CalendarX,
  check: Check,
  "chevron-down": ChevronDown,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "circle-alert": CircleAlert,
  "circle-check": CircleCheck,
  "circle-x": CircleX,
  clock: Clock,
  "credit-card": CreditCard,
  dog: Dog,
  droplets: Droplets,
  heart: Heart,
  house: House,
  info: Info,
  "loader-circle": LoaderCircle,
  lock: Lock,
  "log-out": LogOut,
  mail: Mail,
  "map-pin": MapPin,
  "notebook-pen": NotebookPen,
  "paw-print": PawPrint,
  pencil: Pencil,
  plus: Plus,
  "refresh-cw": RefreshCw,
  scissors: Scissors,
  "shield-check": ShieldCheck,
  sparkles: Sparkles,
  "trash-2": Trash2,
  "triangle-alert": TriangleAlert,
  "user-round": UserRound,
  users: Users,
  x: X,
} as const;

/** Every icon name the application may render. */
export type IconName = keyof typeof iconRegistry;

export interface IconProps {
  readonly name: IconName;
  /** Rendered size in pixels; the design uses 12-26. */
  readonly size?: number;
  /**
   * Accessible name. Omit it for decoration beside text, which is the default:
   * the design requires that icons never carry meaning on their own.
   */
  readonly title?: string;
  readonly className?: string;
}

/**
 * Renders one Lucide glyph using the design system's stroke specification.
 *
 * @param props - Icon name, optional size, optional accessible name.
 * @returns An inline SVG that inherits the surrounding text colour.
 */
export const Icon = ({ name, size = 16, title, className }: IconProps) => {
  const Glyph = iconRegistry[name];

  return (
    <Glyph
      size={size}
      /* The design specifies a 1.75px stroke, thickened to 2px at 16px and below
         so small glyphs keep their weight. */
      strokeWidth={size <= 16 ? 2 : 1.75}
      className={className}
      aria-hidden={title === undefined ? true : undefined}
      role={title === undefined ? "presentation" : "img"}
      aria-label={title}
    />
  );
};
