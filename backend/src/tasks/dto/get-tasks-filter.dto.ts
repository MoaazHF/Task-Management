import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from '../task-status-enum';
import { PriorityStatus } from '../priority-status-enum';

export class GetTasksFilterDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status: TaskStatus;
  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsEnum(PriorityStatus)
  priority: PriorityStatus;
}
