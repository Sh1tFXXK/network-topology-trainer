import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Send, 
  Globe,
  Server,
  Monitor,
  Router,
  Network,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Layers,
  Zap
} from 'lucide-react';

// 传输步骤
interface TransmissionStep {
  id: number;
  phase: string;
  title: string;
  description: string;
  device?: string;
  layer?: string;
  details: {
    label: string;
    value: string;
    color?: string;
  }[];
  duration: number;
  completed: boolean;
}

// 数据包在各层的表示
interface LayerData {
  layer: string;
  protocol: string;
  header: { field: string; value: string }[];
  data: string;
  size: number;
}

interface FullTransmissionProps {
  sourceIP?: string;
  destIP?: string;
  message?: string;
}

export const FullTransmission: React.FC<FullTransmissionProps> = ({
  sourceIP = '192.168.1.100',
  destIP = '93.184.216.34',
  message = 'Hello, World!'
}) => {
  const [activeTab, setActiveTab] = useState('journey');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [steps, setSteps] = useState<TransmissionStep[]>([]);
  const [url, setUrl] = useState('www.example.com');
  const [speed, setSpeed] = useState(1);

  // 生成完整传输步骤
  const generateSteps = useCallback((): TransmissionStep[] => {
    return [
      // 阶段1: DNS解析
      {
        id: 1,
        phase: 'DNS解析',
        title: '查询本地DNS缓存',
        description: '检查浏览器和操作系统的DNS缓存',
        device: '客户端',
        layer: '应用层',
        details: [
          { label: '查询域名', value: url, color: 'cyan' },
          { label: '缓存状态', value: '未命中', color: 'yellow' }
        ],
        duration: 1,
        completed: false
      },
      {
        id: 2,
        phase: 'DNS解析',
        title: '发送DNS查询请求',
        description: '向本地DNS服务器发送递归查询',
        device: '客户端 → DNS服务器',
        layer: '应用层/UDP',
        details: [
          { label: '目标DNS', value: '8.8.8.8:53', color: 'green' },
          { label: '查询类型', value: 'A记录', color: 'blue' },
          { label: '协议', value: 'UDP', color: 'purple' }
        ],
        duration: 50,
        completed: false
      },
      {
        id: 3,
        phase: 'DNS解析',
        title: '收到DNS响应',
        description: '获取目标服务器的IP地址',
        device: 'DNS服务器 → 客户端',
        layer: '应用层',
        details: [
          { label: '解析结果', value: destIP, color: 'green' },
          { label: 'TTL', value: '3600秒', color: 'yellow' },
          { label: '耗时', value: '~50ms', color: 'slate' }
        ],
        duration: 50,
        completed: false
      },
      // 阶段2: ARP解析
      {
        id: 4,
        phase: 'ARP解析',
        title: '查询网关MAC地址',
        description: '目标IP不在本地网络，需要发送到网关',
        device: '客户端',
        layer: '网络层',
        details: [
          { label: '目标IP', value: destIP, color: 'cyan' },
          { label: '判断', value: '不在本地子网', color: 'yellow' },
          { label: '网关IP', value: '192.168.1.1', color: 'green' }
        ],
        duration: 1,
        completed: false
      },
      {
        id: 5,
        phase: 'ARP解析',
        title: '发送ARP请求',
        description: '广播查询网关的MAC地址',
        device: '客户端 → 广播',
        layer: '数据链路层',
        details: [
          { label: '目标IP', value: '192.168.1.1', color: 'cyan' },
          { label: '目标MAC', value: 'FF:FF:FF:FF:FF:FF', color: 'yellow' },
          { label: '类型', value: 'ARP Request', color: 'orange' }
        ],
        duration: 1,
        completed: false
      },
      {
        id: 6,
        phase: 'ARP解析',
        title: '收到ARP响应',
        description: '网关回复其MAC地址',
        device: '网关 → 客户端',
        layer: '数据链路层',
        details: [
          { label: '网关MAC', value: 'AA:BB:CC:DD:EE:01', color: 'green' },
          { label: '类型', value: 'ARP Reply', color: 'green' },
          { label: '缓存', value: '已更新ARP表', color: 'blue' }
        ],
        duration: 1,
        completed: false
      },
      // 阶段3: TCP连接建立
      {
        id: 7,
        phase: 'TCP握手',
        title: '发送SYN包',
        description: 'TCP三次握手第一步',
        device: '客户端 → 服务器',
        layer: '传输层',
        details: [
          { label: '源端口', value: '52341', color: 'cyan' },
          { label: '目标端口', value: '80', color: 'green' },
          { label: 'Seq', value: '1000', color: 'yellow' },
          { label: '标志', value: 'SYN', color: 'orange' }
        ],
        duration: 20,
        completed: false
      },
      {
        id: 8,
        phase: 'TCP握手',
        title: '收到SYN-ACK包',
        description: 'TCP三次握手第二步',
        device: '服务器 → 客户端',
        layer: '传输层',
        details: [
          { label: 'Seq', value: '5000', color: 'yellow' },
          { label: 'Ack', value: '1001', color: 'green' },
          { label: '标志', value: 'SYN, ACK', color: 'orange' },
          { label: '窗口', value: '65535', color: 'purple' }
        ],
        duration: 20,
        completed: false
      },
      {
        id: 9,
        phase: 'TCP握手',
        title: '发送ACK包',
        description: 'TCP三次握手第三步，连接建立',
        device: '客户端 → 服务器',
        layer: '传输层',
        details: [
          { label: 'Seq', value: '1001', color: 'yellow' },
          { label: 'Ack', value: '5001', color: 'green' },
          { label: '标志', value: 'ACK', color: 'orange' },
          { label: '状态', value: 'ESTABLISHED', color: 'green' }
        ],
        duration: 20,
        completed: false
      },
      // 阶段4: 数据封装与发送
      {
        id: 10,
        phase: '数据封装',
        title: '应用层: 构建HTTP请求',
        description: '创建HTTP GET请求',
        device: '客户端',
        layer: '应用层',
        details: [
          { label: '方法', value: 'GET', color: 'cyan' },
          { label: 'URL', value: '/', color: 'green' },
          { label: 'Host', value: url, color: 'yellow' },
          { label: 'User-Agent', value: 'Mozilla/5.0', color: 'slate' }
        ],
        duration: 1,
        completed: false
      },
      {
        id: 11,
        phase: '数据封装',
        title: '传输层: 添加TCP头部',
        description: '封装TCP段，添加端口和序列号',
        device: '客户端',
        layer: '传输层',
        details: [
          { label: '源端口', value: '52341', color: 'cyan' },
          { label: '目标端口', value: '80', color: 'green' },
          { label: 'Seq', value: '1001', color: 'yellow' },
          { label: '头部大小', value: '20字节', color: 'purple' }
        ],
        duration: 1,
        completed: false
      },
      {
        id: 12,
        phase: '数据封装',
        title: '网络层: 添加IP头部',
        description: '封装IP数据报，添加源/目标IP',
        device: '客户端',
        layer: '网络层',
        details: [
          { label: '源IP', value: sourceIP, color: 'cyan' },
          { label: '目标IP', value: destIP, color: 'green' },
          { label: 'TTL', value: '64', color: 'yellow' },
          { label: '协议', value: 'TCP (6)', color: 'purple' }
        ],
        duration: 1,
        completed: false
      },
      {
        id: 13,
        phase: '数据封装',
        title: '数据链路层: 添加以太网帧头',
        description: '封装以太网帧，添加MAC地址',
        device: '客户端',
        layer: '数据链路层',
        details: [
          { label: '源MAC', value: 'AA:BB:CC:DD:EE:10', color: 'cyan' },
          { label: '目标MAC', value: 'AA:BB:CC:DD:EE:01', color: 'green' },
          { label: '类型', value: '0x0800 (IPv4)', color: 'yellow' },
          { label: 'FCS', value: '校验和', color: 'purple' }
        ],
        duration: 1,
        completed: false
      },
      {
        id: 14,
        phase: '数据封装',
        title: '物理层: 转换为比特流',
        description: '将帧转换为电信号/光信号',
        device: '客户端网卡',
        layer: '物理层',
        details: [
          { label: '编码', value: 'Manchester', color: 'cyan' },
          { label: '前导码', value: '7字节', color: 'yellow' },
          { label: 'SFD', value: '10101011', color: 'green' },
          { label: '介质', value: '双绞线/光纤', color: 'purple' }
        ],
        duration: 1,
        completed: false
      },
      // 阶段5: 路由转发
      {
        id: 15,
        phase: '路由转发',
        title: '到达本地网关',
        description: '数据包到达默认网关路由器',
        device: '路由器 R1',
        layer: '网络层',
        details: [
          { label: '入接口', value: 'eth0', color: 'cyan' },
          { label: '查询路由表', value: '最长前缀匹配', color: 'yellow' },
          { label: '下一跳', value: 'ISP路由器', color: 'green' }
        ],
        duration: 5,
        completed: false
      },
      {
        id: 16,
        phase: '路由转发',
        title: 'NAT地址转换',
        description: '将私有IP转换为公网IP',
        device: 'NAT网关',
        layer: '网络层',
        details: [
          { label: '原地址', value: `${sourceIP}:52341`, color: 'cyan' },
          { label: '转换后', value: '203.0.113.10:10001', color: 'green' },
          { label: 'NAT类型', value: 'PAT', color: 'yellow' },
          { label: '记录映射', value: '已添加到NAT表', color: 'purple' }
        ],
        duration: 1,
        completed: false
      },
      {
        id: 17,
        phase: '路由转发',
        title: '经过互联网路由',
        description: '数据包经过多个路由器转发',
        device: '互联网骨干网',
        layer: '网络层',
        details: [
          { label: '跳数', value: '~12跳', color: 'cyan' },
          { label: 'TTL递减', value: '64 → 52', color: 'yellow' },
          { label: '路由协议', value: 'BGP', color: 'purple' },
          { label: '延迟', value: '~30ms', color: 'slate' }
        ],
        duration: 30,
        completed: false
      },
      // 阶段6: 服务器接收
      {
        id: 18,
        phase: '服务器接收',
        title: '物理层: 接收信号',
        description: '服务器网卡接收电信号',
        device: '服务器网卡',
        layer: '物理层',
        details: [
          { label: '信号检测', value: '载波侦听', color: 'cyan' },
          { label: '同步', value: '时钟恢复', color: 'yellow' },
          { label: '解码', value: '比特流还原', color: 'green' }
        ],
        duration: 1,
        completed: false
      },
      {
        id: 19,
        phase: '服务器接收',
        title: '数据链路层: 解析以太网帧',
        description: '验证MAC地址和FCS',
        device: '服务器',
        layer: '数据链路层',
        details: [
          { label: '目标MAC', value: '匹配', color: 'green' },
          { label: 'FCS校验', value: '通过', color: 'green' },
          { label: '去除帧头', value: '14字节', color: 'yellow' }
        ],
        duration: 1,
        completed: false
      },
      {
        id: 20,
        phase: '服务器接收',
        title: '网络层: 解析IP数据报',
        description: '验证目标IP和校验和',
        device: '服务器',
        layer: '网络层',
        details: [
          { label: '目标IP', value: '匹配', color: 'green' },
          { label: '校验和', value: '通过', color: 'green' },
          { label: '协议字段', value: 'TCP (6)', color: 'yellow' },
          { label: '去除IP头', value: '20字节', color: 'purple' }
        ],
        duration: 1,
        completed: false
      },
      {
        id: 21,
        phase: '服务器接收',
        title: '传输层: 解析TCP段',
        description: '验证端口和序列号',
        device: '服务器',
        layer: '传输层',
        details: [
          { label: '目标端口', value: '80 (HTTP)', color: 'green' },
          { label: '序列号', value: '正确', color: 'green' },
          { label: '校验和', value: '通过', color: 'green' },
          { label: '发送ACK', value: 'Ack=1002', color: 'yellow' }
        ],
        duration: 1,
        completed: false
      },
      {
        id: 22,
        phase: '服务器接收',
        title: '应用层: 处理HTTP请求',
        description: 'Web服务器处理请求',
        device: '服务器',
        layer: '应用层',
        details: [
          { label: '请求方法', value: 'GET /', color: 'cyan' },
          { label: '处理程序', value: 'Nginx/Apache', color: 'yellow' },
          { label: '响应状态', value: '200 OK', color: 'green' },
          { label: '响应大小', value: '~1.5KB', color: 'purple' }
        ],
        duration: 5,
        completed: false
      },
      // 阶段7: 响应返回
      {
        id: 23,
        phase: '响应返回',
        title: '服务器发送HTTP响应',
        description: '响应数据经过相同的封装过程',
        device: '服务器 → 客户端',
        layer: '全部层',
        details: [
          { label: '状态码', value: '200 OK', color: 'green' },
          { label: 'Content-Type', value: 'text/html', color: 'cyan' },
          { label: '数据大小', value: '1.5KB', color: 'yellow' },
          { label: '路径', value: '原路返回', color: 'purple' }
        ],
        duration: 50,
        completed: false
      },
      {
        id: 24,
        phase: '响应返回',
        title: '客户端接收响应',
        description: '数据解封装，显示网页',
        device: '客户端',
        layer: '应用层',
        details: [
          { label: '解析HTML', value: '完成', color: 'green' },
          { label: '渲染页面', value: '完成', color: 'green' },
          { label: '总耗时', value: '~200ms', color: 'cyan' }
        ],
        duration: 10,
        completed: false
      },
      // 阶段8: 连接关闭
      {
        id: 25,
        phase: '连接关闭',
        title: 'TCP四次挥手',
        description: '优雅关闭TCP连接',
        device: '双向',
        layer: '传输层',
        details: [
          { label: '步骤1', value: 'FIN (客户端)', color: 'cyan' },
          { label: '步骤2', value: 'ACK (服务器)', color: 'yellow' },
          { label: '步骤3', value: 'FIN (服务器)', color: 'orange' },
          { label: '步骤4', value: 'ACK (客户端)', color: 'green' }
        ],
        duration: 20,
        completed: false
      }
    ];
  }, [url, sourceIP, destIP]);

  // 开始演示
  const startTransmission = async () => {
    const allSteps = generateSteps();
    setSteps(allSteps);
    setIsRunning(true);
    setCurrentStep(0);

    for (let i = 0; i < allSteps.length; i++) {
      if (!isRunning) break;
      
      setCurrentStep(i + 1);
      setSteps(prev => prev.map((step, idx) => 
        idx <= i ? { ...step, completed: true } : step
      ));
      
      await new Promise(resolve => 
        setTimeout(resolve, allSteps[i].duration * 50 / speed)
      );
    }
    
    setIsRunning(false);
  };

  // 重置
  const reset = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setSteps([]);
    setExpandedStep(null);
  };

  // 阶段颜色
  const phaseColors: Record<string, string> = {
    'DNS解析': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'ARP解析': 'bg-green-500/20 text-green-400 border-green-500/30',
    'TCP握手': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    '数据封装': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    '路由转发': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    '服务器接收': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    '响应返回': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    '连接关闭': 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  // 层级颜色
  const layerColors: Record<string, string> = {
    '应用层': 'text-blue-400',
    '传输层': 'text-green-400',
    '网络层': 'text-yellow-400',
    '数据链路层': 'text-orange-400',
    '物理层': 'text-red-400',
    '全部层': 'text-purple-400',
    '应用层/UDP': 'text-blue-400'
  };

  return (
    <Card className="bg-slate-900/90 border-cyan-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-cyan-400">
          <Send className="w-5 h-5" />
          数据传输全流程可视化
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="journey" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              传输旅程
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              时序图
            </TabsTrigger>
            <TabsTrigger value="layers" className="text-xs">
              <Layers className="w-3 h-3 mr-1" />
              协议栈
            </TabsTrigger>
          </TabsList>

          {/* 传输旅程 */}
          <TabsContent value="journey" className="mt-0">
            <div className="space-y-4">
              {/* 控制面板 */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="输入目标URL"
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm font-mono text-white"
                    disabled={isRunning}
                  />
                </div>
                <Button 
                  onClick={isRunning ? () => setIsRunning(false) : startTransmission}
                  className={isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-600 hover:bg-cyan-700'}
                >
                  {isRunning ? (
                    <><Pause className="w-4 h-4 mr-2" />暂停</>
                  ) : (
                    <><Play className="w-4 h-4 mr-2" />开始传输</>
                  )}
                </Button>
                <Button variant="outline" onClick={reset}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              {/* 进度指示 */}
              {steps.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">进度:</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-cyan-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-cyan-400">{currentStep}/{steps.length}</span>
                </div>
              )}

              {/* 步骤列表 */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                <AnimatePresence>
                  {steps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ 
                        opacity: step.completed || index === currentStep - 1 ? 1 : 0.4,
                        x: 0 
                      }}
                      className={`bg-slate-800/50 rounded-lg border ${
                        index === currentStep - 1 
                          ? 'border-cyan-500/50 bg-cyan-500/5' 
                          : step.completed 
                          ? 'border-green-500/30' 
                          : 'border-slate-700'
                      }`}
                    >
                      <div 
                        className="p-3 cursor-pointer"
                        onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {step.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            ) : index === currentStep - 1 ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              >
                                <Clock className="w-4 h-4 text-cyan-400" />
                              </motion.div>
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-600" />
                            )}
                            <Badge className={`${phaseColors[step.phase]} text-[10px]`}>
                              {step.phase}
                            </Badge>
                            <span className="text-sm text-slate-200">{step.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {step.layer && (
                              <span className={`text-[10px] ${layerColors[step.layer]}`}>
                                {step.layer}
                              </span>
                            )}
                            {expandedStep === step.id ? (
                              <ChevronUp className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </div>
                        
                        {/* 展开详情 */}
                        <AnimatePresence>
                          {expandedStep === step.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-3 pt-3 border-t border-slate-700"
                            >
                              <p className="text-xs text-slate-400 mb-2">{step.description}</p>
                              {step.device && (
                                <div className="text-xs text-slate-500 mb-2">
                                  设备: <span className="text-slate-300">{step.device}</span>
                                </div>
                              )}
                              <div className="grid grid-cols-2 gap-2">
                                {step.details.map((detail, i) => (
                                  <div key={i} className="text-xs">
                                    <span className="text-slate-500">{detail.label}: </span>
                                    <span className={`font-mono text-${detail.color || 'slate'}-400`}>
                                      {detail.value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </TabsContent>

          {/* 时序图 */}
          <TabsContent value="timeline" className="mt-0">
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                HTTP请求的完整时序图，展示客户端与服务器之间的消息交互
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                {/* 时序图头部 */}
                <div className="flex justify-between mb-4 pb-2 border-b border-slate-700">
                  <div className="text-center flex-1">
                    <Monitor className="w-6 h-6 mx-auto text-blue-400 mb-1" />
                    <div className="text-xs text-slate-300">客户端</div>
                    <div className="text-[10px] text-slate-500">{sourceIP}</div>
                  </div>
                  <div className="text-center flex-1">
                    <Router className="w-6 h-6 mx-auto text-yellow-400 mb-1" />
                    <div className="text-xs text-slate-300">路由器/NAT</div>
                  </div>
                  <div className="text-center flex-1">
                    <Globe className="w-6 h-6 mx-auto text-green-400 mb-1" />
                    <div className="text-xs text-slate-300">DNS服务器</div>
                  </div>
                  <div className="text-center flex-1">
                    <Server className="w-6 h-6 mx-auto text-cyan-400 mb-1" />
                    <div className="text-xs text-slate-300">Web服务器</div>
                    <div className="text-[10px] text-slate-500">{destIP}</div>
                  </div>
                </div>

                {/* 时序消息 */}
                <div className="space-y-3 relative">
                  {/* 垂直线 */}
                  <div className="absolute top-0 bottom-0 left-[12.5%] w-0.5 bg-slate-700" />
                  <div className="absolute top-0 bottom-0 left-[37.5%] w-0.5 bg-slate-700" />
                  <div className="absolute top-0 bottom-0 left-[62.5%] w-0.5 bg-slate-700" />
                  <div className="absolute top-0 bottom-0 left-[87.5%] w-0.5 bg-slate-700" />

                  {/* DNS查询 */}
                  <div className="relative flex items-center">
                    <div className="w-1/4 text-right pr-2">
                      <Badge className="bg-blue-500/20 text-blue-400 text-[10px]">DNS Query</Badge>
                    </div>
                    <div className="w-1/4 flex items-center">
                      <ArrowRight className="w-full h-4 text-blue-400" />
                    </div>
                  </div>
                  <div className="relative flex items-center">
                    <div className="w-1/4" />
                    <div className="w-1/4 flex items-center">
                      <ArrowRight className="w-full h-4 text-green-400 rotate-180" />
                    </div>
                    <div className="w-1/4 text-left pl-2">
                      <Badge className="bg-green-500/20 text-green-400 text-[10px]">DNS Response</Badge>
                    </div>
                  </div>

                  {/* TCP握手 */}
                  <div className="relative flex items-center">
                    <div className="w-1/4 text-right pr-2">
                      <Badge className="bg-yellow-500/20 text-yellow-400 text-[10px]">SYN</Badge>
                    </div>
                    <div className="w-1/2 flex items-center">
                      <ArrowRight className="w-full h-4 text-yellow-400" />
                    </div>
                  </div>
                  <div className="relative flex items-center">
                    <div className="w-1/4" />
                    <div className="w-1/2 flex items-center">
                      <ArrowRight className="w-full h-4 text-yellow-400 rotate-180" />
                    </div>
                    <div className="w-1/4 text-left pl-2">
                      <Badge className="bg-yellow-500/20 text-yellow-400 text-[10px]">SYN-ACK</Badge>
                    </div>
                  </div>
                  <div className="relative flex items-center">
                    <div className="w-1/4 text-right pr-2">
                      <Badge className="bg-yellow-500/20 text-yellow-400 text-[10px]">ACK</Badge>
                    </div>
                    <div className="w-1/2 flex items-center">
                      <ArrowRight className="w-full h-4 text-yellow-400" />
                    </div>
                  </div>

                  {/* HTTP请求/响应 */}
                  <div className="relative flex items-center">
                    <div className="w-1/4 text-right pr-2">
                      <Badge className="bg-cyan-500/20 text-cyan-400 text-[10px]">HTTP GET</Badge>
                    </div>
                    <div className="w-1/2 flex items-center">
                      <ArrowRight className="w-full h-4 text-cyan-400" />
                    </div>
                  </div>
                  <div className="relative flex items-center">
                    <div className="w-1/4" />
                    <div className="w-1/2 flex items-center">
                      <ArrowRight className="w-full h-4 text-cyan-400 rotate-180" />
                    </div>
                    <div className="w-1/4 text-left pl-2">
                      <Badge className="bg-cyan-500/20 text-cyan-400 text-[10px]">HTTP 200 OK</Badge>
                    </div>
                  </div>

                  {/* 连接关闭 */}
                  <div className="relative flex items-center">
                    <div className="w-1/4 text-right pr-2">
                      <Badge className="bg-red-500/20 text-red-400 text-[10px]">FIN</Badge>
                    </div>
                    <div className="w-1/2 flex items-center">
                      <ArrowRight className="w-full h-4 text-red-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 协议栈 */}
          <TabsContent value="layers" className="mt-0">
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                数据在各层协议栈中的封装结构
              </div>
              
              <div className="space-y-2">
                {[
                  { layer: '应用层', protocol: 'HTTP', color: 'blue', header: 'HTTP Header', data: 'HTTP Body (HTML/JSON)' },
                  { layer: '传输层', protocol: 'TCP', color: 'green', header: 'TCP Header (20B)', data: 'HTTP 数据' },
                  { layer: '网络层', protocol: 'IP', color: 'yellow', header: 'IP Header (20B)', data: 'TCP 段' },
                  { layer: '数据链路层', protocol: 'Ethernet', color: 'orange', header: 'Ethernet Header (14B)', data: 'IP 数据报', trailer: 'FCS (4B)' },
                  { layer: '物理层', protocol: '比特流', color: 'red', header: '前导码 (8B)', data: '以太网帧', trailer: '' }
                ].map((layer, index) => (
                  <motion.div
                    key={layer.layer}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-slate-800/50 rounded-lg p-3 border border-${layer.color}-500/30`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`bg-${layer.color}-500/20 text-${layer.color}-400`}>
                          {layer.layer}
                        </Badge>
                        <span className="text-xs text-slate-300">{layer.protocol}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 text-[10px]">
                      <div className={`bg-${layer.color}-500/30 px-2 py-1 rounded text-${layer.color}-300`}>
                        {layer.header}
                      </div>
                      <div className="flex-1 bg-slate-700/50 px-2 py-1 rounded text-slate-400 text-center">
                        {layer.data}
                      </div>
                      {layer.trailer && (
                        <div className={`bg-${layer.color}-500/30 px-2 py-1 rounded text-${layer.color}-300`}>
                          {layer.trailer}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* 封装/解封装说明 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-3 border border-green-500/30">
                  <div className="text-sm font-medium text-green-400 mb-2">
                    <ArrowDown className="w-4 h-4 inline mr-1" />
                    封装 (发送方)
                  </div>
                  <p className="text-xs text-slate-400">
                    数据从上层向下层传递，每层添加自己的头部信息
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 border border-blue-500/30">
                  <div className="text-sm font-medium text-blue-400 mb-2">
                    <ArrowDown className="w-4 h-4 inline mr-1 rotate-180" />
                    解封装 (接收方)
                  </div>
                  <p className="text-xs text-slate-400">
                    数据从下层向上层传递，每层移除对应的头部信息
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FullTransmission;
