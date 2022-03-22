import {Controller, Get, Param, ParseIntPipe} from '@nestjs/common';
import { ArrowService } from './arrow.service';
import {Arrow} from "./entities/arrow.entity";


@Controller('arrow')
export class ArrowController {
  constructor(private readonly arrowService: ArrowService) {}

  @Get('/listAll')
  arrowListAll(): Promise<Arrow[]>{
    return this.arrowService.arrowListAll();
  }

  @Get('/read/:arrow_id')
  arrowGetOneById(
      @Param('arrow_id', ParseIntPipe)arrow_id: number
  ){
    return this.arrowService.arrowGetOneById(arrow_id)
  }
}
