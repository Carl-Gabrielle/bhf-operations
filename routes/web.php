<?php

use App\Http\Controllers\Admin\RolePermissionController;
use App\Http\Controllers\DashboardController;
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
    | These routes must remain accessible even when the user has
    | must_change_password = true.
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
    | The force.password.change middleware applies to the actual
    | application pages.
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
        | Admin / Management Routes
        |--------------------------------------------------------------------------
        |
        | IMPORTANT:
        |
        | Do NOT put role:admin here.
        |
        | Access is controlled individually using permissions.
        |
        | This allows, for example:
        |
        | Admin -> users.view
        | COO   -> users.view
        | HR    -> users.view
        |
        | while only users with users.manage-roles can access
        | Roles & Permissions.
        |
        |--------------------------------------------------------------------------
        */

        Route::prefix('admin')
            ->name('admin.')
            ->group(function () {


            /*
            |--------------------------------------------------------------------------
            | USER MANAGEMENT
            |--------------------------------------------------------------------------
            */


            /*
             * View users
             *
             * GET /admin/users
             */
            Route::get('/users', [
                UserController::class,
                'index',
            ])
                ->middleware('permission:users.view')
                ->name('users.index');


            /*
             * Create user form
             *
             * GET /admin/users/create
             */
            Route::get('/users/create', [
                UserController::class,
                'create',
            ])
                ->middleware('permission:users.create')
                ->name('users.create');


            /*
             * Store new user
             *
             * POST /admin/users
             */
            Route::post('/users', [
                UserController::class,
                'store',
            ])
                ->middleware('permission:users.create')
                ->name('users.store');


            /*
             * Show user
             *
             * GET /admin/users/{user}
             */
            Route::get('/users/{user}', [
                UserController::class,
                'show',
            ])
                ->middleware('permission:users.view')
                ->name('users.show');


            /*
             * Edit user form
             *
             * GET /admin/users/{user}/edit
             */
            Route::get('/users/{user}/edit', [
                UserController::class,
                'edit',
            ])
                ->middleware('permission:users.edit')
                ->name('users.edit');


            /*
             * Update user
             *
             * PUT/PATCH /admin/users/{user}
             */
            Route::match(['put', 'patch'], '/users/{user}', [
                UserController::class,
                'update',
            ])
                ->middleware('permission:users.edit')
                ->name('users.update');


            /*
             * Delete user
             *
             * DELETE /admin/users/{user}
             */
            Route::delete('/users/{user}', [
                UserController::class,
                'destroy',
            ])
                ->middleware('permission:users.delete')
                ->name('users.destroy');


            /*
            |--------------------------------------------------------------------------
            | RESET USER PASSWORD
            |--------------------------------------------------------------------------
            |
            | This is intentionally separate from normal user editing.
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
            | ROLES & PERMISSIONS
            |--------------------------------------------------------------------------
            |
            | Access is controlled by:
            |
            | users.manage-roles
            |
            | Therefore:
            |
            | Admin -> allowed
            | COO   -> allowed if permission is assigned
            | HR    -> denied unless permission is assigned
            | Employee -> denied
            |
            |--------------------------------------------------------------------------
            */

            Route::middleware('permission:users.manage-roles')
                ->group(function () {

                    /*
                     * Roles & Permissions page
                     *
                     * GET /admin/roles
                     */
                    Route::get('/roles', [
                        RolePermissionController::class,
                        'index',
                    ])->name('roles.index');


                    /*
                     * Create role
                     *
                     * POST /admin/roles
                     */
                    Route::post('/roles', [
                        RolePermissionController::class,
                        'store',
                    ])->name('roles.store');


                    /*
                     * Update role
                     *
                     * PUT /admin/roles/{role}
                     */
                    Route::put('/roles/{role}', [
                        RolePermissionController::class,
                        'update',
                    ])->name('roles.update');


                    /*
                     * Delete role
                     *
                     * DELETE /admin/roles/{role}
                     */
                    Route::delete('/roles/{role}', [
                        RolePermissionController::class,
                        'destroy',
                    ])->name('roles.destroy');


                    /*
                     * Update role permissions
                     *
                     * PUT /admin/roles/{role}/permissions
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