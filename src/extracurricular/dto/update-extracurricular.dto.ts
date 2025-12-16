import { PartialType } from '@nestjs/mapped-types';
import { CreateExtracurricularDto } from './create-extracurricular.dto';

export class UpdateExtracurricularDto extends PartialType(CreateExtracurricularDto) {}
