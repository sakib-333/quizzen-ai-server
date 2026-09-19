import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseAdminService } from './firebase-admin.service';
import { OptionalFirebaseAuthGuard } from './guards/optional-firebase-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, FirebaseAdminService, OptionalFirebaseAuthGuard],
  exports: [FirebaseAdminService],
})
export class AuthModule { }