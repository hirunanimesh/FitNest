# Supabase Migrations Management

This directory contains Supabase migration files for the FitNest project. The local Supabase services are disabled - this setup is used only for migration file management.

## Structure

```
supabase/
├── config.toml          # Supabase configuration (local services disabled)
├── migrations/          # Database migration files
│   ├── 20250819085414_initial_schema.sql
│   └── 20250819085545_add_payment_tables.sql
└── README.md           # This file
```

## Managing Migrations

### Creating New Migrations

To create a new migration file:

```bash
npx supabase migration new your_migration_name
```

This will create a new timestamped SQL file in the `migrations/` directory.

### Migration File Naming Convention

Migration files follow this pattern:
- `YYYYMMDDHHMMSS_migration_name.sql`
- Example: `20250819085414_initial_schema.sql`

### Applying Migrations to Production

Since we're not using local Supabase, you'll need to apply migrations to your production Supabase instance manually or through your CI/CD pipeline.

#### Option 1: Manual Application
1. Copy the SQL content from your migration file
2. Run it in your Supabase SQL Editor or through the dashboard

#### Option 2: Using Supabase CLI with Remote Database
```bash
# Link to your remote project
npx supabase link --project-ref your-project-ref

# Push migrations to remote database
npx supabase db push
```

#### Option 3: CI/CD Integration
Set up your deployment pipeline to automatically apply migrations using the Supabase CLI.

## Current Migrations

### 20250819085414_initial_schema.sql
- Creates all core tables (customer, trainer, gym, etc.)
- Sets up custom types (duration_type)
- Implements Row Level Security (RLS)
- Creates indexes for performance
- Sets up triggers for timestamp updates

### 20250819085545_add_payment_tables.sql
- Adds payment tracking tables
- Implements payment history logging
- Sets up Stripe integration fields
- Adds RLS policies for payments

## Configuration Notes

The `config.toml` file has all local services disabled:
- API server: disabled
- Studio: disabled
- Auth: disabled
- Storage: disabled
- Realtime: disabled
- Inbucket (email testing): disabled

Only migration management is enabled.

## Best Practices

1. **Always create migrations for schema changes** - Don't modify the database directly
2. **Use descriptive names** for migrations
3. **Test migrations** on a staging environment before production
4. **Keep migrations atomic** - Each migration should be a complete, standalone change
5. **Document breaking changes** in migration comments
6. **Use transactions** where appropriate to ensure atomicity

## Rollback Strategy

For rollback scenarios, create new migration files that reverse the changes rather than modifying existing migrations.

Example:
```bash
npx supabase migration new rollback_payment_tables
```

## Integration with Your Application

Your application should connect directly to your production Supabase instance using environment variables:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Useful Commands

```bash
# Create new migration
npx supabase migration new migration_name

# List all migrations
npx supabase migration list

# Generate types from your schema (if needed)
npx supabase gen types typescript --local

# Reset local migration state (if you need to start fresh)
npx supabase migration repair
```
