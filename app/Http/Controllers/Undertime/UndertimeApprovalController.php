<?php

namespace App\Http\Controllers\Undertime;

use App\Http\Controllers\Controller;
use App\Models\UndertimeApplication;
use App\Models\UndertimeApproval;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class UndertimeApprovalController extends Controller
{
    private function authorizeApprover(Request $request): void
    {
        $user = $request->user();
        abort_unless(
            $user && $user->account_status === 'active' && $user->can('undertime.approve'),
            403,
            'You are not authorized to access Undertime approvals.'
        );
    }

    /** Build the common, reviewer-scoped report query. */
    private function reportQuery(Request $request)
    {
        $userId = $request->user()->id;

        $query = DB::table('undertime_approvals as ua')
            ->join('undertime_applications as a', 'a.id', '=', 'ua.undertime_application_id')
            ->leftJoin('users as employee', 'employee.id', '=', 'a.employee_id')
            ->leftJoin('organizational_units as ou', 'ou.id', '=', 'employee.organizational_unit_id')
            ->where('ua.approver_id', $userId)
            ->whereIn('ua.action', ['approved', 'rejected'])
            ->select([
                'ua.id as approval_id',
                'ua.action',
                'ua.remarks',
                'ua.acted_at',
                'ua.step_order',
                'a.id as application_id',
                'a.application_no',
                'a.undertime_date',
                'a.requested_departure_time',
                'a.requested_minutes',
                'a.status as application_status',
                'employee.name as employee_name',
                'employee.employee_number',
                'ou.name as department',
            ]);

        if ($request->filled('search')) {
            $search = trim($request->string('search')->toString());
            $query->where(function ($builder) use ($search) {
                $builder->where('a.application_no', 'like', "%{$search}%")
                    ->orWhere('employee.name', 'like', "%{$search}%")
                    ->orWhere('employee.employee_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('a.undertime_date', '>=', $request->input('date_from'));
        }
        if ($request->filled('date_to')) {
            $query->whereDate('a.undertime_date', '<=', $request->input('date_to'));
        }

        return $query;
    }

    public function index(Request $request): Response
    {
        $this->authorizeApprover($request);
        $user = $request->user()->loadMissing([
            'organizationalUnit:id,code,name',
            'position:id,name',
        ]);

        $query = UndertimeApplication::query()
            ->where('status', 'pending_approval')
            ->whereHas('approvals', fn ($q) => $q
                ->where('approver_id', $user->id)
                ->where('action', 'pending'))
            ->with([
                'employee:id,name,employee_number,organizational_unit_id,position_id',
                'employee.organizationalUnit:id,code,name',
                'employee.position:id,name',
                'approvalWorkflow:id,name,code',
                'approvals' => fn ($q) => $q
                    ->where('approver_id', $user->id)
                    ->where('action', 'pending'),
            ]);

        if ($request->filled('search')) {
            $search = trim($request->string('search')->toString());
            $query->where(function ($q) use ($search) {
                $q->where('application_no', 'like', "%{$search}%")
                    ->orWhereHas('employee', fn ($employee) => $employee
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('employee_number', 'like', "%{$search}%"));
            });
        }
        if ($request->filled('date_from')) {
            $query->whereDate('undertime_date', '>=', $request->input('date_from'));
        }
        if ($request->filled('date_to')) {
            $query->whereDate('undertime_date', '<=', $request->input('date_to'));
        }

        $applications = $query->latest('submitted_at')->paginate(10)->withQueryString()->through(
            fn ($application) => [
                'id' => $application->id,
                'application_no' => $application->application_no,
                'employee' => [
                    'id' => $application->employee?->id,
                    'name' => $application->employee?->name,
                    'employee_number' => $application->employee?->employee_number,
                    'department' => $application->employee?->organizationalUnit?->name,
                    'position' => $application->employee?->position?->name,
                ],
                'undertime_date' => $application->undertime_date?->format('Y-m-d'),
                'scheduled_end_time' => $application->scheduled_end_time,
                'requested_departure_time' => $application->requested_departure_time,
                'requested_minutes' => $application->requested_minutes,
                'reason' => $application->reason,
                'status' => $application->status,
                'workflow' => $application->approvalWorkflow?->name,
                'step_order' => $application->approvals->first()?->step_order,
                'submitted_at' => $application->submitted_at?->toISOString(),
            ]
        );

        $pendingCount = UndertimeApplication::query()
            ->where('status', 'pending_approval')
            ->whereHas('approvals', fn ($q) => $q->where('approver_id', $user->id)->where('action', 'pending'))
            ->count();
        $approvedCount = UndertimeApproval::where('approver_id', $user->id)->where('action', 'approved')->count();
        $rejectedCount = UndertimeApproval::where('approver_id', $user->id)->where('action', 'rejected')->count();

        $recentHistory = $this->reportQuery($request)
            ->orderByDesc('ua.acted_at')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'id' => $row->approval_id,
                'application_id' => $row->application_id,
                'application_no' => $row->application_no,
                'employee_name' => $row->employee_name,
                'employee_number' => $row->employee_number,
                'department' => $row->department,
                'undertime_date' => $row->undertime_date,
                'action' => $row->action,
                'remarks' => $row->remarks,
                'acted_at' => $row->acted_at,
            ]);

        return Inertia::render('Undertime/Approvals/Index', [
            'applications' => $applications,
            'recentHistory' => $recentHistory,
            'stats' => [
                'pending_count' => $pendingCount,
                'approved_count' => $approvedCount,
                'rejected_count' => $rejectedCount,
                'decisions_count' => $approvedCount + $rejectedCount,
            ],
            'filters' => [
                'search' => $request->input('search', ''),
                'date_from' => $request->input('date_from', ''),
                'date_to' => $request->input('date_to', ''),
            ],
            'approver' => [
                'id' => $user->id,
                'name' => $user->name,
                'employee_number' => $user->employee_number,
                'department' => $user->organizationalUnit?->name,
                'position' => $user->position?->name,
            ],
        ]);
    }

    /** Display a request assigned to the authenticated approver. */
    public function show(Request $request, UndertimeApplication $undertimeApplication): Response
    {
        $this->authorizeApprover($request);
        $this->authorizePendingAssignment($request, $undertimeApplication);

        $undertimeApplication->load([
            'employee:id,name,employee_number,email,organizational_unit_id,position_id,reports_to_user_id',
            'employee.organizationalUnit:id,code,name',
            'employee.position:id,name',
            'employee.reportsTo:id,name',
            'approvalWorkflow:id,name,code',
            'approvalWorkflow.steps:id,approval_workflow_id,step_order,name,approver_type,is_required',
            'approvals.approver:id,name,employee_number,organizational_unit_id,position_id',
            'approvals.approver.organizationalUnit:id,code,name',
            'approvals.approver.position:id,name',
            'approvals.workflowStep:id,name,step_order',
        ]);

        $currentApproval = $undertimeApplication->approvals
            ->firstWhere('approver_id', $request->user()->id);
        $assignedReviewer = $currentApproval?->approver;

        return Inertia::render('Undertime/Approvals/Show', [
            'application' => [
                'id' => $undertimeApplication->id,
                'application_no' => $undertimeApplication->application_no,
                'employee' => [
                    'id' => $undertimeApplication->employee?->id,
                    'name' => $undertimeApplication->employee?->name,
                    'employee_number' => $undertimeApplication->employee?->employee_number,
                    'email' => $undertimeApplication->employee?->email,
                    'department' => $undertimeApplication->employee?->organizationalUnit?->name,
                    'position' => $undertimeApplication->employee?->position?->name,
                    'manager' => $undertimeApplication->employee?->reportsTo?->name,
                ],
                'assigned_reviewer' => $assignedReviewer ? [
                    'id' => $assignedReviewer->id,
                    'name' => $assignedReviewer->name,
                    'employee_number' => $assignedReviewer->employee_number,
                    'department' => $assignedReviewer->organizationalUnit?->name,
                    'position' => $assignedReviewer->position?->name,
                ] : null,
                'date_filed' => $undertimeApplication->date_filed?->format('Y-m-d'),
                'undertime_date' => $undertimeApplication->undertime_date?->format('Y-m-d'),
                'scheduled_start_time' => $undertimeApplication->scheduled_start_time,
                'scheduled_end_time' => $undertimeApplication->scheduled_end_time,
                'requested_departure_time' => $undertimeApplication->requested_departure_time,
                'requested_minutes' => $undertimeApplication->requested_minutes,
                'reason' => $undertimeApplication->reason,
                'has_attachment' => filled($undertimeApplication->attachment_path),
                'status' => $undertimeApplication->status,
                'submitted_at' => $undertimeApplication->submitted_at?->toISOString(),
                'workflow' => $undertimeApplication->approvalWorkflow?->name,
                'current_step' => $undertimeApplication->current_step,
                'current_approval' => $currentApproval ? [
                    'id' => $currentApproval->id,
                    'step_order' => $currentApproval->step_order,
                    'action' => $currentApproval->action,
                    'remarks' => $currentApproval->remarks,
                ] : null,
                'approvals' => $undertimeApplication->approvals->map(fn (UndertimeApproval $approval) => [
                    'id' => $approval->id,
                    'step_order' => $approval->step_order,
                    'step_name' => $approval->workflowStep?->name,
                    'approver' => $approval->approver?->name,
                    'approver_id' => $approval->approver?->id,
                    'approver_department' => $approval->approver?->organizationalUnit?->name,
                    'approver_position' => $approval->approver?->position?->name,
                    'action' => $approval->action,
                    'remarks' => $approval->remarks,
                    'acted_at' => $approval->acted_at?->toISOString(),
                ])->values(),
            ],
        ]);
    }

    /** Approve the current step and activate the next waiting step. */
    public function approve(Request $request, UndertimeApplication $undertimeApplication): RedirectResponse
    {
        $this->authorizeApprover($request);
        $validated = $request->validate([
            'remarks' => ['nullable', 'string', 'max:2000'],
        ]);

        DB::transaction(function () use ($request, $undertimeApplication, $validated) {
            $application = UndertimeApplication::query()->whereKey($undertimeApplication->id)->lockForUpdate()->firstOrFail();
            if ($application->status !== 'pending_approval') {
                throw ValidationException::withMessages(['approval' => 'This application is no longer awaiting approval.']);
            }

            $approval = UndertimeApproval::query()
                ->where('undertime_application_id', $application->id)
                ->where('approver_id', $request->user()->id)
                ->where('action', 'pending')
                ->lockForUpdate()
                ->first();
            if (!$approval) {
                throw ValidationException::withMessages(['approval' => 'You do not have a pending approval assignment for this application.']);
            }

            $approval->update([
                'action' => 'approved',
                'remarks' => $validated['remarks'] ?? null,
                'acted_at' => now(),
            ]);

            $nextApproval = UndertimeApproval::query()
                ->where('undertime_application_id', $application->id)
                ->where('action', 'waiting')
                ->orderBy('step_order')
                ->lockForUpdate()
                ->first();

            if ($nextApproval) {
                $nextApproval->update(['action' => 'pending']);
                $application->update(['current_step' => $nextApproval->step_order]);
            } else {
                $application->update([
                    'status' => 'approved',
                    'approved_at' => now(),
                    'current_step' => $approval->step_order,
                ]);
            }
        });

        return redirect()->route('undertime.approvals.index')->with('success', 'Undertime application approved successfully.');
    }

    /** Reject the application and cancel all remaining waiting approvals. */
    public function reject(Request $request, UndertimeApplication $undertimeApplication): RedirectResponse
    {
        $this->authorizeApprover($request);
        $validated = $request->validate([
            'remarks' => ['required', 'string', 'min:3', 'max:2000'],
        ]);

        DB::transaction(function () use ($request, $undertimeApplication, $validated) {
            $application = UndertimeApplication::query()->whereKey($undertimeApplication->id)->lockForUpdate()->firstOrFail();
            if ($application->status !== 'pending_approval') {
                throw ValidationException::withMessages(['approval' => 'This application is no longer awaiting approval.']);
            }

            $approval = UndertimeApproval::query()
                ->where('undertime_application_id', $application->id)
                ->where('approver_id', $request->user()->id)
                ->where('action', 'pending')
                ->lockForUpdate()
                ->first();
            if (!$approval) {
                throw ValidationException::withMessages(['approval' => 'You do not have a pending approval assignment for this application.']);
            }

            $approval->update([
                'action' => 'rejected',
                'remarks' => $validated['remarks'],
                'acted_at' => now(),
            ]);

            UndertimeApproval::query()
                ->where('undertime_application_id', $application->id)
                ->where('action', 'waiting')
                ->update(['action' => 'cancelled']);

            $application->update(['status' => 'rejected', 'rejected_at' => now()]);
        });

        return redirect()->route('undertime.approvals.index')->with('success', 'Undertime application rejected.');
    }

    private function authorizePendingAssignment(Request $request, UndertimeApplication $application): void
    {
        abort_unless(
            $application->status === 'pending_approval'
                && $application->approvals()
                    ->where('approver_id', $request->user()->id)
                    ->where('action', 'pending')
                    ->exists(),
            403,
            'You are not assigned to approve this application.'
        );
    }
}
