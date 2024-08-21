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
    console.log(`Sending POST request to: ${prefix + endpoint}`);
    console.log('Request init:', init);
    try {
      const response = await fetch(prefix + endpoint, {
        method: 'POST',
        ...init,
      });
      console.log(response.text);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      return response;
    } catch (error) {
      console.error('Fetch error:', error);
      if (error instanceof TypeError) {
        console.error('Network error details:', {
          message: error.message,
          // cause: error.cause,
          stack: error.stack,
        });
      }
      throw error;
    }
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
      try {
        const r = await fn(endpoint, init);
        console.log('Response:', r);
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        const data = await r.json();
        console.log('Parsed data:', data);
        return data as T;
      } catch (error) {
        console.error('Deserialization error:', error);
        throw error;
      }
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
    console.log('Generating problem with params:', params);
    try {
      const result = await client.deserialize<ProgrammingProblem>(
        'POST',
        '/generate-problem',
        {
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        }
      );
      console.log('Generated problem:', result);
      return result;
    } catch (error) {
      console.error('Error in generateProblem:', error);
      throw error;
    }
  },
};
