import { Module } from '@nestjs/common';
import { EventCodeService } from './event-code.service';
import { EventCodeController } from './event-code.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {EventCodeRepository} from "./event-code.repository";

@Module({
  imports:[
      TypeOrmModule.forFeature([EventCodeRepository])
  ],
  controllers: [EventCodeController],
  providers: [EventCodeService]
})
export class EventCodeModule {}
