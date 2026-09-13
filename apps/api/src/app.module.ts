import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecruitmentsModule } from './modules/recruitments/recruitments.module';

@Module({
  imports: [RecruitmentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
