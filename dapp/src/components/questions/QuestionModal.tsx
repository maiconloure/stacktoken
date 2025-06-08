import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import { 
  Clock, 
  Eye, 
  MessageSquare, 
  ThumbsUp, 
  Coins, 
  Calendar,
  User,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Award
} from 'lucide-react';
import { useGetNetworkConfig, useGetAccountInfo } from '@multiversx/sdk-dapp/hooks';
import { ContractService, AnswerData } from '@/services/contractService';
import { useToast } from '@/hooks/use-toast';

interface Question {
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

interface QuestionModalProps {
  question: Question;
  onClose: () => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({ question, onClose }) => {
  const { t } = useTranslation();
  const { network } = useGetNetworkConfig();
  const { account } = useGetAccountInfo();
  const { toast } = useToast();

  const [answers, setAnswers] = useState<AnswerData[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerTitle, setAnswerTitle] = useState('');
  const [answerDescription, setAnswerDescription] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [approvingAnswer, setApprovingAnswer] = useState<string | null>(null);
  const [newlyAddedAnswers, setNewlyAddedAnswers] = useState<Set<string>>(new Set());

  const contractService = React.useMemo(() => new ContractService(), []);
  const isQuestionOwner = account?.address === question.creator;

  // Load answers when modal opens
  const loadAnswers = React.useCallback(async () => {
    setLoadingAnswers(true);
    try {
      const questionAnswers = await contractService.getAnswersForQuestion(question.id);
      setAnswers(questionAnswers);
      
      // Clear newly added indicators after loading real data
      setNewlyAddedAnswers(new Set());
    } catch (error) {
      console.error('Error loading answers:', error);
      toast({
        title: "Error",
        description: "Failed to load answers",
        variant: "destructive",
      });
    } finally {
      setLoadingAnswers(false);
    }
  }, [contractService, question.id, toast]);

  useEffect(() => {
    loadAnswers();
  }, [loadAnswers]);

  const handleSubmitAnswer = async () => {
    if (!answerTitle.trim() || !answerDescription.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both title and description",
        variant: "destructive",
      });
      return;
    }

    setSubmittingAnswer(true);
    try {
      await contractService.submitAnswer(question.id, answerTitle, answerDescription);
      
      // Immediately add optimistic answer to the UI
      const optimisticAnswer: AnswerData = {
        answerId: `temp-${Date.now()}`, // Temporary ID
        questionId: question.id,
        creator: account?.address || '',
        title: answerTitle,
        description: answerDescription,
        createdAt: Date.now(),
        votes: 0,
        approved: false
      };
      
      // Add the optimistic answer immediately
      setAnswers(prevAnswers => [...prevAnswers, optimisticAnswer]);
      
      // Mark as newly added for visual indication
      setNewlyAddedAnswers(prev => new Set([...prev, optimisticAnswer.answerId]));
      
      toast({
        title: "Success",
        description: "Answer submitted successfully!",
      });
      
      setAnswerTitle('');
      setAnswerDescription('');
      setShowAnswerForm(false);
      
      // Reload answers from blockchain after a short delay to get the real data
      setTimeout(() => {
        loadAnswers();
      }, 3000); // 3 seconds to allow blockchain confirmation
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: "Error",
        description: "Failed to submit answer",
        variant: "destructive",
      });
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleApproveAnswer = async (answerId: string) => {
    setApprovingAnswer(answerId);
    try {
      await contractService.approveAnswer(question.id, answerId);
      
      // Immediately update the answer's approved status in the UI
      setAnswers(prevAnswers => 
        prevAnswers.map(answer => 
          answer.answerId === answerId 
            ? { ...answer, approved: true }
            : answer
        )
      );
      
      toast({
        title: "Success",
        description: "Answer approved successfully!",
      });
      
      // Reload answers from blockchain after a delay to sync with actual state
      setTimeout(() => {
        loadAnswers();
      }, 3000); // 3 seconds to allow blockchain confirmation
    } catch (error) {
      console.error('Error approving answer:', error);
      toast({
        title: "Error",
        description: "Failed to approve answer",
        variant: "destructive",
      });
    } finally {
      setApprovingAnswer(null);
    }
  };

