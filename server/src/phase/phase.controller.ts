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
  NotFoundException, ParseIntPipe
} from '@nestjs/common';
import { PhaseService } from './phase.service';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';
import {Phase} from "./entities/phase.entity";
import {LocationsService} from "../locations/locations.service";
import {ArrowService} from "../arrow/arrow.service";
import {ApiBody, ApiCreatedResponse, ApiOperation, ApiTags} from "@nestjs/swagger";
import {ApiImplicitParam} from "@nestjs/swagger/dist/decorators/api-implicit-param.decorator";
import {DeleteResult} from "typeorm";

@Controller('phase')
@ApiTags('현시별 이동류 API')
export class PhaseController {
  constructor(
      private readonly phaseService: PhaseService,
      private readonly locationService: LocationsService,
      private readonly arrowService: ArrowService
  ) {}

  @ApiOperation({ summary: '이동류 생성 API', description: '이동류 생성' })
  @ApiBody({description: '요청 Json 형식', type: CreatePhaseDto})
  @ApiCreatedResponse({ description: '성공 메시지: String', type: String})
  @Post('/create')
  @UsePipes(ValidationPipe)
  async createPhase(
      @Body() createPhaseDto: CreatePhaseDto,
  ): Promise<String>{
    // DTO 해당 교차로 ID의 존재 유무 & 이동류 번호 검증
    const location = await this.locationService.getLocationById(createPhaseDto.location_id);
    const ringA = await this.arrowService.arrowGetOneById(createPhaseDto.ringA)
    const ringB = await this.arrowService.arrowGetOneById(createPhaseDto.ringB)
    if (!location) throw new NotFoundException(`Can't find Location with id ${createPhaseDto.location_id}`);
    if (!ringA) throw new NotFoundException(`Can't find ringA with id ${createPhaseDto.ringA}`);
    if (!ringB) throw new NotFoundException(`Can't find ringB with id ${createPhaseDto.ringB}`);

    return this.phaseService.createPhase(createPhaseDto, location, ringA, ringB)
  }


  @ApiOperation({ summary: '이동류 조회 API', description: '이동류 조회' })
  @ApiImplicitParam({ name: 'location_id', required: true, type: Number, description: '교차로 ID' })
  @ApiCreatedResponse({description: '성공시 Phase[] 반환', type: Phase})
  @Get('/read/phases/location/:location_id')
  readPhasesByLocationId(
      @Param('location_id', ParseIntPipe)location_id: number
  ): Promise<Phase[]>{
    return this.phaseService.readPhasesByLocationId(location_id)
  }

  @ApiOperation({ summary: '이동류 조회 API', description: '이동류 조회'})
  @ApiImplicitParam({name: 'location_id', required: true, type: Number, description: '교차로 ID'})
  @ApiImplicitParam({name: 'phase_number', required: true, type: Number, description: '현시 번호'})
  @ApiCreatedResponse({description: 'Phase 반환', type: Phase})
  @Get('/read/phase/:phase_number/location/:location_id')
  readPhase(
      @Param('phase_number', ParseIntPipe)phase_number: number,
      @Param('location_id', ParseIntPipe)location_id: number,
  ): Promise<Phase>{
    return this.phaseService.readPhase(location_id, phase_number)
  }


  @ApiOperation({ summary: '이동류 수정 API', description: '이동류 수정' })
  @ApiImplicitParam({ name: 'phase_number', required: true, type: Number, description: '현시' })
  @ApiImplicitParam({ name: 'location_id', required: true, type: Number, description: '교차로 ID' })
  @ApiBody({description: '요청 Json 형식', type: UpdatePhaseDto})
  @ApiCreatedResponse({ description: '성공 메시지: String', type: String})
  @Patch('/update/phase/:phase_number/location/:location_id')
  @UsePipes(ValidationPipe)
  async updatePhase(
      @Body() updatePhaseDto: UpdatePhaseDto,
      @Param('phase_number', ParseIntPipe)phase_number: number,
      @Param('location_id', ParseIntPipe)location_id: number,
  ): Promise<string>{
    // :phase_number :location_id 으로 수정 할 페이즈가 있는지 검색
    const qs = await this.phaseService.readPhase(location_id, phase_number);
    if (!qs) throw new NotFoundException(`Can't find Phase with id ${location_id} & phase ${phase_number}`);

    // updatePhaseDto의 Location_id, RingA,B의 값이 DB에 있는지 검색
    const location = await this.locationService.getLocationById(updatePhaseDto.location_id);
    const ringA = await this.arrowService.arrowGetOneById(updatePhaseDto.ringA)
    const ringB = await this.arrowService.arrowGetOneById(updatePhaseDto.ringB)
    if (!location) throw new NotFoundException(`Can't find Location with id ${updatePhaseDto.location_id}`);
    if (!ringA) throw new NotFoundException(`Can't find ringA with id ${updatePhaseDto.ringA}`);
    if (!ringB) throw new NotFoundException(`Can't find ringB with id ${updatePhaseDto.ringB}`);


    return this.phaseService.updatePhase(qs, updatePhaseDto, location, ringA, ringB)
  }

  @ApiOperation({ summary: '이동류 삭제 API', description: '이동류 삭제' })
  @ApiImplicitParam({ name: 'phase_number', required: true, type: Number, description: '현시' })
  @ApiImplicitParam({ name: 'location_id', required: true, type: Number, description: '교차로 ID' })
  @ApiCreatedResponse({ description: 'DeleteResult (영향 받은 row)', type: DeleteResult})
  @Delete('/delete/phase/:phase_number/location/:location_id')
  async deletePhase(
      @Param('phase_number', ParseIntPipe)phase_number: number,
      @Param('location_id', ParseIntPipe)location_id: number,
  ): Promise<DeleteResult>{
    return this.phaseService.deletePhase(location_id, phase_number);
  }
}
