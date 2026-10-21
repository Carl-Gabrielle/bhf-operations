<?php

namespace App\Http\Controllers\Leave;

use App\Enums\LeaveApplicationStatus;
use App\Http\Controllers\Controller;
use App\Models\LeaveApplication;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LeaveProcessingController extends Controller
{
    private function authorizeProcessor(Request $request): User
    {
        $user = $request->user();

        abort_unless(
            $user instanceof User
                && $user->account_status === 'active'
                && $user->hasRole('hr')
                && $user->can('leave.process'),
            403,
        );

        return $user;
    }

    /**
     * List approved applications awaiting HR processing,
     * applications currently being processed, and completed applications.
     */
    public function index(Request $request): Response
    {
        $this->authorizeProcessor($request);

        $statuses = [
            LeaveApplicationStatus::Approved->value,
            LeaveApplicationStatus::Processing->value,
            LeaveApplicationStatus::Completed->value,
        ];

        $applications = LeaveApplication::query()
            ->whereIn('status', $statuses)
            ->with([
                'employee:id,name,employee_number,organizational_unit_id,position_id',
                'employee.organizationalUnit',
                'employee.position',
                'leaveType',
                'processingStartedBy:id,name',
                'processedBy:id,name',
            ])
            ->orderByRaw(
                'CASE
                    WHEN status = ? THEN 0
                    WHEN status = ? THEN 1
                    WHEN status = ? THEN 2
                    ELSE 3
                END',
                [
                    LeaveApplicationStatus::Approved->value,
                    LeaveApplicationStatus::Processing->value,
                    LeaveApplicationStatus::Completed->value,
                ],
            )
            ->orderByDesc('approved_at')
            ->orderByDesc('completed_at')
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        // Counts cover all matching records, not only the current page.
        $statsQuery = LeaveApplication::query()->whereIn('status', $statuses);

        $stats = [
            'awaiting_hr' => (clone $statsQuery)
                ->where('status', LeaveApplicationStatus::Approved->value)
                ->count(),
            'processing' => (clone $statsQuery)
                ->where('status', LeaveApplicationStatus::Processing->value)
                ->count(),
            'completed' => (clone $statsQuery)
                ->where('status', LeaveApplicationStatus::Completed->value)
                ->count(),
            'total' => (clone $statsQuery)->count(),
        ];

        return Inertia::render('Leave/Processing/Index', [
            'applications' => $applications,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Display an approved, in-progress, or completed application.
     */
    public function show(
        Request $request,
        LeaveApplication $leaveApplication,
    ): Response {
        $this->authorizeProcessor($request);

        abort_unless(
            in_array($leaveApplication->status, [
                LeaveApplicationStatus::Approved,
                LeaveApplicationStatus::Processing,
                LeaveApplicationStatus::Completed,
            ], true),
            404,
        );

        $leaveApplication->load([
            'employee.organizationalUnit',
            'employee.position',
            'employee.reportsTo',
            'leaveType',
            'approvalWorkflow.steps.approver',
            'approvals.approver.position',
            'approvals.workflowStep',
            'processingStartedBy:id,name',
            'processedBy:id,name',
        ]);

        return Inertia::render('Leave/Processing/Show', [
            'application' => $leaveApplication,
        ]);
    }

    /**
     * Move an approved application into HR processing.
     */
    public function start(
        Request $request,
        LeaveApplication $leaveApplication,
    ): RedirectResponse {
        $user = $this->authorizeProcessor($request);

        $validated = $request->validate([
            'processing_remarks' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ]);

        DB::transaction(function () use (
            $leaveApplication,
            $user,
            $validated
        ): void {
            $application = LeaveApplication::query()
                ->whereKey($leaveApplication->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $application->status === LeaveApplicationStatus::Approved,
                409,
                'Only fully approved applications can enter HR processing.',
            );

            $application->update([
                'status' => LeaveApplicationStatus::Processing,
                'processing_started_by_user_id' => $user->id,
                'processing_started_at' => now(),
                'processing_remarks' =>
                    $validated['processing_remarks'] ?? null,
            ]);
        });

        return redirect()
            ->route('leave.processing.show', $leaveApplication)
            ->with(
                'success',
                "Leave application {$leaveApplication->application_no} is now being processed.",
            );
    }

    /**
     * Complete HR processing.
     */
    public function complete(
        Request $request,
        LeaveApplication $leaveApplication,
    ): RedirectResponse {
        $user = $this->authorizeProcessor($request);

        $validated = $request->validate([
            'processing_remarks' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ]);

        DB::transaction(function () use (
            $leaveApplication,
            $user,
            $validated
        ): void {
            $application = LeaveApplication::query()
                ->whereKey($leaveApplication->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $application->status === LeaveApplicationStatus::Processing,
                409,
                'Only applications currently being processed can be completed.',
            );

            $application->update([
                'status' => LeaveApplicationStatus::Completed,
                'processed_by_user_id' => $user->id,
                'processed_at' => now(),
                'completed_at' => now(),
                'processing_remarks' =>
                    $validated['processing_remarks']
                    ?? $application->processing_remarks,
            ]);
        });

        return redirect()
            ->route('leave.processing.index')
            ->with(
                'success',
                "Leave application {$leaveApplication->application_no} has been completed.",
            );
    }
}
