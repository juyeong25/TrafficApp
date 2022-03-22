import {Injectable} from '@nestjs/common';
import {CreateGroupDto} from './dto/create-group.dto';
import {UpdateGroupDto} from './dto/update-group.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {GroupRepository} from "./group.repository";
import {Group} from "./entities/group.entity";

@Injectable()
export class GroupService {
    constructor(
        @InjectRepository(GroupRepository)
        private groupRepository: GroupRepository
    ) {
    }

    createGroup(createGroupDto: CreateGroupDto): Promise<Group> {
        return this.groupRepository.createGroup(createGroupDto);
    }

    async getAllGroup(): Promise<Group[]> {
        const qs = await this.groupRepository.find(
            {
                relations: ['location'],
                order: {
                    group_id: "ASC"
                },
            }
        );
        for (let i = 0; i < qs.length; i++) {
            (qs[i].location).sort((a,b): any=>{
                if (a.location_id < b.location_id) return -1;
                if (a.location_id > b.location_id) return 1;
                return 0;
            })
        }
        return qs
    }

    getGroupById(id: number): Promise<Group> {
        return this.groupRepository.getGroupById(id);
    }

    async updateGroupById(group_id: number, updateGroupDto: UpdateGroupDto):Promise<Group>{
        return this.groupRepository.updateGroupById(group_id, updateGroupDto);
    }

    async deleteGroupById(group_id: number):Promise<any>{
        return this.groupRepository.deleteGroupById(group_id);
    }
}
