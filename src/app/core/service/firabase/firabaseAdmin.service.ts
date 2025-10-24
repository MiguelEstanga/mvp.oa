import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private app: admin.app.App;

 onModuleInit() {
  if (!admin.apps.length) {
    try {
      console.log('📝 Inicializando Firebase...');
      
      const projectId = process.env.FIREBASE_PROJECT_ID;
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

      if (!projectId || !privateKey || !clientEmail) {
        throw new Error('Faltan variables de entorno de Firebase');
      }

      // 🔥 SOLUCIÓN: Múltiples niveles de escape
      privateKey = privateKey
        .replace(/\\\\n/g, '\n')  // Reemplaza doble escape \\n
        .replace(/\\n/g, '\n')    // Reemplaza escape simple \n
        .replace(/\n\n/g, '\n')   // Elimina saltos dobles
        .trim();                  // Elimina espacios al inicio/final

      // Validación adicional
      if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
        throw new Error('La FIREBASE_PRIVATE_KEY no tiene el formato correcto de certificado PEM');
      }

      console.log('✅ Private key procesada correctamente');
      console.log('🔍 Longitud final:', privateKey.length);

      this.app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId.trim(),
          privateKey: privateKey,
          clientEmail: clientEmail.trim(),
        } as admin.ServiceAccount),
      });
      
      console.log('✅ Firebase inicializado correctamente');
      console.log('🎉 Firebase Admin listo');
    } catch (error) {
      console.error('❌ Error al inicializar Firebase:', error.message);
      console.error('Stack completo:', error.stack);
      throw error;
    }
  } else {
    this.app = admin.app();
  }
}
  getAuth(): admin.auth.Auth {
    return admin.auth(this.app);
  }

  getApp(): admin.app.App {
    return this.app;
  }

  getFirestore(): admin.firestore.Firestore {
    return admin.firestore(this.app);
  }
}
