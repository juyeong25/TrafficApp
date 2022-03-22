import {BaseEntity, Column, Entity, OneToMany, PrimaryColumn} from "typeorm";
import {EventStatus} from "../../event-status/entities/event-status.entity";
import {ApiProperty} from "@nestjs/swagger";

@Entity()
export class EventCode extends BaseEntity{
    @ApiProperty({example: '이벤트 코드 아이디'})
    @PrimaryColumn()
    event_code: number;

    @ApiProperty({example: '이벤트 코드 이름'})
    @Column()
    event_name: string;

    @OneToMany(() => EventStatus, eventStatus => eventStatus.event_code)
    event_status: EventStatus[];
}
