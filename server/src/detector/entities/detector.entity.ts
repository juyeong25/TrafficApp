import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique} from "typeorm";
import {Location} from "../../locations/entities/location.entity";
import {ApiProperty} from "@nestjs/swagger";

@Entity()
@Unique(["location_id", "detector_channel"])
export class Detector extends BaseEntity{
    @ApiProperty({example: '검지기 PK'})
    @PrimaryGeneratedColumn()
    detector_no: number;

    @ApiProperty({example: '교차로 ID'})
    @ManyToOne(
        type => Location, location => location.location_id, {
            onDelete: 'CASCADE'
        }
    )
    @JoinColumn({name: "location_id"})
    location_id: Location;

    @ApiProperty({example: '검지기 채널'})
    @Column()
    detector_channel: number;

    @ApiProperty({example: '검지기 이름'})
    @Column()
    detector_name: string;

    @ApiProperty({example: '검지기 IP'})
    @Column({ unique: true })
    detector_ip: string;

    @ApiProperty({example: '카메라 IP'})
    @Column({ unique: true })
    detector_camera_ip: string;

    @ApiProperty({example: '검지기 VPN IP'})
    @Column({ unique: true })
    internal_nano_link: string;

    @ApiProperty({example: '카메라 VPN IP'})
    @Column({ unique: true })
    internal_camera_link: string;

    @ApiProperty({example: '검지기 서비스 IP'})
    @Column({ unique: true })
    external_nano_link: string;

    @ApiProperty({example: '카메라 서비스 IP'})
    @Column({ unique: true })
    external_camera_link: string;

    @ApiProperty({example: '검지기 경도'})
    @Column()
    camera_latitude: string;

    @ApiProperty({example: '검지기 위도'})
    @Column()
    camera_longitude: string;

    @ApiProperty({example: '검지기 회전각'})
    @Column()
    camera_angle: number;
}
