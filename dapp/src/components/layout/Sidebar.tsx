import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Home, Search, Loader2 } from 'lucide-react';
import { useCommunityStats } from '@/hooks/useCommunityStats';

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { totalQuestions, totalAnswers, loading, error, isEstimated } = useCommunityStats();

  const navigationItems = [
    { icon: Home, label: t('nav.home'), href: '/', count: null },
    { icon: Search, label: t('nav.questions'), href: '/questions', count: loading ? null : totalQuestions },
  ];

  return (
    <aside className="w-64 border-r bg-background/50 backdrop-blur">
      <div className="p-4 space-y-6">
        <nav className="space-y-2">
          {navigationItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start text-left"
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span className="flex-1">{item.label}</span>
            </Button>
          ))}
        </nav>

        <div className="bg-gradient-to-br from-stack-50 to-stack-100 dark:from-stack-900 dark:to-stack-800 p-4 rounded-lg">
          <h3 className="font-semibold text-sm mb-2">Community Stats</h3>
          <div className="space-y-1 text-sm">
            {loading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-muted-foreground">Loading...</span>
              </div>
            ) : error ? (
              <div className="text-center py-2">
                <span className="text-red-500 text-xs">{error}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Questions</span>
                  <span className="font-medium">{totalQuestions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Answers</span>
                  <div className="flex items-center">
                    <span className="font-medium">{totalAnswers.toLocaleString()}</span>
                    {isEstimated && (
                      <span className="text-xs text-muted-foreground ml-1">~</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
