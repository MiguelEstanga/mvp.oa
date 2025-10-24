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

        console.log(`Project ID: ${projectId ? '✓' : '✗'}`);
        console.log(
          `Private Key: ${privateKey ? `✓ (${privateKey.length} chars)` : '✗'}`,
        );
        console.log(`Client Email: ${clientEmail ? '✓' : '✗'}`);

        if (!projectId || !privateKey || !clientEmail) {
          throw new Error(
            'Falta configuración de Firebase. ' +
              `FIREBASE_PROJECT_ID: ${projectId ? 'OK' : 'FALTA'}, ` +
              `FIREBASE_PRIVATE_KEY: ${privateKey ? 'OK' : 'FALTA'}, ` +
              `FIREBASE_CLIENT_EMAIL: ${clientEmail ? 'OK' : 'FALTA'}`,
          );
        }

        // 🔥 CRÍTICO: Convierte \n a saltos de línea reales
        privateKey = privateKey.replace(/\\n/g, '\n');

        // Debug: verifica que la key tenga el formato correcto
        console.log(
          '🔍 Primeros caracteres de la key:',
          privateKey.substring(0, 30),
        );
        console.log(
          '🔍 Contiene BEGIN?',
          privateKey.includes('BEGIN PRIVATE KEY'),
        );

        this.app = admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            privateKey,
            clientEmail,
          } as admin.ServiceAccount),
        });

        console.log('✅ Firebase inicializado correctamente');
        console.log('🎉 Firebase Admin listo');
      } catch (error) {
        console.error('❌ Error al inicializar Firebase:', error.message);
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
