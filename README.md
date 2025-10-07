# Municipality Water Bill Payments

A full-stack web application designed to simplify and secure the **management of municipal water bill payments**.  
The system implements strict **role-based access control (RBAC)** to ensure that each user only interacts with data relevant to their municipality, integrates Cashfree Payments API for online transactions with webhook-based auto reconciliation, and includes a Mock Bank API for bill verification. Built using Node.js, Express, MySQL, and React, it features real-time status tracking, email payment links, and a clean operator dashboard.

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
| **Super Admin** | ` superadmin@gmail.com` | `Super@123` |

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

## SCREENSHOTS

<img width="1469" height="757" alt="Screenshot 2025-10-07 at 3 22 09 PM" src="https://github.com/user-attachments/assets/7bab88dd-add3-443a-ad6c-448c24ff970a" />
<img width="1470" height="757" alt="Screenshot 2025-10-07 at 4 05 20 AM" src="https://github.com/user-attachments/assets/8330b5c5-aba5-453a-9d1a-01827b305c4b" />
<img width="1467" height="536" alt="Screenshot 2025-10-07 at 4 05 10 AM" src="https://github.com/user-attachments/assets/2659df01-7592-4b9e-a2f9-210f7adb1f7a" />
<img width="1460" height="757" alt="Screenshot 2025-10-07 at 4 53 32 PM" src="https://github.com/user-attachments/assets/ee86d3ad-1e32-4b38-91b1-e03404b011e0" />
<img width="1468" height="757" alt="Screenshot 2025-10-07 at 3 23 04 PM" src="https://github.com/user-attachments/assets/bb0957cd-8943-4171-83ae-126610f7f18d" />
<img width="1470" height="758" alt="Screenshot 2025-10-07 at 4 03 57 AM" src="https://github.com/user-attachments/assets/f10e72c4-951b-464b-b781-14f5ef911a78" />
<img width="1465" height="754" alt="Screenshot 2025-10-07 at 4 03 25 AM" src="https://github.com/user-attachments/assets/7fb135a6-31ef-43a5-bd2e-180a2e6a3334" />
<img width="1467" height="800" alt="Screenshot 2025-10-07 at 10 05 13 AM" src="https://github.com/user-attachments/assets/c1e0bcb5-cf4d-4f29-a1f7-606f56002b37" />
<img width="1463" height="755" alt="Screenshot 2025-10-07 at 4 51 59 PM" src="https://github.com/user-attachments/assets/720bbb30-d318-47fe-9fcf-315d5fcd47d0" />
<img width="1467" height="758" alt="Screenshot 2025-10-07 at 3 22 51 PM" src="https://github.com/user-attachments/assets/e86dabcb-3a15-4388-9d59-32cfe594a621" />
<img width="1000" height="738" alt="Screenshot 2025-10-07 at 6 25 38 AM" src="https://github.com/user-attachments/assets/0805b95c-4390-47d6-9a45-cf790d3c1fee" />
<img width="1470" height="807" alt="Screenshot 2025-10-07 at 3 22 23 PM" src="https://github.com/user-attachments/assets/2cf18b3b-5d64-4d2c-b763-46c643909d47" />
e41a61996e0" />


