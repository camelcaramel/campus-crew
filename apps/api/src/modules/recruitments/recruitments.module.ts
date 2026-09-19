import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { RecruitmentsController } from './recruitments.controller';
import { RecruitmentsService } from './recruitments.service';

@Module({
  imports: [PrismaModule],
  controllers: [RecruitmentsController],
  providers: [RecruitmentsService],
})
export class RecruitmentsModule {}
