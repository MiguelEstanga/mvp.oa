import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private app: admin.app.App;

  onModuleInit() {
    if (!admin.apps.length) {
      const googleCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;

      // Verifica si la variable de entorno existe antes de parsearla
      if (!googleCredentials) {
        throw new Error('La variable de entorno GOOGLE_APPLICATION_CREDENTIALS no está definida.');
      }

      // Parsea la cadena JSON de forma segura
      const serviceAccount = JSON.parse(googleCredentials);

      this.app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      this.app = admin.app();
    }
  }

  getAuth(): admin.auth.Auth {
    return admin.auth();
  }

  getApp(): admin.app.App {
    return this.app;
  }
}