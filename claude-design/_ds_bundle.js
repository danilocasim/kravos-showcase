/* @ds-bundle: {"format":4,"namespace":"PawAmpPolishDesignSystem_25f2e9","components":[{"name":"AppointmentCard","sourcePath":"components/booking/AppointmentCard.jsx"},{"name":"GroomerOption","sourcePath":"components/booking/GroomerOption.jsx"},{"name":"PetCard","sourcePath":"components/booking/PetCard.jsx"},{"name":"PriceSummary","sourcePath":"components/booking/PriceSummary.jsx"},{"name":"ServiceOption","sourcePath":"components/booking/ServiceOption.jsx"},{"name":"TimeSlotPicker","sourcePath":"components/booking/TimeSlotPicker.jsx"},{"name":"Alert","sourcePath":"components/core/Alert.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"EmptyState","sourcePath":"components/core/EmptyState.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Logotype","sourcePath":"components/core/Logotype.jsx"},{"name":"StatusPill","sourcePath":"components/core/StatusPill.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"ChoiceCard","sourcePath":"components/forms/ChoiceCard.jsx"},{"name":"Field","sourcePath":"components/forms/Field.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"AppHeader","sourcePath":"components/navigation/AppHeader.jsx"},{"name":"SideNav","sourcePath":"components/navigation/SideNav.jsx"},{"name":"StepIndicator","sourcePath":"components/navigation/StepIndicator.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/booking/AppointmentCard.jsx":"c1cf982fe666","components/booking/GroomerOption.jsx":"1ab57d9398f1","components/booking/PetCard.jsx":"7445703d325f","components/booking/PriceSummary.jsx":"9588ee55aaa9","components/booking/ServiceOption.jsx":"c7062de6a807","components/booking/TimeSlotPicker.jsx":"1931bb83ce72","components/core/Alert.jsx":"66a40654afef","components/core/Badge.jsx":"4319860589e8","components/core/Button.jsx":"2b1819d509b1","components/core/Card.jsx":"d761ac738452","components/core/EmptyState.jsx":"bf5a69ddc4f5","components/core/Icon.jsx":"33ee6f7c7536","components/core/IconButton.jsx":"2c4698a98a2c","components/core/Logotype.jsx":"a5a73bf4f9ea","components/core/StatusPill.jsx":"732895ef0c2e","components/feedback/Dialog.jsx":"eab9e6f3c598","components/feedback/Toast.jsx":"328ce84895ff","components/feedback/Tooltip.jsx":"1594d732eb97","components/forms/Checkbox.jsx":"b01cfbba2d16","components/forms/ChoiceCard.jsx":"2db55676f55f","components/forms/Field.jsx":"3d7c5c819dbd","components/forms/Input.jsx":"91eaf4e69132","components/forms/Radio.jsx":"5b8a323089e6","components/forms/Select.jsx":"0446ffdeb7ff","components/forms/Switch.jsx":"3151130d689d","components/forms/Textarea.jsx":"03c718e7b444","components/navigation/AppHeader.jsx":"7e217e175829","components/navigation/SideNav.jsx":"14a58efe217e","components/navigation/StepIndicator.jsx":"b49b35ae361c","components/navigation/Tabs.jsx":"dd0163c4436c","ui_kits/admin-console/Console.jsx":"503752d24c8c","ui_kits/admin-console/data.jsx":"987f8c1a0814","ui_kits/customer-app/Appointments.jsx":"112bd4fd5820","ui_kits/customer-app/Booking.jsx":"9f755fb9a518","ui_kits/customer-app/Pets.jsx":"2841a6da8525","ui_kits/customer-app/SignIn.jsx":"17fadb73c49e","ui_kits/customer-app/app.jsx":"4fbfd7eef4bf","ui_kits/customer-app/data.jsx":"4b3db1f4dc13"},"inlinedExternals":[],"unexposedExports":[{"name":"iconNames","sourcePath":"components/core/Icon.jsx"}]} */

(() => {

const __ds_ns = (window.PawAmpPolishDesignSystem_25f2e9 = window.PawAmpPolishDesignSystem_25f2e9 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Card({
  children,
  padding = 'md',
  tone = 'default',
  interactive = false,
  selected = false,
  as = 'div',
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const Tag = as;
  const tones = {
    default: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)'
    },
    sunken: {
      background: 'var(--surface-sunken)',
      border: '1px solid var(--border-subtle)'
    },
    primarySoft: {
      background: 'var(--surface-primary-soft)',
      border: '1px solid var(--spruce-200)'
    },
    accentSoft: {
      background: 'var(--surface-accent-soft)',
      border: '1px solid var(--apricot-200)'
    },
    inverse: {
      background: 'var(--surface-inverse)',
      border: '1px solid var(--spruce-800)',
      color: 'var(--text-inverse)'
    }
  }[tone];
  const pads = {
    none: 0,
    sm: 'var(--space-4)',
    md: 'var(--pad-card)',
    lg: 'var(--pad-card-lg)'
  };
  return /*#__PURE__*/React.createElement(Tag, _extends({
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      borderRadius: 'var(--radius-card)',
      padding: pads[padding],
      boxShadow: 'var(--shadow-xs)',
      transition: 'var(--transition-control)',
      ...tones,
      ...(interactive ? {
        cursor: 'pointer'
      } : null),
      ...(interactive && hover && !selected ? {
        boxShadow: 'var(--shadow-md)',
        transform: 'translateY(-1px)',
        borderColor: 'var(--border-default)'
      } : null),
      ...(selected ? {
        borderColor: 'var(--action-primary)',
        boxShadow: '0 0 0 1px var(--action-primary)'
      } : null),
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Icon path data is Lucide (ISC), copied verbatim from lucide-icons/lucide@main /icons.
// Source SVG files also live in assets/icons/ for non-React use.
const PAWPOLISH_ICON_PATHS = {
  "arrow-left": "<path d=\"m12 19-7-7 7-7\"></path> <path d=\"M19 12H5\"></path>",
  "arrow-right": "<path d=\"M5 12h14\"></path> <path d=\"m12 5 7 7-7 7\"></path>",
  "badge-check": "<path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\"></path> <path d=\"m9 12 2 2 4-4\"></path>",
  "ban": "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle> <path d=\"M4.929 4.929 19.07 19.071\"></path>",
  "bell": "<path d=\"M10.268 21a2 2 0 0 0 3.464 0\"></path> <path d=\"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326\"></path>",
  "bone": "<path d=\"M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z\"></path>",
  "calendar-check": "<path d=\"M8 2v3\"></path> <path d=\"M16 2v3\"></path> <rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"></rect> <path d=\"M3 9h18\"></path> <path d=\"m9 15 2 2 4-4\"></path>",
  "calendar-days": "<path d=\"M8 2v3\"></path> <path d=\"M16 2v3\"></path> <rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"></rect> <path d=\"M3 9h18\"></path> <path d=\"M8 13h.01\"></path> <path d=\"M12 13h.01\"></path> <path d=\"M16 13h.01\"></path> <path d=\"M8 17h.01\"></path> <path d=\"M12 17h.01\"></path> <path d=\"M16 17h.01\"></path>",
  "calendar-x": "<path d=\"M8 2v3\"></path> <path d=\"M16 2v3\"></path> <rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"></rect> <path d=\"M3 9h18\"></path> <path d=\"m14 13-4 4\"></path> <path d=\"m10 13 4 4\"></path>",
  "calendar": "<path d=\"M8 2v3\"></path> <path d=\"M16 2v3\"></path> <rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"></rect> <path d=\"M3 9h18\"></path>",
  "check": "<path d=\"M20 6 9 17l-5-5\"></path>",
  "chevron-down": "<path d=\"m6 9 6 6 6-6\"></path>",
  "chevron-left": "<path d=\"m15 18-6-6 6-6\"></path>",
  "chevron-right": "<path d=\"m9 18 6-6-6-6\"></path>",
  "circle-alert": "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle> <line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"12\"></line> <line x1=\"12\" x2=\"12.01\" y1=\"16\" y2=\"16\"></line>",
  "circle-check": "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle> <path d=\"m9 12 2 2 4-4\"></path>",
  "circle-x": "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle> <path d=\"m15 9-6 6\"></path> <path d=\"m9 9 6 6\"></path>",
  "clock": "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle> <path d=\"M12 6v6l4 2\"></path>",
  "credit-card": "<rect width=\"20\" height=\"14\" x=\"2\" y=\"5\" rx=\"2\"></rect> <line x1=\"2\" x2=\"22\" y1=\"10\" y2=\"10\"></line>",
  "dog": "<path d=\"M11.25 16.25h1.5L12 17z\"></path> <path d=\"M16 14v.5\"></path> <path d=\"M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309\"></path> <path d=\"M8 14v.5\"></path> <path d=\"M8.5 8.5c-.384 1.05-1.083 2.028-2.344 2.5-1.931.722-3.576-.297-3.656-1-.113-.994 1.177-6.53 4-7 1.923-.321 3.651.845 3.651 2.235A7.497 7.497 0 0 1 14 5.277c0-1.39 1.844-2.598 3.767-2.277 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5\"></path>",
  "droplets": "<path d=\"M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z\"></path> <path d=\"M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97\"></path>",
  "ellipsis": "<circle cx=\"12\" cy=\"12\" r=\"1\"></circle> <circle cx=\"19\" cy=\"12\" r=\"1\"></circle> <circle cx=\"5\" cy=\"12\" r=\"1\"></circle>",
  "eye": "<path d=\"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0\"></path> <circle cx=\"12\" cy=\"12\" r=\"3\"></circle>",
  "funnel": "<path d=\"M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z\"></path>",
  "heart": "<path d=\"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5\"></path>",
  "house": "<path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"></path> <path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"></path>",
  "info": "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle> <path d=\"M12 16v-4\"></path> <path d=\"M12 8h.01\"></path>",
  "list": "<path d=\"M3 5h.01\"></path> <path d=\"M3 12h.01\"></path> <path d=\"M3 19h.01\"></path> <path d=\"M8 5h13\"></path> <path d=\"M8 12h13\"></path> <path d=\"M8 19h13\"></path>",
  "loader-circle": "<path d=\"M21 12a9 9 0 1 1-6.219-8.56\"></path>",
  "lock": "<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\"></rect> <path d=\"M7 11V7a5 5 0 0 1 10 0v4\"></path>",
  "log-out": "<path d=\"m16 17 5-5-5-5\"></path> <path d=\"M21 12H9\"></path> <path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\"></path>",
  "mail": "<path d=\"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7\"></path> <rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"2\"></rect>",
  "map-pin": "<path d=\"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0\"></path> <circle cx=\"12\" cy=\"10\" r=\"3\"></circle>",
  "menu": "<path d=\"M4 5h16\"></path> <path d=\"M4 12h16\"></path> <path d=\"M4 19h16\"></path>",
  "notebook-pen": "<path d=\"M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4\"></path> <path d=\"M2 6h4\"></path> <path d=\"M2 10h4\"></path> <path d=\"M2 14h4\"></path> <path d=\"M2 18h4\"></path> <path d=\"M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z\"></path>",
  "paw-print": "<circle cx=\"11\" cy=\"4\" r=\"2\"></circle> <circle cx=\"18\" cy=\"8\" r=\"2\"></circle> <circle cx=\"20\" cy=\"16\" r=\"2\"></circle> <path d=\"M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z\"></path>",
  "pencil": "<path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\"></path> <path d=\"m15 5 4 4\"></path>",
  "phone": "<path d=\"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384\"></path>",
  "plus": "<path d=\"M5 12h14\"></path> <path d=\"M12 5v14\"></path>",
  "refresh-cw": "<path d=\"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8\"></path> <path d=\"M21 3v5h-5\"></path> <path d=\"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16\"></path> <path d=\"M8 16H3v5\"></path>",
  "scissors": "<circle cx=\"6\" cy=\"6\" r=\"3\"></circle> <path d=\"M8.12 8.12 12 12\"></path> <path d=\"M20 4 8.12 15.88\"></path> <circle cx=\"6\" cy=\"18\" r=\"3\"></circle> <path d=\"M14.8 14.8 20 20\"></path>",
  "search": "<path d=\"m21 21-4.34-4.34\"></path> <circle cx=\"11\" cy=\"11\" r=\"8\"></circle>",
  "settings": "<path d=\"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915\"></path> <circle cx=\"12\" cy=\"12\" r=\"3\"></circle>",
  "shield-check": "<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\"></path> <path d=\"m9 12 2 2 4-4\"></path>",
  "sparkles": "<path d=\"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z\"></path> <path d=\"M20 2v4\"></path> <path d=\"M22 4h-4\"></path> <circle cx=\"4\" cy=\"20\" r=\"2\"></circle>",
  "star": "<path d=\"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z\"></path>",
  "trash-2": "<path d=\"M10 11v6\"></path> <path d=\"M14 11v6\"></path> <path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6\"></path> <path d=\"M3 6h18\"></path> <path d=\"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"></path>",
  "triangle-alert": "<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\"></path> <path d=\"M12 9v4\"></path> <path d=\"M12 17h.01\"></path>",
  "user-round": "<circle cx=\"12\" cy=\"8\" r=\"5\"></circle> <path d=\"M20 21a8 8 0 0 0-16 0\"></path>",
  "users": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path> <path d=\"M16 3.128a4 4 0 0 1 0 7.744\"></path> <path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"></path> <circle cx=\"9\" cy=\"7\" r=\"4\"></circle>",
  "x": "<path d=\"M18 6 6 18\"></path> <path d=\"m6 6 12 12\"></path>"
};
const iconNames = Object.keys(PAWPOLISH_ICON_PATHS);
function Icon({
  name,
  size = 20,
  strokeWidth = 1.75,
  color = 'currentColor',
  title,
  style,
  className,
  ...rest
}) {
  const markup = PAWPOLISH_ICON_PATHS[name];
  if (!markup) return null;
  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    role: title ? 'img' : 'presentation',
    "aria-hidden": title ? undefined : true,
    "aria-label": title,
    className: className,
    style: {
      display: 'block',
      flex: 'none',
      ...style
    },
    dangerouslySetInnerHTML: {
      __html: (title ? '<title>' + title + '</title>' : '') + markup
    }
  }, rest));
}
Object.assign(__ds_scope, { iconNames, Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/booking/PriceSummary.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const money = cents => '$' + (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
function PriceSummary({
  lines = [],
  totalMinutes,
  subtotalCents,
  bufferMinutes = 15,
  footnote,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: 'var(--surface-sunken)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-card)',
      padding: 'var(--pad-card)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)'
    }
  }, lines.map(l => /*#__PURE__*/React.createElement("div", {
    key: l.name,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 'var(--space-4)',
      font: 'var(--type-body)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-body)'
    }
  }, l.name, typeof l.durationMinutes === 'number' ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-subtle)'
    }
  }, " \xB7 ", l.durationMinutes, " min") : null), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-mono)',
      color: 'var(--text-body)'
    }
  }, money(l.priceCents))))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border-subtle)',
      margin: 'var(--space-4) 0'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-body-strong)',
      color: 'var(--text-heading)'
    }
  }, "Subtotal"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--weight-bold)',
      fontSize: 'var(--text-xl)',
      color: 'var(--text-heading)'
    }
  }, money(subtotalCents || 0))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--space-3)',
      marginTop: 'var(--space-2)',
      font: 'var(--type-caption)',
      color: 'var(--text-muted)'
    }
  }, typeof totalMinutes === 'number' ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "clock",
    size: 12
  }), totalMinutes, " min with your groomer") : null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "sparkles",
    size: 12
  }), bufferMinutes, "-min cleanup buffer")), footnote ? /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-subtle)',
      marginTop: 'var(--space-3)'
    }
  }, footnote) : null);
}
Object.assign(__ds_scope, { PriceSummary });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/booking/PriceSummary.jsx", error: String((e && e.message) || e) }); }

