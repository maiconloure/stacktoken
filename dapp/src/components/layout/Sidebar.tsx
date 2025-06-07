
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { Home, Search, FileText } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();

  const navigationItems = [
    { icon: Home, label: t('nav.home'), href: '/', count: null },
    { icon: Search, label: t('nav.questions'), href: '/questions', count: 1234 },
    { icon: FileText, label: t('nav.tags'), href: '/tags', count: 89 },
  ];

  const popularTags = [
    { name: 'javascript', count: 245 },
    { name: 'react', count: 189 },
    { name: 'blockchain', count: 156 },
    { name: 'multiversx', count: 134 },
    { name: 'smart-contracts', count: 98 },
    { name: 'typescript', count: 87 },
  ];

  return (
    <aside className="w-64 border-r bg-background/50 backdrop-blur">
      <div className="p-4 space-y-6">
        {/* Navigation */}
        <nav className="space-y-2">
          {navigationItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start text-left"
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {item.count && (
                <Badge variant="secondary" className="ml-auto">
                  {item.count}
                </Badge>
              )}
            </Button>
          ))}
        </nav>

        {/* Popular Tags */}
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground mb-3">
            Popular Tags
          </h3>
          <div className="space-y-2">
            {popularTags.map((tag) => (
              <div
                key={tag.name}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
              >
                <Badge variant="outline" className="bg-stack-50 dark:bg-stack-900">
                  {tag.name}
                </Badge>
                <span className="text-xs text-muted-foreground">{tag.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-br from-stack-50 to-stack-100 dark:from-stack-900 dark:to-stack-800 p-4 rounded-lg">
          <h3 className="font-semibold text-sm mb-2">Community Stats</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Questions</span>
              <span className="font-medium">1,234</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Answers</span>
              <span className="font-medium">3,456</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Users</span>
              <span className="font-medium">789</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
