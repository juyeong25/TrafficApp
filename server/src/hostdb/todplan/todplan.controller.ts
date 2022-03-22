import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TodplanService } from './todplan.service';
import { CreateTodplanDto } from './dto/create-todplan.dto';
import { UpdateTodplanDto } from './dto/update-todplan.dto';

@Controller('todplan')
export class TodplanController {
  constructor(private readonly todplanService: TodplanService) {}

  @Post()
  create(@Body() createTodplanDto: CreateTodplanDto) {
    return this.todplanService.create(createTodplanDto);
  }

  @Get()
  findAll() {
    return this.todplanService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.todplanService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTodplanDto: UpdateTodplanDto) {
    return this.todplanService.update(+id, updateTodplanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.todplanService.remove(+id);
  }
}
