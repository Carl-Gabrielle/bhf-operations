<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $roles = $user->getRoleNames()
            ->values()
            ->all();

        $permissions = $user->getAllPermissions()
            ->pluck('name')
            ->values()
            ->all();

        return Inertia::render('Dashboard', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,

                'role' => $roles[0] ?? null,
                'roles' => $roles,
                'permissions' => $permissions,

                'can_be_reporting_manager' =>
                    (bool) $user->can_be_reporting_manager,

                'reports_to_user_id' =>
                    $user->reports_to_user_id,
            ],
        ]);
    }
}
