/**
 * Environment variable validation and access
 */

export function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Please add it to your .env file.`
    );
  }
  return value;
}

export function getOptionalEnvVar(name: string, defaultValue = ""): string {
  return process.env[name] ?? defaultValue;
}

// Validate critical env vars at module load
if (typeof window === 'undefined') {
  // Server-side only
  try {
    getRequiredEnvVar('GITHUB_CLIENT_ID');
    getRequiredEnvVar('GITHUB_CLIENT_SECRET');
    getRequiredEnvVar('NEXTAUTH_SECRET');
    // GITHUB_TOKEN is optional but recommended
  } catch (error) {
    console.error('❌ Environment variable validation failed:', error);
    // Don't throw in production to avoid crashes, but log prominently
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }
  }
}
