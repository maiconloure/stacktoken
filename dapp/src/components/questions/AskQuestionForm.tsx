
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { X, Plus, Calendar, Award } from 'lucide-react';

export const AskQuestionForm: React.FC = () => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Here you would call the smart contract to create the question
      console.log('Submitting question:', {
        title,
        description,
        reward,
        deadline
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset form
      setTitle('');
      setDescription('');
      setReward('');
      setDeadline('');
    } catch (error) {
      console.error('Failed to submit question:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <div className="stack-gradient p-2 rounded-lg">
            <Plus className="h-5 w-5 text-white" />
          </div>
          <span>{t('question.ask')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{t('question.title')}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your question? Be specific."
              required
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground">
              Be specific and imagine you're asking a question to another person.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('question.description')}</Label>
            <RichTextEditor
              placeholder="Provide details about your question. Include what you've tried and what you expect to happen."
              onChange={setDescription}
            />
            <p className="text-xs text-muted-foreground">
              Include all the information someone would need to answer your question.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reward" className="flex items-center space-x-2">
                <Award className="h-4 w-4" />
                <span>{t('question.reward')}</span>
              </Label>
              <Input
                id="reward"
                type="number"
                step="0.01"
                min="0.1"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                placeholder="0.1"
                required
              />
              <p className="text-xs text-muted-foreground">
                Minimum 0.1 EGLD to incentivize quality answers.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{t('question.deadline')}</span>
              </Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
              <p className="text-xs text-muted-foreground">
                When should answers stop being accepted?
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline">
              {t('common.cancel')}
            </Button>
            <Button 
              type="submit" 
              className="stack-gradient text-white"
              disabled={isSubmitting || !title || !description || !reward || !deadline}
            >
              {isSubmitting ? t('common.loading') : t('question.submit')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
