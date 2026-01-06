import { useState, useEffect } from 'react';
import { getCurrentUser, getUserRole } from '../utils/firebase';

export type UserRole = 
  | 'admin' 
  | 'salesman' 
  | 'college_admin' 
  | 'college-admin' 
  | 'leader' 
  | 'leaders'
  | 'educator' 
  | 'educators'
  | 'user';

export interface RoleVisibilityConfig {
  // Show only for these roles
  only?: UserRole[];
  // Hide for these roles
  except?: UserRole[];
  // Show for all roles except these
  not?: UserRole[];
  // Show if user has any of these roles
  any?: UserRole[];
  // Show if user has all of these roles (for multi-role support in future)
  all?: UserRole[];
}

/**
 * Hook to check if UI elements should be visible based on user role
 * @param config - Role visibility configuration
 * @returns Object with visibility state and user role info
 */
export const useRoleVisibility = (config?: RoleVisibilityConfig) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const user = getCurrentUser();
        if (!user) {
          setUserRole(null);
          setIsVisible(false);
          setIsLoading(false);
          return;
        }

        const role = await getUserRole(user.uid);
        const normalizedRole = normalizeRole(role);
        setUserRole(normalizedRole);
        
        // If no config, show to everyone
        if (!config) {
          setIsVisible(true);
          setIsLoading(false);
          return;
        }

        // Check visibility based on config
        const visible = checkVisibility(normalizedRole, config);
        setIsVisible(visible);
      } catch (error) {
        console.error('Error checking role visibility:', error);
        setUserRole(null);
        setIsVisible(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkRole();
  }, [config]);

  return {
    isVisible,
    userRole,
    isLoading,
    // Helper methods
    isAdmin: userRole === 'admin',
    isSalesman: userRole === 'salesman',
    isCollegeAdmin: userRole === 'college_admin' || userRole === 'college-admin',
    isLeader: userRole === 'leader' || userRole === 'leaders',
    isEducator: userRole === 'educator' || userRole === 'educators',
    isCollegeUser: userRole === 'leader' || userRole === 'leaders' || userRole === 'educator' || userRole === 'educators' || userRole === 'college_admin' || userRole === 'college-admin',
  };
};

/**
 * Normalize role name to handle variations
 */
const normalizeRole = (role: string): UserRole => {
  const normalized = role.toLowerCase();
  
  if (normalized === 'college-admin') {
    return 'college_admin';
  }
  if (normalized === 'leaders') {
    return 'leader';
  }
  if (normalized === 'educators') {
    return 'educator';
  }
  
  return normalized as UserRole;
};

/**
 * Check if role matches visibility configuration
 */
const checkVisibility = (role: UserRole | null, config: RoleVisibilityConfig): boolean => {
  if (!role) return false;

  // If 'only' is specified, show only for those roles
  if (config.only && config.only.length > 0) {
    return config.only.some(r => normalizeRole(r) === role);
  }

  // If 'except' is specified, hide for those roles
  if (config.except && config.except.length > 0) {
    return !config.except.some(r => normalizeRole(r) === role);
  }

  // If 'not' is specified, show for all except those roles
  if (config.not && config.not.length > 0) {
    return !config.not.some(r => normalizeRole(r) === role);
  }

  // If 'any' is specified, show if role matches any
  if (config.any && config.any.length > 0) {
    return config.any.some(r => normalizeRole(r) === role);
  }

  // If 'all' is specified (for future multi-role support)
  if (config.all && config.all.length > 0) {
    return config.all.every(r => normalizeRole(r) === role);
  }

  // Default: show to everyone
  return true;
};

/**
 * Quick role check functions for common use cases
 */
export const roleChecks = {
  isAdmin: (role: UserRole | null) => role === 'admin',
  isSalesman: (role: UserRole | null) => role === 'salesman',
  isCollegeAdmin: (role: UserRole | null) => role === 'college_admin' || role === 'college-admin',
  isLeader: (role: UserRole | null) => role === 'leader' || role === 'leaders',
  isEducator: (role: UserRole | null) => role === 'educator' || role === 'educators',
  isCollegeUser: (role: UserRole | null) => 
    role === 'leader' || role === 'leaders' || 
    role === 'educator' || role === 'educators' || 
    role === 'college_admin' || role === 'college-admin',
};

