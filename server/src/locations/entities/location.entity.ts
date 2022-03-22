import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Group} from "../../group/entities/group.entity";
import {ApiProperty} from "@nestjs/swagger";

@Entity()
export class Location extends BaseEntity{
    @ApiProperty({example: '교차로 아이디'})
    @PrimaryGeneratedColumn({})
    location_id: number;

    @ApiProperty({example: '교차로 이름'})
    @Column()
    location_name: string;

    @ApiProperty({example: '제어기 제조사'})
    @Column()
    location_mfr: string;

    @ApiProperty({example: '제어기 타입'})
    @Column()
    location_type: string;

    @ApiProperty({example: '교차로 경도'})
    @Column()
    location_long: string;

    @ApiProperty({example: '교차로 위도'})
    @Column()
    location_lat: string;

    @ApiProperty({example: Group})
    @ManyToOne(
        // ()=>Group, group=>group.location
        // type => Group, group => group.location
    type => Group, group => group.location
    )
    @JoinColumn({name: "location_group"})
    group: Group;

    @ApiProperty({example: '전 노드와의 거리'})
    @Column()
    location_distance: number;

    @ApiProperty({example: '라우터 아이피'})
    @Column()
    location_routerIp: string;

    @ApiProperty({example: '제어기 아이피'})
    @Column()
    location_lcIp: string;

    // @Column({nullable: true})
    // createAt: string | null;
}