// components/booking/TimeSlotPicker.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function TimeSlotPicker({
  days = [],
  selected,
  onSelect,
  note,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)',
      ...style
    }
  }, rest), days.map(day => /*#__PURE__*/React.createElement("div", {
    key: day.date,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)',
      color: 'var(--text-heading)'
    }
  }, day.label), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-subtle)'
    }
  }, day.slots.length ? day.slots.length + ' times' : 'Fully booked')), day.slots.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))',
      gap: 'var(--space-2)'
    }
  }, day.slots.map(slot => {
    const isSel = selected && selected.date === day.date && selected.time === slot.time;
    return /*#__PURE__*/React.createElement("button", {
      key: slot.time,
      type: "button",
      disabled: slot.unavailable,
      onClick: () => onSelect && onSelect({
        date: day.date,
        time: slot.time,
        groomer: slot.groomer
      }),
      style: {
        height: 'var(--hit-target-min)',
        padding: '0 var(--space-2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1px',
        cursor: slot.unavailable ? 'not-allowed' : 'pointer',
        background: isSel ? 'var(--slot-selected-bg)' : slot.unavailable ? 'var(--surface-sunken)' : 'var(--surface-card)',
        color: isSel ? '#fff' : slot.unavailable ? 'var(--slot-unavailable-fg)' : 'var(--text-heading)',
        border: '1px solid ' + (isSel ? 'var(--slot-selected-bg)' : slot.unavailable ? 'var(--border-subtle)' : 'var(--slot-free-border)'),
        borderRadius: 'var(--radius-control)',
        font: 'var(--type-body-strong)',
        textDecoration: slot.unavailable ? 'line-through' : 'none',
        transition: 'var(--transition-control)'
      }
    }, slot.time, slot.groomer ? /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--type-caption)',
        fontSize: 'var(--text-2xs)',
        color: isSel ? 'var(--spruce-200)' : 'var(--text-subtle)'
      }
    }, slot.groomer) : null);
  })) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      font: 'var(--type-small)',
      color: 'var(--text-muted)',
      padding: 'var(--space-3)',
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-md)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "calendar-x",
    size: 15
  }), day.emptyReason || 'No times available on this day.'))), note ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      font: 'var(--type-caption)',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "info",
    size: 13
  }), note) : null);
}
Object.assign(__ds_scope, { TimeSlotPicker });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/booking/TimeSlotPicker.jsx", error: String((e && e.message) || e) }); }

// components/core/Alert.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const PAWPOLISH_ALERT_TONES = {
  info: {
    bg: 'var(--info-50)',
    border: '#cfe1ef',
    fg: 'var(--info-700)',
    icon: 'info'
  },
  success: {
    bg: 'var(--success-50)',
    border: 'var(--spruce-200)',
    fg: 'var(--success-700)',
    icon: 'circle-check'
  },
  warning: {
    bg: 'var(--warning-50)',
    border: 'var(--apricot-200)',
    fg: 'var(--warning-700)',
    icon: 'triangle-alert'
  },
  danger: {
    bg: 'var(--danger-50)',
    border: '#f3cfcb',
    fg: 'var(--danger-700)',
    icon: 'circle-alert'
  }
};
function Alert({
  tone = 'info',
  title,
  children,
  action,
  code,
  style,
  ...rest
}) {
  const t = PAWPOLISH_ALERT_TONES[tone] || PAWPOLISH_ALERT_TONES.info;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: tone === 'danger' ? 'alert' : 'status',
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      padding: 'var(--space-4)',
      background: t.bg,
      border: '1px solid ' + t.border,
      borderRadius: 'var(--radius-md)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      color: t.fg,
      marginTop: '1px'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: t.icon,
    size: 18,
    strokeWidth: 2
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title ? /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-body-strong)',
      color: t.fg,
      marginBottom: children ? '2px' : 0
    }
  }, title) : null, children ? /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-small)',
      color: 'var(--text-body)'
    }
  }, children) : null, code ? /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-mono)',
      fontSize: 'var(--text-xs)',
      color: t.fg,
      marginTop: 'var(--space-2)'
    }
  }, code) : null), action ? /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 'none'
    }
  }, action) : null);
}
Object.assign(__ds_scope, { Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Alert.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const PAWPOLISH_BADGE_TONES = {
  neutral: {
    background: 'var(--sand-150)',
    color: 'var(--sand-700)',
    border: 'var(--sand-200)'
  },
  primary: {
    background: 'var(--spruce-50)',
    color: 'var(--spruce-700)',
    border: 'var(--spruce-200)'
  },
  accent: {
    background: 'var(--apricot-100)',
    color: 'var(--apricot-700)',
    border: 'var(--apricot-200)'
  },
  success: {
    background: 'var(--success-50)',
    color: 'var(--success-700)',
    border: 'var(--spruce-200)'
  },
  warning: {
    background: 'var(--warning-50)',
    color: 'var(--warning-700)',
    border: 'var(--apricot-200)'
  },
  danger: {
    background: 'var(--danger-50)',
    color: 'var(--danger-700)',
    border: '#f3cfcb'
  },
  info: {
    background: 'var(--info-50)',
    color: 'var(--info-700)',
    border: '#cfe1ef'
  }
};
function Badge({
  children,
  tone = 'neutral',
  icon,
  size = 'md',
  style,
  ...rest
}) {
  const t = PAWPOLISH_BADGE_TONES[tone] || PAWPOLISH_BADGE_TONES.neutral;
  const small = size === 'sm';
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: small ? '2px 7px' : '3px 9px',
      borderRadius: 'var(--radius-pill)',
      background: t.background,
      color: t.color,
      border: '1px solid ' + t.border,
      font: 'var(--type-caption)',
      fontSize: small ? 'var(--text-2xs)' : 'var(--text-xs)',
      whiteSpace: 'nowrap',
      ...style
    }
  }, rest), icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: small ? 11 : 13,
    strokeWidth: 2
  }) : null, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const PAWPOLISH_BTN_VARIANTS = {
  primary: {
    background: 'var(--action-primary)',
    color: 'var(--text-on-primary)',
    border: '1px solid var(--action-primary)'
  },
  accent: {
    background: 'var(--action-accent)',
    color: 'var(--spruce-950)',
    border: '1px solid var(--action-accent)'
  },
  secondary: {
    background: 'var(--surface-card)',
    color: 'var(--text-body)',
    border: '1px solid var(--border-default)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-body)',
    border: '1px solid transparent'
  },
  danger: {
    background: 'var(--danger-500)',
    color: '#fff',
    border: '1px solid var(--danger-500)'
  },
  link: {
    background: 'transparent',
    color: 'var(--text-link)',
    border: '1px solid transparent',
    padding: 0,
    height: 'auto'
  }
};
const PAWPOLISH_BTN_HOVER = {
  primary: {
    background: 'var(--action-primary-hover)',
    borderColor: 'var(--action-primary-hover)'
  },
  accent: {
    background: 'var(--action-accent-hover)',
    borderColor: 'var(--action-accent-hover)'
  },
  secondary: {
    background: 'var(--sand-50)',
    borderColor: 'var(--border-strong)'
  },
  ghost: {
    background: 'var(--surface-sunken)'
  },
  danger: {
    background: 'var(--danger-700)',
    borderColor: 'var(--danger-700)'
  },
  link: {
    color: 'var(--text-link-hover)'
  }
};
const PAWPOLISH_BTN_SIZES = {
  sm: {
    height: 'var(--control-h-sm)',
    padding: '0 var(--space-3)',
    fontSize: 'var(--text-sm)',
    gap: '6px'
  },
  md: {
    height: 'var(--control-h-md)',
    padding: '0 var(--space-4)',
    fontSize: 'var(--text-base)',
    gap: 'var(--space-2)'
  },
  lg: {
    height: 'var(--control-h-lg)',
    padding: '0 var(--space-6)',
    fontSize: 'var(--text-md)',
    gap: 'var(--space-2)'
  }
};
let pawpolishSpinInjected = false;
function pawpolishEnsureSpinKeyframes() {
  if (pawpolishSpinInjected || typeof document === 'undefined') return;
  pawpolishSpinInjected = true;
  const el = document.createElement('style');
  el.textContent = '@keyframes pawpolish-spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(el);
}
function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  style,
  onClick,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const isOff = disabled || loading;
  const base = PAWPOLISH_BTN_VARIANTS[variant] || PAWPOLISH_BTN_VARIANTS.primary;
  const sz = PAWPOLISH_BTN_SIZES[size] || PAWPOLISH_BTN_SIZES.md;
  const iconSize = size === 'lg' ? 18 : size === 'sm' ? 14 : 16;
  React.useEffect(() => {
    if (loading) pawpolishEnsureSpinKeyframes();
  }, [loading]);
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: isOff,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setActive(false);
    },
    onMouseDown: () => setActive(true),
    onMouseUp: () => setActive(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-sans)',
      fontWeight: 'var(--weight-semibold)',
      letterSpacing: 'var(--tracking-snug)',
      borderRadius: variant === 'link' ? 'var(--radius-xs)' : 'var(--radius-control)',
      cursor: isOff ? 'not-allowed' : 'pointer',
      whiteSpace: 'nowrap',
      transition: 'var(--transition-control)',
      width: fullWidth ? '100%' : undefined,
      textDecoration: variant === 'link' ? 'underline' : 'none',
      textUnderlineOffset: '3px',
      ...sz,
      ...base,
      ...(hover && !isOff ? PAWPOLISH_BTN_HOVER[variant] : null),
      ...(active && !isOff ? {
        transform: 'translateY(1px)'
      } : null),
      ...(isOff ? {
        background: variant === 'ghost' || variant === 'link' ? 'transparent' : 'var(--action-disabled-bg)',
        borderColor: variant === 'ghost' || variant === 'link' ? 'transparent' : 'var(--action-disabled-bg)',
        color: 'var(--action-disabled-text)'
      } : null),
      ...style
    }
  }, rest), loading ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      animation: 'pawpolish-spin 800ms linear infinite'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "loader-circle",
    size: iconSize
  })) : iconLeft ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconLeft,
    size: iconSize
  }) : null, children, iconRight && !loading ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight,
    size: iconSize
  }) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/EmptyState.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function EmptyState({
  icon = 'paw-print',
  title,
  description,
  action,
  compact = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 'var(--space-2)',
      padding: compact ? 'var(--space-6)' : 'var(--space-9) var(--space-6)',
      background: 'var(--surface-card)',
      border: '1px dashed var(--border-default)',
      borderRadius: 'var(--radius-card)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 44,
      height: 44,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--surface-primary-soft)',
      color: 'var(--spruce-600)',
      marginBottom: 'var(--space-1)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 22
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-h4)',
      color: 'var(--text-heading)'
    }
  }, title), description ? /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-small)',
      color: 'var(--text-muted)',
      maxWidth: 340
    }
  }, description) : null, action ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-3)'
    }
  }, action) : null);
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const PAWPOLISH_IB_SIZES = {
  sm: 28,
  md: 36,
  lg: 44
};
function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const box = PAWPOLISH_IB_SIZES[size] || PAWPOLISH_IB_SIZES.md;
  const tone = {
    ghost: {
      background: hover && !disabled ? 'var(--surface-sunken)' : 'transparent',
      border: '1px solid transparent',
      color: 'var(--text-muted)'
    },
    outline: {
      background: hover && !disabled ? 'var(--sand-50)' : 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      color: 'var(--text-body)'
    },
    solid: {
      background: hover && !disabled ? 'var(--action-primary-hover)' : 'var(--action-primary)',
      border: '1px solid transparent',
      color: 'var(--text-on-primary)'
    },
    danger: {
      background: hover && !disabled ? 'var(--danger-50)' : 'transparent',
      border: '1px solid transparent',
      color: 'var(--danger-500)'
    }
  }[variant];
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: box,
      height: box,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius-control)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'var(--transition-control)',
      opacity: disabled ? 0.5 : 1,
      ...tone,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: size === 'lg' ? 20 : size === 'sm' ? 15 : 17
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/booking/PetCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const PAWPOLISH_SIZE_LABEL = {
  SMALL: 'Small',
  MEDIUM: 'Medium',
  LARGE: 'Large'
};
function PetCard({
  name,
  breed,
  size,
  ageYears,
  temperament,
  allergies,
  notes,
  selectable = false,
  selected = false,
  onSelect,
  onEdit,
  onDelete,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: () => selectable && onSelect && onSelect(),
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      gap: 'var(--space-4)',
      padding: 'var(--space-4)',
      borderRadius: 'var(--radius-card)',
      background: selected ? 'var(--surface-primary-soft)' : 'var(--surface-card)',
      border: '1px solid ' + (selected ? 'var(--action-primary)' : hover && selectable ? 'var(--border-strong)' : 'var(--border-subtle)'),
      boxShadow: selected ? '0 0 0 1px var(--action-primary)' : 'var(--shadow-xs)',
      cursor: selectable ? 'pointer' : 'default',
      transition: 'var(--transition-control)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 'none',
      width: 44,
      height: 44,
      borderRadius: 'var(--radius-md)',
      background: 'var(--apricot-100)',
      color: 'var(--apricot-700)',
      display: 'grid',
      placeItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "dog",
    size: 23
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-h4)',
      color: 'var(--text-heading)'
    }
  }, name), selected ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "circle-check",
    size: 16,
    color: "var(--action-primary)"
  }) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-small)',
      color: 'var(--text-muted)'
    }
  }, [breed, PAWPOLISH_SIZE_LABEL[size] || size, typeof ageYears === 'number' ? ageYears + (ageYears === 1 ? ' yr' : ' yrs') : null].filter(Boolean).join(' · ')), temperament || allergies || notes ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      marginTop: '2px'
    }
  }, temperament ? /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    size: "sm",
    icon: "heart"
  }, temperament) : null, allergies ? /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    size: "sm",
    tone: "warning",
    icon: "triangle-alert"
  }, allergies) : null, notes ? /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    size: "sm",
    icon: "notebook-pen"
  }, notes) : null) : null), onEdit || onDelete ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '2px',
      alignItems: 'flex-start'
    }
  }, onEdit ? /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "pencil",
    label: 'Edit ' + name,
    onClick: e => {
      e.stopPropagation();
      onEdit();
    }
  }) : null, onDelete ? /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "trash-2",
    label: 'Delete ' + name,
    variant: "danger",
    onClick: e => {
      e.stopPropagation();
      onDelete();
    }
  }) : null) : null);
}
Object.assign(__ds_scope, { PetCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/booking/PetCard.jsx", error: String((e && e.message) || e) }); }

// components/core/Logotype.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* The source project ships no logo file or brand mark. Paw & Polish is set as plain
   type in the display face, optionally beside a Lucide paw glyph. Do not treat this
   as an official logo — replace it when a real mark exists. */
function Logotype({
  size = 'md',
  tone = 'default',
  withGlyph = true,
  style,
  ...rest
}) {
  const sizes = {
    sm: {
      font: 'var(--text-base)',
      glyph: 16,
      box: 26
    },
    md: {
      font: 'var(--text-lg)',
      glyph: 19,
      box: 32
    },
    lg: {
      font: 'var(--text-2xl)',
      glyph: 26,
      box: 44
    }
  }[size];
  const colors = {
    default: {
      text: 'var(--text-heading)',
      glyphBg: 'var(--spruce-700)',
      glyphFg: '#fff'
    },
    inverse: {
      text: 'var(--sand-50)',
      glyphBg: 'var(--apricot-400)',
      glyphFg: 'var(--spruce-950)'
    },
    mono: {
      text: 'currentColor',
      glyphBg: 'transparent',
      glyphFg: 'currentColor'
    }
  }[tone];
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      ...style
    }
  }, rest), withGlyph ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'grid',
      placeItems: 'center',
      width: sizes.box,
      height: sizes.box,
      borderRadius: 'var(--radius-md)',
      background: colors.glyphBg,
      color: colors.glyphFg,
      border: tone === 'mono' ? '1px solid currentColor' : 'none'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "paw-print",
    size: sizes.glyph,
    strokeWidth: 2
  })) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--weight-bold)',
      fontSize: sizes.font,
      letterSpacing: 'var(--tracking-tight)',
      color: colors.text,
      whiteSpace: 'nowrap'
    }
  }, "Paw & Polish"));
}
Object.assign(__ds_scope, { Logotype });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Logotype.jsx", error: String((e && e.message) || e) }); }

