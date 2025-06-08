import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import { X, Plus, Calendar, Award, HelpCircle } from 'lucide-react';
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
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [reward, setReward] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contractService = new ContractService();

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim()) && tags.length < 5) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTags([]);
    setCurrentTag('');
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

      // Call the contract service to post the question
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
    // If trying to close the modal
    if (!newOpenState) {
      // If currently submitting, prevent closing
      if (isSubmitting) {
        return;
      }
      
      // If user has entered any data, show confirmation
      const hasData = title.trim() || description.trim() || tags.length > 0 || reward || deadline;
      if (hasData) {
        const confirmClose = window.confirm(t('common.confirmClose') || 'You have unsaved changes. Are you sure you want to close?');
        if (!confirmClose) {
          return;
        }
      }
      
      resetForm();
    }
    
    onOpenChange(newOpenState);
  }, [title, description, tags, reward, deadline, isSubmitting, t, onOpenChange]);

  // Enhanced ESC key handling with confirmation
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

  // Calculate minimum deadline (24 hours from now)
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
          {/* Title */}
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

          {/* Description */}
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

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-medium">
              {t('question.tags')} ({tags.length}/5)
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="px-2 py-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    disabled={isSubmitting}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('question.addTag')}
                maxLength={20}
                disabled={isSubmitting || tags.length >= 5}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTag}
                disabled={isSubmitting || !currentTag.trim() || tags.length >= 5}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Reward and Deadline Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Reward */}
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

            {/* Deadline */}
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

          {/* Submission Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              {t('question.submissionInfo')}
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• {t('question.rewardWillBeLocked')}</li>
              <li>• {t('question.deadlineMinimum24Hours')}</li>
              <li>• {t('question.canApproveAnswer')}</li>
              <li>• {t('question.tagsOptionalMaxFive')}</li>
            </ul>
          </div>

          {/* Action Buttons */}
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
