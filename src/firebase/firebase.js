
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; 
import { getFirestore } from 'firebase/firestore'; 

const firebaseConfig = {
  apiKey: "AIzaSyCn28hvtFKGJ9hrrFcGgOYNfIMZQKmKoko",
  authDomain: "authpass-8ad8f.firebaseapp.com",
  projectId: "authpass-8ad8f",
  storageBucket: "authpass-8ad8f.firebasestorage.app",
  messagingSenderId: "218398076920",
  appId: "1:218398076920:web:77e316d917e87d0f21300d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
const db = getFirestore(app); 

export { auth, db }; 