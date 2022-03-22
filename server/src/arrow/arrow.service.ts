import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {ArrowRepository} from "./arrow.repository";
import {Arrow} from "./entities/arrow.entity";

@Injectable()
export class ArrowService {
    constructor(
        @InjectRepository(ArrowRepository)
        private arrowRepository: ArrowRepository
    ) {
    }

    arrowListAll(): Promise<Arrow[]>{
        return this.arrowRepository.find();
    }

    arrowGetOneById(arrow_id: number): Promise<Arrow>{
        return this.arrowRepository.findOne({where: { arrow_id: arrow_id}})
    }
}
