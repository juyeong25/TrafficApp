import {IsNotEmpty} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class CreatePhaseDto {
    @ApiProperty({example: 1, description: '교차로 ID'})
    @IsNotEmpty()
    location_id: number;

    @ApiProperty({example: 1, description: '현시'})
    @IsNotEmpty()
    phase_number: number;

    @ApiProperty({example: 1, description: 'A링 이동류 번호'})
    @IsNotEmpty()
    ringA: number;

    @ApiProperty({example: 1, description: 'B링 이동류 번호'})
    @IsNotEmpty()
    ringB: number;

    @ApiProperty({example: -90, description: '이동류 회전각'})
    @IsNotEmpty()
    degree: number;
}
