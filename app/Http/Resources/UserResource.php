<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            /*
            |--------------------------------------------------------------------------
            | Identity
            |--------------------------------------------------------------------------
            */

            'id' => $this->id,

            /*
            |--------------------------------------------------------------------------
            | Login / Employee Information
            |--------------------------------------------------------------------------
            */

            'username' => $this->username,

            'employee_number' => $this->employee_number,

            /*
            |--------------------------------------------------------------------------
            | Personal Information
            |--------------------------------------------------------------------------
            */

            'name' => $this->name,

            'first_name' => $this->first_name,

            'middle_name' => $this->middle_name,

            'last_name' => $this->last_name,

            /*
            |--------------------------------------------------------------------------
            | Contact Information
            |--------------------------------------------------------------------------
            */

            'contact_number' => $this->contact_number,

            'email' => $this->email,

            /*
            |--------------------------------------------------------------------------
            | Organization
            |--------------------------------------------------------------------------
            */

            'organizational_unit' => $this->whenLoaded(
                'organizationalUnit',
                function () {
                    if (!$this->organizationalUnit) {
                        return null;
                    }

                    return [
                        'id' => $this->organizationalUnit->id,
                        'code' => $this->organizationalUnit->code,
                        'name' => $this->organizationalUnit->name,
                    ];
                }
            ),

            'position' => $this->whenLoaded(
                'position',
                function () {
                    if (!$this->position) {
                        return null;
                    }

                    return [
                        'id' => $this->position->id,
                        'name' => $this->position->name,
                    ];
                }
            ),

            /*
            |--------------------------------------------------------------------------
            | Reporting Structure
            |--------------------------------------------------------------------------
            |
            | This is used by:
            |
            | Employee
            |      ↓
            | Reporting Manager / Head
            |      ↓
            | Leave Approval
            |
            */

            'reports_to_user_id' =>
                $this->reports_to_user_id,

            'reportsTo' => $this->whenLoaded(
                'reportsTo',
                function () {
                    if (!$this->reportsTo) {
                        return null;
                    }

                    return [
                        'id' => $this->reportsTo->id,

                        'name' => $this->reportsTo->name,

                        'employee_number' =>
                            $this->reportsTo->employee_number,

                        'username' =>
                            $this->reportsTo->username,

                        'first_name' =>
                            $this->reportsTo->first_name,

                        'middle_name' =>
                            $this->reportsTo->middle_name,

                        'last_name' =>
                            $this->reportsTo->last_name,

                        'email' =>
                            $this->reportsTo->email,

                        'contact_number' =>
                            $this->reportsTo->contact_number,

                        'account_status' =>
                            $this->reportsTo->account_status,

                        /*
                        |--------------------------------------------------------------------------
                        | Manager Position
                        |--------------------------------------------------------------------------
                        */

                        'position' =>
                            $this->reportsTo->relationLoaded('position')
                                && $this->reportsTo->position
                                ? [
                                    'id' =>
                                        $this->reportsTo->position->id,

                                    'name' =>
                                        $this->reportsTo->position->name,
                                ]
                                : null,

                        /*
                        |--------------------------------------------------------------------------
                        | Manager Organization
                        |--------------------------------------------------------------------------
                        */

                        'organizational_unit' =>
                            $this->reportsTo->relationLoaded(
                                'organizationalUnit'
                            )
                            && $this->reportsTo->organizationalUnit
                                ? [
                                    'id' =>
                                        $this->reportsTo
                                            ->organizationalUnit
                                            ->id,

                                    'code' =>
                                        $this->reportsTo
                                            ->organizationalUnit
                                            ->code,

                                    'name' =>
                                        $this->reportsTo
                                            ->organizationalUnit
                                            ->name,
                                ]
                                : null,

                        /*
                        |--------------------------------------------------------------------------
                        | Manager Roles
                        |--------------------------------------------------------------------------
                        */

                        'roles' =>
                            $this->reportsTo->relationLoaded('roles')
                                ? $this->reportsTo->roles
                                    ->map(
                                        fn ($role) => [
                                            'id' => $role->id,
                                            'name' => $role->name,
                                        ]
                                    )
                                    ->values()
                                : null,
                    ];
                }
            ),

            /*
            |--------------------------------------------------------------------------
            | Access / Roles
            |--------------------------------------------------------------------------
            */

            'roles' => $this->whenLoaded(
                'roles',
                function () {
                    return $this->roles
                        ->map(
                            fn ($role) => [
                                'id' => $role->id,
                                'name' => $role->name,
                            ]
                        )
                        ->values();
                }
            ),

            /*
            |--------------------------------------------------------------------------
            | Account
            |--------------------------------------------------------------------------
            */

            'account_status' => $this->account_status,

            /*
            |--------------------------------------------------------------------------
            | Activity
            |--------------------------------------------------------------------------
            */

            'last_login_at' =>
                $this->last_login_at?->toISOString(),

            'password_changed_at' =>
                $this->password_changed_at?->toISOString(),

            /*
            |--------------------------------------------------------------------------
            | Timestamps
            |--------------------------------------------------------------------------
            */

            'created_at' =>
                $this->created_at?->toISOString(),

            'updated_at' =>
                $this->updated_at?->toISOString(),
        ];
    }
}