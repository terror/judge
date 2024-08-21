export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  tags: string[];
  constraints: string[];
}

export interface TestCase {
  input: string;
  expected_output: string;
  is_hidden: boolean;
}

export interface SolutionTemplate {
  language: string;
  function_signature: string;
}

export interface ProgrammingProblem {
  problem: Problem;
  test_cases: TestCase[];
  solution_templates: SolutionTemplate[];
  hints: string[];
  time_limit: number;
  memory_limit: number;
}

export interface GenerateProblemRequest {
  difficulty?: string;
  category?: string;
  num_test_cases?: number;
  languages?: string[];
  time_limit?: number;
  memory_limit?: number;
  additional_instructions?: string;
}
