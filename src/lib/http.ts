/* eslint-disable @typescript-eslint/no-explicit-any */

export interface HttpGetOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
  retry?: number;
  signal?: AbortSignal;
  etag?: string | null;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  headers: Headers;
  etag: string | null;
  rawBody: string;
}

const DEFAULT_TIMEOUT = 10000;
const DEFAULT_RETRY = 3;

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function parseBody(contentType: string | null, body: string) {
  if (!contentType) return body;

  const normalized = contentType.split(";")[0]?.trim().toLowerCase() ?? "";

  if (normalized.includes("application/json")) {
    try {
      return JSON.parse(body);
    } catch (error) {
      console.warn("Falha ao fazer parse de JSON", error);
      return body;
    }
  }

  if (normalized.includes("text/csv") || normalized.includes("application/csv")) {
    return body;
  }

  return body;
}

async function performFetch(url: string, options: HttpGetOptions, attempt = 0): Promise<HttpResponse<any>> {
  const controller = new AbortController();
  const timeout = options.timeoutMs ?? DEFAULT_TIMEOUT;
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...(options.headers ?? {}),
        ...(options.etag ? { "If-None-Match": options.etag } : {}),
      },
      signal: options.signal ?? controller.signal,
    });

    const rawBody = await response.text();
    const etag = response.headers.get("etag");
    const contentType = response.headers.get("content-type");
    const data = parseBody(contentType, rawBody);

    if (!response.ok) {
      const error = new Error(response.statusText || "HTTP error");
      (error as any).status = response.status;
      (error as any).body = rawBody;
      throw error;
    }

    return {
      data,
      status: response.status,
      headers: response.headers,
      etag,
      rawBody,
    };
  } catch (error) {
    const retries = options.retry ?? DEFAULT_RETRY;
    if (attempt < retries) {
      const delay = Math.pow(2, attempt) * 250;
      await wait(delay);
      return performFetch(url, options, attempt + 1);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function httpGet<T = unknown>(url: string, options: HttpGetOptions = {}): Promise<HttpResponse<T>> {
  return performFetch(url, options);
}

export async function fetchTextWithCharset(url: string, fallbackCharset = "utf-8"): Promise<string> {
  const response = await fetch(url);
  const contentType = response.headers.get("content-type") ?? "";
  const charsetMatch = /charset=([^;]+)/i.exec(contentType);
  const charset = (charsetMatch?.[1] ?? fallbackCharset).toLowerCase();
  const buffer = await response.arrayBuffer();
  const decoder = new TextDecoder(charset, { fatal: false });
  return decoder.decode(buffer).normalize("NFC");
}
