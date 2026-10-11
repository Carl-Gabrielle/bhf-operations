<?php

namespace App\Http\Controllers;

use App\Enums\LeaveApplicationStatus;
use App\Models\LeaveApplication;
use App\Models\LeaveApproval;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $roles = $user->getRoleNames()->values()->all();
        $permissions = $user->getAllPermissions()->pluck('name')->values()->all();

        $isAdmin = $user->hasRole('admin');
        $isHr = $user->hasRole('hr');
        $canViewEmployees = $isAdmin || $user->can('employees.view');
        $canViewLeave = $isAdmin || $user->can('leave.view');
        $canApproveLeave = $user->can('leave.approve');
        $canProcessLeave = $user->can('leave.process');

        // Administrator dashboard is intentionally system-focused.
        $admin = null;
        if ($isAdmin) {
            $admin = [
                'totalUsers' => User::query()->count(),
                'activeUsers' => User::query()->where('account_status', 'active')->count(),
                'roles' => Role::query()->count(),
                'permissions' => \Spatie\Permission\Models\Permission::query()->count(),
                'recentUsers' => User::query()->latest()->limit(6)->get(['id', 'name', 'email', 'created_at'])
                    ->map(fn (User $item) => [
                        'id' => $item->id,
                        'name' => $item->name,
                        'email' => $item->email,
                        'createdAt' => $item->created_at?->format('M d, Y'),
                    ])->values(),
            ];
        }

        $visibleLeaves = LeaveApplication::query();
        if (! $canViewLeave) {
            $visibleLeaves->whereRaw('1 = 0');
        } elseif (! $isAdmin && ! $isHr) {
            $visibleLeaves->where(function (Builder $query) use ($user, $canApproveLeave) {
                $query->where('employee_id', $user->id);
                if ($canApproveLeave) {
                    $query->orWhereHas('approvals', fn (Builder $approvalQuery) =>
                        $approvalQuery->where('approver_id', $user->id));
                }
            });
        }

        $totalLeaves = $canViewLeave ? (clone $visibleLeaves)->count() : 0;
        $pendingLeaves = $canViewLeave
            ? (clone $visibleLeaves)->where('status', LeaveApplicationStatus::PendingApproval->value)->count()
            : 0;
        $approvedLeaves = $canViewLeave
            ? (clone $visibleLeaves)->where('status', LeaveApplicationStatus::Approved->value)->count()
            : 0;
        $rejectedLeaves = $canViewLeave
            ? (clone $visibleLeaves)->where('status', LeaveApplicationStatus::Rejected->value)->count()
            : 0;

        $myPendingApprovals = $canApproveLeave
            ? LeaveApproval::query()->where('approver_id', $user->id)->where('action', 'pending')->count()
            : 0;

        // This is a provisional queue count until the app has a distinct HR-processing state.
        $pendingHrProcessing = ($canViewLeave && $canProcessLeave)
            ? LeaveApplication::query()->where('status', LeaveApplicationStatus::Approved->value)->count()
            : 0;

        $recentRequests = collect();
        if ($canViewLeave) {
            $recentRequests = (clone $visibleLeaves)
                ->with(['employee:id,name,employee_number', 'leaveType'])
                ->latest()->limit(8)->get()
                ->map(function (LeaveApplication $application) {
                    return [
                        'id' => $application->id,
                        'reference' => $application->getAttribute('reference_number') ?: 'LEAVE-' . str_pad((string) $application->id, 5, '0', STR_PAD_LEFT),
                        'employee' => $application->employee?->name ?? 'Unknown employee',
                        'employeeNumber' => $application->employee?->employee_number,
                        'department' => $application->employee?->getAttribute('department') ?: '—',
                        'type' => $application->leaveType?->name ?? 'Leave Application',
                        'date' => $application->created_at?->format('M d, Y'),
                        'status' => $application->status instanceof LeaveApplicationStatus
                            ? $application->status->value
                            : (string) $application->status,
                        'url' => route('leave.applications.show', $application->id),
                    ];
                })->values();
        }

        $stats = [];
        if ($canViewEmployees) {
            $stats[] = ['key' => 'users', 'label' => 'Total users', 'value' => User::query()->count(), 'description' => 'Registered accounts'];
        }
        if ($canViewLeave) {
            $stats[] = ['key' => 'leaves', 'label' => 'Leave applications', 'value' => $totalLeaves, 'description' => 'Within your access scope'];
            $stats[] = ['key' => 'pending', 'label' => 'Awaiting approval', 'value' => $pendingLeaves, 'description' => 'Applications pending a decision'];
            $stats[] = ['key' => 'approved', 'label' => 'Approved', 'value' => $approvedLeaves, 'description' => 'Approved applications'];
            $stats[] = ['key' => 'rejected', 'label' => 'Rejected', 'value' => $rejectedLeaves, 'description' => 'Rejected applications'];
        }
        if ($canApproveLeave) {
            $stats[] = ['key' => 'my_approvals', 'label' => 'My pending approvals', 'value' => $myPendingApprovals, 'description' => 'Assigned directly to you'];
        }
        if ($canViewLeave && $canProcessLeave) {
            $stats[] = ['key' => 'hr_processing', 'label' => 'Pending HR processing', 'value' => $pendingHrProcessing, 'description' => 'Approved applications; verify processing state'];
        }

        return Inertia::render('Dashboard', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $roles[0] ?? null,
                'roles' => $roles,
                'permissions' => $permissions,
                'position' => $user->position?->name,
                'can_be_reporting_manager' => (bool) $user->can_be_reporting_manager,
                'reports_to_user_id' => $user->reports_to_user_id,
            ],
            'dashboard' => [
                'admin' => $admin,
                'stats' => $stats,
                'recentRequests' => $recentRequests,
                'pendingApprovals' => $myPendingApprovals,
                'pendingHrProcessing' => $pendingHrProcessing,
                'can' => [
                    'viewEmployees' => $canViewEmployees,
                    'viewLeave' => $canViewLeave,
                    'approveLeave' => $canApproveLeave,
                    'processLeave' => $canProcessLeave,
                ],
            ],
        ]);
    }
}
