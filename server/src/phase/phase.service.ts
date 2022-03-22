import { Injectable } from '@nestjs/common';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {PhaseRepository} from "./phase.repository";
import {Location} from "../locations/entities/location.entity";
import {Arrow} from "../arrow/entities/arrow.entity";
import {Phase} from "./entities/phase.entity";
import {DeleteResult} from "typeorm";

@Injectable()
export class PhaseService {
  constructor(
      @InjectRepository(PhaseRepository)
      private phaseRepository: PhaseRepository
  ) {
  }

  createPhase(
      createPhaseDto: CreatePhaseDto, location: Location, ringA: Arrow, ringB: Arrow
  ): Promise<string>{
    return this.phaseRepository.createPhase(createPhaseDto, location, ringA, ringB)
  }

  readPhasesByLocationId(location_id: number): Promise<Phase[]>{
    return this.phaseRepository.readPhasesByLocationId(location_id)
  }

  readPhase(location_id: number, phase_number: number): Promise<Phase>{
    return this.phaseRepository.readPhase(location_id, phase_number)
  }

  updatePhase(
      phase: Phase, updatePhaseDto: UpdatePhaseDto, location: Location, ringA: Arrow, ringB: Arrow
  ): Promise<string>{
    return this.phaseRepository.updatePhase(phase, updatePhaseDto, location, ringA, ringB)
  }

  async deletePhase(location_id: number, phase_number: number): Promise<DeleteResult>{
    return this.phaseRepository.deletePhase(location_id, phase_number);
  }
}
