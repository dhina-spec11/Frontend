import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if we have valid, non-placeholder firebase configuration
const isFirebaseConfigured = !!firebaseConfig.projectId && firebaseConfig.projectId !== 'your-project-id' && firebaseConfig.projectId.trim() !== '';

let db = null;
let auth = null;
let firebaseApp = null;

if (isFirebaseConfigured) {
  try {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      firebaseApp = getApps()[0];
    }
    db = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
    console.log("Firebase SDK successfully initialized!");
  } catch (error) {
    console.error("Failed to initialize Firebase SDK. Falling back to simulated storage client.", error);
  }
} else {
  console.log("Firebase config keys are missing in .env. Running on local-storage mock database mode.");
}

// Simulated LocalStorage / MySQL Database API Helper
const API_URL = 'http://localhost:5000/api';

const mockAuth = {
  signIn: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Invalid email or password.');
    }
    localStorage.setItem('mock_firebase_current_user', JSON.stringify(data));
    window.dispatchEvent(new Event('mock_auth_change'));
    return data;
  },
  signUp: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed.');
    }
    localStorage.setItem('mock_firebase_current_user', JSON.stringify(data));
    window.dispatchEvent(new Event('mock_auth_change'));
    return data;
  },
  signOut: async () => {
    localStorage.removeItem('mock_firebase_current_user');
    window.dispatchEvent(new Event('mock_auth_change'));
  },
  onAuthStateChanged: (callback) => {
    const getUser = () => {
      const raw = localStorage.getItem('mock_firebase_current_user');
      return raw ? JSON.parse(raw) : null;
    };
    callback(getUser());

    const storageHandler = (e) => {
      if (e.key === 'mock_firebase_current_user') {
        callback(getUser());
      }
    };
    const customHandler = () => callback(getUser());

    window.addEventListener('storage', storageHandler);
    window.addEventListener('mock_auth_change', customHandler);
    return () => {
      window.removeEventListener('storage', storageHandler);
      window.removeEventListener('mock_auth_change', customHandler);
    };
  }
};

