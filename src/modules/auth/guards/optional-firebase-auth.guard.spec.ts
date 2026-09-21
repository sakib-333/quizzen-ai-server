import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { DecodedIdToken } from 'firebase-admin/auth';

jest.mock('../firebase-admin.service', () => ({
    FirebaseAdminService: class FirebaseAdminService {},
}));

import type { FirebaseAdminService } from '../firebase-admin.service';
import { OptionalFirebaseAuthGuard } from './optional-firebase-auth.guard';

describe('OptionalFirebaseAuthGuard', () => {
    const firebaseAdmin = {
        verifyIdToken: jest.fn(),
    };
    const guard = new OptionalFirebaseAuthGuard(
        firebaseAdmin as unknown as FirebaseAdminService,
    );

    const contextFor = (authorization?: string) => {
        const request = { headers: { authorization } } as {
            headers: { authorization?: string };
            user?: DecodedIdToken;
        };
        const context = {
            switchToHttp: () => ({ getRequest: () => request }),
        } as unknown as ExecutionContext;

        return { context, request };
    };

    beforeEach(() => jest.clearAllMocks());

    it('allows a request without credentials as a guest', async () => {
        const { context } = contextFor();

        await expect(guard.canActivate(context)).resolves.toBe(true);
        expect(firebaseAdmin.verifyIdToken).not.toHaveBeenCalled();
    });

    it('attaches the decoded user for a valid bearer token', async () => {
        const user = { uid: 'firebase-user-id' } as DecodedIdToken;
        firebaseAdmin.verifyIdToken.mockResolvedValue(user);
        const { context, request } = contextFor('Bearer valid-token');

        await expect(guard.canActivate(context)).resolves.toBe(true);
        expect(firebaseAdmin.verifyIdToken).toHaveBeenCalledWith('valid-token');
        expect(request.user).toBe(user);
    });

    it('rejects a malformed authorization header', async () => {
        const { context } = contextFor('Basic token');

        await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
        expect(firebaseAdmin.verifyIdToken).not.toHaveBeenCalled();
    });

    it('rejects an invalid or expired bearer token', async () => {
        firebaseAdmin.verifyIdToken.mockRejectedValue(new Error('expired'));
        const { context } = contextFor('Bearer expired-token');

        await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
    });
});
