import {Controller, Get,Param, ParseIntPipe, UsePipes} from '@nestjs/common';
import { CycleLogService } from './cycle-log.service';
import {CycleLog} from "./entities/cycle-log.entity";
import {ApiOperation, ApiTags} from "@nestjs/swagger";
import {ApiImplicitParam} from "@nestjs/swagger/dist/decorators/api-implicit-param.decorator";

@Controller('cycle-log')
@ApiTags('Cycle 로그 API')
export class CycleLogController {
  constructor(private readonly cycleLogService: CycleLogService) {}


  @Get('/:startDate/:endDate/:id/listAll')
  @ApiOperation({ summary: 'Cycle 로그 교차로별 조회 API', description: 'Cycle 로그 교차로별 조회' })
  @ApiImplicitParam({ name: 'id', required: true, type: Number, description: '교차로 ID' })
  @ApiImplicitParam({ name: 'startDate', required: true, type: Number, description: '시작날짜 (YYYYMMDD)' })
  @ApiImplicitParam({ name: 'endDate', required: true, type: Number, description: '종료날짜 (YYYYMMDD)' })
  @UsePipes()
  getAllCycleLogById(
      @Param('id', ParseIntPipe) id: number,
      @Param('startDate', ParseIntPipe) startDate: number,
      @Param('endDate', ParseIntPipe) endDate: number,
  ): Promise<CycleLog[]>{
    return this.cycleLogService.getAllCycleLogById(id, startDate, endDate)
  }
}
