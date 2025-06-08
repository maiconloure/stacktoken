import { useState, useEffect, useCallback } from 'react';
import { ContractService } from '@/services/contractService';

interface CommunityStats {
  totalQuestions: number;
  totalAnswers: number;
  loading: boolean;
  error: string | null;
  isEstimated: boolean;
  lastUpdated: Date | null;
}

export const useCommunityStats = () => {
  const [stats, setStats] = useState<CommunityStats>({
    totalQuestions: 0,
    totalAnswers: 0,
    loading: true,
    error: null,
    isEstimated: false,
    lastUpdated: null
  });

  const fetchStats = useCallback(async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));
      
      const contractService = new ContractService();
      
      // Get all questions to count them
      const questions = await contractService.getAllOpenQuestions();
      const totalQuestions = questions.length;
      
      let totalAnswers = 0;
      let isEstimated = false;
      
      if (questions.length > 0) {
        // If we have a small number of questions (≤20), get exact count
        // Otherwise, use sampling for performance
        if (questions.length <= 20) {
          // Get exact count for all questions
          const answerPromises = questions.map(async (question) => {
            try {
              const answers = await contractService.getAnswersForQuestion(question.questionId);
              return answers.length;
            } catch (error) {
              console.warn(`Failed to fetch answers for question ${question.questionId}:`, error);
              return 0;
            }
          });
          
          const answerCounts = await Promise.all(answerPromises);
          totalAnswers = answerCounts.reduce((sum, count) => sum + count, 0);
          isEstimated = false;
        } else {
          // Use sampling for large datasets
          const sampleSize = Math.min(questions.length, 15);
          const sampleQuestions = questions.slice(0, sampleSize);
          
          const answerPromises = sampleQuestions.map(async (question) => {
            try {
              const answers = await contractService.getAnswersForQuestion(question.questionId);
              return answers.length;
            } catch (error) {
              console.warn(`Failed to fetch answers for question ${question.questionId}:`, error);
              return 0;
            }
          });
          
          const answerCounts = await Promise.all(answerPromises);
          const totalSampleAnswers = answerCounts.reduce((sum, count) => sum + count, 0);
          const averageAnswersPerQuestion = totalSampleAnswers / sampleSize;
          
          // Estimate total answers based on the sample
          totalAnswers = Math.round(averageAnswersPerQuestion * questions.length);
          isEstimated = true;
        }
      }
      
      setStats({
        totalQuestions,
        totalAnswers,
        loading: false,
        error: null,
        isEstimated,
        lastUpdated: new Date()
      });
      
    } catch (error) {
      console.error('Error fetching community stats:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load stats'
      }));
    }
  }, []);

  useEffect(() => {
    fetchStats();
    
    // Refresh stats every 5 minutes to balance freshness with performance
    const interval = setInterval(fetchStats, 300000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { ...stats, refetch: fetchStats };
};
