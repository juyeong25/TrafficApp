import { Module } from '@nestjs/common';
import { WeekplanService } from './weekplan.service';
import { WeekplanController } from './weekplan.controller';

@Module({
  controllers: [WeekplanController],
  providers: [WeekplanService]
})
export class WeekplanModule {}
