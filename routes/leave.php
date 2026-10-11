<?php

use App\Http\Controllers\Leave\LeaveApplicationController;
use App\Http\Controllers\Leave\LeaveApprovalController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Leave Management Routes
|--------------------------------------------------------------------------
|
| These routes are loaded by routes/web.php inside:
|
|   auth
|       ↓
|   force.password.change
|       ↓
|   leave prefix and name
|
| Application URLs:
|
|   GET    /leave/applications
|   GET    /leave/applications/create
|   POST   /leave/applications
|   GET    /leave/applications/{leaveApplication}
|   GET    /leave/applications/{leaveApplication}/edit
|   PUT    /leave/applications/{leaveApplication}
|   GET    /leave/applications/{leaveApplication}/download
|
| Approval URLs:
|
|   GET    /leave/approvals
|   GET    /leave/approvals/{leaveApplication}
|   POST   /leave/approvals/{leaveApplication}/approve
|   POST   /leave/approvals/{leaveApplication}/reject
|
|--------------------------------------------------------------------------
| Leave Application Route Names
|--------------------------------------------------------------------------
|
| leave.applications.index
| leave.applications.create
| leave.applications.store
| leave.applications.show
| leave.applications.edit
| leave.applications.update
| leave.applications.download
|
|--------------------------------------------------------------------------
| Leave Approval Route Names
|--------------------------------------------------------------------------
|
| leave.approvals.index
| leave.approvals.show
| leave.approvals.approve
| leave.approvals.reject
|
*/

/*
|--------------------------------------------------------------------------
| Leave Applications
|--------------------------------------------------------------------------
*/

Route::prefix('applications')
    ->name('applications.')
    ->controller(LeaveApplicationController::class)
    ->group(function () {

        /*
        |--------------------------------------------------------------------------
        | List Leave Applications
        |--------------------------------------------------------------------------
        */

        Route::get('/', 'index')
            ->middleware('permission:leave.view')
            ->name('index');

        /*
        |--------------------------------------------------------------------------
        | Create Leave Application
        |--------------------------------------------------------------------------
        */

        Route::get('/create', 'create')
            ->middleware('permission:leave.create')
            ->name('create');

        /*
        |--------------------------------------------------------------------------
        | Store Leave Application
        |--------------------------------------------------------------------------
        */

        Route::post('/', 'store')
            ->middleware('permission:leave.create')
            ->name('store');

        /*
        |--------------------------------------------------------------------------
        | Download Leave Application
        |--------------------------------------------------------------------------
        */

        Route::get('/{leaveApplication}/download', 'download')
            ->middleware('permission:leave.view')
            ->name('download');

        /*
        |--------------------------------------------------------------------------
        | Edit Leave Application
        |--------------------------------------------------------------------------
        */

        Route::get('/{leaveApplication}/edit', 'edit')
            ->middleware('permission:leave.view')
            ->name('edit');

        /*
        |--------------------------------------------------------------------------
        | Update Leave Application
        |--------------------------------------------------------------------------
        |
        | Retains the existing permission for compatibility.
        | Consider introducing leave.update for stricter authorization.
        |
        */

        Route::put('/{leaveApplication}', 'update')
            ->middleware('permission:leave.view')
            ->name('update');

        /*
        |--------------------------------------------------------------------------
        | Show Leave Application
        |--------------------------------------------------------------------------
        */

        Route::get('/{leaveApplication}', 'show')
            ->middleware('permission:leave.view')
            ->name('show');
    });

/*
|--------------------------------------------------------------------------
| Leave Approvals
|--------------------------------------------------------------------------
|
| These routes are separate from employee-facing leave applications.
|
| The controller additionally checks:
|
|   - The authenticated user has an active account.
|   - The user has the leave.approve permission.
|   - The application has a pending approval assignment for that user.
|
*/

Route::prefix('approvals')
    ->name('approvals.')
    ->controller(LeaveApprovalController::class)
    ->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Approval Inbox
        |--------------------------------------------------------------------------
        |
        | GET /leave/approvals
        | Route: leave.approvals.index
        |
        */

        Route::get('/', 'index')
            ->middleware('permission:leave.approve')
            ->name('index');

        /*
        |--------------------------------------------------------------------------
        | Review Leave Application
        |--------------------------------------------------------------------------
        |
        | GET /leave/approvals/{leaveApplication}
        | Route: leave.approvals.show
        |
        */

        Route::get('/{leaveApplication}', 'show')
            ->middleware('permission:leave.approve')
            ->name('show');

        /*
        |--------------------------------------------------------------------------
        | Approve Leave Application
        |--------------------------------------------------------------------------
        |
        | POST /leave/approvals/{leaveApplication}/approve
        | Route: leave.approvals.approve
        |
        */

        Route::post('/{leaveApplication}/approve', 'approve')
            ->middleware('permission:leave.approve')
            ->name('approve');

        /*
        |--------------------------------------------------------------------------
        | Reject Leave Application
        |--------------------------------------------------------------------------
        |
        | POST /leave/approvals/{leaveApplication}/reject
        | Route: leave.approvals.reject
        |
        */

        Route::post('/{leaveApplication}/reject', 'reject')
            ->middleware('permission:leave.approve')
            ->name('reject');
    });
