import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WeekplanService } from './weekplan.service';
import { CreateWeekplanDto } from './dto/create-weekplan.dto';
import { UpdateWeekplanDto } from './dto/update-weekplan.dto';

@Controller('weekplan')
export class WeekplanController {
  constructor(private readonly weekplanService: WeekplanService) {}

  @Post()
  create(@Body() createWeekplanDto: CreateWeekplanDto) {
    return this.weekplanService.create(createWeekplanDto);
  }

  @Get()
  findAll() {
    return this.weekplanService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.weekplanService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWeekplanDto: UpdateWeekplanDto) {
    return this.weekplanService.update(+id, updateWeekplanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.weekplanService.remove(+id);
  }
}
