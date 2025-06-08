
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      'nav.home': 'Home',
      'nav.questions': 'Questions',
      'nav.tags': 'Tags',
      'nav.users': 'Users',
      'nav.ask': 'Ask Question',
      
      // Wallet
      'wallet.connect': 'Connect Wallet',
      'wallet.disconnect': 'Disconnect',
      'wallet.balance': 'Balance',
      'wallet.address': 'Address',
      
      // Questions
      'question.postQuestion': 'New Question',
      'question.ask': 'Ask a Question',
      'question.postNew': 'Post New Question',
      'question.postNewDescription': 'Share your question with the community and set a reward for the best answer.',
      'question.title': 'Title',
      'question.titlePlaceholder': 'Enter a clear and specific title for your question...',
      'question.description': 'Description',
      'question.descriptionPlaceholder': 'Provide detailed information about your question. Include code examples, expected behavior, and what you\'ve tried...',
      'question.tags': 'Tags',
      'question.addTag': 'Add tag...',
      'question.deadline': 'Deadline',
      'question.reward': 'Reward Amount',
      'question.submit': 'Post Question',
      'question.postFor': 'Post for',
      'question.submissionInfo': 'Submission Info',
      'question.rewardWillBeLocked': 'The reward amount will be locked until you approve an answer',
      'question.deadlineMinimum24Hours': 'Deadline must be at least 24 hours from now',
      'question.canApproveAnswer': 'You can approve the best answer before the deadline',
      'question.tagsOptionalMaxFive': 'Tags are optional but helpful (maximum 5)',
      'question.status.Created': 'Created',
      'question.status.Answered': 'Answered',
      'question.status.AnswerApproved': 'Answer Approved',
      'question.status.Expired': 'Expired',
      'question.votes': 'votes',
      'question.answers': 'answers',
      
      // Answers
      'answer.post': 'Post Your Answer',
      'answer.submit': 'Post Answer',
      'answer.approve': 'Approve Answer',
      'answer.approved': 'Approved Answer',
      
      // Search & Filter
      'search.placeholder': 'Search questions...',
      'filter.all': 'All Questions',
      'filter.open': 'Open',
      'filter.closed': 'Closed',
      'filter.answered': 'Answered',
      'filter.sort.newest': 'Newest',
      'filter.sort.votes': 'Most Votes',
      'filter.sort.reward': 'Highest Reward',
      
      // Common
      'common.loading': 'Loading...',
      'common.posting': 'Posting...',
      'common.error': 'Error occurred',
      'common.success': 'Success',
      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.edit': 'Edit',
      'common.delete': 'Delete',
      'common.view': 'View',
      'common.share': 'Share',
      'common.confirmClose': 'You have unsaved changes. Are you sure you want to close?',
      
      // Error messages
      'error.walletNotConnected': 'Wallet not connected',
      'error.pleaseConnectWallet': 'Please connect your wallet to post a question',
      'error.requiredFields': 'Required fields missing',
      'error.fillAllFields': 'Please fill in all required fields',
      'error.postQuestion': 'Failed to post question',
      'error.tryAgain': 'Please try again later',
      
      // Success messages
      'success.questionPosted': 'Question posted successfully!',
      'success.questionPostedDescription': 'Your question has been posted and is now visible to the community.',
      
      // Time
      'time.ago': 'ago',
      'time.now': 'just now',
      'time.minutes': 'minutes',
      'time.hours': 'hours',
      'time.days': 'days',
      'time.weeks': 'weeks',
      'time.months': 'months',
      'time.years': 'years',
    }
  },
  pt: {
    translation: {
      // Navigation
      'nav.home': 'Início',
      'nav.questions': 'Perguntas',
      'nav.tags': 'Tags',
      'nav.users': 'Usuários',
      'nav.postQuestion': 'Nova Pergunta',
      'nav.ask': 'Fazer Pergunta',
      
      // Wallet
      'wallet.connect': 'Conectar Carteira',
      'wallet.disconnect': 'Desconectar',
      'wallet.balance': 'Saldo',
      'wallet.address': 'Endereço',
      
      // Questions
      'question.ask': 'Fazer uma Pergunta',
      'question.postNew': 'Publicar Nova Pergunta',
      'question.postNewDescription': 'Compartilhe sua pergunta com a comunidade e defina uma recompensa pela melhor resposta.',
      'question.title': 'Título',
      'question.titlePlaceholder': 'Digite um título claro e específico para sua pergunta...',
      'question.description': 'Descrição',
      'question.descriptionPlaceholder': 'Forneça informações detalhadas sobre sua pergunta. Inclua exemplos de código, comportamento esperado e o que você tentou...',
      'question.tags': 'Tags',
      'question.addTag': 'Adicionar tag...',
      'question.deadline': 'Prazo',
      'question.reward': 'Valor da Recompensa',
      'question.submit': 'Publicar Pergunta',
      'question.postFor': 'Publicar por',
      'question.submissionInfo': 'Informações da Submissão',
      'question.rewardWillBeLocked': 'O valor da recompensa será bloqueado até você aprovar uma resposta',
      'question.deadlineMinimum24Hours': 'O prazo deve ser de pelo menos 24 horas a partir de agora',
      'question.canApproveAnswer': 'Você pode aprovar a melhor resposta antes do prazo',
      'question.tagsOptionalMaxFive': 'Tags são opcionais mas úteis (máximo 5)',
      'question.status.Created': 'Criada',
      'question.status.Answered': 'Respondida',
      'question.status.AnswerApproved': 'Resposta Aprovada',
      'question.status.Expired': 'Expirada',
      'question.votes': 'votos',
      'question.answers': 'respostas',
      
      // Answers
      'answer.post': 'Poste sua Resposta',
      'answer.submit': 'Publicar Resposta',
      'answer.approve': 'Aprovar Resposta',
      'answer.approved': 'Resposta Aprovada',
      
      // Search & Filter
      'search.placeholder': 'Buscar perguntas...',
      'filter.all': 'Todas as Perguntas',
      'filter.open': 'Abertas',
      'filter.closed': 'Fechadas',
      'filter.answered': 'Respondidas',
      'filter.sort.newest': 'Mais Recentes',
      'filter.sort.votes': 'Mais Votadas',
      'filter.sort.reward': 'Maior Recompensa',
      
      // Common
      'common.loading': 'Carregando...',
      'common.posting': 'Publicando...',
      'common.error': 'Erro ocorrido',
      'common.success': 'Sucesso',
      'common.cancel': 'Cancelar',
      'common.save': 'Salvar',
      'common.edit': 'Editar',
      'common.delete': 'Excluir',
      'common.view': 'Ver',
      'common.share': 'Compartilhar',
      'common.confirmClose': 'Você tem alterações não salvas. Tem certeza que deseja fechar?',
      
      // Error messages
      'error.walletNotConnected': 'Carteira não conectada',
      'error.pleaseConnectWallet': 'Por favor conecte sua carteira para publicar uma pergunta',
      'error.requiredFields': 'Campos obrigatórios em falta',
      'error.fillAllFields': 'Por favor preencha todos os campos obrigatórios',
      'error.postQuestion': 'Falha ao publicar pergunta',
      'error.tryAgain': 'Por favor tente novamente mais tarde',
      
      // Success messages
      'success.questionPosted': 'Pergunta publicada com sucesso!',
      'success.questionPostedDescription': 'Sua pergunta foi publicada e agora está visível para a comunidade.',
      
      // Time
      'time.ago': 'atrás',
      'time.now': 'agora mesmo',
      'time.minutes': 'minutos',
      'time.hours': 'horas',
      'time.days': 'dias',
      'time.weeks': 'semanas',
      'time.months': 'meses',
      'time.years': 'anos',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;