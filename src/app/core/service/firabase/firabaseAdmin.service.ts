import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private app: admin.app.App;

  onModuleInit() {
    if (!admin.apps.length) {
      try {
        // Método 1: Intentar con JSON completo (para local)
        const googleCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        
        if (googleCredentials) {
          console.log('📝 Usando GOOGLE_APPLICATION_CREDENTIALS (JSON)');
          
          // Parsea la cadena JSON de forma segura
          const serviceAccount = JSON.parse(googleCredentials);
          
          // Reemplaza los escapes de saltos de línea
          if (serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key
              .replace(/\\\\n/g, '\n')  // Para Railway (\\n)
              .replace(/\\n/g, '\n');    // Para otros casos (\n)
          }

          this.app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
          });
          
          console.log('✅ Firebase inicializado con JSON completo');
          
        } else {
          // Método 2: Variables separadas (fallback para Railway)
          console.log('📝 Usando variables separadas (FIREBASE_*)');
          
          const projectId = process.env.FIREBASE_PROJECT_ID;
          const privateKey = process.env.FIREBASE_PRIVATE_KEY;
          const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

          if (!projectId || !privateKey || !clientEmail) {
            throw new Error(
              'Falta configuración de Firebase. Define GOOGLE_APPLICATION_CREDENTIALS ' +
              'o las variables FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY y FIREBASE_CLIENT_EMAIL'
            );
          }

          this.app = admin.initializeApp({
            credential: admin.credential.cert({
              projectId,
              privateKey: privateKey.replace(/\\n/g, '\n'),
              clientEmail,
            } as admin.ServiceAccount),
          });
          
          console.log('✅ Firebase inicializado con variables separadas');
        }

        console.log('🎉 Firebase Admin inicializado correctamente');
        
      } catch (error) {
        console.error('❌ Error al inicializar Firebase Admin:', error);
        console.error('Stack:', error.stack);
        throw new Error(`Error al inicializar Firebase: ${error.message}`);
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