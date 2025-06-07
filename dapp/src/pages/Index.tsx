import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { QuestionsList } from '@/components/questions/QuestionsList';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <QuestionsList />
        </main>
      </div>
    </div>
  );
};

export default Index;
