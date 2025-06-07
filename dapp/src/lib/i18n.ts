
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
      'question.ask': 'Ask a Question',
      'question.title': 'Title',
      'question.description': 'Description',
      'question.tags': 'Tags',
      'question.deadline': 'Deadline',
      'question.reward': 'Reward Amount',
      'question.submit': 'Post Question',
      'question.status.open': 'Open',
      'question.status.closed': 'Closed',
      'question.status.answered': 'Answered',
      'question.votes': 'votes',
      'question.answers': 'answers',
      'question.views': 'views',
      
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
      'common.error': 'Error occurred',
      'common.success': 'Success',
      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.edit': 'Edit',
      'common.delete': 'Delete',
      'common.view': 'View',
      'common.share': 'Share',
      
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
      'nav.ask': 'Fazer Pergunta',
      
      // Wallet
      'wallet.connect': 'Conectar Carteira',
      'wallet.disconnect': 'Desconectar',
      'wallet.balance': 'Saldo',
      'wallet.address': 'Endereço',
      
      // Questions
      'question.ask': 'Fazer uma Pergunta',
      'question.title': 'Título',
      'question.description': 'Descrição',
      'question.tags': 'Tags',
      'question.deadline': 'Prazo',
      'question.reward': 'Valor da Recompensa',
      'question.submit': 'Publicar Pergunta',
      'question.status.open': 'Aberta',
      'question.status.closed': 'Fechada',
      'question.status.answered': 'Respondida',
      'question.votes': 'votos',
      'question.answers': 'respostas',
      'question.views': 'visualizações',
      
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
      'common.error': 'Erro ocorrido',
      'common.success': 'Sucesso',
      'common.cancel': 'Cancelar',
      'common.save': 'Salvar',
      'common.edit': 'Editar',
      'common.delete': 'Excluir',
      'common.view': 'Ver',
      'common.share': 'Compartilhar',
      
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