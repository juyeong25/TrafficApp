import { Injectable } from '@nestjs/common';
import { CreateHoliydayplanDto } from './dto/create-holiydayplan.dto';
import { UpdateHoliydayplanDto } from './dto/update-holiydayplan.dto';

@Injectable()
export class HoliydayplanService {
  create(createHoliydayplanDto: CreateHoliydayplanDto) {
    return 'This action adds a new holiydayplan';
  }

  findAll() {
    return `This action returns all holiydayplan`;
  }

  findOne(id: number) {
    return `This action returns a #${id} holiydayplan`;
  }

  update(id: number, updateHoliydayplanDto: UpdateHoliydayplanDto) {
    return `This action updates a #${id} holiydayplan`;
  }

  remove(id: number) {
    return `This action removes a #${id} holiydayplan`;
  }
}
