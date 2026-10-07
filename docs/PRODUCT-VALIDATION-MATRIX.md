# Product Validation Matrix

This matrix is the acceptance checklist for the App OS. A product is considered supported only when its requirements can be mapped to Core, Platform, Domain or Product without leaking domain rules into generic modules.

## Products
- CRM
- POS
- Finance
- HR
- Healthcare
- ERP

## Required validation dimensions

For every product validate:
1. Personas and role model
2. Customer onboarding
3. Admin setup
4. Manager workflow
5. Employee/user workflow
6. External-party workflow
7. Entities and relationships
8. Screens/pages
9. Create/read/update/delete lifecycle
10. State machines
11. Actions and bulk actions
12. Assignment/delegation
13. Approval
14. Automation
15. SLA/escalation where applicable
16. Notifications and communication
17. Payments/billing where applicable
18. Integrations
19. Import/export/migration
20. Search/filter/reporting
21. Audit/history
22. Security/permissions
23. Mobile/tablet
24. Offline/sync where applicable
25. Localization/tax/currency
26. Compliance/retention
27. Failure/retry/recovery
28. Upgrade/downgrade/cancellation
29. API/webhook/SDK access
30. AI/knowledge access with permission enforcement

## Domain-specific acceptance

### CRM
Leads, qualification, conversion, contacts, accounts, deals, pipeline, activities, forecasting, scoring, communication, duplicate merge.

### POS
Products, pricing, barcode, cart, register, shift, cash drawer, sales, returns, exchanges, receipts, stock movement, offline sales, reconciliation.

### Finance
Chart of accounts, journal entries, debit/credit, ledger, AR/AP, reconciliation, fiscal periods, closing, financial statements, audit.

### HR
Employees, recruitment, onboarding, attendance, shifts, leave, payroll, performance, documents, approvals, exit.

### Healthcare
Patients, providers, appointments, encounters, clinical records, prescriptions, lab, pharmacy, insurance, consent, billing, strict audit and sensitive-data controls.

### ERP
Cross-module transactions spanning CRM, sales, procurement, inventory, warehouse, finance, HR, manufacturing and projects.

## Failure-case validation
Every product must be tested for:
- duplicate requests
- concurrent updates
- stale data
- unauthorized access
- tenant leakage
- expired sessions/tokens
- integration timeout
- provider failure
- webhook duplication/out-of-order delivery
- partial transaction failure
- retry after timeout
- import failure
- sync conflict
- deleted dependency
- schema/configuration change
- rollback/recovery
- cancellation during processing

## Decision
If a requirement fails to map cleanly:
- add/revise a Platform capability when the behavior is reusable;
- create/revise a Domain Engine when business semantics are specialized;
- keep one-off behavior in the Product layer.
