/**
 * PacketDetails - 数据包详情面板
 * 
 * Design: Cyberpunk Tech Theme
 * - 显示当前传输数据包的 OSI 层级信息
 * - 可视化封装/解封装过程
 */

import { cn } from '@/lib/utils';
import { useTopologyStore } from '@/store/topologyStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ArrowDown, ArrowUp } from 'lucide-react';

const layerInfo = [
  { name: '应用层', key: 'application', color: 'from-purple-500 to-purple-600', textColor: 'text-purple-400' },
  { name: '传输层', key: 'transport', color: 'from-orange-500 to-orange-600', textColor: 'text-orange-400' },
  { name: '网络层', key: 'network', color: 'from-amber-500 to-amber-600', textColor: 'text-amber-400' },
  { name: '数据链路层', key: 'dataLink', color: 'from-emerald-500 to-emerald-600', textColor: 'text-emerald-400' },
  { name: '物理层', key: 'physical', color: 'from-cyan-500 to-cyan-600', textColor: 'text-cyan-400' },
];

export default function PacketDetails() {
  const { simulation, nodes } = useTopologyStore();
  const activePacket = simulation.packets.find((p) => p.status === 'traveling');

  if (!activePacket) {
    return null;
  }

  const sourceNode = nodes.find((n) => n.id === activePacket.sourceId);
  const targetNode = nodes.find((n) => n.id === activePacket.targetId);
  const sourceData = sourceNode?.data as { label?: string; ip?: string } | undefined;
  const targetData = targetNode?.data as { label?: string; ip?: string } | undefined;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="absolute top-4 right-4 w-72 glass-panel rounded-xl p-4 z-50"
      >
        {/* 标题 */}
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-white font-mono text-sm">数据包详情</h3>
          <span className={cn(
            'ml-auto px-2 py-0.5 rounded-full text-xs font-mono',
            activePacket.protocol === 'ICMP' && 'bg-cyan-500/20 text-cyan-400',
            activePacket.protocol === 'TCP' && 'bg-emerald-500/20 text-emerald-400',
            activePacket.protocol === 'UDP' && 'bg-amber-500/20 text-amber-400',
            activePacket.protocol === 'ARP' && 'bg-pink-500/20 text-pink-400'
          )}>
            {activePacket.protocol}
          </span>
        </div>

        {/* 源和目标 */}
        <div className="flex items-center justify-between mb-4 text-xs">
          <div className="text-center">
            <p className="text-muted-foreground">源</p>
            <p className="text-cyan-300 font-mono">{sourceData?.label}</p>
            <p className="text-muted-foreground font-mono">{sourceData?.ip}</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-1 text-emerald-400">
              <div className="w-8 h-px bg-emerald-400" />
              <ArrowDown className="w-4 h-4 rotate-[-90deg]" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">目标</p>
            <p className="text-cyan-300 font-mono">{targetData?.label}</p>
            <p className="text-muted-foreground font-mono">{targetData?.ip}</p>
          </div>
        </div>

        {/* OSI 层级封装 */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDown className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-muted-foreground">封装过程</span>
          </div>
          
          {layerInfo.map((layer, index) => {
            const value = activePacket.layers[layer.key as keyof typeof activePacket.layers];
            if (!value) return null;

            return (
              <motion.div
                key={layer.key}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'px-3 py-2 rounded-lg text-xs',
                  'bg-gradient-to-r',
                  layer.color
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{layer.name}</span>
                </div>
                <p className="text-white/80 mt-0.5 font-mono text-[10px]">{value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* 路径 */}
        <div className="mt-4 pt-3 border-t border-border/30">
          <p className="text-xs text-muted-foreground mb-2">传输路径</p>
          <div className="flex items-center gap-1 flex-wrap">
            {activePacket.path.map((nodeId, index) => {
              const node = nodes.find((n) => n.id === nodeId);
              const nodeData = node?.data as { label?: string } | undefined;
              const isCurrent = nodeId === activePacket.currentNodeId;

              return (
                <div key={nodeId} className="flex items-center gap-1">
                  <span className={cn(
                    'px-1.5 py-0.5 rounded text-[10px] font-mono',
                    isCurrent
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-800 text-muted-foreground'
                  )}>
                    {nodeData?.label || nodeId}
                  </span>
                  {index < activePacket.path.length - 1 && (
                    <ArrowDown className="w-3 h-3 text-muted-foreground rotate-[-90deg]" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
