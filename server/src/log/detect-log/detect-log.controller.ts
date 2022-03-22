import {Controller, Get, Param, UsePipes, ParseIntPipe} from '@nestjs/common';
import { DetectLogService } from './detect-log.service';
import {DetectLog} from "./entities/detect-log.entity";
import {ApiOperation, ApiTags} from "@nestjs/swagger";
import {ApiImplicitParam} from "@nestjs/swagger/dist/decorators/api-implicit-param.decorator";

@Controller('detect-log')
@ApiTags('검지기 로그 API')
export class DetectLogController {
  constructor(private readonly detectLogService: DetectLogService) {}

  @Get('/:startDate/:endDate/:id/listAll')
  @ApiOperation({ summary: '검지기 로그 교차로별 조회 API', description: '검지기 로그 교차로별 조회' })
  @ApiImplicitParam({ name: 'id', required: true, type: Number, description: '교차로 ID' })
  @ApiImplicitParam({ name: 'startDate', required: true, type: Number, description: '시작날짜 (YYYYMMDD)' })
  @ApiImplicitParam({ name: 'endDate', required: true, type: Number, description: '종료날짜 (YYYYMMDD)' })
  @UsePipes()
  getAllDetectLogById(
      @Param('id', ParseIntPipe) id: number,
      @Param('startDate', ParseIntPipe) startDate: number,
      @Param('endDate', ParseIntPipe) endDate: number,
  ): Promise<DetectLog[]>{
    return this.detectLogService.getAllDetectLogById(id, startDate, endDate);
  }

}
