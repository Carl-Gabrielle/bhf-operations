<?php

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
    | Dashboard
    |--------------------------------------------------------------------------
    |
    | Users whose password must be changed will be redirected to
    | /password/change by the force.password.change middleware.
    |
    */

    Route::middleware('force.password.change')->group(function () {

        Route::get('/dashboard', [
            DashboardController::class,
            'index',
        ])->name('dashboard');


        /*
        |--------------------------------------------------------------------------
        | Admin Routes
        |--------------------------------------------------------------------------
        */

        Route::middleware(['role:admin'])
            ->prefix('admin')
            ->name('admin.')
            ->group(function () {

                /*
                |--------------------------------------------------------------------------
                | User Management
                |--------------------------------------------------------------------------
                */

                /*
                 * Reset another user's password.
                 *
                 * This is intentionally a separate administrative
                 * action from normal user editing.
                 */
                Route::post(
                    '/users/{user}/reset-password',
                    [
                        UserController::class,
                        'resetPassword',
                    ]
                )->name('users.reset-password');


                /*
                |--------------------------------------------------------------------------
                | User Resource Routes
                |--------------------------------------------------------------------------
                */

                Route::resource(
                    'users',
                    UserController::class
                );
            });
    });
});


/*
|--------------------------------------------------------------------------
| Settings Routes
|--------------------------------------------------------------------------
*/

require __DIR__.'/settings.php';