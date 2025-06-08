import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MessageSquare, 
  ThumbsUp, 
  Coins
} from 'lucide-react';
import { useGetNetworkConfig } from '@multiversx/sdk-dapp/hooks';

interface Question {
  id: string;
  title: string;
  description: string;
  creator: string;
  votes: number;
  answers: number;
  reward: number;
  status: string;
  deadline: string | number; // Accept both string and number
  createdAt: string;
}

interface QuestionCardProps {
  question: Question;
  onClick?: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  onClick
}) => {
  const { network } = useGetNetworkConfig();
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'answered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'created':
      case 'open':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDeadline = (deadline: string | number) => {
    // Convert number (timestamp) to string if needed
    const dateValue = typeof deadline === 'number' ? new Date(deadline) : new Date(deadline);
    return dateValue.toLocaleDateString();
  };

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(question.status)}>
              {question.status}
            </Badge>
            {question.reward > 0 && (
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                <Coins className="h-3 w-3 mr-1" />
                {question.reward} {network.egldLabel}
              </Badge>
            )}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{question.title}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {question.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-4 w-4" />
              <span>{question.answers}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span>by {question.creator}</span>
            <span>•</span>
            <span>{formatDate(question.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
