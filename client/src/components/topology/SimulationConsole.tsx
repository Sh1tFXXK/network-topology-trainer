/**
 * SimulationConsole - 模拟控制台
 * 
 * Design: Cyberpunk Tech Theme
 * - 模拟控制按钮
 * - 实时日志显示
 * - 数据包追踪信息
 * - 数据传输可视化
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTopologyStore } from '@/store/topologyStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Square, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  Zap,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Send,
  Layers
} from 'lucide-react';
import DataTransmissionVisualizer from './DataTransmissionVisualizer';

export default function SimulationConsole() {
  const { 
    nodes, 
    simulation, 
    startSimulation, 
    stopSimulation, 
    clearLogs,
    setSimulationSpeed 
  } = useTopologyStore();
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [sourceId, setSourceId] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const [protocol, setProtocol] = useState<'ICMP' | 'TCP' | 'UDP' | 'ARP'>('ICMP');
  const [activeTab, setActiveTab] = useState<'simulation' | 'transmission'>('simulation');
  const [dataContent, setDataContent] = useState<string>('');

  // 获取可用的终端设备（PC 和服务器）
  const endpoints = nodes.filter((n) => {
    const data = n.data as { type?: string };
    return data.type === 'pc' || data.type === 'server';
  });

  const handleStartSimulation = () => {
    if (sourceId && targetId && sourceId !== targetId) {
      startSimulation(sourceId, targetId, protocol, dataContent);
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // 计算高度 - 数据传输可视化需要更大的空间
  const consoleHeight = activeTab === 'transmission' ? 'h-[500px]' : 'h-64';

  return (
    <div
      className={cn(
        'glass-panel border-t border-border/50 transition-all duration-300',
        isExpanded ? consoleHeight : 'h-12'
      )}
    >
      {/* 标题栏 */}
      <div
        className="h-12 px-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/30"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Zap className={cn(
            'w-5 h-5',
            simulation.isRunning ? 'text-emerald-400 animate-pulse' : 'text-cyan-400'
          )} />
          <h3 className="font-bold text-white font-mono text-sm">
            模拟控制台
          </h3>
          {simulation.isRunning && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono">
              运行中
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Tab切换按钮 - 点击时阻止事件冒泡 */}
          {isExpanded && (
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              <Button
                variant={activeTab === 'simulation' ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'h-7 text-xs',
                  activeTab === 'simulation' ? 'bg-cyan-600' : ''
                )}
                onClick={() => setActiveTab('simulation')}
              >
                <Zap className="w-3 h-3 mr-1" />
                路径模拟
              </Button>
              <Button
                variant={activeTab === 'transmission' ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'h-7 text-xs',
                  activeTab === 'transmission' ? 'bg-purple-600' : ''
                )}
                onClick={() => setActiveTab('transmission')}
              >
                <Layers className="w-3 h-3 mr-1" />
                数据传输
              </Button>
            </div>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* 控制台内容 */}
      {isExpanded && (
        <>
          {activeTab === 'simulation' ? (
            <div className="h-[calc(100%-3rem)] flex">
              {/* 控制面板 */}
              <div className="w-80 border-r border-border/50 p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* 源设备 */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">源设备</label>
                    <Select value={sourceId} onValueChange={setSourceId}>
                      <SelectTrigger className="bg-slate-900/50 border-border/50 text-sm">
                        <SelectValue placeholder="选择源" />
                      </SelectTrigger>
                      <SelectContent>
                        {endpoints.map((node) => {
                          const data = node.data as { label?: string; ip?: string };
                          return (
                            <SelectItem key={node.id} value={node.id}>
                              {data.label} ({data.ip})
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 目标设备 */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">目标设备</label>
                    <Select value={targetId} onValueChange={setTargetId}>
                      <SelectTrigger className="bg-slate-900/50 border-border/50 text-sm">
                        <SelectValue placeholder="选择目标" />
                      </SelectTrigger>
                      <SelectContent>
                        {endpoints.filter((n) => n.id !== sourceId).map((node) => {
                          const data = node.data as { label?: string; ip?: string };
                          return (
                            <SelectItem key={node.id} value={node.id}>
                              {data.label} ({data.ip})
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 协议选择 */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">协议</label>
                  <Select value={protocol} onValueChange={(v) => setProtocol(v as typeof protocol)}>
                    <SelectTrigger className="bg-slate-900/50 border-border/50 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ICMP">ICMP (Ping)</SelectItem>
                      <SelectItem value="TCP">TCP</SelectItem>
                      <SelectItem value="UDP">UDP</SelectItem>
                      <SelectItem value="ARP">ARP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 数据内容 */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">数据内容 (可选)</label>
                  <Input
                    value={dataContent}
                    onChange={(e) => setDataContent(e.target.value)}
                    placeholder="例如: Hello World"
                    className="bg-slate-900/50 border-border/50 text-sm h-8 font-mono"
                  />
                </div>

                {/* 控制按钮 */}
                <div className="flex gap-2">
                  {!simulation.isRunning ? (
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500"
                      onClick={handleStartSimulation}
                      disabled={!sourceId || !targetId || sourceId === targetId}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      开始模拟
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={stopSimulation}
                    >
                      <Square className="w-4 h-4 mr-1" />
                      停止
                    </Button>
                  )}
                </div>
              </div>

              {/* 日志区域 */}
              <div className="flex-1 flex flex-col">
                <div className="px-4 py-2 border-b border-border/50 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-mono">
                    日志 ({simulation.logs.length})
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-muted-foreground hover:text-white"
                    onClick={clearLogs}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    清除
                  </Button>
                </div>
                <ScrollArea className="flex-1 p-2">
                  <div className="space-y-1">
                    {simulation.logs.length === 0 ? (
                      <div className="text-center text-muted-foreground text-sm py-8">
                        暂无日志
                      </div>
                    ) : (
                      simulation.logs.map((log) => (
                        <div
                          key={log.id}
                          className={cn(
                            'flex items-start gap-2 px-2 py-1.5 rounded text-xs font-mono',
                            'bg-slate-900/30 hover:bg-slate-800/50'
                          )}
                        >
                          {getLogIcon(log.type)}
                          <span className="text-muted-foreground shrink-0">
                            [{formatTime(log.timestamp)}]
                          </span>
                          <span className={cn(
                            log.type === 'success' && 'text-emerald-300',
                            log.type === 'warning' && 'text-amber-300',
                            log.type === 'error' && 'text-red-300',
                            log.type === 'info' && 'text-cyan-300'
                          )}>
                            {log.message}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          ) : (
            <div className="h-[calc(100%-3rem)]">
              <DataTransmissionVisualizer />
            </div>
          )}
        </>
      )}
    </div>
  );
}
