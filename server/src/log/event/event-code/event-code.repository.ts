import {EntityRepository, Repository} from "typeorm";
import {EventCode} from "./entities/event-code.entity";

@EntityRepository(EventCode)
export class EventCodeRepository extends Repository<EventCode>{

}