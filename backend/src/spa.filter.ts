import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  NotFoundException,
} from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Catch(NotFoundException)
export class SpaFallbackFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    if (request.url.startsWith('/api')) {
      return response.status(404).json({
        statusCode: 404,
        message: 'API route not found',
      });
    }

    const indexPath = [
      join(process.cwd(), 'frontend', 'dist', 'index.html'),
      join(process.cwd(), '..', 'frontend', 'dist', 'index.html'),
    ].find((candidatePath) => existsSync(candidatePath));

    if (!indexPath) {
      return response.status(404).json({
        statusCode: 404,
        message: 'Frontend build not found',
      });
    }

    return response.sendFile(indexPath);
  }
}
