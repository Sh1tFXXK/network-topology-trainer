import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  ArrowLeftRight, 
  Table2, 
  Shuffle,
  Info,
  ArrowRight,
  Lock,
  Unlock
} from 'lucide-react';

// NAT转换条目
interface NATEntry {
  id: string;
  insideLocal: string;      // 内部本地地址 (私有IP:端口)
  insideGlobal: string;     // 内部全局地址 (公网IP:端口)
  outsideLocal: string;     // 外部本地地址
  outsideGlobal: string;    // 外部全局地址
  protocol: 'TCP' | 'UDP' | 'ICMP';
  state: 'active' | 'idle' | 'closing';
  timeout: number;
  created: string;
}

// NAT类型
type NATType = 'static' | 'dynamic' | 'pat';

interface NATGatewayProps {
  gatewayId?: string;
  publicIP?: string;
  onTranslation?: (entry: NATEntry) => void;
}

// 默认NAT表
const defaultNATTable: NATEntry[] = [
  {
    id: '1',
    insideLocal: '192.168.1.100:45678',
    insideGlobal: '203.0.113.10:10001',
    outsideLocal: '8.8.8.8:443',
    outsideGlobal: '8.8.8.8:443',
    protocol: 'TCP',
    state: 'active',
    timeout: 3600,
    created: '2 min ago'
  },
  {
    id: '2',
    insideLocal: '192.168.1.101:52341',
    insideGlobal: '203.0.113.10:10002',
    outsideLocal: '142.250.185.78:80',
    outsideGlobal: '142.250.185.78:80',
    protocol: 'TCP',
    state: 'active',
    timeout: 1800,
    created: '5 min ago'
  },
  {
    id: '3',
    insideLocal: '192.168.1.100:53',
    insideGlobal: '203.0.113.10:10003',
    outsideLocal: '8.8.8.8:53',
    outsideGlobal: '8.8.8.8:53',
    protocol: 'UDP',
    state: 'idle',
    timeout: 60,
    created: '30 sec ago'
  },
  {
    id: '4',
    insideLocal: '192.168.1.102:0',
    insideGlobal: '203.0.113.10:0',
    outsideLocal: '1.1.1.1:0',
    outsideGlobal: '1.1.1.1:0',
    protocol: 'ICMP',
    state: 'active',
    timeout: 30,
    created: '10 sec ago'
  }
];

// NAT类型配置
const natTypeConfigs = {
  static: {
    name: '静态NAT',
    description: '一对一映射，内部地址与公网地址固定绑定',
    example: '192.168.1.100 ↔ 203.0.113.100',
    useCase: '需要从外部访问内部服务器（如Web服务器）'
  },
  dynamic: {
    name: '动态NAT',
    description: '从地址池中动态分配公网地址',
    example: '192.168.1.x → 地址池中可用IP',
    useCase: '内部主机数量少于公网地址数量'
  },
  pat: {
    name: 'PAT/NAPT',
    description: '端口地址转换，多个内部地址共享一个公网地址',
    example: '多个内部IP:端口 → 一个公网IP:不同端口',
    useCase: '最常用，家庭/企业网络出口'
  }
};

