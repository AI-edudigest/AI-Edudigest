import React from 'react';
import { useRoleVisibility, RoleVisibilityConfig } from '../../hooks/useRoleVisibility';

interface RoleGuardProps {
  /**
   * Role visibility configuration
   */
  config?: RoleVisibilityConfig;
  
  /**
   * Children to render if visible
   */
  children: React.ReactNode;
  
  /**
   * Fallback content to show if not visible (optional)
   */
  fallback?: React.ReactNode;
  
  /**
   * Show loading state while checking role
   */
  showLoading?: boolean;
  
  /**
   * Loading component to show while checking
   */
  loadingComponent?: React.ReactNode;
}

/**
 * RoleGuard Component - Conditionally renders children based on user role
 * 
 * @example
 * // Show only to admins
 * <RoleGuard config={{ only: ['admin'] }}>
 *   <AdminButton />
 * </RoleGuard>
 * 
 * @example
 * // Show to everyone except educators
 * <RoleGuard config={{ except: ['educator'] }}>
 *   <LeaderOnlyFeature />
 * </RoleGuard>
 * 
 * @example
 * // Show to college users (admin, leader, educator)
 * <RoleGuard config={{ any: ['college_admin', 'leader', 'educator'] }}>
 *   <CollegeFeature />
 * </RoleGuard>
 */
const RoleGuard: React.FC<RoleGuardProps> = ({
  config,
  children,
  fallback = null,
  showLoading = false,
  loadingComponent = null,
}) => {
  const { isVisible, isLoading } = useRoleVisibility(config);

  if (isLoading && showLoading) {
    return <>{loadingComponent || <div className="animate-pulse">Loading...</div>}</>;
  }

  if (!isVisible) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleGuard;

/**
 * Higher-order component version for class components
 */
export const withRoleGuard = <P extends object>(
  Component: React.ComponentType<P>,
  config?: RoleVisibilityConfig
) => {
  return (props: P) => (
    <RoleGuard config={config}>
      <Component {...props} />
    </RoleGuard>
  );
};

