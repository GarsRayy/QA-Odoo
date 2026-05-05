# QA Management System Implementation Plan

## Tech Stack
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
- **UI Components**: Shadcn UI / Radix UI
- **Database/Backend**: Supabase
- **Automation**: Playwright (Logs via API)

## Core Modules
1. **Dashboard**: Summary of testing progress and CI/CD status.
2. **Test Case Management**: Structured list of scenarios:
   - **Happy Path Login (HP-01 s/d HP-08)**: Core authentication and access.
   - **Kerjasama LPPM (HP-09 s/d HP-21)**: ERP-specific business flows.
   - **Sales Order (SO-01 s/d SO-13)**: Quotation, Sales, Delivery, and Invoicing.
3. **Execution Logs**: Real-time updates from Playwright automation.
4. **Bug Reporting**: Screenshot-based bug tracking.
5. **Project/Release Management**: Tracking different versions of the ERP (Odoo).

## Directory Structure
```
/qa-manager
  /src
    /app
      /dashboard
      /test-cases
      /execution-logs
      /bugs
      /projects
    /components
      /ui (Shadcn)
      /sidebar
      /charts
    /lib
      /supabase
    /types
  /supabase
    /migrations
```

## Integration Plan
- Use Supabase Auth for role-based access.
- Use Supabase Storage for screenshots.
- Implement a custom API route `/api/logs` for Playwright to post execution results.
