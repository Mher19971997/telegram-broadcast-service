import { Injectable, Logger } from '@nestjs/common';
import * as axios from '@nestjs/axios';
import { Observer } from 'rxjs';
import util from 'util';
import { ConfigService } from '@telegram_broadcast_service/shared/src/config/config.service';

@Injectable()
export class FetchService {
  private readonly logger = new Logger(FetchService.name);

  private bearer: string;
  private readonly timeout;
  private readonly services: {
    [key: string]: {
      base_url: string;
      internal_url: string;
    };
  };

  constructor(private readonly httpService: axios.HttpService, private readonly configService: ConfigService) {
    this.timeout = util.promisify(setTimeout);
    this.services = this.configService.get('service');
  }

  public service(name: string) {
    const service = this.services[name];

    return this.api(service.internal_url);
  }

  public api(baseURL: string) {
    return {
      request: <T>(config: axios.HttpModuleOptions) => this.request<T>({ baseURL, ...{ ...config } }),
      get: <T = never>(uri: string, options?: axios.HttpModuleOptions) => this.get<T>(`${baseURL}/${uri}`, { ...options }),
      post: <T = never>(uri: string, data?: any, options?: axios.HttpModuleOptions) =>
        this.post<T>(`${baseURL}/${uri}`, data, { ...options }),
      put: <T = never>(uri: string, data?: any, options?: axios.HttpModuleOptions) =>
        this.put<T>(`${baseURL}/${uri}`, data, { ...options }),
      patch: <T = never>(uri: string, data?: any, options?: axios.HttpModuleOptions) =>
        this.patch<T>(`${baseURL}/${uri}`, data, { ...options }),
      delete: <T = never>(uri: string, options?: axios.HttpModuleOptions) => this.delete<T>(`${baseURL}/${uri}`, { ...options }),
      head: <T = never>(uri: string, options?: axios.HttpModuleOptions) => this.head<T>(`${baseURL}/${uri}`, { ...options }),
      options: <T = never>(uri: string, options?: axios.HttpModuleOptions) => this.options<T>(`${baseURL}/${uri}`, { ...options }),
      purge: <T = never>(uri: string, options?: axios.HttpModuleOptions) => this.purge<T>(`${baseURL}/${uri}`, { ...options }),
      link: <T = never>(uri: string, options?: axios.HttpModuleOptions) => this.link<T>(`${baseURL}/${uri}`, { ...options }),
      unlink: <T = never>(uri: string, options?: axios.HttpModuleOptions) => this.unlink<T>(`${baseURL}/${uri}`, { ...options }),
    };
  }

  private request<T>(config: axios.HttpModuleOptions): Promise<T> {
    this.logger.debug({ config });
    return new Promise<T>((resolve, reject) => this.httpService.request<T>(config).subscribe(this.subscribeHandler(resolve, reject)));
  }

  private get<T>(url: string, options?: axios.HttpModuleOptions): Promise<T> {
    this.logger.debug({ url, options });
    return new Promise<T>((resolve, reject) => this.httpService.get<T>(url, options).subscribe(this.subscribeHandler(resolve, reject)));
  }

  private post<T>(url: string, data?: any, options?: axios.HttpModuleOptions): Promise<T> {
    this.logger.debug({ url, data, options });
    return new Promise<T>((resolve, reject) =>
      this.httpService.post<T>(url, data, options).subscribe(this.subscribeHandler(resolve, reject)),
    );
  }

  private put<T>(url: string, data?: any, options?: axios.HttpModuleOptions): Promise<T> {
    this.logger.debug({ url, data, options });
    return new Promise<T>((resolve, reject) =>
      this.httpService.put<T>(url, data, options).subscribe(this.subscribeHandler(resolve, reject)),
    );
  }

  private patch<T>(url: string, data?: any, options?: axios.HttpModuleOptions): Promise<T> {
    this.logger.debug({ url, data, options });
    return new Promise<T>((resolve, reject) =>
      this.httpService.patch<T>(url, data, options).subscribe(this.subscribeHandler(resolve, reject)),
    );
  }

  private delete<T>(url: string, options?: axios.HttpModuleOptions): Promise<T> {
    this.logger.debug({ url, options });
    return new Promise<T>((resolve, reject) => this.httpService.delete<T>(url, options).subscribe(this.subscribeHandler(resolve, reject)));
  }

  private head<T>(url: string, options?: axios.HttpModuleOptions): Promise<T> {
    this.logger.debug({ url, options });
    return new Promise<T>((resolve, reject) => this.httpService.head<T>(url, options).subscribe(this.subscribeHandler(resolve, reject)));
  }

  private options<T>(url: string, options?: axios.HttpModuleOptions): Promise<T> {
    return this.request<T>({ url, ...options, method: 'options' });
  }

  private purge<T>(url: string, options?: axios.HttpModuleOptions): Promise<T> {
    return this.request<T>({ url, ...options, method: 'purge' });
  }

  private link<T>(url: string, options?: axios.HttpModuleOptions): Promise<T> {
    return this.request<T>({ url, ...options, method: 'link' });
  }

  public unlink<T>(url: string, options?: axios.HttpModuleOptions): Promise<T> {
    return this.request<T>({ url, ...options, method: 'unlink' });
  }

  private subscribeHandler(resolve: (arg0: any) => void, reject: (arg0: any) => void): Partial<Observer<any>> {
    return {
      next: (value: any): void => {
        this.logger.debug(value.data);
        resolve(value.data);
      },
      error: (err: any): void => {
        this.logger.error(err.response?.data || err);
        reject(err);
      },
    };
  }
}
