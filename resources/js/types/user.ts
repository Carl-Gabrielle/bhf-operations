/*
|--------------------------------------------------------------------------
| User Management Types
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Organizational Unit
|--------------------------------------------------------------------------
*/

export type OrganizationalUnit = {
    id: number;
    code: string;
    name: string;
};

/*
|--------------------------------------------------------------------------
| Position
|--------------------------------------------------------------------------
*/

export type Position = {
    id: number;
    name: string;
};

/*
|--------------------------------------------------------------------------
| Role
|--------------------------------------------------------------------------
*/

export type Role = {
    id: number;
    name: string;
};

/*
|--------------------------------------------------------------------------
| User Role
|--------------------------------------------------------------------------
*/

export type UserRole = {
    id: number;
    name: string;
};

/*
|--------------------------------------------------------------------------
| Reporting Manager / Head
|--------------------------------------------------------------------------
*/

export type ReportingManager = {
    id: number;

    name?: string | null;

    employee_number?: string | null;

    username?: string | null;

    first_name?: string | null;

    middle_name?: string | null;

    last_name?: string | null;

    email?: string | null;

    contact_number?: string | null;

    account_status?: string | null;

    position?: Position | null;

    organizational_unit?: OrganizationalUnit | null;

    roles?: UserRole[] | null;
};

/*
|--------------------------------------------------------------------------
| User Reporting Structure
|--------------------------------------------------------------------------
*/

export type UserReportingStructure = {
    reports_to_user_id?: number | null;

    reportsTo?: ReportingManager | null;
};

/*
|--------------------------------------------------------------------------
| User Data
|--------------------------------------------------------------------------
*/

export type UserData = {
    id: number;

    /*
    |--------------------------------------------------------------------------
    | Login / Employee
    |--------------------------------------------------------------------------
    */

    username?: string | null;

    employee_number?: string | null;

    /*
    |--------------------------------------------------------------------------
    | Personal Information
    |--------------------------------------------------------------------------
    */

    name?: string | null;

    first_name?: string | null;

    middle_name?: string | null;

    last_name?: string | null;

    /*
    |--------------------------------------------------------------------------
    | Contact
    |--------------------------------------------------------------------------
    */

    contact_number?: string | null;

    email?: string | null;

    /*
    |--------------------------------------------------------------------------
    | Organization
    |--------------------------------------------------------------------------
    */

    organizational_unit?: OrganizationalUnit | null;

    position?: Position | null;

    /*
    |--------------------------------------------------------------------------
    | Reporting Structure
    |--------------------------------------------------------------------------
    */

    reports_to_user_id?: number | null;

    reportsTo?: ReportingManager | null;

    /*
    |--------------------------------------------------------------------------
    | Roles
    |--------------------------------------------------------------------------
    */

    roles?: UserRole[] | null;

    /*
    |--------------------------------------------------------------------------
    | Account
    |--------------------------------------------------------------------------
    */

    account_status?: string | null;

    /*
    |--------------------------------------------------------------------------
    | Activity
    |--------------------------------------------------------------------------
    */

    last_login_at?: string | null;

    password_changed_at?: string | null;

    /*
    |--------------------------------------------------------------------------
    | Timestamps
    |--------------------------------------------------------------------------
    */

    created_at?: string | null;

    updated_at?: string | null;
};

/*
|--------------------------------------------------------------------------
| Audit Change
|--------------------------------------------------------------------------
*/

export type AuditChange = {
    old?: unknown;

    new?: unknown;

    changed?: boolean;
};

/*
|--------------------------------------------------------------------------
| Audit Actor
|--------------------------------------------------------------------------
*/

export type AuditActor = {
    id: number;

    name?: string | null;

    username?: string | null;
};

/*
|--------------------------------------------------------------------------
| Audit Log
|--------------------------------------------------------------------------
*/

export type AuditLog = {
    id: number;

    action: string;

    description: string;

    changes?: Record<
        string,
        AuditChange
    > | null;

    ip_address?: string | null;

    created_at?: string | null;

    actor?: AuditActor | null;
};

/*
|--------------------------------------------------------------------------
| User Form Data
|--------------------------------------------------------------------------
*/

