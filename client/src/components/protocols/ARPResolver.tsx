import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Network, 
  Search, 
  Table2,
  Radio,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

// ARP缓存条目
interface ARPEntry {
  ip: string;
  mac: string;
  interface: string;
  type: 'dynamic' | 'static';
  age: number;
  state: 'reachable' | 'stale' | 'delay' | 'probe';
}

// ARP请求/响应
interface ARPPacket {
  type: 'request' | 'reply';
  senderIP: string;
  senderMAC: string;
  targetIP: string;
  targetMAC: string;
  timestamp: number;
}

interface ARPResolverProps {
  onResolved?: (mac: string) => void;
}

// 默认ARP缓存
const defaultARPCache: ARPEntry[] = [
  { ip: '192.168.1.1', mac: 'AA:BB:CC:DD:EE:01', interface: 'eth0', type: 'dynamic', age: 120, state: 'reachable' },
  { ip: '192.168.1.100', mac: 'AA:BB:CC:DD:EE:10', interface: 'eth0', type: 'dynamic', age: 45, state: 'reachable' },
  { ip: '192.168.1.101', mac: 'AA:BB:CC:DD:EE:11', interface: 'eth0', type: 'dynamic', age: 200, state: 'stale' },
  { ip: '192.168.1.254', mac: '11:22:33:44:55:66', interface: 'eth0', type: 'static', age: 0, state: 'reachable' },
];

// ARP帧格式
const arpFrameFields = [
  { name: '硬件类型', size: 2, value: '0x0001', description: '以太网 = 1' },
  { name: '协议类型', size: 2, value: '0x0800', description: 'IPv4 = 0x0800' },
  { name: '硬件地址长度', size: 1, value: '0x06', description: 'MAC地址 = 6字节' },
  { name: '协议地址长度', size: 1, value: '0x04', description: 'IPv4 = 4字节' },
  { name: '操作码', size: 2, value: '0x0001', description: '请求=1, 响应=2' },
  { name: '发送方MAC', size: 6, value: 'AA:BB:CC:DD:EE:01', description: '发送方硬件地址' },
  { name: '发送方IP', size: 4, value: '192.168.1.100', description: '发送方协议地址' },
  { name: '目标MAC', size: 6, value: '00:00:00:00:00:00', description: '目标硬件地址(请求时为0)' },
  { name: '目标IP', size: 4, value: '192.168.1.1', description: '目标协议地址' },
];

