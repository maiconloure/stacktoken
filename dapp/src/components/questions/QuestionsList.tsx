
import React, { useState } from 'react';
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
import { useTranslation } from 'react-i18next';
import { Search, Filter, Plus } from 'lucide-react';

const mockQuestions = [
  {
    id: '1',
    title: 'How to implement smart contract interactions with MultiversX SDK?',
    description: 'I\'m trying to connect my React app to a MultiversX smart contract but getting errors when calling contract methods. The connection works but method calls fail.',
    creator: 'developer123',
    votes: 15,
    answers: 3,
    views: 234,
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
    views: 456,
    reward: 1.2,
    status: 'Answered',
    deadline: '2024-01-12T12:00:00Z',
    createdAt: '2024-01-08T14:20:00Z'
  },
];

export const QuestionsList: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [questions] = useState(mockQuestions);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Questions</h1>
          <p className="text-muted-foreground">
            {filteredQuestions.length} questions found
          </p>
        </div>
        <Button className="stack-gradient text-white">
          <Plus className="h-4 w-4 mr-2" />
          {t('nav.ask')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('search.placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filter.all')}</SelectItem>
            <SelectItem value="open">{t('filter.open')}</SelectItem>
            <SelectItem value="answered">{t('filter.answered')}</SelectItem>
            <SelectItem value="closed">{t('filter.closed')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
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

      {/* Questions */}
      <div className="space-y-4">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onClick={() => console.log('Navigate to question:', question.id)}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-2">No questions found</div>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
