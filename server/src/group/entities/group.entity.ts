import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Location} from "../../locations/entities/location.entity";
import {ApiProperty} from "@nestjs/swagger";

@Entity()
export class Group {
    @ApiProperty({example: '그룹 아이디'})
    @PrimaryGeneratedColumn()
    group_id: number;

    @ApiProperty({example: '그룹 이름'})
    @Column()
    group_name: string;

    @ApiProperty({example: '그룹 메모'})
    @Column()
    group_comment: string;

    @ApiProperty({example: '그룹 경도'})
    @Column()
    group_long: string;

    @ApiProperty({example: '그룹 위도'})
    @Column()
    group_lat: string;

    @ApiProperty({example: '그룹 줌 레벨'})
    @Column({ default : 10 })
    group_zoom: number;

    @ApiProperty({example: '소속 교차로 배열'})
    @OneToMany(() => Location, location => location.group)
    location: Location[];
}
