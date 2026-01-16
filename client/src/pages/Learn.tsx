/**
 * Learn - 知识库页面
 * 
 * Design: Cyberpunk Tech Theme
 * - 网络基础知识展示
 * - OSI 模型详解
 * - 设备类型说明
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/Header';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Layers, 
  Router, 
  Network, 
  Monitor, 
  Server,
  ArrowRight,
  Zap
} from 'lucide-react';
import FullTransmission from '../../../协议如何体现在数据传输中/FullTransmission';
import RouterSimulator from '../../../协议如何体现在数据传输中/RouterSimulator';
import NATGateway from '../../../协议如何体现在数据传输中/NATGateway';
import TCPFlowControl from '../../../协议如何体现在数据传输中/TCPFlowControl';
import DataTransmissionVisualizer from '../../../协议如何体现在数据传输中/DataTransmissionVisualizer';

// OSI 模型层级数据
const osiLayers = [
  {
    number: 7,
    name: '应用层',
    nameEn: 'Application',
    color: 'from-purple-500 to-purple-600',
    textColor: 'text-purple-400',
    protocols: ['HTTP', 'HTTPS', 'FTP', 'SMTP', 'DNS', 'SSH', 'Telnet'],
    description: '为应用程序提供网络服务的接口。用户直接与这一层交互，如浏览网页、发送邮件等。',
    pdu: '数据 (Data)',
    devices: ['应用程序', '网关'],
  },
  {
    number: 6,
    name: '表示层',
    nameEn: 'Presentation',
    color: 'from-pink-500 to-pink-600',
    textColor: 'text-pink-400',
    protocols: ['SSL/TLS', 'JPEG', 'MPEG', 'ASCII', 'EBCDIC'],
    description: '负责数据的格式转换、加密解密、压缩解压缩。确保一个系统的应用层发送的信息能被另一个系统的应用层读取。',
    pdu: '数据 (Data)',
    devices: ['加密设备'],
  },
  {
    number: 5,
    name: '会话层',
    nameEn: 'Session',
    color: 'from-rose-500 to-rose-600',
    textColor: 'text-rose-400',
    protocols: ['NetBIOS', 'RPC', 'PPTP'],
    description: '建立、管理和终止会话。负责在数据传输中设置检查点，以便在通信失败时可以从检查点恢复。',
    pdu: '数据 (Data)',
    devices: ['会话管理器'],
  },
  {
    number: 4,
    name: '传输层',
    nameEn: 'Transport',
    color: 'from-orange-500 to-orange-600',
    textColor: 'text-orange-400',
    protocols: ['TCP', 'UDP', 'SCTP'],
    description: '提供端到端的可靠或不可靠的数据传输服务。TCP 提供可靠传输，UDP 提供快速但不可靠的传输。',
    pdu: '段 (Segment) / 数据报 (Datagram)',
    devices: ['防火墙', '负载均衡器'],
  },
  {
    number: 3,
    name: '网络层',
    nameEn: 'Network',
    color: 'from-amber-500 to-amber-600',
    textColor: 'text-amber-400',
    protocols: ['IP', 'ICMP', 'ARP', 'RARP', 'OSPF', 'BGP'],
    description: '负责将数据包从源主机路由到目标主机。处理逻辑地址（IP 地址）和路由选择。',
    pdu: '包 (Packet)',
    devices: ['路由器', '三层交换机'],
  },
  {
    number: 2,
    name: '数据链路层',
    nameEn: 'Data Link',
    color: 'from-emerald-500 to-emerald-600',
    textColor: 'text-emerald-400',
    protocols: ['Ethernet', 'PPP', 'HDLC', 'Frame Relay', 'ATM'],
    description: '在相邻节点之间提供可靠的数据传输。处理物理地址（MAC 地址）、帧同步、流量控制和错误检测。',
    pdu: '帧 (Frame)',
    devices: ['交换机', '网桥', '网卡'],
  },
  {
    number: 1,
    name: '物理层',
    nameEn: 'Physical',
    color: 'from-cyan-500 to-cyan-600',
    textColor: 'text-cyan-400',
    protocols: ['RS-232', 'RJ-45', '光纤', '无线电波'],
    description: '负责在物理媒介上传输原始比特流。定义电气特性、机械特性、功能特性和规程特性。',
    pdu: '比特 (Bit)',
    devices: ['集线器', '中继器', '网线', '光纤'],
  },
];

// 设备类型数据
const deviceTypes = [
  {
    type: 'router',
    name: '路由器',
    icon: Router,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-950/50',
    borderColor: 'border-cyan-500/30',
    layer: 3,
    description: '路由器是一种网络层设备，用于连接不同的网络并在它们之间转发数据包。它根据目标 IP 地址和路由表来决定数据包的最佳路径。',
    functions: [
      '连接不同网络（如 LAN 和 WAN）',
      '根据 IP 地址进行路由决策',
      '维护路由表',
      '执行 NAT（网络地址转换）',
      '提供防火墙功能',
    ],
    example: '家用路由器连接家庭网络和互联网，企业路由器连接多个分支机构。',
  },
  {
    type: 'switch',
    name: '交换机',
    icon: Network,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-950/50',
    borderColor: 'border-emerald-500/30',
    layer: 2,
    description: '交换机是一种数据链路层设备，用于在同一网络内连接多个设备。它根据 MAC 地址表将数据帧转发到正确的端口。',
    functions: [
      '学习和存储 MAC 地址',
      '根据 MAC 地址转发数据帧',
      '创建独立的冲突域',
      '支持 VLAN（虚拟局域网）',
      '提供全双工通信',
    ],
    example: '办公室交换机连接多台电脑、打印机和其他网络设备。',
  },
  {
    type: 'pc',
    name: '计算机',
    icon: Monitor,
    color: 'text-sky-400',
    bgColor: 'bg-sky-950/50',
    borderColor: 'border-sky-500/30',
    layer: 7,
    description: '计算机是网络中的终端设备，可以发送和接收数据。它运行各种应用程序，通过网络与其他设备通信。',
    functions: [
      '运行网络应用程序',
      '发送和接收数据包',
      '处理所有 OSI 层级',
      '作为客户端访问服务',
      '可配置 IP 地址和网关',
    ],
    example: '办公电脑、笔记本电脑、工作站等。',
  },
  {
    type: 'server',
    name: '服务器',
    icon: Server,
    color: 'text-amber-400',
    bgColor: 'bg-amber-950/50',
    borderColor: 'border-amber-500/30',
    layer: 7,
    description: '服务器是提供网络服务的专用计算机。它响应客户端请求，提供文件存储、网页托管、数据库等服务。',
    functions: [
      '托管网站和应用程序',
      '提供文件和打印服务',
      '运行数据库服务',
      '处理邮件和通信',
      '提供 DNS 和 DHCP 服务',
    ],
    example: 'Web 服务器、数据库服务器、邮件服务器、文件服务器等。',
  },
];

export default function Learn() {
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 overflow-hidden">
        <div className="h-full container py-6">
          <Tabs defaultValue="osi" className="h-full flex flex-col">
            <TabsList className="w-fit mx-auto mb-6 bg-slate-900/50 border border-border/50">
              <TabsTrigger value="osi" className="font-mono">
                <Layers className="w-4 h-4 mr-2" />
                OSI 模型
              </TabsTrigger>
              <TabsTrigger value="devices" className="font-mono">
                <Router className="w-4 h-4 mr-2" />
                网络设备
              </TabsTrigger>
              <TabsTrigger value="protocols" className="font-mono">
                <Zap className="w-4 h-4 mr-2" />
                常用协议
              </TabsTrigger>
            </TabsList>

            {/* OSI 模型 */}
            <TabsContent value="osi" className="flex-1 overflow-hidden mt-0">
              <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 层级列表 */}
                <div className="glass-panel rounded-xl p-4">
                  <h2 className="text-lg font-bold text-white font-mono mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-cyan-400" />
                    OSI 七层模型
                  </h2>
                  <ScrollArea className="h-[calc(100%-3rem)]">
                    <div className="space-y-2 pr-4">
                      {osiLayers.map((layer) => (
                        <div
                          key={layer.number}
                          className={cn(
                            'p-4 rounded-lg border cursor-pointer transition-all',
                            'hover:scale-[1.02]',
                            selectedLayer === layer.number
                              ? `bg-gradient-to-r ${layer.color} border-transparent`
                              : 'bg-slate-900/50 border-slate-700/50 hover:border-slate-600'
                          )}
                          onClick={() => setSelectedLayer(layer.number)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center font-bold font-mono',
                                selectedLayer === layer.number
                                  ? 'bg-white/20 text-white'
                                  : 'bg-slate-800 ' + layer.textColor
                              )}>
                                {layer.number}
                              </span>
                              <div>
                                <p className={cn(
                                  'font-semibold',
                                  selectedLayer === layer.number ? 'text-white' : layer.textColor
                                )}>
                                  {layer.name}
                                </p>
                                <p className={cn(
                                  'text-xs',
                                  selectedLayer === layer.number ? 'text-white/70' : 'text-muted-foreground'
                                )}>
                                  {layer.nameEn} Layer
                                </p>
                              </div>
                            </div>
                            <ArrowRight className={cn(
                              'w-5 h-5',
                              selectedLayer === layer.number ? 'text-white' : 'text-muted-foreground'
                            )} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* 详情面板 */}
                <div className="glass-panel rounded-xl p-6">
                  {selectedLayer ? (
                    (() => {
                      const layer = osiLayers.find((l) => l.number === selectedLayer)!;
                      return (
                        <ScrollArea className="h-full">
                          <div className="space-y-6 pr-4">
                            <div>
                              <div className={cn(
                                'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-mono mb-3',
                                `bg-gradient-to-r ${layer.color} text-white`
                              )}>
                                第 {layer.number} 层
                              </div>
                              <h3 className={cn('text-2xl font-bold', layer.textColor)}>
                                {layer.name}
                              </h3>
                              <p className="text-muted-foreground text-sm">
                                {layer.nameEn} Layer
                              </p>
                            </div>

                            <div>
                              <h4 className="text-sm font-semibold text-white mb-2">描述</h4>
                              <p className="text-muted-foreground leading-relaxed">
                                {layer.description}
                              </p>
                            </div>

                            <div>
                              <h4 className="text-sm font-semibold text-white mb-2">协议数据单元 (PDU)</h4>
                              <p className={cn('font-mono', layer.textColor)}>{layer.pdu}</p>
                            </div>

                            <div>
                              <h4 className="text-sm font-semibold text-white mb-2">常用协议</h4>
                              <div className="flex flex-wrap gap-2">
                                {layer.protocols.map((protocol) => (
                                  <span
                                    key={protocol}
                                    className="px-2 py-1 rounded bg-slate-800 text-xs font-mono text-cyan-300"
                                  >
                                    {protocol}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-semibold text-white mb-2">相关设备</h4>
                              <div className="flex flex-wrap gap-2">
                                {layer.devices.map((device) => (
                                  <span
                                    key={device}
                                    className="px-2 py-1 rounded bg-slate-800 text-xs font-mono text-emerald-300"
                                  >
                                    {device}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </ScrollArea>
                      );
                    })()
                  ) : (
                    <div className="h-full flex items-center justify-center text-center">
                      <div>
                        <Layers className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                        <p className="text-muted-foreground">
                          点击左侧层级查看详情
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* 网络设备 */}
            <TabsContent value="devices" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                  {deviceTypes.map((device) => {
                    const Icon = device.icon;
                    return (
                      <div
                        key={device.type}
                        className={cn(
                          'glass-panel rounded-xl p-6 border',
                          device.borderColor
                        )}
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className={cn(
                            'w-14 h-14 rounded-xl flex items-center justify-center',
                            device.bgColor
                          )}>
                            <Icon className={cn('w-8 h-8', device.color)} />
                          </div>
                          <div>
                            <h3 className={cn('text-xl font-bold', device.color)}>
                              {device.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              工作在 OSI 第 {device.layer} 层
                            </p>
                          </div>
                        </div>

                        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                          {device.description}
                        </p>

                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-white mb-2">主要功能</h4>
                          <ul className="space-y-1">
                            {device.functions.map((func, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                <span className={cn('mt-1.5 w-1.5 h-1.5 rounded-full shrink-0', device.color.replace('text-', 'bg-'))} />
                                {func}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-4 border-t border-border/30">
                          <h4 className="text-xs font-semibold text-muted-foreground mb-1">示例</h4>
                          <p className="text-xs text-cyan-300/80">{device.example}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* 常用协议 */}
            <TabsContent value="protocols" className="flex-1 overflow-hidden mt-0">
              <div className="glass-panel rounded-xl p-6 h-full">
                <ScrollArea className="h-full">
                  <div className="space-y-8 pr-4">
                    {/* TCP/IP */}
                    <section>
                      <h3 className="text-lg font-bold text-cyan-400 mb-4">TCP/IP 协议族</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                          <h4 className="font-semibold text-white mb-2">TCP (传输控制协议)</h4>
                          <p className="text-sm text-muted-foreground">
                            面向连接的可靠传输协议。通过三次握手建立连接，确保数据按序到达，适用于需要可靠传输的场景如网页浏览、文件传输。
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                          <h4 className="font-semibold text-white mb-2">UDP (用户数据报协议)</h4>
                          <p className="text-sm text-muted-foreground">
                            无连接的不可靠传输协议。不保证数据到达顺序和完整性，但速度快、开销小，适用于实时应用如视频通话、在线游戏。
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                          <h4 className="font-semibold text-white mb-2">IP (互联网协议)</h4>
                          <p className="text-sm text-muted-foreground">
                            网络层核心协议，负责将数据包从源地址路由到目标地址。IPv4 使用 32 位地址，IPv6 使用 128 位地址。
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                          <h4 className="font-semibold text-white mb-2">ICMP (互联网控制消息协议)</h4>
                          <p className="text-sm text-muted-foreground">
                            用于网络设备之间传递控制消息。Ping 命令就是使用 ICMP 协议来测试网络连通性。
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* 应用层协议 */}
                    <section>
                      <h3 className="text-lg font-bold text-emerald-400 mb-4">应用层协议</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                          <h4 className="font-semibold text-white mb-2">HTTP/HTTPS</h4>
                          <p className="text-xs text-muted-foreground">
                            超文本传输协议，用于 Web 浏览。HTTPS 是加密版本。
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                          <h4 className="font-semibold text-white mb-2">DNS</h4>
                          <p className="text-xs text-muted-foreground">
                            域名系统，将域名解析为 IP 地址。
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                          <h4 className="font-semibold text-white mb-2">DHCP</h4>
                          <p className="text-xs text-muted-foreground">
                            动态主机配置协议，自动分配 IP 地址。
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                          <h4 className="font-semibold text-white mb-2">FTP</h4>
                          <p className="text-xs text-muted-foreground">
                            文件传输协议，用于在网络上传输文件。
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                          <h4 className="font-semibold text-white mb-2">SSH</h4>
                          <p className="text-xs text-muted-foreground">
                            安全外壳协议，用于安全远程登录。
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                          <h4 className="font-semibold text-white mb-2">SMTP/POP3/IMAP</h4>
                          <p className="text-xs text-muted-foreground">
                            电子邮件相关协议。
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* 数据链路层协议 */}
                    <section>
                      <h3 className="text-lg font-bold text-amber-400 mb-4">数据链路层协议</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                          <h4 className="font-semibold text-white mb-2">Ethernet (以太网)</h4>
                          <p className="text-sm text-muted-foreground">
                            最常用的局域网技术。定义了物理层和数据链路层的规范，使用 MAC 地址进行设备识别。
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                          <h4 className="font-semibold text-white mb-2">ARP (地址解析协议)</h4>
                          <p className="text-sm text-muted-foreground">
                            将 IP 地址解析为 MAC 地址。当设备需要发送数据时，使用 ARP 查找目标设备的物理地址。
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-bold text-cyan-400 mb-4">协议如何体现在数据传输中</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        下面的交互式组件展示了从应用层到物理层完整的数据传输过程，以及路由器、NAT 网关和 TCP 流量控制等关键机制。
                      </p>
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h4 className="text-base font-semibold text-cyan-400">数据传输全流程</h4>
                          <FullTransmission />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <RouterSimulator />
                          <NATGateway />
                          <TCPFlowControl />
                        </div>
                        <div className="space-y-4">
                          <h4 className="text-base font-semibold text-emerald-400">基于拓扑的数据传输可视化</h4>
                          <p className="text-xs text-muted-foreground">
                            在拓扑编辑器中配置好 PC 和服务器等终端设备后，可以使用下方组件选择源和目标设备，观察协议在真实拓扑上的封装、传输和解封装过程。
                          </p>
                          <div className="min-h-[420px]">
                            <DataTransmissionVisualizer />
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