export type UserFormData = {
    /*
    |--------------------------------------------------------------------------
    | Account Credentials
    |--------------------------------------------------------------------------
    */

    username: string;

    employee_number: string;

    /*
    |--------------------------------------------------------------------------
    | Personal Information
    |--------------------------------------------------------------------------
    */

    name: string;

    first_name: string;

    middle_name: string;

    last_name: string;

    /*
    |--------------------------------------------------------------------------
    | Contact Information
    |--------------------------------------------------------------------------
    */

    contact_number: string;

    email: string;

    /*
    |--------------------------------------------------------------------------
    | Organization
    |--------------------------------------------------------------------------
    */

    organizational_unit_id: string;

    position_id: string;

    /*
    |--------------------------------------------------------------------------
    | Reporting Structure
    |--------------------------------------------------------------------------
    |
    | The selected manager/head.
    |
    | Example:
    |
    | reports_to_user_id = "15"
    |
    | means this employee reports to User #15.
    |
    */

    reports_to_user_id: string;

    /*
    |--------------------------------------------------------------------------
    | Account Status / Access
    |--------------------------------------------------------------------------
    */

    account_status: string;

    role: string;

    /*
    |--------------------------------------------------------------------------
    | Password
    |--------------------------------------------------------------------------
    */

    password: string;

    password_confirmation: string;
};

/*
|--------------------------------------------------------------------------
| User Page Props
|--------------------------------------------------------------------------
*/

export type UserPageProps = {
    /*
    |--------------------------------------------------------------------------
    | User
    |--------------------------------------------------------------------------
    */

    user:
        | UserData
        | {
              data: UserData;
          };

    /*
    |--------------------------------------------------------------------------
    | Organization Options
    |--------------------------------------------------------------------------
    */

    organizationalUnits?: OrganizationalUnit[];

    positions?: Position[];

    roles?: Role[];

    /*
    |--------------------------------------------------------------------------
    | Reporting Manager Options
    |--------------------------------------------------------------------------
    */

    managers?: ReportingManager[];

    /*
    |--------------------------------------------------------------------------
    | Audit
    |--------------------------------------------------------------------------
    */

    auditLogs?: AuditLog[];

    /*
    |--------------------------------------------------------------------------
    | Flash Messages
    |--------------------------------------------------------------------------
    */

    flash?: {
        success?: string;

        error?: string;

        warning?: string;

        info?: string;
    };
};

/*
|--------------------------------------------------------------------------
| User List Item
|--------------------------------------------------------------------------
*/

export type UserListItem = {
    id: number;

    username?: string | null;

    employee_number?: string | null;

    name?: string | null;

    first_name?: string | null;

    last_name?: string | null;

    email?: string | null;

    account_status?: string | null;

    position?: Position | null;

    organizational_unit?: OrganizationalUnit | null;

    /*
    |--------------------------------------------------------------------------
    | Reporting Structure
    |--------------------------------------------------------------------------
    */

    reports_to_user_id?: number | null;

    reportsTo?: ReportingManager | null;

    /*
    |--------------------------------------------------------------------------
    | Roles
    |--------------------------------------------------------------------------
    */

    roles?: UserRole[] | null;

    created_at?: string | null;

    updated_at?: string | null;
};

/*
|--------------------------------------------------------------------------
| User Pagination
|--------------------------------------------------------------------------
*/

export type UserPaginationMeta = {
    current_page: number;

    from: number | null;

    last_page: number;

    per_page: number;

    to: number | null;

    total: number;

    path?: string;

    first_page_url?: string;

    last_page_url?: string;

    next_page_url?: string | null;

    prev_page_url?: string | null;
};

export type PaginatedUsers = {
    data: UserListItem[];

    links?: Array<{
        url: string | null;

        label: string;

        active: boolean;
    }>;

    meta?: UserPaginationMeta;
};

/*
|--------------------------------------------------------------------------
| User Filters
|--------------------------------------------------------------------------
*/

export type UserFilters = {
    search?: string;

    status?: string;

    organizational_unit_id?: string;

    position_id?: string;

    role?: string;

    reports_to_user_id?: string;
};