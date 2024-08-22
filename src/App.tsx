import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import CodeMirror from '@uiw/react-codemirror';
import { ArrowLeft, ArrowRight, ChevronDown, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { DifficultyBadge } from './components/difficulty-badge';
import { Markdown } from './components/markdown';
import { ModeToggle } from './components/mode-toggle';
import { useTheme } from './components/theme-provider';
import { repo } from './lib/repo';
import type { GenerateProblemRequest, ProgrammingProblem } from './lib/types';
import { capitalize, punctuate } from './lib/utils';
import { Settings } from './settings';
import { LANGUAGES } from './lib/constants';

const App = () => {
  const { theme } = useTheme();

  const [problem, setProblem] = useState<ProgrammingProblem | null>(null);
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('Python');

  const [loading, setLoading] = useState(false);
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
    const savedCode = localStorage.getItem('currentCode');
    const savedLanguage = localStorage.getItem('selectedLanguage');

    if (savedProblem) {
      setProblem(JSON.parse(savedProblem));
    } else {
      handleGenerateProblem();
    }

    if (savedCode) {
      setCode(savedCode);
    }

    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    if (problem) {
      localStorage.setItem('currentProblem', JSON.stringify(problem));
      const template = problem.solution_templates.find(
        (t) => t.language.toLowerCase() === selectedLanguage.toLowerCase()
      );
      if (template) {
        setCode(template.function_signature);
        localStorage.setItem('currentCode', template.function_signature);
      }
    }
  }, [problem, selectedLanguage]);

  useEffect(() => {
    localStorage.setItem('currentCode', code);
  }, [code]);

  useEffect(() => {
    localStorage.setItem('selectedLanguage', selectedLanguage);
  }, [selectedLanguage]);

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

  const getLanguageExtension = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'python':
        return python();
      case 'javascript':
      case 'typescript':
        return javascript({ jsx: true });
      case 'java':
        return java();
      case 'c++':
        return cpp();
      default:
        return javascript({ jsx: true });
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
        <div>
          <ModeToggle />
          <Settings formData={formData} setFormData={setFormData} />
        </div>
      </div>
      <div className='flex flex-col items-center space-y-2'>
        <div className='flex space-x-2'>
          <Button variant='ghost'>
            <ArrowLeft size={20} />
          </Button>
          <Button
            variant='ghost'
            onClick={handleGenerateProblem}
            disabled={loading}
          >
            {loading ? (
              <RotateCcw size={20} className='animate-spin' />
            ) : (
              <RotateCcw size={20} />
            )}
          </Button>
          <Button variant='ghost'>
            <ArrowRight size={20} />
          </Button>
        </div>
        {problem && (
          <ResizablePanelGroup
            direction='horizontal'
            className='min-h-[800px] rounded-lg border'
          >
            <ResizablePanel minSize={25} defaultSize={50}>
              <div className='h-full overflow-auto p-2'>
                <Card className='h-full w-full border-none shadow-none'>
                  <CardHeader>
                    <div className='flex items-center space-x-2'>
                      <CardTitle>{problem.problem.title}</CardTitle>
                      <DifficultyBadge
                        difficulty={problem.problem.difficulty}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      <div>
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
                          {problem.problem.constraints.map(
                            (constraint, index) => (
                              <li key={index}>
                                <Markdown>
                                  {'$' +
                                    capitalize(punctuate(constraint)) +
                                    '$'}
                                </Markdown>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel minSize={25} defaultSize={50}>
              <div className='flex h-full w-full flex-col'>
                <div className='flex'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='ghost'
                        className='w-[150px] justify-between border-none hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0'
                      >
                        {selectedLanguage}
                        <ChevronDown className='ml-2 h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='w-[150px]'>
                      {LANGUAGES.map((lang) => (
                        <DropdownMenuItem
                          key={lang}
                          onSelect={() => setSelectedLanguage(lang)}
                        >
                          {lang}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CodeMirror
                  value={code}
                  height='100%'
                  extensions={[getLanguageExtension(selectedLanguage)]}
                  onChange={(value) => setCode(value)}
                  theme={theme === 'dark' ? 'dark' : 'light'}
                  className='flex-grow'
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
};

export default App;
