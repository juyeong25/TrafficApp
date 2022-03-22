import { Controller, Get} from '@nestjs/common';
import { EventCodeService } from './event-code.service';
import {EventCode} from "./entities/event-code.entity";
import {ApiCreatedResponse, ApiOperation, ApiTags} from "@nestjs/swagger";

@ApiTags('이벤트 코드 API')
@Controller('event-code')
export class EventCodeController {
  constructor(private readonly eventCodeService: EventCodeService) {}

  @ApiOperation({ summary: '전체 이벤트 코드 조회 API', description: '전체 이벤트 코드 조회' })
  @ApiCreatedResponse({ description: '전체 이벤트 코드 조회', type: EventCode })
  @Get('/listAll')
  getAllEventCode(): Promise<EventCode[]>{
    return this.eventCodeService.getAllEventCode()
  }
}