// Database REST API Fallback Helper connecting to Express/MySQL
const mockDb = {
  saveForm: async (formId, fields, title, description, status = 'published', ownerUid = null) => {
    const res = await fetch(`${API_URL}/forms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: formId, fields, title, description, status, ownerUid })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save form to database.');
    return data;
  },
  
  getForm: async (formId) => {
    const res = await fetch(`${API_URL}/forms/${formId}`);
    if (res.status === 404) return null;
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to retrieve form.');
    return data;
  },

  submitResponse: async (formId, responseData) => {
    const res = await fetch(`${API_URL}/forms/${formId}/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responseData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit response entry.');
    return data;
  },

  getResponses: async (formId) => {
    const res = await fetch(`${API_URL}/forms/${formId}/responses`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch form responses.');
    return data;
  },

  getAllForms: async () => {
    const res = await fetch(`${API_URL}/forms`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch forms catalog.');
    return data;
  },

  deleteForm: async (formId) => {
    const res = await fetch(`${API_URL}/forms/${formId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete form.');
    return true;
  },

  addCollaborator: async (formId, email) => {
    const res = await fetch(`${API_URL}/forms/${formId}/collaborators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add collaborator.');
    return data;
  },

  removeCollaborator: async (formId, email) => {
    const res = await fetch(`${API_URL}/forms/${formId}/collaborators`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to remove collaborator.');
    return data;
  }
};

// Exported standard Auth API
export const logInUser = async (email, password) => {
  if (auth) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  }
  return mockAuth.signIn(email, password);
};

export const signUpUser = async (email, password) => {
  if (auth) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return cred.user;
  }
  return mockAuth.signUp(email, password);
};

export const logOutUser = async () => {
  if (auth) {
    await fbSignOut(auth);
    return;
  }
  await mockAuth.signOut();
};

export const subscribeToAuth = (callback) => {
  if (auth) {
    return onAuthStateChanged(auth, callback);
  }
  return mockAuth.onAuthStateChanged(callback);
};

// Exported standard Firestore/DB API
export const saveForm = async (formId, fields, title, description, status = 'published', ownerUid = null) => {
  if (db) {
    try {
      const ref = doc(db, 'forms', formId);
      const data = { 
        id: formId, 
        fields, 
        title, 
        description, 
        status, 
        ownerUid,
        updatedAt: new Date().toISOString() 
      };
      await setDoc(ref, data, { merge: true });
      return data;
    } catch (e) {
      console.error("Firestore saveForm failed, defaulting to local simulated store.", e);
      return mockDb.saveForm(formId, fields, title, description, status, ownerUid);
    }
  }
  return mockDb.saveForm(formId, fields, title, description, status, ownerUid);
};

export const getForm = async (formId) => {
  if (db) {
    try {
      const ref = doc(db, 'forms', formId);
      const snap = await getDoc(ref);
      return snap.exists() ? snap.data() : null;
    } catch (e) {
      console.error("Firestore getForm failed, defaulting to local simulated store.", e);
      return mockDb.getForm(formId);
    }
  }
  return mockDb.getForm(formId);
};

export const submitResponse = async (formId, responseData) => {
  if (db) {
    try {
      const colRef = collection(db, 'forms', formId, 'responses');
      const docRef = await addDoc(colRef, {
        ...responseData,
        submittedAt: new Date().toISOString()
      });
      return { id: docRef.id, ...responseData };
    } catch (e) {
      console.error("Firestore submitResponse failed, defaulting to local simulated store.", e);
      return mockDb.submitResponse(formId, responseData);
    }
  }
  return mockDb.submitResponse(formId, responseData);
};

export const getResponses = async (formId) => {
  if (db) {
    try {
      const colRef = collection(db, 'forms', formId, 'responses');
      const snap = await getDocs(colRef);
      const list = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      return list;
    } catch (e) {
      console.error("Firestore getResponses failed, defaulting to local simulated store.", e);
      return mockDb.getResponses(formId);
    }
  }
  return mockDb.getResponses(formId);
};

export const getAllForms = async () => {
  if (db) {
    try {
      const colRef = collection(db, 'forms');
      const snap = await getDocs(colRef);
      const list = [];
      snap.forEach((doc) => {
        list.push(doc.data());
      });
      return list;
    } catch (e) {
      console.error("Firestore getAllForms failed, defaulting to local simulated store.", e);
      return mockDb.getAllForms();
    }
  }
  return mockDb.getAllForms();
};

export const deleteForm = async (formId) => {
  if (db) {
    try {
      const ref = doc(db, 'forms', formId);
      await deleteDoc(ref);
      return true;
    } catch (e) {
      console.error("Firestore deleteForm failed, defaulting to local simulated store.", e);
      await mockDb.deleteForm(formId);
      return true;
    }
  }
  await mockDb.deleteForm(formId);
  return true;
};

export const addCollaborator = async (formId, email) => {
  if (db) {
    try {
      const { arrayUnion } = await import('firebase/firestore');
      const ref = doc(db, 'forms', formId);
      await import('firebase/firestore').then(({ updateDoc }) =>
        updateDoc(ref, { sharedWith: arrayUnion(email) })
      );
      return true;
    } catch (e) {
      console.error("Firestore addCollaborator failed, defaulting to local simulated store.", e);
      return mockDb.addCollaborator(formId, email);
    }
  }
  return mockDb.addCollaborator(formId, email);
};

export const removeCollaborator = async (formId, email) => {
  if (db) {
    try {
      const { arrayRemove } = await import('firebase/firestore');
      const ref = doc(db, 'forms', formId);
      await import('firebase/firestore').then(({ updateDoc }) =>
        updateDoc(ref, { sharedWith: arrayRemove(email) })
      );
      return true;
    } catch (e) {
      console.error("Firestore removeCollaborator failed, defaulting to local simulated store.", e);
      return mockDb.removeCollaborator(formId, email);
    }
  }
  return mockDb.removeCollaborator(formId, email);
};

export const getIsFirebaseConfigured = () => {
  return isFirebaseConfigured;
};

export const getNetworkIp = async () => {
  try {
    const res = await fetch(`http://localhost:5000/api/network-ip`);
    const data = await res.json();
    return data.ip;
  } catch (err) {
    console.error("Failed to fetch LAN IP:", err);
    return 'localhost';
  }
};
