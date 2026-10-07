# Puravigal App OS

A reusable Product OS for building CRM, POS, Finance, HR, Healthcare, ERP and future business products.

## Architecture

```
Foundation
    ↓
Platform Engines
    ↓
Domain Engines
    ↓
Product Factory
    ↓
Final Products
```

The platform is intentionally designed as a **modular monolith first**. Domain engines remain separate from generic platform capabilities so the same core can power many products without becoming domain-specific.

## Current foundation

- Architecture and layering contract
- Product validation matrix
- Implementation roadmap
- TypeScript kernel contracts
- Tenant-aware request context
- Permission contract
- Domain event contract
- Idempotency contract
- Standard result/error contract

## Planned product families

CRM · POS · Finance · HR · Healthcare · ERP · Desk · Inventory · Commerce · Education · Manufacturing · Logistics · Projects

## Documents

- `docs/ARCHITECTURE.md`
- `docs/PRODUCT-VALIDATION-MATRIX.md`
- `docs/IMPLEMENTATION-ROADMAP.md`

## Principle

Build reusable capabilities once, keep specialized business rules inside domain engines, and compose complete products from the platform rather than forking the platform.
