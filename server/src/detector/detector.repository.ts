import {DeleteResult, EntityRepository, Repository} from "typeorm";
import {Detector} from "./entities/detector.entity";
import {Location} from "../locations/entities/location.entity";
import {CreateDetectorDto} from "./dto/create-detector.dto";
import {ConflictException} from "@nestjs/common";
import {UpdateDetectorDto} from "./dto/update-detector.dto";

@EntityRepository(Detector)
export class DetectorRepository extends Repository<Detector>{

    async createDetectById(location: Location, channel: number, createDetectorDto: CreateDetectorDto):Promise<string>{
        const { detector_name, detector_ip, detector_camera_ip, internal_nano_link, internal_camera_link,
                external_nano_link, external_camera_link, camera_latitude, camera_longitude, camera_angle } = createDetectorDto
        const newDetector = this.create({ location_id: location, detector_channel: channel, detector_name, detector_ip, detector_camera_ip,
            internal_nano_link, internal_camera_link, external_nano_link, external_camera_link, camera_latitude, camera_longitude, camera_angle })
        try {
            await this.save(newDetector)
            return 'success create Detector'
        }catch (err) {
            if (err.code === '23505') throw new ConflictException(err.detail);
        }
    }

    async updateDetectorByIdAndPhase(location: Location, location_id:number, channel: number, updateDetectorDto: UpdateDetectorDto):Promise<string>{
        try {
            const detector = await this.findOne({
                where: {
                    location_id: location_id,
                    detector_channel: channel
                }
            })
            detector.detector_channel = updateDetectorDto.detector_channel
            detector.detector_name = updateDetectorDto.detector_name
            detector.detector_ip = updateDetectorDto.detector_ip
            detector.detector_camera_ip = updateDetectorDto.detector_camera_ip
            detector.internal_nano_link = updateDetectorDto.internal_nano_link
            detector.internal_camera_link = updateDetectorDto.internal_camera_link
            detector.external_nano_link = updateDetectorDto.external_nano_link
            detector.external_camera_link = updateDetectorDto.external_camera_link
            detector.camera_latitude = updateDetectorDto.camera_latitude
            detector.camera_longitude = updateDetectorDto.camera_longitude
            detector.camera_angle = updateDetectorDto.camera_angle
            detector.location_id = location

            try {
                await this.save(detector)
                return 'success update Detector'
            }catch (err) {
                if (err.code === '23505') {
                    console.log(err.detail)
                    throw new ConflictException(err.detail)
                }
            }

        }catch (e){
            throw e
        }
    }

    async getListDetectorByLocationId(location_id: number):Promise<Detector[]>{
        return await this.find({
            where:{
                location_id: location_id
            },
            order: { detector_channel: 'ASC' }
        })
    }

    async deleteDetectorByIdAndPhase(location_id: number, detector_channel: number):Promise<DeleteResult>{
        return this.createQueryBuilder()
            .delete()
            .from(Detector)
            .where('location_id = :location_id', {location_id : location_id})
            .andWhere('detector_channel = :detector_channel', {detector_channel : detector_channel})
            .execute();
    }
}