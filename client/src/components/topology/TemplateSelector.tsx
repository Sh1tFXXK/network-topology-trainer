/**
 * TemplateSelector - 预设拓扑模板选择器
 * 
 * Design: Cyberpunk Tech Theme
 * - 提供常见网络拓扑模板
 * - 一键加载示例网络
 */

import { cn } from '@/lib/utils';
import { useTopologyStore, type DeviceType, type DeviceData } from '@/store/topologyStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Layers, Star, Home, Building2, Network } from 'lucide-react';
import { toast } from 'sonner';
import type { Node, Edge } from '@xyflow/react';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: typeof Star;
  nodes: Array<{
    type: DeviceType;
    position: { x: number; y: number };
    data: Partial<DeviceData>;
  }>;
  connections: Array<[number, number]>; // 节点索引对
}

const templates: Template[] = [
  {
    id: 'simple-lan',
    name: '简单局域网',
    description: '一个交换机连接多台电脑',
    icon: Home,
    nodes: [
      { type: 'switch', position: { x: 400, y: 150 }, data: { label: '交换机' } },
      { type: 'pc', position: { x: 200, y: 300 }, data: { label: 'PC-1', ip: '192.168.1.10' } },
      { type: 'pc', position: { x: 400, y: 300 }, data: { label: 'PC-2', ip: '192.168.1.11' } },
      { type: 'pc', position: { x: 600, y: 300 }, data: { label: 'PC-3', ip: '192.168.1.12' } },
    ],
    connections: [[0, 1], [0, 2], [0, 3]],
  },
  {
    id: 'home-network',
    name: '家庭网络',
    description: '路由器连接多设备',
    icon: Home,
    nodes: [
      { type: 'router', position: { x: 400, y: 100 }, data: { label: '家用路由器', ip: '192.168.1.1' } },
      { type: 'switch', position: { x: 400, y: 250 }, data: { label: '交换机' } },
      { type: 'pc', position: { x: 200, y: 400 }, data: { label: '台式机', ip: '192.168.1.100' } },
      { type: 'pc', position: { x: 400, y: 400 }, data: { label: '笔记本', ip: '192.168.1.101' } },
      { type: 'server', position: { x: 600, y: 400 }, data: { label: 'NAS 服务器', ip: '192.168.1.200' } },
    ],
    connections: [[0, 1], [1, 2], [1, 3], [1, 4]],
  },
  {
    id: 'enterprise',
    name: '企业网络',
    description: '多层级企业网络架构',
    icon: Building2,
    nodes: [
      { type: 'router', position: { x: 400, y: 50 }, data: { label: '核心路由器', ip: '10.0.0.1' } },
      { type: 'switch', position: { x: 250, y: 180 }, data: { label: '部门A交换机' } },
      { type: 'switch', position: { x: 550, y: 180 }, data: { label: '部门B交换机' } },
      { type: 'pc', position: { x: 150, y: 320 }, data: { label: 'A-PC1', ip: '10.0.1.10' } },
      { type: 'pc', position: { x: 350, y: 320 }, data: { label: 'A-PC2', ip: '10.0.1.11' } },
      { type: 'pc', position: { x: 450, y: 320 }, data: { label: 'B-PC1', ip: '10.0.2.10' } },
      { type: 'pc', position: { x: 650, y: 320 }, data: { label: 'B-PC2', ip: '10.0.2.11' } },
      { type: 'server', position: { x: 400, y: 450 }, data: { label: '文件服务器', ip: '10.0.0.100' } },
    ],
    connections: [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [0, 7]],
  },
  {
    id: 'star-topology',
    name: '星型拓扑',
    description: '经典星型网络结构',
    icon: Star,
    nodes: [
      { type: 'switch', position: { x: 400, y: 200 }, data: { label: '中心交换机' } },
      { type: 'pc', position: { x: 400, y: 50 }, data: { label: 'PC-1', ip: '192.168.1.10' } },
      { type: 'pc', position: { x: 550, y: 120 }, data: { label: 'PC-2', ip: '192.168.1.11' } },
      { type: 'pc', position: { x: 550, y: 280 }, data: { label: 'PC-3', ip: '192.168.1.12' } },
      { type: 'pc', position: { x: 400, y: 350 }, data: { label: 'PC-4', ip: '192.168.1.13' } },
      { type: 'pc', position: { x: 250, y: 280 }, data: { label: 'PC-5', ip: '192.168.1.14' } },
      { type: 'pc', position: { x: 250, y: 120 }, data: { label: 'PC-6', ip: '192.168.1.15' } },
    ],
    connections: [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6]],
  },
  {
    id: 'client-server',
    name: '客户端-服务器',
    description: '典型 C/S 架构',
    icon: Network,
    nodes: [
      { type: 'server', position: { x: 400, y: 80 }, data: { label: 'Web 服务器', ip: '192.168.1.100' } },
      { type: 'switch', position: { x: 400, y: 220 }, data: { label: '交换机' } },
      { type: 'pc', position: { x: 200, y: 350 }, data: { label: '客户端 1', ip: '192.168.1.10' } },
      { type: 'pc', position: { x: 400, y: 350 }, data: { label: '客户端 2', ip: '192.168.1.11' } },
      { type: 'pc', position: { x: 600, y: 350 }, data: { label: '客户端 3', ip: '192.168.1.12' } },
    ],
    connections: [[0, 1], [1, 2], [1, 3], [1, 4]],
  },
];

export default function TemplateSelector() {
  const { reset, addNode, addEdge, addLog } = useTopologyStore();

  const loadTemplate = (template: Template) => {
    // 先重置
    reset();

    // 创建节点 ID 映射
    const nodeIds: string[] = [];

    // 添加节点
    template.nodes.forEach((nodeConfig, index) => {
      // 使用 setTimeout 确保节点按顺序添加
      setTimeout(() => {
        addNode(nodeConfig.type, nodeConfig.position);
      }, index * 50);
    });

    // 延迟添加连接
    setTimeout(() => {
      const { nodes } = useTopologyStore.getState();
      
      template.connections.forEach(([sourceIdx, targetIdx], connIndex) => {
        setTimeout(() => {
          const sourceNode = nodes[sourceIdx];
          const targetNode = nodes[targetIdx];
          
          if (sourceNode && targetNode) {
            addEdge({
              source: sourceNode.id,
              target: targetNode.id,
              sourceHandle: null,
              targetHandle: null,
            });
          }
        }, connIndex * 50);
      });
    }, template.nodes.length * 50 + 100);

    toast.success(`已加载模板: ${template.name}`);
    addLog({
      type: 'info',
      message: `加载了 "${template.name}" 模板`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-white font-mono text-sm"
        >
          <Layers className="w-4 h-4 mr-1.5" />
          模板
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 glass-panel border-border/50">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          选择预设拓扑模板
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <DropdownMenuItem
              key={template.id}
              onClick={() => loadTemplate(template)}
              className="cursor-pointer"
            >
              <Icon className="w-4 h-4 mr-2 text-cyan-400" />
              <div className="flex-1">
                <p className="text-sm">{template.name}</p>
                <p className="text-xs text-muted-foreground">{template.description}</p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
