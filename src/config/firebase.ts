// src/config/firebase.ts
import admin from 'firebase-admin';
import path from 'path';

// Ruta absoluta al archivo JSON
const serviceAccountPath = path.resolve(process.cwd(), 'uploadsperfil-firebase-adminsdk-fbsvc-fdc988ec55.json');

if (!admin.apps.length) {
  admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
  storageBucket: 'uploadsperfil.firebasestorage.app', // ← este es el verdadero bucket
});
}

const bucket = admin.storage().bucket();

export { bucket };