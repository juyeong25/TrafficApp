import { Module } from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import typeormConfig  from "./config/typeorm.config";
import { LocationsModule } from './locations/locations.module';
import { GroupModule } from './group/group.module';
import { EventCodeModule } from './log/event/event-code/event-code.module';
import { EventStatusModule } from './log/event/event-status/event-status.module';
import { EventLogModule } from './log/event/event-log/event-log.module';
import { CycleLogModule } from './log/cycle-log/cycle-log.module';
import { DetectLogModule } from './log/detect-log/detect-log.module';
import { DetectorModule } from './detector/detector.module';
import { UserModule } from './user/user.module';
import { ArrowModule } from './arrow/arrow.module';
import { PhaseModule } from './phase/phase.module';
import { TodplanModule } from './hostdb/todplan/todplan.module';
import { HoliydayplanModule } from './hostdb/holiydayplan/holiydayplan.module';
import { WeekplanModule } from './hostdb/weekplan/weekplan.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormConfig),
    LocationsModule,
    GroupModule,
    EventCodeModule,
    EventStatusModule,
    EventLogModule,
    CycleLogModule,
    DetectLogModule,
    DetectorModule,
    UserModule,
    ArrowModule,
    PhaseModule,
    TodplanModule,
    HoliydayplanModule,
    WeekplanModule,
  ],

})
export class AppModule {}
