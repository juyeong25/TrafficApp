import { Module } from '@nestjs/common';
import { EventLogService } from './event-log.service';
import { EventLogController } from './event-log.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {EventLogRepository} from "./event-log.repository";

@Module({
  imports:[
      TypeOrmModule.forFeature([EventLogRepository])
  ],
  controllers: [EventLogController],
  providers: [EventLogService]
})
export class EventLogModule {}
