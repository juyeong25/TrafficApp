import { Module } from '@nestjs/common';
import { CycleLogService } from './cycle-log.service';
import { CycleLogController } from './cycle-log.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {CycleLogRepository} from "./cycle-log.repository";

@Module({
  imports: [
      TypeOrmModule.forFeature([CycleLogRepository])
  ],
  controllers: [CycleLogController],
  providers: [CycleLogService]
})
export class CycleLogModule {}
