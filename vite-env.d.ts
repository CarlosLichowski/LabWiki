// <root>/vite-env.d.ts or <src>/vite-env.d.ts

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_CONFIG: string
  // Add other environment variables here if needed, 
  // e.g., readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}