/**
 * J & J Memorial e-Hospital — Authentication & RBAC Hook
 * Re-exports useRBAC as useAuth to provide seamless role and session resolution.
 */
import { useRBAC, UseRBACOptions, UseRBACReturn } from './useRBAC';

export { useRBAC, type UseRBACOptions, type UseRBACReturn } from './useRBAC';
export const useAuth = useRBAC;
export default useAuth;
