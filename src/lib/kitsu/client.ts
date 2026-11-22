const KITSU_BASE_URL = "https://kitsu.app/api/edge";

export class KitsuApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "KitsuApiError";
    this.status = status;
  }
}

export interface KitsuFetchOptions {
  params?: Record<string, string | number | boolean | undefined>;
  revalidate?: number | false;
  tags?: string[];
  signal?: AbortSignal;
}

function buildUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = new URL(`${KITSU_BASE_URL}${cleanEndpoint}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

export async function kitsuFetch<TResponse>(
  endpoint: string,
  options: KitsuFetchOptions = {}
): Promise<TResponse> {
  const url = buildUrl(endpoint, options.params);

  const fetchOptions: RequestInit & {
    next?: { revalidate?: number | false; tags?: string[] };
  } = {
    method: "GET",
    headers: {
      Accept: "application/vnd.api+json",
    },
    signal: options.signal,
  };

  // تنظیم کش نکست جی اس برای فراخوانی‌های سمت سرور
  if (typeof window === "undefined" && options.revalidate !== undefined) {
    fetchOptions.next = {
      revalidate: options.revalidate,
      ...(options.tags ? { tags: options.tags } : {}),
    };
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    if (response.status === 404) {
      throw new KitsuApiError("موردی یافت نشد.", 404);
    }
    if (response.status === 429) {
      throw new KitsuApiError(
        "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً چند لحظه صبر کنید.",
        429
      );
    }
    throw new KitsuApiError(
      "خطا در دریافت اطلاعات از سرور انیمه. لطفاً دوباره تلاش کنید.",
      response.status
    );
  }

  return response.json() as Promise<TResponse>;
}
