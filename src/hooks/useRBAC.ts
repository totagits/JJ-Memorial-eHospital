import { useState, useEffect, useCallback, useMemo } from 'react';
import { UserAccount } from '../types/auth';
import { getDatabaseState } from '../services/storageService';
import { oidcAuthService, OidcIdTokenPayload, OidcUserSession } from '../services/oidcAuthService';
import {
  RBACService,
  PrimaryRole,
  AccessLevel,
  RoleThemeConfig
} from '../services/rbacService';
import { auditTrailService } from '../services/auditTrailService';

export const STORAGE_KEY_ACTIVE_USER = 'jjm_active_staff_user_id';
const SESSION_CHANGE_EVENT = 'jjm_staff_session_changed';

/**
 * Dispatches a custom event to notify all useRBAC / useAuth hooks across the app
 */
function notifySessionChange(user: UserAccount | null) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SESSION_CHANGE_EVENT, { detail: { user } }));
  }
}

/**
 * Resolves the initial active staff user from persistent storage or active OIDC session
 */
function getInitialActiveUser(overrideUser?: UserAccount): UserAccount {
  if (overrideUser) return overrideUser;

  // 1. Check active OIDC session
  const oidcUser = oidcAuthService.getCurrentUser();
  if (oidcUser) return oidcUser;

  const db = getDatabaseState();
  const users = db.users || [];

  // 2. Check localStorage for persistent active staff selection
  if (typeof window !== 'undefined') {
    try {
      const storedId = localStorage.getItem(STORAGE_KEY_ACTIVE_USER);
      if (storedId) {
        const found = users.find(u => u.id === storedId);
        if (found) return found;
      }
    } catch {
      // LocalStorage access fallback
    }
  }

  // 3. Fallback to default clinical physician (Dr. Evelyn Sirleaf-Gbotoe) or first user
  return users[1] || users[0];
}

export interface UseRBACOptions {
  currentUser?: UserAccount;
}

export interface UseRBACReturn {
  // Current user & authentication state
  currentUser: UserAccount;
  isAuthenticated: boolean;
  claims: OidcIdTokenPayload | null;
  session: OidcUserSession | null;

  // Role & Theme configuration
  primaryRole: PrimaryRole;
  roleTheme: RoleThemeConfig;

  // Scoped permissions & authorized modules
  authorizedModules: string[];
  primaryWorkstation: string;
  hasAccess: (moduleId: string, requiredLevel?: AccessLevel) => boolean;
  getAccessLevel: (moduleId: string) => AccessLevel;
  canAccess: (moduleId: string) => boolean;
  canWrite: (moduleId: string) => boolean;
  canAdminister: (moduleId: string) => boolean;

  // Convenient role-checking boolean flags
  isLIS: boolean;
  isBilling: boolean;
  isClinician: boolean;
  isNurse: boolean;
  isPharmacy: boolean;
  isAdmin: boolean;
  isManagement: boolean;
  isRadiology: boolean;

  // Session switching & lifecycle actions
  switchUser: (userOrId: UserAccount | string) => void;
  logout: () => void;
  refreshSession: () => void;
}

/**
 * Custom hook that subscribes to the persistent user session state and RBAC permissions.
 * Reactively updates whenever the user switches roles, logs in via OIDC, or updates credentials.
 */
