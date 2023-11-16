import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore, collection } from 'firebase/firestore';
import { getStorage } from "firebase/storage";


const firebaseConfig = {
    apiKey: "AIzaSyDztUaKGJj-rskOQd_SeW6l-PZdVPW9Cuk",
    authDomain: "auth-dev-93d51.firebaseapp.com",
    projectId: "auth-dev-93d51",
    storageBucket: "auth-dev-93d51.appspot.com",
    messagingSenderId: "16002571480",
    appId: "1:16002571480:web:fc8b414d156a01e92c8bad"
  };

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const foldersCollection = collection(firestore, 'folders');
const filesCollection = collection(firestore, 'files');
const usersCollection = collection(firestore, 'users')
  
export const database = {
    folders: foldersCollection,
    files: filesCollection,
    users: usersCollection,
}
const auth = initializeAuth(app);
export const storage = getStorage(app);
export { auth };
export default app;