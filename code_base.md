# Codebase Overview

## Backend (Rails)
- Ruby 3.3.3 with Rails 7.1.5.2; app skeleton only defines the health check route.
- Core gems: `pg 1.6.2` for PostgreSQL, `puma 7.0.3` web server, `bootsnap 1.18.6` for boot caching, `kaminari 1.2.2` ready for pagination.
- Dev/test gems: `debug 1.11.0`, `rubocop 1.80.2`, `rubocop-rails 2.33.3` for debugging and linting.
- Database config targets Postgres databases `hackaton_project_ai_{development,test,production}` with env-based credentials in production.

## Frontend (Angular)
- Angular CLI workspace on Angular 17.3 (TypeScript 5.4) living under `stockApp/`.
- Key dependencies: PrimeNG 17.3.2, PrimeIcons 6.0.1, Bootstrap 5.3.8, Font Awesome 7.0.1, RxJS 7.8.
- `AppModule` wires BrowserModule, FormsModule, DropdownModule, BrowserAnimationsModule; routing array currently empty.
- `AppComponent` renders a PrimeNG dropdown bound to a static `items` list and a Bootstrap card; `HttpClient` import unused.
- Global styles import Bootstrap, Font Awesome, PrimeNG CSS and tweak dropdown styling.

## Tooling & Runtime
- `Procfile.dev` runs Rails on port 3000 and the Angular dev server on port 4200.
- Dockerfile uses multi-stage build on ruby:3.3.3-slim, precompiles bootsnap, installs build deps only in the build stage, and runs as non-root `rails` user.
