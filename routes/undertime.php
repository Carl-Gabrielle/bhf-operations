<?php

use App\Http\Controllers\Undertime\UndertimeApplicationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Undertime Application Routes
|--------------------------------------------------------------------------
|
| Phase 1:
| - View employee applications
| - Create an application
| - View application details
|
*/

Route::prefix('applications')
    ->name('applications.')
    ->controller(UndertimeApplicationController::class)
    ->group(function () {
        Route::get('/', 'index')
            ->middleware('permission:undertime.view')
            ->name('index');

        Route::get('/create', 'create')
            ->middleware('permission:undertime.create')
            ->name('create');

        Route::post('/', 'store')
            ->middleware('permission:undertime.create')
            ->name('store');

        Route::get('/{undertimeApplication}', 'show')
            ->middleware('permission:undertime.view')
            ->name('show');
    });