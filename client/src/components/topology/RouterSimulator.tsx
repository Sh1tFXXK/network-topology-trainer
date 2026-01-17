import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Router, 
  ArrowRight, 
  Network, 
  Table2, 
  GitBranch,
  Zap,
  Info,
  CheckCircle2,
  XCircle
} from 'lucide-react';

// 路由表条目接口
interface RouteEntry {
  id: string;
  destination: string;
  mask: string;
  nextHop: string;
  interface: string;
  metric: number;
  protocol: 'direct' | 'static' | 'rip' | 'ospf' | 'bgp';
  age?: number;
}

// 路由查询结果
interface RouteResult {
  matched: boolean;
  entry?: RouteEntry;
  matchedBits: number;
  steps: string[];
}

// 接口信息
interface InterfaceInfo {
  name: string;
  ip: string;
  mask: string;
  mac: string;
  status: 'up' | 'down';
  network: string;
}

interface RouterSimulatorProps {
  routerId?: string;
  onRouteDecision?: (result: RouteResult) => void;
  highlightDestination?: string;
}

// 默认路由表
const defaultRoutingTable: RouteEntry[] = [
  {
    id: '1',
    destination: '192.168.1.0',
    mask: '255.255.255.0',
    nextHop: '直连',
    interface: 'eth0',
    metric: 0,
    protocol: 'direct'
  },
  {
    id: '2',
    destination: '192.168.2.0',
    mask: '255.255.255.0',
    nextHop: '直连',
    interface: 'eth1',
    metric: 0,
    protocol: 'direct'
  },
  {
    id: '3',
    destination: '10.0.0.0',
    mask: '255.0.0.0',
    nextHop: '192.168.1.1',
    interface: 'eth0',
    metric: 10,
    protocol: 'static'
  },
  {
    id: '4',
    destination: '172.16.0.0',
    mask: '255.255.0.0',
    nextHop: '192.168.2.1',
    interface: 'eth1',
    metric: 20,
    protocol: 'rip',
    age: 45
  },
  {
    id: '5',
    destination: '0.0.0.0',
    mask: '0.0.0.0',
    nextHop: '192.168.1.254',
    interface: 'eth0',
    metric: 1,
    protocol: 'static'
  }
];

// 接口列表
const defaultInterfaces: InterfaceInfo[] = [
  {
    name: 'eth0',
    ip: '192.168.1.1',
    mask: '255.255.255.0',
    mac: 'AA:BB:CC:DD:EE:01',
    status: 'up',
    network: 'LAN1'
  },
  {
    name: 'eth1',
    ip: '192.168.2.1',
    mask: '255.255.255.0',
    mac: 'AA:BB:CC:DD:EE:02',
    status: 'up',
    network: 'LAN2'
  },
  {
    name: 'wan0',
    ip: '203.0.113.10',
    mask: '255.255.255.0',
    mac: 'AA:BB:CC:DD:EE:03',
    status: 'up',
    network: 'Internet'
  }
];

// IP地址转换为数字
const ipToNumber = (ip: string): number => {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
};

// 计算匹配的位数
const getMatchedBits = (ip: string, destination: string, mask: string): number => {
  const ipNum = ipToNumber(ip);
  const destNum = ipToNumber(destination);
  const maskNum = ipToNumber(mask);
  
  if ((ipNum & maskNum) === (destNum & maskNum)) {
    // 计算掩码中1的个数
    let count = 0;
    let m = maskNum;
    while (m) {
      count += m & 1;
      m >>>= 1;
    }
    return count;
  }
  return 0;
};

// 协议颜色映射
const protocolColors: Record<string, string> = {
  direct: 'bg-green-500/20 text-green-400 border-green-500/30',
  static: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  rip: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  ospf: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  bgp: 'bg-red-500/20 text-red-400 border-red-500/30'
};

const protocolNames: Record<string, string> = {
  direct: '直连',
  static: '静态',
  rip: 'RIP',
  ospf: 'OSPF',
  bgp: 'BGP'
};

