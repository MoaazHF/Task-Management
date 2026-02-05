import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status-enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async getTaskById(id: string): Promise<Task> {
    const found = await this.tasksRepository.findOneBy({ id });
    if (!found) {
      throw new NotFoundException(`No Task Has been found by this Id:${id}`);
    }
    return found;
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const { title, description, deadline, priority } = createTaskDto;
    const task = this.tasksRepository.create({
      title,
      description,
      startDate: new Date(),
      deadline,
      priority,
      status: TaskStatus.OPEN,
    });
    await this.tasksRepository.save(task);
    return task;
  }

  async deleteTaskById(id: string): Promise<void> {
    const task = await this.tasksRepository.delete({ id });

    if (task.affected === 0) {
      console.log('Iam from the delete service');
      throw new NotFoundException(
        `The Task yuo tried to Delete with ID:${id} Was not Found`,
      );
    }
  }

  async getAllTasks(): Promise<Task[]> {
    return this.tasksRepository.find();
  }

  async updateTaskById(
    id: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    const { status, priority } = updateTaskDto;
    const task = await this.getTaskById(id);
    if (status) task.status = status;
    if (priority) task.priority = priority;
    await this.tasksRepository.save(task);

    return task;
  }

  async getTasksByFilter(filterDto: GetTasksFilterDto): Promise<Task[]> {
    const { status, search, priority } = filterDto;
    const query = this.tasksRepository.createQueryBuilder('task');
    if (status) {
      query.andWhere('task.status = :status', { status });
    }
    if (priority) {
      query.andWhere('task.priority = :priority', { priority });
    }

    if (search) {
      query.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    const tasks = await query.getMany();
    return tasks;
  }
}
