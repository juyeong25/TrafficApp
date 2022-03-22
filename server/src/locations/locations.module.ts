import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import {Locationsrepository} from "./locationsrepository";
import {TypeOrmModule} from "@nestjs/typeorm";
import {GroupModule} from "../group/group.module";
import {LoggerMiddleware} from "../middleware/logger.middleware";

@Module({
  imports: [
    TypeOrmModule.forFeature([Locationsrepository]),
    GroupModule,
  ],
  controllers: [LocationsController],
  providers: [LocationsService],
  exports: [LocationsService]
})
export class LocationsModule implements NestModule{
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(LoggerMiddleware).forRoutes(LocationsController)
  }
}
