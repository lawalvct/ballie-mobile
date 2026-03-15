# Admin Management — Mobile API Reference

> **Base URL:** `/api/v1/tenant/{tenantId}/admin`
> **Auth:** Bearer token (Sanctum) — `Authorization: Bearer {token}`
> **Content-Type:** `application/json`

---

## Table of Contents

1. [Response Format](#response-format)
2. [Dashboard](#1-dashboard-stats)
3. [Users Management](#users-management)
    - [List Users](#2-list-users)
    - [Create User Form Data](#3-create-user-form-data)
    - [Store User](#4-store-user)
    - [Show User](#5-show-user)
    - [Update User](#6-update-user)
    - [Delete User](#7-delete-user)
    - [Toggle User Status](#8-toggle-user-status)
4. [Roles Management](#roles-management)
    - [List Roles](#9-list-roles)
    - [Create Role Form Data](#10-create-role-form-data)
    - [Store Role](#11-store-role)
    - [Show Role](#12-show-role)
    - [Update Role](#13-update-role)
    - [Delete Role](#14-delete-role)
    - [Assign Permissions](#15-assign-permissions-to-role)
5. [Permissions](#permissions)
    - [List Permissions](#16-list-permissions)
    - [Permission Matrix](#17-permission-matrix)
6. [TypeScript Interfaces](#typescript-interfaces)
7. [Error Handling](#error-handling)
8. [Suggested Screens](#suggested-screens)

---

## Response Format

All endpoints return a consistent JSON structure:

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Success with Pagination

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 15,
    "total": 42,
    "from": 1,
    "to": 15
  }
}
```

### Error Response

```json
{
    "success": false,
    "message": "Error description"
}
```

### Validation Error (422)

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "field_name": ["Validation error message"]
    }
}
```

---

## 1. Dashboard Stats

Get admin overview statistics for the dashboard screen.

|            |                                             |
| ---------- | ------------------------------------------- |
| **Method** | `GET`                                       |
| **URL**    | `/api/v1/tenant/{tenantId}/admin/dashboard` |

### Response `200`

```json
{
    "success": true,
    "data": {
        "total_users": 25,
        "active_users": 22,
        "inactive_users": 3,
        "total_roles": 6,
        "recent_logins": 18,
        "failed_logins": 0,
        "role_distribution": [
            {
                "id": 1,
                "name": "Admin",
                "users_count": 3,
                "color": "#4F46E5"
            },
            {
                "id": 2,
                "name": "Manager",
                "users_count": 5,
                "color": "#059669"
            }
        ]
    }
}
```

### UI Notes

- `total_users`, `active_users`, `inactive_users`, `total_roles` → stat cards
- `recent_logins` → logins in last 24 hours
- `failed_logins` → currently always `0` (placeholder)
- `role_distribution` → pie/donut chart. Use `color` for chart segment colors

---

## Users Management

### 2. List Users

Paginated user list with search and filters.

|            |                                         |
| ---------- | --------------------------------------- |
| **Method** | `GET`                                   |
| **URL**    | `/api/v1/tenant/{tenantId}/admin/users` |

### Query Parameters

| Param      | Type    | Default | Description                             |
| ---------- | ------- | ------- | --------------------------------------- |
| `search`   | string  | —       | Search by name or email (partial match) |
| `role`     | integer | —       | Filter by role ID                       |
| `status`   | string  | —       | `"active"` or `"inactive"`              |
| `per_page` | integer | `15`    | Items per page (max: 50)                |
| `page`     | integer | `1`     | Page number                             |

### Response `200`

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "+2348012345678",
            "avatar_url": "https://...",
            "is_active": true,
            "role": "admin",
            "roles": [
                {
                    "id": 1,
                    "name": "Admin",
                    "color": "#4F46E5"
                }
            ],
            "last_login_at": "2026-03-15T10:30:00+00:00",
            "created_at": "2026-01-10T08:00:00+00:00"
        }
    ],
    "pagination": {
        "current_page": 1,
        "last_page": 2,
        "per_page": 15,
        "total": 25,
        "from": 1,
        "to": 15
    }
}
```

### UI Notes

- `role` is the legacy string role constant (e.g., `"admin"`, `"owner"`, `"employee"`)
- `roles` is the array of assigned role objects — use this for display (badge with color)
- `avatar_url` may be `null` — show initials fallback
- `last_login_at` may be `null` — show "Never" placeholder
- Implement pull-to-refresh + infinite scroll pagination

---

### 3. Create User Form Data

Fetch available roles for the "Create User" form dropdown. Call this before rendering the create form.

|            |                                                |
| ---------- | ---------------------------------------------- |
| **Method** | `GET`                                          |
| **URL**    | `/api/v1/tenant/{tenantId}/admin/users/create` |

### Response `200`

```json
{
    "success": true,
    "data": {
        "roles": [
            {
                "id": 1,
                "name": "Admin",
                "description": "Full administrative access"
            },
            {
                "id": 2,
                "name": "Manager",
                "description": "Team management access"
            },
            {
                "id": 3,
                "name": "Employee",
                "description": "Basic employee access"
            }
        ]
    }
}
```

---

### 4. Store User

Create a new user in the tenant.

|            |                                         |
| ---------- | --------------------------------------- |
| **Method** | `POST`                                  |
| **URL**    | `/api/v1/tenant/{tenantId}/admin/users` |

### Request Body

```json
{
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane@example.com",
    "password": "securePass123",
    "password_confirmation": "securePass123",
    "role_id": 2,
    "is_active": true
}
```

### Validation Rules

| Field                   | Rules                                            |
| ----------------------- | ------------------------------------------------ |
| `first_name`            | **required**, string, max 255                    |
| `last_name`             | **required**, string, max 255                    |
| `email`                 | **required**, valid email, unique in users table |
| `password`              | **required**, string, min 8, confirmed           |
| `password_confirmation` | **required** (must match password)               |
| `role_id`               | **required**, must exist in roles table          |
| `is_active`             | optional, boolean (default: `true`)              |

### Response `201`

```json
{
    "success": true,
    "message": "User created successfully.",
    "data": {
        "id": 26,
        "name": "Jane Doe",
        "email": "jane@example.com",
        "is_active": true,
        "roles": [{ "id": 2, "name": "Manager" }],
        "created_at": "2026-03-15T14:20:00+00:00"
    }
}
```

### Error `422` (Validation)

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "email": ["The email has already been taken."],
        "password": ["The password must be at least 8 characters."]
    }
}
```

---

### 5. Show User

View detailed user information including roles and their permissions.

|            |                                                  |
| ---------- | ------------------------------------------------ |
| **Method** | `GET`                                            |
| **URL**    | `/api/v1/tenant/{tenantId}/admin/users/{userId}` |

### Response `200`

```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+2348012345678",
        "avatar_url": "https://...",
        "is_active": true,
        "role": "admin",
        "roles": [
            {
                "id": 1,
                "name": "Admin",
                "color": "#4F46E5",
                "permissions": [
                    {
                        "id": 10,
                        "name": "admin.users.manage",
                        "display_name": "Manage Users",
                        "module": "admin"
                    },
                    {
                        "id": 11,
                        "name": "admin.roles.manage",
                        "display_name": "Manage Roles",
                        "module": "admin"
                    }
                ]
            }
        ],
        "last_login_at": "2026-03-15T10:30:00+00:00",
        "email_verified_at": "2026-01-10T08:00:00+00:00",
        "created_at": "2026-01-10T08:00:00+00:00",
        "updated_at": "2026-03-14T09:00:00+00:00"
    }
}
```

### Response `404`

```json
{
    "success": false,
    "message": "User not found."
}
```

### UI Notes

- Show permissions nested inside each role on the detail screen
- `roles[].permissions` shows what the user can do via their assigned roles

---

### 6. Update User

Update user details. Roles and password are optional.

|            |                                                  |
| ---------- | ------------------------------------------------ |
| **Method** | `PUT`                                            |
| **URL**    | `/api/v1/tenant/{tenantId}/admin/users/{userId}` |

### Request Body

```json
{
    "name": "John Updated",
    "email": "john.updated@example.com",
    "password": "newPassword123",
    "password_confirmation": "newPassword123",
    "roles": [1, 3],
    "is_active": true
}
```

### Validation Rules

| Field                   | Rules                                                    |
| ----------------------- | -------------------------------------------------------- |
| `name`                  | **required**, string, max 255                            |
| `email`                 | **required**, valid email, unique (ignores current user) |
| `password`              | optional, string, min 8, confirmed                       |
| `password_confirmation` | required if `password` is set                            |
| `roles`                 | optional, array of role IDs                              |
| `roles.*`               | must exist in roles table                                |
| `is_active`             | optional, boolean                                        |

### Response `200`

```json
{
    "success": true,
    "message": "User updated successfully.",
    "data": {
        "id": 1,
        "name": "John Updated",
        "email": "john.updated@example.com",
        "is_active": true,
        "roles": [
            { "id": 1, "name": "Admin" },
            { "id": 3, "name": "Employee" }
        ]
    }
}
```

### Notes

- Omit `password` and `password_confirmation` if not changing password
- `roles` replaces all current roles (sync operation)
- Omitting `roles` entirely keeps current roles unchanged

---

### 7. Delete User

Soft-deletes a user. Cannot delete your own account.

|            |                                                  |
| ---------- | ------------------------------------------------ |
| **Method** | `DELETE`                                         |
| **URL**    | `/api/v1/tenant/{tenantId}/admin/users/{userId}` |

### Response `200`

```json
{
    "success": true,
    "message": "User deleted successfully."
}
```

### Response `403`

```json
{
    "success": false,
    "message": "You cannot delete your own account."
}
```

### UI Notes

- Show confirmation dialog before calling this endpoint
- The logged-in user's own delete button should be disabled or hidden

---

### 8. Toggle User Status

Flip a user's `is_active` status. Cannot deactivate yourself.

|            |                                                                |
| ---------- | -------------------------------------------------------------- |
| **Method** | `POST`                                                         |
| **URL**    | `/api/v1/tenant/{tenantId}/admin/users/{userId}/toggle-status` |

### Request Body

_None required_

### Response `200`

```json
{
    "success": true,
    "message": "User status updated successfully.",
    "data": {
        "is_active": false
    }
}
```

### Response `403`

```json
{
    "success": false,
    "message": "You cannot deactivate your own account."
}
```

### UI Notes

- Use a toggle switch in the user list or detail screen
- Optimistically flip the UI toggle, revert on error
- Disable toggle for the currently logged-in user

---

## Roles Management

### 9. List Roles

Paginated role list with user count and permissions.

|            |                                         |
| ---------- | --------------------------------------- |
| **Method** | `GET`                                   |
| **URL**    | `/api/v1/tenant/{tenantId}/admin/roles` |

### Query Parameters

| Param      | Type    | Default | Description                         |
| ---------- | ------- | ------- | ----------------------------------- |
| `search`   | string  | —       | Search by role name (partial match) |
| `per_page` | integer | `15`    | Items per page (max: 50)            |
| `page`     | integer | `1`     | Page number                         |

### Response `200`

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Admin",
            "slug": "admin",
            "description": "Full administrative access",
            "color": "#4F46E5",
            "is_active": true,
            "is_default": false,
            "users_count": 3,
            "permissions_count": 12,
            "permissions": [
                {
                    "id": 10,
                    "name": "admin.users.manage",
                    "display_name": "Manage Users",
                    "module": "admin"
                }
            ],
            "created_at": "2026-01-01T00:00:00+00:00"
        }
    ],
    "pagination": {
        "current_page": 1,
        "last_page": 1,
        "per_page": 15,
        "total": 6,
        "from": 1,
        "to": 6
    }
}
```

### UI Notes

- Show `users_count` badge on each role card
- Use `color` as the role badge/chip background color
- `is_default` roles should be visually marked (e.g., star icon)

---

### 10. Create Role Form Data

Fetch available permissions grouped by module. Call before rendering the create/edit role form.

|            |                                                |
| ---------- | ---------------------------------------------- |
| **Method** | `GET`                                          |
| **URL**    | `/api/v1/tenant/{tenantId}/admin/roles/create` |

### Response `200`

```json
{
    "success": true,
    "data": {
        "permissions_by_module": [
            {
                "module": "admin",
                "permissions": [
                    {
                        "id": 10,
                        "name": "admin.users.manage",
                        "display_name": "Manage Users"
                    },
                    {
                        "id": 11,
                        "name": "admin.roles.manage",
                        "display_name": "Manage Roles"
                    }
                ]
            },
            {
                "module": "accounting",
                "permissions": [
                    {
                        "id": 20,
                        "name": "accounting.vouchers.create",
                        "display_name": "Create Vouchers"
                    },
                    {
                        "id": 21,
                        "name": "accounting.vouchers.view",
                        "display_name": "View Vouchers"
                    }
                ]
            },
            {
                "module": "inventory",
                "permissions": [
                    {
                        "id": 30,
                        "name": "inventory.products.manage",
                        "display_name": "Manage Products"
                    }
                ]
            }
        ]
    }
}
```

### UI Notes

- Render as collapsible sections per module
- Each module section contains checkbox list of permissions
- Add "Select All" toggle per module section
- Reuse this data for both create and edit role forms

---

### 11. Store Role

Create a new role with optional permissions.

|            |                                         |
| ---------- | --------------------------------------- |
| **Method** | `POST`                                  |
| **URL**    | `/api/v1/tenant/{tenantId}/admin/roles` |

### Request Body

```json
{
    "name": "Supervisor",
    "description": "Supervises team operations",
    "permissions": [10, 11, 20, 30],
    "is_active": true,
    "color": "#8B5CF6"
}
```

### Validation Rules

| Field           | Rules                                            |
| --------------- | ------------------------------------------------ |
| `name`          | **required**, string, max 255, unique per tenant |
| `description`   | optional, string, max 1000                       |
| `permissions`   | optional, array of permission IDs                |
| `permissions.*` | must exist in permissions table                  |
| `is_active`     | optional, boolean (default: `true`)              |
| `color`         | optional, hex color string (format: `#RRGGBB`)   |

### Response `201`

```json
{
    "success": true,
    "message": "Role created successfully.",
    "data": {
        "id": 7,
        "name": "Supervisor",
        "slug": "supervisor",
        "description": "Supervises team operations",
        "color": "#8B5CF6",
        "is_active": true,
        "users_count": 0,
        "permissions": [
            {
                "id": 10,
                "name": "admin.users.manage",
                "display_name": "Manage Users",
                "module": "admin"
            }
        ],
        "created_at": "2026-03-15T14:30:00+00:00"
    }
}
```

### UI Notes

- Provide a color picker for the `color` field
- Slug is auto-generated from the name on the backend — no need to send it

---

### 12. Show Role

View role details with assigned users and permissions grouped by module.

|            |                                                  |
| ---------- | ------------------------------------------------ |
| **Method** | `GET`                                            |
| **URL**    | `/api/v1/tenant/{tenantId}/admin/roles/{roleId}` |

### Response `200`

```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Admin",
        "slug": "admin",
        "description": "Full administrative access",
        "color": "#4F46E5",
        "is_active": true,
        "is_default": false,
        "users_count": 3,
        "users": [
            {
                "id": 1,
                "name": "John Doe",
                "email": "john@example.com",
                "is_active": true
            },
            {
                "id": 5,
                "name": "Jane Smith",
                "email": "jane@example.com",
                "is_active": true
            }
        ],
        "permissions": [
            {
                "id": 10,
                "name": "admin.users.manage",
                "display_name": "Manage Users",
                "module": "admin"
            }
        ],
        "permissions_by_module": [
            {
                "module": "admin",
                "permissions": [
                    {
                        "id": 10,
                        "name": "admin.users.manage",
                        "display_name": "Manage Users"
                    },
                    {
                        "id": 11,
                        "name": "admin.roles.manage",
                        "display_name": "Manage Roles"
                    }
                ]
            },
            {
                "module": "accounting",
                "permissions": [
                    {
                        "id": 20,
                        "name": "accounting.vouchers.create",
                        "display_name": "Create Vouchers"
                    }
                ]
            }
        ],
        "created_at": "2026-01-01T00:00:00+00:00",
        "updated_at": "2026-03-10T12:00:00+00:00"
    }
}
```

### Response `404`

```json
{
    "success": false,
    "message": "Role not found."
}
```

### UI Notes

- Show two tabs: **Users** and **Permissions**
- `permissions_by_module` is pre-grouped — render as sections
- `users` list can navigate to user detail screen on tap

---

### 13. Update Role

Update role details and optionally replace permissions.

|            |                                                  |
| ---------- | ------------------------------------------------ |
| **Method** | `PUT`                                            |
| **URL**    | `/api/v1/tenant/{tenantId}/admin/roles/{roleId}` |

### Request Body

```json
{
    "name": "Senior Admin",
    "description": "Updated description",
    "permissions": [10, 11, 20, 21, 30],
    "is_active": true,
    "color": "#DC2626"
}
```

### Validation Rules

| Field           | Rules                                                                   |
| --------------- | ----------------------------------------------------------------------- |
| `name`          | **required**, string, max 255, unique per tenant (ignores current role) |
| `description`   | optional, string, max 1000                                              |
| `permissions`   | optional, array of permission IDs                                       |
| `permissions.*` | must exist in permissions table                                         |
| `is_active`     | optional, boolean                                                       |
| `color`         | optional, hex color string (`#RRGGBB`)                                  |

### Response `200`

```json
{
    "success": true,
    "message": "Role updated successfully.",
    "data": {
        "id": 1,
        "name": "Senior Admin",
        "slug": "senior-admin",
        "description": "Updated description",
        "color": "#DC2626",
        "is_active": true,
        "users_count": 3,
        "permissions": [
            {
                "id": 10,
                "name": "admin.users.manage",
                "display_name": "Manage Users",
                "module": "admin"
            }
        ]
    }
}
```

### Notes

- Sending `permissions: [...]` replaces ALL current permissions (sync)
- Sending `permissions: []` removes ALL permissions
- Omitting `permissions` entirely keeps current permissions unchanged

---

### 14. Delete Role

Soft-delete a role. Blocked if users are still assigned to it.

|            |                                                  |
| ---------- | ------------------------------------------------ |
| **Method** | `DELETE`                                         |
| **URL**    | `/api/v1/tenant/{tenantId}/admin/roles/{roleId}` |

### Response `200`

```json
{
    "success": true,
    "message": "Role deleted successfully."
}
```

### Response `422`

```json
{
    "success": false,
    "message": "Cannot delete role with assigned users. Remove users from this role first."
}
```

### UI Notes

- Show confirmation dialog
- If `422` returned, show the error and optionally link to the role's user list so users can be reassigned

---

### 15. Assign Permissions to Role

Dedicated endpoint to replace all permissions for a role in one call.

|            |                                                              |
| ---------- | ------------------------------------------------------------ |
| **Method** | `POST`                                                       |
| **URL**    | `/api/v1/tenant/{tenantId}/admin/roles/{roleId}/permissions` |

### Request Body

```json
{
    "permissions": [10, 11, 20, 21, 30, 31]
}
```

### Validation Rules

| Field           | Rules                           |
| --------------- | ------------------------------- |
| `permissions`   | **required**, array (non-empty) |
| `permissions.*` | must exist in permissions table |

### Response `200`

```json
{
    "success": true,
    "message": "Permissions assigned successfully.",
    "data": {
        "role_id": 1,
        "role_name": "Admin",
        "permissions_count": 6,
        "permissions": [
            {
                "id": 10,
                "name": "admin.users.manage",
                "display_name": "Manage Users",
                "module": "admin"
            },
            {
                "id": 11,
                "name": "admin.roles.manage",
                "display_name": "Manage Roles",
                "module": "admin"
            }
        ]
    }
}
```

### UI Notes

- Use this endpoint from the **Permission Matrix** screen for bulk permission updates per role
- Replaces all existing permissions — send the complete list of selected permission IDs

---

## Permissions

### 16. List Permissions

Get all active permissions grouped by module.

|            |                                               |
| ---------- | --------------------------------------------- |
| **Method** | `GET`                                         |
| **URL**    | `/api/v1/tenant/{tenantId}/admin/permissions` |

### Response `200`

```json
{
    "success": true,
    "data": [
        {
            "module": "admin",
            "permissions": [
                {
                    "id": 10,
                    "name": "admin.users.manage",
                    "display_name": "Manage Users",
                    "description": "Create, edit, delete users"
                },
                {
                    "id": 11,
                    "name": "admin.roles.manage",
                    "display_name": "Manage Roles",
                    "description": "Create, edit, delete roles"
                }
            ]
        },
        {
            "module": "accounting",
            "permissions": [
                {
                    "id": 20,
                    "name": "accounting.vouchers.create",
                    "display_name": "Create Vouchers",
                    "description": null
                },
                {
                    "id": 21,
                    "name": "accounting.vouchers.view",
                    "display_name": "View Vouchers",
                    "description": null
                }
            ]
        }
    ]
}
```

---

### 17. Permission Matrix

Returns a full matrix of all roles × all permissions for the matrix/grid view.

|            |                                                     |
| ---------- | --------------------------------------------------- |
| **Method** | `GET`                                               |
| **URL**    | `/api/v1/tenant/{tenantId}/admin/permission-matrix` |

### Response `200`

```json
{
    "success": true,
    "data": {
        "roles": [
            { "id": 1, "name": "Admin", "color": "#4F46E5", "users_count": 3 },
            {
                "id": 2,
                "name": "Manager",
                "color": "#059669",
                "users_count": 5
            },
            {
                "id": 3,
                "name": "Employee",
                "color": "#D97706",
                "users_count": 12
            }
        ],
        "matrix": [
            {
                "module": "admin",
                "permissions": [
                    {
                        "id": 10,
                        "name": "admin.users.manage",
                        "display_name": "Manage Users",
                        "roles": {
                            "1": true,
                            "2": true,
                            "3": false
                        }
                    },
                    {
                        "id": 11,
                        "name": "admin.roles.manage",
                        "display_name": "Manage Roles",
                        "roles": {
                            "1": true,
                            "2": false,
                            "3": false
                        }
                    }
                ]
            },
            {
                "module": "accounting",
                "permissions": [
                    {
                        "id": 20,
                        "name": "accounting.vouchers.create",
                        "display_name": "Create Vouchers",
                        "roles": {
                            "1": true,
                            "2": true,
                            "3": false
                        }
                    }
                ]
            }
        ]
    }
}
```

### UI Notes

- `roles` array defines the column headers
- `matrix` defines the rows grouped by module
- `roles` object inside each permission is keyed by **role ID** (string) → boolean
- When a checkbox is toggled, collect all `true` permission IDs for that role and call **Assign Permissions** (`POST .../roles/{roleId}/permissions`)
- Consider horizontal scroll for the roles columns on smaller screens

---

## TypeScript Interfaces

```typescript
// ========================
// Common Types
// ========================

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: Pagination;
}

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

// ========================
// Dashboard
// ========================

interface DashboardStats {
    total_users: number;
    active_users: number;
    inactive_users: number;
    total_roles: number;
    recent_logins: number;
    failed_logins: number;
    role_distribution: RoleDistribution[];
}

interface RoleDistribution {
    id: number;
    name: string;
    users_count: number;
    color: string | null;
}

// ========================
// Users
// ========================

interface UserListItem {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    is_active: boolean;
    role: string; // legacy constant: "owner" | "admin" | "manager" | "accountant" | "sales" | "employee"
    roles: RoleBadge[];
    last_login_at: string | null; // ISO 8601
    created_at: string; // ISO 8601
}

interface RoleBadge {
    id: number;
    name: string;
    color: string | null;
}

interface UserDetail extends Omit<UserListItem, "roles"> {
    roles: UserRoleWithPermissions[];
    email_verified_at: string | null;
    updated_at: string;
}

interface UserRoleWithPermissions {
    id: number;
    name: string;
    color: string | null;
    permissions: PermissionItem[];
}

interface CreateUserPayload {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role_id: number;
    is_active?: boolean;
}

interface UpdateUserPayload {
    name: string;
    email: string;
    password?: string;
    password_confirmation?: string;
    roles?: number[];
    is_active?: boolean;
}

interface CreateUserFormData {
    roles: { id: number; name: string; description: string | null }[];
}

// ========================
// Roles
// ========================

interface RoleListItem {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    color: string | null;
    is_active: boolean;
    is_default: boolean;
    users_count: number;
    permissions_count: number;
    permissions: PermissionItem[];
    created_at: string;
}

interface RoleDetail {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    color: string | null;
    is_active: boolean;
    is_default: boolean;
    users_count: number;
    users: { id: number; name: string; email: string; is_active: boolean }[];
    permissions: PermissionItem[];
    permissions_by_module: ModulePermissions[];
    created_at: string;
    updated_at: string;
}

interface CreateRolePayload {
    name: string;
    description?: string;
    permissions?: number[];
    is_active?: boolean;
    color?: string; // hex "#RRGGBB"
}

interface UpdateRolePayload {
    name: string;
    description?: string;
    permissions?: number[];
    is_active?: boolean;
    color?: string;
}

interface AssignPermissionsPayload {
    permissions: number[];
}

// ========================
// Permissions
// ========================

interface PermissionItem {
    id: number;
    name: string;
    display_name: string;
    module: string;
    description?: string | null;
}

interface ModulePermissions {
    module: string;
    permissions: Omit<PermissionItem, "module">[];
}

// ========================
// Permission Matrix
// ========================

interface PermissionMatrix {
    roles: {
        id: number;
        name: string;
        color: string | null;
        users_count: number;
    }[];
    matrix: MatrixModule[];
}

interface MatrixModule {
    module: string;
    permissions: MatrixPermission[];
}

interface MatrixPermission {
    id: number;
    name: string;
    display_name: string;
    roles: Record<string, boolean>; // key = role ID as string
}
```

---

## Error Handling

| Status Code | Meaning          | Handling                                       |
| ----------- | ---------------- | ---------------------------------------------- |
| `200`       | Success          | Process `data`                                 |
| `201`       | Created          | Show success toast, navigate to list or detail |
| `403`       | Forbidden        | Show `message` (e.g., self-deletion blocked)   |
| `404`       | Not Found        | Show "not found" state or navigate back        |
| `422`       | Validation Error | Map `errors` object to form field errors       |
| `500`       | Server Error     | Show generic error toast with `message`        |

### Validation Error Handling Pattern

```typescript
try {
    const response = await api.post("/admin/users", payload);
    // success
} catch (error) {
    if (error.response?.status === 422) {
        const fieldErrors = error.response.data.errors;
        // fieldErrors = { email: ["The email has already been taken."], ... }
        setFormErrors(fieldErrors);
    } else {
        showToast(error.response?.data?.message || "Something went wrong");
    }
}
```

---

## Suggested Screens

### Screen Architecture

```
AdminModule/
├── screens/
│   ├── AdminDashboardScreen        ← Dashboard stats + role distribution chart
│   ├── UserListScreen              ← Searchable, filterable user list
│   ├── UserDetailScreen            ← User info, roles, permissions
│   ├── CreateUserScreen            ← Form: first/last name, email, password, role picker
│   ├── EditUserScreen              ← Form: name, email, password (optional), role picker
│   ├── RoleListScreen              ← Role cards with user count badges
│   ├── RoleDetailScreen            ← Tabs: Users | Permissions
│   ├── CreateRoleScreen            ← Form: name, description, color, permission checkboxes
│   ├── EditRoleScreen              ← Same as create, pre-filled
│   └── PermissionMatrixScreen      ← Grid: roles as columns, permissions as rows
├── components/
│   ├── StatCard                    ← For dashboard numbers
│   ├── RoleDistributionChart       ← Pie/donut chart
│   ├── UserCard                    ← List item with avatar, name, role badge, status
│   ├── RoleCard                    ← Color-coded card with user count
│   ├── RoleBadge                   ← Colored chip/badge for role display
│   ├── PermissionModuleSection     ← Collapsible section with checkboxes
│   ├── PermissionMatrixGrid        ← Scrollable grid for matrix view
│   └── StatusToggle                ← Switch component for active/inactive
├── hooks/
│   ├── useAdminDashboard           ← GET /admin/dashboard
│   ├── useUsers                    ← GET /admin/users (with search/filter params)
│   ├── useUserDetail               ← GET /admin/users/{id}
│   ├── useCreateUser               ← POST /admin/users
│   ├── useUpdateUser               ← PUT /admin/users/{id}
│   ├── useDeleteUser               ← DELETE /admin/users/{id}
│   ├── useToggleUserStatus         ← POST /admin/users/{id}/toggle-status
│   ├── useRoles                    ← GET /admin/roles
│   ├── useRoleDetail               ← GET /admin/roles/{id}
│   ├── useCreateRole               ← POST /admin/roles
│   ├── useUpdateRole               ← PUT /admin/roles/{id}
│   ├── useDeleteRole               ← DELETE /admin/roles/{id}
│   ├── useAssignPermissions        ← POST /admin/roles/{id}/permissions
│   ├── usePermissions              ← GET /admin/permissions
│   └── usePermissionMatrix         ← GET /admin/permission-matrix
└── services/
    └── adminApi.ts                 ← Axios/fetch wrappers for all 17 endpoints
```

### Navigation Flow

```
Admin Dashboard
  ├── [Users Card] → User List
  │     ├── [+ Button] → Create User → (success) → User List
  │     ├── [User Row] → User Detail
  │     │     ├── [Edit] → Edit User → (success) → User Detail
  │     │     ├── [Toggle Status] → (inline)
  │     │     └── [Delete] → (confirm dialog) → User List
  │     ├── [Search] → (filtered list)
  │     └── [Filter by Role/Status] → (filtered list)
  │
  ├── [Roles Card] → Role List
  │     ├── [+ Button] → Create Role → (success) → Role List
  │     ├── [Role Card] → Role Detail
  │     │     ├── [Edit] → Edit Role → (success) → Role Detail
  │     │     ├── [Delete] → (confirm dialog) → Role List
  │     │     └── [Users Tab] → [User Row] → User Detail
  │     └── [Search] → (filtered list)
  │
  └── [Permission Matrix Card] → Permission Matrix Screen
        └── [Toggle Checkbox] → POST assign-permissions → (inline update)
```
