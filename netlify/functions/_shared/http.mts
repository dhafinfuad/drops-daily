export function json(data: unknown, init: ResponseInit = {}) {
  return Response.json(data, { ...init, headers: { "cache-control": "no-store", ...init.headers } });
}
export function errorResponse(error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : "Unknown error";
  return json({ error: message }, { status });
}
export async function readJson(req: Request): Promise<any> {
  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (contentLength > 64_000) throw new Error("Request too large");
  return req.json();
}
