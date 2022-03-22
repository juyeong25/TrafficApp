import { PartialType } from '@nestjs/swagger';
import { CreateEventCodeDto } from './create-event-code.dto';

export class UpdateEventCodeDto extends PartialType(CreateEventCodeDto) {}
