# Municipality Water Bill Payments

A full-stack web application designed to simplify and secure the **management of municipal water bill payments**.  
The system implements strict **role-based access control (RBAC)** to ensure that each user only interacts with data relevant to their municipality.

## System Overview

When the application is first initialized, **Super Admin credentials are hard-seeded** into the database.

The **Super Admin** acts as the top-level authority and performs the following actions:
- Creates **Municipalities**
- Assigns **Admins** to those municipalities

Once a municipality exists:
- The **Admin** (assigned by the Super Admin) can create **Operators** within that municipality.
- The **Operator** can fetch and manage **water bills and transactions** specific to their assigned municipality.

Each role has clearly separated access to ensure proper data isolation and security.


## Default Credentials (Seeded)

| Role | Email | Password |
|------|--------|-----------|
| **Super Admin** | `superadmin@example.com` | `superpassword123` |

---
## Environment Variables

Before running the application, create a `.env` file in the backend root directory and add the following variables:

```env
# Server
PORT=
JWT_SECRET=

# Database
DB_HOST=
DB_USER=
DB_PASS=
DB_NAME=
DB_DIALECT=

# Cashfree Configuration
CASHFREE_CLIENT_ID=
CASHFREE_CLIENT_SECRET=
CASHFREE_API_VERSION=
CASHFREE_BASE_URL=
# DISABLE_WEBHOOK_SIGNATURE=true

# Mock Bank API
MOCK_BANK_BASE_URL=

# Webhook
WEBHOOK_SECRET=

# Application Base URL
APP_BASE_URL=

# Email (MailHog or other SMTP service)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```
