import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HoliydayplanService } from './holiydayplan.service';
import { CreateHoliydayplanDto } from './dto/create-holiydayplan.dto';
import { UpdateHoliydayplanDto } from './dto/update-holiydayplan.dto';

@Controller('holiydayplan')
export class HoliydayplanController {
  constructor(private readonly holiydayplanService: HoliydayplanService) {}

  @Post()
  create(@Body() createHoliydayplanDto: CreateHoliydayplanDto) {
    return this.holiydayplanService.create(createHoliydayplanDto);
  }

  @Get()
  findAll() {
    return this.holiydayplanService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.holiydayplanService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHoliydayplanDto: UpdateHoliydayplanDto) {
    return this.holiydayplanService.update(+id, updateHoliydayplanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.holiydayplanService.remove(+id);
  }
}
