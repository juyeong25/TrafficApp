import { PartialType } from '@nestjs/swagger';
import { CreateWeekplanDto } from './create-weekplan.dto';

export class UpdateWeekplanDto extends PartialType(CreateWeekplanDto) {}
