import {Between, EntityRepository, Repository} from "typeorm";
import {CycleLog} from "./entities/cycle-log.entity";

@EntityRepository(CycleLog)
export class CycleLogRepository extends Repository<CycleLog>{
    async getAllCycleLogById(id: number, startDate: number, endDate: number): Promise<CycleLog[]>{
        return this.find({
            where: {
                location_id: id,
                log_time: Between(
                    (startDate.toString()).replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3') + ' 00:00:00',
                    (endDate.toString()).replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3') + ' 23:59:59',
                )

            },

        })
    }
}