import { Logger } from '@nestjs/common';
export class BaseResponse {
  success: boolean;
  message: string;
  data: any;

  constructor(success: boolean, message: string, data: any = null) {
    this.success = success;
    this.message = message;
    this.data = data;
  }
}

export abstract class BaseService {
  protected success(message: string, data: any = null): BaseResponse {
    Logger.log(message, 'success');
    Logger.log(data);
    Logger.getTimestamp();
    return new BaseResponse(true, message, data);
  }

   protected notFound(message: string, data: any = null): BaseResponse {
    Logger.log(message, 'false');
    Logger.log(data);
    Logger.getTimestamp();
    return new BaseResponse(false, message, data);
  }

  protected error(message: string, data: any = null): BaseResponse {
    Logger.log(message, 'error');
    Logger.error(data);
    Logger.getTimestamp();
    return new BaseResponse(false, message, data);
  }

  protected created(message: string, data: any = null): BaseResponse {
    Logger.log(message, 'created');
    Logger.log(data);
    Logger.getTimestamp();
    return new BaseResponse(true, message, data);
  }

  protected updated(message: string, data: any = null): BaseResponse {
    Logger.log(message, 'updated');
    Logger.log(data);
    Logger.getTimestamp();
    return new BaseResponse(true, message, data);
  }

  protected deleted(message: string = 'Eliminado correctamente'): BaseResponse {
    Logger.log(message, 'updated');
    Logger.getTimestamp();
    return new BaseResponse(true, message, null);
  }
}
