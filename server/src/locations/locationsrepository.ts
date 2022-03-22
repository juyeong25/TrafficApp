import {DeleteResult, EntityRepository, Repository} from "typeorm";
import {Location} from "./entities/location.entity";
import {CreateLocationDto} from "./dto/create-location.dto";
import {Group} from "../group/entities/group.entity";
import {UpdateLocationDto} from "./dto/update-location.dto";
import {NotFoundException} from "@nestjs/common";


@EntityRepository(Location)
export class Locationsrepository extends Repository<Location> {
    async createLocation(createLocationDto: CreateLocationDto, group: Group): Promise<Location>{

        const {location_name, location_type, location_mfr, location_long, location_lat, location_distance, location_routerIp, location_lcIp} = createLocationDto
        const location = this.create({
            location_name, location_type, location_mfr, location_long, location_lat, location_distance, location_routerIp, location_lcIp, group
        });
        await this.save(location)
        return location;
    }

    async getLocationById(id: number):Promise<Location>{
        const location = await this.findOne(id, {
            relations: ['group']
        });

        if (!location) throw new NotFoundException(`Can't find Location with id ${id}`);

        return location
    }

    async updateLocation(id:number, updateLocationDto: UpdateLocationDto, group:Group): Promise<Location>{
        const location = await this.getLocationById(id);

        location.location_name = updateLocationDto.location_name;
        location.location_mfr = updateLocationDto.location_mfr;
        location.location_type = updateLocationDto.location_type;
        location.location_long = updateLocationDto.location_long;
        location.location_lat = updateLocationDto.location_lat;
        location.location_distance = updateLocationDto.location_distance;
        location.location_routerIp = updateLocationDto.location_routerIp;
        location.location_lcIp = updateLocationDto.location_lcIp;
        location.group = group

        await this.save(location)
        return location
    }

    async deleteLocationById(location_id: number):Promise<DeleteResult>{
        return this.createQueryBuilder()
            .delete()
            .from(Location)
            .where('location_id = :location_id', {location_id : location_id})
            .execute()
    }
}