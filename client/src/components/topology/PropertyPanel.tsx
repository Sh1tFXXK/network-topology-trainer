/**
 * PropertyPanel - 属性面板
 * 
 * Design: Cyberpunk Tech Theme
 * - 显示选中设备的详细信息
 * - 支持编辑设备属性
 * - OSI 模型层级展示
 */

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTopologyStore, type DeviceData, type DeviceType } from '@/store/topologyStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Save, Trash2, Info, Network, Layers } from 'lucide-react';

// OSI 模型层级
const osiLayers = [
  { name: '应用层', number: 7, color: 'text-purple-400', description: 'HTTP, FTP, DNS, SMTP' },
  { name: '表示层', number: 6, color: 'text-pink-400', description: '数据格式转换、加密' },
  { name: '会话层', number: 5, color: 'text-rose-400', description: '会话建立、管理' },
  { name: '传输层', number: 4, color: 'text-orange-400', description: 'TCP, UDP' },
  { name: '网络层', number: 3, color: 'text-amber-400', description: 'IP, ICMP, 路由' },
  { name: '数据链路层', number: 2, color: 'text-emerald-400', description: 'MAC, 交换机' },
  { name: '物理层', number: 1, color: 'text-cyan-400', description: '电信号、光纤' },
];

// 设备在 OSI 模型中的工作层级
const deviceOsiLayers: Record<DeviceType, number[]> = {
  router: [1, 2, 3],
  switch: [1, 2],
  pc: [1, 2, 3, 4, 5, 6, 7],
  server: [1, 2, 3, 4, 5, 6, 7],
};

export default function PropertyPanel() {
  const { nodes, selectedNodeId, updateNode, removeNode, selectNode } = useTopologyStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const deviceData = selectedNode?.data as DeviceData | undefined;

  const [editData, setEditData] = useState<Partial<DeviceData>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // 当选中节点变化时，重置编辑状态
  useEffect(() => {
    if (deviceData) {
      setEditData({
        label: deviceData.label,
        ip: deviceData.ip,
        mac: deviceData.mac,
        subnet: deviceData.subnet,
        gateway: deviceData.gateway,
      });
      setHasChanges(false);
    }
  }, [selectedNodeId, deviceData]);

  const handleChange = (field: keyof DeviceData, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (selectedNodeId && hasChanges) {
      updateNode(selectedNodeId, editData);
      setHasChanges(false);
    }
  };

  const handleDelete = () => {
    if (selectedNodeId) {
      removeNode(selectedNodeId);
    }
  };

  if (!selectedNode || !deviceData) {
    return (
      <div className="w-80 h-full glass-panel border-l border-border/50 flex flex-col">
        <div className="p-4 border-b border-border/50">
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <Info className="w-5 h-5 text-cyan-400" />
            属性面板
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-muted-foreground">
            <Network className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-sm">选择一个设备查看详情</p>
          </div>
        </div>
      </div>
    );
  }

  const activeLayers = deviceOsiLayers[deviceData.type] || [];

  return (
    <div className="w-80 h-full glass-panel border-l border-border/50 flex flex-col">
      {/* 标题栏 */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
          <Info className="w-5 h-5 text-cyan-400" />
          设备属性
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-white"
          onClick={() => selectNode(null)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* 基本信息 */}
          <section>
            <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              基本信息
            </h3>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">设备名称</Label>
                <Input
                  value={editData.label || ''}
                  onChange={(e) => handleChange('label', e.target.value)}
                  className="mt-1 bg-slate-900/50 border-border/50 font-mono text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">设备类型</Label>
                <div className="mt-1 px-3 py-2 rounded-md bg-slate-900/50 border border-border/50 text-sm font-mono text-cyan-300">
                  {deviceData.type.toUpperCase()}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">设备 ID</Label>
                <div className="mt-1 px-3 py-2 rounded-md bg-slate-900/50 border border-border/50 text-xs font-mono text-muted-foreground">
                  {selectedNodeId}
                </div>
              </div>
            </div>
          </section>

          <Separator className="bg-border/30" />

          {/* 网络配置 */}
          <section>
            <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              网络配置
            </h3>
            <div className="space-y-3">
              {(deviceData.type === 'pc' || deviceData.type === 'server' || deviceData.type === 'router') && (
                <>
                  <div>
                    <Label className="text-xs text-muted-foreground">IP 地址</Label>
                    <Input
                      value={editData.ip || ''}
                      onChange={(e) => handleChange('ip', e.target.value)}
                      placeholder="192.168.1.1"
                      className="mt-1 bg-slate-900/50 border-border/50 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">子网掩码</Label>
                    <Input
                      value={editData.subnet || ''}
                      onChange={(e) => handleChange('subnet', e.target.value)}
                      placeholder="255.255.255.0"
                      className="mt-1 bg-slate-900/50 border-border/50 font-mono text-sm"
                    />
                  </div>
                </>
              )}
              {(deviceData.type === 'pc' || deviceData.type === 'server') && (
                <div>
                  <Label className="text-xs text-muted-foreground">默认网关</Label>
                  <Input
                    value={editData.gateway || ''}
                    onChange={(e) => handleChange('gateway', e.target.value)}
                    placeholder="192.168.1.1"
                    className="mt-1 bg-slate-900/50 border-border/50 font-mono text-sm"
                  />
                </div>
              )}
              <div>
                <Label className="text-xs text-muted-foreground">MAC 地址</Label>
                <Input
                  value={editData.mac || ''}
                  onChange={(e) => handleChange('mac', e.target.value)}
                  placeholder="00:11:22:33:44:55"
                  className="mt-1 bg-slate-900/50 border-border/50 font-mono text-sm"
                />
              </div>
            </div>
          </section>

          <Separator className="bg-border/30" />

          {/* OSI 模型层级 */}
          <section>
            <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              OSI 模型层级
            </h3>
            <div className="space-y-1.5">
              {osiLayers.map((layer) => {
                const isActive = activeLayers.includes(layer.number);
                return (
                  <div
                    key={layer.number}
                    className={cn(
                      'px-3 py-2 rounded-md border text-xs font-mono transition-all',
                      isActive
                        ? 'bg-slate-800/80 border-slate-600'
                        : 'bg-slate-900/30 border-slate-800/50 opacity-40'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn('font-semibold', isActive ? layer.color : 'text-slate-500')}>
                        L{layer.number} {layer.name}
                      </span>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>
                    {isActive && (
                      <p className="text-muted-foreground mt-0.5">{layer.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 设备描述 */}
          {deviceData.description && (
            <>
              <Separator className="bg-border/30" />
              <section>
                <h3 className="text-sm font-semibold text-purple-400 mb-2">设备说明</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {deviceData.description}
                </p>
              </section>
            </>
          )}
        </div>
      </ScrollArea>

      {/* 操作按钮 */}
      <div className="p-4 border-t border-border/50 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          删除
        </Button>
        <Button
          size="sm"
          className={cn(
            'flex-1',
            hasChanges
              ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
              : 'bg-slate-700 text-slate-400 cursor-not-allowed'
          )}
          onClick={handleSave}
          disabled={!hasChanges}
        >
          <Save className="w-4 h-4 mr-1" />
          保存
        </Button>
      </div>
    </div>
  );
}
