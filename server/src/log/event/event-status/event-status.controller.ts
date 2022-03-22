import { Controller, Get} from '@nestjs/common';
import { EventStatusService } from './event-status.service';
import {EventStatus} from "./entities/event-status.entity";
import {ApiCreatedResponse, ApiOperation, ApiTags} from "@nestjs/swagger";

@ApiTags('이벤트 상태 API')
@Controller('event-status')
export class EventStatusController {
  constructor(private readonly eventStatusService: EventStatusService) {}

  @ApiOperation({summary: '이벤트 상태 전체 목록 조회 API', description: '이벤트 상태 전체 목록 조회'})
  @ApiCreatedResponse({ description: '이벤트 상태 전체 목록', type: EventStatus })
  @Get('/listAll')
  getAllEventStatus(): Promise<EventStatus[]>{
    return this.eventStatusService.getAllEventStatus()
  }
}
