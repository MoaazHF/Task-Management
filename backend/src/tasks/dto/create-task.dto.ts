import { IsDate, IsNotEmpty } from 'class-validator';
import { PriorityStatus } from '../priority-status-enum';
import { Type } from 'class-transformer';

export class CreateTaskDto {
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  description: string;
  @IsNotEmpty()
  priority: PriorityStatus;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  deadline: Date;
}
