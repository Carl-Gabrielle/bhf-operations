<?php

use App\Http\Controllers\Admin\RolePermissionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Leave\LeaveApplicationController;
use App\Http\Controllers\PasswordChangeController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return redirect('/login');
})->name('home');


/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Forced Password Change
    |--------------------------------------------------------------------------
    |
    | These routes must remain accessible even when the authenticated
    | user has must_change_password = true.
    |
    */

    Route::get('/password/change', [
        PasswordChangeController::class,
        'edit',
    ])->name('password.change');

    Route::put('/password/change', [
        PasswordChangeController::class,
        'update',
    ])->name('password.change.update');


    /*
    |--------------------------------------------------------------------------
    | Protected Application Routes
    |--------------------------------------------------------------------------
    |
    | All normal application functionality is protected by the
    | force.password.change middleware.
    |
    */

    Route::middleware('force.password.change')->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Dashboard
        |--------------------------------------------------------------------------
        */

        Route::get('/dashboard', [
            DashboardController::class,
            'index',
        ])->name('dashboard');


        /*
        |--------------------------------------------------------------------------
        | Leave Management
        |--------------------------------------------------------------------------
        |
        | Employee leave application lifecycle:
        |
        | GET  /leave/applications
        |      View employee's leave applications
        |
        | GET  /leave/applications/create
        |      Display leave application form
        |
        | POST /leave/applications
        |      Submit leave application
        |
        | GET  /leave/applications/{leaveApplication}
        |      View leave application details
        |
        |--------------------------------------------------------------------------
        */

        Route::prefix('leave')
            ->name('leave.')
            ->group(function () {

                /*
                |--------------------------------------------------------------------------
                | Leave Applications
                |--------------------------------------------------------------------------
                */

                Route::prefix('applications')
                    ->name('applications.')
                    ->group(function () {

                        /*
                        |------------------------------------------------------------------
                        | List employee leave applications
                        |------------------------------------------------------------------
                        |
                        | GET /leave/applications
                        | Route name: leave.applications.index
                        |
                        */

                        Route::get('/', [
                            LeaveApplicationController::class,
                            'index',
                        ])
                            ->middleware('permission:leave.view')
                            ->name('index');


                        /*
                        |------------------------------------------------------------------
                        | Create leave application
                        |------------------------------------------------------------------
                        |
                        | GET /leave/applications/create
                        | Route name: leave.applications.create
                        |
                        */

                        Route::get('/create', [
                            LeaveApplicationController::class,
                            'create',
                        ])
                            ->middleware('permission:leave.create')
                            ->name('create');


                        /*
                        |------------------------------------------------------------------
                        | Store leave application
                        |------------------------------------------------------------------
                        |
                        | POST /leave/applications
                        | Route name: leave.applications.store
                        |
                        */

                        Route::post('/', [
                            LeaveApplicationController::class,
                            'store',
                        ])
                            ->middleware('permission:leave.create')
                            ->name('store');


                        /*
                        |------------------------------------------------------------------
                        | Show leave application
                        |------------------------------------------------------------------
                        |
                        | GET /leave/applications/{leaveApplication}
                        | Route name: leave.applications.show
                        |
                        */

                        Route::get('/{leaveApplication}', [
                            LeaveApplicationController::class,
                            'show',
                        ])
                            ->middleware('permission:leave.view')
                            ->name('show');
                    });
            });


        /*
        |--------------------------------------------------------------------------
        | Admin / Management Routes
        |--------------------------------------------------------------------------
        |
        | IMPORTANT:
        |
        | We intentionally DO NOT use:
        |
        |     role:admin
        |
        | Access is controlled through individual permissions.
        |
        | This allows different management roles to have different
        | capabilities.
        |
        |--------------------------------------------------------------------------
        */

        Route::prefix('admin')
            ->name('admin.')
            ->group(function () {

                /*
                |--------------------------------------------------------------------------
                | User Management
                |--------------------------------------------------------------------------
                */

                /*
                | View users
                |
                | GET /admin/users
                */

                Route::get('/users', [
                    UserController::class,
                    'index',
                ])
                    ->middleware('permission:users.view')
                    ->name('users.index');


                /*
                | Create user form
                |
                | GET /admin/users/create
                */

                Route::get('/users/create', [
                    UserController::class,
                    'create',
                ])
                    ->middleware('permission:users.create')
                    ->name('users.create');


                /*
                | Store user
                |
                | POST /admin/users
                */

                Route::post('/users', [
                    UserController::class,
                    'store',
                ])
                    ->middleware('permission:users.create')
                    ->name('users.store');


                /*
                | Show user
                |
                | GET /admin/users/{user}
                */

                Route::get('/users/{user}', [
                    UserController::class,
                    'show',
                ])
                    ->middleware('permission:users.view')
                    ->name('users.show');


                /*
                | Edit user
                |
                | GET /admin/users/{user}/edit
                */

                Route::get('/users/{user}/edit', [
                    UserController::class,
                    'edit',
                ])
                    ->middleware('permission:users.edit')
                    ->name('users.edit');


                /*
                | Update user
                |
                | PUT/PATCH /admin/users/{user}
                */

                Route::match(['put', 'patch'], '/users/{user}', [
                    UserController::class,
                    'update',
                ])
                    ->middleware('permission:users.edit')
                    ->name('users.update');


                /*
                | Delete user
                |
                | DELETE /admin/users/{user}
                */

                Route::delete('/users/{user}', [
                    UserController::class,
                    'destroy',
                ])
                    ->middleware('permission:users.delete')
                    ->name('users.destroy');


                /*
                |--------------------------------------------------------------------------
                | Reset User Password
                |--------------------------------------------------------------------------
                |
                | Resetting a user's password is intentionally separate
                | from normal user editing.
                |
                */

                Route::post('/users/{user}/reset-password', [
                    UserController::class,
                    'resetPassword',
                ])
                    ->middleware('permission:users.reset-password')
                    ->name('users.reset-password');


                /*
                |--------------------------------------------------------------------------
                | Roles & Permissions
                |--------------------------------------------------------------------------
                |
                | Access requires:
                |
                |     users.manage-roles
                |
                */

                Route::middleware('permission:users.manage-roles')
                    ->group(function () {

                        /*
                        |--------------------------------------------------------------
                        | Roles & Permissions page
                        |--------------------------------------------------------------
                        |
                        | GET /admin/roles
                        */

                        Route::get('/roles', [
                            RolePermissionController::class,
                            'index',
                        ])->name('roles.index');


                        /*
                        |--------------------------------------------------------------
                        | Create role
                        |--------------------------------------------------------------
                        |
                        | POST /admin/roles
                        */

                        Route::post('/roles', [
                            RolePermissionController::class,
                            'store',
                        ])->name('roles.store');


                        /*
                        |--------------------------------------------------------------
                        | Update role
                        |--------------------------------------------------------------
                        |
                        | PUT /admin/roles/{role}
                        */

                        Route::put('/roles/{role}', [
                            RolePermissionController::class,
                            'update',
                        ])->name('roles.update');


                        /*
                        |--------------------------------------------------------------
                        | Delete role
                        |--------------------------------------------------------------
                        |
                        | DELETE /admin/roles/{role}
                        */

                        Route::delete('/roles/{role}', [
                            RolePermissionController::class,
                            'destroy',
                        ])->name('roles.destroy');


                        /*
                        |--------------------------------------------------------------
                        | Update role permissions
                        |--------------------------------------------------------------
                        |
                        | PUT /admin/roles/{role}/permissions
                        */

                        Route::put('/roles/{role}/permissions', [
                            RolePermissionController::class,
                            'updatePermissions',
                        ])->name('roles.permissions.update');
                    });
            });
    });
});


/*
|--------------------------------------------------------------------------
| Settings Routes
|--------------------------------------------------------------------------
*/

require __DIR__.'/settings.php';