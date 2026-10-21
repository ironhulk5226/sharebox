import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCGOYKBVGAL4oB7jUPpyXDuDMMeXYGjRq0',
  authDomain: 'sharebox-c89e3.firebaseapp.com',
  projectId: 'sharebox-c89e3',
  storageBucket: 'sharebox-c89e3.firebasestorage.app',
  messagingSenderId: '523758792648',
  appId: '1:523758792648:web:9753bb605c7ed748441afd',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

