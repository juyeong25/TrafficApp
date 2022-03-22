import { Module } from '@nestjs/common';
import { DetectorService } from './detector.service';
import { DetectorController } from './detector.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {DetectorRepository} from "./detector.repository";
import {LocationsModule} from "../locations/locations.module";

@Module({
  imports:[
      TypeOrmModule.forFeature([DetectorRepository]),
      LocationsModule
  ],
  controllers: [DetectorController],
  providers: [DetectorService]
})
export class DetectorModule {}
