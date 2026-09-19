import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateRecruitmentDto } from './create-recruitment.dto';
import { RecruitmentsService } from './recruitments.service';
import { UpdateRecruitmentDto } from './update-recruitment.dto';

@ApiTags('recruitments')
@Controller('api/recruitments')
export class RecruitmentsController {
  constructor(private readonly recruitmentsService: RecruitmentsService) {}

  @Get()
  findAll() {
    return this.recruitmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.recruitmentsService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateRecruitmentDto) {
    return this.recruitmentsService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateRecruitmentDto,
  ) {
    return this.recruitmentsService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.recruitmentsService.remove(id);
  }
}
