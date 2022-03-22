import {Between, EntityRepository, Repository} from "typeorm";
import {DetectLog} from "./entities/detect-log.entity";

@EntityRepository(DetectLog)
export class DetectLogRepository extends Repository<DetectLog>{
    async getAllDetectLogById(id: number, startDate: number, endDate: number): Promise<DetectLog[]>{
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