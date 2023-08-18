import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BusinessException, ErrorDomain } from './businessExceptionFilter';
import axios from 'axios';

export interface ApiError {
  id: string;
  domain: ErrorDomain;
  message: string | object;
  timestamp: Date;
}

@Catch(Error)
export class CustomExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(CustomExceptionFilter.name);

  async catch(exception: Error, host: ArgumentsHost) {
    let body: ApiError;
    let status: HttpStatus;

    if (exception instanceof BusinessException) {
      body = {
        id: exception.id,
        message: exception.apiMessage,
        domain: exception.domain,
        timestamp: exception.timestamp,
      };
      status = exception.status;
    } else if (exception instanceof HttpException) {
      body = new BusinessException(
        'generic',
        exception.message,
        exception.getResponse(),
        exception.getStatus(),
      );

      status = exception.getStatus();
    } else {
      body = new BusinessException(
        'generic',
        `Internal error occurred: ${exception.message}`,
        'Internal error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    if (
      process.env.NEST_APP_MODE === 'production' &&
      status >= 500 &&
      status < 600
    ) {
      const webhookUrl =
        'https://discord.com/api/webhooks/1142120803060690984/_6YSU5-0nZL2otuj-IrWdnxoU_OOgwq5PNMi8HPwaEQTA7RN1mj_y1KEhLd-Y1LXPGTI';
      const errorMsg = `Status: ${status} - Message: ${body.message} - Time: ${body.timestamp}`;
      try {
        await axios.post(webhookUrl, { content: errorMsg });
      } catch (e) {
        this.logger.error(`Failed to send discord notification : ${errorMsg}`);
      }
    }

    this.logger.error(
      `Got an exception: ${JSON.stringify({
        path: request.url,
        ...body,
      })}`,
    );

    response.status(status).json(body);
  }
}
