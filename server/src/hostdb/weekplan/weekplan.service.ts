import { Injectable } from '@nestjs/common';
import { CreateWeekplanDto } from './dto/create-weekplan.dto';
import { UpdateWeekplanDto } from './dto/update-weekplan.dto';

@Injectable()
export class WeekplanService {
  create(createWeekplanDto: CreateWeekplanDto) {
    return 'This action adds a new weekplan';
  }

  findAll() {
    return `This action returns all weekplan`;
  }

  findOne(id: number) {
    return `This action returns a #${id} weekplan`;
  }

  update(id: number, updateWeekplanDto: UpdateWeekplanDto) {
    return `This action updates a #${id} weekplan`;
  }

  remove(id: number) {
    return `This action removes a #${id} weekplan`;
  }
}
