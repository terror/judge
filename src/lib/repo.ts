import { GenerateProblemRequest, ProgrammingProblem } from './types';

const prefix = 'http://127.0.0.1:8000';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface Params {
  [key: string]: string | number | boolean | undefined;
}

const client = {
  buildQuery(baseURL: string, params?: Params): string {
    let query = baseURL;

    if (params) {
      const keys = Object.keys(params);

      query += `?${keys
        .filter((key) => params[key] !== undefined)
        .map((key) => `${key}=${params[key]}`)
        .join('&')}`;
    }

    return query;
  },

  async get(endpoint: string, init?: RequestInit): Promise<Response> {
    return fetch(prefix + endpoint, init);
  },

  async post(endpoint: string, init?: RequestInit): Promise<Response> {
    return await fetch(prefix + endpoint, {
      method: 'POST',
      ...init,
    });
  },

  async put(endpoint: string, init?: RequestInit): Promise<Response> {
    return fetch(prefix + endpoint, {
      method: 'PUT',
      ...init,
    });
  },

  async delete(endpoint: string, init?: RequestInit): Promise<Response> {
    return fetch(prefix + endpoint, {
      method: 'DELETE',
      ...init,
    });
  },

  async deserialize<T>(
    method: Method,
    endpoint: string,
    init?: RequestInit
  ): Promise<T> {
    const run = async (
      fn: (endpoint: string, init?: RequestInit) => Promise<Response>
    ): Promise<T> => {
      const r = await fn(endpoint, init);
      const data = await r.json();
      return data as T;
    };

    switch (method) {
      case 'GET':
        return run(this.get);
      case 'POST':
        return run(this.post);
      case 'PUT':
        return run(this.put);
      case 'DELETE':
        return run(this.delete);
    }
  },
};

export const repo = {
  async generateProblem(
    params: GenerateProblemRequest
  ): Promise<ProgrammingProblem> {
    return await client.deserialize<ProgrammingProblem>(
      'POST',
      '/generate-problem',
      {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      }
    );
  },
};
