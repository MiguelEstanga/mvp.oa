import { Module, Global } from '@nestjs/common';
import { FirebaseAdminService } from './firabaseAdmin.service';

@Global() // 👈 Esto hace que el servicio esté disponible en toda la app sin importarlo
@Module({
  providers: [FirebaseAdminService],
  exports: [FirebaseAdminService],
})
export class FirebaseModule {}