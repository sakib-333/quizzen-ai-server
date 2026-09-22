import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { Auth, DecodedIdToken, getAuth } from 'firebase-admin/auth';

@Injectable()
export class FirebaseAdminService {
    private readonly auth: Auth;

    constructor(private readonly config: ConfigService) {
        const app = getApps().length
            ? getApp()
            : initializeApp({
                credential: cert({
                    projectId: this.config.getOrThrow<string>('FIREBASE_PROJECT_ID'),
                    clientEmail: this.config.getOrThrow<string>('FIREBASE_CLIENT_EMAIL'),
                    privateKey: this.config
                        .getOrThrow<string>('FIREBASE_PRIVATE_KEY')
                        .replace(/\\n/g, '\n'),
                }),
            });

        this.auth = getAuth(app);
    }

    verifyIdToken(token: string): Promise<DecodedIdToken> {
        return this.auth.verifyIdToken(token);
    }
}