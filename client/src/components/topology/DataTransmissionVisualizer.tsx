/**
 * DataTransmissionVisualizer - 数据传输可视化组件
 * 
 * 展示消息在网络中传输时的封装/解封装过程
 * - 用户输入消息内容
 * - 展示OSI各层封装过程
 * - 动画展示数据包传输
 * - 展示目标设备解封装过程
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Package, 
  ArrowDown, 
  ArrowUp,
  ArrowRight,
  Layers,
  Binary,
  Network,
  Wifi,
  Monitor,
  Server,
  Play,
  RotateCcw,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useTopologyStore } from '@/store/topologyStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// OSI层定义
interface OSILayer {
  id: string;
  name: string;
  englishName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  headerFields: string[];
}

const osiLayers: OSILayer[] = [
  {
    id: 'application',
    name: '应用层',
    englishName: 'Application',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/50',
    icon: <Monitor className="w-4 h-4" />,
    headerFields: ['HTTP/HTTPS', 'Method', 'URL', 'Headers']
  },
  {
    id: 'transport',
    name: '传输层',
    englishName: 'Transport',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/50',
    icon: <Package className="w-4 h-4" />,
    headerFields: ['Source Port', 'Dest Port', 'Seq Number', 'Flags']
  },
  {
    id: 'network',
    name: '网络层',
    englishName: 'Network',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/50',
    icon: <Network className="w-4 h-4" />,
    headerFields: ['Source IP', 'Dest IP', 'TTL', 'Protocol']
  },
  {
    id: 'dataLink',
    name: '数据链路层',
    englishName: 'Data Link',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/50',
    icon: <Layers className="w-4 h-4" />,
    headerFields: ['Source MAC', 'Dest MAC', 'Type', 'FCS']
  },
  {
    id: 'physical',
    name: '物理层',
    englishName: 'Physical',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/50',
    icon: <Binary className="w-4 h-4" />,
    headerFields: ['电信号', '光信号', '比特流']
  }
];

// 封装数据结构
interface EncapsulatedData {
  layer: string;
  header: Record<string, string>;
  payload: string;
  totalSize: number;
  hexPreview: string;
}

// 传输阶段
type TransmissionPhase = 
  | 'idle' 
  | 'input' 
  | 'encapsulating' 
  | 'transmitting' 
  | 'decapsulating' 
  | 'complete';

export default function DataTransmissionVisualizer() {
  const { nodes } = useTopologyStore();
  
  // 状态
  const [message, setMessage] = useState('Hello, World!');
  const [sourceId, setSourceId] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const [protocol, setProtocol] = useState<'HTTP' | 'TCP' | 'UDP' | 'ICMP'>('HTTP');
  const [phase, setPhase] = useState<TransmissionPhase>('idle');
  const [currentLayerIndex, setCurrentLayerIndex] = useState(-1);
  const [encapsulatedLayers, setEncapsulatedLayers] = useState<EncapsulatedData[]>([]);
  const [showHex, setShowHex] = useState(false);
  const [transmitProgress, setTransmitProgress] = useState(0);
  const [isDecapsulating, setIsDecapsulating] = useState(false);

  // 获取终端设备
  const endpoints = nodes.filter((n) => {
    const data = n.data as { type?: string };
    return data.type === 'pc' || data.type === 'server';
  });

  // 获取设备信息
  const getDeviceInfo = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { label: '未知', ip: '0.0.0.0', mac: '00:00:00:00:00:00' };
    const data = node.data as { label?: string; ip?: string; mac?: string };
    return {
      label: data.label || '未知',
      ip: data.ip || '192.168.1.1',
      mac: data.mac || '00:11:22:33:44:55'
    };
  };

  // 生成随机端口
  const randomPort = () => Math.floor(Math.random() * 60000) + 1024;

  // 生成十六进制预览
  const generateHexPreview = (data: string): string => {
    const bytes = new TextEncoder().encode(data);
    return Array.from(bytes.slice(0, 16))
      .map(b => b.toString(16).padStart(2, '0').toUpperCase())
      .join(' ') + (bytes.length > 16 ? ' ...' : '');
  };

  // 封装数据
  const encapsulateData = useCallback(() => {
    const source = getDeviceInfo(sourceId);
    const target = getDeviceInfo(targetId);
    const srcPort = randomPort();
    const dstPort = protocol === 'HTTP' ? 80 : protocol === 'TCP' ? 443 : 53;

    const layers: EncapsulatedData[] = [];
    let currentPayload = message;
    let totalSize = new TextEncoder().encode(message).length;

    // 应用层
    if (protocol === 'HTTP') {
      const httpHeader = {
        'Method': 'GET',
        'URL': '/api/data',
        'Host': target.label,
        'Content-Type': 'text/plain',
        'Content-Length': totalSize.toString()
      };
      const headerStr = `GET /api/data HTTP/1.1\r\nHost: ${target.label}\r\n\r\n`;
      totalSize += headerStr.length;
      layers.push({
        layer: 'application',
        header: httpHeader,
        payload: currentPayload,
        totalSize,
        hexPreview: generateHexPreview(headerStr + currentPayload)
      });
      currentPayload = headerStr + currentPayload;
    } else {
      layers.push({
        layer: 'application',
        header: { 'Protocol': protocol, 'Data': message.substring(0, 20) + '...' },
        payload: currentPayload,
        totalSize,
        hexPreview: generateHexPreview(currentPayload)
      });
    }

    // 传输层
    const transportHeader = {
      'Source Port': srcPort.toString(),
      'Dest Port': dstPort.toString(),
      'Sequence': Math.floor(Math.random() * 1000000).toString(),
      'Ack': '0',
      'Flags': protocol === 'TCP' || protocol === 'HTTP' ? 'SYN, ACK' : 'N/A',
      'Window': '65535',
      'Checksum': '0x' + Math.floor(Math.random() * 65535).toString(16).toUpperCase()
    };
    totalSize += 20; // TCP/UDP header size
    layers.push({
      layer: 'transport',
      header: transportHeader,
      payload: currentPayload,
      totalSize,
      hexPreview: generateHexPreview(JSON.stringify(transportHeader).substring(0, 20))
    });

    // 网络层
    const networkHeader = {
      'Version': '4',
      'Header Length': '20',
      'TTL': '64',
      'Protocol': protocol === 'TCP' || protocol === 'HTTP' ? '6 (TCP)' : protocol === 'UDP' ? '17 (UDP)' : '1 (ICMP)',
      'Source IP': source.ip,
      'Dest IP': target.ip,
      'Checksum': '0x' + Math.floor(Math.random() * 65535).toString(16).toUpperCase()
    };
    totalSize += 20; // IP header size
    layers.push({
      layer: 'network',
      header: networkHeader,
      payload: currentPayload,
      totalSize,
      hexPreview: generateHexPreview(source.ip + target.ip)
    });

    // 数据链路层
    const dataLinkHeader = {
      'Dest MAC': target.mac,
      'Source MAC': source.mac,
      'Type': '0x0800 (IPv4)',
      'FCS': '0x' + Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase()
    };
    totalSize += 18; // Ethernet header + FCS
    layers.push({
      layer: 'dataLink',
      header: dataLinkHeader,
      payload: currentPayload,
      totalSize,
      hexPreview: generateHexPreview(target.mac + source.mac)
    });

    // 物理层
    const physicalHeader = {
      'Preamble': '10101010... (7 bytes)',
      'SFD': '10101011',
      'Signal': '电信号/光信号',
      'Encoding': 'Manchester / 4B/5B'
    };
    totalSize += 8; // Preamble + SFD
    layers.push({
      layer: 'physical',
      header: physicalHeader,
      payload: currentPayload,
      totalSize,
      hexPreview: '10101010 10101010 10101010 10101011 ...'
    });

    return layers;
  }, [message, sourceId, targetId, protocol, nodes]);

  // 开始传输动画
  const startTransmission = async () => {
    if (!sourceId || !targetId || sourceId === targetId) return;

    setPhase('encapsulating');
    setCurrentLayerIndex(0);
    setEncapsulatedLayers([]);
    setTransmitProgress(0);
    setIsDecapsulating(false);

    const layers = encapsulateData();

    // 封装动画
    for (let i = 0; i < layers.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setCurrentLayerIndex(i);
      setEncapsulatedLayers(prev => [...prev, layers[i]]);
    }

    // 传输动画
    await new Promise(resolve => setTimeout(resolve, 500));
    setPhase('transmitting');
    
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setTransmitProgress(i);
    }

    // 解封装动画
    await new Promise(resolve => setTimeout(resolve, 500));
    setPhase('decapsulating');
    setIsDecapsulating(true);

    for (let i = layers.length - 1; i >= 0; i--) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setCurrentLayerIndex(i);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    setPhase('complete');
  };

  // 重置
  const reset = () => {
    setPhase('idle');
    setCurrentLayerIndex(-1);
    setEncapsulatedLayers([]);
    setTransmitProgress(0);
    setIsDecapsulating(false);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/50 rounded-xl border border-cyan-500/30 overflow-hidden">
      {/* 标题栏 */}
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Send className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-white font-mono text-sm">数据传输可视化</h3>
          <span className="text-xs text-muted-foreground">Data Transmission Visualizer</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHex(!showHex)}
            className="h-7 text-xs"
          >
            {showHex ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
            {showHex ? '隐藏HEX' : '显示HEX'}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：输入和控制 */}
        <div className="w-80 border-r border-border/50 p-4 space-y-4 overflow-y-auto">
          {/* 消息输入 */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">要发送的消息</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="输入要发送的消息..."
              className="bg-slate-900/50 border-border/50 text-sm h-20 resize-none"
              disabled={phase !== 'idle'}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {new TextEncoder().encode(message).length} bytes
            </div>
          </div>

          {/* 源和目标选择 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">源设备</label>
              <Select value={sourceId} onValueChange={setSourceId} disabled={phase !== 'idle'}>
                <SelectTrigger className="bg-slate-900/50 border-border/50 text-sm">
                  <SelectValue placeholder="选择源" />
                </SelectTrigger>
                <SelectContent>
                  {endpoints.map((node) => {
                    const data = node.data as { label?: string; ip?: string };
                    return (
                      <SelectItem key={node.id} value={node.id}>
                        {data.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">目标设备</label>
              <Select value={targetId} onValueChange={setTargetId} disabled={phase !== 'idle'}>
                <SelectTrigger className="bg-slate-900/50 border-border/50 text-sm">
                  <SelectValue placeholder="选择目标" />
                </SelectTrigger>
                <SelectContent>
                  {endpoints.filter(n => n.id !== sourceId).map((node) => {
                    const data = node.data as { label?: string; ip?: string };
                    return (
                      <SelectItem key={node.id} value={node.id}>
                        {data.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 协议选择 */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">应用协议</label>
            <Select value={protocol} onValueChange={(v) => setProtocol(v as typeof protocol)} disabled={phase !== 'idle'}>
              <SelectTrigger className="bg-slate-900/50 border-border/50 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HTTP">HTTP (Web请求)</SelectItem>
                <SelectItem value="TCP">TCP (可靠传输)</SelectItem>
                <SelectItem value="UDP">UDP (快速传输)</SelectItem>
                <SelectItem value="ICMP">ICMP (Ping)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 控制按钮 */}
          <div className="flex gap-2">
            {phase === 'idle' ? (
              <Button
                className="flex-1 bg-cyan-600 hover:bg-cyan-500"
                onClick={startTransmission}
                disabled={!sourceId || !targetId || sourceId === targetId || !message}
              >
                <Play className="w-4 h-4 mr-1" />
                开始传输
              </Button>
            ) : (
              <Button
                variant="outline"
                className="flex-1"
                onClick={reset}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                重置
              </Button>
            )}
          </div>

          {/* 状态指示 */}
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <div className="text-xs text-muted-foreground mb-2">当前状态</div>
            <div className={cn(
              'text-sm font-mono',
              phase === 'idle' && 'text-muted-foreground',
              phase === 'encapsulating' && 'text-cyan-400',
              phase === 'transmitting' && 'text-amber-400',
              phase === 'decapsulating' && 'text-emerald-400',
              phase === 'complete' && 'text-green-400'
            )}>
              {phase === 'idle' && '等待开始'}
              {phase === 'encapsulating' && '正在封装数据...'}
              {phase === 'transmitting' && '正在传输数据...'}
              {phase === 'decapsulating' && '正在解封装数据...'}
              {phase === 'complete' && '传输完成！'}
            </div>
            {phase === 'transmitting' && (
              <div className="mt-2">
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${transmitProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：可视化区域 */}
        <div className="flex-1 p-4 overflow-y-auto">
          {/* 封装/解封装可视化 */}
          <div className="space-y-3">
            {/* 原始数据 */}
            <motion.div
              className="p-3 bg-slate-800/50 rounded-lg border border-slate-700"
              initial={{ opacity: 0.5 }}
              animate={{ 
                opacity: phase !== 'idle' ? 1 : 0.5,
                scale: phase === 'encapsulating' && currentLayerIndex === -1 ? 1.02 : 1
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                  <span className="text-xs font-mono text-white">D</span>
                </div>
                <span className="text-sm font-mono text-white">原始数据 (User Data)</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {new TextEncoder().encode(message).length} bytes
                </span>
              </div>
              <div className="p-2 bg-black/30 rounded font-mono text-xs text-cyan-300 break-all">
                {message}
              </div>
              {showHex && (
                <div className="mt-2 p-2 bg-black/30 rounded font-mono text-xs text-amber-300/70">
                  HEX: {generateHexPreview(message)}
                </div>
              )}
            </motion.div>

            {/* 封装方向指示 */}
            {phase === 'encapsulating' && (
              <div className="flex items-center justify-center gap-2 py-2">
                <ArrowDown className="w-4 h-4 text-cyan-400 animate-bounce" />
                <span className="text-xs text-cyan-400 font-mono">封装中 (Encapsulating)</span>
              </div>
            )}

            {/* OSI各层 */}
            <AnimatePresence>
              {osiLayers.map((layer, index) => {
                const isActive = phase === 'encapsulating' && currentLayerIndex === index;
                const isEncapsulated = encapsulatedLayers.some(l => l.layer === layer.id);
                const isDecapsulatingThis = phase === 'decapsulating' && currentLayerIndex === index;
                const layerData = encapsulatedLayers.find(l => l.layer === layer.id);

                // 解封装时，已解封的层隐藏
                const isDecapsulated = phase === 'decapsulating' && index > currentLayerIndex;
                const shouldShow = isEncapsulated && !isDecapsulated;

                if (!shouldShow && phase !== 'idle') return null;

                return (
                  <motion.div
                    key={layer.id}
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ 
                      opacity: shouldShow ? 1 : 0.3,
                      y: 0,
                      scale: isActive || isDecapsulatingThis ? 1.02 : 1
                    }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      'p-3 rounded-lg border transition-all',
                      layer.bgColor,
                      layer.borderColor,
                      (isActive || isDecapsulatingThis) && 'ring-2 ring-offset-2 ring-offset-slate-900',
                      isActive && 'ring-cyan-500',
                      isDecapsulatingThis && 'ring-emerald-500'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn('w-6 h-6 rounded flex items-center justify-center', layer.bgColor)}>
                        {layer.icon}
                      </div>
                      <span className={cn('text-sm font-mono font-bold', layer.color)}>
                        {layer.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({layer.englishName} Layer)
                      </span>
                      {layerData && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          +{index === 0 ? 0 : [0, 20, 20, 18, 8][index]} bytes header → {layerData.totalSize} bytes total
                        </span>
                      )}
                    </div>

                    {/* 头部字段 */}
                    {layerData && (
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        {Object.entries(layerData.header).slice(0, 4).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="text-muted-foreground">{key}: </span>
                            <span className={layer.color}>{value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* HEX预览 */}
                    {showHex && layerData && (
                      <div className="p-2 bg-black/30 rounded font-mono text-xs text-amber-300/70">
                        {layerData.hexPreview}
                      </div>
                    )}

                    {/* 封装动画指示 */}
                    {isActive && (
                      <motion.div
                        className="mt-2 flex items-center gap-2 text-xs text-cyan-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        正在添加 {layer.name} 头部...
                      </motion.div>
                    )}

                    {/* 解封装动画指示 */}
                    {isDecapsulatingThis && (
                      <motion.div
                        className="mt-2 flex items-center gap-2 text-xs text-emerald-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        正在移除 {layer.name} 头部...
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* 解封装方向指示 */}
            {phase === 'decapsulating' && (
              <div className="flex items-center justify-center gap-2 py-2">
                <ArrowUp className="w-4 h-4 text-emerald-400 animate-bounce" />
                <span className="text-xs text-emerald-400 font-mono">解封装中 (Decapsulating)</span>
              </div>
            )}

            {/* 传输动画 */}
            {phase === 'transmitting' && (
              <motion.div
                className="my-6 p-4 bg-gradient-to-r from-cyan-500/10 via-amber-500/10 to-emerald-500/10 rounded-xl border border-amber-500/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm font-mono text-cyan-400">
                      {getDeviceInfo(sourceId).label}
                    </span>
                  </div>
                  <div className="flex-1 mx-4 relative h-8">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 via-amber-500 to-emerald-500 transform -translate-y-1/2" />
                    <motion.div
                      className="absolute top-1/2 transform -translate-y-1/2"
                      initial={{ left: '0%' }}
                      animate={{ left: `${transmitProgress}%` }}
                      transition={{ duration: 0.1 }}
                    >
                      <div className="w-4 h-4 bg-amber-500 rounded-full shadow-lg shadow-amber-500/50 flex items-center justify-center">
                        <Wifi className="w-2 h-2 text-black" />
                      </div>
                    </motion.div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-mono text-emerald-400">
                      {getDeviceInfo(targetId).label}
                    </span>
                  </div>
                </div>
                <div className="text-center text-xs text-muted-foreground">
                  通过物理介质传输比特流...
                </div>
              </motion.div>
            )}

            {/* 完成状态 */}
            {phase === 'complete' && (
              <motion.div
                className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Package className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
                <div className="text-emerald-400 font-mono font-bold mb-1">传输完成！</div>
                <div className="text-xs text-muted-foreground">
                  消息已成功从 {getDeviceInfo(sourceId).label} 传输到 {getDeviceInfo(targetId).label}
                </div>
                <div className="mt-3 p-2 bg-black/30 rounded font-mono text-xs text-cyan-300">
                  接收到的数据: {message}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
