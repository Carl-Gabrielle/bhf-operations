<?php

use App\Http\Controllers\Leave\LeaveApplicationController;
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
|   leave prefix
|
| Resulting URLs:
|
|   /leave/applications
|   /leave/applications/create
|   /leave/applications/{leaveApplication}
|
| Resulting route names:
|
|   leave.applications.index
|   leave.applications.create
|   leave.applications.store
|   leave.applications.show
|   leave.applications.edit
|   leave.applications.update
|   leave.applications.download
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
        |
        | GET /leave/applications
        |
        */

        Route::get('/', 'index')
            ->middleware('permission:leave.view')
            ->name('index');


        /*
        |--------------------------------------------------------------------------
        | Create Leave Application
        |--------------------------------------------------------------------------
        |
        | GET /leave/applications/create
        |
        | IMPORTANT:
        | Static routes must be declared before wildcard routes.
        |
        */

        Route::get('/create', 'create')
            ->middleware('permission:leave.create')
            ->name('create');


        /*
        |--------------------------------------------------------------------------
        | Store Leave Application
        |--------------------------------------------------------------------------
        |
        | POST /leave/applications
        |
        */

        Route::post('/', 'store')
            ->middleware('permission:leave.create')
            ->name('store');


        /*
        |--------------------------------------------------------------------------
        | Download Leave Application
        |--------------------------------------------------------------------------
        |
        | GET /leave/applications/{leaveApplication}/download
        |
        */

        Route::get(
            '/{leaveApplication}/download',
            'download'
        )
            ->middleware('permission:leave.view')
            ->name('download');


        /*
        |--------------------------------------------------------------------------
        | Edit Leave Application
        |--------------------------------------------------------------------------
        |
        | GET /leave/applications/{leaveApplication}/edit
        |
        */

        Route::get(
            '/{leaveApplication}/edit',
            'edit'
        )
            ->middleware('permission:leave.view')
            ->name('edit');


        /*
        |--------------------------------------------------------------------------
        | Update Leave Application
        |--------------------------------------------------------------------------
        |
        | PUT /leave/applications/{leaveApplication}
        |
        | This currently uses leave.view to preserve the permission
        | structure of the existing application.
        |
        | Recommended future permission:
        |
        |     leave.update
        |
        */

        Route::put(
            '/{leaveApplication}',
            'update'
        )
            ->middleware('permission:leave.view')
            ->name('update');


        /*
        |--------------------------------------------------------------------------
        | Show Leave Application
        |--------------------------------------------------------------------------
        |
        | GET /leave/applications/{leaveApplication}
        |
        | Keep this wildcard route LAST.
        |
        */

        Route::get(
            '/{leaveApplication}',
            'show'
        )
            ->middleware('permission:leave.view')
            ->name('show');
    });
