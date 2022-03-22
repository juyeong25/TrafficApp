import { Module } from '@nestjs/common';
import { PhaseService } from './phase.service';
import { PhaseController } from './phase.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {PhaseRepository} from "./phase.repository";
import {LocationsModule} from "../locations/locations.module";
import {ArrowModule} from "../arrow/arrow.module";

@Module({
  imports: [
      TypeOrmModule.forFeature([PhaseRepository]),
      LocationsModule,
      ArrowModule
  ],
  controllers: [PhaseController],
  providers: [PhaseService]
})
export class PhaseModule {}