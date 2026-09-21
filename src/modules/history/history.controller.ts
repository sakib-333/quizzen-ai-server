import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { FirebaseAuthGuard, type FirebaseRequest } from '../auth/guards/firebase-auth.guard';

import { HistoryService } from './history.service';

@Controller('history')
export class HistoryController {
    constructor(private readonly historyService: HistoryService) { }

    @Get()
    @UseGuards(FirebaseAuthGuard)
    async getHistory(@Req() request: FirebaseRequest) {
        return {
            success: true,
            data: await this.historyService.getHistory(request.user!.uid),
        };
    }
}