import type { ApiRequest, ApiResponse, ApiRoute } from "./types.js";

export class ApiRouter {
  private readonly routes: ApiRoute[] = [];

  register<TRequest, TResponse>(route: ApiRoute<TRequest, TResponse>) {
    this.routes.push(route as ApiRoute);
  }

  async dispatch(request: ApiRequest): Promise<ApiResponse> {
    for (const route of this.routes) {
      if (route.method !== request.method) continue;
      const match = route.pattern.exec(request.path);
      if (!match) continue;
      const params: Record<string, string> = {};
      for (const key of Object.keys(match.groups ?? {})) params[key] = match.groups![key]!;
      return route.handle(request, params);
    }
    return { status: 404, headers: { "content-type": "application/json" }, body: { code: "ROUTE_NOT_FOUND" } };
  }
}
