// src/services/auth/roleGuard.ts
import { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'moderator' | 'user';

export interface UserWithRole extends User {
  role?: UserRole;
}

export function getUserRole(user: User): UserRole {
  // Check user metadata first
  const roleFromMetadata = user.user_metadata?.role || user.app_metadata?.role;
  
  if (['admin', 'moderator', 'user'].includes(roleFromMetadata)) {
    return roleFromMetadata as UserRole;
  }
  
  // Default to 'user' if no role found
  return 'user';
}

export function hasRole(user: User | null, requiredRole: UserRole): boolean {
  if (!user) return false;
  
  const userRole = getUserRole(user);
  
  // Define role hierarchy: admin > moderator > user
  const roleHierarchy: Record<UserRole, number> = {
    admin: 3,
    moderator: 2,
    user: 1,
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function isAdmin(user: User | null): boolean {
  return hasRole(user, 'admin');
}

export function isModerator(user: User | null): boolean {
  return hasRole(user, 'moderator');
}

export function canAccessAdminPanel(user: User | null): boolean {
  return hasRole(user, 'moderator'); // Both admin and moderator can access
}

export function canManageUsers(user: User | null): boolean {
  return hasRole(user, 'admin'); // Only admin can manage users
}

export function canModerateContent(user: User | null): boolean {
  return hasRole(user, 'moderator'); // Both admin and moderator can moderate
}