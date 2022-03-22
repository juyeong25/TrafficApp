import { Module } from '@nestjs/common';
import { EventStatusService } from './event-status.service';
import { EventStatusController } from './event-status.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {EventStatusRepository} from "./event-status.repository";

@Module({
  imports: [TypeOrmModule.forFeature([EventStatusRepository])],
  controllers: [EventStatusController],
  providers: [EventStatusService]
})
export class EventStatusModule {}
