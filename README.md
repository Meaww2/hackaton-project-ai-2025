# Inventory & Low-Stock Alerts

Monorepo for a hackathon-friendly inventory tracker. The Rails API (JSON only) powers login, products, stock movements, dashboard snapshots, and mock reorder suggestions. The Angular SPA consumes the API via a PrimeNG UI with role-aware navigation.

## Stack
- Ruby 3.3.3, Rails 7.1 (API-only, Devise + Rolify + CanCanCan)
- PostgreSQL 15+
- Node 20+, npm 10+, Angular 17.3
- PrimeNG 17, PrimeIcons 6, Bootstrap 5

## Prerequisites
1. Install Ruby 3.3.3 (see `.ruby-version`). Recommended via `asdf` or `rbenv`.
2. Install PostgreSQL and ensure a role with createdb privileges exists (defaults to `$USER`).
3. Install Node.js 20 and npm 10.
4. Install Foreman (optional) for `bin/dev`: `gem install foreman`.

## Local Setup
```bash
bundle install
bin/rails db:setup
cd stockApp
npm install
```

To seed demo data again:
```bash
bin/rails db:seed
```

## Running the App
```bash
bin/dev
```
This starts Rails on `http://localhost:3000` and Angular on `http://localhost:4200` using the provided proxy config.

### Demo Accounts
- `manager@example.com` / `Password123!`
- `officer@example.com` / `Password123!`
- `viewer@example.com` / `Password123!`

Roles govern which actions show up in the UI and what the API allows.

## Tests & Smoke Checks
- Rails unit/service/request specs:
  ```bash
  bundle exec rspec
  ```
  (Requires Ruby 3.3.3 + Bundler ≥ 2.6.)
- Angular unit tests:
  ```bash
  cd stockApp
  npm run test -- --watch=false --browsers=ChromeHeadless
  ```
- API smoke tests (uses `curl`, assumes Rails running on localhost:3000):
  ```bash
  ./scripts/smoke.sh
  ```
  Environment overrides: `BASE_URL`, `LOGIN_EMAIL`, `LOGIN_PASSWORD`.

## Demo Flow (suggested)
1. **Login** as `manager@example.com`.
2. **Products** page: show search, low-stock filter, role-based buttons, reorder suggestion modal.
3. **Stock Movements**: record an OUT movement that hits validation (negative stock), then a valid IN/OUT.
4. Return to **Products** to highlight updated stock + badges.
5. **Dashboard**: show low-stock list, per-row suggest icon, and recent movements widget.

## Handy Scripts
- `scripts/smoke.sh` – login + hits key API endpoints (products, stock movements, dashboard, suggestion) to verify responses.

## Notes
- The API requires authentication; the Angular app sends session cookies via `withCredentials`.
- Reorder suggestions are deterministic mock logic based on recent OUT quantities, reorder level, and stock on hand.
- Role matrix: manager (full access), inventory_officer (manage stock movements + suggestions), viewer (read-only).
