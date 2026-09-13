import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateRecruitmentDto } from './create-recruitment.dto';
import { RecruitmentsService } from './recruitments.service';
import type { Recruitment } from './recruitments.service';

@ApiTags('recruitments')
@Controller('api/recruitments')
export class RecruitmentsController {
  constructor(private readonly recruitmentsService: RecruitmentsService) {}

  @Get()
  findAll(): Recruitment[] {
    return this.recruitmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Recruitment {
    return this.recruitmentsService.findOne(Number(id));
  }

  @Post()
  create(@Body() body: CreateRecruitmentDto): Recruitment {
    return this.recruitmentsService.create(body);
  }
}
