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
import dedent from 'dedent';
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { LANGUAGES } from '../lib/constants';
import type { ProgrammingProblem } from '../lib/types';
import {
  capitalize,
  getStoredCode,
  getStoredLanguage,
  punctuate,
  storeCode,
  storeLanguage,
} from '../lib/utils';
import { DifficultyBadge } from './difficulty-badge';
import { Markdown } from './markdown';
import { useTheme } from './theme-provider';
import { Button } from './ui/button';

interface HintsToggleProps {
  hints: string[];
}

const HintsToggle = ({ hints }: HintsToggleProps) => {
  const [showHints, setShowHints] = useState(false);

  if (hints.length === 0) return null;

  return (
    <div className='mt-4'>
      <Button
        variant='outline'
        onClick={() => setShowHints(!showHints)}
        className='w-full justify-between'
      >
        <span className='flex items-center'>
          <Lightbulb className='mr-2 h-4 w-4' />
          {showHints ? 'Hide Hints' : 'Show Hints'}
        </span>
        {showHints ? (
          <ChevronUp className='h-4 w-4' />
        ) : (
          <ChevronDown className='h-4 w-4' />
        )}
      </Button>
      {showHints && (
        <ul className='mt-2 list-inside list-disc space-y-2'>
          {hints.map((hint, index) => (
            <li key={index} className='text-sm'>
              {hint}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

interface ProblemProps {
  problem: ProgrammingProblem;
}

const Problem = ({ problem }: ProblemProps) => {
  return (
    <Card className='h-full w-full border-none shadow-none'>
      <CardHeader>
        <div className='flex items-center space-x-2'>
          <CardTitle>{problem.problem.title}</CardTitle>
          <DifficultyBadge difficulty={problem.problem.difficulty} />
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
                  <ReactMarkdown>
                    {dedent(`
                          \`\`\`
                          Input: ${testCase.input}
                          Output: ${testCase.expected_output}
                          \`\`\` `)}
                  </ReactMarkdown>
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
          <HintsToggle hints={problem.hints} />
        </div>
      </CardContent>
    </Card>
  );
};

export interface WorkspaceProps {
  problem: ProgrammingProblem;
  defaultLanguage: string;
}

export const Workspace = ({ problem, defaultLanguage }: WorkspaceProps) => {
  const { theme } = useTheme();

  const [selectedLanguage, setSelectedLanguage] = useState(
    () => getStoredLanguage(problem.problem.id) || defaultLanguage
  );

  const [code, setCode] = useState(() => {
    const storedCode = getStoredCode(problem.problem.id, selectedLanguage);

    if (storedCode) return storedCode;

    const template = problem.solution_templates.find(
      (t) => t.language.toLowerCase() === selectedLanguage.toLowerCase()
    );

    return template ? template.function_signature : '';
  });

  useEffect(() => {
    storeCode(problem.problem.id, selectedLanguage, code);
  }, [code]);

  useEffect(() => {
    const storedLanguage =
      getStoredLanguage(problem.problem.id) || defaultLanguage;

    setSelectedLanguage(storedLanguage);

    const storedCode = getStoredCode(problem.problem.id, storedLanguage);

    if (storedCode) {
      setCode(storedCode);
    } else {
      const template = problem.solution_templates.find(
        (t) => t.language.toLowerCase() === storedLanguage.toLowerCase()
      );

      setCode(template ? template.function_signature : '');
    }

    storeCode(problem.problem.id, storedLanguage, code);
    storeLanguage(problem.problem.id, storedLanguage);
  }, [problem.problem.id]);

  const handleLanguageChange = (newLanguage: string) => {
    setSelectedLanguage(newLanguage);

    const storedCode = getStoredCode(problem.problem.id, newLanguage);

    if (storedCode) {
      setCode(storedCode);
    } else {
      const template = problem.solution_templates.find(
        (t) => t.language.toLowerCase() === newLanguage.toLowerCase()
      );

      if (template) {
        setCode(template.function_signature);
      } else {
        setCode('');
      }
    }

    storeLanguage(problem.problem.id, newLanguage);
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
    <ResizablePanelGroup
      direction='horizontal'
      className='min-h-[800px] rounded-lg border'
    >
      <ResizablePanel minSize={25} defaultSize={50}>
        <div className='h-full overflow-auto p-2'>
          <Problem problem={problem} />
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
                    onSelect={() => handleLanguageChange(lang)}
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
  );
};
