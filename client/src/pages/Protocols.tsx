/**
 * 协议详情页面
 * 设计风格：赛博朋克科技风
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Network, Globe, Shield, Server } from 'lucide-react';
import { Link } from 'wouter';
import Header from '@/components/layout/Header';
import TCPHandshake from '@/components/protocols/TCPHandshake';
import HTTPFlow from '@/components/protocols/HTTPFlow';
import DNSResolver from '@/components/protocols/DNSResolver';

type ProtocolType = 'tcp' | 'http' | 'dns' | null;

const protocols = [
  {
    id: 'tcp',
    name: 'TCP 三次握手',
    description: '传输控制协议的连接建立过程',
    icon: Network,
    color: 'cyan'
  },
  {
    id: 'http',
    name: 'HTTP/HTTPS',
    description: '超文本传输协议的请求响应流程',
    icon: Globe,
    color: 'green'
  },
  {
    id: 'dns',
    name: 'DNS 解析',
    description: '域名系统的解析流程',
    icon: Server,
    color: 'yellow'
  }
];

export default function Protocols() {
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolType>(null);

  const renderProtocolContent = () => {
    switch (selectedProtocol) {
      case 'tcp':
        return <TCPHandshake />;
      case 'http':
        return <HTTPFlow />;
      case 'dns':
        return <DNSResolver />;
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
          <h1 className="text-3xl font-bold text-foreground mb-2">协议工作原理</h1>
          <p className="text-muted-foreground">深入理解网络协议的运作机制</p>
        </div>

        {/* 协议选择器 */}
        {!selectedProtocol ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {protocols.map((protocol, index) => (
              <motion.div
                key={protocol.id}
                className="p-6 bg-card/50 rounded-xl border border-border/50 cursor-pointer hover:border-cyan-500/50 transition-all group"
                onClick={() => setSelectedProtocol(protocol.id as ProtocolType)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 transition-all ${
                  protocol.color === 'cyan' ? 'bg-cyan-500/20 group-hover:bg-cyan-500/30' :
                  protocol.color === 'green' ? 'bg-green-500/20 group-hover:bg-green-500/30' :
                  'bg-yellow-500/20 group-hover:bg-yellow-500/30'
                }`}>
                  <protocol.icon className={`w-8 h-8 ${
                    protocol.color === 'cyan' ? 'text-cyan-400' :
                    protocol.color === 'green' ? 'text-green-400' :
                    'text-yellow-400'
                  }`} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{protocol.name}</h3>
                <p className="text-muted-foreground text-sm">{protocol.description}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {/* 返回协议列表 */}
            <button
              onClick={() => setSelectedProtocol(null)}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-cyan-400 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              返回协议列表
            </button>

            {/* 协议内容 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {renderProtocolContent()}
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
