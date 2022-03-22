import {DeleteResult, EntityRepository, Repository} from "typeorm";
import {Phase} from "./entities/phase.entity";
import {CreatePhaseDto} from "./dto/create-phase.dto";
import {Location} from "../locations/entities/location.entity";
import {Arrow} from "../arrow/entities/arrow.entity";
import {ConflictException} from "@nestjs/common";
import {UpdatePhaseDto} from "./dto/update-phase.dto";

@EntityRepository(Phase)
export class PhaseRepository extends Repository<Phase> {
    async createPhase(
        createPhaseDto: CreatePhaseDto, location: Location, ringA: Arrow, ringB: Arrow
    ): Promise<string>{
        const phase = this.create({
            location_id: location,
            phase_number: createPhaseDto.phase_number,
            ringA: ringA,
            ringB: ringB,
            degree: createPhaseDto.degree
        });
        try {
            await this.save(phase)
            return 'success create Phase'
        }catch (err) {
            if (err.code === '23505') {
                console.log(err.detail)
                throw new ConflictException(err.detail);
            }
        }
    }

    async readPhasesByLocationId(location_id: number): Promise<Phase[]>{
        return this.find({
            where:{location_id: location_id},
            order: {phase_number: "ASC"},
            relations: ['ringA','ringB'],
        })
    }

    async readPhase(location_id: number, phase_number: number): Promise<Phase>{
        return this.findOne({where:{location_id: location_id, phase_number: phase_number}})
    }

    async updatePhase(
        phase: Phase, updatePhaseDto: UpdatePhaseDto, location: Location, ringA: Arrow, ringB: Arrow
    ): Promise<string>{
        phase.location_id = location;
        phase.phase_number = updatePhaseDto.phase_number;
        phase.ringA = ringA;
        phase.ringB = ringB;
        phase.degree = updatePhaseDto.degree;

        try {
            await this.save(phase);
            return 'success update Phase'
        }catch (err) {
            if (err.code === '23505') throw new ConflictException(err.detail);
        }
    }

    async deletePhase(location_id: number, phase_number: number): Promise<DeleteResult>{
        return this.createQueryBuilder()
            .delete()
            .from(Phase)
            .where('location_id = :location_id', {location_id : location_id})
            .andWhere('phase_number = :phase_number', {phase_number : phase_number})
            .execute();
    }
}