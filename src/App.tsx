import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';
import React, { useState } from 'react';

import { repo } from './lib/repo';
import type { GenerateProblemRequest, ProgrammingProblem } from './lib/types';

const App = () => {
  const [problem, setProblem] = useState<ProgrammingProblem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<GenerateProblemRequest>({
    difficulty: 'medium',
    category: 'sorting algorithms',
    num_test_cases: 3,
    languages: ['Python', 'Java', 'C++'],
    time_limit: 1.0,
    memory_limit: 256.0,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleGenerateProblem = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Attempting to generate problem with formData:', formData);
      const generatedProblem = await repo.generateProblem(formData);
      console.log('Successfully generated problem:', generatedProblem);
      setProblem(generatedProblem);
    } catch (err) {
      console.error('Error in handleGenerateProblem:', err);
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container mx-auto p-4'>
      <div className='m-4'>
        <h1 className='text-3xl font-bold'>judge</h1>
        <p className='text-muted-foreground'>
          Solve AI-generated programming problems 🤖
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Generate 🛠️</CardTitle>
          <CardDescription>
            Fill in the details to generate a custom problem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='difficulty'>Difficulty</Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange('difficulty', value)
                  }
                  defaultValue={formData.difficulty}
                >
                  <SelectTrigger id='difficulty'>
                    <SelectValue placeholder='Select difficulty' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='easy'>Easy</SelectItem>
                    <SelectItem value='medium'>Medium</SelectItem>
                    <SelectItem value='hard'>Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor='category'>Category</Label>
                <Input
                  id='category'
                  name='category'
                  value={formData.category}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='num_test_cases'>Number of Test Cases</Label>
                <Input
                  id='num_test_cases'
                  name='num_test_cases'
                  type='number'
                  value={formData.num_test_cases}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor='languages'>Languages (comma-separated)</Label>
                <Input
                  id='languages'
                  name='languages'
                  value={formData.languages?.join(', ')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      languages: e.target.value
                        .split(',')
                        .map((lang) => lang.trim()),
                    })
                  }
                />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='time_limit'>Time Limit (seconds)</Label>
                <Input
                  id='time_limit'
                  name='time_limit'
                  type='number'
                  step='0.1'
                  value={formData.time_limit}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor='memory_limit'>Memory Limit (MB)</Label>
                <Input
                  id='memory_limit'
                  name='memory_limit'
                  type='number'
                  value={formData.memory_limit}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <Label htmlFor='additional_instructions'>
                Additional Instructions
              </Label>
              <Textarea
                id='additional_instructions'
                name='additional_instructions'
                value={formData.additional_instructions}
                onChange={handleInputChange}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerateProblem} disabled={loading}>
            {loading ? 'Generating...' : 'Generate'}
          </Button>
        </CardFooter>
      </Card>

      {error && (
        <Alert variant='destructive' className='mt-4'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {problem && (
        <Card className='mt-4'>
          <CardHeader>
            <CardTitle>{problem.problem.title}</CardTitle>
            <CardDescription>
              Difficulty: {problem.problem.difficulty} | Category:{' '}
              {problem.problem.category}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <h3 className='text-lg font-semibold'>Description</h3>
                <p>{problem.problem.description}</p>
              </div>
              <div>
                <h3 className='text-lg font-semibold'>Constraints</h3>
                <ul className='list-inside list-disc'>
                  {problem.problem.constraints.map((constraint, index) => (
                    <li key={index}>{constraint}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className='text-lg font-semibold'>Sample Test Cases</h3>
                {problem.test_cases
                  .filter((tc) => !tc.is_hidden)
                  .map((testCase, index) => (
                    <div key={index} className='mt-2 rounded bg-gray-100 p-2'>
                      <p>
                        <strong>Input:</strong> {testCase.input}
                      </p>
                      <p>
                        <strong>Expected Output:</strong>{' '}
                        {testCase.expected_output}
                      </p>
                    </div>
                  ))}
              </div>
              <div>
                <h3 className='text-lg font-semibold'>Function Signatures</h3>
                {problem.solution_templates.map((template, index) => (
                  <div key={index} className='mt-2 rounded bg-gray-100 p-2'>
                    <p>
                      <strong>{template.language}:</strong>{' '}
                      <code>{template.function_signature}</code>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default App;
