import {EntityRepository, Repository} from "typeorm";
import {Arrow} from "./entities/arrow.entity";

@EntityRepository(Arrow)
export class ArrowRepository extends Repository<Arrow>{

}