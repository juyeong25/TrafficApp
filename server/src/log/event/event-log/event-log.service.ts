import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {EventLogRepository} from "./event-log.repository";
import {EventLog} from "./entities/event-log.entity";

@Injectable()
export class EventLogService {
    constructor(
        @InjectRepository(EventLogRepository)
        private eventLogRepository: EventLogRepository
    ) {
    }

    getAllEventLogByDateAndId(startDate: number, endDate: number, locations: string[], event_codes: string[]): Promise<EventLog[]>{
        return this.eventLogRepository.getAllEventLogByDateAndId(startDate, endDate, locations, event_codes);
    }

    getAllEventLogToday():Promise<any[]>{
        return this.eventLogRepository.getAllEventLogToday()
    }
    getEventLogTodayByLimit(limit: number):Promise<any[]>{
        return this.eventLogRepository.getEventLogTodayByLimit(limit)
    }
}
