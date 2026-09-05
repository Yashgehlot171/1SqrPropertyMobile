type Environment = 'development' | 'production';

const environmentUrls: Record<Environment, string> = {
  development: 'http://3.109.54.6/api/v1',
  // TODO: point to the real production host once one exists; using the same
  // live dev backend as a placeholder so production builds are not broken.
  production: 'http://3.109.54.6/api/v1',
};

function getEnvironment(): Environment {
  return __DEV__ ? 'development' : 'production';
}

function getBaseUrl(): string {
  return environmentUrls[getEnvironment()];
}

export const baseConfig = {
  appName: 'A1Property',
  baseUrl: getBaseUrl(),
  imagePath: '',
  requestTimeoutMs: 15000,
} as const;
