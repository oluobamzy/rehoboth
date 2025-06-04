# Auth Rate Limit Supabase Edge Function

This is a Supabase Edge Function that provides rate limiting functionality for authentication endpoints.

## Development

This function is written for the Deno runtime, which is what Supabase Edge Functions use.

### Prerequisites

- **Docker**: Required for local development and deployment. Make sure Docker daemon is running before deploying.
  ```bash
  # Check Docker status
  systemctl status docker
  
  # If not running, start Docker
  sudo systemctl start docker
  ```

### TypeScript Configuration

This function includes special TypeScript configuration to handle Deno modules:

- `deno-types.d.ts` - Type declarations for Deno-specific modules
- `tsconfig.json` - TypeScript configuration for the function
- `deno.json` - Deno-specific configuration

## Deployment

To deploy this function to your Supabase project:

1. Install the Supabase CLI (as a dev dependency in your project)
   ```bash
   npm install supabase --save-dev
   ```
   
   Or if you prefer to use it directly without installing:
   ```bash
   npx supabase
   ```

2. Login to your Supabase account
   ```bash
   npx supabase login
   ```

3. Link your project
   ```bash
   npx supabase link --project-ref uthibplzzonfiovzpdkj
   ```
   
   > **Note:** You can find your project reference ID in the Supabase dashboard. Go to your project's settings (Project Settings > General) and copy the "Reference ID" or "Project ID" which in this case is `uthibplzzonfiovzpdkj`.

4. Deploy the function

   There are a few ways to deploy the function:

   a. Using Supabase CLI with Docker (recommended):
   ```bash
   npx supabase functions deploy auth-rate-limit
   ```
   
   > **Note:** If you encounter issues with the `.env.local` file format causing errors like `unexpected character '\' in variable name`, you can temporarily move the file during deployment:
   > ```bash
   > mv .env.local .env.local.bak
   > npx supabase functions deploy auth-rate-limit --project-ref uthibplzzonfiovzpdkj
   > mv .env.local.bak .env.local
   > ```

   b. Using direct API deployment (alternative if Docker isn't available):
   ```bash
   cd /home/labber/rehoboth/website/supabase/functions/
   curl -X POST "https://api.supabase.io/v1/projects/uthibplzzonfiovzpdkj/functions" \
     -H "Authorization: Bearer $(npx supabase token)" \
     -H "Content-Type: application/json" \
     --data-binary @<(tar -cz auth-rate-limit)
   ```

   c. Using the Supabase Dashboard UI:
   1. Navigate to your Supabase project dashboard
   2. Go to Edge Functions section
   3. Click "New Function" and upload the function files

## Usage

Once deployed, this function can be called from your application to check if an authentication action (login, signup, reset) should be allowed based on the rate limit settings.

```typescript
// Example usage in client code
const checkRateLimit = async (email: string, action: 'login' | 'signup' | 'reset') => {
  const response = await fetch('https://uthibplzzonfiovzpdkj.supabase.co/functions/v1/auth-rate-limit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${anon_key}`,
    },
    body: JSON.stringify({ email, action }),
  });
  
  return response.json();
};
```

## User Management

This application is configured to only allow user creation through the Supabase dashboard. The application's self-registration functionality has been disabled.

### Creating Users in Supabase Dashboard

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard/project/uthibplzzonfiovzpdkj)
2. Navigate to Authentication > Users
3. Click "Add User"
4. Enter the user's email and password
5. Click "Create User"

### Adding Admin Role to a User

After creating a user, you can assign the admin role using the `addAdminUser.js` script:

```bash
cd /home/labber/rehoboth/website
node scripts/addAdminUser.js user@example.com
```
```
