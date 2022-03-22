import { PartialType } from '@nestjs/swagger';
import { CreateDetectLogDto } from './create-detect-log.dto';

export class UpdateDetectLogDto extends PartialType(CreateDetectLogDto) {}