// components/core/StatusPill.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const PAWPOLISH_STATUS = {
  CONFIRMED: {
    label: 'Confirmed',
    bg: 'var(--status-confirmed-bg)',
    fg: 'var(--status-confirmed-fg)',
    icon: 'circle-check'
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'var(--status-completed-bg)',
    fg: 'var(--status-completed-fg)',
    icon: 'check'
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'var(--status-cancelled-bg)',
    fg: 'var(--status-cancelled-fg)',
    icon: 'circle-x'
  },
  PENDING: {
    label: 'Awaiting confirmation',
    bg: 'var(--status-pending-bg)',
    fg: 'var(--status-pending-fg)',
    icon: 'clock'
  }
};
function StatusPill({
  status = 'CONFIRMED',
  label,
  style,
  ...rest
}) {
  const s = PAWPOLISH_STATUS[status] || PAWPOLISH_STATUS.CONFIRMED;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 10px 4px 8px',
      borderRadius: 'var(--radius-pill)',
      background: s.bg,
      color: s.fg,
      font: 'var(--type-caption)',
      fontWeight: 'var(--weight-semibold)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: s.icon,
    size: 13,
    strokeWidth: 2.25
  }), label || s.label);
}
Object.assign(__ds_scope, { StatusPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatusPill.jsx", error: String((e && e.message) || e) }); }

// components/booking/AppointmentCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function AppointmentCard({
  petName,
  services = [],
  groomerName,
  dateLabel,
  timeLabel,
  endTimeLabel,
  subtotalCents,
  status = 'CONFIRMED',
  reference,
  actions,
  lockedNote,
  compact = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
      padding: compact ? 'var(--space-4)' : 'var(--pad-card)',
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-xs)',
      opacity: status === 'CANCELLED' ? 0.85 : 1,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-4)',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 'none',
      width: 56,
      textAlign: 'center',
      padding: 'var(--space-2) 0',
      background: 'var(--surface-primary-soft)',
      border: '1px solid var(--spruce-200)',
      borderRadius: 'var(--radius-md)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-overline)',
      color: 'var(--spruce-700)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-caps)'
    }
  }, (dateLabel || '').split(' ')[0]), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--weight-bold)',
      fontSize: 'var(--text-xl)',
      color: 'var(--spruce-900)',
      lineHeight: 1.1
    }
  }, (dateLabel || '').split(' ')[1]), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--spruce-700)'
    }
  }, (dateLabel || '').split(' ')[2])), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-h4)',
      color: 'var(--text-heading)'
    }
  }, services.join(' + ')), /*#__PURE__*/React.createElement(__ds_scope.StatusPill, {
    status: status
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--space-4)',
      font: 'var(--type-small)',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "clock",
    size: 14
  }), timeLabel, endTimeLabel ? ' – ' + endTimeLabel : ''), petName ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "dog",
    size: 14
  }), petName) : null, groomerName ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "user-round",
    size: 14
  }), groomerName) : null, typeof subtotalCents === 'number' ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "credit-card",
    size: 14
  }), '$' + (subtotalCents / 100).toFixed(subtotalCents % 100 === 0 ? 0 : 2)) : null), reference ? /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-mono)',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-subtle)'
    }
  }, reference) : null)), lockedNote ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      font: 'var(--type-caption)',
      color: 'var(--warning-700)',
      background: 'var(--warning-50)',
      border: '1px solid var(--apricot-200)',
      borderRadius: 'var(--radius-sm)',
      padding: '7px var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "lock",
    size: 13
  }), lockedNote) : null, actions ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-2)',
      flexWrap: 'wrap'
    }
  }, actions) : null);
}
Object.assign(__ds_scope, { AppointmentCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/booking/AppointmentCard.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Dialog({
  open = true,
  title,
  description,
  children,
  footer,
  onClose,
  width = 480,
  tone = 'default',
  style,
  ...rest
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    "aria-label": typeof title === 'string' ? title : undefined,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--scrim)',
      backdropFilter: 'var(--overlay-blur)',
      display: 'grid',
      placeItems: 'center',
      padding: 'var(--space-6)',
      zIndex: 40
    }
  }, /*#__PURE__*/React.createElement("div", _extends({
    style: {
      width: '100%',
      maxWidth: width,
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-sheet)',
      boxShadow: 'var(--shadow-lg)',
      border: '1px solid var(--border-subtle)',
      overflow: 'hidden',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-3)',
      padding: 'var(--space-6) var(--space-6) var(--space-4)'
    }
  }, tone !== 'default' ? /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 'none',
      width: 36,
      height: 36,
      borderRadius: 'var(--radius-pill)',
      display: 'grid',
      placeItems: 'center',
      background: tone === 'danger' ? 'var(--danger-50)' : 'var(--warning-50)',
      color: tone === 'danger' ? 'var(--danger-500)' : 'var(--warning-700)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: tone === 'danger' ? 'triangle-alert' : 'circle-alert',
    size: 19
  })) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--type-h3)',
      color: 'var(--text-heading)',
      margin: 0
    }
  }, title), description ? /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-small)',
      color: 'var(--text-muted)',
      margin: '4px 0 0'
    }
  }, description) : null), onClose ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    "aria-label": "Close",
    style: {
      width: 32,
      height: 32,
      display: 'grid',
      placeItems: 'center',
      border: 'none',
      background: 'transparent',
      borderRadius: 'var(--radius-control)',
      color: 'var(--text-muted)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 17
  })) : null), children ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 var(--space-6) var(--space-5)'
    }
  }, children) : null, footer ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 'var(--space-2)',
      padding: 'var(--space-4) var(--space-6)',
      background: 'var(--surface-sunken)',
      borderTop: '1px solid var(--border-subtle)'
    }
  }, footer) : null));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const PAWPOLISH_TOAST_TONES = {
  success: {
    icon: 'circle-check',
    color: 'var(--spruce-300)'
  },
  info: {
    icon: 'info',
    color: 'var(--info-50)'
  },
  danger: {
    icon: 'circle-alert',
    color: '#f3a9a3'
  }
};
function Toast({
  tone = 'success',
  title,
  description,
  onDismiss,
  style,
  ...rest
}) {
  const t = PAWPOLISH_TOAST_TONES[tone] || PAWPOLISH_TOAST_TONES.success;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "status",
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-3)',
      width: 360,
      maxWidth: '100%',
      padding: 'var(--space-4)',
      background: 'var(--surface-inverse)',
      color: 'var(--text-inverse)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-lg)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      color: t.color,
      marginTop: '1px'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: t.icon,
    size: 18,
    strokeWidth: 2
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-body-strong)'
    }
  }, title), description ? /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-small)',
      color: 'var(--spruce-200)',
      marginTop: '2px'
    }
  }, description) : null), onDismiss ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onDismiss,
    "aria-label": "Dismiss",
    style: {
      background: 'transparent',
      border: 'none',
      color: 'var(--spruce-300)',
      cursor: 'pointer',
      padding: 0
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 16
  })) : null);
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tooltip({
  label,
  children,
  placement = 'top',
  style,
  ...rest
}) {
  const [show, setShow] = React.useState(false);
  const pos = {
    top: {
      bottom: '100%',
      left: '50%',
      transform: 'translate(-50%, -6px)'
    },
    bottom: {
      top: '100%',
      left: '50%',
      transform: 'translate(-50%, 6px)'
    },
    left: {
      right: '100%',
      top: '50%',
      transform: 'translate(-6px, -50%)'
    },
    right: {
      left: '100%',
      top: '50%',
      transform: 'translate(6px, -50%)'
    }
  }[placement];
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      position: 'relative',
      display: 'inline-flex',
      ...style
    },
    onMouseEnter: () => setShow(true),
    onMouseLeave: () => setShow(false),
    onFocus: () => setShow(true),
    onBlur: () => setShow(false)
  }, rest), children, show ? /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: 'absolute',
      ...pos,
      zIndex: 30,
      whiteSpace: 'nowrap',
      background: 'var(--sand-950)',
      color: 'var(--sand-50)',
      font: 'var(--type-caption)',
      padding: '5px 9px',
      borderRadius: 'var(--radius-sm)',
      boxShadow: 'var(--shadow-md)',
      pointerEvents: 'none'
    }
  }, label) : null);
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Checkbox({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      gap: 'var(--space-3)',
      alignItems: description ? 'flex-start' : 'center',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.55 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    checked: checked,
    onChange: onChange,
    disabled: disabled,
    style: {
      position: 'absolute',
      opacity: 0,
      width: 1,
      height: 1
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      flex: 'none',
      width: 20,
      height: 20,
      display: 'grid',
      placeItems: 'center',
      marginTop: description ? '1px' : 0,
      borderRadius: 'var(--radius-xs)',
      transition: 'var(--transition-control)',
      background: checked ? 'var(--action-primary)' : 'var(--surface-card)',
      border: '1px solid ' + (checked ? 'var(--action-primary)' : 'var(--border-strong)'),
      color: '#fff'
    }
  }, checked ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 14,
    strokeWidth: 3
  }) : null), label || description ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    }
  }, label ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-body)',
      color: 'var(--text-body)'
    }
  }, label) : null, description ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-muted)'
    }
  }, description) : null) : null);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/ChoiceCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ChoiceCard({
  title,
  description,
  meta,
  icon,
  avatar,
  selected = false,
  disabled = false,
  control = 'radio',
  onSelect,
  disabledReason,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const showRing = selected;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: control === 'checkbox' ? 'checkbox' : 'radio',
    "aria-checked": selected,
    "aria-disabled": disabled || undefined,
    tabIndex: disabled ? -1 : 0,
    onClick: () => !disabled && onSelect && onSelect(),
    onKeyDown: e => {
      if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onSelect && onSelect();
      }
    },
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      alignItems: 'flex-start',
      textAlign: 'left',
      width: '100%',
      padding: 'var(--space-4)',
      borderRadius: 'var(--radius-card)',
      background: disabled ? 'var(--surface-sunken)' : selected ? 'var(--surface-primary-soft)' : 'var(--surface-card)',
      border: '1px solid ' + (selected ? 'var(--action-primary)' : hover && !disabled ? 'var(--border-strong)' : 'var(--border-subtle)'),
      boxShadow: showRing ? '0 0 0 1px var(--action-primary)' : 'var(--shadow-xs)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.7 : 1,
      transition: 'var(--transition-control)',
      ...style
    }
  }, rest), avatar ? /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 'none',
      width: 40,
      height: 40,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--apricot-200)',
      color: 'var(--spruce-900)',
      display: 'grid',
      placeItems: 'center',
      font: 'var(--type-body-strong)'
    }
  }, avatar) : icon ? /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 'none',
      width: 36,
      height: 36,
      borderRadius: 'var(--radius-md)',
      background: selected ? 'var(--spruce-100)' : 'var(--surface-sunken)',
      color: selected ? 'var(--spruce-700)' : 'var(--text-muted)',
      display: 'grid',
      placeItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 19
  })) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '3px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 'var(--space-2)',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-body-strong)',
      color: 'var(--text-heading)'
    }
  }, title), meta ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-body-strong)',
      color: 'var(--text-heading)',
      flex: 'none'
    }
  }, meta) : null), description ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-small)',
      color: 'var(--text-muted)'
    }
  }, description) : null, disabled && disabledReason ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      font: 'var(--type-caption)',
      color: 'var(--warning-700)',
      marginTop: '2px'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "ban",
    size: 12,
    strokeWidth: 2
  }), disabledReason) : null, children), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      flex: 'none',
      width: 20,
      height: 20,
      marginTop: '2px',
      display: 'grid',
      placeItems: 'center',
      borderRadius: control === 'checkbox' ? 'var(--radius-xs)' : 'var(--radius-pill)',
      background: selected ? 'var(--action-primary)' : 'var(--surface-card)',
      border: '1px solid ' + (selected ? 'var(--action-primary)' : 'var(--border-strong)'),
      color: '#fff'
    }
  }, selected ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 13,
    strokeWidth: 3
  }) : null));
}
Object.assign(__ds_scope, { ChoiceCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/ChoiceCard.jsx", error: String((e && e.message) || e) }); }

// components/booking/GroomerOption.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function GroomerOption({
  name,
  bio,
  hours,
  anyAvailable = false,
  selected = false,
  disabled = false,
  disabledReason,
  onSelect,
  style,
  ...rest
}) {
  const initials = anyAvailable ? null : (name || '').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  return /*#__PURE__*/React.createElement(__ds_scope.ChoiceCard, _extends({
    control: "radio",
    icon: anyAvailable ? 'users' : undefined,
    avatar: initials || undefined,
    title: anyAvailable ? 'Any available groomer' : name,
    description: anyAvailable ? 'We assign a qualified groomer — usually the widest choice of times.' : [bio, hours].filter(Boolean).join(' · '),
    selected: selected,
    disabled: disabled,
    disabledReason: disabledReason,
    onSelect: onSelect,
    style: style
  }, rest));
}
Object.assign(__ds_scope, { GroomerOption });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/booking/GroomerOption.jsx", error: String((e && e.message) || e) }); }

