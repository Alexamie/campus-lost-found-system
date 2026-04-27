import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const payload = exception.getResponse();

    const message =
      typeof payload === 'string'
        ? payload
        : Array.isArray((payload as { message?: string | string[] })?.message)
          ? (payload as { message: string[] }).message[0]
          : (payload as { message?: string })?.message || exception.message;

    response.status(status).json({
      statusCode: status || HttpStatus.INTERNAL_SERVER_ERROR,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
