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
import { DetectorService } from './detector.service';
import { CreateDetectorDto } from './dto/create-detector.dto';
import { UpdateDetectorDto } from './dto/update-detector.dto';
import {LocationsService} from "../locations/locations.service";
import {Detector} from "./entities/detector.entity";
import {ApiBody, ApiCreatedResponse, ApiOperation, ApiTags} from "@nestjs/swagger";
import {ApiImplicitParam} from "@nestjs/swagger/dist/decorators/api-implicit-param.decorator";
import {DeleteResult} from "typeorm";

@Controller('detector')
@ApiTags('검지기 API')
export class DetectorController {
  constructor(
      private readonly detectorService: DetectorService,
      private readonly locationService: LocationsService
  ) {}

  @ApiOperation({ summary: '교차로별 검지기 조회 API', description: '교차로별 검지기 조회' })
  @ApiImplicitParam({ name: 'location_id', required: true, type: Number, description: '교차로 ID' })
  @Get('/getList/location/:location_id')
  @UsePipes(ValidationPipe)
  getListByLocationId(
      @Param('location_id', ParseIntPipe)location_id: number
  ): Promise<Detector[]>{
    return this.detectorService.getListDetectorByLocationId(location_id);
  }

  @ApiOperation({ summary: '교차로 & 검지기 채널 검지기 조회 API', description: '교차로 & 검지기 채널 검지기 조회' })
  @ApiImplicitParam({ name: 'location_id', required: true, type: Number, description: '교차로 ID' })
  @ApiImplicitParam({ name: 'channel', required: true, type: Number, description: '검지기 채널 번호' })
  @Get('/getOne/location/:location_id/channel/:channel')
  @UsePipes(ValidationPipe)
  getDetectorByIdAndChannel(
      @Param('location_id', ParseIntPipe)location_id: number,
      @Param('channel', ParseIntPipe)channel: number,
  ){
    return this.detectorService.getDetectorByIdAndChannel(location_id, channel)
  }

  @ApiOperation({ summary: '검지기 생성 API', description: '검지기 생성' })
  @ApiBody({description: '요청 Json 형식', type: CreateDetectorDto})
  @ApiCreatedResponse({description: '성공시 String 반환', type: String,})
  @Post('/create/location/:location_id/channel/:channel')
  @UsePipes(ValidationPipe)
  async createDetectorById(
      @Body() createDetectorDto: CreateDetectorDto,
      @Param('location_id', ParseIntPipe) location_id: number,
      @Param('channel', ParseIntPipe) channel: number
  ): Promise<string>{
    // 검지기 있는지 검색 { where => location_id }
    const location = await this.locationService.getLocationById(location_id)
    if (!location) throw new NotFoundException(`Can't find Location with id ${location_id}`);

    else return this.detectorService.createDetectorById(location, channel, createDetectorDto);
  }


  @ApiOperation({summary: '검지기 수정 API', description: '검지기 수정'})
  @ApiImplicitParam({ name: 'location_id', required: true, type: Number, description: '수정 할 교차로 ID' })
  @ApiImplicitParam({ name: 'channel', required: true, type: Number, description: '수정 할 검지기 채널 번호' })
  @ApiBody({description: '요청 Json 형식', type: UpdateDetectorDto})
  @ApiCreatedResponse({ description: '성공시 String 반환', type: String})
  @Patch('/update/location/:location_id/channel/:channel')
  @UsePipes(ValidationPipe)
  async updateDetectorByIdAndPhase(
      @Body() updateDetectorDto: UpdateDetectorDto,
      @Param('location_id', ParseIntPipe) location_id: number,
      @Param('channel', ParseIntPipe) channel: number
  ): Promise<string>{
    // 검지기 있는지 검색 { where => location_id, channel}
    const isDetector = this.getDetectorByIdAndChannel(location_id, channel)
    if (!isDetector) throw new NotFoundException(`Can't find Detector with location_id ${location_id} and channel ${channel}`);
    // DTO에 담긴 location_id 있는지 검색 { where => updateDetectorDto.location_id}
    const location = await this.locationService.getLocationById(updateDetectorDto.location_id)
    if (!location) throw new NotFoundException(`Can't find to update Location with id ${updateDetectorDto.location_id}`);
    // 둘다 있다면 Update Logic 실행

    return this.detectorService.updateDetectorByIdAndPhase(location, location_id, channel, updateDetectorDto)
  }


  @ApiOperation({summary: '검지기 삭제 API', description: '검지기 삭제'})
  @ApiImplicitParam({ name: 'location_id', required: true, type: Number, description: '수정 할 교차로 ID' })
  @ApiImplicitParam({ name: 'channel', required: true, type: Number, description: '수정 할 검지기 채널 번호' })
  @ApiCreatedResponse({description: 'DeleteResult 반환', type: DeleteResult})
  @Delete('/delete/location/:location_id/channel/:channel')
  async deleteDetectorByIdAndPhase(
      @Param('location_id', ParseIntPipe) location_id: number,
      @Param('channel', ParseIntPipe) channel: number
  ):Promise<DeleteResult>{
    const rs = await this.detectorService.deleteDetectorByIdAndPhase(location_id, channel);
    console.log(rs)
    return rs
  }

}
