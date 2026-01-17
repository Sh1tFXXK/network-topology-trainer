import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Network, 
  Table2, 
  ArrowRight,
  Clock,
  Layers,
  GitBranch,
  Info,
  Zap
} from 'lucide-react';

// MAC地址表条目
interface MACEntry {
  id: string;
  mac: string;
  port: string;
  vlan: number;
  type: 'dynamic' | 'static';
  age: number;
  maxAge: number;
}

// 端口信息
interface PortInfo {
  name: string;
  status: 'up' | 'down';
  speed: string;
  duplex: 'full' | 'half';
  vlan: number;
  mode: 'access' | 'trunk';
  stpState: 'forwarding' | 'blocking' | 'learning' | 'listening' | 'disabled';
}

// 帧转发决策
interface ForwardDecision {
  type: 'unicast' | 'broadcast' | 'multicast' | 'unknown';
  action: 'forward' | 'flood' | 'drop';
  outPorts: string[];
  reason: string;
}

interface SwitchSimulatorProps {
  switchId?: string;
  onForwardDecision?: (decision: ForwardDecision) => void;
  targetMac?: string; // 新增：目标 MAC
}

// 默认MAC地址表
const defaultMACTable: MACEntry[] = [
  { id: '1', mac: 'AA:BB:CC:DD:EE:01', port: 'Fa0/1', vlan: 1, type: 'dynamic', age: 120, maxAge: 300 },
  { id: '2', mac: 'AA:BB:CC:DD:EE:02', port: 'Fa0/2', vlan: 1, type: 'dynamic', age: 45, maxAge: 300 },
  { id: '3', mac: 'AA:BB:CC:DD:EE:03', port: 'Fa0/3', vlan: 1, type: 'dynamic', age: 200, maxAge: 300 },
  { id: '4', mac: '11:22:33:44:55:66', port: 'Fa0/4', vlan: 10, type: 'static', age: 0, maxAge: 0 },
  { id: '5', mac: 'AA:BB:CC:DD:EE:05', port: 'Gi0/1', vlan: 1, type: 'dynamic', age: 30, maxAge: 300 },
];

// 默认端口列表
const defaultPorts: PortInfo[] = [
  { name: 'Fa0/1', status: 'up', speed: '100Mbps', duplex: 'full', vlan: 1, mode: 'access', stpState: 'forwarding' },
  { name: 'Fa0/2', status: 'up', speed: '100Mbps', duplex: 'full', vlan: 1, mode: 'access', stpState: 'forwarding' },
  { name: 'Fa0/3', status: 'up', speed: '100Mbps', duplex: 'full', vlan: 1, mode: 'access', stpState: 'forwarding' },
  { name: 'Fa0/4', status: 'up', speed: '100Mbps', duplex: 'full', vlan: 10, mode: 'access', stpState: 'forwarding' },
  { name: 'Gi0/1', status: 'up', speed: '1Gbps', duplex: 'full', vlan: 1, mode: 'trunk', stpState: 'forwarding' },
  { name: 'Gi0/2', status: 'down', speed: '1Gbps', duplex: 'full', vlan: 1, mode: 'trunk', stpState: 'disabled' },
];

// STP状态颜色
const stpStateColors: Record<string, string> = {
  forwarding: 'bg-green-500/20 text-green-400',
  blocking: 'bg-red-500/20 text-red-400',
  learning: 'bg-yellow-500/20 text-yellow-400',
  listening: 'bg-blue-500/20 text-blue-400',
  disabled: 'bg-slate-500/20 text-slate-400',
};

