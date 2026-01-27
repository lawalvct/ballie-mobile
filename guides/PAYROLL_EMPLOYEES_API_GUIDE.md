# Payroll Employees API Guide (CRUD)

This document describes the payroll employees API endpoints, payloads, and sample responses for frontend integration. It also aligns the required fields with the current employee screens.

## Base Path

All endpoints are under:

- `/api/v1/tenant/{tenant}/payroll/employees`

Routes are defined in [routes/api/v1/tenant.php](routes/api/v1/tenant.php).

## Related Endpoints (Used in the Screens)

These endpoints are typically called when creating/editing employees:

- Departments: `/api/v1/tenant/{tenant}/payroll/departments` (see [PAYROLL_DEPARTMENTS_API_GUIDE.md](PAYROLL_DEPARTMENTS_API_GUIDE.md))
- Positions: `/api/v1/tenant/{tenant}/payroll/positions` (see [PAYROLL_POSITIONS_API_GUIDE.md](PAYROLL_POSITIONS_API_GUIDE.md))
- Positions by department: `/api/v1/tenant/{tenant}/payroll/positions/by-department?department_id={id}`
- Salary components: `/api/v1/tenant/{tenant}/payroll/salary-components` (see [PAYROLL_SALARY_COMPONENTS_API_GUIDE.md](PAYROLL_SALARY_COMPONENTS_API_GUIDE.md))

## Screen Notes (from the current views)

### Employee List

- Filters: search, department, status, position (text).
- Columns: employee name/email, employee ID, department, position, hire date, basic salary, status.

### Employee Create vs Edit

**Create screen (resources/views/tenant/payroll/employees/create.blade.php):**

- Section 1 (Personal): first name, last name, email, phone, optional avatar.
- Section 2 (Employment): department (required), position (optional), job title, employment type, pay frequency, status (create), attendance deduction exemption.
- Section 3 (Salary): basic salary (required). Salary components can be assigned during update or in the salary edit screen.
- Section 4 (Address): address, city, state, postal code, country (optional).
- Section 5 (Bank/Pension): bank name/account fields, pension provider/RSA, pension exemption.

**Edit screen (resources/views/tenant/payroll/employees/edit.blade.php):**

- Adds personal fields: `date_of_birth`, `gender`.
- Adds payroll/tax fields: `tin`, `pension_pin`.
- Shows salary components with **amount/percentage inputs** per component.
- Supports avatar replace and remove (send `remove_avatar=true` to clear).
- Status is not shown in the edit UI, but the API allows it as optional.

## Endpoints

### 1) List Employees

**GET** `/api/v1/tenant/{tenant}/payroll/employees`

**Query Params (optional):**

- `search` (string) – matches `first_name`, `last_name`, `email`, `employee_number`
- `department_id` (int)
- `status` (active | inactive | terminated)
- `position_id` (int)
- `position` (string) – matches `job_title` or position name/code
- `per_page` (int) – default 20

**Sample Response:**

```json
{
    "success": true,
    "message": "Employees retrieved successfully",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 12,
                "first_name": "John",
                "last_name": "Lawal",
                "full_name": "John Lawal",
                "email": "john@company.com",
                "phone": "+2348012345678",
                "employee_number": "EMP-2026-0001",
                "avatar": "employees/1706360000_abcd.jpg",
                "avatar_url": "https://your-domain.com/employees/1706360000_abcd.jpg",
                "department_id": 2,
                "department_name": "Finance",
                "position_id": 7,
                "position_name": "Senior Accountant",
                "position_code": "ACC-SR",
                "job_title": "Accountant",
                "status": "active",
                "employment_type": "full_time",
                "pay_frequency": "monthly",
                "hire_date": "2026-01-10",
                "basic_salary": "250000.00",
                "gross_salary": "300000.00",
                "total_allowances": "50000.00",
                "total_deductions": "10000.00",
                "created_at": "2026-01-10 09:00:00",
                "updated_at": "2026-01-10 09:00:00"
            }
        ],
        "per_page": 20,
        "total": 1
    }
}
```

### 2) Create Employee

**POST** `/api/v1/tenant/{tenant}/payroll/employees`

**Content-Type:** `application/json` or `multipart/form-data` (use multipart when sending `avatar`)

**Payload (JSON example):**

```json
{
    "first_name": "John",
    "last_name": "Lawal",
    "email": "john@company.com",
    "phone": "+2348012345678",
    "employee_number": "EMP-2026-0001",
    "department_id": 2,
    "position_id": 7,
    "job_title": "Accountant",
    "hire_date": "2026-01-10",
    "employment_type": "full_time",
    "pay_frequency": "monthly",
    "status": "active",
    "attendance_deduction_exempt": false,
    "attendance_exemption_reason": null,
    "basic_salary": 250000,
    "effective_date": "2026-01-10",
    "bank_name": "First Bank",
    "account_number": "1234567890",
    "account_name": "John Lawal",
    "pfa_provider": "ARM Pensions",
    "rsa_pin": "PEN123456789012",
    "pension_exempt": false,
    "components": [
        { "id": 10, "percentage": 20 },
        { "id": 11, "amount": 15000 }
    ]
}
```

**Sample Response (201):**

