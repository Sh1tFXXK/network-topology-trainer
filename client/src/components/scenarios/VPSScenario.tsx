/**
 * VPS（虚拟专用服务器）场景案例组件
 * 设计风格：赛博朋克科技风
 */

import { motion } from 'framer-motion';
import { Server, Globe, Users, HardDrive, Cpu, MemoryStick, Network, Shield, Cloud, Terminal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const vpsFeatures = [
  {
    icon: Cpu,
    title: '独立 CPU 资源',
    description: '拥有独立的 CPU 核心，不受其他用户影响'
  },
  {
    icon: MemoryStick,
    title: '独立内存',
    description: '分配固定的 RAM，保证应用稳定运行'
  },
  {
    icon: HardDrive,
    title: '独立存储',
    description: 'SSD 或 HDD 存储空间，数据安全隔离'
  },
  {
    icon: Network,
    title: '独立 IP 地址',
    description: '拥有专属的公网 IP，可自由配置'
  },
  {
    icon: Shield,
    title: 'Root 权限',
    description: '完全的管理员权限，可安装任意软件'
  },
  {
    icon: Terminal,
    title: '远程访问',
    description: '通过 SSH 远程管理服务器'
  }
];

const useCases = [
  {
    title: '网站托管',
    description: '部署个人博客、企业官网、电商网站等',
    icon: Globe,
    examples: ['WordPress 博客', 'Next.js 应用', '电商平台']
  },
  {
    title: '应用服务器',
    description: '运行后端 API、数据库、微服务等',
    icon: Server,
    examples: ['Node.js API', 'Python Flask', 'Java Spring Boot']
  },
  {
    title: '开发测试环境',
    description: '搭建开发、测试、预发布环境',
    icon: Terminal,
    examples: ['CI/CD 流水线', '自动化测试', '容器编排']
  },
  {
    title: '游戏服务器',
    description: '搭建私人游戏服务器',
    icon: Users,
    examples: ['Minecraft 服务器', 'CS:GO 服务器', '私服']
  }
];

const vpsVsShared = [
  { feature: 'CPU 资源', vps: '独立分配', shared: '共享' },
  { feature: '内存', vps: '独立分配', shared: '共享' },
  { feature: 'Root 权限', vps: '✓', shared: '✗' },
  { feature: '独立 IP', vps: '✓', shared: '通常共享' },
  { feature: '性能稳定性', vps: '高', shared: '受其他用户影响' },
  { feature: '价格', vps: '中等', shared: '低' },
  { feature: '技术要求', vps: '需要一定技术', shared: '新手友好' },
];

export default function VPSScenario() {
  return (
    <div className="space-y-8">
      {/* 标题区域 */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-cyan-400 font-mono">VPS 虚拟专用服务器</h2>
        <p className="text-muted-foreground">Virtual Private Server</p>
      </div>

      {/* 核心概念可视化 */}
      <div className="relative bg-card/50 rounded-xl border border-cyan-500/30 p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* 左侧：物理服务器示意图 */}
          <div className="relative">
            <h3 className="text-lg font-bold text-cyan-400 mb-4">物理服务器虚拟化</h3>
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-600">
              {/* 物理服务器外壳 */}
              <div className="text-center mb-4">
                <Server className="w-12 h-12 text-slate-400 mx-auto" />
                <span className="text-sm text-slate-400">物理服务器</span>
              </div>
              
              {/* VPS 实例 */}
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className={`p-3 rounded-lg border-2 ${
                      i === 2 
                        ? 'bg-cyan-500/20 border-cyan-500' 
                        : 'bg-slate-700/50 border-slate-600'
                    }`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.2 }}
                  >
                    <Cloud className={`w-6 h-6 mx-auto ${i === 2 ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <p className={`text-xs text-center mt-1 ${i === 2 ? 'text-cyan-400' : 'text-slate-500'}`}>
                      VPS {i}
                    </p>
                    {i === 2 && (
                      <p className="text-xs text-center text-cyan-300 mt-1">你的服务器</p>
                    )}
                  </motion.div>
                ))}
              </div>
              
              <p className="text-xs text-slate-400 text-center mt-4">
                一台物理服务器通过虚拟化技术分割成多个独立的 VPS
              </p>
            </div>
          </div>

          {/* 右侧：VPS 特点 */}
          <div>
            <h3 className="text-lg font-bold text-cyan-400 mb-4">VPS 核心特点</h3>
            <div className="grid grid-cols-2 gap-3">
              {vpsFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="p-3 bg-card/30 rounded-lg border border-border/50"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <feature.icon className="w-5 h-5 text-cyan-400 mb-2" />
                  <h4 className="text-sm font-bold text-foreground">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="usecases" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card/50">
          <TabsTrigger value="usecases">使用场景</TabsTrigger>
          <TabsTrigger value="compare">VPS vs 共享主机</TabsTrigger>
          <TabsTrigger value="setup">部署流程</TabsTrigger>
        </TabsList>

        <TabsContent value="usecases" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {useCases.map((useCase) => (
              <div key={useCase.title} className="p-5 bg-card/50 rounded-xl border border-border/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <useCase.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h4 className="font-bold text-foreground">{useCase.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{useCase.description}</p>
                <div className="flex flex-wrap gap-2">
                  {useCase.examples.map((example) => (
                    <span key={example} className="px-2 py-1 bg-cyan-500/10 rounded text-xs text-cyan-400">
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compare" className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-3 text-muted-foreground">特性</th>
                  <th className="text-center p-3 text-cyan-400">VPS</th>
                  <th className="text-center p-3 text-orange-400">共享主机</th>
                </tr>
              </thead>
              <tbody>
                {vpsVsShared.map((row) => (
                  <tr key={row.feature} className="border-b border-border/30">
                    <td className="p-3 text-foreground">{row.feature}</td>
                    <td className="p-3 text-center text-cyan-400">{row.vps}</td>
                    <td className="p-3 text-center text-orange-400">{row.shared}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="setup" className="space-y-4">
          <div className="space-y-4">
            {[
              { step: 1, title: '选择 VPS 提供商', desc: '阿里云、腾讯云、AWS、DigitalOcean 等' },
              { step: 2, title: '选择配置', desc: '根据需求选择 CPU、内存、存储、带宽' },
              { step: 3, title: '选择操作系统', desc: 'Ubuntu、CentOS、Debian 等 Linux 发行版' },
              { step: 4, title: '获取 SSH 密钥', desc: '创建或导入 SSH 密钥用于安全登录' },
              { step: 5, title: '远程连接', desc: '使用 ssh root@your-ip 连接服务器' },
              { step: 6, title: '配置环境', desc: '安装所需软件、配置防火墙、部署应用' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4 p-4 bg-card/50 rounded-lg border border-border/50">
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-black font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
