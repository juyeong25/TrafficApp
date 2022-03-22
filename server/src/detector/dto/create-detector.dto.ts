import {IsNotEmpty} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class CreateDetectorDto {
    @ApiProperty({example: '검지기 이름'})
    @IsNotEmpty()
    detector_name: string;

    @ApiProperty({example: '검지기 IP'})
    @IsNotEmpty()
    detector_ip: string;

    @ApiProperty({example: '카메라 IP'})
    @IsNotEmpty()
    detector_camera_ip: string;

    @ApiProperty({example: '검지기 VPN IP'})
    @IsNotEmpty()
    internal_nano_link: string;

    @ApiProperty({example: '카메라 VPN IP'})
    @IsNotEmpty()
    internal_camera_link: string;

    @ApiProperty({example: '검지기 서비스 IP'})
    @IsNotEmpty()
    external_nano_link: string;

    @ApiProperty({example: '카메라 서비스 IP'})
    @IsNotEmpty()
    external_camera_link: string;

    @ApiProperty({example: '검지기 경도'})
    @IsNotEmpty()
    camera_latitude: string;

    @ApiProperty({example: '검지기 위도'})
    @IsNotEmpty()
    camera_longitude: string;

    @ApiProperty({example: '검지기 회전각'})
    @IsNotEmpty()
    camera_angle: number;
}
