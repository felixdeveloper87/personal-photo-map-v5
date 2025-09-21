// Application Constants - Constantes globais da aplicação
export * from './api';
export * from './routes';
export * from './config';
export * from './validation';
export * from './messages';
export * from './countries';
export * from './features';

// Feature Flags
export const FEATURE_FLAGS = {
  PREMIUM_FEATURES: process.env.NODE_ENV === 'production',
  BETA_FEATURES: process.env.NODE_ENV === 'development',
  ANALYTICS: true,
  NOTIFICATIONS: true,
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'Photomap',
  VERSION: '1.0.0',
  DESCRIPTION: 'Capture • Explore • Remember',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FORMATS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  DEFAULT_ZOOM: 3,
  MAX_ZOOM: 18,
};
