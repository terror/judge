import logging
import os
import sys
import uuid
from typing import List, Optional

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from openai import OpenAI
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__)
CORS(app)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class Problem(BaseModel):
  id: str = Field(..., description="Unique identifier for the problem")
  title: str = Field(..., description="Title of the programming problem")
  description: str = Field(
    ..., description="Detailed description of the problem"
  )
  difficulty: str = Field(..., description="Difficulty level of the problem")
  category: str = Field(..., description="Category or topic of the problem")
  tags: List[str] = Field(
    ..., description="List of tags associated with the problem"
  )
  constraints: List[str] = Field(
    ..., description="List of constraints for the problem"
  )

class TestCase(BaseModel):
  input: str = Field(..., description="Input for the test case")
  expected_output: str = Field(
    ..., description="Expected output for the test case"
  )
  is_hidden: bool = Field(
    ..., description="Whether the test case should be hidden from the user"
  )

class SolutionTemplate(BaseModel):
  language: str = Field(
    ..., description="Programming language for the solution template"
  )
  function_signature: str = Field(
    ..., description="Function signature for the solution"
  )

class ProgrammingProblem(BaseModel):
  problem: Problem = Field(
    ..., description="Core information about the problem"
  )
  test_cases: List[TestCase] = Field(
    ..., description="List of test cases for the problem"
  )
  solution_templates: List[SolutionTemplate] = Field(
    ...,
    description="Function signatures for the solution in multiple languages"
  )
  hints: List[str] = Field(
    ..., description="Optional hints for solving the problem"
  )
  time_limit: float = Field(
    ..., description="Time limit for the solution in seconds"
  )
  memory_limit: float = Field(
    ..., description="Memory limit for the solution in megabytes"
  )

def _generate_problem(
  difficulty: str = "medium",
  category: str = "sorting algorithms",
  num_test_cases: int = 3,
  languages: List[str] = ["Python", "Java", "C++"],
  time_limit: float = 1.0,
  memory_limit: float = 256.0,
  additional_instructions: Optional[str] = None
) -> ProgrammingProblem:
  logger.info(
    f"Generating problem with parameters: difficulty={difficulty}, category={category}, num_test_cases={num_test_cases}, languages={languages}, time_limit={time_limit}, memory_limit={memory_limit}"
  )

  instruction = f"""
    Create a programming problem with the following specifications:
    - Difficulty: {difficulty}
    - Category: {category}
    - Number of test cases: {num_test_cases}
    - Solution templates in: {', '.join(languages)}
    - Time limit: {time_limit} seconds
    - Memory limit: {memory_limit} MB

    {additional_instructions or ''}

    For the solution templates, provide ONLY the function signatures, not the full implementation.

    For example:

    - Python: def solve_problem(input_data):
                pass

    - Java: public static String solveProblem(String inputData) {{
            }}

    - C++: string solveProblem(string inputData) {{
           }}

    For the constraints, give them as valid LaTeX code.

    Example valid LaTeX strings:
    - The input data will contain at most $10^5$ elements.
    - The elements will be in the range $[1, 10^9]$.
    - $1 \\leq n \\leq 10^5$
    - $-10^9 \\leq \text{{arr}}[i] \\leq 10^9$
    - $0 \\leq \text{{index}} < \text{{length}}(\text{{array}})$
    - $1 \\leq \text{{num\\_vertices}} \\leq 1000$
    - $0 \\leq \text{{edge\\_weight}} \\leq 10^6$
    - $2 \\leq \text{{num\\_nodes}} \\leq 100$
    - $1 \\leq \text{{string\\_length}} \\leq 10^4$
    - $0 \\leq x, y \\leq 1000$
    - $1 \\leq \text{{num\\_queries}} \\leq 10^5$
    - $1 \\leq a_i \\leq 1000$

    Always wrap valid LaTeX code in $ symbols.

    Provide your response as a JSON object.
    """

  completion = client.beta.chat.completions.parse(
    model="gpt-4o-2024-08-06",
    messages=[{
      "role":
      "system",
      "content":
      "You are a helpful assistant that generates programming problems in a structured JSON format."
    }, {
      "role": "user", "content": instruction
    }],
    response_format=ProgrammingProblem,
  )

  problem = completion.choices[0].message.parsed

  if not problem:
    raise Exception("Problem generation failed")

  problem.problem.id = str(uuid.uuid4())

  return problem

@app.route('/generate-problem', methods=['POST'])
def generate_problem():
  logger.info(f"Received request to generate problem: {request.json}")

  data = request.json

  if not data:
    return jsonify({"error": "No data provided"}), 400

  try:
    problem = _generate_problem(
      difficulty=data.get('difficulty', 'medium'),
      category=data.get('category', 'sorting algorithms'),
      num_test_cases=data.get('num_test_cases', 3),
      languages=data.get('languages', ["Python", "Java", "C++"]),
      time_limit=data.get('time_limit', 1.0),
      memory_limit=data.get('memory_limit', 256.0),
      additional_instructions=data.get('additional_instructions')
    )

    if not problem:
      return jsonify({"error": "Problem generation failed"}), 500

    response = jsonify(problem.model_dump())

    return response
  except Exception as e:
    return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
  return jsonify({"status": "healthy"}), 200

if __name__ == "__main__":
  port = 8000

  if len(sys.argv) > 1:
    try:
      port = int(sys.argv[1])
    except ValueError:
      print(f"Invalid port number: {sys.argv[1]}. Using default port {port}.")

  print(f"Starting server on port {port}")

  app.run(debug=True, port=port)