export const RouterSimulator: React.FC<RouterSimulatorProps> = ({
  routerId = 'R1',
  onRouteDecision,
  highlightDestination
}) => {
  const [routingTable, setRoutingTable] = useState<RouteEntry[]>(defaultRoutingTable);
  const [interfaces, setInterfaces] = useState<InterfaceInfo[]>(defaultInterfaces);
  const [queryIp, setQueryIp] = useState('');
  const [queryResult, setQueryResult] = useState<RouteResult | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [activeTab, setActiveTab] = useState('routing-table');
  const [highlightedEntry, setHighlightedEntry] = useState<string | null>(null);

  // 路由查询算法 - 最长前缀匹配
  const performRouteQuery = (destIp: string): RouteResult => {
    const steps: string[] = [];
    let bestMatch: RouteEntry | undefined;
    let bestMatchBits = -1;

    steps.push(`开始查询目标地址: ${destIp}`);
    steps.push('执行最长前缀匹配算法...');

    for (const entry of routingTable) {
      const matchedBits = getMatchedBits(destIp, entry.destination, entry.mask);
      
      if (matchedBits > 0) {
        steps.push(`✓ 匹配路由 ${entry.destination}/${entry.mask} (${matchedBits}位)`);
        
        if (matchedBits > bestMatchBits) {
          bestMatchBits = matchedBits;
          bestMatch = entry;
        }
      } else {
        steps.push(`✗ 不匹配 ${entry.destination}/${entry.mask}`);
      }
    }

    if (bestMatch) {
      steps.push(`\n最佳匹配: ${bestMatch.destination}/${bestMatch.mask}`);
      steps.push(`下一跳: ${bestMatch.nextHop}`);
      steps.push(`出接口: ${bestMatch.interface}`);
      return { matched: true, entry: bestMatch, matchedBits: bestMatchBits, steps };
    } else {
      steps.push('\n未找到匹配路由，数据包将被丢弃');
      return { matched: false, matchedBits: 0, steps };
    }
  };

  // 执行查询动画
  const handleQuery = async () => {
    if (!queryIp) return;
    
    setIsQuerying(true);
    setQueryResult(null);
    setHighlightedEntry(null);

    // 模拟查询过程
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = performRouteQuery(queryIp);
    
    // 逐步显示结果
    for (let i = 0; i < routingTable.length; i++) {
      setHighlightedEntry(routingTable[i].id);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    if (result.entry) {
      setHighlightedEntry(result.entry.id);
    }
    
    setQueryResult(result);
    setIsQuerying(false);
    onRouteDecision?.(result);
  };

  // 当有外部高亮目标时自动查询
  useEffect(() => {
    if (highlightDestination) {
      setQueryIp(highlightDestination);
      // 自动切换到查询标签页
      setActiveTab('query');
      // 稍微延迟后自动触发查询
      const timer = setTimeout(() => {
        handleQuery();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [highlightDestination]);

  return (
    <Card className="bg-slate-900/90 border-cyan-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-cyan-400">
          <Router className="w-5 h-5" />
          路由器 {routerId} - 工作原理
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="routing-table" className="text-xs">
              <Table2 className="w-3 h-3 mr-1" />
              路由表
            </TabsTrigger>
            <TabsTrigger value="interfaces" className="text-xs">
              <Network className="w-3 h-3 mr-1" />
              接口
            </TabsTrigger>
            <TabsTrigger value="query" className="text-xs">
              <GitBranch className="w-3 h-3 mr-1" />
              路由查询
            </TabsTrigger>
            <TabsTrigger value="protocols" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              路由协议
            </TabsTrigger>
          </TabsList>

          {/* 路由表 */}
          <TabsContent value="routing-table" className="mt-0">
            <div className="space-y-2">
              <div className="text-xs text-slate-400 mb-2">
                路由表存储了到达各个网络的路径信息，路由器根据目标IP查表决定转发方向
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700">
                      <th className="text-left py-2 px-2">目标网络</th>
                      <th className="text-left py-2 px-2">掩码</th>
                      <th className="text-left py-2 px-2">下一跳</th>
                      <th className="text-left py-2 px-2">接口</th>
                      <th className="text-left py-2 px-2">度量</th>
                      <th className="text-left py-2 px-2">协议</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {routingTable.map((entry, index) => (
                        <motion.tr
                          key={entry.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ 
                            opacity: 1, 
                            x: 0,
                            backgroundColor: highlightedEntry === entry.id 
                              ? 'rgba(34, 211, 238, 0.2)' 
                              : 'transparent'
                          }}
                          transition={{ delay: index * 0.1 }}
                          className="border-b border-slate-800 hover:bg-slate-800/50"
                        >
                          <td className="py-2 px-2 font-mono text-cyan-300">
                            {entry.destination}
                          </td>
                          <td className="py-2 px-2 font-mono text-slate-300">
                            {entry.mask}
                          </td>
                          <td className="py-2 px-2 font-mono text-green-400">
                            {entry.nextHop}
                          </td>
                          <td className="py-2 px-2 text-yellow-400">
                            {entry.interface}
                          </td>
                          <td className="py-2 px-2 text-slate-300">
                            {entry.metric}
                          </td>
                          <td className="py-2 px-2">
                            <Badge className={`text-[10px] ${protocolColors[entry.protocol]}`}>
                              {protocolNames[entry.protocol]}
                            </Badge>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* 接口信息 */}
          <TabsContent value="interfaces" className="mt-0">
            <div className="space-y-2">
              <div className="text-xs text-slate-400 mb-2">
                路由器通过多个网络接口连接不同的网络，每个接口有独立的IP和MAC地址
              </div>
              <div className="grid gap-2">
                {interfaces.map((iface, index) => (
                  <motion.div
                    key={iface.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-800/50 rounded-lg p-3 border border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-cyan-400 font-medium">
                        {iface.name}
                      </span>
                      <Badge className={iface.status === 'up' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                      }>
                        {iface.status === 'up' ? '启用' : '禁用'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">IP地址:</span>
                        <span className="ml-2 font-mono text-green-400">{iface.ip}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">子网掩码:</span>
                        <span className="ml-2 font-mono text-slate-300">{iface.mask}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">MAC地址:</span>
                        <span className="ml-2 font-mono text-yellow-400">{iface.mac}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">连接网络:</span>
                        <span className="ml-2 text-purple-400">{iface.network}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* 路由查询 */}
          <TabsContent value="query" className="mt-0">
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                输入目标IP地址，观察路由器如何使用<strong className="text-cyan-400">最长前缀匹配</strong>算法查找路由
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={queryIp}
                  onChange={(e) => setQueryIp(e.target.value)}
                  placeholder="输入目标IP，如 10.1.2.3"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm font-mono text-white placeholder:text-slate-500"
                />
                <Button 
                  onClick={handleQuery}
                  disabled={isQuerying || !queryIp}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  {isQuerying ? '查询中...' : '查询路由'}
                </Button>
              </div>

              {/* 查询结果 */}
              <AnimatePresence>
                {queryResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-3"
                  >
                    {/* 查询步骤 */}
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                      <div className="text-xs font-medium text-slate-300 mb-2">查询过程:</div>
                      <div className="space-y-1 text-xs font-mono">
                        {queryResult.steps.map((step, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`${
                              step.startsWith('✓') ? 'text-green-400' :
                              step.startsWith('✗') ? 'text-red-400' :
                              step.startsWith('最佳') || step.startsWith('下一跳') || step.startsWith('出接口')
                                ? 'text-cyan-400 font-bold' :
                              'text-slate-400'
                            }`}
                          >
                            {step}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* 最终结果 */}
                    <div className={`rounded-lg p-3 border ${
                      queryResult.matched 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-red-500/10 border-red-500/30'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {queryResult.matched ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`text-sm font-medium ${
                          queryResult.matched ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {queryResult.matched ? '找到匹配路由' : '无匹配路由'}
                        </span>
                      </div>
                      {queryResult.entry && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-500">匹配网络:</span>
                            <span className="ml-2 font-mono text-cyan-400">
                              {queryResult.entry.destination}/{queryResult.entry.mask}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">匹配位数:</span>
                            <span className="ml-2 text-yellow-400">
                              {queryResult.matchedBits} bits
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">下一跳:</span>
                            <span className="ml-2 font-mono text-green-400">
                              {queryResult.entry.nextHop}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">出接口:</span>
                            <span className="ml-2 text-purple-400">
                              {queryResult.entry.interface}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* 路由协议 */}
          <TabsContent value="protocols" className="mt-0">
            <div className="space-y-3">
              <div className="text-xs text-slate-400 mb-2">
                路由协议用于动态学习和维护路由信息，不同协议有不同的特点和适用场景
              </div>
              
              {/* 直连路由 */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={protocolColors.direct}>直连路由</Badge>
                  <span className="text-xs text-slate-400">Connected</span>
                </div>
                <p className="text-xs text-slate-300">
                  路由器接口直接连接的网络，自动生成，优先级最高
                </p>
              </div>

              {/* 静态路由 */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={protocolColors.static}>静态路由</Badge>
                  <span className="text-xs text-slate-400">Static</span>
                </div>
                <p className="text-xs text-slate-300">
                  管理员手动配置的路由，适用于小型网络或特定路径控制
                </p>
              </div>

              {/* RIP */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-yellow-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={protocolColors.rip}>RIP</Badge>
                  <span className="text-xs text-slate-400">距离向量协议</span>
                </div>
                <p className="text-xs text-slate-300 mb-2">
                  使用跳数作为度量值，最大15跳，每30秒广播路由表
                </p>
                <div className="text-xs text-slate-500">
                  特点: 简单、收敛慢、适合小型网络
                </div>
              </div>

              {/* OSPF */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={protocolColors.ospf}>OSPF</Badge>
                  <span className="text-xs text-slate-400">链路状态协议</span>
                </div>
                <p className="text-xs text-slate-300 mb-2">
                  使用带宽计算度量值，支持区域划分，使用SPF算法
                </p>
                <div className="text-xs text-slate-500">
                  特点: 收敛快、支持大型网络、支持VLSM
                </div>
              </div>

              {/* BGP */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={protocolColors.bgp}>BGP</Badge>
                  <span className="text-xs text-slate-400">路径向量协议</span>
                </div>
                <p className="text-xs text-slate-300 mb-2">
                  用于自治系统间路由，互联网骨干网使用，支持复杂策略
                </p>
                <div className="text-xs text-slate-500">
                  特点: 可扩展性强、策略灵活、收敛较慢
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RouterSimulator;
