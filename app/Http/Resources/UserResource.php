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
            'id' => $this->id,

            /*
            |--------------------------------------------------------------------------
            | Login / Employee
            |--------------------------------------------------------------------------
            */

            'username' => $this->username,

            'employee_number' => $this->employee_number,

            'name' => $this->name,

            'first_name' => $this->first_name,

            'middle_name' => $this->middle_name,

            'last_name' => $this->last_name,

            'contact_number' => $this->contact_number,

            'email' => $this->email,

            /*
            |--------------------------------------------------------------------------
            | Organization
            |--------------------------------------------------------------------------
            */

            'organizational_unit' => $this->whenLoaded(
                'organizationalUnit',
                fn () => [
                    'id' => $this->organizationalUnit->id,
                    'code' => $this->organizationalUnit->code,
                    'name' => $this->organizationalUnit->name,
                ],
            ),

            'position' => $this->whenLoaded(
                'position',
                fn () => $this->position
                    ? [
                        'id' => $this->position->id,
                        'name' => $this->position->name,
                    ]
                    : null
            ),

            /*
            |--------------------------------------------------------------------------
            | Access
            |--------------------------------------------------------------------------
            */

            'roles' => $this->whenLoaded(
                'roles',
                fn () => $this->roles
                    ->map(fn ($role) => [
                        'id' => $role->id,
                        'name' => $role->name,
                    ])
                    ->values()
            ),

            /*
            |--------------------------------------------------------------------------
            | Account
            |--------------------------------------------------------------------------
            */

            'account_status' => $this->account_status,

            'last_login_at' => $this->last_login_at?->toISOString(),

            'password_changed_at' => $this->password_changed_at?->toISOString(),

            /*
            |--------------------------------------------------------------------------
            | Timestamps
            |--------------------------------------------------------------------------
            */

            'created_at' => $this->created_at?->toISOString(),

            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}