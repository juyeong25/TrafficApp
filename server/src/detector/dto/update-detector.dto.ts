import {ApiProperty, PartialType} from '@nestjs/swagger';
import { CreateDetectorDto } from './create-detector.dto';
import {IsNotEmpty} from "class-validator";

export class UpdateDetectorDto extends PartialType(CreateDetectorDto) {
    @ApiProperty({example: '교차로 ID 업데이트 값'})
    @IsNotEmpty()
    location_id: number;

    @ApiProperty({example: '검지기 채널 업데이트 값'})
    @IsNotEmpty()
    detector_channel: number;
}
