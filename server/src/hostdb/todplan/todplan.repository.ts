import {EntityRepository, Repository} from "typeorm";
import {Todplan} from "./entities/todplan.entity";

@EntityRepository(Todplan)
export class TodplanRepository extends Repository<Todplan>{
    async createTodplan(){

    }
}