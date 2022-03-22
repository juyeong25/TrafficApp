import {Injectable} from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {Locationsrepository} from "./locationsrepository";
import {Location} from "./entities/location.entity";
import {Group} from "../group/entities/group.entity";
import {DeleteResult} from "typeorm";

@Injectable()
export class LocationsService {
  constructor(
      @InjectRepository(Locationsrepository)
      private locationRepository: Locationsrepository,
  ) {
  }

  create(createLocationDto: CreateLocationDto, group:Group):Promise<Location> {
    return this.locationRepository.createLocation(createLocationDto, group);
  }

  getAllLocations(): Promise<Location[]>{
    return this.locationRepository.find({order: {location_id: "ASC"}, relations: ['group']})
  }

  getLocationById(id: number): Promise<Location>{
    return this.locationRepository.getLocationById(id);
  }

  updateLocation(id: number, updateLocationDto: UpdateLocationDto, group: Group):Promise<Location>{
    return this.locationRepository.updateLocation(id, updateLocationDto, group);
  }

  deleteLocationById(location_id: number):Promise<DeleteResult>{
    return this.locationRepository.deleteLocationById(location_id);
  }
}
