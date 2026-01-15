/**
 * 场景案例页面
 * 设计风格：赛博朋克科技风
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Server, Shield, Globe } from 'lucide-react';
import { Link } from 'wouter';
import Header from '@/components/layout/Header';
import VPSScenario from '@/components/scenarios/VPSScenario';
import VPNScenario from '@/components/scenarios/VPNScenario';
import DNSServerScenario from '@/components/scenarios/DNSServerScenario';

type ScenarioType = 'vps' | 'vpn' | 'dns' | null;

const scenarios = [
  {
    id: 'vps',
    name: 'VPS 虚拟专用服务器',
    description: '了解 VPS 的工作原理和使用场景',
    icon: Server,
    color: 'cyan'
  },
  {
    id: 'vpn',
    name: 'VPN 虚拟专用网络',
    description: '了解 VPN 的加密原理和应用场景',
    icon: Shield,
    color: 'green'
  },
  {
    id: 'dns',
    name: 'DNS 服务器',
    description: '深入了解 DNS 服务器的配置和安全',
    icon: Globe,
    color: 'yellow'
  }
];

export default function Scenarios() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>(null);

  const renderScenarioContent = () => {
    switch (selectedScenario) {
      case 'vps':
        return <VPSScenario />;
      case 'vpn':
        return <VPNScenario />;
      case 'dns':
        return <DNSServerScenario />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* 返回按钮 */}
        <Link href="/learn">
          <a className="inline-flex items-center gap-2 text-muted-foreground hover:text-cyan-400 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            返回知识库
          </a>
        </Link>

        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">实际应用场景</h1>
          <p className="text-muted-foreground">了解网络技术在真实世界中的应用</p>
        </div>

        {/* 场景选择器 */}
        {!selectedScenario ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {scenarios.map((scenario, index) => (
              <motion.div
                key={scenario.id}
                className="p-6 bg-card/50 rounded-xl border border-border/50 cursor-pointer hover:border-cyan-500/50 transition-all group"
                onClick={() => setSelectedScenario(scenario.id as ScenarioType)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 transition-all ${
                  scenario.color === 'cyan' ? 'bg-cyan-500/20 group-hover:bg-cyan-500/30' :
                  scenario.color === 'green' ? 'bg-green-500/20 group-hover:bg-green-500/30' :
                  'bg-yellow-500/20 group-hover:bg-yellow-500/30'
                }`}>
                  <scenario.icon className={`w-8 h-8 ${
                    scenario.color === 'cyan' ? 'text-cyan-400' :
                    scenario.color === 'green' ? 'text-green-400' :
                    'text-yellow-400'
                  }`} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{scenario.name}</h3>
                <p className="text-muted-foreground text-sm">{scenario.description}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {/* 返回场景列表 */}
            <button
              onClick={() => setSelectedScenario(null)}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-cyan-400 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              返回场景列表
            </button>

            {/* 场景内容 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {renderScenarioContent()}
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