// components/booking/ServiceOption.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const PAWPOLISH_SERVICE_ICONS = {
  'Bath & Brush': 'droplets',
  'Full Groom': 'scissors',
  'Puppy Introduction Groom': 'heart',
  'Nail Trim': 'paw-print',
  'De-shedding Treatment': 'sparkles'
};
function ServiceOption({
  name,
  description,
  durationMinutes,
  priceCents,
  kind = 'BASE',
  selected = false,
  disabled = false,
  disabledReason,
  onSelect,
  icon,
  style,
  ...rest
}) {
  const price = typeof priceCents === 'number' ? '$' + (priceCents / 100).toFixed(priceCents % 100 === 0 ? 0 : 2) : null;
  const meta = [description, durationMinutes ? durationMinutes + ' min' : null].filter(Boolean).join(' · ');
  return /*#__PURE__*/React.createElement(__ds_scope.ChoiceCard, _extends({
    control: kind === 'ADD_ON' ? 'checkbox' : 'radio',
    icon: icon || PAWPOLISH_SERVICE_ICONS[name] || 'scissors',
    title: name,
    meta: price,
    description: meta,
    selected: selected,
    disabled: disabled,
    disabledReason: disabledReason,
    onSelect: onSelect,
    style: style
  }, rest));
}
Object.assign(__ds_scope, { ServiceOption });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/booking/ServiceOption.jsx", error: String((e && e.message) || e) }); }

// components/forms/Field.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Field({
  label,
  htmlFor,
  hint,
  error,
  required = false,
  optionalLabel = false,
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      ...style
    }
  }, rest), label ? /*#__PURE__*/React.createElement("label", {
    htmlFor: htmlFor,
    style: {
      font: 'var(--type-label)',
      color: 'var(--text-heading)',
      display: 'flex',
      alignItems: 'baseline',
      gap: '6px'
    }
  }, label, required ? /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      color: 'var(--danger-500)'
    }
  }, "*") : null, optionalLabel && !required ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-subtle)',
      fontWeight: 'var(--weight-regular)'
    }
  }, "Optional") : null) : null, children, error ? /*#__PURE__*/React.createElement("span", {
    role: "alert",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      font: 'var(--type-caption)',
      color: 'var(--danger-700)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "circle-alert",
    size: 13,
    strokeWidth: 2
  }), error) : hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-muted)'
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Field });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Field.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  size = 'md',
  iconLeft,
  invalid = false,
  disabled = false,
  readOnly = false,
  fullWidth = true,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const h = size === 'sm' ? 'var(--control-h-sm)' : size === 'lg' ? 'var(--control-h-lg)' : 'var(--control-h-md)';
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: fullWidth ? 'block' : 'inline-block',
      width: fullWidth ? '100%' : undefined
    }
  }, iconLeft ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 'var(--space-3)',
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'var(--text-subtle)',
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconLeft,
    size: 16
  })) : null, /*#__PURE__*/React.createElement("input", _extends({
    type: type,
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    disabled: disabled,
    readOnly: readOnly,
    "aria-invalid": invalid || undefined,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: '100%',
      height: h,
      boxSizing: 'border-box',
      padding: '0 var(--pad-field-x)',
      paddingLeft: iconLeft ? '34px' : 'var(--pad-field-x)',
      font: 'var(--type-body)',
      color: 'var(--text-body)',
      background: disabled ? 'var(--surface-sunken)' : 'var(--surface-card)',
      border: '1px solid ' + (invalid ? 'var(--danger-500)' : focus ? 'var(--border-focus)' : 'var(--border-default)'),
      borderRadius: 'var(--radius-control)',
      outline: 'none',
      boxShadow: focus ? invalid ? '0 0 0 3px var(--danger-50)' : 'var(--focus-ring)' : 'none',
      transition: 'var(--transition-control)',
      cursor: disabled ? 'not-allowed' : 'text',
      ...style
    }
  }, rest)));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Radio({
  checked = false,
  onChange,
  label,
  description,
  name,
  value,
  disabled = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      gap: 'var(--space-3)',
      alignItems: description ? 'flex-start' : 'center',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.55 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "radio",
    name: name,
    value: value,
    checked: checked,
    onChange: onChange,
    disabled: disabled,
    style: {
      position: 'absolute',
      opacity: 0,
      width: 1,
      height: 1
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      flex: 'none',
      width: 20,
      height: 20,
      borderRadius: 'var(--radius-pill)',
      display: 'grid',
      placeItems: 'center',
      background: 'var(--surface-card)',
      transition: 'var(--transition-control)',
      border: '1px solid ' + (checked ? 'var(--action-primary)' : 'var(--border-strong)'),
      boxShadow: checked ? 'inset 0 0 0 1px var(--action-primary)' : 'none',
      marginTop: description ? '1px' : 0
    }
  }, checked ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--action-primary)'
    }
  }) : null), label || description ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    }
  }, label ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-body)',
      color: 'var(--text-body)'
    }
  }, label) : null, description ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-muted)'
    }
  }, description) : null) : null);
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Select({
  value,
  onChange,
  options = [],
  placeholder,
  size = 'md',
  invalid = false,
  disabled = false,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const h = size === 'sm' ? 'var(--control-h-sm)' : size === 'lg' ? 'var(--control-h-lg)' : 'var(--control-h-md)';
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    value: value,
    onChange: onChange,
    disabled: disabled,
    "aria-invalid": invalid || undefined,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: '100%',
      height: h,
      boxSizing: 'border-box',
      appearance: 'none',
      padding: '0 34px 0 var(--pad-field-x)',
      font: 'var(--type-body)',
      color: value ? 'var(--text-body)' : 'var(--text-subtle)',
      background: disabled ? 'var(--surface-sunken)' : 'var(--surface-card)',
      border: '1px solid ' + (invalid ? 'var(--danger-500)' : focus ? 'var(--border-focus)' : 'var(--border-default)'),
      borderRadius: 'var(--radius-control)',
      outline: 'none',
      boxShadow: focus ? 'var(--focus-ring)' : 'none',
      transition: 'var(--transition-control)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      ...style
    }
  }, rest), placeholder ? /*#__PURE__*/React.createElement("option", {
    value: ""
  }, placeholder) : null, options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label))), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      right: 'var(--space-3)',
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'var(--text-muted)',
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 16
  })));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Switch({
  checked = false,
  onChange,
  label,
  disabled = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.55 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    role: "switch",
    checked: checked,
    onChange: onChange,
    disabled: disabled,
    style: {
      position: 'absolute',
      opacity: 0,
      width: 1,
      height: 1
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      flex: 'none',
      width: 40,
      height: 24,
      borderRadius: 'var(--radius-pill)',
      padding: 2,
      background: checked ? 'var(--action-primary)' : 'var(--sand-300)',
      transition: 'var(--transition-control)',
      display: 'flex',
      justifyContent: checked ? 'flex-end' : 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      height: 20,
      borderRadius: 'var(--radius-pill)',
      background: '#fff',
      boxShadow: 'var(--shadow-xs)'
    }
  })), label ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-body)',
      color: 'var(--text-body)'
    }
  }, label) : null);
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  invalid = false,
  disabled = false,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("textarea", _extends({
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    rows: rows,
    disabled: disabled,
    "aria-invalid": invalid || undefined,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: '100%',
      boxSizing: 'border-box',
      padding: 'var(--pad-field-y) var(--pad-field-x)',
      font: 'var(--type-body)',
      color: 'var(--text-body)',
      resize: 'vertical',
      minHeight: 76,
      background: disabled ? 'var(--surface-sunken)' : 'var(--surface-card)',
      border: '1px solid ' + (invalid ? 'var(--danger-500)' : focus ? 'var(--border-focus)' : 'var(--border-default)'),
      borderRadius: 'var(--radius-control)',
      outline: 'none',
      boxShadow: focus ? 'var(--focus-ring)' : 'none',
      transition: 'var(--transition-control)',
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/navigation/AppHeader.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function AppHeader({
  links = [],
  value,
  onNavigate,
  userName,
  right,
  onSignOut,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("header", _extends({
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-6)',
      height: 'var(--header-h)',
      padding: '0 var(--space-6)',
      background: 'var(--surface-card)',
      borderBottom: '1px solid var(--border-subtle)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Logotype, {
    size: "sm"
  }), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-1)',
      marginLeft: 'var(--space-4)'
    }
  }, links.map(l => {
    const active = l.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: l.value,
      type: "button",
      onClick: () => onNavigate && onNavigate(l.value),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        border: 'none',
        cursor: 'pointer',
        padding: '7px var(--space-3)',
        borderRadius: 'var(--radius-control)',
        background: active ? 'var(--surface-sunken)' : 'transparent',
        color: active ? 'var(--text-heading)' : 'var(--text-muted)',
        font: active ? 'var(--type-body-strong)' : 'var(--type-body)',
        transition: 'var(--transition-control)'
      }
    }, l.icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: l.icon,
      size: 16
    }) : null, l.label);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)'
    }
  }, right, userName ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      font: 'var(--type-small)',
      color: 'var(--text-body)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--spruce-100)',
      color: 'var(--spruce-800)',
      display: 'grid',
      placeItems: 'center',
      font: 'var(--type-caption)',
      fontWeight: 'var(--weight-bold)'
    }
  }, userName.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()), userName) : null, onSignOut ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onSignOut,
    "aria-label": "Sign out",
    title: "Sign out",
    style: {
      width: 34,
      height: 34,
      display: 'grid',
      placeItems: 'center',
      background: 'transparent',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-control)',
      color: 'var(--text-muted)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "log-out",
    size: 16
  })) : null));
}
Object.assign(__ds_scope, { AppHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/AppHeader.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SideNav.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SideNav({
  items = [],
  value,
  onChange,
  footer,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("nav", _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-1)',
      width: 'var(--sidebar-w)',
      padding: 'var(--space-4)',
      ...style
    }
  }, rest), items.map(it => {
    const active = it.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: it.value,
      type: "button",
      onClick: () => onChange && onChange(it.value),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        width: '100%',
        textAlign: 'left',
        padding: '9px var(--space-3)',
        borderRadius: 'var(--radius-control)',
        border: 'none',
        cursor: 'pointer',
        background: active ? 'var(--surface-primary-soft)' : 'transparent',
        color: active ? 'var(--spruce-800)' : 'var(--text-body)',
        font: active ? 'var(--type-body-strong)' : 'var(--type-body)',
        transition: 'var(--transition-control)'
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: it.icon,
      size: 18,
      color: active ? 'var(--spruce-700)' : 'var(--text-muted)'
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, it.label), typeof it.count === 'number' ? /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--type-caption)',
        color: 'var(--text-muted)'
      }
    }, it.count) : null);
  }), footer ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      paddingTop: 'var(--space-4)'
    }
  }, footer) : null);
}
Object.assign(__ds_scope, { SideNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SideNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/StepIndicator.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function StepIndicator({
  steps = [],
  current = 0,
  onStepClick,
  compact = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("ol", _extends({
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: compact ? 'var(--space-2)' : 'var(--space-3)',
      listStyle: 'none',
      margin: 0,
      padding: 0,
      ...style
    }
  }, rest), steps.map((label, i) => {
    const done = i < current;
    const active = i === current;
    const clickable = done && onStepClick;
    return /*#__PURE__*/React.createElement("li", {
      key: label,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: compact ? 'var(--space-2)' : 'var(--space-3)',
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      onClick: () => clickable && onStepClick(i),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        cursor: clickable ? 'pointer' : 'default'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 24,
        height: 24,
        flex: 'none',
        display: 'grid',
        placeItems: 'center',
        borderRadius: 'var(--radius-pill)',
        font: 'var(--type-caption)',
        fontWeight: 'var(--weight-bold)',
        background: done ? 'var(--spruce-100)' : active ? 'var(--action-primary)' : 'var(--surface-sunken)',
        color: done ? 'var(--spruce-700)' : active ? '#fff' : 'var(--text-subtle)',
        border: '1px solid ' + (done ? 'var(--spruce-200)' : active ? 'var(--action-primary)' : 'var(--border-subtle)')
      }
    }, done ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "check",
      size: 13,
      strokeWidth: 3
    }) : i + 1), !compact ? /*#__PURE__*/React.createElement("span", {
      style: {
        font: active ? 'var(--type-body-strong)' : 'var(--type-small)',
        color: active ? 'var(--text-heading)' : done ? 'var(--text-body)' : 'var(--text-subtle)',
        whiteSpace: 'nowrap'
      }
    }, label) : null), i < steps.length - 1 ? /*#__PURE__*/React.createElement("span", {
      style: {
        width: compact ? 16 : 28,
        height: 1,
        background: done ? 'var(--spruce-300)' : 'var(--border-default)',
        flex: 'none'
      }
    }) : null);
  }));
}
Object.assign(__ds_scope, { StepIndicator });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/StepIndicator.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tabs({
  tabs = [],
  value,
  onChange,
  size = 'md',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "tablist",
    style: {
      display: 'flex',
      gap: 'var(--space-1)',
      borderBottom: '1px solid var(--border-subtle)',
      ...style
    }
  }, rest), tabs.map(t => {
    const active = t.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: t.value,
      role: "tab",
      "aria-selected": active,
      type: "button",
      onClick: () => onChange && onChange(t.value),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        background: 'transparent',
        border: 'none',
        borderBottom: '2px solid ' + (active ? 'var(--action-primary)' : 'transparent'),
        padding: size === 'sm' ? '8px 10px' : '10px 12px',
        marginBottom: -1,
        cursor: 'pointer',
        font: active ? 'var(--type-body-strong)' : 'var(--type-body)',
        fontSize: size === 'sm' ? 'var(--text-sm)' : 'var(--text-base)',
        color: active ? 'var(--text-heading)' : 'var(--text-muted)',
        transition: 'var(--transition-control)'
      }
    }, t.icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: t.icon,
      size: 16
    }) : null, t.label, typeof t.count === 'number' ? /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--type-caption)',
        color: active ? 'var(--spruce-700)' : 'var(--text-subtle)',
        background: active ? 'var(--spruce-50)' : 'var(--surface-sunken)',
        borderRadius: 'var(--radius-pill)',
        padding: '1px 6px'
      }
    }, t.count) : null);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin-console/Console.jsx
