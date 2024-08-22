import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import 'katex/dist/katex.min.css';
import 'katex/dist/katex.min.css';
import { Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

import { repo } from './lib/repo';
import type { GenerateProblemRequest, ProgrammingProblem } from './lib/types';
import { capitalize, punctuate } from './lib/utils';

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

const Markdown = ({ children }: { children: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeHighlight, rehypeKatex]}
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

interface SettingsModalProps {
  formData: GenerateProblemRequest;
  setFormData: (data: GenerateProblemRequest) => void;
}

const SettingsModal = ({ formData, setFormData }: SettingsModalProps) => {
  const handleChange = (key: string, value: string) => {
    const newFormData = {
      ...formData,
      [key]: key === 'languages' ? [value] : value,
    };
    setFormData(newFormData);
    localStorage.setItem('problemSettings', JSON.stringify(newFormData));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='ghost' size='icon'>
          <Settings className='h-5 w-5' />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Settings ⚙️</DialogTitle>
          <DialogDescription>
            Adjust the parameters for problem generation.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='difficulty' className='text-right'>
              Difficulty
            </Label>
            <Select
              onValueChange={(value) => handleChange('difficulty', value)}
              defaultValue={formData.difficulty}
            >
              <SelectTrigger className='col-span-3'>
                <SelectValue placeholder='Select difficulty' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='easy'>Easy</SelectItem>
                <SelectItem value='medium'>Medium</SelectItem>
                <SelectItem value='hard'>Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='category' className='text-right'>
              Topic
            </Label>
            <Select
              onValueChange={(value) => handleChange('category', value)}
              defaultValue={formData.category}
            >
              <SelectTrigger className='col-span-3'>
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
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='language' className='text-right'>
              Language
            </Label>
            <Select
              onValueChange={(value) => handleChange('languages', value)}
              defaultValue={
                formData.languages ? formData.languages[0] : 'Python'
              }
            >
              <SelectTrigger className='col-span-3'>
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
      </DialogContent>
    </Dialog>
  );
};

const App = () => {
  const [problem, setProblem] = useState<ProgrammingProblem | null>(null);

  const [_loading, setLoading] = useState(false);
  const [_error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<GenerateProblemRequest>(() => {
    const savedSettings = localStorage.getItem('problemSettings');

    return savedSettings
      ? JSON.parse(savedSettings)
      : {
          difficulty: 'medium',
          category: 'Sorting',
          num_test_cases: 3,
          languages: ['Python'],
          time_limit: 1.0,
          memory_limit: 256.0,
        };
  });

  useEffect(() => {
    const savedProblem = localStorage.getItem('currentProblem');

    if (savedProblem) {
      setProblem(JSON.parse(savedProblem));
    } else {
      handleGenerateProblem();
    }
  }, []);

  useEffect(() => {
    if (problem) {
      localStorage.setItem('currentProblem', JSON.stringify(problem));
    }
  }, [problem]);

  const handleGenerateProblem = async () => {
    setLoading(true);
    setError(null);

    try {
      const generatedProblem = await repo.generateProblem(formData);
      setProblem(generatedProblem);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container mx-auto p-4'>
      <div className='m-4 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>judge</h1>
          <p className='text-muted-foreground'>
            Solve AI-generated programming problems 🤖
          </p>
        </div>
        <SettingsModal formData={formData} setFormData={setFormData} />
      </div>
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
                <Markdown>{problem.problem.description}</Markdown>
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
                <ul className='m-4 list-disc'>
                  {problem.problem.constraints.map((constraint, index) => (
                    <li key={index}>
                      <Markdown>{capitalize(punctuate(constraint))}</Markdown>
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
