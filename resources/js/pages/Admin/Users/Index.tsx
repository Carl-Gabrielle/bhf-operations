import { Head } from '@inertiajs/react';

import UserManagement from '@/components/users/UserManagement';

import type {
    PaginatedUsers,
    OrganizationalUnit,
} from '@/types/auth';

interface UsersPageProps {
    users: PaginatedUsers;

    organizationalUnits: OrganizationalUnit[];

    filters?: {
        search?: string;
    };
}

export default function Index({
    users,
    organizationalUnits,
    filters,
}: UsersPageProps) {
    return (
        <>
            <Head title="User Management" />

            <UserManagement
                users={users}
                organizationalUnits={
                    organizationalUnits
                }
                filters={filters}
            />
        </>
    );
}