import {EntityRepository, Repository} from "typeorm";
import {Group} from "./entities/group.entity";
import {CreateGroupDto} from "./dto/create-group.dto";
import {NotFoundException} from "@nestjs/common";
import {UpdateGroupDto} from "./dto/update-group.dto";

@EntityRepository(Group)
export class GroupRepository extends Repository<Group>{
    async createGroup(createGroupDto: CreateGroupDto): Promise<Group>{
        const group = this.create(createGroupDto);
        await this.save(group);
        return group;
    }

    async getGroupById(id: number):Promise<Group>{
        const group = await this.findOne(id, {
            relations:['location']
        });

        if (!group) throw new NotFoundException(`Can't find Group with id = ${id}`);

        return group;
    }

    async updateGroupById(group_id: number, updateGroupDto: UpdateGroupDto):Promise<Group>{
        let group = await this.findOne(group_id);
        group.group_lat = updateGroupDto.group_lat;
        group.group_long = updateGroupDto.group_long;
        group.group_name = updateGroupDto.group_name;
        group.group_zoom = updateGroupDto.group_zoom;
        group.group_comment = updateGroupDto.group_comment;

        await this.save(group);
        return group;
    }

    async deleteGroupById(group_id: number):Promise<any>{
        try {
            return await this.createQueryBuilder()
                .delete()
                .from(Group)
                .where('group_id = :group_id', {group_id: group_id})
                .execute();
        }catch (error) {
            return 'fail'
        }

    }
}