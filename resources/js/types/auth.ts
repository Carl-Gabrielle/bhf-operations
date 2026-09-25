/*
|--------------------------------------------------------------------------
| Authentication user
|--------------------------------------------------------------------------
*/

export interface User {
    id: number;
    name: string;
    email: string | null;
    avatar?: string | null;
    email_verified_at?: string | null;
    two_factor_enabled?: boolean;
    created_at?: string;
    updated_at?: string;

    roles?: UserRole[];
}

/*
|--------------------------------------------------------------------------
| Roles
|--------------------------------------------------------------------------
*/

export interface UserRole {
    id: number;
    name: string;
}

/*
|--------------------------------------------------------------------------
| Organizational unit
|--------------------------------------------------------------------------
*/

export interface OrganizationalUnit {
    id: number;
    code: string;
    name: string;
}

/*
|--------------------------------------------------------------------------
| Position
|--------------------------------------------------------------------------
*/

export interface Position {
    id: number;
    name: string;
}

/*
|--------------------------------------------------------------------------
| Managed user
|--------------------------------------------------------------------------
*/

export interface ManagedUser {
    id: number;

    username: string;

    employee_number: string | null;

    name: string;

    first_name: string | null;

    middle_name: string | null;

    last_name: string | null;

    contact_number: string | null;

    email: string | null;

    organizational_unit:
        | OrganizationalUnit
        | null;

    position: Position | null;

    roles: UserRole[];

    account_status: string;

    last_login_at: string | null;

    password_changed_at: string | null;

    created_at: string;

    updated_at: string;
}

/*
|--------------------------------------------------------------------------
| Paginated / resource collection
|--------------------------------------------------------------------------
|
| Even though the backend now loads all users, keeping this structure
| allows us to continue using Laravel's Resource::collection().
|--------------------------------------------------------------------------
*/

export interface PaginatedUsers {
    data: ManagedUser[];
}

/*
|--------------------------------------------------------------------------
| Auth page props
|--------------------------------------------------------------------------
*/

export interface AuthPageProps {
    auth: {
        user: User | null;
    };
}