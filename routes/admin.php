<?php

use App\Http\Controllers\Admin\RolePermissionController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Administration Routes
|--------------------------------------------------------------------------
|
| All routes in this file are already protected by:
|
| - auth
| - force.password.change
|
| Those middleware are applied from web.php.
|
| Authorization is handled through granular permissions rather than
| hard-coded roles.
|
*/


Route::prefix('users')
    ->name('users.')
    ->controller(UserController::class)
    ->group(function () {

        /*
        |--------------------------------------------------------------------------
        | List Users
        |--------------------------------------------------------------------------
        */

        Route::get('/', 'index')
            ->middleware('permission:users.view')
            ->name('index');

        /*
        |--------------------------------------------------------------------------
        | Create User
        |--------------------------------------------------------------------------
        |
        | Keep this before /{user}.
        |
        */

        Route::get('/create', 'create')
            ->middleware('permission:users.create')
            ->name('create');

        /*
        |--------------------------------------------------------------------------
        | Store User
        |--------------------------------------------------------------------------
        */

        Route::post('/', 'store')
            ->middleware('permission:users.create')
            ->name('store');

        /*
        |--------------------------------------------------------------------------
        | Edit User
        |--------------------------------------------------------------------------
        */

        Route::get('/{user}/edit', 'edit')
            ->middleware('permission:users.edit')
            ->name('edit');

        /*
        |--------------------------------------------------------------------------
        | Update User
        |--------------------------------------------------------------------------
        */

        Route::match(['put', 'patch'], '/{user}', 'update')
            ->middleware('permission:users.edit')
            ->name('update');

        /*
        |--------------------------------------------------------------------------
        | Reset User Password
        |--------------------------------------------------------------------------
        */

        Route::post('/{user}/reset-password', 'resetPassword')
            ->middleware('permission:users.reset-password')
            ->name('reset-password');

        /*
        |--------------------------------------------------------------------------
        | Delete User
        |--------------------------------------------------------------------------
        */

        Route::delete('/{user}', 'destroy')
            ->middleware('permission:users.delete')
            ->name('destroy');

        /*
        |--------------------------------------------------------------------------
        | Show User
        |--------------------------------------------------------------------------
        |
        | Wildcard route intentionally stays last.
        |
        */

        Route::get('/{user}', 'show')
            ->middleware('permission:users.view')
            ->name('show');
    });

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

Route::prefix('roles')
    ->name('roles.')
    ->middleware('permission:users.manage-roles')
    ->controller(RolePermissionController::class)
    ->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Roles
        |--------------------------------------------------------------------------
        */

        Route::get('/', 'index')
            ->name('index');

        Route::post('/', 'store')
            ->name('store');

        Route::put('/{role}', 'update')
            ->name('update');

        Route::delete('/{role}', 'destroy')
            ->name('destroy');

        /*
        |--------------------------------------------------------------------------
        | Role Permissions
        |--------------------------------------------------------------------------
        */

        Route::put('/{role}/permissions', 'updatePermissions')
            ->name('permissions.update');
    });
