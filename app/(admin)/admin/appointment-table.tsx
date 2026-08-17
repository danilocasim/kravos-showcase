import { StatusPill } from "../../../components/core/status-pill";
import type { AdminAppointmentView } from "../../../lib/ui/admin/console";
import { CancelAdminAppointmentDialog } from "./cancel-appointment-dialog";
import { CompleteAppointmentControl } from "./complete-appointment-control";

const MobileLabel = ({ children }: { readonly children: string }) => (
  <span className="mr-2 [font:var(--type-caption)] font-semibold text-subtle md:hidden">{children}</span>
);

export const AdminAppointmentTable = ({ appointments }: { readonly appointments: ReadonlyArray<AdminAppointmentView> }) => (
  <table className="block w-full table-fixed md:table">
    <caption className="sr-only">Appointments for the selected business day</caption>
    <thead className="hidden border-b border-subtle-border bg-sunken md:table-header-group">
      <tr className="text-left [font:var(--type-caption)] font-semibold text-subtle">
        <th scope="col" className="w-[12%] px-4 py-3">Time</th>
        <th scope="col" className="w-[25%] px-5 py-3">Pet and services</th>
        <th scope="col" className="w-[16%] px-5 py-3">Customer</th>
        <th scope="col" className="w-[12%] px-5 py-3">Groomer</th>
        <th scope="col" className="w-[15%] px-5 py-3">Status</th>
        <th scope="col" className="w-[20%] px-5 py-3 text-right">Actions</th>
      </tr>
    </thead>
    <tbody className="grid gap-3 p-3 md:table-row-group md:p-0">
      {appointments.map((appointment) => (
        <tr key={appointment.id} id={`appointment-${appointment.id}`} className={`grid gap-3 rounded-lg border border-subtle-border bg-card p-4 transition-colors md:table-row md:rounded-none md:border-0 md:border-b md:p-0 md:hover:bg-page-alt ${appointment.status === "CANCELLED" ? "opacity-65" : ""}`}>
          <td className="block md:table-cell md:px-4 md:py-4 md:align-top">
            <MobileLabel>Time</MobileLabel>
            <span className="whitespace-nowrap font-semibold text-heading">{appointment.timeLabel}</span>
            <span className="block whitespace-nowrap [font:var(--type-caption)] text-subtle">to {appointment.endTimeLabel}</span>
          </td>
          <td className="block min-w-0 md:table-cell md:px-5 md:py-4 md:align-top">
            <h2 className="text-lg font-semibold tracking-tight text-heading">{appointment.petName}</h2>
            <p className="mt-1 [font:var(--type-small)] text-muted">{appointment.petMeta} · {appointment.serviceNames.join(" + ")}</p>
            <p className="mt-1 [font:var(--type-caption)] text-subtle">Scheduled subtotal {appointment.subtotalLabel}</p>
          </td>
          <td className="block md:table-cell md:px-5 md:py-4 md:align-top">
            <MobileLabel>Customer</MobileLabel>
            <span className="[font:var(--type-small)] text-body">{appointment.customerDisplayName}</span>
            <span className="mt-1 block [font:var(--type-mono)] text-xs text-subtle">{appointment.reference}</span>
          </td>
          <td className="block md:table-cell md:px-5 md:py-4 md:align-top">
            <MobileLabel>Groomer</MobileLabel>
            <span className="[font:var(--type-small)] text-body">{appointment.groomerDisplayName}</span>
          </td>
          <td className="block md:table-cell md:px-5 md:py-4 md:align-top">
            <MobileLabel>Status</MobileLabel>
            <StatusPill status={appointment.status} />
            <span className="mt-1 block [font:var(--type-caption)] text-subtle">{appointment.auditLabel}</span>
          </td>
          <td className="block md:table-cell md:px-5 md:py-4 md:text-right md:align-top">
            {appointment.canTransition ? (
              <div className="flex flex-col items-stretch gap-2 md:items-end">
                <CompleteAppointmentControl appointmentId={appointment.id} label={`Mark ${appointment.petName}'s ${appointment.timeLabel} appointment completed`} />
                <CancelAdminAppointmentDialog
                  appointmentId={appointment.id}
                  label={`Cancel ${appointment.petName}'s ${appointment.timeLabel} appointment`}
                  description={`${appointment.petName} · ${appointment.customerDisplayName} · ${appointment.timeLabel} with ${appointment.groomerDisplayName}`}
                />
              </div>
            ) : <span className="[font:var(--type-caption)] text-subtle">No actions</span>}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
