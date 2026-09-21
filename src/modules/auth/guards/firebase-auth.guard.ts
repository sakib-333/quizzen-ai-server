import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

import type { Request } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';

import { FirebaseAdminService } from '../firebase-admin.service';

export type FirebaseRequest = Request & {
    user?: DecodedIdToken;
};

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
    constructor(private readonly firebaseAdmin: FirebaseAdminService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<FirebaseRequest>();

        const authorization = request.headers.authorization;

        if (!authorization) {
            throw new UnauthorizedException('Authentication required.');
        }

        const [type, token] = authorization.split(' ');

        if (type !== 'Bearer' || !token) {
            throw new UnauthorizedException('Invalid authorization header.');
        }

        try {
            request.user = await this.firebaseAdmin.verifyIdToken(token);
            return true;
        } catch {
            throw new UnauthorizedException('Invalid or expired Firebase token.');
        }
    }
}