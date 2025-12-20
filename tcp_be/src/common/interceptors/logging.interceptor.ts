import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap, catchError } from 'rxjs';
import { Logger } from '@nestjs/common';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, body, params, query } = req;

    this.logger.log(`➡️ ${method} ${url}`);
    this.logger.log(`🟦 Params: ${JSON.stringify(params)}`);
    this.logger.log(`🟩 Query: ${JSON.stringify(query)}`);
    this.logger.log(`🟧 Body: ${JSON.stringify(body)}`);

    const now = Date.now();

    return next.handle().pipe(
      tap((res) =>
        this.logger.log(
          `⬅️ Response (${Date.now() - now}ms): ${JSON.stringify(res)}`,
        ),
      ),
      catchError((err) => {
        this.logger.error(`❌ Error: ${err.message}`);
        this.logger.error(`🚨 Stack: ${err.stack}`);
        throw err;
      }),
    );
  }
}
