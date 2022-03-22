import { Module } from '@nestjs/common';
import { ArrowService } from './arrow.service';
import { ArrowController } from './arrow.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ArrowRepository} from "./arrow.repository";

@Module({
  imports:[
      TypeOrmModule.forFeature([ArrowRepository])
  ],
  controllers: [ArrowController],
  providers: [ArrowService],
    exports: [ArrowService]
})
export class ArrowModule {}
