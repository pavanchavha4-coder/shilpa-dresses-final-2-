import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { FirebaseConnectionStatus } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let firebaseAuth: Auth | null = null;

// Retrieve potential Firebase configuration
export function getFirebaseConfig() {
  // 1. Check custom user input saved in boutique settings
  const customConfig = localStorage.getItem('shilpa_firebase_custom_config');
  if (customConfig) {
    try {
      const parsed = JSON.parse(customConfig);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    } catch {
      // ignore JSON parse error
    }
  }

  // 2. Check environment variables
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || '(default)'
    };
  }

  return null;
}

export async function initFirebaseService(): Promise<FirebaseConnectionStatus> {
  const config = getFirebaseConfig();

  if (!config) {
    // Transparently inform that credentials are not configured yet
    return {
      isConfigured: false,
      isConnected: false,
      mode: 'local_storage',
      error: 'Firebase credentials are not configured. Using high-reliability local boutique database.'
    };
  }

  try {
    if (!getApps().length) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApps()[0];
    }

    firestoreDb = getFirestore(firebaseApp, config.firestoreDatabaseId || '(default)');
    firebaseAuth = getAuth(firebaseApp);

    // Test connection as required by firebase skill
    try {
      await getDocFromServer(doc(firestoreDb, 'test', 'connection'));
    } catch (testErr) {
      // Offline or first-time setup warning
      console.warn('Firebase test connection response:', testErr);
    }

    return {
      isConfigured: true,
      isConnected: true,
      mode: 'firebase',
      projectId: config.projectId,
      error: null
    };
  } catch (err: any) {
    console.error('Firebase initialization failure:', err);
    return {
      isConfigured: true,
      isConnected: false,
      mode: 'local_storage',
      projectId: config.projectId,
      error: err?.message || 'Could not connect to Firebase'
    };
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: firebaseAuth?.currentUser?.uid,
      email: firebaseAuth?.currentUser?.email,
      emailVerified: firebaseAuth?.currentUser?.emailVerified,
      isAnonymous: firebaseAuth?.currentUser?.isAnonymous,
      tenantId: firebaseAuth?.currentUser?.tenantId,
      providerInfo: firebaseAuth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export { firebaseApp, firestoreDb, firebaseAuth };
