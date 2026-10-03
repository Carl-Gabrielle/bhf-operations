<?php

namespace App\Enums;

enum LeaveApplicationStatus: string
{
    case Draft = 'draft';
    case Submitted = 'submitted';
    case PendingApproval = 'pending_approval';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Returned = 'returned';
    case Processing = 'processing';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
}