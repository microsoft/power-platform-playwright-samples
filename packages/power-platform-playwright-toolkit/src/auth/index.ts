/**
 * Authentication Module
 * Export all authentication-related functions and types
 *
 * @packageDocumentation
 */

export * from './MsAuthHelper';

// Re-export certificate authentication utilities from playwright-ms-auth
export {
  addCertAuthRoute,
  waitForCertAuthResponse,
  type CertAuthOptions,
} from 'playwright-ms-auth';