  // Handle ESC key press
  React.useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [onClose]);

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  

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

  const formatTimeRemaining = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days left` : 'Expired';
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={getStatusColor(question.status)}>
                {question.status}
              </Badge>
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                <Coins className="h-3 w-3 mr-1" />
                {question.reward} {network.egldLabel}
              </Badge>
            </div>
            <h2 className="text-2xl font-bold mb-2">{question.title}</h2>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{question.creator}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDate(question.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatTimeRemaining(question.deadline)}</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed">
              {question.description}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <ThumbsUp className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-semibold">{question.votes}</div>
                <div className="text-sm text-muted-foreground">Votes</div>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-semibold">{answers.length}</div>
                <div className="text-sm text-muted-foreground">Answers</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
              <Coins className="h-5 w-5 text-orange-600" />
              <div>
                <div className="font-semibold">{question.reward}</div>
                <div className="text-sm text-muted-foreground">{network.egldLabel} Reward</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Answers Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Answers ({answers.length})
              </h3>
              {account && !showAnswerForm && (
                <Button 
                  onClick={() => setShowAnswerForm(true)}
                  size="sm"
                  className="stack-gradient text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Answer
                </Button>
              )}
            </div>

            {/* Answer Form */}
            {showAnswerForm && (
              <Card className="border-2 border-blue-200 bg-blue-50/30">
                <CardContent className="p-4 space-y-4">
                  <h4 className="font-semibold">Submit Your Answer</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        value={answerTitle}
                        onChange={(e) => setAnswerTitle(e.target.value)}
                        placeholder="Enter answer title..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={answerDescription}
                        onChange={(e) => setAnswerDescription(e.target.value)}
                        placeholder="Enter your answer description..."
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSubmitAnswer}
                        disabled={submittingAnswer}
                        className="stack-gradient text-white"
                      >
                        {submittingAnswer ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          'Submit Answer'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAnswerForm(false);
                          setAnswerTitle('');
                          setAnswerDescription('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {loadingAnswers && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading answers...</span>
              </div>
            )}

            {/* Answers List */}
            {!loadingAnswers && answers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No answers yet. Be the first to answer!</p>
              </div>
            )}

            {!loadingAnswers && answers.length > 0 && (
              <div className="space-y-4">
                {answers.map((answer) => {
                  const isNewlyAdded = newlyAddedAnswers.has(answer.answerId);
                  const isTemporary = answer.answerId.startsWith('temp-');
                  
                  return (
                    <Card 
                      key={answer.answerId} 
                      className={`
                        ${answer.approved ? 'border-green-200 bg-green-50/30' : ''} 
                        ${isNewlyAdded ? 'border-blue-200 bg-blue-50/30 animate-pulse' : ''}
                        ${isTemporary ? 'border-dashed' : ''}
                      `}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold">{answer.title}</h4>
                              {answer.approved && (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  <Award className="h-3 w-3 mr-1" />
                                  Approved
                                </Badge>
                              )}
                              {isTemporary && (
                                <Badge variant="outline" className="text-blue-600 border-blue-200">
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Confirming...
                                </Badge>
                              )}
                              {isNewlyAdded && !isTemporary && (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground mb-3">{answer.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>{answer.creator}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(new Date(answer.createdAt).toISOString())}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <ThumbsUp className="h-4 w-4" />
                                <span>{answer.votes} votes</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Approval Button for Question Owner */}
                          {isQuestionOwner && !answer.approved && !isTemporary && (
                            <Button
                              onClick={() => handleApproveAnswer(answer.answerId)}
                              disabled={approvingAnswer === answer.answerId}
                              size="sm"
                              variant="outline"
                              className="ml-4 border-green-300 text-green-700 hover:bg-green-50"
                            >
                              {approvingAnswer === answer.answerId ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Approving...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
