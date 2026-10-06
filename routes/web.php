<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PasswordChangeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::redirect('/', '/login')->name('home');


/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Password Change
    |--------------------------------------------------------------------------
    |
    | These routes intentionally remain outside the
    | force.password.change middleware.
    |
    | This allows users who are required to change their password
    | to access the password change page.
    |
    */

    Route::controller(PasswordChangeController::class)->group(function () {

        Route::get('/password/change', 'edit')
            ->name('password.change');

        Route::put('/password/change', 'update')
            ->name('password.change.update');
    });


    /*
    |--------------------------------------------------------------------------
    | Protected Application Routes
    |--------------------------------------------------------------------------
    */

    Route::middleware('force.password.change')->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Dashboard
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/dashboard',
            [DashboardController::class, 'index']
        )->name('dashboard');


        /*
        |--------------------------------------------------------------------------
        | Administration
        |--------------------------------------------------------------------------
        |
        | routes/admin.php
        |
        | Handles:
        |
        | - Users
        | - Roles
        | - Permissions
        |
        */

        Route::prefix('admin')
            ->name('admin.')
            ->group(function () {

                require __DIR__ . '/admin.php';
            });


        /*
        |--------------------------------------------------------------------------
        | Leave Management
        |--------------------------------------------------------------------------
        |
        | routes/leave.php
        |
        | Handles:
        |
        | - Leave applications
        | - Leave application creation
        | - Leave application editing
        | - Leave application viewing
        | - Leave application downloads
        |
        */

        Route::prefix('leave')
            ->name('leave.')
            ->group(function () {

                require __DIR__ . '/leave.php';
            });


        /*
        |--------------------------------------------------------------------------
        | Future Application Modules
        |--------------------------------------------------------------------------
        |
        | These modules will be extracted one at a time as the application
        | grows.
        |
        */

        // Route::prefix('approvals')
        //     ->name('approvals.')
        //     ->group(function () {
        //         require __DIR__ . '/approvals.php';
        //     });

        // Route::prefix('employees')
        //     ->name('employees.')
        //     ->group(function () {
        //         require __DIR__ . '/employees.php';
        //     });

        // Route::prefix('overtime')
        //     ->name('overtime.')
        //     ->group(function () {
        //         require __DIR__ . '/overtime.php';
        //     });

        // Route::prefix('travel')
        //     ->name('travel.')
        //     ->group(function () {
        //         require __DIR__ . '/travel.php';
        //     });

        // Route::prefix('reports')
        //     ->name('reports.')
        //     ->group(function () {
        //         require __DIR__ . '/reports.php';
        //     });
    });
});


/*
|--------------------------------------------------------------------------
| Settings
|--------------------------------------------------------------------------
|
| Settings routes remain separated from the application modules.
|
*/

require __DIR__ . '/settings.php';
