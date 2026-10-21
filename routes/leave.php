
<?php

use App\Http\Controllers\Leave\LeaveApplicationController;
use App\Http\Controllers\Leave\LeaveApprovalController;
use App\Http\Controllers\Leave\LeaveProcessingController;
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
|--------------------------------------------------------------------------
| HR Processing Route Names
|--------------------------------------------------------------------------
|
| leave.processing.index
| leave.processing.show
| leave.processing.start
| leave.processing.complete
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
| The controller checks:
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
        */

        Route::get('/', 'index')
            ->middleware('permission:leave.approve')
            ->name('index');

        /*
        |--------------------------------------------------------------------------
        | Review Leave Application
        |--------------------------------------------------------------------------
        */

        Route::get('/{leaveApplication}', 'show')
            ->middleware('permission:leave.approve')
            ->name('show');

        /*
        |--------------------------------------------------------------------------
        | Approve Leave Application
        |--------------------------------------------------------------------------
        */

        Route::post('/{leaveApplication}/approve', 'approve')
            ->middleware('permission:leave.approve')
            ->name('approve');

        /*
        |--------------------------------------------------------------------------
        | Reject Leave Application
        |--------------------------------------------------------------------------
        */

        Route::post('/{leaveApplication}/reject', 'reject')
            ->middleware('permission:leave.approve')
            ->name('reject');
    });

/*
|--------------------------------------------------------------------------
| HR Leave Processing
|--------------------------------------------------------------------------
|
| Only users with BOTH the hr role and leave.process permission
| can access these routes.
|
|   GET  /leave/processing
|   GET  /leave/processing/{leaveApplication}
|   POST /leave/processing/{leaveApplication}/start
|   POST /leave/processing/{leaveApplication}/complete
|
| The controller must also verify that the user's account is active
| and that the application is at the correct stage of the workflow.
|
*/

Route::prefix('processing')
    ->name('processing.')
    ->middleware([
        'role:hr',
        'permission:leave.process',
    ])
    ->controller(LeaveProcessingController::class)
    ->group(function () {

        /*
        |--------------------------------------------------------------------------
        | HR Processing Queue
        |--------------------------------------------------------------------------
        */

        Route::get('/', 'index')
            ->name('index');

        /*
        |--------------------------------------------------------------------------
        | View Application for HR Processing
        |--------------------------------------------------------------------------
        */

        Route::get('/{leaveApplication}', 'show')
            ->name('show');

        /*
        |--------------------------------------------------------------------------
        | Start Processing
        |--------------------------------------------------------------------------
        */

        Route::post('/{leaveApplication}/start', 'start')
            ->name('start');

        /*
        |--------------------------------------------------------------------------
        | Complete Processing
        |--------------------------------------------------------------------------
        */

        Route::post('/{leaveApplication}/complete', 'complete')
            ->name('complete');
    });
