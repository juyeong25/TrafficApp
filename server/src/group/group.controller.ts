import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import {Group} from "./entities/group.entity";
import {ApiBody, ApiCreatedResponse, ApiOperation, ApiTags} from "@nestjs/swagger";

@Controller('group')
@ApiTags('그룹 API')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post('/create')
  @ApiOperation({ summary: '그룹 생성 API', description: '그룹 생성' })
  @ApiBody({description: '요청 Json 형식', type: CreateGroupDto})
  @ApiCreatedResponse({ description: '생성된 그룹 반환', type: Group })
  @UsePipes(ValidationPipe)
  create(@Body() createGroupDto: CreateGroupDto):Promise<Group> {
    return this.groupService.createGroup(createGroupDto);
  }

  @Get('/listAll')
  @ApiOperation({ summary: '전체 그룹 조회 API', description: '전체 그룹 조회' })
  @ApiCreatedResponse({ description: '전체 그룹 반환', type: Group })
  findAll() {
    return this.groupService.getAllGroup()
  }

  @Get('/read/:id')
  @ApiOperation({ summary: '선택 그룹 조회 API', description: '선택 그룹 조회' })
  @ApiCreatedResponse({ description: '선택 그룹 반환', type: Group })
  getGroupById(
      @Param('id', ParseIntPipe) id: number
  ):Promise<Group>{
    return this.groupService.getGroupById(id);
  }

  @Patch('/update/:group_id')
  @ApiOperation({ summary: '선택 그룹 수정 API', description: '선택 그룹 수정' })
  @ApiBody({description: "클라이언트 -> 서버로 보내는 그룹 데이터 형식", type: CreateGroupDto})
  @UsePipes(ValidationPipe)
  updateGroup(
      @Param('group_id')group_id: number,
      @Body()updateGroupDto: UpdateGroupDto
  ){
        return this.groupService.updateGroupById(group_id, updateGroupDto);
  }

  @Delete('/delete/:group_id')
  async deleteGroupById(
      @Param('group_id')group_id: number
  ):Promise<any>{
    return this.groupService.deleteGroupById(group_id);
  }
}
