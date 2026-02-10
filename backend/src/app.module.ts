import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { existsSync } from 'fs';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),

    ...(existsSync(join(process.cwd(), 'frontend', 'dist'))
      ? [
          ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), 'frontend', 'dist'),
            exclude: ['/api/:splat(.*)'],
            serveRoot: '/',
          }),
        ]
      : []),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '1610',
      database: process.env.DB_NAME || 'task-management',
      autoLoadEntities: true,
      synchronize: true,
      retryAttempts: 20,
      retryDelay: 1000,
    }),

    TasksModule,
  ],
})
export class AppModule {}
