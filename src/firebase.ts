import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
const e = import.meta.env;
export const configured = !!e.VITE_FB_API_KEY && !!e.VITE_FB_PROJECT_ID;
const app = configured ? initializeApp({apiKey: e.VITE_FB_API_KEY, authDomain: e.VITE_FB_AUTH_DOMAIN, projectId: e.VITE_FB_PROJECT_ID, appId: e.VITE_FB_APP_ID}) : (null as any);
export const auth = configured ? getAuth(app) : (null as any);
export const db = configured ? getFirestore(app) : (null as any);
