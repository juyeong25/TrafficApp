import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {DetectLogRepository} from "./detect-log.repository";
import {DetectLog} from "./entities/detect-log.entity";

@Injectable()
export class DetectLogService {
  constructor(
      @InjectRepository(DetectLogRepository)
      private detectLogRepository: DetectLogRepository
  ) {
  }

  getAllDetectLogById(id: number, startDate: number, endDate: number): Promise<DetectLog[]>{
    return this.detectLogRepository.getAllDetectLogById(id, startDate, endDate)
  }

}
