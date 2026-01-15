/**
 * VPN（虚拟专用网络）场景案例组件
 * 设计风格：赛博朋克科技风
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Globe, Server, Lock, Unlock, Eye, EyeOff, Wifi, Building, Home, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const vpnProtocols = [
  {
    name: 'OpenVPN',
    security: '高',
    speed: '中等',
    description: '开源协议，安全性高，配置灵活',
    port: 'UDP 1194 / TCP 443'
  },
  {
    name: 'WireGuard',
    security: '高',
    speed: '快',
    description: '新一代协议，代码精简，性能优秀',
    port: 'UDP 51820'
  },
  {
    name: 'IKEv2/IPSec',
    security: '高',
    speed: '快',
    description: '移动设备友好，自动重连',
    port: 'UDP 500/4500'
  },
  {
    name: 'L2TP/IPSec',
    security: '中',
    speed: '中等',
    description: '兼容性好，但可能被防火墙阻断',
    port: 'UDP 1701/500/4500'
  },
  {
    name: 'PPTP',
    security: '低',
    speed: '快',
    description: '已过时，不推荐使用',
    port: 'TCP 1723'
  }
];

const useCases = [
  {
    icon: Building,
    title: '企业远程办公',
    description: '员工在家或出差时安全访问公司内网资源',
    scenario: '员工通过 VPN 连接到公司网络，访问内部系统、文件服务器和数据库'
  },
  {
    icon: Shield,
    title: '公共 WiFi 安全',
    description: '在咖啡厅、机场等公共场所保护网络通信',
    scenario: '加密所有流量，防止中间人攻击和数据窃取'
  },
  {
    icon: Globe,
    title: '跨区域网络互联',
    description: '连接不同地区的分支机构网络',
    scenario: '通过 Site-to-Site VPN 将多个办公地点连接成一个虚拟局域网'
  },
  {
    icon: Lock,
    title: '隐私保护',
    description: '隐藏真实 IP 地址，保护上网隐私',
    scenario: '所有流量通过 VPN 服务器中转，ISP 无法监控具体访问内容'
  }
];

export default function VPNScenario() {
  const [isConnected, setIsConnected] = useState(false);
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAnimating && step < 4) {
      timer = setTimeout(() => {
        setStep(prev => prev + 1);
        if (step === 2) {
          setIsConnected(true);
        }
      }, 1000);
    } else if (step >= 4) {
      setIsAnimating(false);
    }
    return () => clearTimeout(timer);
  }, [isAnimating, step]);

  const handleConnect = () => {
    setStep(0);
    setIsConnected(false);
    setIsAnimating(true);
  };

  const handleReset = () => {
    setStep(0);
    setIsConnected(false);
    setIsAnimating(false);
  };

  return (
    <div className="space-y-8">
      {/* 标题区域 */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-cyan-400 font-mono">VPN 虚拟专用网络</h2>
        <p className="text-muted-foreground">Virtual Private Network</p>
      </div>

      {/* VPN 工作原理可视化 */}
      <div className="relative bg-card/50 rounded-xl border border-cyan-500/30 p-8">
        <h3 className="text-lg font-bold text-cyan-400 mb-6 text-center">VPN 工作原理</h3>
        
        <div className="relative flex justify-between items-center min-h-[200px]">
          {/* 用户设备 */}
          <div className="flex flex-col items-center z-10">
            <motion.div 
              className={`w-20 h-20 rounded-xl border-2 flex items-center justify-center ${
                isConnected 
                  ? 'bg-green-500/20 border-green-500' 
                  : 'bg-cyan-500/20 border-cyan-500'
              }`}
              animate={{ boxShadow: isConnected ? '0 0 30px rgba(0,255,0,0.5)' : '0 0 10px rgba(0,255,255,0.3)' }}
            >
              <Home className={`w-10 h-10 ${isConnected ? 'text-green-400' : 'text-cyan-400'}`} />
            </motion.div>
            <span className="text-sm text-foreground mt-2">你的设备</span>
            <span className="text-xs text-muted-foreground">192.168.1.100</span>
          </div>

          {/* 中间连接区域 */}
          <div className="flex-1 relative mx-4">
            {/* 未加密区域 */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1/3">
              <div className={`h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500/30'}`} />
              <div className="flex items-center justify-center mt-2">
                {isConnected ? (
                  <Lock className="w-4 h-4 text-green-400" />
                ) : (
                  <Unlock className="w-4 h-4 text-red-400" />
                )}
                <span className={`text-xs ml-1 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {isConnected ? '已加密' : '未加密'}
                </span>
              </div>
            </div>

            {/* VPN 隧道 */}
            <AnimatePresence>
              {step >= 2 && (
                <motion.div
                  className="absolute left-1/3 right-1/3 top-1/2 transform -translate-y-1/2"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="h-8 bg-gradient-to-r from-green-500/30 via-green-500/50 to-green-500/30 rounded-full border-2 border-green-500 border-dashed flex items-center justify-center">
                    <span className="text-xs text-green-400 font-mono">VPN 加密隧道</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 数据包动画 */}
            <AnimatePresence>
              {step >= 3 && (
                <motion.div
                  className="absolute top-1/2 transform -translate-y-1/2"
                  initial={{ left: '10%', opacity: 0 }}
                  animate={{ left: '80%', opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-4 h-4 bg-green-500 rounded-full shadow-lg shadow-green-500/50" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* 右侧连接 */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1/3">
              <div className={`h-2 rounded-full ${step >= 3 ? 'bg-green-500' : 'bg-slate-500/30'}`} />
            </div>
          </div>

          {/* VPN 服务器 */}
          <div className="flex flex-col items-center z-10">
            <motion.div 
              className={`w-20 h-20 rounded-xl border-2 flex items-center justify-center ${
                step >= 2 
                  ? 'bg-green-500/20 border-green-500' 
                  : 'bg-slate-500/20 border-slate-500'
              }`}
              animate={{ boxShadow: step >= 2 ? '0 0 30px rgba(0,255,0,0.5)' : 'none' }}
            >
              <Shield className={`w-10 h-10 ${step >= 2 ? 'text-green-400' : 'text-slate-400'}`} />
            </motion.div>
            <span className="text-sm text-foreground mt-2">VPN 服务器</span>
            <span className="text-xs text-muted-foreground">45.67.89.123</span>
          </div>

          {/* 互联网 */}
          <div className="flex flex-col items-center z-10 ml-4">
            <motion.div 
              className={`w-20 h-20 rounded-xl border-2 flex items-center justify-center ${
                step >= 3 
                  ? 'bg-blue-500/20 border-blue-500' 
                  : 'bg-slate-500/20 border-slate-500'
              }`}
            >
              <Globe className={`w-10 h-10 ${step >= 3 ? 'text-blue-400' : 'text-slate-400'}`} />
            </motion.div>
            <span className="text-sm text-foreground mt-2">互联网</span>
            <span className="text-xs text-muted-foreground">目标网站</span>
          </div>
        </div>

        {/* 状态提示 */}
        <div className="mt-6 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                isConnected 
                  ? 'bg-green-500/20 border border-green-500 text-green-400' 
                  : 'bg-slate-500/20 border border-slate-500 text-slate-400'
              }`}
            >
              {step === 0 && <><Wifi className="w-4 h-4" /> 未连接 VPN</>}
              {step === 1 && <><Lock className="w-4 h-4 animate-pulse" /> 正在建立加密连接...</>}
              {step === 2 && <><Shield className="w-4 h-4" /> VPN 隧道已建立</>}
              {step >= 3 && <><Eye className="w-4 h-4" /> 安全连接中 - 流量已加密</>}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 控制按钮 */}
        <div className="flex justify-center gap-4 mt-6">
          <Button
            onClick={handleConnect}
            disabled={isAnimating}
            className="bg-green-500/20 border border-green-500 text-green-400 hover:bg-green-500/30"
          >
            <Play className="w-4 h-4 mr-2" />
            {isConnected ? '重新连接' : '连接 VPN'}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="border-muted-foreground/30"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            断开连接
          </Button>
        </div>
      </div>

      {/* 对比：有无 VPN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-red-500/10 rounded-xl border border-red-500/30">
          <div className="flex items-center gap-3 mb-4">
            <EyeOff className="w-6 h-6 text-red-400" />
            <h4 className="font-bold text-red-400">无 VPN</h4>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              ISP 可以看到你访问的所有网站
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              公共 WiFi 上数据可能被窃取
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              真实 IP 地址暴露
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              无法访问公司内网
            </li>
          </ul>
        </div>

        <div className="p-5 bg-green-500/10 rounded-xl border border-green-500/30">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-6 h-6 text-green-400" />
            <h4 className="font-bold text-green-400">使用 VPN</h4>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              所有流量加密，ISP 只能看到 VPN 连接
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              公共 WiFi 安全使用
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              使用 VPN 服务器的 IP 地址
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              可以安全访问公司内网
            </li>
          </ul>
        </div>
      </div>

      <Tabs defaultValue="usecases" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card/50">
          <TabsTrigger value="usecases">使用场景</TabsTrigger>
          <TabsTrigger value="protocols">VPN 协议</TabsTrigger>
        </TabsList>

        <TabsContent value="usecases" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {useCases.map((useCase) => (
              <div key={useCase.title} className="p-5 bg-card/50 rounded-xl border border-border/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <useCase.icon className="w-5 h-5 text-green-400" />
                  </div>
                  <h4 className="font-bold text-foreground">{useCase.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{useCase.description}</p>
                <p className="text-xs text-green-400/80 bg-green-500/10 rounded p-2">
                  {useCase.scenario}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="protocols" className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-3 text-muted-foreground">协议</th>
                  <th className="text-center p-3 text-muted-foreground">安全性</th>
                  <th className="text-center p-3 text-muted-foreground">速度</th>
                  <th className="text-left p-3 text-muted-foreground">端口</th>
                  <th className="text-left p-3 text-muted-foreground">说明</th>
                </tr>
              </thead>
              <tbody>
                {vpnProtocols.map((protocol) => (
                  <tr key={protocol.name} className="border-b border-border/30">
                    <td className="p-3 font-mono text-cyan-400">{protocol.name}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        protocol.security === '高' ? 'bg-green-500/20 text-green-400' :
                        protocol.security === '中' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {protocol.security}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        protocol.speed === '快' ? 'bg-green-500/20 text-green-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {protocol.speed}
                      </span>
                    </td>
                    <td className="p-3 text-xs font-mono text-muted-foreground">{protocol.port}</td>
                    <td className="p-3 text-sm text-muted-foreground">{protocol.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