export const SwitchSimulator: React.FC<SwitchSimulatorProps> = ({
  switchId = 'SW1',
  onForwardDecision,
  targetMac
}) => {
  const [macTable, setMACTable] = useState<MACEntry[]>(defaultMACTable);
  const [ports, setPorts] = useState<PortInfo[]>(defaultPorts);
  const [activeTab, setActiveTab] = useState('mac-table');
  const [queryMac, setQueryMac] = useState('');
  const [queryResult, setQueryResult] = useState<ForwardDecision | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [highlightedEntry, setHighlightedEntry] = useState<string | null>(null);
  const [learningDemo, setLearningDemo] = useState<{step: number; steps: string[]} | null>(null);

  // 自动触发查询逻辑
  useEffect(() => {
    if (targetMac) {
      setQueryMac(targetMac);
      setActiveTab('forward');
      const timer = setTimeout(() => {
        handleQuery();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [targetMac]);
  useEffect(() => {
    const timer = setInterval(() => {
      setMACTable(prev => prev.map(entry => {
        if (entry.type === 'dynamic' && entry.age < entry.maxAge) {
          return { ...entry, age: entry.age + 1 };
        }
        return entry;
      }).filter(entry => entry.type === 'static' || entry.age < entry.maxAge));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 帧转发决策
  const makeForwardDecision = (destMac: string, srcPort: string = 'Fa0/1'): ForwardDecision => {
    // 广播地址
    if (destMac.toUpperCase() === 'FF:FF:FF:FF:FF:FF') {
      const outPorts = ports
        .filter(p => p.name !== srcPort && p.status === 'up' && p.stpState === 'forwarding')
        .map(p => p.name);
      return {
        type: 'broadcast',
        action: 'flood',
        outPorts,
        reason: '广播帧：从所有端口泛洪（除源端口外）'
      };
    }

    // 多播地址 (01:xx:xx:xx:xx:xx)
    if (destMac.startsWith('01:')) {
      const outPorts = ports
        .filter(p => p.name !== srcPort && p.status === 'up' && p.stpState === 'forwarding')
        .map(p => p.name);
      return {
        type: 'multicast',
        action: 'flood',
        outPorts,
        reason: '多播帧：从所有端口泛洪（除源端口外）'
      };
    }

    // 查找MAC地址表
    const entry = macTable.find(e => e.mac.toUpperCase() === destMac.toUpperCase());
    
    if (entry) {
      // 找到目标MAC
      if (entry.port === srcPort) {
        return {
          type: 'unicast',
          action: 'drop',
          outPorts: [],
          reason: '目标端口与源端口相同，丢弃帧'
        };
      }
      return {
        type: 'unicast',
        action: 'forward',
        outPorts: [entry.port],
        reason: `在MAC表中找到目标地址，转发到端口 ${entry.port}`
      };
    } else {
      // 未知单播
      const outPorts = ports
        .filter(p => p.name !== srcPort && p.status === 'up' && p.stpState === 'forwarding')
        .map(p => p.name);
      return {
        type: 'unknown',
        action: 'flood',
        outPorts,
        reason: 'MAC表中未找到目标地址，执行未知单播泛洪'
      };
    }
  };

  // 执行查询
  const handleQuery = async () => {
    if (!queryMac) return;
    
    setIsQuerying(true);
    setQueryResult(null);
    setHighlightedEntry(null);

    // 模拟查表过程
    for (const entry of macTable) {
      setHighlightedEntry(entry.id);
      await new Promise(resolve => setTimeout(resolve, 200));
      if (entry.mac.toUpperCase() === queryMac.toUpperCase()) {
        break;
      }
    }

    const result = makeForwardDecision(queryMac);
    setQueryResult(result);
    setIsQuerying(false);
    onForwardDecision?.(result);
  };

  // MAC地址学习演示
  const startLearningDemo = async () => {
    const steps = [
      '1. 交换机收到一个数据帧',
      '2. 读取帧的源MAC地址: AA:BB:CC:DD:EE:99',
      '3. 记录源MAC地址与入端口的映射关系',
      '4. 将条目添加到MAC地址表',
      '5. 设置老化计时器 (默认300秒)',
      '6. 如果在老化时间内再次收到该MAC的帧，重置计时器',
      '7. 如果超时未收到，删除该条目'
    ];

    setLearningDemo({ step: 0, steps });

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLearningDemo({ step: i + 1, steps });
      
      // 在第4步添加新条目
      if (i === 3) {
        const newEntry: MACEntry = {
          id: 'demo',
          mac: 'AA:BB:CC:DD:EE:99',
          port: 'Fa0/5',
          vlan: 1,
          type: 'dynamic',
          age: 0,
          maxAge: 300
        };
        setMACTable(prev => [...prev, newEntry]);
        setHighlightedEntry('demo');
      }
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
    setLearningDemo(null);
    setHighlightedEntry(null);
    // 移除演示条目
    setMACTable(prev => prev.filter(e => e.id !== 'demo'));
  };

  return (
    <Card className="bg-slate-900/90 border-purple-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-purple-400">
          <Network className="w-5 h-5" />
          交换机 {switchId} - 工作原理
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="mac-table" className="text-xs">
              <Table2 className="w-3 h-3 mr-1" />
              MAC表
            </TabsTrigger>
            <TabsTrigger value="ports" className="text-xs">
              <Layers className="w-3 h-3 mr-1" />
              端口
            </TabsTrigger>
            <TabsTrigger value="forward" className="text-xs">
              <ArrowRight className="w-3 h-3 mr-1" />
              帧转发
            </TabsTrigger>
            <TabsTrigger value="learning" className="text-xs">
              <GitBranch className="w-3 h-3 mr-1" />
              地址学习
            </TabsTrigger>
          </TabsList>

          {/* MAC地址表 */}
          <TabsContent value="mac-table" className="mt-0">
            <div className="space-y-2">
              <div className="text-xs text-slate-400 mb-2">
                MAC地址表记录了MAC地址与端口的映射关系，交换机根据此表进行二层转发
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700">
                      <th className="text-left py-2 px-2">MAC地址</th>
                      <th className="text-left py-2 px-2">端口</th>
                      <th className="text-left py-2 px-2">VLAN</th>
                      <th className="text-left py-2 px-2">类型</th>
                      <th className="text-left py-2 px-2">老化</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {macTable.map((entry, index) => (
                        <motion.tr
                          key={entry.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ 
                            opacity: 1, 
                            x: 0,
                            backgroundColor: highlightedEntry === entry.id 
                              ? 'rgba(168, 85, 247, 0.2)' 
                              : 'transparent'
                          }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-slate-800 hover:bg-slate-800/50"
                        >
                          <td className="py-2 px-2 font-mono text-purple-300">
                            {entry.mac}
                          </td>
                          <td className="py-2 px-2 text-cyan-400">
                            {entry.port}
                          </td>
                          <td className="py-2 px-2 text-yellow-400">
                            {entry.vlan}
                          </td>
                          <td className="py-2 px-2">
                            <Badge className={entry.type === 'static' 
                              ? 'bg-blue-500/20 text-blue-400' 
                              : 'bg-green-500/20 text-green-400'
                            }>
                              {entry.type === 'static' ? '静态' : '动态'}
                            </Badge>
                          </td>
                          <td className="py-2 px-2 text-slate-400">
                            {entry.type === 'static' ? '-' : (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {entry.maxAge - entry.age}s
                              </div>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* 端口信息 */}
          <TabsContent value="ports" className="mt-0">
            <div className="space-y-2">
              <div className="text-xs text-slate-400 mb-2">
                交换机端口可配置为Access或Trunk模式，STP协议防止环路
              </div>
              <div className="grid gap-2">
                {ports.map((port, index) => (
                  <motion.div
                    key={port.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-slate-800/50 rounded-lg p-2 border ${
                      port.status === 'up' ? 'border-green-500/30' : 'border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-400 text-sm font-medium">
                          {port.name}
                        </span>
                        <Badge className={port.status === 'up' 
                          ? 'bg-green-500/20 text-green-400 text-[10px]' 
                          : 'bg-red-500/20 text-red-400 text-[10px]'
                        }>
                          {port.status}
                        </Badge>
                        <Badge className={stpStateColors[port.stpState] + ' text-[10px]'}>
                          STP: {port.stpState}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{port.speed}</span>
                        <span>|</span>
                        <span>VLAN {port.vlan}</span>
                        <span>|</span>
                        <Badge className={port.mode === 'trunk' 
                          ? 'bg-purple-500/20 text-purple-400 text-[10px]' 
                          : 'bg-blue-500/20 text-blue-400 text-[10px]'
                        }>
                          {port.mode}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* 帧转发决策 */}
          <TabsContent value="forward" className="mt-0">
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                输入目标MAC地址，观察交换机如何做出转发决策
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={queryMac}
                  onChange={(e) => setQueryMac(e.target.value)}
                  placeholder="输入目标MAC，如 AA:BB:CC:DD:EE:01"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm font-mono text-white placeholder:text-slate-500"
                />
                <Button 
                  onClick={handleQuery}
                  disabled={isQuerying || !queryMac}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isQuerying ? '查询中...' : '查询转发'}
                </Button>
              </div>

              {/* 快捷按钮 */}
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setQueryMac('FF:FF:FF:FF:FF:FF')}
                  className="text-xs"
                >
                  广播地址
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setQueryMac('01:00:5E:00:00:01')}
                  className="text-xs"
                >
                  多播地址
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setQueryMac('AA:BB:CC:DD:EE:01')}
                  className="text-xs"
                >
                  已知单播
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setQueryMac('99:99:99:99:99:99')}
                  className="text-xs"
                >
                  未知单播
                </Button>
              </div>

              {/* 查询结果 */}
              <AnimatePresence>
                {queryResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`rounded-lg p-4 border ${
                      queryResult.action === 'forward' 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : queryResult.action === 'flood'
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={
                        queryResult.type === 'unicast' ? 'bg-green-500/20 text-green-400' :
                        queryResult.type === 'broadcast' ? 'bg-yellow-500/20 text-yellow-400' :
                        queryResult.type === 'multicast' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-orange-500/20 text-orange-400'
                      }>
                        {queryResult.type === 'unicast' ? '单播' :
                         queryResult.type === 'broadcast' ? '广播' :
                         queryResult.type === 'multicast' ? '多播' : '未知单播'}
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <Badge className={
                        queryResult.action === 'forward' ? 'bg-green-500/20 text-green-400' :
                        queryResult.action === 'flood' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }>
                        {queryResult.action === 'forward' ? '转发' :
                         queryResult.action === 'flood' ? '泛洪' : '丢弃'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-slate-300 mb-2">{queryResult.reason}</p>
                    
                    {queryResult.outPorts.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-slate-500">出端口:</span>
                        {queryResult.outPorts.map(port => (
                          <Badge key={port} className="bg-cyan-500/20 text-cyan-400 text-xs">
                            {port}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* 地址学习 */}
          <TabsContent value="learning" className="mt-0">
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                交换机通过学习数据帧的源MAC地址来构建MAC地址表
              </div>
              
              <Button 
                onClick={startLearningDemo}
                disabled={learningDemo !== null}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Zap className="w-4 h-4 mr-2" />
                演示MAC地址学习过程
              </Button>

              {/* 学习过程演示 */}
              <AnimatePresence>
                {learningDemo && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/30"
                  >
                    <div className="text-sm font-medium text-purple-400 mb-3">
                      MAC地址学习过程
                    </div>
                    <div className="space-y-2">
                      {learningDemo.steps.map((step, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ 
                            opacity: index < learningDemo.step ? 1 : 0.3,
                            x: 0
                          }}
                          className={`text-xs ${
                            index < learningDemo.step 
                              ? 'text-green-400' 
                              : 'text-slate-500'
                          }`}
                        >
                          {index < learningDemo.step && '✓ '}{step}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 学习原理说明 */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="text-sm font-medium text-slate-300 mb-2">
                  <Info className="w-4 h-4 inline mr-2" />
                  MAC地址学习原理
                </div>
                <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                  <li>交换机收到帧时，记录源MAC地址与入端口的映射</li>
                  <li>动态学习的条目有老化时间（通常300秒）</li>
                  <li>收到相同MAC的帧会刷新老化计时器</li>
                  <li>如果MAC地址从不同端口出现，更新端口映射</li>
                  <li>静态配置的MAC条目不会老化</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SwitchSimulator;
