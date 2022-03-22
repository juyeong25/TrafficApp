import { PartialType } from '@nestjs/swagger';
import { CreateHoliydayplanDto } from './create-holiydayplan.dto';

export class UpdateHoliydayplanDto extends PartialType(CreateHoliydayplanDto) {}
