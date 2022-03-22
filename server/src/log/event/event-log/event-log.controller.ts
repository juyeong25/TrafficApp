import {
    Controller,
    Get,
    Param,
    UsePipes,
    ParseIntPipe,
    Query,
    BadRequestException, ValidationPipe
} from '@nestjs/common';
import {EventLogService} from './event-log.service';
import {EventLog} from "./entities/event-log.entity";
import {ApiCreatedResponse, ApiOperation, ApiTags} from "@nestjs/swagger";
import {ApiImplicitParam} from "@nestjs/swagger/dist/decorators/api-implicit-param.decorator";
import {ApiImplicitQuery} from "@nestjs/swagger/dist/decorators/api-implicit-query.decorator";

@Controller('event-log')
@ApiTags('이벤트 로그 API')
export class EventLogController {
    constructor(private readonly eventLogService: EventLogService) {
    }

    @Get('/:startDate/:endDate/locations/listAll')
    @ApiOperation({summary: '이벤트 로그 조회 API', description: '이벤트 로그 조회'})
    @ApiImplicitParam({name: 'startDate', required: true, type: Number, description: '시작날짜 (YYYYMMDD)'})
    @ApiImplicitParam({name: 'endDate', required: true, type: Number, description: '종료날짜 (YYYYMMDD)'})
    @ApiImplicitQuery({name: 'location_id', required: true, type: String, description: '교차로 ID (ex : 1,3)'})
    @ApiImplicitQuery({
        name: 'event_code',
        required: false,
        type: String,
        description: '이벤트 코드 (ex : 1,3 or 생략 시 전체 조회)'
    })
    @UsePipes()
    getAllEventLogByDateAndId(
        @Param('startDate', ParseIntPipe) startDate: number,
        @Param('endDate', ParseIntPipe) endDate: number,
        @Query('location_id') location_id: string,
        @Query('event_code') event_code: string
    ): Promise<EventLog[]> {
        if (location_id == undefined || location_id == "") {
            throw new BadRequestException('[BadRequestException] location_id cannot be NULL')
        } else {
            let event_codes
            if (event_code == undefined || event_code == "") {
                event_codes = [];
            } else {
                event_codes = (event_code.split(','));
            }

            const locations = (location_id.split(','));

            return this.eventLogService.getAllEventLogByDateAndId(startDate, endDate, locations, event_codes);
        }
    }

    @Get('/today/ranking')
    @ApiOperation({summary: '이벤트 로그 일일 Top 5 조회 API', description: '이벤트 로그 일일 Top 5 조회'})
    @ApiCreatedResponse({description: '이벤트 로그 일일 Top 5 조회'})
    getAllEventLogToday(): Promise<any[]> {
        return this.eventLogService.getAllEventLogToday();
    }

    @Get('/console/logger/:limit')
    @UsePipes(ValidationPipe)
    @ApiOperation({summary: '금일 이벤트 로그 조회 API', description: '금일 이벤트 로그 조회'})
    @ApiCreatedResponse({description: '금일 이벤트 로그 조회'})
    @ApiImplicitParam({name: 'limit', required: true, type: Number, description: '검색 최대 개수'})
    getEventLogTodayByLimit(
        @Param('limit', ParseIntPipe) limit: number
    ) {
        return this.eventLogService.getEventLogTodayByLimit(limit);
    }
}
