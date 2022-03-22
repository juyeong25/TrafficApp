import { Injectable } from '@nestjs/common';
import { CreateDetectorDto } from './dto/create-detector.dto';
import { UpdateDetectorDto } from './dto/update-detector.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {DetectorRepository} from "./detector.repository";
import {Location} from "../locations/entities/location.entity";
import {Detector} from "./entities/detector.entity";
import {DeleteResult} from "typeorm";

@Injectable()
export class DetectorService {
    constructor(
        @InjectRepository(DetectorRepository)
        private detectorRepository: DetectorRepository,
    ) {
    }

    createDetectorById(location: Location, channel: number, createDetectorDto: CreateDetectorDto):Promise<string>{
        return this.detectorRepository.createDetectById(location, channel, createDetectorDto)
    }

    updateDetectorByIdAndPhase(location: Location, location_id: number, channel: number, updateDetectorDto: UpdateDetectorDto):Promise<string>{
        return this.detectorRepository.updateDetectorByIdAndPhase(location, location_id, channel, updateDetectorDto);
    }

    async getListDetectorByLocationId(location_id: number):Promise<Detector[]>{
        return this.detectorRepository.getListDetectorByLocationId(location_id);
    }

    async getDetectorByIdAndChannel(location_id: number, channel: number){
        return this.detectorRepository.findOne({
            where:{
                location_id: location_id,
                detector_channel: channel
            }
        })
    }

    async deleteDetectorByIdAndPhase(location_id: number, detector_channel: number):Promise<DeleteResult>{
        return this.detectorRepository.deleteDetectorByIdAndPhase(location_id, detector_channel);
    }
}
