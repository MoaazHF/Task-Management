import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TaskStatus } from './task-status-enum';
import { PriorityStatus } from './priority-status-enum';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  startDate: Date;

  @Column()
  deadline: Date;

  @Column()
  priority: PriorityStatus;

  @Column()
  status: TaskStatus;
}