```json
{
    "success": true,
    "message": "Employee created successfully",
    "data": {
        "employee": {
            "id": 12,
            "first_name": "John",
            "last_name": "Lawal",
            "full_name": "John Lawal",
            "email": "john@company.com",
            "phone": "+2348012345678",
            "employee_number": "EMP-2026-0001",
            "department_id": 2,
            "department_name": "Finance",
            "position_id": 7,
            "position_name": "Senior Accountant",
            "position_code": "ACC-SR",
            "job_title": "Accountant",
            "status": "active",
            "employment_type": "full_time",
            "pay_frequency": "monthly",
            "hire_date": "2026-01-10",
            "basic_salary": "250000.00",
            "gross_salary": "300000.00",
            "total_allowances": "50000.00",
            "total_deductions": "10000.00",
            "current_salary": {
                "id": 33,
                "basic_salary": "250000.00",
                "effective_date": "2026-01-10",
                "gross_salary": "300000.00",
                "total_allowances": "50000.00",
                "total_deductions": "10000.00",
                "components": [
                    {
                        "id": 90,
                        "salary_component_id": 10,
                        "name": "Housing Allowance",
                        "code": "HOUSE",
                        "type": "earning",
                        "calculation_type": "percentage",
                        "amount": null,
                        "percentage": "20.00",
                        "calculated_amount": "50000.00",
                        "is_active": true
                    }
                ]
            }
        }
    }
}
```

**Validation Error (422):**

```json
{
    "success": false,
    "message": "Validation error",
    "errors": {
        "email": ["The email has already been taken."]
    }
}
```

### 3) Show Employee

**GET** `/api/v1/tenant/{tenant}/payroll/employees/{employee}`

**Sample Response:**

```json
{
    "success": true,
    "message": "Employee retrieved successfully",
    "data": {
        "employee": {
            "id": 12,
            "first_name": "John",
            "last_name": "Lawal",
            "full_name": "John Lawal",
            "email": "john@company.com",
            "phone": "+2348012345678",
            "employee_number": "EMP-2026-0001",
            "department_id": 2,
            "department_name": "Finance",
            "position_id": 7,
            "position_name": "Senior Accountant",
            "position_code": "ACC-SR",
            "job_title": "Accountant",
            "status": "active",
            "employment_type": "full_time",
            "pay_frequency": "monthly",
            "hire_date": "2026-01-10",
            "date_of_birth": "1992-04-12",
            "gender": "male",
            "address": "23 Some Street",
            "city": "Lagos",
            "state": "Lagos",
            "postal_code": "100001",
            "country": "NG",
            "bank_name": "First Bank",
            "account_number": "1234567890",
            "account_name": "John Lawal",
            "pfa_provider": "ARM Pensions",
            "rsa_pin": "PEN123456789012",
            "pension_exempt": false,
            "current_salary": {
                "id": 33,
                "basic_salary": "250000.00",
                "effective_date": "2026-01-10",
                "gross_salary": "300000.00",
                "total_allowances": "50000.00",
                "total_deductions": "10000.00",
                "components": []
            }
        }
    }
}
```

### 4) Update Employee

**PUT** `/api/v1/tenant/{tenant}/payroll/employees/{employee}`

**Payload (JSON example):**

```json
{
    "first_name": "John",
    "last_name": "Lawal",
    "email": "john@company.com",
    "phone": "+2348012345678",
    "department_id": 2,
    "position_id": 7,
    "job_title": "Senior Accountant",
    "hire_date": "2026-01-10",
    "date_of_birth": "1992-04-12",
    "gender": "male",
    "employment_type": "full_time",
    "pay_frequency": "monthly",
    "status": "active",
    "attendance_deduction_exempt": true,
    "attendance_exemption_reason": "Executive agreement",
    "basic_salary": 280000,
    "effective_date": "2026-02-01",
    "tin": "1234567890",
    "pension_pin": "PEN1234567",
    "bank_name": "First Bank",
    "account_number": "1234567890",
    "account_name": "John Lawal",
    "pfa_provider": "ARM Pensions",
    "rsa_pin": "PEN123456789012",
    "pension_exempt": false,
    "components": [
        { "id": 10, "percentage": 20 },
        { "id": 12, "amount": 10000, "is_active": true }
    ]
}
```

**Sample Response:**

```json
{
    "success": true,
    "message": "Employee updated successfully",
    "data": {
        "employee": {
            "id": 12,
            "first_name": "John",
            "last_name": "Lawal",
            "full_name": "John Lawal",
            "email": "john@company.com",
            "position_name": "Senior Accountant",
            "basic_salary": "280000.00",
            "current_salary": {
                "basic_salary": "280000.00",
                "effective_date": "2026-02-01"
            }
        }
    }
}
```

### 5) Delete Employee

**DELETE** `/api/v1/tenant/{tenant}/payroll/employees/{employee}`

**Sample Response:**

```json
{
    "success": true,
    "message": "Employee deleted successfully"
}
```

## Notes

- All endpoints require `auth:sanctum`.
- `employee_number` is optional; if omitted, the backend auto-generates it.
- Use `multipart/form-data` when uploading `avatar`.
- Edit supports `remove_avatar=true` to clear the current avatar.
- Edit supports extra fields: `date_of_birth`, `gender`, `tin`, `pension_pin`, and other optional profile fields.
- Salary component values are sent via `components[]` with `amount` or `percentage` per component.
- For salary components, use the salary component endpoints to build the component list in the UI.
- For department/position selection, fetch departments and positions (or positions by department).
