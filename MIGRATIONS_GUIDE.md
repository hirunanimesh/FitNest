# Database Migrations Guide for FitNest

## 🎯 Overview

This document explains how we've implemented database migrations in the FitNest project using Supabase CLI, the benefits of this approach, and how to use it effectively for our development workflow.

## 📋 Table of Contents

- [What are Database Migrations?](#what-are-database-migrations)
- [Benefits of Using Migrations](#benefits-of-using-migrations)
- [Our Implementation](#our-implementation)
- [Project Structure](#project-structure)
- [How to Use Migrations](#how-to-use-migrations)
- [Common Workflows](#common-workflows)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🤔 What are Database Migrations?

Database migrations are **version-controlled scripts** that define changes to your database schema. Think of them as "commits" for your database structure - each migration represents a specific change that can be applied (or rolled back) in a predictable, repeatable way.

### Example Migration:
```sql
-- 20250819085414_initial_schema.sql
CREATE TABLE customer (
  customer_id SERIAL PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id),
  first_name VARCHAR(50) NOT NULL,
  -- ... more fields
);
```

## 🚀 Benefits of Using Migrations

### 1. **Version Control for Database Schema**
- Track every database change in Git
- See exactly what changed and when
- Easy to review database changes in pull requests

### 2. **Environment Consistency**
- Development, staging, and production databases stay in sync
- No more "it works on my machine" database issues
- Automated deployment of schema changes

### 3. **Team Collaboration**
- Multiple developers can work on database changes simultaneously
- Merge conflicts are resolved at the code level, not database level
- Clear history of who made what changes

### 4. **Rollback Safety**
- Create reverse migrations to undo changes
- Test rollback procedures before production deployment
- Minimal downtime for schema changes

### 5. **Deployment Automation**
- Integrate with CI/CD pipelines
- Automatic application of migrations during deployment
- Consistent deployment process across environments

### 6. **Documentation**
- Migrations serve as documentation of schema evolution
- Comments in migration files explain business logic
- Easy to understand the history of database changes

## 🏗️ Our Implementation

### Architecture Decision

We chose to implement **migration-only Supabase setup** for FitNest because:

1. **No Local Database Complexity**: Avoid Docker containers and local PostgreSQL setup
2. **Cloud-First Approach**: Work directly with production Supabase instance
3. **Simplified Development**: Focus on application logic, not infrastructure
4. **Team Efficiency**: Faster onboarding for new developers

### Configuration

Our `supabase/config.toml` disables all local services:

```toml
[api]
enabled = false

[realtime]
enabled = false

[studio]
enabled = false

[auth]
enabled = false

[storage]
enabled = false

[db.migrations]
enabled = true  # Only migrations are enabled
```

## 📁 Project Structure

```
FitNest/
├── supabase/
│   ├── config.toml                           # Supabase configuration
│   ├── migrations/                           # Migration files directory
│   │   ├── 20250819085414_initial_schema.sql    # Complete database schema
│   │   └── 20250819085545_add_payment_tables.sql # Payment system tables
│   ├── README.md                            # Migration-specific documentation
│   └── .gitignore                           # Excludes temporary files
├── package.json                             # NPM scripts for migrations
└── MIGRATIONS_GUIDE.md                      # This file
```

## 🛠️ How to Use Migrations

### Prerequisites

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Ensure you have the project dependencies:
   ```bash
   npm install
   ```

### Creating New Migrations

```bash
# Create a new migration file
npx supabase migration new add_user_preferences

# Or use the npm script
npm run migration:new add_user_preferences
```

This creates: `supabase/migrations/YYYYMMDDHHMMSS_add_user_preferences.sql`

### Writing Migration Content

Edit the generated SQL file:

```sql
-- Add user preferences table
CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add index for performance
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can manage own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);
```

### Applying Migrations to Production

#### Method 1: Manual Application
1. Copy the SQL from your migration file
2. Run it in Supabase SQL Editor

#### Method 2: Using Supabase CLI (Recommended)
```bash
# Link to your remote project (one-time setup)
npx supabase link --project-ref YOUR_PROJECT_REF

# Push all pending migrations
npx supabase db push
```

#### Method 3: CI/CD Integration
Add to your deployment pipeline:
```yaml
# Example GitHub Actions step
- name: Apply Database Migrations
  run: |
    npx supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
    npx supabase db push
```

## 🔄 Common Workflows

### 1. Adding New Features

```bash
# 1. Create migration for new feature
npx supabase migration new add_workout_tracking

# 2. Edit the migration file
# Add tables, indexes, RLS policies, etc.

# 3. Commit to Git
git add supabase/migrations/
git commit -m "Add workout tracking schema"

# 4. Deploy to production
npx supabase db push
```

### 2. Modifying Existing Tables

```bash
# 1. Create migration for modifications
npx supabase migration new update_user_table_add_phone

# 2. Write ALTER statements
# ALTER TABLE customer ADD COLUMN phone VARCHAR(20);

# 3. Test on staging first
# 4. Deploy to production
```

### 3. Data Migrations

```sql
-- Example: Migrate existing data
-- 20250820120000_migrate_user_data.sql

-- Add new column
ALTER TABLE customer ADD COLUMN full_name TEXT;

-- Populate with existing data
UPDATE customer 
SET full_name = CONCAT(first_name, ' ', last_name)
WHERE full_name IS NULL;

-- Make it required
ALTER TABLE customer ALTER COLUMN full_name SET NOT NULL;
```

### 4. Rollback Scenario

```bash
# Create reverse migration
npx supabase migration new rollback_workout_tracking

# Write reverse SQL
# DROP TABLE workout_sessions;
# DROP TABLE workout_exercises;
```

## ✅ Best Practices

### 1. **Migration Naming**
- Use descriptive names: `add_user_profiles`, `update_payment_schema`
- Include action type: `create_`, `add_`, `update_`, `remove_`
- Be specific: `add_email_column_to_users` vs `update_users`

### 2. **Migration Content**
- **One logical change per migration**: Don't mix unrelated changes
- **Include comments**: Explain business logic and complex operations
- **Use transactions**: Wrap related changes in BEGIN/COMMIT blocks
- **Add indexes**: Don't forget performance considerations

### 3. **Testing**
- Test on staging environment first
- Verify both migration and rollback procedures
- Check application compatibility after migration

### 4. **Documentation**
```sql
-- Migration: Add user subscription tracking
-- Author: Development Team
-- Date: 2025-08-19
-- Purpose: Track user gym subscriptions and payment history
-- Dependencies: Requires customer and gym_plans tables

CREATE TABLE subscription (
  -- table definition
);
```

### 5. **RLS and Security**
Always consider security when creating tables:
```sql
-- Enable RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- Create appropriate policies
CREATE POLICY "policy_name" ON new_table FOR SELECT USING (auth.uid() = user_id);
```

## 🚨 Troubleshooting

### Common Issues

1. **Migration fails to apply**
   ```bash
   # Check migration syntax
   # Test in Supabase SQL Editor first
   # Ensure dependencies exist
   ```

2. **Missing dependencies**
   ```sql
   -- Always check if referenced tables exist
   -- Use IF EXISTS for conditional operations
   ALTER TABLE IF EXISTS customer ADD COLUMN new_field TEXT;
   ```

3. **Permission errors**
   ```bash
   # Ensure you're linked to correct project
   npx supabase link --project-ref YOUR_PROJECT_REF
   
   # Check authentication
   npx supabase login
   ```

### Debugging Steps

1. **Validate SQL syntax** in Supabase SQL Editor
2. **Check dependencies** - ensure referenced tables/functions exist
3. **Review logs** in Supabase Dashboard
4. **Test incrementally** - apply changes step by step

## 📊 Migration Benefits in Our FitNest Project

### Before Migrations
- ❌ Manual database changes across environments
- ❌ Schema drift between development and production
- ❌ No version control for database structure
- ❌ Difficult team collaboration on database changes
- ❌ Manual rollback procedures

### After Migrations
- ✅ **Automated schema management** across all environments
- ✅ **Version-controlled database structure** in Git
- ✅ **Team collaboration** on database changes through pull requests
- ✅ **Consistent deployments** with automated migration application
- ✅ **Rollback safety** with reverse migration capabilities
- ✅ **Documentation** of all schema changes over time

## 🎯 Conclusion

Database migrations are a **game-changer** for the FitNest project. They provide:

- **Reliability**: Consistent database state across all environments
- **Collaboration**: Team members can work on database changes safely
- **Deployment**: Automated and repeatable database updates
- **Maintenance**: Easy rollback and troubleshooting capabilities

By implementing migration-only Supabase setup, we've simplified our development workflow while maintaining all the benefits of proper database version control.

---

## 📞 Need Help?

- Check the `supabase/README.md` for technical details
- Review existing migrations in `supabase/migrations/` for examples
- Consult [Supabase CLI documentation](https://supabase.com/docs/guides/local-development/cli)
- Ask the development team for guidance on complex migrations

**Happy migrating!** 🚀
