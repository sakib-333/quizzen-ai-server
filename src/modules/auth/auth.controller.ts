import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { OptionalFirebaseAuthGuard } from './guards/optional-firebase-auth.guard';

type AuthRequest = Request & { user?: DecodedIdToken };

@Controller('auth')
export class AuthController {
    @Get('me')
    @UseGuards(OptionalFirebaseAuthGuard)
    me(@Req() request: AuthRequest) {
        if (!request.user) return { authenticated: false, user: null };

        return {
            authenticated: true,
            user: {
                uid: request.user.uid,
                email: request.user.email ?? null,
                name: request.user.name ?? null,
            },
        };
    }
}