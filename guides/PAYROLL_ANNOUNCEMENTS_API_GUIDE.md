# Payroll Announcements API Guide

Base URL (tenant): `/api/v1/tenant/{tenant}/payroll/announcements`

All endpoints require `auth:sanctum`.

---

## Screens & Data Requirements (from Blade views)

### 1) Announcements List

- Stats cards: Total, Sent, Scheduled, Draft
- Filters: Status, Priority, Search
- Table columns:
    - Title + message preview
    - Recipients count + recipient type
    - Delivery method + delivery stats
    - Status + Priority
    - Date + scheduled date
    - Actions: View, Edit (draft/failed), Send (draft/scheduled/failed), Delete (draft/failed)

### 2) Create Announcement

- Title, Message
- Priority: low/normal/high/urgent
- Delivery method: email/sms/both
- Attachment (PDF/DOC/XLS/Images)
- Recipient type: all/department/selected
- Department selection (with employee counts)
- Employee selection (searchable list)
- Recipient preview (count + targeted employees)
- Requires acknowledgment (boolean)
- Scheduled at, Expires at
- Save as draft or send now

### 3) Announcement Details

- Announcement header (title, creator, timestamps)
- Status + priority badges
- Error message (if failed)
- Attachment link
- Delivery statistics (email/sms sent, failed)
- Acknowledgment/read rate
- Recipients list with per-recipient status

---

## Endpoints

### 1) List Announcements

**GET** `/api/v1/tenant/{tenant}/payroll/announcements`

**Query Params:**

- `status` (draft|scheduled|sending|sent|failed)
- `priority` (low|normal|high|urgent)
- `search` (title/message)
- `per_page` (default 20)

**Sample Response:**

```json
{
    "success": true,
    "message": "Announcements retrieved successfully",
    "data": {
        "stats": {
            "total": 12,
            "sent": 6,
            "scheduled": 2,
            "draft": 4
        },
        "records": {
            "current_page": 1,
            "data": [
                {
                    "id": 10,
                    "title": "Payroll Cutoff",
                    "message": "Submit timesheets by Friday...",
                    "priority": "high",
                    "delivery_method": "email",
                    "recipient_type": "department",
                    "department_ids": [3],
                    "employee_ids": null,
                    "status": "sent",
                    "scheduled_at": null,
                    "sent_at": "2026-01-28 09:00:00",
                    "total_recipients": 12,
                    "email_sent_count": 12,
                    "sms_sent_count": 0,
                    "failed_count": 0,
                    "requires_acknowledgment": false,
                    "expires_at": null,
                    "attachment_url": null,
                    "created_by": "Admin User",
                    "created_at": "2026-01-28 08:30:00"
                }
            ],
            "per_page": 20,
            "total": 12
        }
    }
}
```

---

### 2) Create Announcement

**POST** `/api/v1/tenant/{tenant}/payroll/announcements`

**Multipart/Form-Data** (attachment optional):

```
title=Payroll Cutoff
message=Submit timesheets by Friday.
priority=high
delivery_method=email
recipient_type=department
department_ids[]=3
requires_acknowledgment=0
scheduled_at=
expires_at=
send_now=1
attachment=<file>
```

**Sample Response:**

```json
{
    "success": true,
    "message": "Announcement created successfully",
    "data": {
        "announcement": {
            "id": 11,
            "title": "Payroll Cutoff",
            "priority": "high",
            "delivery_method": "email",
            "recipient_type": "department",
            "status": "sent",
            "total_recipients": 12,
            "created_by": "Admin User"
        }
    }
}
```

---

### 3) Preview Recipients

**POST** `/api/v1/tenant/{tenant}/payroll/announcements/preview-recipients`

**Payload:**

```json
{
    "recipient_type": "department",
    "department_ids": [3]
}
```

**Sample Response:**

```json
{
    "success": true,
    "message": "Recipients preview retrieved successfully",
    "data": {
        "count": 12,
        "employees": [
            {
                "id": 12,
                "name": "John Lawal",
                "email": "john@company.com",
                "phone": "+234801234567",
                "department": "Finance"
            }
        ]
    }
}
```

---

### 4) Show Announcement

**GET** `/api/v1/tenant/{tenant}/payroll/announcements/{announcement}`

**Sample Response:**

```json
{
    "success": true,
    "message": "Announcement retrieved successfully",
    "data": {
        "announcement": {
            "id": 11,
            "title": "Payroll Cutoff",
            "message": "Submit timesheets by Friday.",
            "status": "sent",
            "priority": "high",
            "delivery_method": "email",
            "total_recipients": 12,
            "email_sent_count": 12,
            "sms_sent_count": 0,
            "failed_count": 0,
            "attachment_url": null
        },
        "recipients": [
            {
                "employee_id": 12,
                "employee_name": "John Lawal",
                "employee_email": "john@company.com",
                "department_name": "Finance",
                "email_sent": true,
                "email_sent_at": "2026-01-28 09:00:10",
                "sms_sent": false,
                "acknowledged": false,
                "read": true,
                "read_at": "2026-01-28 10:00:00"
            }
        ]
    }
}
```

---

### 5) Update Announcement (draft/failed only)

**PUT** `/api/v1/tenant/{tenant}/payroll/announcements/{announcement}`

**Payload:**

```json
{
    "title": "Payroll Cutoff Update",
    "message": "Submit timesheets by Thursday.",
    "priority": "urgent",
    "delivery_method": "email",
    "recipient_type": "all",
    "requires_acknowledgment": true,
    "scheduled_at": "2026-01-29 09:00:00",
    "expires_at": "2026-02-01 23:59:59"
}
```

**Sample Response:**

```json
{
    "success": true,
    "message": "Announcement updated successfully",
    "data": {
        "announcement": {
            "id": 11,
            "status": "draft",
            "priority": "urgent"
        }
    }
}
```

---

### 6) Send Announcement Now

**POST** `/api/v1/tenant/{tenant}/payroll/announcements/{announcement}/send`

**Sample Response:**

```json
{
    "success": true,
    "message": "Announcement sending started",
    "data": {
        "announcement": {
            "id": 11,
            "status": "sent",
            "sent_at": "2026-01-28 09:10:00"
        }
    }
}
```

---

### 7) Delete Announcement

**DELETE** `/api/v1/tenant/{tenant}/payroll/announcements/{announcement}`

**Sample Response:**

```json
{
    "success": true,
    "message": "Announcement deleted successfully"
}
```

---

## Notes

- Attachments must be uploaded as multipart/form-data.
- Status transitions follow web rules: only draft/failed can be edited or deleted; draft/scheduled/failed can be sent.
- Recipient preview should be called when the recipient type changes.
- Use Employees/Departments APIs to populate employee and department lists.
