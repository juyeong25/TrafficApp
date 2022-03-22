import {IsNotEmpty} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class CreateGroupDto {

    @ApiProperty({example: '그룹 이름'})
    @IsNotEmpty()
    group_name: string;

    @ApiProperty({example: '그룹 메모'})
    @IsNotEmpty()
    group_comment: string;

    @ApiProperty({example: '그룹 경도'})
    @IsNotEmpty()
    group_long: string;

    @ApiProperty({example: '그룹 위도'})
    @IsNotEmpty()
    group_lat: string;

    @ApiProperty({example: '그룹 줌 레벨'})
    @IsNotEmpty()
    group_zoom: number;
}
