import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { AskQuestionForm } from '@/components/questions/AskQuestionForm';

const AskQuestion = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <AskQuestionForm />
        </main>
      </div>
    </div>
  );
};

export default AskQuestion;
