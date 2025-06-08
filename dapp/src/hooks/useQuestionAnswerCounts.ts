import { useState, useEffect, useCallback } from 'react';
import { ContractService } from '@/services/contractService';

interface QuestionAnswerCounts {
  [questionId: string]: number;
}

interface UseQuestionAnswerCountsReturn {
  answerCounts: QuestionAnswerCounts;
  loading: boolean;
  error: string | null;
  fetchAnswerCount: (questionId: string) => Promise<void>;
  fetchAnswerCounts: (questionIds: string[]) => Promise<void>;
}

export const useQuestionAnswerCounts = (): UseQuestionAnswerCountsReturn => {
  const [answerCounts, setAnswerCounts] = useState<QuestionAnswerCounts>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnswerCount = useCallback(async (questionId: string) => {
    try {
      setError(null);
      const contractService = new ContractService();
      const count = await contractService.getAnswerCountForQuestion(questionId);
      
      setAnswerCounts(prev => ({
        ...prev,
        [questionId]: count
      }));
    } catch (err) {
      console.error(`Error fetching answer count for question ${questionId}:`, err);
      setError(`Failed to load answer count for question ${questionId}`);
    }
  }, []);

  const fetchAnswerCounts = useCallback(async (questionIds: string[]) => {
    if (questionIds.length === 0) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const contractService = new ContractService();
      
      // Fetch answer counts in parallel for better performance
      const countPromises = questionIds.map(async (questionId) => {
        try {
          const count = await contractService.getAnswerCountForQuestion(questionId);
          return { questionId, count };
        } catch (error) {
          console.warn(`Failed to fetch answer count for question ${questionId}:`, error);
          return { questionId, count: 0 };
        }
      });

      const results = await Promise.all(countPromises);
      
      const newCounts: QuestionAnswerCounts = {};
      results.forEach(({ questionId, count }) => {
        newCounts[questionId] = count;
      });

      setAnswerCounts(prev => ({
        ...prev,
        ...newCounts
      }));
    } catch (err) {
      console.error('Error fetching answer counts:', err);
      setError('Failed to load answer counts');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    answerCounts,
    loading,
    error,
    fetchAnswerCount,
    fetchAnswerCounts
  };
};
