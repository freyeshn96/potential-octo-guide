# 0001. Foundation composition and persistence

- Date: 2026-10-08
- Status: Accepted for Delivery 1

## Context

Delivery 1 requires independently executable Server and Admin hosts, physical backend layers, composable registration, and real PostgreSQL configuration without premature business models. Existing instructions require service isolation and the Module registration suffix.

## Decision

Each service has Domain, Application, Infrastructure, Presentation, and Host projects. The Host composition root exposes its own AddAuthGatewayServerModule / AddAuthGatewayAdminModule and endpoint mapping method, composing only its layers. Domain remains empty until a real business rule exists.

A single development PostgreSQL instance supplies separate logical databases with separate owning users. Each service owns a dedicated DbContext and migration history. No business tables, initial migrations, or automatic startup migrations are created.

The only shared backend project is AuthGateway.Contracts, containing the technical system information response. HTTP behavior and module composition remain service-owned. Frontends use independent manifests, lockfiles, routes, query caches, and builds.

## Consequences

Server and Admin can be run and tested independently. Separate logical databases permit independent migrations and deployments. Repeated small technical host setup is deliberate; there is no generic module framework or shared business persistence. Keycloak and Redis are not needed to run Foundation. Future functional module names and domain decisions remain open.
