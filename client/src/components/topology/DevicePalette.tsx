/**
 * DevicePalette - 设备库侧边栏
 * 
 * Design: Cyberpunk Tech Theme
 * - 玻璃态面板
 * - 可拖拽的设备卡片
 * - 霓虹发光效果
 */

import { type DragEvent } from 'react';
import { cn } from '@/lib/utils';
import type { DeviceType } from '@/store/topologyStore';

interface DeviceItem {
  type: DeviceType;
  label: string;
  description: string;
  icon: string;
  color: string;
}

const devices: DeviceItem[] = [
  {
    type: 'router',
    label: '路由器',
    description: '三层设备，转发数据包',
    icon: '/images/router-icon.png',
    color: 'cyan',
  },
  {
    type: 'switch',
    label: '交换机',
    description: '二层设备，转发数据帧',
    icon: '/images/switch-icon.png',
    color: 'emerald',
  },
  {
    type: 'pc',
    label: '计算机',
    description: '终端设备，发送/接收数据',
    icon: '/images/computer-icon.png',
    color: 'sky',
  },
  {
    type: 'server',
    label: '服务器',
    description: '提供网络服务',
    icon: '/images/server-icon.png',
    color: 'amber',
  },
];

const colorClasses: Record<string, { border: string; hover: string; text: string }> = {
  cyan: {
    border: 'border-cyan-500/30',
    hover: 'hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]',
    text: 'text-cyan-400',
  },
  emerald: {
    border: 'border-emerald-500/30',
    hover: 'hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]',
    text: 'text-emerald-400',
  },
  sky: {
    border: 'border-sky-500/30',
    hover: 'hover:border-sky-400 hover:shadow-[0_0_20px_rgba(56,189,248,0.3)]',
    text: 'text-sky-400',
  },
  amber: {
    border: 'border-amber-500/30',
    hover: 'hover:border-amber-400 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]',
    text: 'text-amber-400',
  },
};

export default function DevicePalette() {
  const onDragStart = (event: DragEvent<HTMLDivElement>, deviceType: DeviceType) => {
    event.dataTransfer.setData('application/reactflow', deviceType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 h-full glass-panel border-r border-border/50 flex flex-col">
      {/* 标题 */}
      <div className="p-4 border-b border-border/50">
        <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          设备库
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          拖拽设备到画布中
        </p>
      </div>

      {/* 设备列表 */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {devices.map((device) => {
          const colors = colorClasses[device.color];
          return (
            <div
              key={device.type}
              draggable
              onDragStart={(e) => onDragStart(e, device.type)}
              className={cn(
                'p-3 rounded-lg border-2 cursor-grab active:cursor-grabbing',
                'bg-slate-900/50 backdrop-blur-sm',
                'transition-all duration-300',
                colors.border,
                colors.hover
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex-shrink-0">
                  <img
                    src={device.icon}
                    alt={device.label}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('font-semibold font-mono text-sm', colors.text)}>
                    {device.label}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {device.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 底部提示 */}
      <div className="p-3 border-t border-border/50">
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">
              拖拽
            </kbd>
            添加设备
          </p>
          <p className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">
              Delete
            </kbd>
            删除选中
          </p>
        </div>
      </div>
    </div>
  );
}
