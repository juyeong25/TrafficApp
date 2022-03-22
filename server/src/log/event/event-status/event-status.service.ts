import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {EventStatus} from "./entities/event-status.entity";
import {EventStatusRepository} from "./event-status.repository";

@Injectable()
export class EventStatusService {
  constructor(
      @InjectRepository(EventStatusRepository)
      private eventStatusRepository: EventStatusRepository
  ) {
  }

  getAllEventStatus(): Promise<EventStatus[]>{
      return this.eventStatusRepository.find()
  }
}
