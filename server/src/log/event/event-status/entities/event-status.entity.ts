import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import {EventCode} from "../../event-code/entities/event-code.entity";

@Entity()
export class EventStatus extends  BaseEntity{
    @PrimaryGeneratedColumn()
    event_statusId: number;

    @ManyToOne(
        // ()=>Group, group=>group.location
        type => EventCode, eventCode => eventCode.event_code
    )
    @JoinColumn({name: "event_code"})
    event_code: EventCode;

    @Column()
    event_value: number;

    @Column()
    event_status: string;

    // @OneToMany(() => EventLog, eventLog => eventLog.event_status)
    // event_log: EventLog[];
}
