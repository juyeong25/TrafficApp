import { PartialType } from '@nestjs/swagger';
import { CreateEventLogDto } from './create-event-log.dto';

export class UpdateEventLogDto extends PartialType(CreateEventLogDto) {}