export const NATGateway: React.FC<NATGatewayProps> = ({
  gatewayId = 'NAT-GW',
  publicIP = '203.0.113.10',
  onTranslation
}) => {
  const [natTable, setNATTable] = useState<NATEntry[]>(defaultNATTable);
  const [activeTab, setActiveTab] = useState('nat-table');
  const [selectedType, setSelectedType] = useState<NATType>('pat');
  const [demoStep, setDemoStep] = useState<number>(0);
  const [isDemo, setIsDemo] = useState(false);

  // NAT转换演示
  const startNATDemo = async () => {
    setIsDemo(true);
    setDemoStep(0);
    
    const steps = [
      '1. 内部主机 192.168.1.100 发起连接到 google.com (142.250.185.78:443)',
      '2. 数据包到达NAT网关，源地址: 192.168.1.100:45678',
      '3. NAT网关分配公网端口: 203.0.113.10:10005',
      '4. 创建NAT转换条目，记录映射关系',
      '5. 修改数据包源地址为公网地址，转发到互联网',
      '6. 服务器响应返回到 203.0.113.10:10005',
      '7. NAT网关查表，找到对应的内部地址',
      '8. 修改目标地址为 192.168.1.100:45678，转发到内网'
    ];

    for (let i = 0; i < steps.length; i++) {
      setDemoStep(i + 1);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // 添加新的NAT条目
    const newEntry: NATEntry = {
      id: 'demo',
      insideLocal: '192.168.1.100:45678',
      insideGlobal: '203.0.113.10:10005',
      outsideLocal: '142.250.185.78:443',
      outsideGlobal: '142.250.185.78:443',
      protocol: 'TCP',
      state: 'active',
      timeout: 3600,
      created: 'just now'
    };
    setNATTable(prev => [newEntry, ...prev]);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsDemo(false);
    setDemoStep(0);
    // 移除演示条目
    setNATTable(prev => prev.filter(e => e.id !== 'demo'));
  };

  // 状态颜色
  const stateColors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400',
    idle: 'bg-yellow-500/20 text-yellow-400',
    closing: 'bg-red-500/20 text-red-400'
  };

  return (
    <Card className="bg-slate-900/90 border-orange-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-orange-400">
          <Globe className="w-5 h-5" />
          NAT网关 {gatewayId} - 网络地址转换
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="nat-table" className="text-xs">
              <Table2 className="w-3 h-3 mr-1" />
              NAT表
            </TabsTrigger>
            <TabsTrigger value="types" className="text-xs">
              <Shuffle className="w-3 h-3 mr-1" />
              NAT类型
            </TabsTrigger>
            <TabsTrigger value="demo" className="text-xs">
              <ArrowLeftRight className="w-3 h-3 mr-1" />
              转换演示
            </TabsTrigger>
            <TabsTrigger value="traversal" className="text-xs">
              <Lock className="w-3 h-3 mr-1" />
              NAT穿透
            </TabsTrigger>
          </TabsList>

          {/* NAT转换表 */}
          <TabsContent value="nat-table" className="mt-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-slate-400">
                  NAT转换表记录了内外网地址的映射关系
                </div>
                <Badge className="bg-orange-500/20 text-orange-400">
                  公网IP: {publicIP}
                </Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700">
                      <th className="text-left py-2 px-1">内部本地</th>
                      <th className="text-left py-2 px-1">内部全局</th>
                      <th className="text-left py-2 px-1">外部地址</th>
                      <th className="text-left py-2 px-1">协议</th>
                      <th className="text-left py-2 px-1">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {natTable.map((entry, index) => (
                        <motion.tr
                          key={entry.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className={`border-b border-slate-800 hover:bg-slate-800/50 ${
                            entry.id === 'demo' ? 'bg-orange-500/10' : ''
                          }`}
                        >
                          <td className="py-2 px-1 font-mono text-cyan-300 text-[11px]">
                            {entry.insideLocal}
                          </td>
                          <td className="py-2 px-1 font-mono text-orange-300 text-[11px]">
                            {entry.insideGlobal}
                          </td>
                          <td className="py-2 px-1 font-mono text-green-300 text-[11px]">
                            {entry.outsideGlobal}
                          </td>
                          <td className="py-2 px-1">
                            <Badge className="bg-blue-500/20 text-blue-400 text-[10px]">
                              {entry.protocol}
                            </Badge>
                          </td>
                          <td className="py-2 px-1">
                            <Badge className={`${stateColors[entry.state]} text-[10px]`}>
                              {entry.state}
                            </Badge>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              
              {/* 地址说明 */}
              <div className="mt-3 p-2 bg-slate-800/50 rounded text-xs text-slate-400">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-cyan-400">内部本地:</span> 私网IP:端口</div>
                  <div><span className="text-orange-400">内部全局:</span> 公网IP:端口</div>
                  <div><span className="text-green-400">外部地址:</span> 目标服务器地址</div>
                  <div><span className="text-blue-400">协议:</span> TCP/UDP/ICMP</div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* NAT类型 */}
          <TabsContent value="types" className="mt-0">
            <div className="space-y-3">
              <div className="text-xs text-slate-400 mb-2">
                NAT有多种类型，适用于不同的网络场景
              </div>
              
              {(Object.keys(natTypeConfigs) as NATType[]).map((type) => (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-slate-800/50 rounded-lg p-3 border cursor-pointer transition-all ${
                    selectedType === type 
                      ? 'border-orange-500/50 bg-orange-500/10' 
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                  onClick={() => setSelectedType(type)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${
                      type === 'static' ? 'bg-blue-500/20 text-blue-400' :
                      type === 'dynamic' ? 'bg-green-500/20 text-green-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {natTypeConfigs[type].name}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-300 mb-2">
                    {natTypeConfigs[type].description}
                  </p>
                  <div className="text-xs">
                    <div className="text-slate-500 mb-1">示例:</div>
                    <code className="text-cyan-400 bg-slate-900/50 px-2 py-1 rounded">
                      {natTypeConfigs[type].example}
                    </code>
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    <span className="text-yellow-400">适用场景:</span> {natTypeConfigs[type].useCase}
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* 转换演示 */}
          <TabsContent value="demo" className="mt-0">
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                观察数据包经过NAT网关时地址转换的完整过程
              </div>
              
              <Button 
                onClick={startNATDemo}
                disabled={isDemo}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                {isDemo ? '演示中...' : '开始NAT转换演示'}
              </Button>

              {/* 演示过程 */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="text-sm font-medium text-orange-400 mb-3">
                  PAT转换过程 (出站)
                </div>
                
                {/* 可视化图示 */}
                <div className="flex items-center justify-between mb-4 p-3 bg-slate-900/50 rounded">
                  <div className="text-center">
                    <div className="text-xs text-slate-500 mb-1">内网主机</div>
                    <div className="font-mono text-xs text-cyan-400">
                      192.168.1.100
                    </div>
                    <div className="font-mono text-[10px] text-slate-500">
                      :45678
                    </div>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center">
                    <ArrowRight className={`w-4 h-4 ${demoStep >= 2 ? 'text-orange-400' : 'text-slate-600'}`} />
                  </div>
                  
                  <div className="text-center px-4 py-2 bg-orange-500/10 rounded border border-orange-500/30">
                    <div className="text-xs text-orange-400 mb-1">NAT网关</div>
                    <div className="font-mono text-xs text-orange-300">
                      {publicIP}
                    </div>
                    <div className="font-mono text-[10px] text-slate-500">
                      :10005
                    </div>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center">
                    <ArrowRight className={`w-4 h-4 ${demoStep >= 5 ? 'text-green-400' : 'text-slate-600'}`} />
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs text-slate-500 mb-1">外网服务器</div>
                    <div className="font-mono text-xs text-green-400">
                      142.250.185.78
                    </div>
                    <div className="font-mono text-[10px] text-slate-500">
                      :443
                    </div>
                  </div>
                </div>

                {/* 步骤说明 */}
                <div className="space-y-1">
                  {[
                    '1. 内部主机发起连接请求',
                    '2. 数据包到达NAT网关',
                    '3. 分配公网端口',
                    '4. 创建NAT映射条目',
                    '5. 转发到互联网',
                    '6. 收到响应数据包',
                    '7. 查找NAT映射',
                    '8. 转发到内网主机'
                  ].map((step, index) => (
                    <motion.div
                      key={index}
                      animate={{ 
                        opacity: demoStep > index ? 1 : 0.3,
                        x: demoStep > index ? 0 : -10
                      }}
                      className={`text-xs ${
                        demoStep > index ? 'text-green-400' : 'text-slate-500'
                      }`}
                    >
                      {demoStep > index && '✓ '}{step}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* NAT穿透 */}
          <TabsContent value="traversal" className="mt-0">
            <div className="space-y-3">
              <div className="text-xs text-slate-400 mb-2">
                NAT会阻止外部主动发起的连接，需要特殊技术实现穿透
              </div>
              
              {/* STUN */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Unlock className="w-4 h-4 text-blue-400" />
                  <Badge className="bg-blue-500/20 text-blue-400">STUN</Badge>
                  <span className="text-xs text-slate-400">Session Traversal Utilities for NAT</span>
                </div>
                <p className="text-xs text-slate-300 mb-2">
                  客户端通过STUN服务器发现自己的公网地址和端口
                </p>
                <div className="text-xs text-slate-500">
                  适用: 对称NAT以外的NAT类型
                </div>
              </div>

              {/* TURN */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Shuffle className="w-4 h-4 text-green-400" />
                  <Badge className="bg-green-500/20 text-green-400">TURN</Badge>
                  <span className="text-xs text-slate-400">Traversal Using Relays around NAT</span>
                </div>
                <p className="text-xs text-slate-300 mb-2">
                  通过中继服务器转发数据，适用于所有NAT类型
                </p>
                <div className="text-xs text-slate-500">
                  缺点: 增加延迟，需要服务器带宽
                </div>
              </div>

              {/* ICE */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <Badge className="bg-purple-500/20 text-purple-400">ICE</Badge>
                  <span className="text-xs text-slate-400">Interactive Connectivity Establishment</span>
                </div>
                <p className="text-xs text-slate-300 mb-2">
                  综合使用STUN和TURN，自动选择最佳连接方式
                </p>
                <div className="text-xs text-slate-500">
                  应用: WebRTC、VoIP等P2P应用
                </div>
              </div>

              {/* 端口映射 */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-orange-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowLeftRight className="w-4 h-4 text-orange-400" />
                  <Badge className="bg-orange-500/20 text-orange-400">端口映射</Badge>
                  <span className="text-xs text-slate-400">Port Forwarding</span>
                </div>
                <p className="text-xs text-slate-300 mb-2">
                  在NAT设备上手动配置端口转发规则
                </p>
                <div className="text-xs text-slate-500">
                  示例: 公网:8080 → 内网192.168.1.100:80
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NATGateway;
