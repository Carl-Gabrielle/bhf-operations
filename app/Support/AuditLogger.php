<?php

namespace App\Support;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class AuditLogger
{
    /**
     * Record an audit event.
     *
     * IMPORTANT:
     * Never pass passwords or password_confirmation
     * into the $changes array.
     */
    public static function log(
        string $action,
        ?User $targetUser,
        string $description,
        ?array $changes = null,
    ): AuditLog {
        return AuditLog::create([
            'actor_id' => Auth::id(),
            'target_user_id' => $targetUser?->id,
            'action' => $action,
            'description' => $description,
            'changes' => $changes,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}