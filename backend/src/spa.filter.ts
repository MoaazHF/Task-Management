import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  NotFoundException,
} from '@nestjs/common';
import { join } from 'path';

@Catch(NotFoundException)
export class SpaFallbackFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // 1. لو الطلب رايح للـ API ومالقاش داتا، رجع 404 حقيقية
    if (request.url.startsWith('/api')) {
      return response.status(404).json({
        statusCode: 404,
        message: 'API route not found',
      });
    }

    // 2. غير كده (لأي صفحة تانية)، رجع ملف الـ React الرئيسي
    // بنستخدم process.cwd() عشان نجيب مسار المشروع الحالي سواء لوكال أو دوكر
    const indexPath = join(
      process.cwd(),
      '..',
      'frontend',
      'dist',
      'index.html',
    );

    return response.sendFile(indexPath);
  }
}
