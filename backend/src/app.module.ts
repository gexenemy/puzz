import { Module } from '@nestjs/common'
import { PuzzleController } from './puzzle/puzzle.controller'
import { PuzzleService } from './puzzle/puzzle.service'


@Module({
    imports: [],
    controllers: [PuzzleController],
    providers: [PuzzleService]
})
export class AppModule {}