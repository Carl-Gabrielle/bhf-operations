<?php

use App\Http\Controllers\Undertime\UndertimeApplicationController;
use App\Http\Controllers\Undertime\UndertimeApprovalController;
use App\Http\Controllers\Undertime\UndertimeProcessingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Employee Undertime Applications
|--------------------------------------------------------------------------
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
            ->whereNumber('undertimeApplication')
            ->middleware('permission:undertime.view')
            ->name('show');
    });


/*
|--------------------------------------------------------------------------
| Manager / Head / COO Approval
|--------------------------------------------------------------------------
*/

Route::prefix('approvals')
    ->name('approvals.')
    ->controller(UndertimeApprovalController::class)
    ->middleware('permission:undertime.approve')
    ->group(function () {

        Route::get('/', 'index')
            ->name('index');

        Route::get('/{undertimeApplication}', 'show')
            ->whereNumber('undertimeApplication')
            ->name('show');

        Route::post('/{undertimeApplication}/approve', 'approve')
            ->whereNumber('undertimeApplication')
            ->name('approve');

        Route::post('/{undertimeApplication}/reject', 'reject')
            ->whereNumber('undertimeApplication')
            ->name('reject');
    });


/*
|--------------------------------------------------------------------------
| HR Undertime Processing
|--------------------------------------------------------------------------
*/

Route::prefix('processing')
    ->name('processing.')
    ->controller(UndertimeProcessingController::class)
    ->middleware('permission:undertime.process')
    ->group(function () {

        Route::get('/', 'index')
            ->name('index');

        Route::get('/{undertimeApplication}', 'show')
            ->whereNumber('undertimeApplication')
            ->name('show');

        Route::post('/{undertimeApplication}/start', 'start')
            ->whereNumber('undertimeApplication')
            ->name('start');

        Route::post('/{undertimeApplication}/complete', 'complete')
            ->whereNumber('undertimeApplication')
            ->name('complete');
    });
