import { Module } from '@nestjs/common';
import { TodplanService } from './todplan.service';
import { TodplanController } from './todplan.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {TodplanRepository} from "./todplan.repository";

@Module({
  imports: [TypeOrmModule.forFeature([TodplanRepository])],
  controllers: [TodplanController],
  providers: [TodplanService]
})
export class TodplanModule {}
