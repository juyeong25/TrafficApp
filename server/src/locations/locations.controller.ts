import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  ParseIntPipe, NotFoundException
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import {Location} from "./entities/location.entity";
import {GroupService} from "../group/group.service";
import {ApiTags, ApiOperation, ApiCreatedResponse, ApiBody} from '@nestjs/swagger';
import {DeleteResult} from "typeorm";


@Controller('locations')
@ApiTags('교차로 API')
export class LocationsController {
  constructor(
      private readonly locationsService: LocationsService,
      private readonly groupService: GroupService
  ) {}

  @Post('/create')
  @ApiOperation({ summary: '교차로 생성 API', description: '교차로 생성' })
  @ApiBody({description: '요청 Json 형식', type: CreateLocationDto})
  @ApiCreatedResponse({ description: '생성된 교차로 반환', type: Location })
  @UsePipes(ValidationPipe)
  async create(
      @Body() createLocationDto: CreateLocationDto
  ): Promise<Location> {
    const group = await this.groupService.getGroupById(createLocationDto.location_group)
    if (!group) throw new NotFoundException()
    else return this.locationsService.create(createLocationDto, group);

  }


  @Get('/listAll')
  @ApiOperation({ summary: '전체 교차로 조회 API', description: '전체 교차로 조회' })
  @ApiCreatedResponse({ description: '전체 교차로 리스트', type: Location })
  findAll():Promise<Location[]> {
    return this.locationsService.getAllLocations();
  }

  @Patch('/update/:id')
  @ApiOperation({ summary: '교차로 업데이트 API', description: '교차로 업데이트' })
  @ApiBody({description: '클라이언트 -> 서버로 보내는 유저 데이터 형식', type: CreateLocationDto})
  @ApiCreatedResponse({ description: '수정된 교차로', type: Location })
  @UsePipes(ValidationPipe)
  async updateLocationById(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateLocationDtd: UpdateLocationDto
  ): Promise<Location>{
    const group = await this.groupService.getGroupById(updateLocationDtd.location_group)
    return this.locationsService.updateLocation(id, updateLocationDtd, group);
  }

  @Get('/read/:id/')
  @ApiOperation({ summary: '교차로 조회 API', description: '교차로 조회' })
  @ApiCreatedResponse({ description: '교차로 정보', type: Location })
  getLocationById(
      @Param('id', ParseIntPipe)id: number
  ){
    return this.locationsService.getLocationById(id)
  }

  @Delete('/delete/:id')
  @ApiOperation({ summary: '교차로 삭제 API', description: '교차로 삭제' })
  @ApiCreatedResponse({ description: 'DeleteResult (삭제 결과)', type: DeleteResult })
  deleteLocationById(
      @Param('id', ParseIntPipe)id: number
  ): Promise<DeleteResult>{
    return this.locationsService.deleteLocationById(id);
  }
}
