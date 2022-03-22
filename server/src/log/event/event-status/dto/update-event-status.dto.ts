import { PartialType } from '@nestjs/swagger';
import { CreateEventStatusDto } from './create-event-status.dto';

export class UpdateEventStatusDto extends PartialType(CreateEventStatusDto) {}
