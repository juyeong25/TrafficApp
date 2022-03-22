import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Location} from "../../../locations/entities/location.entity";

@Entity()
export class DetectLog extends BaseEntity{
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
    vol_1: number;

    @Column()
    occ_1: number;

    @Column()
    vol_2: number;

    @Column()
    occ_2: number;

    @Column()
    vol_3: number;

    @Column()
    occ_3: number;

    @Column()
    vol_4: number;

    @Column()
    occ_4: number;

    @Column()
    vol_5: number;

    @Column()
    occ_5: number;

    @Column()
    vol_6: number;

    @Column()
    occ_6: number;

    @Column()
    vol_7: number;

    @Column()
    occ_7: number;

    @Column()
    vol_8: number;

    @Column()
    occ_8: number;
}
