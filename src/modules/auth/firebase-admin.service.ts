import { Injectable } from '@nestjs/common';
import { cert, getApp, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { Auth, DecodedIdToken, getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FirebaseAdminService {
    private readonly auth: Auth;

    constructor() {
        const serviceAccountPath = join(process.cwd(), 'secrets', 'firebase-service-account.json');
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8')) as ServiceAccount;

        const app = getApps().length ? getApp() : initializeApp({ credential: cert(serviceAccount) });

        this.auth = getAuth(app);
    }

    verifyIdToken(token: string): Promise<DecodedIdToken> {
        return this.auth.verifyIdToken(token);
    }
}