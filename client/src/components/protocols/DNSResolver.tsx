/**
 * DNS 解析流程可视化组件
 * 设计风格：赛博朋克科技风
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Server, Database, HardDrive, ArrowRight, Play, RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DNSStep {
  id: number;
  from: string;
  to: string;
  query: string;
  response?: string;
  description: string;
}

const dnsSteps: DNSStep[] = [
  {
    id: 1,
    from: '浏览器',
    to: '本地 DNS 缓存',
    query: 'www.example.com',
    description: '浏览器首先检查本地 DNS 缓存是否有该域名的记录'
  },
  {
    id: 2,
    from: '操作系统',
    to: '本地 DNS 服务器',
    query: 'www.example.com',
    description: '如果本地缓存没有，向本地 DNS 服务器（通常是 ISP 提供）发起查询'
  },
  {
    id: 3,
    from: '本地 DNS',
    to: '根域名服务器',
    query: '.com 在哪里？',
    response: '去问 .com 顶级域服务器',
    description: '本地 DNS 向根域名服务器查询，获取 .com 顶级域服务器地址'
  },
  {
    id: 4,
    from: '本地 DNS',
    to: '.com 顶级域服务器',
    query: 'example.com 在哪里？',
    response: '去问 example.com 权威服务器',
    description: '向 .com 顶级域服务器查询，获取 example.com 的权威 DNS 服务器地址'
  },
  {
    id: 5,
    from: '本地 DNS',
    to: '权威 DNS 服务器',
    query: 'www.example.com 的 IP？',
    response: '93.184.216.34',
    description: '向权威 DNS 服务器查询，获取最终的 IP 地址'
  },
  {
    id: 6,
    from: '本地 DNS',
    to: '浏览器',
    query: '',
    response: '93.184.216.34',
    description: '本地 DNS 将结果返回给浏览器，并缓存该记录'
  }
];

const dnsServers = [
  { name: '浏览器', icon: Globe, color: 'cyan', position: { x: 10, y: 50 } },
  { name: '本地 DNS', icon: Server, color: 'yellow', position: { x: 30, y: 50 } },
  { name: '根服务器', icon: Database, color: 'red', position: { x: 50, y: 20 } },
  { name: '.com 服务器', icon: Database, color: 'orange', position: { x: 70, y: 20 } },
  { name: '权威服务器', icon: HardDrive, color: 'green', position: { x: 90, y: 50 } },
];

const recordTypes = [
  { type: 'A', description: '将域名映射到 IPv4 地址', example: 'example.com → 93.184.216.34' },
  { type: 'AAAA', description: '将域名映射到 IPv6 地址', example: 'example.com → 2606:2800:220:1:...' },
  { type: 'CNAME', description: '域名别名记录', example: 'www.example.com → example.com' },
  { type: 'MX', description: '邮件交换记录', example: 'example.com → mail.example.com' },
  { type: 'NS', description: '域名服务器记录', example: 'example.com → ns1.example.com' },
  { type: 'TXT', description: '文本记录，用于验证等', example: 'SPF, DKIM 验证' },
];

export default function DNSResolver() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [domain, setDomain] = useState('www.example.com');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentStep < dnsSteps.length) {
      timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1500);
    } else if (currentStep >= dnsSteps.length) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep]);

  const handlePlay = () => {
    setCurrentStep(0);
    setIsPlaying(true);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  return (
    <div className="space-y-6">
      {/* 标题区域 */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-cyan-400 font-mono">DNS 域名解析</h2>
        <p className="text-muted-foreground">Domain Name System</p>
      </div>

      {/* 域名输入 */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2 px-4 py-2 bg-card/50 rounded-lg border border-cyan-500/30">
          <Search className="w-4 h-4 text-cyan-400" />
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="bg-transparent border-none outline-none text-cyan-400 font-mono w-64"
            placeholder="输入域名..."
          />
        </div>
      </div>

      {/* 可视化区域 */}
      <div className="relative bg-card/50 rounded-xl border border-cyan-500/30 p-8 min-h-[400px]">
        {/* 背景网格 */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }} />
        </div>

        {/* DNS 服务器节点 */}
        <div className="relative h-64">
          {/* 浏览器 */}
          <div className="absolute left-[5%] top-1/2 transform -translate-y-1/2 flex flex-col items-center">
            <motion.div 
              className="w-16 h-16 bg-cyan-500/20 rounded-xl border-2 border-cyan-500 flex items-center justify-center"
              animate={{ boxShadow: currentStep >= 1 ? '0 0 20px rgba(0,255,255,0.5)' : 'none' }}
            >
              <Globe className="w-8 h-8 text-cyan-400" />
            </motion.div>
            <span className="text-xs text-cyan-400 mt-2 font-mono">浏览器</span>
          </div>

          {/* 本地 DNS */}
          <div className="absolute left-[25%] top-1/2 transform -translate-y-1/2 flex flex-col items-center">
            <motion.div 
              className="w-16 h-16 bg-yellow-500/20 rounded-xl border-2 border-yellow-500 flex items-center justify-center"
              animate={{ boxShadow: currentStep >= 2 ? '0 0 20px rgba(255,255,0,0.5)' : 'none' }}
            >
              <Server className="w-8 h-8 text-yellow-400" />
            </motion.div>
            <span className="text-xs text-yellow-400 mt-2 font-mono">本地 DNS</span>
          </div>

          {/* 根服务器 */}
          <div className="absolute left-[45%] top-[15%] flex flex-col items-center">
            <motion.div 
              className="w-16 h-16 bg-red-500/20 rounded-xl border-2 border-red-500 flex items-center justify-center"
              animate={{ boxShadow: currentStep >= 3 ? '0 0 20px rgba(255,0,0,0.5)' : 'none' }}
            >
              <Database className="w-8 h-8 text-red-400" />
            </motion.div>
            <span className="text-xs text-red-400 mt-2 font-mono">根服务器</span>
          </div>

          {/* .com 服务器 */}
          <div className="absolute left-[65%] top-[15%] flex flex-col items-center">
            <motion.div 
              className="w-16 h-16 bg-orange-500/20 rounded-xl border-2 border-orange-500 flex items-center justify-center"
              animate={{ boxShadow: currentStep >= 4 ? '0 0 20px rgba(255,165,0,0.5)' : 'none' }}
            >
              <Database className="w-8 h-8 text-orange-400" />
            </motion.div>
            <span className="text-xs text-orange-400 mt-2 font-mono">.com 服务器</span>
          </div>

          {/* 权威服务器 */}
          <div className="absolute right-[5%] top-1/2 transform -translate-y-1/2 flex flex-col items-center">
            <motion.div 
              className="w-16 h-16 bg-green-500/20 rounded-xl border-2 border-green-500 flex items-center justify-center"
              animate={{ boxShadow: currentStep >= 5 ? '0 0 20px rgba(0,255,0,0.5)' : 'none' }}
            >
              <HardDrive className="w-8 h-8 text-green-400" />
            </motion.div>
            <span className="text-xs text-green-400 mt-2 font-mono">权威服务器</span>
          </div>

          {/* 连接线 */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="rgba(0,255,255,0.5)" />
              </marker>
            </defs>
            {/* 浏览器 -> 本地 DNS */}
            <line x1="15%" y1="50%" x2="22%" y2="50%" stroke="rgba(0,255,255,0.3)" strokeWidth="2" strokeDasharray="5,5" />
            {/* 本地 DNS -> 根服务器 */}
            <line x1="35%" y1="45%" x2="43%" y2="25%" stroke="rgba(255,255,0,0.3)" strokeWidth="2" strokeDasharray="5,5" />
            {/* 根服务器 -> .com 服务器 */}
            <line x1="55%" y1="20%" x2="62%" y2="20%" stroke="rgba(255,0,0,0.3)" strokeWidth="2" strokeDasharray="5,5" />
            {/* .com 服务器 -> 权威服务器 */}
            <line x1="75%" y1="25%" x2="85%" y2="45%" stroke="rgba(255,165,0,0.3)" strokeWidth="2" strokeDasharray="5,5" />
          </svg>

          {/* 当前步骤提示 */}
          <AnimatePresence>
            {currentStep > 0 && currentStep <= dnsSteps.length && (
              <motion.div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="px-4 py-2 bg-cyan-500/20 border border-cyan-500 rounded-lg">
                  <p className="text-sm text-cyan-400 font-mono">
                    {dnsSteps[currentStep - 1]?.description}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 最终结果 */}
          <AnimatePresence>
            {currentStep >= dnsSteps.length && (
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="px-6 py-3 bg-green-500/20 border border-green-500 rounded-xl">
                  <p className="text-lg font-mono text-green-400">
                    {domain} → <span className="font-bold">93.184.216.34</span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 控制按钮 */}
        <div className="flex justify-center gap-4 mt-8">
          <Button
            onClick={handlePlay}
            disabled={isPlaying}
            className="bg-cyan-500/20 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/30"
          >
            <Play className="w-4 h-4 mr-2" />
            开始解析
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="border-muted-foreground/30"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            重置
          </Button>
        </div>
      </div>

      {/* 解析步骤详情 */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-cyan-400">DNS 解析步骤</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {dnsSteps.map((step, index) => (
            <motion.div
              key={step.id}
              className={`p-3 rounded-lg border transition-all ${
                currentStep > index
                  ? 'bg-cyan-500/10 border-cyan-500/50'
                  : 'bg-card/30 border-border/50 opacity-50'
              }`}
              animate={{ scale: currentStep === index + 1 ? 1.02 : 1 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep > index ? 'bg-cyan-500 text-black' : 'bg-muted text-muted-foreground'
                }`}>
                  {step.id}
                </span>
                <span className="text-sm font-medium text-foreground">{step.from} → {step.to}</span>
              </div>
              <p className="text-xs text-muted-foreground">{step.description}</p>
              {step.response && currentStep > index && (
                <div className="mt-2 px-2 py-1 bg-green-500/10 rounded text-xs font-mono text-green-400">
                  响应: {step.response}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* DNS 记录类型 */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-cyan-400">常见 DNS 记录类型</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {recordTypes.map((record) => (
            <div key={record.type} className="p-4 bg-card/50 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-cyan-500/20 rounded font-mono font-bold text-cyan-400">
                  {record.type}
                </span>
              </div>
              <p className="text-sm text-foreground mb-1">{record.description}</p>
              <p className="text-xs text-muted-foreground font-mono">{record.example}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