try { (() => {
const {
  AppHeader,
  SideNav,
  Card,
  Badge,
  StatusPill,
  Button,
  IconButton,
  Select,
  Switch,
  Tabs,
  Icon,
  Dialog,
  Alert,
  EmptyState,
  Tooltip,
  Logotype
} = window.PawAmpPolishDesignSystem_25f2e9;
function StatTile({
  label,
  value,
  icon,
  tone
}) {
  return /*#__PURE__*/React.createElement(Card, {
    padding: "sm",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 'none',
      width: 36,
      height: 36,
      borderRadius: 'var(--radius-md)',
      background: tone === 'accent' ? 'var(--apricot-100)' : 'var(--surface-primary-soft)',
      color: tone === 'accent' ? 'var(--apricot-700)' : 'var(--spruce-700)',
      display: 'grid',
      placeItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 18
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 'var(--text-xl)',
      color: 'var(--text-heading)',
      lineHeight: 1.1
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-muted)'
    }
  }, label)));
}
function AppointmentRow({
  appt,
  onComplete,
  onCancel
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '92px minmax(220px, 1.5fr) minmax(160px, 1fr) 120px 118px 80px',
      gap: 'var(--space-4)',
      alignItems: 'center',
      padding: 'var(--space-4) var(--space-5)',
      borderBottom: '1px solid var(--border-subtle)',
      opacity: appt.status === 'CANCELLED' ? 0.6 : 1
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-body-strong)',
      color: 'var(--text-heading)'
    }
  }, appt.time), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-subtle)'
    }
  }, "to ", appt.end)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-body-strong)',
      color: 'var(--text-heading)'
    }
  }, appt.pet), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-small)',
      color: 'var(--text-muted)'
    }
  }, appt.petMeta, " \xB7 ", appt.services.join(' + '))), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-small)',
      color: 'var(--text-body)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "user-round",
    size: 14,
    color: "var(--text-subtle)"
  }), appt.customer), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-mono)',
      fontSize: 'var(--text-2xs)',
      color: 'var(--text-subtle)',
      marginTop: '2px'
    }
  }, appt.id)), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-small)',
      color: 'var(--text-body)'
    }
  }, appt.groomer), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(StatusPill, {
    status: appt.status
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '2px',
      justifyContent: 'flex-end'
    }
  }, appt.status === 'CONFIRMED' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Tooltip, {
    label: "Mark completed"
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "badge-check",
    label: 'Mark ' + appt.id + ' completed',
    variant: "outline",
    onClick: () => onComplete(appt.id)
  })), /*#__PURE__*/React.createElement(Tooltip, {
    label: "Cancel"
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "circle-x",
    label: 'Cancel ' + appt.id,
    variant: "danger",
    onClick: () => onCancel(appt)
  }))) : /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-subtle)'
    }
  }, "No actions")));
}
function AdminConsole() {
  const [nav, setNav] = React.useState('today');
  const [appts, setAppts] = React.useState(ADMIN_APPTS);
  const [groomer, setGroomer] = React.useState('');
  const [showCancelled, setShowCancelled] = React.useState(true);
  const [cancelling, setCancelling] = React.useState(null);
  const visible = appts.filter(a => (!groomer || a.groomer === groomer) && (showCancelled || a.status !== 'CANCELLED'));
  const confirmed = appts.filter(a => a.status === 'CONFIRMED');
  const revenue = appts.filter(a => a.status !== 'CANCELLED').reduce((n, a) => n + a.subtotalCents, 0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement(AppHeader, {
    userName: "Maya Chen",
    onSignOut: () => {},
    right: /*#__PURE__*/React.createElement(Badge, {
      tone: "primary",
      icon: "shield-check"
    }, "Admin")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderRight: '1px solid var(--border-subtle)',
      background: 'var(--bg-page-alt)'
    }
  }, /*#__PURE__*/React.createElement(SideNav, {
    value: nav,
    onChange: setNav,
    items: [{
      value: 'today',
      label: 'Today',
      icon: 'calendar-check',
      count: confirmed.length
    }, {
      value: 'calendar',
      label: 'Calendar',
      icon: 'calendar-days'
    }, {
      value: 'groomers',
      label: 'Groomers',
      icon: 'users',
      count: 3
    }, {
      value: 'services',
      label: 'Services',
      icon: 'scissors',
      count: 5
    }]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      padding: 'var(--space-7)',
      position: 'relative',
      minWidth: 0
    }
  }, nav === 'today' || nav === 'calendar' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 'var(--space-4)',
      marginBottom: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      font: 'var(--type-h2)',
      letterSpacing: 'var(--tracking-snug)'
    }
  }, "Wednesday 2 September"), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-small)',
      color: 'var(--text-muted)',
      margin: '4px 0 0'
    }
  }, "Eastern time \xB7 15-minute cleanup buffer applied after every visit")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "secondary",
    iconLeft: "chevron-left"
  }, "Tue 1"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "secondary",
    iconRight: "chevron-right"
  }, "Thu 3"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 'var(--space-3)',
      marginBottom: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement(StatTile, {
    label: "Confirmed today",
    value: confirmed.length,
    icon: "calendar-check"
  }), /*#__PURE__*/React.createElement(StatTile, {
    label: "Completed",
    value: appts.filter(a => a.status === 'COMPLETED').length,
    icon: "badge-check"
  }), /*#__PURE__*/React.createElement(StatTile, {
    label: "Cancelled",
    value: appts.filter(a => a.status === 'CANCELLED').length,
    icon: "circle-x"
  }), /*#__PURE__*/React.createElement(StatTile, {
    label: "Booked services",
    value: '$' + (revenue / 100).toFixed(0),
    icon: "credit-card",
    tone: "accent"
  })), /*#__PURE__*/React.createElement(Card, {
    padding: "none",
    style: {
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      padding: 'var(--space-4) var(--space-5)',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)',
      color: 'var(--text-heading)'
    }
  }, "Appointments"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 200
    }
  }, /*#__PURE__*/React.createElement(Select, {
    size: "sm",
    value: groomer,
    onChange: e => setGroomer(e.target.value),
    placeholder: "All groomers",
    options: ADMIN_GROOMERS.map(g => ({
      value: g.name,
      label: g.name
    }))
  })), /*#__PURE__*/React.createElement(Switch, {
    checked: showCancelled,
    onChange: () => setShowCancelled(!showCancelled),
    label: "Show cancelled"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      font: 'var(--type-caption)',
      color: 'var(--text-subtle)'
    }
  }, visible.length, " shown")), visible.length ? visible.map(a => /*#__PURE__*/React.createElement(AppointmentRow, {
    key: a.id,
    appt: a,
    onComplete: id => setAppts(appts.map(x => x.id === id ? {
      ...x,
      status: 'COMPLETED'
    } : x)),
    onCancel: setCancelling
  })) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(EmptyState, {
    compact: true,
    icon: "calendar-x",
    title: "Nothing matches these filters",
    description: "Clear the groomer filter to see the full day.",
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "secondary",
      onClick: () => {
        setGroomer('');
        setShowCancelled(true);
      }
    }, "Clear filters")
  }))), /*#__PURE__*/React.createElement(Alert, {
    tone: "info",
    title: "Admin overrides are audited",
    style: {
      marginTop: 'var(--space-5)'
    }
  }, "Admins can cancel inside the customer's 24-hour cutoff. Every status change is recorded against the appointment.")) : null, nav === 'groomers' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h1", {
    style: {
      font: 'var(--type-h2)',
      letterSpacing: 'var(--tracking-snug)',
      marginBottom: 'var(--space-5)'
    }
  }, "Groomers"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-3)'
    }
  }, ADMIN_GROOMERS.map(g => /*#__PURE__*/React.createElement(Card, {
    key: g.name,
    padding: "md",
    style: {
      display: 'flex',
      gap: 'var(--space-4)',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 'none',
      width: 44,
      height: 44,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--apricot-200)',
      color: 'var(--spruce-900)',
      display: 'grid',
      placeItems: 'center',
      font: 'var(--type-body-strong)'
    }
  }, g.name.split(' ').map(p => p[0]).join('')), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-h4)',
      color: 'var(--text-heading)'
    }
  }, g.name), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-small)',
      color: 'var(--text-muted)'
    }
  }, g.services)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    icon: "clock"
  }, g.hours), g.note ? /*#__PURE__*/React.createElement(Badge, {
    tone: "warning",
    icon: "ban"
  }, g.note) : null), /*#__PURE__*/React.createElement(IconButton, {
    icon: "pencil",
    label: 'Edit ' + g.name,
    variant: "outline"
  }))))) : null, nav === 'services' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h1", {
    style: {
      font: 'var(--type-h2)',
      letterSpacing: 'var(--tracking-snug)',
      marginBottom: 'var(--space-5)'
    }
  }, "Service catalogue"), /*#__PURE__*/React.createElement(Card, {
    padding: "none",
    style: {
      overflow: 'hidden'
    }
  }, [['Bath & Brush', 'BASE', '60 min', '$55'], ['Full Groom', 'BASE', '90 min', '$85'], ['Puppy Introduction Groom', 'BASE', '45 min', '$45'], ['Nail Trim', 'ADD_ON', '15 min', '$15'], ['De-shedding Treatment', 'ADD_ON', '30 min', '$30']].map(([name, kind, dur, price]) => /*#__PURE__*/React.createElement("div", {
    key: name,
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 110px 90px 70px 40px',
      gap: 'var(--space-4)',
      alignItems: 'center',
      padding: 'var(--space-4) var(--space-5)',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-body-strong)',
      color: 'var(--text-heading)'
    }
  }, name), /*#__PURE__*/React.createElement(Badge, {
    tone: kind === 'BASE' ? 'primary' : 'accent',
    size: "sm"
  }, kind === 'BASE' ? 'Base service' : 'Add-on'), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-small)',
      color: 'var(--text-muted)'
    }
  }, dur), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-mono)',
      color: 'var(--text-body)'
    }
  }, price), /*#__PURE__*/React.createElement(IconButton, {
    icon: "pencil",
    label: 'Edit ' + name
  }))))) : null, /*#__PURE__*/React.createElement(Dialog, {
    open: !!cancelling,
    tone: "danger",
    title: "Cancel this appointment?",
    onClose: () => setCancelling(null),
    description: cancelling ? cancelling.pet + ' · ' + cancelling.customer + ' · ' + cancelling.time + ' with ' + cancelling.groomer : '',
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: () => setCancelling(null)
    }, "Keep it"), /*#__PURE__*/React.createElement(Button, {
      variant: "danger",
      onClick: () => {
        setAppts(appts.map(x => x.id === cancelling.id ? {
          ...x,
          status: 'CANCELLED'
        } : x));
        setCancelling(null);
      }
    }, "Cancel appointment"))
  }, /*#__PURE__*/React.createElement(Alert, {
    tone: "warning",
    title: "The customer is not notified automatically"
  }, "Call them if the visit is within 24 hours.")))));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(AdminConsole, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin-console/Console.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin-console/data.jsx
try { (() => {
// Admin demo data — Wednesday 2 September 2026, the fixed showcase day.
const ADMIN_APPTS = [{
  id: 'APT-8F3C21',
  time: '9:00 AM',
  end: '10:00 AM',
  groomer: 'Maya Chen',
  customer: 'Jordan Reyes',
  pet: 'Biscuit',
  petMeta: 'Cockapoo · Medium',
  services: ['Bath & Brush'],
  subtotalCents: 5500,
  status: 'CONFIRMED'
}, {
  id: 'APT-4C09B2',
  time: '9:45 AM',
  end: '11:15 AM',
  groomer: 'Sofia Morales',
  customer: 'Priya Raman',
  pet: 'Ollie',
  petMeta: 'Shih Tzu · Small',
  services: ['Full Groom'],
  subtotalCents: 8500,
  status: 'CONFIRMED'
}, {
  id: 'APT-77B0A9',
  time: '10:15 AM',
  end: '11:45 AM',
  groomer: 'Maya Chen',
  customer: 'Dana Whitfield',
  pet: 'Moose',
  petMeta: 'Bernese · Large',
  services: ['Bath & Brush', 'De-shedding Treatment'],
  subtotalCents: 8500,
  status: 'CONFIRMED'
}, {
  id: 'APT-2100FE',
  time: '11:00 AM',
  end: '11:15 AM',
  groomer: 'Liam Patel',
  customer: 'Sam Okafor',
  pet: 'Pixel',
  petMeta: 'Corgi · Medium',
  services: ['Nail Trim'],
  subtotalCents: 1500,
  status: 'COMPLETED'
}, {
  id: 'APT-9D51AA',
  time: '1:45 PM',
  end: '2:30 PM',
  groomer: 'Sofia Morales',
  customer: 'Elena Novak',
  pet: 'Juno',
  petMeta: 'Poodle puppy · Small',
  services: ['Puppy Introduction Groom'],
  subtotalCents: 4500,
  status: 'CONFIRMED'
}, {
  id: 'APT-11A0C4',
  time: '2:15 PM',
  end: '3:45 PM',
  groomer: 'Maya Chen',
  customer: 'Tomás Ruiz',
  pet: 'Bandit',
  petMeta: 'Aussie · Large',
  services: ['Full Groom'],
  subtotalCents: 8500,
  status: 'CANCELLED'
}, {
  id: 'APT-56E7C1',
  time: '3:30 PM',
  end: '4:30 PM',
  groomer: 'Liam Patel',
  customer: 'Aisha Bello',
  pet: 'Nori',
  petMeta: 'Beagle · Medium',
  services: ['Bath & Brush'],
  subtotalCents: 5500,
  status: 'CONFIRMED'
}];
const ADMIN_GROOMERS = [{
  name: 'Maya Chen',
  hours: '9:00 AM – 6:00 PM',
  services: 'All services',
  note: 'Training 12:00–2:00 PM'
}, {
  name: 'Sofia Morales',
  hours: '9:00 AM – 5:00 PM',
  services: 'Bath & Brush, Full Groom, Puppy Intro, Nail Trim',
  note: null
}, {
  name: 'Liam Patel',
  hours: '10:00 AM – 6:00 PM',
  services: 'Bath & Brush, Nail Trim, De-shedding',
  note: null
}];
Object.assign(window, {
  ADMIN_APPTS,
  ADMIN_GROOMERS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin-console/data.jsx", error: String((e && e.message) || e) }); }

// ui_kits/customer-app/Appointments.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  Button,
  Card,
  Tabs,
  AppointmentCard,
  EmptyState,
  Dialog,
  Alert,
  Icon
} = window.PawAmpPolishDesignSystem_25f2e9;
function Appointments({
  appointments,
  onCancel,
  onBook
}) {
  const [tab, setTab] = React.useState('upcoming');
  const [cancelling, setCancelling] = React.useState(null);
  const upcoming = appointments.filter(a => a.status === 'CONFIRMED');
  const past = appointments.filter(a => a.status !== 'CONFIRMED');
  const list = tab === 'upcoming' ? upcoming : past;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-app)',
      margin: '0 auto',
      padding: 'var(--space-8) var(--space-6)',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 'var(--space-4)',
      marginBottom: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      font: 'var(--type-h1)',
      letterSpacing: 'var(--tracking-tight)'
    }
  }, "My appointments"), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-body)',
      color: 'var(--text-muted)',
      margin: '4px 0 0'
    }
  }, "All times are Eastern, the way the salon runs them.")), /*#__PURE__*/React.createElement(Button, {
    iconLeft: "plus",
    onClick: onBook
  }, "Book a visit")), /*#__PURE__*/React.createElement(Tabs, {
    value: tab,
    onChange: setTab,
    style: {
      marginBottom: 'var(--space-5)'
    },
    tabs: [{
      value: 'upcoming',
      label: 'Upcoming',
      count: upcoming.length
    }, {
      value: 'past',
      label: 'Past & cancelled',
      count: past.length
    }]
  }), list.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-3)'
    }
  }, list.map(a => /*#__PURE__*/React.createElement(AppointmentCard, _extends({
    key: a.id
  }, a, {
    reference: a.id,
    lockedNote: a.status === 'CONFIRMED' && !a.changeable ? 'Inside the 24-hour window — call the salon on (718) 555-0148 to change this visit.' : undefined,
    actions: a.status === 'CONFIRMED' && a.changeable ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "secondary",
      iconLeft: "refresh-cw"
    }, "Reschedule"), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "ghost",
      onClick: () => setCancelling(a)
    }, "Cancel")) : a.status === 'COMPLETED' ? /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "secondary",
      iconLeft: "refresh-cw",
      onClick: onBook
    }, "Book this again") : null
  })))) : /*#__PURE__*/React.createElement(EmptyState, {
    icon: "calendar-days",
    title: "Nothing booked yet",
    description: "Pick a service and a time that suits you \u2014 it takes about a minute.",
    action: /*#__PURE__*/React.createElement(Button, {
      iconLeft: "plus",
      onClick: onBook
    }, "Book a visit")
  }), /*#__PURE__*/React.createElement(Dialog, {
    open: !!cancelling,
    tone: "danger",
    title: "Cancel this appointment?",
    description: cancelling ? cancelling.groomerName + ' · ' + cancelling.dateLabel + ', ' + cancelling.timeLabel + '. The slot is released straight away.' : '',
    onClose: () => setCancelling(null),
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: () => setCancelling(null)
    }, "Keep it"), /*#__PURE__*/React.createElement(Button, {
      variant: "danger",
      onClick: () => {
        onCancel(cancelling.id);
        setCancelling(null);
      }
    }, "Cancel appointment"))
  }, /*#__PURE__*/React.createElement(Alert, {
    tone: "warning",
    title: "This can't be undone"
  }, "You can always book a new visit \u2014 the same time may not still be free.")));
}
Object.assign(window, {
  Appointments
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/customer-app/Appointments.jsx", error: String((e && e.message) || e) }); }

// ui_kits/customer-app/Booking.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  Button,
  Card,
  Alert,
  Badge,
  Icon,
  StepIndicator,
  PetCard,
  ServiceOption,
  GroomerOption,
  TimeSlotPicker,
  PriceSummary,
  EmptyState,
  Checkbox
} = window.PawAmpPolishDesignSystem_25f2e9;
const PP_STEPS = ['Pet', 'Services', 'Groomer', 'Date & time', 'Review'];
function StepHeader({
  title,
  hint
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      font: 'var(--type-h2)',
      letterSpacing: 'var(--tracking-snug)'
    }
  }, title), hint ? /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-body)',
      color: 'var(--text-muted)',
      margin: '4px 0 0'
    }
  }, hint) : null);
}
function Booking({
  pets,
  booking,
  setBooking,
  onConfirm,
  slotError,
  onClearSlotError
}) {
  const step = booking.step;
  const base = PP_SERVICES.find(s => s.id === booking.baseId);
  const addOns = PP_SERVICES.filter(s => booking.addOnIds.includes(s.id));
  const selected = [base, ...addOns].filter(Boolean);
  const subtotalCents = selected.reduce((n, s) => n + s.priceCents, 0);
  const totalMinutes = selected.reduce((n, s) => n + s.durationMinutes, 0);
  const allowedAddOns = base ? PP_COMPATIBILITY[base.id] || [] : [];
  const qualified = g => selected.every(s => g.services.includes(s.id));
  const pet = pets.find(p => p.id === booking.petId);
  const groomer = PP_GROOMERS.find(g => g.id === booking.groomerId);
  const go = n => setBooking({
    ...booking,
    step: n
  });
  const canContinue = [!!booking.petId, !!base, !!(booking.groomerId || booking.anyAvailable), !!booking.slot, booking.agreed][step];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-app)',
      margin: '0 auto',
      padding: 'var(--space-7) var(--space-6) var(--space-10)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-4)',
      marginBottom: 'var(--space-7)'
    }
  }, /*#__PURE__*/React.createElement(StepIndicator, {
    steps: PP_STEPS,
    current: step,
    onStepClick: go
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-subtle)'
    }
  }, "Step ", step + 1, " of 5")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 320px',
      gap: 'var(--space-7)',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", null, step === 0 ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(StepHeader, {
    title: "Who's coming in?",
    hint: "Choose the dog for this visit."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-3)'
    }
  }, pets.map(p => /*#__PURE__*/React.createElement(PetCard, _extends({
    key: p.id
  }, p, {
    selectable: true,
    selected: booking.petId === p.id,
    onSelect: () => setBooking({
      ...booking,
      petId: p.id
    })
  }))), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    iconLeft: "plus",
    style: {
      justifySelf: 'start'
    }
  }, "Add another pet"))) : null, step === 1 ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(StepHeader, {
    title: "Pick a service",
    hint: "One main service, plus any add-ons that go with it."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-3)'
    }
  }, PP_SERVICES.filter(s => s.kind === 'BASE').map(s => /*#__PURE__*/React.createElement(ServiceOption, _extends({
    key: s.id
  }, s, {
    selected: booking.baseId === s.id,
    onSelect: () => setBooking({
      ...booking,
      baseId: s.id,
      addOnIds: booking.addOnIds.filter(id => (PP_COMPATIBILITY[s.id] || []).includes(id)),
      groomerId: null,
      anyAvailable: true,
      slot: null
    })
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      margin: 'var(--space-6) 0 var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)',
      color: 'var(--text-heading)'
    }
  }, "Add-ons"), /*#__PURE__*/React.createElement(Badge, {
    size: "sm"
  }, "Optional")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-3)'
    }
  }, PP_SERVICES.filter(s => s.kind === 'ADD_ON').map(s => {
    const ok = allowedAddOns.includes(s.id);
    return /*#__PURE__*/React.createElement(ServiceOption, _extends({
      key: s.id
    }, s, {
      selected: booking.addOnIds.includes(s.id),
      disabled: !ok,
      disabledReason: !base ? 'Choose a main service first' : s.id === 's4' ? 'Already included in ' + base.name : 'Not available with ' + base.name,
      onSelect: () => setBooking({
        ...booking,
        slot: null,
        addOnIds: booking.addOnIds.includes(s.id) ? booking.addOnIds.filter(id => id !== s.id) : [...booking.addOnIds, s.id]
      })
    }));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      font: 'var(--type-caption)',
      color: 'var(--text-subtle)',
      marginTop: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "info",
    size: 13
  }), "Just need nails? Nail Trim can be booked on its own as an express visit.")) : null, step === 2 ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(StepHeader, {
    title: "Choose a groomer",
    hint: "Any available groomer usually gives you the most times to choose from."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement(GroomerOption, {
    anyAvailable: true,
    selected: booking.anyAvailable,
    onSelect: () => setBooking({
      ...booking,
      anyAvailable: true,
      groomerId: null,
      slot: null
    })
  }), PP_GROOMERS.map(g => {
    const ok = qualified(g);
    const missing = selected.find(s => !g.services.includes(s.id));
    return /*#__PURE__*/React.createElement(GroomerOption, {
      key: g.id,
      name: g.name,
      bio: g.bio,
      hours: g.hours,
      selected: booking.groomerId === g.id,
      disabled: !ok,
      disabledReason: missing ? 'Not qualified for ' + missing.name : undefined,
      onSelect: () => setBooking({
        ...booking,
        groomerId: g.id,
        anyAvailable: false,
        slot: null
      })
    });
  }))) : null, step === 3 ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(StepHeader, {
    title: "Pick a time",
    hint: 'Eastern time. Showing times for ' + (booking.anyAvailable ? 'any available groomer' : groomer.name) + '.'
  }), slotError ? /*#__PURE__*/React.createElement(Alert, {
    tone: "danger",
    title: "That time was just booked",
    code: "SLOT_UNAVAILABLE",
    style: {
      marginBottom: 'var(--space-5)'
    },
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "secondary",
      iconLeft: "refresh-cw",
      onClick: onClearSlotError
    }, "Refresh times")
  }, "We kept your pet and services. Pick another time to finish booking.") : null, /*#__PURE__*/React.createElement(TimeSlotPicker, {
    days: PP_DAYS,
    selected: booking.slot,
    onSelect: slot => setBooking({
      ...booking,
      slot
    }),
    note: "Every time includes the 15-minute cleanup buffer after your dog's service."
  })) : null, step === 4 ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(StepHeader, {
    title: "Review & confirm",
    hint: "Check everything, then confirm to hold the slot."
  }), /*#__PURE__*/React.createElement(Card, {
    padding: "lg",
    style: {
      display: 'grid',
      gap: 'var(--space-4)'
    }
  }, [['dog', 'Pet', pet ? pet.name + ' · ' + pet.breed + ' · ' + (pet.ageYears || 0) + ' yrs' : ''], ['scissors', 'Services', selected.map(s => s.name).join(' + ')], ['user-round', 'Groomer', booking.anyAvailable ? booking.slot && booking.slot.groomer ? booking.slot.groomer + ' (assigned for you)' : 'Any available groomer' : groomer.name], ['calendar-days', 'When', booking.slot ? booking.slot.date === '2026-09-02' ? 'Wed 2 Sep 2026, ' + booking.slot.time : 'Thu 3 Sep 2026, ' + booking.slot.time : ''], ['clock', 'Time with your groomer', totalMinutes + ' min, then a 15-min cleanup buffer']].map(([icon, label, value]) => /*#__PURE__*/React.createElement("div", {
    key: label,
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 'none',
      width: 32,
      height: 32,
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-sunken)',
      color: 'var(--text-muted)',
      display: 'grid',
      placeItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 16
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-subtle)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-body-strong)',
      color: 'var(--text-heading)'
    }
  }, value))))), /*#__PURE__*/React.createElement(Alert, {
    tone: "info",
    title: "Free changes until 24 hours before",
    style: {
      marginTop: 'var(--space-4)'
    }
  }, "After that, call the salon and we'll sort it out. You pay at the salon \u2014 nothing is charged now."), /*#__PURE__*/React.createElement(Checkbox, {
    style: {
      marginTop: 'var(--space-4)'
    },
    checked: booking.agreed,
    onChange: () => setBooking({
      ...booking,
      agreed: !booking.agreed
    }),
    label: "I've checked the pet, services, groomer, date and time above."
  })) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      marginTop: 'var(--space-7)'
    }
  }, step > 0 ? /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    iconLeft: "chevron-left",
    onClick: () => go(step - 1)
  }, "Back") : null, step < 4 ? /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    iconRight: "arrow-right",
    disabled: !canContinue,
    onClick: () => go(step + 1)
  }, "Continue") : /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    variant: "accent",
    iconRight: "check",
    disabled: !canContinue,
    onClick: onConfirm
  }, "Confirm appointment"))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      top: 'var(--space-6)',
      display: 'grid',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "md",
    style: {
      display: 'grid',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-label)',
      color: 'var(--text-heading)'
    }
  }, "Your visit"), [[pet ? pet.name : 'Choose a pet', 'dog'], [selected.length ? selected.map(s => s.name).join(' + ') : 'Choose a service', 'scissors'], [booking.anyAvailable ? 'Any available groomer' : groomer.name, 'user-round'], [booking.slot ? (booking.slot.date === '2026-09-02' ? 'Wed 2 Sep' : 'Thu 3 Sep') + ', ' + booking.slot.time : 'Choose a time', 'calendar-days']].map(([text, icon], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 'var(--space-2)',
      alignItems: 'center',
      font: 'var(--type-small)',
      color: text.startsWith('Choose') ? 'var(--text-subtle)' : 'var(--text-body)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 14,
    color: text.startsWith('Choose') ? 'var(--text-subtle)' : 'var(--spruce-600)'
  }), text))), selected.length ? /*#__PURE__*/React.createElement(PriceSummary, {
    subtotalCents: subtotalCents,
    totalMinutes: totalMinutes,
    lines: selected.map(s => ({
      name: s.name,
      priceCents: s.priceCents,
      durationMinutes: s.durationMinutes
    })),
    footnote: "You pay at the salon. Prices and durations come straight from our catalogue."
  }) : /*#__PURE__*/React.createElement(Card, {
    tone: "sunken",
    padding: "md",
    style: {
      font: 'var(--type-small)',
      color: 'var(--text-muted)'
    }
  }, "Pick a service to see the subtotal and how long the visit takes."))));
}
function Confirmation({
  booking,
  pets,
  onDone
}) {
  const pet = pets.find(p => p.id === booking.petId);
  const base = PP_SERVICES.find(s => s.id === booking.baseId);
  const addOns = PP_SERVICES.filter(s => booking.addOnIds.includes(s.id));
  const selected = [base, ...addOns].filter(Boolean);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-form)',
      margin: '0 auto',
      padding: 'var(--space-10) var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 56,
      height: 56,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--success-50)',
      color: 'var(--success-700)',
      display: 'grid',
      placeItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "circle-check",
    size: 30
  })), /*#__PURE__*/React.createElement("h1", {
    style: {
      font: 'var(--type-h1)',
      letterSpacing: 'var(--tracking-tight)'
    }
  }, "You're booked"), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-body)',
      color: 'var(--text-muted)',
      maxWidth: 420
    }
  }, "We've saved ", pet ? pet.name + "'s" : 'your', " spot. Bring them in a few minutes early so they can settle.")), /*#__PURE__*/React.createElement(Card, {
    padding: "lg",
    style: {
      marginTop: 'var(--space-7)',
      display: 'grid',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: 'var(--space-4)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-subtle)'
    }
  }, "Booking reference"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-mono)',
      fontSize: 'var(--text-base)',
      color: 'var(--text-heading)'
    }
  }, "APT-8F3C21")), /*#__PURE__*/React.createElement(Badge, {
    tone: "success",
    icon: "circle-check"
  }, "Confirmed")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border-subtle)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--space-4)'
    }
  }, [['Pet', pet ? pet.name + ' · ' + pet.breed : ''], ['Services', selected.map(s => s.name).join(' + ')], ['Groomer', booking.slot && booking.slot.groomer ? booking.slot.groomer : 'Assigned groomer'], ['When', booking.slot ? (booking.slot.date === '2026-09-02' ? 'Wed 2 Sep 2026' : 'Thu 3 Sep 2026') + ', ' + booking.slot.time : '']].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-subtle)'
    }
  }, k), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-body-strong)',
      color: 'var(--text-heading)'
    }
  }, v))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      justifyContent: 'center',
      marginTop: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    iconLeft: "calendar-days",
    onClick: onDone
  }, "Go to my appointments"), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    variant: "secondary",
    iconLeft: "house"
  }, "Back home")));
}
Object.assign(window, {
  Booking,
  Confirmation,
  PP_STEPS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/customer-app/Booking.jsx", error: String((e && e.message) || e) }); }

// ui_kits/customer-app/Pets.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  Button,
  Card,
  PetCard,
  EmptyState,
  Dialog,
  Field,
  Input,
  Select,
  Textarea,
  Icon
} = window.PawAmpPolishDesignSystem_25f2e9;
function Pets({
  pets,
  onAdd,
  onDelete
}) {
  const [adding, setAdding] = React.useState(false);
  const [form, setForm] = React.useState({
    name: '',
    breed: '',
    size: '',
    ageYears: '',
    temperament: ''
  });
  const set = k => e => setForm({
    ...form,
    [k]: e.target.value
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-app)',
      margin: '0 auto',
      padding: 'var(--space-8) var(--space-6)',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 'var(--space-4)',
      marginBottom: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      font: 'var(--type-h1)',
      letterSpacing: 'var(--tracking-tight)'
    }
  }, "My pets"), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-body)',
      color: 'var(--text-muted)',
      margin: '4px 0 0'
    }
  }, "Details you save here are shared with your groomer at every visit.")), /*#__PURE__*/React.createElement(Button, {
    iconLeft: "plus",
    onClick: () => setAdding(true)
  }, "Add a pet")), pets.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-3)'
    }
  }, pets.map(p => /*#__PURE__*/React.createElement(PetCard, _extends({
    key: p.id
  }, p, {
    onEdit: () => {},
    onDelete: () => onDelete(p.id)
  })))) : /*#__PURE__*/React.createElement(EmptyState, {
    icon: "dog",
    title: "No pets yet",
    description: "Add your dog's details once and reuse them at every booking.",
    action: /*#__PURE__*/React.createElement(Button, {
      iconLeft: "plus",
      onClick: () => setAdding(true)
    }, "Add a pet")
  }), /*#__PURE__*/React.createElement(Card, {
    tone: "sunken",
    padding: "sm",
    style: {
      marginTop: 'var(--space-6)',
      display: 'flex',
      gap: 'var(--space-3)',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "info",
    size: 16,
    color: "var(--text-muted)",
    style: {
      marginTop: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-small)',
      color: 'var(--text-muted)'
    }
  }, "Pet details are operational notes for your groomer \u2014 coat condition, temperament, product allergies. They aren't medical records, and we don't give veterinary advice.")), /*#__PURE__*/React.createElement(Dialog, {
    open: adding,
    title: "Add a pet",
    description: "Dogs only for now. You can edit any of this later.",
    onClose: () => setAdding(false),
    width: 520,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: () => setAdding(false)
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      onClick: () => {
        onAdd({
          ...form,
          ageYears: Number(form.ageYears) || 0
        });
        setAdding(false);
        setForm({
          name: '',
          breed: '',
          size: '',
          ageYears: '',
          temperament: ''
        });
      }
    }, "Save pet"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Name",
    htmlFor: "pn",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    id: "pn",
    placeholder: "Biscuit",
    value: form.name,
    onChange: set('name')
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Breed",
    htmlFor: "pb",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    id: "pb",
    placeholder: "Cockapoo",
    value: form.breed,
    onChange: set('breed')
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Size",
    htmlFor: "ps",
    required: true
  }, /*#__PURE__*/React.createElement(Select, {
    id: "ps",
    placeholder: "Select a size",
    value: form.size,
    onChange: set('size'),
    options: [{
      value: 'SMALL',
      label: 'Small'
    }, {
      value: 'MEDIUM',
      label: 'Medium'
    }, {
      value: 'LARGE',
      label: 'Large'
    }]
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Age in years",
    htmlFor: "pa",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    id: "pa",
    type: "number",
    placeholder: "3",
    value: form.ageYears,
    onChange: set('ageYears')
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Temperament",
    htmlFor: "pt",
    optionalLabel: true,
    style: {
      gridColumn: '1 / -1'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    id: "pt",
    placeholder: "Calm, nervous with clippers\u2026",
    value: form.temperament,
    onChange: set('temperament')
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Notes for the groomer",
    htmlFor: "pnote",
    optionalLabel: true,
    hint: "Allergies, matting, anything to avoid.",
    style: {
      gridColumn: '1 / -1'
    }
  }, /*#__PURE__*/React.createElement(Textarea, {
    id: "pnote",
    rows: 3
  })))));
}
Object.assign(window, {
  Pets
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/customer-app/Pets.jsx", error: String((e && e.message) || e) }); }

// ui_kits/customer-app/SignIn.jsx
try { (() => {
const {
  Button,
  Input,
  Field,
  Logotype,
  Icon,
  Alert
} = window.PawAmpPolishDesignSystem_25f2e9;
function SignIn({
  onSignIn
}) {
  const [email, setEmail] = React.useState('jordan@example.com');
  const [password, setPassword] = React.useState('••••••••••');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100%',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 var(--space-11)',
      background: 'var(--surface-card)'
    }
  }, /*#__PURE__*/React.createElement(Logotype, {
    size: "md",
    style: {
      marginBottom: 'var(--space-8)'
    }
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      font: 'var(--type-h1)',
      letterSpacing: 'var(--tracking-tight)',
      marginBottom: 'var(--space-2)'
    }
  }, "Welcome back"), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-body)',
      color: 'var(--text-muted)',
      marginBottom: 'var(--space-7)'
    }
  }, "Sign in to book a visit, manage your pets, and change appointments."), /*#__PURE__*/React.createElement("form", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
      maxWidth: 380
    },
    onSubmit: e => {
      e.preventDefault();
      onSignIn();
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Email",
    htmlFor: "email"
  }, /*#__PURE__*/React.createElement(Input, {
    id: "email",
    type: "email",
    value: email,
    onChange: e => setEmail(e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Password",
    htmlFor: "pw"
  }, /*#__PURE__*/React.createElement(Input, {
    id: "pw",
    type: "password",
    value: password,
    onChange: e => setPassword(e.target.value)
  })), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    type: "submit",
    fullWidth: true,
    iconRight: "arrow-right"
  }, "Sign in"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      font: 'var(--type-small)'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Create an account"), /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Forgot password?")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      font: 'var(--type-caption)',
      color: 'var(--text-subtle)',
      marginTop: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield-check",
    size: 14
  }), "An account keeps your pets' details and appointment history in one place."))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--spruce-900)',
      color: 'var(--sand-50)',
      padding: 'var(--space-11)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 'var(--text-3xl)',
      letterSpacing: 'var(--tracking-tight)',
      lineHeight: 1.15
    }
  }, "Brooklyn's calmest grooming appointments."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)'
    }
  }, [['calendar-check', 'Real availability', 'Every time you see is a slot we can actually hold — buffers included.'], ['dog', 'One profile per dog', 'Breed, coat, temperament and allergies travel with every booking.'], ['refresh-cw', 'Free changes', 'Reschedule or cancel yourself up to 24 hours before.']].map(([icon, title, body]) => /*#__PURE__*/React.createElement("div", {
    key: title,
    style: {
      display: 'flex',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 'none',
      width: 34,
      height: 34,
      borderRadius: 'var(--radius-md)',
      background: 'var(--spruce-800)',
      color: 'var(--apricot-300)',
      display: 'grid',
      placeItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 17
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-body-strong)'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-small)',
      color: 'var(--spruce-200)'
    }
  }, body))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      font: 'var(--type-caption)',
      color: 'var(--spruce-300)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "map-pin",
    size: 13
  }), "Court Street, Brooklyn \xB7 Mon\u2013Fri 9\u20136, Sat 9\u20134")));
}
Object.assign(window, {
  SignIn
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/customer-app/SignIn.jsx", error: String((e && e.message) || e) }); }

// ui_kits/customer-app/app.jsx
try { (() => {
const {
  AppHeader,
  Button,
  Toast
} = window.PawAmpPolishDesignSystem_25f2e9;
function CustomerApp() {
  const [signedIn, setSignedIn] = React.useState(true);
  const [view, setView] = React.useState('appointments');
  const [pets, setPets] = React.useState(PP_PETS);
  const [appointments, setAppointments] = React.useState(PP_APPOINTMENTS);
  const [toast, setToast] = React.useState(null);
  const [slotError, setSlotError] = React.useState(false);
  const [booking, setBooking] = React.useState({
    step: 0,
    petId: 'p1',
    baseId: null,
    addOnIds: [],
    groomerId: null,
    anyAvailable: true,
    slot: null,
    agreed: false
  });
  const notify = t => {
    setToast(t);
    window.setTimeout(() => setToast(null), 5000);
  };
  if (!signedIn) return /*#__PURE__*/React.createElement(SignIn, {
    onSignIn: () => setSignedIn(true)
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement(AppHeader, {
    userName: "Jordan Reyes",
    onSignOut: () => setSignedIn(false),
    value: view === 'booking' || view === 'confirmed' ? 'appointments' : view,
    onNavigate: setView,
    links: [{
      value: 'appointments',
      label: 'My appointments',
      icon: 'calendar-days'
    }, {
      value: 'pets',
      label: 'My pets',
      icon: 'dog'
    }],
    right: view === 'booking' ? null : /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      iconLeft: "plus",
      onClick: () => {
        setBooking({
          step: 0,
          petId: 'p1',
          baseId: null,
          addOnIds: [],
          groomerId: null,
          anyAvailable: true,
          slot: null,
          agreed: false
        });
        setView('booking');
      }
    }, "Book a visit")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, view === 'appointments' ? /*#__PURE__*/React.createElement(Appointments, {
    appointments: appointments,
    onBook: () => setView('booking'),
    onCancel: id => {
      setAppointments(appointments.map(a => a.id === id ? {
        ...a,
        status: 'CANCELLED',
        changeable: false
      } : a));
      notify({
        title: 'Appointment cancelled',
        description: 'The slot is free for someone else now.'
      });
    }
  }) : null, view === 'pets' ? /*#__PURE__*/React.createElement(Pets, {
    pets: pets,
    onAdd: p => {
      setPets([...pets, {
        ...p,
        id: 'p' + (pets.length + 1)
      }]);
      notify({
        title: 'Pet saved',
        description: (p.name || 'Your dog') + ' is ready for booking.'
      });
    },
    onDelete: id => {
      setPets(pets.filter(p => p.id !== id));
      notify({
        title: 'Pet removed'
      });
    }
  }) : null, view === 'booking' ? /*#__PURE__*/React.createElement(Booking, {
    pets: pets,
    booking: booking,
    setBooking: setBooking,
    slotError: slotError,
    onClearSlotError: () => setSlotError(false),
    onConfirm: () => {
      const base = PP_SERVICES.find(s => s.id === booking.baseId);
      const addOns = PP_SERVICES.filter(s => booking.addOnIds.includes(s.id));
      const names = [base, ...addOns].filter(Boolean).map(s => s.name);
      const subtotal = [base, ...addOns].filter(Boolean).reduce((n, s) => n + s.priceCents, 0);
      const pet = pets.find(p => p.id === booking.petId);
      setAppointments([{
        id: 'APT-8F3C21',
        dateLabel: booking.slot.date === '2026-09-02' ? 'Wed 2 Sep' : 'Thu 3 Sep',
        timeLabel: booking.slot.time,
        endTimeLabel: null,
        petName: pet ? pet.name : '',
        groomerName: booking.slot.groomer ? booking.slot.groomer : 'Assigned groomer',
        services: names,
        subtotalCents: subtotal,
        status: 'CONFIRMED',
        changeable: true
      }, ...appointments.filter(a => a.id !== 'APT-8F3C21')]);
      setView('confirmed');
    }
  }) : null, view === 'confirmed' ? /*#__PURE__*/React.createElement(Confirmation, {
    booking: booking,
    pets: pets,
    onDone: () => setView('appointments')
  }) : null), toast ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      right: 'var(--space-6)',
      bottom: 'var(--space-6)',
      zIndex: 50
    }
  }, /*#__PURE__*/React.createElement(Toast, {
    title: toast.title,
    description: toast.description,
    onDismiss: () => setToast(null)
  })) : null);
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(CustomerApp, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/customer-app/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/customer-app/data.jsx
try { (() => {
// Demo data mirrors supabase/seeds/demo_catalogue.sql and tasks/phase-0.md exactly.
const PP_SERVICES = [{
  id: 's1',
  name: 'Bath & Brush',
  description: 'Bath, drying, brush-out, and light tidy.',
  kind: 'BASE',
  durationMinutes: 60,
  priceCents: 5500
}, {
  id: 's2',
  name: 'Full Groom',
  description: 'Bath, drying, haircut, brush-out, and nail trim.',
  kind: 'BASE',
  durationMinutes: 90,
  priceCents: 8500
}, {
  id: 's3',
  name: 'Puppy Introduction Groom',
  description: 'Gentle first grooming visit for puppies up to twelve months.',
  kind: 'BASE',
  durationMinutes: 45,
  priceCents: 4500
}, {
  id: 's4',
  name: 'Nail Trim',
  description: 'A standalone express visit or compatible add-on.',
  kind: 'ADD_ON',
  durationMinutes: 15,
  priceCents: 1500
}, {
  id: 's5',
  name: 'De-shedding Treatment',
  description: 'A coat treatment for compatible grooming services.',
  kind: 'ADD_ON',
  durationMinutes: 30,
  priceCents: 3000
}];

// base -> allowed add-ons (service_compatibility)
const PP_COMPATIBILITY = {
  s1: ['s4', 's5'],
  s2: ['s5'],
  s3: []
};
const PP_GROOMERS = [{
  id: 'g1',
  name: 'Maya Chen',
  bio: 'Senior groomer with broad service availability',
  hours: 'Mon–Fri 9:00 AM–6:00 PM · Sat 9:00 AM–4:00 PM',
  services: ['s1', 's2', 's3', 's4', 's5']
}, {
  id: 'g2',
  name: 'Sofia Morales',
  bio: 'Specializes in small and medium dogs',
  hours: 'Tue–Sat 9:00 AM–5:00 PM',
  services: ['s1', 's2', 's3', 's4']
}, {
  id: 'g3',
  name: 'Liam Patel',
  bio: 'Bath, brush, nail, and de-shedding care',
  hours: 'Mon–Fri 10:00 AM–6:00 PM · Sat 10:00 AM–4:00 PM',
  services: ['s1', 's4', 's5']
}];
const PP_PETS = [{
  id: 'p1',
  name: 'Biscuit',
  breed: 'Cockapoo',
  size: 'MEDIUM',
  ageYears: 3,
  temperament: 'Calm',
  allergies: 'Oatmeal shampoo'
}, {
  id: 'p2',
  name: 'Moose',
  breed: 'Bernese Mountain Dog',
  size: 'LARGE',
  ageYears: 5,
  temperament: 'Nervous with clippers'
}];

// Availability shown as the server would return it (America/New_York, 15-min starts).
const PP_DAYS = [{
  date: '2026-09-02',
  label: 'Wed 2 Sep',
  slots: [{
    time: '9:00 AM',
    groomer: 'Maya'
  }, {
    time: '9:45 AM',
    groomer: 'Sofia'
  }, {
    time: '10:15 AM',
    groomer: 'Maya'
  }, {
    time: '11:30 AM',
    groomer: 'Sofia'
  }, {
    time: '12:00 PM',
    groomer: 'Maya',
    unavailable: true
  }, {
    time: '1:45 PM',
    groomer: 'Sofia'
  }, {
    time: '2:15 PM',
    groomer: 'Maya'
  }, {
    time: '3:30 PM',
    groomer: 'Maya'
  }]
}, {
  date: '2026-09-03',
  label: 'Thu 3 Sep',
  slots: [{
    time: '9:15 AM',
    groomer: 'Sofia'
  }, {
    time: '10:00 AM',
    groomer: 'Maya'
  }, {
    time: '11:45 AM',
    groomer: 'Maya'
  }, {
    time: '1:00 PM',
    groomer: 'Sofia'
  }, {
    time: '2:30 PM',
    groomer: 'Sofia'
  }, {
    time: '4:00 PM',
    groomer: 'Maya'
  }]
}, {
  date: '2026-09-05',
  label: 'Sat 5 Sep',
  slots: [],
  emptyReason: 'Sofia is on leave and Maya is fully booked.'
}];
const PP_APPOINTMENTS = [{
  id: 'APT-8F3C21',
  dateLabel: 'Wed 2 Sep',
  timeLabel: '10:15 AM',
  endTimeLabel: '11:45 AM',
  petName: 'Biscuit',
  groomerName: 'Maya Chen',
  services: ['Full Groom'],
  subtotalCents: 8500,
  status: 'CONFIRMED',
  changeable: true
}, {
  id: 'APT-77B0A9',
  dateLabel: 'Thu 27 Aug',
  timeLabel: '9:00 AM',
  endTimeLabel: '10:00 AM',
  petName: 'Moose',
  groomerName: 'Liam Patel',
  services: ['Bath & Brush', 'De-shedding Treatment'],
  subtotalCents: 8500,
  status: 'CONFIRMED',
  changeable: false
}, {
  id: 'APT-21D4E7',
  dateLabel: 'Fri 7 Aug',
  timeLabel: '2:15 PM',
  endTimeLabel: '3:00 PM',
  petName: 'Biscuit',
  groomerName: 'Sofia Morales',
  services: ['Puppy Introduction Groom'],
  subtotalCents: 4500,
  status: 'COMPLETED'
}, {
  id: 'APT-11A0C4',
  dateLabel: 'Tue 21 Jul',
  timeLabel: '11:30 AM',
  endTimeLabel: '12:30 PM',
  petName: 'Moose',
  groomerName: 'Maya Chen',
  services: ['Bath & Brush'],
  subtotalCents: 5500,
  status: 'CANCELLED'
}];
const ppMoney = cents => '$' + (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
Object.assign(window, {
  PP_SERVICES,
  PP_COMPATIBILITY,
  PP_GROOMERS,
  PP_PETS,
  PP_DAYS,
  PP_APPOINTMENTS,
  ppMoney
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/customer-app/data.jsx", error: String((e && e.message) || e) }); }

__ds_ns.AppointmentCard = __ds_scope.AppointmentCard;

__ds_ns.GroomerOption = __ds_scope.GroomerOption;

__ds_ns.PetCard = __ds_scope.PetCard;

__ds_ns.PriceSummary = __ds_scope.PriceSummary;

__ds_ns.ServiceOption = __ds_scope.ServiceOption;

__ds_ns.TimeSlotPicker = __ds_scope.TimeSlotPicker;

__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Logotype = __ds_scope.Logotype;

__ds_ns.StatusPill = __ds_scope.StatusPill;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.ChoiceCard = __ds_scope.ChoiceCard;

__ds_ns.Field = __ds_scope.Field;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.AppHeader = __ds_scope.AppHeader;

__ds_ns.SideNav = __ds_scope.SideNav;

__ds_ns.StepIndicator = __ds_scope.StepIndicator;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
