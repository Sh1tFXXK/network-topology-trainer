import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import { 
  Network, 
  Globe,
  Server,
  Router,
  Activity,
  Send,
  ArrowLeftRight,
  Radio,
  BookOpen
} from 'lucide-react';

// 导入各个可视化组件
import DNSResolver from '@/components/protocols/DNSResolver';
import HTTPFlow from '@/components/protocols/HTTPFlow';
import TCPHandshake from '@/components/protocols/TCPHandshake';

// Placeholder components for missing features
const Placeholder = ({ name }: { name: string }) => (
  <div className="flex items-center justify-center h-full min-h-[400px] border border-dashed border-slate-700 rounded-xl bg-slate-900/30 text-slate-500 font-mono">
    {name} 模块开发中...
  </div>
);

const FullTransmission = () => <HTTPFlow />;
const RouterSimulator = () => <Placeholder name="路由器模拟" />;
const SwitchSimulator = () => <Placeholder name="交换机模拟" />;
const NATGateway = () => <Placeholder name="NAT 网关" />;
const ARPResolver = () => <Placeholder name="ARP 解析" />;
const TCPFlowControl = () => <TCPHandshake />;

// 知识模块定义
interface KnowledgeModule {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: string;
  description: string;
  topics: string[];
}

const knowledgeModules: KnowledgeModule[] = [
  {
    id: 'transmission',
    name: '数据传输全流程',
    icon: <Send className="w-5 h-5" />,
    category: '综合',
    description: '完整展示数据从发送到接收的全过程',
    topics: ['DNS解析', 'ARP解析', 'TCP握手', '数据封装', '路由转发', '协议栈']
  },
  {
    id: 'router',
    name: '路由器原理',
    icon: <Router className="w-5 h-5" />,
    category: '网络设备',
    description: '路由表、路由选择算法、数据包转发',
    topics: ['路由表', '最长前缀匹配', '静态路由', '动态路由', 'RIP', 'OSPF', 'BGP']
  },
  {
    id: 'switch',
    name: '交换机原理',
    icon: <Network className="w-5 h-5" />,
    category: '网络设备',
    description: 'MAC地址表学习、帧转发、VLAN',
    topics: ['MAC地址表', '帧转发', '广播域', 'VLAN', 'STP', '端口安全']
  },
  {
    id: 'nat',
    name: 'NAT网络地址转换',
    icon: <ArrowLeftRight className="w-5 h-5" />,
    category: '网络设备',
    description: '静态NAT、动态NAT、PAT、NAT穿透',
    topics: ['静态NAT', '动态NAT', 'PAT/NAPT', 'NAT表', 'STUN', 'TURN', 'ICE']
  },
  {
    id: 'dns',
    name: 'DNS域名系统',
    icon: <Globe className="w-5 h-5" />,
    category: '网络服务',
    description: 'DNS解析流程、记录类型、缓存机制',
    topics: ['递归查询', '迭代查询', 'DNS层级', 'A记录', 'CNAME', 'MX', 'DNS缓存']
  },
  {
    id: 'arp',
    name: 'ARP地址解析',
    icon: <Radio className="w-5 h-5" />,
    category: '网络服务',
    description: 'IP到MAC地址解析、ARP缓存、ARP攻击',
    topics: ['ARP请求', 'ARP响应', 'ARP缓存', 'ARP帧格式', 'ARP欺骗', 'ARP防御']
  },
  {
    id: 'tcp-flow',
    name: 'TCP流量控制',
    icon: <Activity className="w-5 h-5" />,
    category: '传输层',
    description: '滑动窗口、拥塞控制、可靠传输',
    topics: ['滑动窗口', '拥塞窗口', '慢启动', '拥塞避免', '快速重传', '快速恢复']
  }
];

// 分类
const categories = ['综合', '网络设备', '网络服务', '传输层'];

export default function NetworkKnowledgeCenter() {
  const [selectedModule, setSelectedModule] = useState('transmission');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 过滤模块
  const filteredModules = selectedCategory 
    ? knowledgeModules.filter(m => m.category === selectedCategory)
    : knowledgeModules;

  // 渲染选中的模块
  const renderModule = () => {
    switch (selectedModule) {
      case 'transmission':
        return <FullTransmission />;
      case 'router':
        return <RouterSimulator />;
      case 'switch':
        return <SwitchSimulator />;
      case 'nat':
        return <NATGateway />;
      case 'dns':
        return <DNSResolver />;
      case 'arp':
        return <ARPResolver />;
      case 'tcp-flow':
        return <TCPFlowControl />;
      default:
        return <FullTransmission />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
        {/* 头部 */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">网络知识可视化中心</h1>
                <p className="text-xs text-slate-400">交互式学习计算机网络核心概念</p>
              </div>
            </div>
            
            {/* 分类过滤 */}
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="text-xs"
              >
                全部
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="text-xs"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* 主体内容 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 左侧模块列表 */}
          <div className="w-72 border-r border-slate-800 overflow-y-auto p-4">
            <div className="space-y-2">
              {filteredModules.map((module) => (
                <motion.div
                  key={module.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedModule === module.id
                      ? 'bg-cyan-500/20 border border-cyan-500/50'
                      : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
                  }`}
                  onClick={() => setSelectedModule(module.id)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      selectedModule === module.id
                        ? 'bg-cyan-500/30 text-cyan-400'
                        : 'bg-slate-700/50 text-slate-400'
                    }`}>
                      {module.icon}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{module.name}</div>
                      <Badge className="bg-slate-700/50 text-slate-400 text-[10px]">
                        {module.category}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{module.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {module.topics.slice(0, 4).map((topic, i) => (
                      <Badge key={i} className="bg-slate-700/30 text-slate-500 text-[9px]">
                        {topic}
                      </Badge>
                    ))}
                    {module.topics.length > 4 && (
                      <Badge className="bg-slate-700/30 text-slate-500 text-[9px]">
                        +{module.topics.length - 4}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 右侧内容区域 */}
          <div className="flex-1 overflow-y-auto p-4">
            {renderModule()}
          </div>
        </div>
      </div>
    </div>
  );
}