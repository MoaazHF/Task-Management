import { IsEnum, IsOptional } from 'class-validator';
import { TaskStatus } from '../task-status-enum';
import { PriorityStatus } from '../priority-status-enum';

export class UpdateTaskDto {
  @IsEnum(TaskStatus)
  @IsOptional()
  status: TaskStatus;
  @IsEnum(PriorityStatus)
  @IsOptional()
  priority: PriorityStatus;
}
