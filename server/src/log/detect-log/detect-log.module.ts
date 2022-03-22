import { Module } from '@nestjs/common';
import { DetectLogService } from './detect-log.service';
import { DetectLogController } from './detect-log.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {DetectLogRepository} from "./detect-log.repository";

@Module({
  imports:[
      TypeOrmModule.forFeature([DetectLogRepository])
  ],
  controllers: [DetectLogController],
  providers: [DetectLogService]
})
export class DetectLogModule {}
