# Gym Plan Trainers Setup Guide

This guide explains how to set up and use the new gym plan trainer functionality that allows gym owners to assign trainers to their subscription plans.

## Database Setup

### 1. Run the Migration

First, run the new migration to create the `gym_plan_trainers` table:

```bash
# In your Supabase project
# Run the migration: 20250819085546_add_gym_plan_trainers_table.sql
```

This creates a table with the following structure:
- `id`: UUID primary key
- `plan_id`: References the gym plan
- `trainer_id`: References the trainer
- `assigned_at`: Timestamp when the assignment was made
- Unique constraint on (plan_id, trainer_id) to prevent duplicate assignments

### 2. Table Relationships

The `gym_plan_trainers` table creates a many-to-many relationship between:
- `gym_plans` table (subscription plans)
- `trainer` table (approved trainers)

## Backend API Endpoints

### New Endpoints Added

1. **POST** `/api/gym/assign-trainers-to-plan`
   - Assigns trainers to a specific plan
   - Body: `{ plan_id, trainer_ids }`

2. **GET** `/api/gym/get-plan-trainers/:planId`
   - Retrieves all trainers assigned to a specific plan

3. **PUT** `/api/gym/update-plan-trainers/:planId`
   - Updates trainer assignments for a plan
   - Body: `{ trainer_ids }`

### Existing Endpoints Enhanced

- **POST** `/api/gym/addgymplan` - Now supports trainer assignments
- **PUT** `/api/gym/updategymplan/:gymPlanId` - Now supports trainer updates
- **DELETE** `/api/gym/deletegymplan/:gymPlanId` - Automatically removes trainer assignments

## Frontend Integration

### API Functions

New functions added to `frontend/api/gym/route.tsx`:

```typescript
export const CreateGymPlan = async(gymId: any, planData: any)
export const UpdateGymPlan = async(planId: any, planData: any)
export const DeleteGymPlan = async(planId: any)
export const AssignTrainersToPlan = async(planId: any, trainerIds: string[])
export const UpdatePlanTrainers = async(planId: any, trainerIds: string[])
export const GetPlanTrainers = async(planId: any)
```

### Component Updates

The `PlansTab` component now:
- Fetches trainer assignments when loading plans
- Allows assigning/updating trainers when creating/editing plans
- Displays assigned trainers in the plans table
- Automatically manages trainer assignments in the database

## Usage Flow

### 1. Creating a New Plan

1. Fill in plan details (title, price, description, duration)
2. Select trainers from the approved trainers list
3. Submit the form
4. The system creates the plan and assigns the selected trainers

### 2. Updating an Existing Plan

1. Edit plan details
2. Modify trainer assignments (add/remove trainers)
3. Submit the form
4. The system updates the plan and reassigns trainers

### 3. Deleting a Plan

1. Click delete on any plan
2. The system removes the plan and all trainer assignments

## Security Features

### Row Level Security (RLS)

- **Gym owners** can manage trainer assignments for their plans
- **Trainers** can view their own assignments
- **Cascade deletion** ensures data integrity

### Data Validation

- Prevents duplicate trainer assignments
- Validates trainer IDs against approved trainers
- Ensures plan exists before assignment

## Error Handling

The system handles various error scenarios:
- Invalid plan IDs
- Invalid trainer IDs
- Database connection issues
- Permission violations

## Testing

To test the functionality:

1. Create a gym plan with trainers
2. Update the plan and modify trainer assignments
3. Verify trainers are properly assigned in the database
4. Test deletion and ensure cascade cleanup works

## Troubleshooting

### Common Issues

1. **Trainers not showing up**: Ensure trainers are approved for the gym
2. **Assignment failures**: Check if the plan exists and is valid
3. **Permission errors**: Verify the user has gym owner permissions

### Debug Steps

1. Check browser console for API errors
2. Verify database table exists and has correct structure
3. Confirm RLS policies are properly configured
4. Test API endpoints directly with Postman/curl

## Future Enhancements

Potential improvements:
- Bulk trainer assignment
- Trainer availability scheduling
- Assignment history tracking
- Performance metrics per trainer
- Automated trainer recommendations 