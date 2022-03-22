import { PartialType } from '@nestjs/swagger';
import { CreateTodplanDto } from './create-todplan.dto';

export class UpdateTodplanDto extends PartialType(CreateTodplanDto) {}
