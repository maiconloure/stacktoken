import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QuestionCard } from './QuestionCard';
import { QuestionModal } from './QuestionModal';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Plus, Loader2, RefreshCw } from 'lucide-react';
import { PostQuestionButton } from './PostQuestionButton';
import { useGetLoginInfo } from '@multiversx/sdk-dapp/hooks';
import { ContractService, QuestionData } from '@/services/contractService';

// Interface to match what QuestionCard expects
interface UIQuestion {
  id: string;
  title: string;
  description: string;
  creator: string;
  votes: number;
  answers: number;
  reward: number;
  status: string;
  deadline: string;
  createdAt: string;
}

// Function to convert contract QuestionData to UI format
const convertQuestionDataToUI = (questionData: QuestionData): UIQuestion => {
  return {
    id: questionData.questionId,
    title: questionData.title,
    description: questionData.description,
    creator: questionData.creator,
    votes: 0, // Default since contract doesn't track votes yet
    answers: 0, // Default since we'd need to fetch answers separately
    reward: questionData.lockedAmount / Math.pow(10, 18), // Convert from wei to EGLD
    status: questionData.status,
    deadline: new Date(questionData.deadline).toISOString(),
    createdAt: new Date(questionData.createdAt).toISOString()
  };
};

export const QuestionsList: React.FC = () => {
  const { isLoggedIn } = useGetLoginInfo();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [questions, setQuestions] = useState<UIQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<UIQuestion | null>(null);

  // Fetch questions from contract
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const contractService = new ContractService();
      const contractQuestions = await contractService.getAllOpenQuestions();
      const uiQuestions = contractQuestions.map(convertQuestionDataToUI);
      
      setQuestions(uiQuestions);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions from blockchain');
      
      // Fallback to mock data in case of error
      const mockQuestions = [
        {
          id: '1',
          title: 'How to implement smart contract interactions with MultiversX SDK?',
          description: 'I\'m trying to connect my React app to a MultiversX smart contract but getting errors when calling contract methods. The connection works but method calls fail.',
          creator: 'developer123',
          votes: 15,
          answers: 3,
          reward: 0.5,
          status: 'Created',
          deadline: '2024-01-15T18:00:00Z',
          createdAt: '2024-01-10T10:30:00Z'
        },
        {
          id: '2',
          title: 'Best practices for token staking mechanisms in DeFi protocols?',
          description: 'Looking for architectural advice on implementing a token staking system. Need to handle rewards distribution, slashing conditions, and withdrawal periods.',
          creator: 'defi_builder',
          votes: 28,
          answers: 7,
          reward: 1.2,
          status: 'Answered',
          deadline: '2024-01-12T12:00:00Z',
          createdAt: '2024-01-08T14:20:00Z'
        },
      ];
      setQuestions(mockQuestions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const filteredQuestions = questions
    .filter(question => {
      const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          question.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || question.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'votes':
          return b.votes - a.votes;
        case 'reward':
          return b.reward - a.reward;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const handleQuestionClick = (question: UIQuestion) => {
    setSelectedQuestion(question);
  };

  const handleCloseModal = () => {
    setSelectedQuestion(null);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-2">
        <div>
          <h1 className="text-3xl font-bold">Questions</h1>
          <p className="text-muted-foreground">
            {loading ? "Loading..." : `${filteredQuestions.length} questions found`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchQuestions}
            disabled={loading}
            className="flex items-center space-x-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          {isLoggedIn && <PostQuestionButton />}
        </div>
      </div>

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('search.placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            disabled={loading}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter} disabled={loading}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filter.all')}</SelectItem>
            <SelectItem value="Created">{t('filter.open')}</SelectItem>
            <SelectItem value="Answered">{t('filter.answered')}</SelectItem>
            <SelectItem value="AnswerApproved">{t('filter.closed')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy} disabled={loading}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t('filter.sort.newest')}</SelectItem>
            <SelectItem value="votes">{t('filter.sort.votes')}</SelectItem>
            <SelectItem value="reward">{t('filter.sort.reward')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 text-sm">
            {error} - Showing fallback data.
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading questions from blockchain...</span>
        </div>
      )}

      {(searchTerm || statusFilter !== 'all') && (
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchTerm && (
            <Badge variant="secondary">
              Search: {searchTerm}
              <button 
                onClick={() => setSearchTerm('')}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          {statusFilter !== 'all' && (
            <Badge variant="secondary">
              Status: {statusFilter}
              <button 
                onClick={() => setStatusFilter('all')}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Questions List */}
      {!loading && (
        <>
          <div className="space-y-4">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  onClick={() => handleQuestionClick(question)}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-2">No questions found</div>
                <p className="text-sm text-muted-foreground">
                  {questions.length === 0 
                    ? "No questions have been posted yet. Be the first to ask!"
                    : "Try adjusting your search terms or filters"
                  }
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {selectedQuestion && (
        <QuestionModal
          question={selectedQuestion}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};
