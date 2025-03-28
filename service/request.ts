export async function request<DataT = unknown>(
  url: string,
  options: Parameters<typeof $fetch>[1] = {}
) {
  interface Response {
    code: string;
    data: DataT;
    message: string;
  }

  const runtimeConfig = useRuntimeConfig();

  const baseURL = runtimeConfig.public.apiUrl;

  const _options: Parameters<typeof $fetch>[1] = {
    ...options,
    baseURL: baseURL,
    onRequest({ options }) {
      options.headers = options.headers || {};

      const headers = {
        Authorization: "",
      };

      Object.assign(headers, options.headers);
      Object.assign(options.headers, headers);
    },
    onRequestError() {
      //
    },
    onResponse() {
      //
    },
    onResponseError() {
      //
    },
  };

  return await $fetch<Response>(url, _options).then((result) => {
    return result;
  });
}
