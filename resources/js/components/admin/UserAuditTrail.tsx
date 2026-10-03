import { Activity } from 'lucide-react';

import type { AuditLog } from '@/types/user';
import { formatDate } from '@/utils/formatting';
import {
    formatAuditField,
    formatAuditValue,
    getAuditActionClass,
    getAuditActionLabel,
    getAuditActorName,
} from '@/utils/audit';
import { SectionHeading } from './UserPrimitives';

export default function UserAuditTrail({
    logs,
}: {
    logs: AuditLog[];
}) {
    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.035)]">
            <div className="border-b border-slate-100 px-5 py-4">
                <SectionHeading
                    icon={Activity}
                    title="Audit Trail"
                    description="Administrative activity and account changes for this user."
                    action={
                        <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500 ring-1 ring-slate-200">
                            {logs.length} {logs.length === 1 ? 'Event' : 'Events'}
                        </span>
                    }
                />
            </div>

            <div className="p-5">
                {logs.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-5 py-10 text-center">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-300 ring-1 ring-slate-200">
                            <Activity className="h-4 w-4" />
                        </div>

                        <p className="mt-3 text-xs font-semibold text-slate-600">
                            No audit activity recorded
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                            Changes and administrative actions will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="relative">
                        <div className="absolute bottom-5 left-[15px] top-5 w-px bg-slate-200" />

                        <div className="space-y-5">
                            {logs.map((audit) => (
                                <div
                                    key={audit.id}
                                    className="relative pl-9"
                                >
                                    <div className="absolute left-0 top-4 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-[#173B67] shadow-sm ring-1 ring-slate-200">
                                        <Activity className="h-3 w-3 text-white" />
                                    </div>

                                    <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span
                                                        className={`inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-semibold ${getAuditActionClass(audit.action)}`}
                                                    >
                                                        {getAuditActionLabel(audit.action)}
                                                    </span>

                                                    <span className="text-[10px] text-slate-400">
                                                        {formatDate(audit.created_at)}
                                                    </span>
                                                </div>

                                                <p className="mt-2 text-xs font-medium leading-5 text-slate-700">
                                                    {audit.description}
                                                </p>

                                                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-slate-400">
                                                    <span>
                                                        Performed by:{' '}
                                                        <strong className="font-semibold text-slate-600">
                                                            {getAuditActorName(audit)}
                                                        </strong>
                                                    </span>

                                                    {audit.actor?.username && (
                                                        <span>
                                                            Username:{' '}
                                                            <strong className="font-medium text-slate-600">
                                                                {audit.actor.username}
                                                            </strong>
                                                        </span>
                                                    )}

                                                    {audit.ip_address && (
                                                        <span>
                                                            IP:{' '}
                                                            <strong className="font-medium text-slate-600">
                                                                {audit.ip_address}
                                                            </strong>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {audit.changes &&
                                                Object.keys(audit.changes).length > 0 && (
                                                    <div className="w-full lg:max-w-md">
                                                        <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                                            Changes
                                                        </p>

                                                        <div className="space-y-1.5">
                                                            {Object.entries(audit.changes).map(
                                                                ([field, change]) => (
                                                                    <div
                                                                        key={field}
                                                                        className="rounded-md border border-slate-200 bg-white px-3 py-2"
                                                                    >
                                                                        <p className="text-[10px] font-semibold text-slate-600">
                                                                            {formatAuditField(field)}
                                                                        </p>

                                                                        {change.changed ? (
                                                                            <p className="mt-1 text-[10px] text-slate-500">
                                                                                Value changed
                                                                            </p>
                                                                        ) : (
                                                                            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                                                                <div className="min-w-0">
                                                                                    <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                                                                                        Before
                                                                                    </span>
                                                                                    <p className="mt-0.5 truncate text-[10px] text-slate-500">
                                                                                        {formatAuditValue(change.old)}
                                                                                    </p>
                                                                                </div>

                                                                                <div className="min-w-0">
                                                                                    <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                                                                                        After
                                                                                    </span>
                                                                                    <p className="mt-0.5 truncate text-[10px] font-medium text-slate-700">
                                                                                        {formatAuditValue(change.new)}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
