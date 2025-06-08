import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { QuestionCard } from './QuestionCard';
import { QuestionModal } from './QuestionModal';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Plus, Loader2, RefreshCw, X } from 'lucide-react';
import { PostQuestionButton } from './PostQuestionButton';
import { useGetLoginInfo } from '@multiversx/sdk-dapp/hooks';
import { ContractService, QuestionData } from '@/services/contractService';
import { useQuestionAnswerCounts } from '@/hooks/useQuestionAnswerCounts';
import { useSearch } from '@/contexts/SearchContext';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UIQuestion {
  id: string;
  title: string;
  description: string;
  creator: string;
  votes: number;
  answers: number;
  reward: number;
  status: string;
  deadline: number; // Keep as number for QuestionModal compatibility
  createdAt: string;
}

const convertQuestionDataToUI = (questionData: QuestionData, answerCount?: number): UIQuestion => {
  return {
    id: questionData.questionId,
    title: questionData.title,
    description: questionData.description,
    creator: questionData.creator,
    votes: 0,
    answers: answerCount || 0, // Use real answer count if provided
    reward: questionData.lockedAmount / Math.pow(10, 18),
    status: questionData.status,
    deadline: questionData.deadline, // Keep as number
    createdAt: new Date(questionData.createdAt).toISOString()
  };
};

export const QuestionsList: React.FC = () => {
  const { isLoggedIn } = useGetLoginInfo();
  const { t } = useTranslation();
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, sortBy, setSortBy } = useSearch();
  const [questions, setQuestions] = useState<UIQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<UIQuestion | null>(null);
  
  // Use the answer counts hook
  const { answerCounts, loading: answerCountsLoading, fetchAnswerCounts } = useQuestionAnswerCounts();
  
  // Debounce search term for performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const contractService = new ContractService();
      const contractQuestions = await contractService.getAllOpenQuestions();
      
      // Convert to UI format without answer counts first
      const uiQuestions = contractQuestions.map(q => convertQuestionDataToUI(q, 0));
      setQuestions(uiQuestions);
      
      // Fetch answer counts for all questions
      const questionIds = contractQuestions.map(q => q.questionId);
      if (questionIds.length > 0) {
        await fetchAnswerCounts(questionIds);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions from blockchain');
    } finally {
      setLoading(false);
    }
  }, [fetchAnswerCounts]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Update questions with real answer counts when they are fetched
  useEffect(() => {
    if (Object.keys(answerCounts).length > 0) {
      setQuestions(prevQuestions => 
        prevQuestions.map(question => ({
          ...question,
          answers: answerCounts[question.id] || 0
        }))
      );
    }
  }, [answerCounts]);

  const filteredQuestions = useMemo(() => {
    return questions
      .filter(question => {
        const searchLower = debouncedSearchTerm.toLowerCase();
        const matchesSearch = debouncedSearchTerm === '' || 
                            question.title.toLowerCase().includes(searchLower) ||
                            question.description.toLowerCase().includes(searchLower) ||
                            question.creator.toLowerCase().includes(searchLower);
        const matchesStatus = statusFilter === 'all' || question.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'answers':
            return b.answers - a.answers;
          case 'votes':
            return b.votes - a.votes;
          case 'reward':
            return b.reward - a.reward;
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'newest':
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [questions, debouncedSearchTerm, statusFilter, sortBy]);

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
            {loading ? "Loading questions..." : 
             answerCountsLoading ? "Loading answer counts..." :
             `${filteredQuestions.length} questions found`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchQuestions}
            disabled={loading || answerCountsLoading}
            className="flex items-center space-x-1"
          >
            <RefreshCw className={`h-4 w-4 ${(loading || answerCountsLoading) ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          {isLoggedIn && <PostQuestionButton />}
        </div>
      </div>

      <div className="flex flex-col space-y-4 mb-4">
        {/* Mobile search - visible when header search is hidden */}
        <div className="md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={loading || answerCountsLoading}
            />
          </div>
        </div>
        
        {/* Desktop filters and mobile filters */}
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          {/* Desktop search - takes remaining space */}
          <div className="hidden md:block flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={loading || answerCountsLoading}
              />
            </div>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter} disabled={loading || answerCountsLoading}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filter.all')}</SelectItem>
              <SelectItem value="Created">{t('filter.open')}</SelectItem>
              <SelectItem value="Answered">{t('filter.answered')}</SelectItem>
              <SelectItem value="AnswerApproved">{t('filter.closed')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy} disabled={loading || answerCountsLoading}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t('filter.sort.newest')}</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="answers">Most Answers</SelectItem>
              <SelectItem value="votes">{t('filter.sort.votes')}</SelectItem>
              <SelectItem value="reward">{t('filter.sort.reward')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 text-sm">
            {error} - Showing fallback data.
          </p>
        </div>
      )}

      {(loading || answerCountsLoading) && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">
            {loading ? "Loading questions from blockchain..." : "Loading answer counts..."}
          </span>
        </div>
      )}

      {(searchTerm || statusFilter !== 'all') && (
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchTerm && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Search: {searchTerm}</span>
              <button 
                onClick={() => setSearchTerm('')}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Status: {statusFilter}</span>
              <button 
                onClick={() => setStatusFilter('all')}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {!(loading || answerCountsLoading) && (
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
