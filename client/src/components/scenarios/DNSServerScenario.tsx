/**
 * DNS 服务器场景案例组件
 * 设计风格：赛博朋克科技风
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Server, Database, Search, Shield, Zap, Clock, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const publicDNS = [
  {
    name: 'Google DNS',
    primary: '8.8.8.8',
    secondary: '8.8.4.4',
    features: ['全球覆盖', '速度快', 'DNSSEC 支持'],
    color: 'blue'
  },
  {
    name: 'Cloudflare DNS',
    primary: '1.1.1.1',
    secondary: '1.0.0.1',
    features: ['隐私优先', '速度最快', 'DoH/DoT 支持'],
    color: 'orange'
  },
  {
    name: '阿里 DNS',
    primary: '223.5.5.5',
    secondary: '223.6.6.6',
    features: ['国内优化', '稳定可靠', '企业级服务'],
    color: 'cyan'
  },
  {
    name: '腾讯 DNS',
    primary: '119.29.29.29',
    secondary: '182.254.116.116',
    features: ['国内优化', 'BGP 多线', '智能解析'],
    color: 'green'
  },
  {
    name: 'OpenDNS',
    primary: '208.67.222.222',
    secondary: '208.67.220.220',
    features: ['家庭安全', '内容过滤', '恶意网站拦截'],
    color: 'yellow'
  }
];

const dnsAttacks = [
  {
    name: 'DNS 劫持',
    description: '攻击者篡改 DNS 响应，将用户引导到恶意网站',
    prevention: '使用 DNSSEC、加密 DNS（DoH/DoT）',
    icon: AlertTriangle
  },
  {
    name: 'DNS 缓存投毒',
    description: '向 DNS 服务器注入虚假记录，污染缓存',
    prevention: '启用 DNSSEC 验证、使用可信 DNS 服务器',
    icon: Database
  },
  {
    name: 'DDoS 攻击',
    description: '大量请求淹没 DNS 服务器，导致服务不可用',
    prevention: '使用 Anycast、负载均衡、速率限制',
    icon: Zap
  }
];

const dnsHierarchy = [
  { level: '根域名服务器', count: '13 组', example: 'a.root-servers.net', color: 'red' },
  { level: '顶级域服务器', count: '数百个', example: '.com, .cn, .org', color: 'orange' },
  { level: '权威 DNS 服务器', count: '无数个', example: 'ns1.example.com', color: 'yellow' },
  { level: '本地 DNS 服务器', count: '每个 ISP', example: 'ISP 提供', color: 'green' },
  { level: '客户端缓存', count: '每台设备', example: '浏览器/系统缓存', color: 'cyan' }
];

export default function DNSServerScenario() {
  const [selectedDNS, setSelectedDNS] = useState(publicDNS[0]);
  const [testDomain, setTestDomain] = useState('www.example.com');
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTest = () => {
    // 模拟 DNS 查询
    setTestResult(null);
    setTimeout(() => {
      setTestResult('93.184.216.34');
    }, 500);
  };

  return (
    <div className="space-y-8">
      {/* 标题区域 */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-cyan-400 font-mono">DNS 服务器详解</h2>
        <p className="text-muted-foreground">域名系统的核心基础设施</p>
      </div>

      {/* DNS 层级结构 */}
      <div className="bg-card/50 rounded-xl border border-cyan-500/30 p-6">
        <h3 className="text-lg font-bold text-cyan-400 mb-4">DNS 层级结构</h3>
        <div className="space-y-3">
          {dnsHierarchy.map((item, index) => (
            <motion.div
              key={item.level}
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`w-4 h-4 rounded-full bg-${item.color}-500`} 
                   style={{ backgroundColor: 
                     item.color === 'red' ? '#ef4444' :
                     item.color === 'orange' ? '#f97316' :
                     item.color === 'yellow' ? '#eab308' :
                     item.color === 'green' ? '#22c55e' : '#06b6d4'
                   }} 
              />
              <div className="flex-1 flex items-center justify-between p-3 bg-card/30 rounded-lg border border-border/50">
                <div>
                  <span className="font-bold text-foreground">{item.level}</span>
                  <span className="text-muted-foreground text-sm ml-2">({item.count})</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">{item.example}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Tabs defaultValue="public" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card/50">
          <TabsTrigger value="public">公共 DNS</TabsTrigger>
          <TabsTrigger value="security">DNS 安全</TabsTrigger>
          <TabsTrigger value="config">配置指南</TabsTrigger>
        </TabsList>

        <TabsContent value="public" className="space-y-6">
          {/* DNS 选择器 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicDNS.map((dns) => (
              <motion.div
                key={dns.name}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedDNS.name === dns.name
                    ? 'bg-cyan-500/20 border-cyan-500'
                    : 'bg-card/50 border-border/50 hover:border-cyan-500/50'
                }`}
                onClick={() => setSelectedDNS(dns)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h4 className="font-bold text-foreground mb-2">{dns.name}</h4>
                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">主 DNS:</span>
                    <span className="text-sm font-mono text-cyan-400">{dns.primary}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">备 DNS:</span>
                    <span className="text-sm font-mono text-cyan-400">{dns.secondary}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {dns.features.map((feature) => (
                    <span key={feature} className="px-2 py-0.5 bg-cyan-500/10 rounded text-xs text-cyan-400">
                      {feature}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* DNS 测试工具 */}
          <div className="bg-card/50 rounded-xl border border-border/50 p-6">
            <h4 className="font-bold text-foreground mb-4">DNS 查询模拟</h4>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm text-muted-foreground mb-1 block">域名</label>
                <input
                  type="text"
                  value={testDomain}
                  onChange={(e) => setTestDomain(e.target.value)}
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg font-mono text-sm"
                  placeholder="输入域名..."
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">DNS 服务器</label>
                <div className="px-3 py-2 bg-card border border-cyan-500/50 rounded-lg font-mono text-sm text-cyan-400">
                  {selectedDNS.primary}
                </div>
              </div>
              <Button onClick={handleTest} className="bg-cyan-500/20 border border-cyan-500 text-cyan-400">
                <Search className="w-4 h-4 mr-2" />
                查询
              </Button>
            </div>
            {testResult && (
              <motion.div
                className="mt-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">解析结果:</span>
                  <span className="font-mono text-green-400">{testDomain} → {testResult}</span>
                </div>
              </motion.div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* DNS 安全威胁 */}
          <div className="space-y-4">
            <h4 className="font-bold text-foreground">常见 DNS 安全威胁</h4>
            {dnsAttacks.map((attack) => (
              <div key={attack.name} className="p-4 bg-red-500/10 rounded-xl border border-red-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <attack.icon className="w-5 h-5 text-red-400" />
                  <h5 className="font-bold text-red-400">{attack.name}</h5>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{attack.description}</p>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">防护措施: {attack.prevention}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 加密 DNS */}
          <div className="bg-card/50 rounded-xl border border-green-500/30 p-6">
            <h4 className="font-bold text-green-400 mb-4">加密 DNS 协议</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-500/10 rounded-lg">
                <h5 className="font-bold text-foreground mb-2">DNS over HTTPS (DoH)</h5>
                <p className="text-sm text-muted-foreground mb-2">
                  通过 HTTPS 加密 DNS 查询，使用 443 端口，难以被识别和阻断
                </p>
                <span className="text-xs font-mono text-green-400">https://dns.google/dns-query</span>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg">
                <h5 className="font-bold text-foreground mb-2">DNS over TLS (DoT)</h5>
                <p className="text-sm text-muted-foreground mb-2">
                  通过 TLS 加密 DNS 查询，使用专用 853 端口
                </p>
                <span className="text-xs font-mono text-green-400">tls://dns.google:853</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          {/* 配置指南 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Windows */}
            <div className="bg-card/50 rounded-xl border border-border/50 p-5">
              <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                Windows 配置
              </h4>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. 打开 <span className="text-cyan-400">控制面板</span> → 网络和共享中心</li>
                <li>2. 点击当前连接 → <span className="text-cyan-400">属性</span></li>
                <li>3. 选择 <span className="text-cyan-400">Internet 协议版本 4 (TCP/IPv4)</span></li>
                <li>4. 选择"使用下面的 DNS 服务器地址"</li>
                <li>5. 输入首选和备用 DNS 服务器地址</li>
              </ol>
            </div>

            {/* macOS */}
            <div className="bg-card/50 rounded-xl border border-border/50 p-5">
              <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-slate-400" />
                macOS 配置
              </h4>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. 打开 <span className="text-cyan-400">系统偏好设置</span> → 网络</li>
                <li>2. 选择当前网络连接 → <span className="text-cyan-400">高级</span></li>
                <li>3. 切换到 <span className="text-cyan-400">DNS</span> 标签页</li>
                <li>4. 点击 + 添加 DNS 服务器地址</li>
                <li>5. 点击"好"保存设置</li>
              </ol>
            </div>

            {/* Linux */}
            <div className="bg-card/50 rounded-xl border border-border/50 p-5">
              <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Server className="w-5 h-5 text-orange-400" />
                Linux 配置
              </h4>
              <div className="bg-black/30 rounded-lg p-3 font-mono text-xs">
                <p className="text-green-400"># 编辑 resolv.conf</p>
                <p className="text-cyan-400">sudo nano /etc/resolv.conf</p>
                <p className="text-muted-foreground mt-2"># 添加以下内容</p>
                <p className="text-yellow-400">nameserver 8.8.8.8</p>
                <p className="text-yellow-400">nameserver 8.8.4.4</p>
              </div>
            </div>

            {/* 路由器 */}
            <div className="bg-card/50 rounded-xl border border-border/50 p-5">
              <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-green-400" />
                路由器配置
              </h4>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. 登录路由器管理界面（通常 192.168.1.1）</li>
                <li>2. 找到 <span className="text-cyan-400">DHCP 设置</span> 或 <span className="text-cyan-400">网络设置</span></li>
                <li>3. 修改 DNS 服务器地址</li>
                <li>4. 保存并重启路由器</li>
                <li className="text-green-400">✓ 全网设备自动生效</li>
              </ol>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
