import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import { Calendar, Award, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ContractService } from '@/services/contractService';
import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PostQuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PostQuestionModal: React.FC<PostQuestionModalProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { account } = useGetAccountInfo();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contractService = new ContractService();

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setReward('');
    setDeadline('');
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account?.address) {
      toast({
        title: t('error.walletNotConnected'),
        description: t('error.pleaseConnectWallet'),
        variant: 'destructive',
      });
      return;
    }

    if (!title.trim() || !description.trim() || !reward || !deadline) {
      toast({
        title: t('error.requiredFields'),
        description: t('error.fillAllFields'),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const deadlineTimestamp = new Date(deadline).getTime();
      const rewardAmount = parseFloat(reward);

      await contractService.postQuestion(
        title.trim(),
        description.trim(),
        deadlineTimestamp,
        rewardAmount
      );

      toast({
        title: t('success.questionPosted'),
        description: t('success.questionPostedDescription'),
      });

      resetForm();
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error posting question:', error);
      toast({
        title: t('error.postQuestion'),
        description: t('error.tryAgain'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = useCallback((newOpenState: boolean) => {
    if (!newOpenState) {
      if (isSubmitting) {
        return;
      }
      
      const hasData = title.trim() || description.trim() || reward || deadline;
      if (hasData) {
        const confirmClose = window.confirm(t('common.confirmClose') || 'You have unsaved changes. Are you sure you want to close?');
        if (!confirmClose) {
          return;
        }
      }
      
      resetForm();
    }
    
    onOpenChange(newOpenState);
  }, [title, description, reward, deadline, isSubmitting, t, onOpenChange]);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        event.preventDefault();
        handleClose(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [open, handleClose]);

  const minDeadline = new Date();
  minDeadline.setDate(minDeadline.getDate() + 1);
  const minDeadlineStr = minDeadline.toISOString().slice(0, 16);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            {t('question.postNew')}
          </DialogTitle>
          <DialogDescription>
            {t('question.postNewDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              {t('question.title')} *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('question.titlePlaceholder')}
              maxLength={150}
              disabled={isSubmitting}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground text-right">
              {title.length}/150
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              {t('question.description')} *
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('question.descriptionPlaceholder')}
              rows={4}
              maxLength={1000}
              disabled={isSubmitting}
              className="w-full resize-none"
            />
            <div className="text-xs text-muted-foreground text-right">
              {description.length}/1000
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reward" className="text-sm font-medium flex items-center gap-1">
                <Award className="h-4 w-4 text-orange-600" />
                {t('question.reward')} * (EGLD)
              </Label>
              <Input
                id="reward"
                type="number"
                step="0.01"
                min="0.01"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                placeholder="0.1"
                disabled={isSubmitting}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4 text-blue-600" />
                {t('question.deadline')} *
              </Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={minDeadlineStr}
                disabled={isSubmitting}
                className="w-full"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              {t('question.submissionInfo')}
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• {t('question.rewardWillBeLocked')}</li>
              <li>• {t('question.deadlineMinimum24Hours')}</li>
              <li>• {t('question.canApproveAnswer')}</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              className="stack-gradient text-white w-full sm:w-auto"
              disabled={
                isSubmitting || 
                !title.trim() || 
                !description.trim() || 
                !reward || 
                !deadline
              }
            >
              {isSubmitting 
                ? t('common.posting')
                : `${t('question.postFor')} ${reward || '0'} EGLD`
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
