/**
 * Header - 顶部导航栏
 * 
 * Design: Cyberpunk Tech Theme
 * - 毛玻璃效果
 * - 霓虹 Logo
 * - 导航链接
 */

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTopologyStore } from '@/store/topologyStore';
import { 
  Network, 
  BookOpen, 
  RotateCcw, 
  Download,
  Github
} from 'lucide-react';
import TemplateSelector from '@/components/topology/TemplateSelector';
import { Link, useLocation } from 'wouter';
import { toast } from 'sonner';

export default function Header() {
  const [location] = useLocation();
  const { reset, nodes, edges } = useTopologyStore();

  const handleReset = () => {
    if (nodes.length === 0) {
      toast.info('画布已经是空的');
      return;
    }
    reset();
    toast.success('已重置拓扑');
  };

  const handleExport = () => {
    const data = {
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `topology-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('拓扑已导出');
  };

  const navItems = [
    { href: '/', label: '拓扑编辑器', icon: Network },
    { href: '/learn', label: '知识库', icon: BookOpen },
  ];

  return (
    <header className="h-14 glass-panel border-b border-border/50 flex items-center justify-between px-4">
      {/* Logo */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Network className="w-7 h-7 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            <div className="absolute inset-0 blur-md bg-cyan-400/30 group-hover:bg-cyan-300/40 transition-colors" />
          </div>
          <span className="font-bold text-lg text-white font-mono tracking-tight">
            <span className="text-cyan-400">Net</span>Trainer
          </span>
        </Link>

        {/* 导航链接 */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'font-mono text-sm',
                    isActive
                      ? 'text-cyan-400 bg-cyan-400/10'
                      : 'text-muted-foreground hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4 mr-1.5" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-2">
        <TemplateSelector />
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-white font-mono text-sm"
          onClick={handleExport}
          disabled={nodes.length === 0}
        >
          <Download className="w-4 h-4 mr-1.5" />
          导出
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-amber-400 font-mono text-sm"
          onClick={handleReset}
        >
          <RotateCcw className="w-4 h-4 mr-1.5" />
          重置
        </Button>
        <div className="w-px h-6 bg-border/50 mx-1" />
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-white"
          asChild
        >
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
          >
            <Github className="w-5 h-5" />
          </a>
        </Button>
      </div>
    </header>
  );
}
