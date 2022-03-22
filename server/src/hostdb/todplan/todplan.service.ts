import { Injectable } from '@nestjs/common';
import { CreateTodplanDto } from './dto/create-todplan.dto';
import { UpdateTodplanDto } from './dto/update-todplan.dto';

@Injectable()
export class TodplanService {
  create(createTodplanDto: CreateTodplanDto) {
    return 'This action adds a new todplan';
  }

  findAll() {
    return `This action returns all todplan`;
  }

  findOne(id: number) {
    return `This action returns a #${id} todplan`;
  }

  update(id: number, updateTodplanDto: UpdateTodplanDto) {
    return `This action updates a #${id} todplan`;
  }

  remove(id: number) {
    return `This action removes a #${id} todplan`;
  }
}