export function useRBAC(options?: UseRBACOptions): UseRBACReturn {
  const [currentUser, setCurrentUserState] = useState<UserAccount>(() =>
    getInitialActiveUser(options?.currentUser)
  );

  // If a parent component provides or changes the currentUser prop, synchronize state
  useEffect(() => {
    if (options?.currentUser && options.currentUser.id !== currentUser.id) {
      setCurrentUserState(options.currentUser);
    }
  }, [options?.currentUser, currentUser.id]);

  // Subscribe to OIDC auth session events and window storage/custom events
  useEffect(() => {
    // 1. Subscribe to OIDC Auth Service
    const unsubscribeOidc = oidcAuthService.subscribe(session => {
      if (session?.user) {
        setCurrentUserState(session.user);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(STORAGE_KEY_ACTIVE_USER, session.user.id);
          } catch {}
        }
      }
    });

    // 2. Subscribe to in-app custom session change events
    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ user: UserAccount | null }>;
      if (customEvent.detail?.user) {
        setCurrentUserState(customEvent.detail.user);
      }
    };
    window.addEventListener(SESSION_CHANGE_EVENT, handleCustomChange);

    // 3. Subscribe to cross-tab storage updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_ACTIVE_USER && e.newValue) {
        const db = getDatabaseState();
        const found = db.users?.find(u => u.id === e.newValue);
        if (found) {
          setCurrentUserState(found);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      unsubscribeOidc();
      window.removeEventListener(SESSION_CHANGE_EVENT, handleCustomChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Compute canonical primary role and theme
  const primaryRole = useMemo<PrimaryRole>(
    () => RBACService.getPrimaryRole(currentUser),
    [currentUser]
  );

  const roleTheme = useMemo<RoleThemeConfig>(
    () => RBACService.getRoleTheme(currentUser),
    [currentUser]
  );

  // Compute authorized module IDs strictly based on the user's role
  const authorizedModules = useMemo<string[]>(
    () => RBACService.getAuthorizedModules(currentUser),
    [currentUser]
  );

  const primaryWorkstation = useMemo<string>(
    () => RBACService.getPrimaryWorkstation(currentUser),
    [currentUser]
  );

  // Permission evaluation helpers
  const hasAccess = useCallback(
    (moduleId: string, requiredLevel: AccessLevel = 'READ'): boolean => {
      return RBACService.hasAccess(currentUser, moduleId, requiredLevel);
    },
    [currentUser]
  );

  const getAccessLevel = useCallback(
    (moduleId: string): AccessLevel => {
      return RBACService.getAccessLevel(currentUser, moduleId);
    },
    [currentUser]
  );

  const canAccess = useCallback(
    (moduleId: string): boolean => {
      return RBACService.hasAccess(currentUser, moduleId, 'READ');
    },
    [currentUser]
  );

  const canWrite = useCallback(
    (moduleId: string): boolean => {
      return RBACService.hasAccess(currentUser, moduleId, 'WRITE');
    },
    [currentUser]
  );

  const canAdminister = useCallback(
    (moduleId: string): boolean => {
      return RBACService.hasAccess(currentUser, moduleId, 'ADMIN');
    },
    [currentUser]
  );

  // Role flags
  const isLIS = primaryRole === 'LIS';
  const isBilling = primaryRole === 'Billing';
  const isClinician = primaryRole === 'Clinician';
  const isNurse = primaryRole === 'Nurse';
  const isPharmacy = primaryRole === 'Pharmacy';
  const isAdmin = primaryRole === 'Admin';
  const isManagement = primaryRole === 'Management';
  const isRadiology = primaryRole === 'Radiology';

  // Action: Switch active staff user
  const switchUser = useCallback((userOrId: UserAccount | string) => {
    const db = getDatabaseState();
    const targetUser: UserAccount | undefined =
      typeof userOrId === 'string'
        ? db.users?.find(u => u.id === userOrId)
        : userOrId;

    if (!targetUser) return;

    // Persist in localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_ACTIVE_USER, targetUser.id);
      } catch {}
    }

    // Update state & notify
    setCurrentUserState(targetUser);
    notifySessionChange(targetUser);

    // Audit trail log
    auditTrailService.logLogin(
      targetUser,
      'PERSISTENT_SESSION_SWITCH',
      '192.168.10.45 (Local Clinical Terminal)'
    );
  }, []);

  // Action: Logout
  const logout = useCallback(() => {
    oidcAuthService.logout();
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY_ACTIVE_USER);
      } catch {}
    }
    const db = getDatabaseState();
    const fallback = db.users?.[1] || db.users?.[0];
    if (fallback) {
      setCurrentUserState(fallback);
      notifySessionChange(fallback);
    }
  }, []);

  const refreshSession = useCallback(() => {
    const current = getInitialActiveUser();
    setCurrentUserState(current);
  }, []);

  const claims = oidcAuthService.getIdTokenClaims();
  const session = oidcAuthService.getSession();
  const isAuthenticated = oidcAuthService.isAuthenticated();

  return {
    currentUser,
    isAuthenticated,
    claims,
    session,
    primaryRole,
    roleTheme,
    authorizedModules,
    primaryWorkstation,
    hasAccess,
    getAccessLevel,
    canAccess,
    canWrite,
    canAdminister,
    isLIS,
    isBilling,
    isClinician,
    isNurse,
    isPharmacy,
    isAdmin,
    isManagement,
    isRadiology,
    switchUser,
    logout,
    refreshSession,
  };
}

// Default export
export default useRBAC;
