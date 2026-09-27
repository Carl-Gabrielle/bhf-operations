import { useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { toast } from 'sonner';

import UserManagement from '@/pages/Admin/Users/UserManagement';

import type {
    PaginatedUsers,
    OrganizationalUnit,
} from '@/types/auth';

interface UsersPageProps {
    [key: string]: unknown;

    users: PaginatedUsers;

    organizationalUnits: OrganizationalUnit[];

    filters?: {
        search?: string;
    };

    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Index({
    users,
    organizationalUnits,
    filters,
}: UsersPageProps) {
    const { flash } = usePage<UsersPageProps>().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success('User created successfully', {
                id: 'user-created-success',
                description: flash.success,
                duration: 4000,
            });
        }

        if (flash?.error) {
            toast.error('Something went wrong', {
                id: 'user-action-error',
                description: flash.error,
                duration: 5000,
            });
        }
    }, [flash?.success, flash?.error]);

    return (
        <>
            <Head title="User Management" />

            <UserManagement
                users={users}
                organizationalUnits={organizationalUnits}
                filters={filters}
            />
        </>
    );
}