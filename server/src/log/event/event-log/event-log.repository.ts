import {createQueryBuilder, EntityRepository, Repository} from "typeorm";
import {EventLog} from "./entities/event-log.entity";

@EntityRepository(EventLog)
export class EventLogRepository extends Repository<EventLog>{
    async getAllEventLogByDateAndId(startDate: number, endDate: number, locations: string[], event_codes: string[]): Promise<EventLog[]>{
        const convertStartDate = (startDate.toString()).replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3')+' 00:00:00'
        const convertEndDate = (endDate.toString()).replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3')+' 23:59:59'
        const qs = await createQueryBuilder('event_log', 't1')
            .select('t1.log_time','log_time')
            .addSelect('t1.location_id', 'location_id')
            .addSelect('t4.location_name', 'location_name')
            .addSelect('t2.event_name', 'event_code')
            .addSelect('t3.event_status', 'event_status')
            .innerJoin('event_code', 't2', 't1.event_code = t2.event_code')
            .innerJoin('event_status', 't3', 't1.event_status = t3.event_value and t1.event_code = t3.event_code')
            .innerJoin('location', 't4', 't1.location_id = t4.location_id')

        if (event_codes.length != 0){
            // 요청된 이벤트 코드 쿼리
            qs.where('t1.location_id IN (:...locations) and t1.event_code IN (:...event_codes)', { event_codes: event_codes, locations: locations })
        }else{
            // 전체 이벤트 코드 쿼리
            qs.where('t1.location_id IN (:...locations)', { locations: locations })
        }
        qs.andWhere('t1.log_time >= :convertStartDate', {convertStartDate: convertStartDate} )
            .andWhere('t1.log_time <= :convertEndDate', {convertEndDate: convertEndDate} )
            .orderBy('t1.log_time', 'ASC')
        return qs.getRawMany()
    }

    async getAllEventLogToday():Promise<any[]>{
        var today = new Date().toISOString().substring(0,10);
        var startDate = today + ' 00:00:00'
        var endDate = today + ' 23:59:59'
        return await this.query(`select t1.event_code, count(*) as cnt, t2.event_name 
                                            from event_log as t1 join event_code as t2 on t1.event_code = t2.event_code
                                            where t1.log_time >= '${startDate}' and t1.log_time <= '${endDate}'
                                            group by t1.event_code, t2.event_code
                                            order by cnt DESC;`)
    }

    async getEventLogTodayByLimit(limit: number):Promise<any[]>{
        const qs = await createQueryBuilder('event_log', 't1')
            .select('t1.log_time','log_time')
            .addSelect('t1.location_id', 'location_id')
            .addSelect('t4.location_name', 'location_name')
            .addSelect('t2.event_name', 'event_code')
            .addSelect('t3.event_status', 'event_status')
            .innerJoin('event_code', 't2', 't1.event_code = t2.event_code')
            .innerJoin('event_status', 't3', 't1.event_status = t3.event_value and t1.event_code = t3.event_code')
            .innerJoin('location', 't4', 't1.location_id = t4.location_id')
            .limit(limit)
            .orderBy('t1.log_time', 'DESC')

        return qs.getRawMany()
    }
}