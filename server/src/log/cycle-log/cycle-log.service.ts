import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {CycleLogRepository} from "./cycle-log.repository";
import {CycleLog} from "./entities/cycle-log.entity";

@Injectable()
export class CycleLogService {
  constructor(
      @InjectRepository(CycleLogRepository)
      private cycleLogRepository: CycleLogRepository
  ) {
  }

    getAllCycleLogById(id: number, startDate: number, endDate: number):Promise<CycleLog[]>{
      return this.cycleLogRepository.getAllCycleLogById(id, startDate, endDate)
    }
}
