# Puravigal App OS Architecture

## Goal
Build a reusable Product OS that can power CRM, POS, Finance, HR, Healthcare, ERP and future products without moving domain-specific rules into the generic core.

## Layering
1. Foundation
   - Identity, authentication, tenancy, users, organizations, roles, permissions, security, privacy.
2. Platform Engines
   - Data, metadata, UI, workflow, automation, events, search, files, notifications, calendar, tasks, billing, payments, integrations, APIs, reporting, audit, observability, AI, localization, sync, developer tooling.
3. Domain Engines
   - CRM, Sales, Desk, POS, Inventory, Commerce, Finance, HR, Healthcare, Education, Manufacturing, Logistics, Projects, Procurement, Warehouse.
4. Product Factory
   - Templates, builder, clone, extension, packaging, publishing, rollout.

## Requirement classification
Every capability must be classified as:
- CORE: generic foundation capability.
- PLATFORM: reusable business/platform engine.
- DOMAIN: specialized business logic.
- PRODUCT: product-specific configuration or UX.

## Architecture rule
Generic layers must expose extension points instead of embedding domain assumptions.

Example:
- Approval = Platform.
- Payment = Platform.
- Double-entry accounting = Finance Domain.
- Cash register = POS Domain.
- Patient diagnosis = Healthcare Domain.

## Configuration hierarchy
App OS default -> Product default -> Plan -> Organization -> Branch -> User.

More specific configuration overrides less specific configuration only where the capability explicitly permits it.

## Universal lifecycle
Capabilities should support, where applicable:
Create -> Read -> Update -> Delete/Archive -> Restore -> Clone/Merge -> Assign -> Approve/Reject -> Share -> Import/Export -> Audit -> Automation -> Notification -> API/Webhook -> Recovery.

## Reliability principles
- Tenant isolation is mandatory.
- Authorization is enforced server-side.
- Search, reports, APIs, exports and AI must inherit tenant and permission filters.
- External operations use idempotency keys where duplicates are possible.
- Async work supports retry, timeout, backoff and dead-letter handling.
- Configuration and schema changes are versioned and auditable.
- Destructive operations support recovery or explicit irreversible-delete semantics.

## Product composition
A product is a composition, not a fork of the platform.

Example:
PURAVI POS = App OS + POS + Inventory + Payments + Customer + Reporting + Offline.

ERP = App OS + CRM + Sales + Procurement + Inventory + Warehouse + Finance + HR + Manufacturing + Projects.

## Initial implementation strategy
Start as a modular monolith with strict module boundaries and dependency direction. Extract services only when scale, reliability, deployment independence or team ownership justifies it.
