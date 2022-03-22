import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique} from "typeorm";
import {Location} from "../../../locations/entities/location.entity";

@Entity()
@Unique(["todPlan_id", "location_id"])
export class Todplan extends BaseEntity{

    @PrimaryGeneratedColumn()
    todPlan_pk: number;

    @Column()
    todPlan_id: number;

    @ManyToOne(
        // ()=>Group, group=>group.location
        type => Location, location => location.location_id
    )
    @JoinColumn({name: "location_id"})
    location_id: Location;

    @Column()
    todPlan_hour: number;

    @Column()
    todPlan_min: number;

    @Column()
    todPlan_sec: number;

    @Column()
    todPlan_1A: number;

    @Column()
    todPlan_1B: number;

    @Column()
    todPlan_2A: number;

    @Column()
    todPlan_2B: number;

    @Column()
    todPlan_3A: number;

    @Column()
    todPlan_3B: number;

    @Column()
    todPlan_4A: number;

    @Column()
    todPlan_4B: number;

    @Column()
    todPlan_5A: number;

    @Column()
    todPlan_5B: number;

    @Column()
    todPlan_6A: number;

    @Column()
    todPlan_6B: number;

    @Column()
    todPlan_7A: number;

    @Column()
    todPlan_7B: number;

    @Column()
    todPlan_8A: number;

    @Column()
    todPlan_8B: number;
}
