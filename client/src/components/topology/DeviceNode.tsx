/**
 * DeviceNode - 自定义设备节点组件
 * 
 * Design: Cyberpunk Tech Theme
 * - 霓虹发光边框
 * - 设备图标和标签
 * - 连接手柄
 */

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import type { DeviceData, DeviceType } from '@/store/topologyStore';
import { useTopologyStore } from '@/store/topologyStore';

// 设备颜色映射
const deviceColors: Record<DeviceType, { border: string; glow: string; bg: string }> = {
  router: {
    border: 'border-cyan-400',
    glow: 'shadow-[0_0_15px_rgba(0,212,255,0.5)]',
    bg: 'bg-cyan-950/50',
  },
  switch: {
    border: 'border-emerald-400',
    glow: 'shadow-[0_0_15px_rgba(0,255,136,0.5)]',
    bg: 'bg-emerald-950/50',
  },
  pc: {
    border: 'border-sky-400',
    glow: 'shadow-[0_0_15px_rgba(56,189,248,0.5)]',
    bg: 'bg-sky-950/50',
  },
  server: {
    border: 'border-amber-400',
    glow: 'shadow-[0_0_15px_rgba(251,191,36,0.5)]',
    bg: 'bg-amber-950/50',
  },
};

// 设备图标路径
const deviceIcons: Record<DeviceType, string> = {
  router: '/images/router-icon.png',
  switch: '/images/switch-icon.png',
  pc: '/images/computer-icon.png',
  server: '/images/server-icon.png',
};

import { useShallow } from 'zustand/react/shallow';

function DeviceNode({ id, data, selected }: NodeProps) {
  const deviceData = data as DeviceData;
  const { type, label, ip } = deviceData;
  const colors = deviceColors[type];
  const selectNode = useTopologyStore((state) => state.selectNode);
  const packetHint = useTopologyStore(
    useShallow((state) => {
      const packet = state.simulation.packets.find((p) => p.status === 'traveling');
      if (!packet) return null;
      return {
        currentNodeId: packet.currentNodeId,
        protocol: packet.protocol,
        path: packet.path,
      };
    })
  );

  const isCurrentHop = packetHint?.currentNodeId === id;
  const isOnPath = packetHint?.path.includes(id);

  const protocolColors: Record<string, string> = {
    ICMP: 'bg-cyan-400',
    TCP: 'bg-emerald-400',
    UDP: 'bg-amber-400',
    ARP: 'bg-pink-400',
  };

  return (
    <div
      className={cn(
        'relative group cursor-pointer transition-all duration-300',
        'min-w-[120px] rounded-lg border-2',
        colors.border,
        colors.bg,
        selected && colors.glow,
        isOnPath && 'ring-2 ring-cyan-400/20',
        isCurrentHop && 'ring-2 ring-cyan-400/60 shadow-[0_0_25px_rgba(0,212,255,0.35)]',
        'hover:scale-105'
      )}
      onClick={() => selectNode(id)}
    >
      {isCurrentHop && (
        <div className="absolute -top-2 -right-2 z-10">
          <div
            className={cn(
              'w-4 h-4 rounded-full border-2 border-slate-900 shadow-[0_0_12px_rgba(255,255,255,0.15)]',
              protocolColors[packetHint?.protocol || 'ICMP']
            )}
          />
        </div>
      )}

      {/* 顶部连接点 */}
      <Handle
        type="target"
        position={Position.Top}
        className={cn(
          'w-3 h-3 !bg-cyan-400 border-2 border-slate-900',
          '!-top-1.5 transition-all duration-200',
          'hover:!bg-cyan-300 hover:scale-125'
        )}
      />

      {/* 节点内容 */}
      <div className="p-3 flex flex-col items-center gap-2">
        {/* 设备图标 */}
        <div className="w-12 h-12 flex items-center justify-center">
          <img
            src={deviceIcons[type]}
            alt={label}
            className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]"
          />
        </div>

        {/* 设备标签 */}
        <div className="text-center">
          <p className="text-sm font-semibold text-white font-mono">
            {label}
          </p>
          {ip && (
            <p className="text-xs text-cyan-300/80 font-mono mt-0.5">
              {ip}
            </p>
          )}
        </div>
      </div>

      {/* 底部连接点 */}
      <Handle
        type="source"
        position={Position.Bottom}
        className={cn(
          'w-3 h-3 !bg-emerald-400 border-2 border-slate-900',
          '!-bottom-1.5 transition-all duration-200',
          'hover:!bg-emerald-300 hover:scale-125'
        )}
      />

      {/* 左侧连接点 */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className={cn(
          'w-3 h-3 !bg-cyan-400 border-2 border-slate-900',
          '!-left-1.5 transition-all duration-200',
          'hover:!bg-cyan-300 hover:scale-125'
        )}
      />

      {/* 右侧连接点 */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className={cn(
          'w-3 h-3 !bg-emerald-400 border-2 border-slate-900',
          '!-right-1.5 transition-all duration-200',
          'hover:!bg-emerald-300 hover:scale-125'
        )}
      />

      {/* 选中指示器 */}
      {selected && (
        <div className="absolute -inset-1 rounded-xl border border-cyan-400/50 animate-pulse pointer-events-none" />
      )}
    </div>
  );
}

export default memo(DeviceNode);