export const ARPResolver: React.FC<ARPResolverProps> = ({ onResolved }) => {
  const [activeTab, setActiveTab] = useState('resolver');
  const [arpCache, setARPCache] = useState<ARPEntry[]>(defaultARPCache);
  const [queryIP, setQueryIP] = useState('192.168.1.1');
  const [isResolving, setIsResolving] = useState(false);
  const [packets, setPackets] = useState<ARPPacket[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedEntry, setHighlightedEntry] = useState<string | null>(null);

  // 模拟ARP解析过程
  const startARPResolution = async () => {
    setIsResolving(true);
    setPackets([]);
    setCurrentStep(0);
    setHighlightedEntry(null);

    const targetIP = queryIP;
    const myIP = '192.168.1.100';
    const myMAC = 'AA:BB:CC:DD:EE:10';

    // 检查ARP缓存
    const cachedEntry = arpCache.find(e => e.ip === targetIP);
    if (cachedEntry && cachedEntry.state === 'reachable') {
      setHighlightedEntry(cachedEntry.ip);
      setCurrentStep(1);
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsResolving(false);
      onResolved?.(cachedEntry.mac);
      return;
    }

    // 步骤1: 发送ARP请求 (广播)
    setCurrentStep(1);
    const request: ARPPacket = {
      type: 'request',
      senderIP: myIP,
      senderMAC: myMAC,
      targetIP: targetIP,
      targetMAC: 'FF:FF:FF:FF:FF:FF', // 广播
      timestamp: Date.now()
    };
    setPackets([request]);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 步骤2: 收到ARP响应
    setCurrentStep(2);
    const resolvedMAC = 'AA:BB:CC:DD:EE:01';
    const reply: ARPPacket = {
      type: 'reply',
      senderIP: targetIP,
      senderMAC: resolvedMAC,
      targetIP: myIP,
      targetMAC: myMAC,
      timestamp: Date.now()
    };
    setPackets(prev => [...prev, reply]);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 步骤3: 更新ARP缓存
    setCurrentStep(3);
    const existingIndex = arpCache.findIndex(e => e.ip === targetIP);
    if (existingIndex >= 0) {
      setARPCache(prev => prev.map((e, i) => 
        i === existingIndex 
          ? { ...e, mac: resolvedMAC, age: 0, state: 'reachable' as const }
          : e
      ));
    } else {
      setARPCache(prev => [...prev, {
        ip: targetIP,
        mac: resolvedMAC,
        interface: 'eth0',
        type: 'dynamic',
        age: 0,
        state: 'reachable'
      }]);
    }
    setHighlightedEntry(targetIP);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsResolving(false);
    onResolved?.(resolvedMAC);
  };

  // 状态颜色
  const stateColors: Record<string, string> = {
    reachable: 'bg-green-500/20 text-green-400',
    stale: 'bg-yellow-500/20 text-yellow-400',
    delay: 'bg-orange-500/20 text-orange-400',
    probe: 'bg-blue-500/20 text-blue-400'
  };

  return (
    <Card className="bg-slate-900/90 border-green-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-green-400">
          <Network className="w-5 h-5" />
          ARP解析器 - 地址解析协议
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="resolver" className="text-xs">
              <Search className="w-3 h-3 mr-1" />
              解析演示
            </TabsTrigger>
            <TabsTrigger value="cache" className="text-xs">
              <Table2 className="w-3 h-3 mr-1" />
              ARP缓存
            </TabsTrigger>
            <TabsTrigger value="frame" className="text-xs">
              <Radio className="w-3 h-3 mr-1" />
              帧格式
            </TabsTrigger>
            <TabsTrigger value="attacks" className="text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              ARP攻击
            </TabsTrigger>
          </TabsList>

          {/* ARP解析演示 */}
          <TabsContent value="resolver" className="mt-0">
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                ARP协议将IP地址解析为MAC地址，是局域网通信的基础
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={queryIP}
                  onChange={(e) => setQueryIP(e.target.value)}
                  placeholder="输入目标IP，如 192.168.1.1"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm font-mono text-white placeholder:text-slate-500"
                />
                <Button 
                  onClick={startARPResolution}
                  disabled={isResolving || !queryIP}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {isResolving ? '解析中...' : 'ARP解析'}
                </Button>
              </div>

              {/* 解析过程可视化 */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="text-sm font-medium text-green-400 mb-3">ARP解析过程</div>
                
                {/* 网络拓扑示意 */}
                <div className="flex items-center justify-between mb-4 p-3 bg-slate-900/50 rounded">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-1">
                      <Network className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="text-xs text-slate-300">本机</div>
                    <div className="text-[10px] text-slate-500 font-mono">192.168.1.100</div>
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center px-4">
                    {/* ARP请求 */}
                    <motion.div
                      animate={{ 
                        x: currentStep >= 1 ? [0, 100, 100] : 0,
                        opacity: currentStep >= 1 ? [1, 1, 0] : 0
                      }}
                      transition={{ duration: 1 }}
                      className="flex items-center gap-1 text-xs text-yellow-400 mb-2"
                    >
                      <Radio className="w-3 h-3" />
                      ARP Request (广播)
                      <ArrowRight className="w-3 h-3" />
                    </motion.div>
                    
                    {/* ARP响应 */}
                    <motion.div
                      animate={{ 
                        x: currentStep >= 2 ? [100, 0, 0] : 100,
                        opacity: currentStep >= 2 ? [1, 1, 1] : 0
                      }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="flex items-center gap-1 text-xs text-green-400"
                    >
                      <ArrowRight className="w-3 h-3 rotate-180" />
                      ARP Reply (单播)
                    </motion.div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-1">
                      <Network className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="text-xs text-slate-300">目标</div>
                    <div className="text-[10px] text-slate-500 font-mono">{queryIP}</div>
                  </div>
                </div>

                {/* 步骤说明 */}
                <div className="space-y-2">
                  {[
                    { step: 1, text: '检查ARP缓存，未找到目标MAC地址' },
                    { step: 1, text: '发送ARP请求广播: "谁是 ' + queryIP + '?"' },
                    { step: 2, text: '目标主机收到请求，发送ARP响应' },
                    { step: 3, text: '收到响应，更新ARP缓存' }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      animate={{ 
                        opacity: currentStep >= item.step ? 1 : 0.3,
                        x: currentStep >= item.step ? 0 : -10
                      }}
                      className={`text-xs ${
                        currentStep >= item.step ? 'text-green-400' : 'text-slate-500'
                      }`}
                    >
                      {currentStep >= item.step && '✓ '}{item.text}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 数据包详情 */}
              <AnimatePresence>
                {packets.map((packet, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-slate-800/50 rounded-lg p-3 border ${
                      packet.type === 'request' 
                        ? 'border-yellow-500/30' 
                        : 'border-green-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={
                        packet.type === 'request' 
                          ? 'bg-yellow-500/20 text-yellow-400' 
                          : 'bg-green-500/20 text-green-400'
                      }>
                        ARP {packet.type === 'request' ? '请求' : '响应'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">发送方IP: </span>
                        <span className="font-mono text-cyan-400">{packet.senderIP}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">发送方MAC: </span>
                        <span className="font-mono text-yellow-400">{packet.senderMAC}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">目标IP: </span>
                        <span className="font-mono text-cyan-400">{packet.targetIP}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">目标MAC: </span>
                        <span className="font-mono text-yellow-400">{packet.targetMAC}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* ARP缓存 */}
          <TabsContent value="cache" className="mt-0">
            <div className="space-y-2">
              <div className="text-xs text-slate-400 mb-2">
                ARP缓存存储IP到MAC的映射，避免重复广播查询
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700">
                      <th className="text-left py-2 px-2">IP地址</th>
                      <th className="text-left py-2 px-2">MAC地址</th>
                      <th className="text-left py-2 px-2">接口</th>
                      <th className="text-left py-2 px-2">类型</th>
                      <th className="text-left py-2 px-2">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {arpCache.map((entry, index) => (
                      <motion.tr
                        key={entry.ip}
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: 1,
                          backgroundColor: highlightedEntry === entry.ip 
                            ? 'rgba(34, 197, 94, 0.2)' 
                            : 'transparent'
                        }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-slate-800"
                      >
                        <td className="py-2 px-2 font-mono text-cyan-300">
                          {entry.ip}
                        </td>
                        <td className="py-2 px-2 font-mono text-yellow-400">
                          {entry.mac}
                        </td>
                        <td className="py-2 px-2 text-slate-300">
                          {entry.interface}
                        </td>
                        <td className="py-2 px-2">
                          <Badge className={entry.type === 'static' 
                            ? 'bg-blue-500/20 text-blue-400 text-[10px]' 
                            : 'bg-green-500/20 text-green-400 text-[10px]'
                          }>
                            {entry.type === 'static' ? '静态' : '动态'}
                          </Badge>
                        </td>
                        <td className="py-2 px-2">
                          <Badge className={`${stateColors[entry.state]} text-[10px]`}>
                            {entry.state}
                          </Badge>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ARP帧格式 */}
          <TabsContent value="frame" className="mt-0">
            <div className="space-y-2">
              <div className="text-xs text-slate-400 mb-2">
                ARP帧封装在以太网帧中，用于IP到MAC的地址解析
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                <div className="text-xs font-medium text-slate-300 mb-2">ARP报文格式 (28字节)</div>
                <div className="space-y-1">
                  {arpFrameFields.map((field, index) => (
                    <motion.div
                      key={field.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-2 text-xs"
                    >
                      <div className="w-28 text-slate-400">{field.name}</div>
                      <Badge className="bg-slate-700 text-slate-300 text-[10px] font-mono">
                        {field.size}B
                      </Badge>
                      <code className="text-cyan-400 bg-slate-900/50 px-2 py-0.5 rounded text-[10px]">
                        {field.value}
                      </code>
                      <span className="text-slate-500 text-[10px]">{field.description}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ARP攻击 */}
          <TabsContent value="attacks" className="mt-0">
            <div className="space-y-3">
              <div className="text-xs text-slate-400 mb-2">
                ARP协议没有认证机制，容易受到攻击
              </div>
              
              {/* ARP欺骗 */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-red-400">ARP欺骗 (ARP Spoofing)</span>
                </div>
                <p className="text-xs text-slate-300 mb-2">
                  攻击者发送伪造的ARP响应，将自己的MAC与目标IP绑定
                </p>
                <div className="text-xs text-slate-500">
                  危害: 中间人攻击、流量劫持、会话劫持
                </div>
              </div>

              {/* ARP泛洪 */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-orange-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-medium text-orange-400">ARP泛洪 (ARP Flooding)</span>
                </div>
                <p className="text-xs text-slate-300 mb-2">
                  发送大量伪造的ARP请求/响应，填满交换机MAC表
                </p>
                <div className="text-xs text-slate-500">
                  危害: 交换机退化为集线器，所有流量可被嗅探
                </div>
              </div>

              {/* 防御措施 */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">防御措施</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  <li>静态ARP绑定 (重要主机)</li>
                  <li>动态ARP检测 (DAI)</li>
                  <li>端口安全 (Port Security)</li>
                  <li>VLAN隔离</li>
                  <li>使用VPN加密通信</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ARPResolver;
