import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private app: admin.app.App;

  onModuleInit() {
    if (!admin.apps.length) {
      try {
        // Intenta primero con GOOGLE_APPLICATION_CREDENTIALS (para desarrollo local)
        const googleCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;

        if (false) {
          console.log('📝 Usando GOOGLE_APPLICATION_CREDENTIALS');

          // // Parsea la cadena JSON de forma segura
          // const serviceAccount = JSON.parse(googleCredentials);

          // // Reemplaza escapes de saltos de línea
          // if (serviceAccount.private_key) {
          //   serviceAccount.private_key = serviceAccount.private_key
          //     .replace(/\\\\n/g, '\n')
          //     .replace(/\\n/g, '\n');
          // }

          // this.app = admin.initializeApp({
          //   credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
          // });

          console.log('✅ Firebase inicializado con JSON');
        } else {
          // Usa variables separadas (para Railway)
          console.log('📝 Usando variables separadas (FIREBASE_*)');

          const projectId = process.env.FIREBASE_PROJECT_ID;
          const privateKey = process.env.FIREBASE_PRIVATE_KEY;
          const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

          console.log(`Project ID: ${projectId ? '✓' : '✗'}`);
          console.log(
            `Private Key: ${privateKey ? '✓ (' + privateKey.length + ' chars)' : '✗'}`,
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

          this.app = admin.initializeApp({
            credential: admin.credential.cert({
              projectId: projectId,
              privateKey: privateKey.replace(/\\n/g, '\n'),
              clientEmail: clientEmail,
            } as admin.ServiceAccount),
          });

          console.log('✅ Firebase inicializado con variables separadas');
        }

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
