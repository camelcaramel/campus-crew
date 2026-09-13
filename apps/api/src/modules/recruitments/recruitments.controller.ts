import { Controller, Get } from '@nestjs/common';
import { RecruitmentsService } from './recruitments.service';
import type { Recruitment } from './recruitments.service';

@Controller('recruitments')
export class RecruitmentsController {
  constructor(private readonly recruitmentsService: RecruitmentsService) {}

  @Get()
  findAll(): Recruitment[] {
    return this.recruitmentsService.findAll();
  }
}
