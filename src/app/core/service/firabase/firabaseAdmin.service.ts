import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private app: admin.app.App;

  onModuleInit() {
  if (!admin.apps.length) {
    try {
      console.log('📝 Inicializando Firebase...');
      console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
      
      // Debug: muestra TODOS los env vars (solo los nombres)
      console.log('🔍 Variables disponibles:', Object.keys(process.env).filter(k => k.includes('FIREBASE')));
      
      const projectId = process.env.FIREBASE_PROJECT_ID;
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

      // Debug más detallado
      console.log(`Project ID completo: "${projectId}"`);
      console.log(`Private Key primeros 50 chars: "${privateKey?.substring(0, 50)}"`);
      console.log(`Client Email completo: "${clientEmail}"`);

      if (!projectId || !privateKey || !clientEmail) {
        throw new Error(
          'Falta configuración de Firebase. ' +
            `FIREBASE_PROJECT_ID: ${projectId ? 'OK' : 'FALTA'}, ` +
            `FIREBASE_PRIVATE_KEY: ${privateKey ? 'OK' : 'FALTA'}, ` +
            `FIREBASE_CLIENT_EMAIL: ${clientEmail ? 'OK' : 'FALTA'}`,
        );
      }

      // Convierte \n a saltos de línea reales
      privateKey = privateKey.replace(/\\n/g, '\n');

      console.log('🔍 Key después del replace:', privateKey.substring(0, 50));
      console.log('🔍 Contiene BEGIN PRIVATE KEY?', privateKey.includes('BEGIN PRIVATE KEY'));

      this.app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          privateKey,
          clientEmail,
        } as admin.ServiceAccount),
      });
      
      console.log('✅ Firebase inicializado correctamente');
    } catch (error) {
      console.error('❌ Error completo:', error);
      throw error;
    }
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
