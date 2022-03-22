import {EntityRepository, Repository} from "typeorm";
import {EventStatus} from "./entities/event-status.entity";

@EntityRepository(EventStatus)
export class EventStatusRepository extends Repository<EventStatus>{

}