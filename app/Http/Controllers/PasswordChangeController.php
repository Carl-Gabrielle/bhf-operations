<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordChangeController extends Controller
{
    /**
     * Show the forced password change page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('auth/ChangePassword');
    }

    /**
     * Update the authenticated user's password.
     */
    public function update(Request $request)
    {
        $request->validate([
            'current_password' => [
                'required',
                'string',
                'current_password',
            ],

            'password' => [
                'required',
                'string',
                'confirmed',
                'different:current_password',
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
        ], [
            'current_password.current_password' =>
                'The temporary/current password is incorrect.',

            'password.confirmed' =>
                'The new password confirmation does not match.',

            'password.different' =>
                'Your new password must be different from your temporary/current password.',
        ]);

        $user = $request->user();

        /*
         * Your User model uses the "hashed" cast, so Laravel
         * will automatically hash this password when saving.
         */
        $user->password = $request->password;

        /*
         * Password is no longer temporary.
         */
        $user->must_change_password = false;

        /*
         * Record when the password was actually changed.
         */
        $user->password_changed_at = now();

        $user->save();

        return redirect()
            ->route('dashboard')
            ->with(
                'success',
                'Your password has been changed successfully.'
            );
    }
}