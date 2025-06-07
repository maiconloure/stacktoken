
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { ArrowUp, MessageSquare, Eye, Clock, Award } from 'lucide-react';

interface Question {
  id: string;
  title: string;
  description: string;
  tags: string[];
  author: string;
  votes: number;
  answers: number;
  views: number;
  reward: number;
  deadline: string;
  status: 'open' | 'closed' | 'answered';
  createdAt: string;
}

interface QuestionCardProps {
  question: Question;
  onClick?: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onClick }) => {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-500';
      case 'answered':
        return 'bg-blue-500';
      case 'closed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return t('time.now');
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} ${t('time.minutes')} ${t('time.ago')}`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ${t('time.hours')} ${t('time.ago')}`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ${t('time.days')} ${t('time.ago')}`;
    return `${Math.floor(diffInSeconds / 2592000)} ${t('time.months')} ${t('time.ago')}`;
  };

  return (
    <Card className="question-card animate-fade-in">
      <CardContent className="p-6">
        <div className="flex space-x-4">
          {/* Stats Column */}
          <div className="flex flex-col items-center space-y-2 min-w-[80px]">
            <div className="text-center">
              <div className="text-lg font-semibold">{question.votes}</div>
              <div className="text-xs text-muted-foreground">{t('question.votes')}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{question.answers}</div>
              <div className="text-xs text-muted-foreground">{t('question.answers')}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{question.views}</div>
              <div className="text-xs text-muted-foreground">{t('question.views')}</div>
            </div>
          </div>

          {/* Content Column */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 
                className="text-lg font-semibold hover:text-primary cursor-pointer transition-colors line-clamp-2"
                onClick={onClick}
              >
                {question.title}
              </h3>
              <div className="flex items-center space-x-2 ml-4">
                <Badge variant="outline" className={getStatusColor(question.status)}>
                  {t(`question.status.${question.status}`)}
                </Badge>
                {question.reward > 0 && (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    <Award className="h-3 w-3 mr-1" />
                    {question.reward} EGLD
                  </Badge>
                )}
              </div>
            </div>

            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {question.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {question.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Meta Info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-4">
                <span>asked by {question.author}</span>
                <span>{formatTimeAgo(question.createdAt)}</span>
                {question.deadline && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>ends {formatTimeAgo(question.deadline)}</span>
                  </div>
                )}
              </div>
              <Button variant="ghost" size="sm" className="vote-button">
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
