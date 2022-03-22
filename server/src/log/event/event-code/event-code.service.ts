import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {EventCodeRepository} from "./event-code.repository";
import {EventCode} from "./entities/event-code.entity";

@Injectable()
export class EventCodeService {
  constructor(
      @InjectRepository(EventCodeRepository)
      private eventCodeRepository: EventCodeRepository
  ) {
  }

  getAllEventCode(): Promise<EventCode[]>{
    return this.eventCodeRepository.find();
  }
}
