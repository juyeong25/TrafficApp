import {IsNotEmpty} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class CreateLocationDto {
    @ApiProperty({example: '교차로 이름'})
    @IsNotEmpty()
    location_name: string;

    @ApiProperty({example: '제어기 제조사'})
    @IsNotEmpty()
    location_mfr: string;

    @ApiProperty({example: '제어기 타입'})
    @IsNotEmpty()
    location_type: string;

    @ApiProperty({example: '교차로 경도'})
    @IsNotEmpty()
    location_long: string;

    @ApiProperty({example: '교차로 위도'})
    @IsNotEmpty()
    location_lat: string;

    @ApiProperty({example: '교차로 그룹 번호'})
    @IsNotEmpty()
    location_group: number;

    @ApiProperty({example: '전 노드와의 거리'})
    @IsNotEmpty()
    location_distance: number;

    @ApiProperty({example: '라우터 아이피'})
    @IsNotEmpty()
    location_routerIp: string;

    @ApiProperty({example: '제어기 아이피'})
    @IsNotEmpty()
    location_lcIp: string;
}
