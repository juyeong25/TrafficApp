import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import {Location} from "../../../../locations/entities/location.entity";
import {EventCode} from "../../event-code/entities/event-code.entity";

@Entity()
export class EventLog extends BaseEntity{
    @PrimaryGeneratedColumn()
    log_no: number;

    @Column()
    log_time: string;

    @ManyToOne(
        // ()=>Group, group=>group.location
        type => Location, location => location.location_id,{
            onDelete: 'CASCADE'
        }
    )
    @JoinColumn({name: "location_id"})
    location_id: Location;


    @ManyToOne(
        // ()=>Group, group=>group.location
        type => EventCode, eventCode => eventCode.event_code
    )
    @JoinColumn({name: "event_code"})
    event_code: EventCode;

    @Column()
    event_status: number;
}
