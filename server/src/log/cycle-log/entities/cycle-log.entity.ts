import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Location} from "../../../locations/entities/location.entity";

@Entity()
export class CycleLog extends BaseEntity{
    @PrimaryGeneratedColumn()
    log_no: number;

    @Column()
    log_time: string;

    @ManyToOne(
        type => Location, location => location.location_id,{
            onDelete: 'CASCADE'
        }
    )
    @JoinColumn({name: "location_id"})
    location_id: Location;

    @Column()
    cycle: number;

    @Column()
    offset_value: number;

    @Column()
    split_1: number;

    @Column()
    split_2: number;

    @Column()
    split_3: number;

    @Column()
    split_4: number;

    @Column()
    split_5: number;

    @Column()
    split_6: number;

    @Column()
    split_7: number;

    @Column()
    split_8: number;

    @Column()
    ped_1: number;

    @Column()
    ped_2: number;

    @Column()
    ped_3: number;

    @Column()
    ped_4: number;

    @Column()
    ped_5: number;

    @Column()
    ped_6: number;

    @Column()
    ped_7: number;

    @Column()
    ped_8: number;
}
