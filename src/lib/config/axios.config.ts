import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosInstance,
} from 'axios';

// 외부 Api 로그 핸들링
const logOnDev = (message: string) => {
  console.log(message);
};

// 정상적인 API response log
const onResponse = (response: AxiosResponse): AxiosResponse => {
  const { baseURL, method, url } = response.config;
  const { status } = response;
  logOnDev(
    `[API] ${baseURL?.toUpperCase()} ${method?.toUpperCase()} ${url} | Response ${status}`,
  );
  return response;
};

// 에러 API response log
const onErrorResponse = (error: AxiosError | Error): Promise<AxiosError> => {
  if (axios.isAxiosError(error)) {
    const { message } = error;
    const { baseURL, method, url } = error.config as AxiosRequestConfig;
    const { statusText, status } = (error.response as AxiosResponse) ?? {};

    logOnDev(
      `[API] ${baseURL?.toUpperCase()} ${method?.toUpperCase()} ${url} | Response ${status}`,
    );

    switch (status) {
      case 401: {
        logOnDev(
          `[API] ${baseURL?.toUpperCase()} ${method?.toUpperCase()} ${url} | Login required ${status}`,
        );
        break;
      }
      case 403: {
        logOnDev(
          `[API] ${baseURL?.toUpperCase()} ${method?.toUpperCase()} ${url} | Permission denied ${status}`,
        );
        break;
      }
      case 404: {
        logOnDev(
          `[API] ${baseURL?.toUpperCase()} ${method?.toUpperCase()} ${url} | Invalid request ${status}`,
        );
        break;
      }
      case 500: {
        logOnDev(
          `[API] ${baseURL?.toUpperCase()} ${method?.toUpperCase()} ${url} | Server error ${status}`,
        );
        break;
      }
      default: {
        logOnDev(
          `[API] ${baseURL?.toUpperCase()} ${method?.toUpperCase()} ${url} | Unknown error occurred ${status}`,
        );
        break;
      }
    }
  } else {
    logOnDev(`[API] | Error ${error.message}`);
  }

  return Promise.reject(error);
};

// 외부 API 호출 - 공공데이터 OpenAPI 기상청
const publicApiAxiosConfig: AxiosRequestConfig = {
  baseURL: process.env.PUBLIC_OPEN_API_BASE_URL,
  timeout: 100000,
};

const onPublicApiRequest = (
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig => {
  const { method, url } = config;
  logOnDev(`[API] ${method?.toUpperCase()} ${url} | Request`);

  if (method === 'get') {
    config.params = {
      ...config.params,
      serviceKey: process.env.PUBLIC_OPEN_API_SERVICE_KEY,
      pageNo: 1,
      numOfRows: 1000,
      dataType: 'JSON',
    };
  }
  return config;
};

export function createPublicApiAxiosInstance(): AxiosInstance {
  const instance = axios.create(publicApiAxiosConfig);
  instance.interceptors.request.use(onPublicApiRequest);
  instance.interceptors.response.use(onResponse, onErrorResponse);
  const { adapter } = instance.defaults;
  // if (adapter.name === 'throttleAdapter') return instance;

  return instance;
}
// export const publicApiAxiosInstance = axios.create(publicApiAxiosConfig);
// instance.interceptors.request.use(onPublicApiRequest);
// instance.interceptors.response.use(onResponse, onErrorResponse);
