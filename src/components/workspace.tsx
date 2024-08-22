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
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { LANGUAGES } from '../lib/constants';
import type { ProgrammingProblem } from '../lib/types';
import { capitalize, punctuate } from '../lib/utils';
import { DifficultyBadge } from './difficulty-badge';
import { Markdown } from './markdown';
import { useTheme } from './theme-provider';
import { Button } from './ui/button';

export interface WorkspaceProps {
  problem: ProgrammingProblem;
}

export const Workspace = ({ problem }: WorkspaceProps) => {
  const { theme } = useTheme();

  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('Python');

  useEffect(() => {
    const code = localStorage.getItem(`${problem.problem.id}-code`);

    if (code) setCode(code);

    const language = localStorage.getItem(`${problem.problem.id}-language`);

    if (language) {
      setSelectedLanguage(language);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('problem', JSON.stringify(problem));

    const template = problem.solution_templates.find(
      (t) => t.language.toLowerCase() === selectedLanguage.toLowerCase()
    );

    if (template) {
      const code = localStorage.getItem(`${problem.problem.id}-code`);

      console.log('got code', code);

      if (code === '') {
        setCode(template.function_signature);
        localStorage.setItem(
          `${problem.problem.id}-code`,
          template.function_signature
        );
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(`${problem.problem.id}-code`, code);
  }, [code]);

  useEffect(() => {
    localStorage.setItem(`${problem.problem.id}-language`, selectedLanguage);
  }, [selectedLanguage]);

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
  );
};
