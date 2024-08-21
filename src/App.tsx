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
import 'katex/dist/katex.min.css';
import { AlertCircle } from 'lucide-react';
import React, { useState } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import ReactMarkdown from 'react-markdown';

import { repo } from './lib/repo';
import type { GenerateProblemRequest, ProgrammingProblem } from './lib/types';

const LANGUAGES = ['Python', 'Java', 'C++', 'JavaScript', 'TypeScript'];

const TOPICS = [
  'Tries',
  'Arrays & Hashing',
  'Two Pointers',
  'Stack',
  'Binary Search',
  'Sliding Window',
  'Linked List',
  'Heap / Priority Queue',
  'Trees',
  'Intervals',
  'Greedy',
  'Advanced Graphs',
  'Graphs',
  'Backtracking',
  '1-D DP',
  '2-D DP',
  'Bit Manipulation',
  'Math & Geometry',
];

const MarkdownWithLatex = ({ children }: { children: string }) => {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className='mb-4'>{children}</p>,
        math: ({ value }) => <BlockMath math={value} />,
        inlineMath: ({ value }) => <InlineMath math={value} />,
      }}
    >
      {children}
    </ReactMarkdown>
  );
};

const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
  const badgeColors = {
    easy: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-orange-100 text-orange-800 border-orange-200',
    hard: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <span
      className={`rounded-full border px-2 py-1 text-xs font-semibold ${badgeColors[difficulty as keyof typeof badgeColors]}`}
    >
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </span>
  );
};

const App = () => {
  const [problem, setProblem] = useState<ProgrammingProblem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<GenerateProblemRequest>({
    difficulty: 'medium',
    category: 'Sorting',
    num_test_cases: 3,
    languages: ['Python'],
    time_limit: 1.0,
    memory_limit: 256.0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleLanguageChange = (value: string) => {
    setFormData({ ...formData, languages: [value] });
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
                <Label htmlFor='category'>Topic</Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange('category', value)
                  }
                  defaultValue={formData.category}
                >
                  <SelectTrigger id='category'>
                    <SelectValue placeholder='Select topic' />
                  </SelectTrigger>
                  <SelectContent>
                    {TOPICS.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Label htmlFor='languages'>Language</Label>
                <Select
                  onValueChange={handleLanguageChange}
                  defaultValue={formData.languages[0]}
                >
                  <SelectTrigger id='languages'>
                    <SelectValue placeholder='Select language' />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <div className='flex items-center space-x-2'>
              <CardTitle>{problem.problem.title}</CardTitle>
              <DifficultyBadge difficulty={problem.problem.difficulty} />
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <h3 className='text-lg font-semibold'>Description</h3>
                <MarkdownWithLatex>
                  {problem.problem.description}
                </MarkdownWithLatex>
              </div>

              <div>
                <h3 className='text-lg font-semibold'>Examples</h3>
                {problem.test_cases
                  .filter((tc) => !tc.is_hidden)
                  .map((testCase, index) => (
                    <div key={index} className='mt-4'>
                      <ReactMarkdown>{`
\`\`\`
Input: ${testCase.input}
Output: ${testCase.expected_output}
\`\`\`
                      `}</ReactMarkdown>
                    </div>
                  ))}
              </div>
              <div>
                <h3 className='text-lg font-semibold'>Constraints</h3>
                <ul className='list-inside list-disc'>
                  {problem.problem.constraints.map((constraint, index) => (
                    <li key={index}>
                      <span className='mr-2'>•</span>
                      <MarkdownWithLatex>{constraint}</MarkdownWithLatex>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default App;
