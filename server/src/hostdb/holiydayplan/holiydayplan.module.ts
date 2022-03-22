import { Module } from '@nestjs/common';
import { HoliydayplanService } from './holiydayplan.service';
import { HoliydayplanController } from './holiydayplan.controller';

@Module({
  controllers: [HoliydayplanController],
  providers: [HoliydayplanService]
})
export class HoliydayplanModule {}
