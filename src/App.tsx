import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, RotateCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import JudgeIcon from './assets/icon.svg';
import { ModeToggle } from './components/mode-toggle';
import { Workspace } from './components/workspace';
import { repo } from './lib/repo';
import type { GenerateProblemRequest, ProgrammingProblem } from './lib/types';
import { Settings } from './settings';

const App = () => {
  const [problem, setProblem] = useState<ProgrammingProblem | null>(null);

  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState<GenerateProblemRequest>(() => {
    const savedSettings = localStorage.getItem('problemSettings');

    const defaultSettings = {
      difficulty: 'medium',
      category: 'Sorting',
      num_test_cases: 3,
      languages: ['Python'],
      time_limit: 1.0,
      memory_limit: 256.0,
    };

    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  useEffect(() => {
    const problem = localStorage.getItem('problem');

    if (problem) {
      setProblem(JSON.parse(problem));
    } else {
      handleGenerateProblem();
    }
  }, []);

  const handleGenerateProblem = async () => {
    setLoading(true);

    try {
      const generatedProblem = await repo.generateProblem(settings);
      setProblem(generatedProblem);
      localStorage.setItem('problem', JSON.stringify(generatedProblem));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container mx-auto p-4'>
      <div className='m-2 flex items-center justify-between'>
        <div>
          <div className='flex items-center space-x-2'>
            <img
              src={JudgeIcon}
              style={{ height: 53, width: 36 }}
              alt='website logo'
            />
            <h1 className='text-3xl font-bold'>judge</h1>
          </div>
          <p className='italic text-muted-foreground'>
            Solve AI-generated programming problems
          </p>
        </div>
        <div>
          <ModeToggle />
          <Settings formData={settings} setFormData={setSettings} />
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
              <RotateCw size={20} className='animate-spin' />
            ) : (
              <RotateCw size={20} />
            )}
          </Button>
          <Button variant='ghost'>
            <ArrowRight size={20} />
          </Button>
        </div>
        {problem && (
          <Workspace
            problem={problem}
            defaultLanguage={
              settings.languages ? settings.languages[0] : 'Python'
            }
          />
        )}
      </div>
    </div>
  );
};

export default App;
