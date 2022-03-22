import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique} from "typeorm";
import {Location} from "../../locations/entities/location.entity";
import {Arrow} from "../../arrow/entities/arrow.entity";
import {ApiProperty} from "@nestjs/swagger";

@Entity()
@Unique(["location_id", "phase_number"])
export class Phase extends BaseEntity{
    @ApiProperty({example: '현시별 이동류 PK'})
    @PrimaryGeneratedColumn()
    phase_pk: number;

    @ApiProperty({example: 1, description: '교차로 ID'})
    @ManyToOne(
        // ()=>Group, group=>group.location
        type => Location, location => location.location_id, {
            onDelete: 'CASCADE'
        }
    )
    @JoinColumn({name: "location_id"})
    location_id: Location;

    @ApiProperty({example: '현시'})
    @Column()
    phase_number: number;

    @ApiProperty({example: 'A링 이동류 번호'})
    @ManyToOne(
        type => Arrow, arrow => arrow.arrow_id
    )
    @JoinColumn({name: "ringA"})
    ringA: Arrow;

    @ApiProperty({example: 'B링 이동류 번호'})
    @ManyToOne(
        type => Arrow, arrow => arrow.arrow_id
    )
    @JoinColumn({name: "ringB"})
    ringB: Arrow;

    @ApiProperty({example: '이동류 회전각'})
    @Column({default: 0})
    degree: number;
}
