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
import { SettingsIcon } from 'lucide-react';

import { Button } from './components/ui/button';
import { LANGUAGES, TOPICS } from './lib/constants';
import { GenerateProblemRequest } from './lib/types';

interface SettingsProps {
  formData: GenerateProblemRequest;
  setFormData: (data: GenerateProblemRequest) => void;
}

export const Settings = ({ formData, setFormData }: SettingsProps) => {
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
          <SettingsIcon className='h-5 w-5' />
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
