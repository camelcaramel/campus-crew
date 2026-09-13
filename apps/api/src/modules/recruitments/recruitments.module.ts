import { Module } from '@nestjs/common';
import { RecruitmentsController } from './recruitments.controller';
import { RecruitmentsService } from './recruitments.service';

@Module({
  controllers: [RecruitmentsController],
  providers: [RecruitmentsService],
})
export class RecruitmentsModule {}
