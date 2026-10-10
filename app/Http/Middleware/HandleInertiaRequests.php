<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        /*
        |--------------------------------------------------------------------------
        | Flash Messages
        |--------------------------------------------------------------------------
        */

        $flash = [
            'success' => fn () => $request->session()->get('success'),
            'error' => fn () => $request->session()->get('error'),
        ];

        /*
        |--------------------------------------------------------------------------
        | Guest
        |--------------------------------------------------------------------------
        */

        if (!$user) {
            return [
                ...parent::share($request),

                'auth' => [
                    'user' => null,
                ],

                'flash' => $flash,
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | RBAC
        |--------------------------------------------------------------------------
        */

        $roles = $user->getRoleNames()
            ->values()
            ->toArray();

        $permissions = $user->getAllPermissions()
            ->pluck('name')
            ->values()
            ->toArray();

        /*
        |--------------------------------------------------------------------------
        | Shared Data
        |--------------------------------------------------------------------------
        |
        | These properties are available globally through:
        |
        | page.props.auth.user
        |
        |--------------------------------------------------------------------------
        */

        return [
            ...parent::share($request),

            'auth' => [
                'user' => [
                    /*
                    |--------------------------------------------------------------------------
                    | Basic User Information
                    |--------------------------------------------------------------------------
                    */

                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,

                    'avatar' => $user->avatar ?? null,

                    'email_verified_at' => $user->email_verified_at,

                    'two_factor_enabled' =>
                        $user->two_factor_enabled ?? false,

                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,

                    /*
                    |--------------------------------------------------------------------------
                    | Reporting Manager Eligibility
                    |--------------------------------------------------------------------------
                    |
                    | Used by the frontend to determine whether the user
                    | is eligible to act as a reporting manager.
                    |
                    */

                    'can_be_reporting_manager' =>
                        (bool) $user->can_be_reporting_manager,

                    /*
                    |--------------------------------------------------------------------------
                    | Reporting Hierarchy
                    |--------------------------------------------------------------------------
                    */

                    'reports_to_user_id' =>
                        $user->reports_to_user_id,

                    /*
                    |--------------------------------------------------------------------------
                    | Role-Based Access Control
                    |--------------------------------------------------------------------------
                    */

                    'role' => $roles[0] ?? null,

                    'roles' => $roles,

                    'permissions' => $permissions,
                ],
            ],

            /*
            |--------------------------------------------------------------------------
            | Flash Messages
            |--------------------------------------------------------------------------
            */

            'flash' => $flash,
        ];
    }
}
