import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PostQuestionModal } from '@/components/questions/PostQuestionModal';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';

export const PostQuestionButton: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="stack-gradient text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        {t('question.postQuestion')}
      </Button>
      
      <PostQuestionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
};
