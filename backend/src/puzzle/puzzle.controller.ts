import { Controller, Get, Param, Query } from '@nestjs/common'
import { PuzzleService } from './puzzle.service'
import type { PieceState, PuzzleMeta } from './types'

@Controller('puzzle')
export class PuzzleController {
    constructor(private readonly svc: PuzzleService) {}

    @Get('session/:id')
    getSession(
        @Param('id') id: string,
        @Query('img') img?: string,
    ): { meta: PuzzleMeta; pieces: PieceState[] } {
        const imageUrl =
            img || 'http://localhost:3000/puzzle.jpg'
        return this.svc.createSession(id, imageUrl)
    }
}
