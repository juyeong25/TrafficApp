import { PartialType } from '@nestjs/swagger';
import { CreateCycleLogDto } from './create-cycle-log.dto';

export class UpdateCycleLogDto extends PartialType(CreateCycleLogDto) {}
