/**
 * Topology Store - 网络拓扑状态管理
 * 
 * Design: Cyberpunk Tech Theme
 * 使用 Zustand 管理网络拓扑的节点、连接和模拟状态
 */

import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { Node, Edge, Connection } from '@xyflow/react';

// 设备类型定义
export type DeviceType = 'router' | 'switch' | 'pc' | 'server';

// 设备数据接口
export interface DeviceData extends Record<string, unknown> {
  label: string;
  type: DeviceType;
  ip?: string;
  mac?: string;
  subnet?: string;
  gateway?: string;
  ports?: PortInfo[];
  description?: string;
}

// 端口信息
export interface PortInfo {
  id: string;
  name: string;
  status: 'up' | 'down';
  speed?: string;
  connectedTo?: string;
}

// 数据包信息
export interface PacketInfo {
  id: string;
  sourceId: string;
  targetId: string;
  protocol: 'ICMP' | 'TCP' | 'UDP' | 'ARP';
  currentNodeId: string;
  path: string[];
  status: 'traveling' | 'arrived' | 'failed';
  layers: {
    application?: string;
    transport?: string;
    network?: string;
    dataLink?: string;
    physical?: string;
  };
}

// 模拟状态
export interface SimulationState {
  isRunning: boolean;
  speed: number; // 1-10
  packets: PacketInfo[];
  logs: SimulationLog[];
}

export interface SimulationLog {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  nodeId?: string;
}

// Store 状态接口
interface TopologyState {
  // 节点和边
  nodes: Node[];
  edges: Edge[];
  
  // 选中状态
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  
  // 模拟状态
  simulation: SimulationState;
  
  // 节点操作
  addNode: (type: DeviceType, position: { x: number; y: number }) => void;
  updateNode: (id: string, data: Partial<DeviceData>) => void;
  removeNode: (id: string) => void;
  setNodes: (nodes: Node[]) => void;
  
  // 边操作
  addEdge: (connection: Connection) => void;
  removeEdge: (id: string) => void;
  setEdges: (edges: Edge[]) => void;
  
  // 选择操作
  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
  
  // 模拟操作
  startSimulation: (sourceId: string, targetId: string, protocol: PacketInfo['protocol']) => void;
  stopSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
  addLog: (log: Omit<SimulationLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  
  // 重置
  reset: () => void;
}

// 生成默认设备数据
const generateDefaultDeviceData = (type: DeviceType): DeviceData => {
  const baseData: Record<DeviceType, Partial<DeviceData>> = {
    router: {
      label: '路由器',
      description: '三层网络设备，负责不同网络之间的数据包转发',
      ip: '192.168.1.1',
      subnet: '255.255.255.0',
      ports: [
        { id: 'eth0', name: 'Ethernet0', status: 'up', speed: '1Gbps' },
        { id: 'eth1', name: 'Ethernet1', status: 'up', speed: '1Gbps' },
      ],
    },
    switch: {
      label: '交换机',
      description: '二层网络设备，负责同一网络内的帧转发',
      mac: 'AA:BB:CC:DD:EE:FF',
      ports: Array.from({ length: 8 }, (_, i) => ({
        id: `port${i}`,
        name: `Port ${i}`,
        status: 'up' as const,
        speed: '1Gbps',
      })),
    },
    pc: {
      label: '计算机',
      description: '终端设备，可以发送和接收数据',
      ip: '192.168.1.100',
      mac: '00:11:22:33:44:55',
      subnet: '255.255.255.0',
      gateway: '192.168.1.1',
    },
    server: {
      label: '服务器',
      description: '提供网络服务的终端设备',
      ip: '192.168.1.200',
      mac: '66:77:88:99:AA:BB',
      subnet: '255.255.255.0',
      gateway: '192.168.1.1',
    },
  };

  return {
    type,
    ...baseData[type],
  } as DeviceData;
};

// 生成随机 MAC 地址
const generateMac = () => {
  return Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
  ).join(':');
};

// 初始状态
const initialState = {
  nodes: [] as Node<DeviceData>[],
  edges: [] as Edge[],
  selectedNodeId: null,
  selectedEdgeId: null,
  simulation: {
    isRunning: false,
    speed: 5,
    packets: [],
    logs: [],
  } as SimulationState,
};

export const useTopologyStore = create<TopologyState>((set, get) => ({
  ...initialState,

  // 添加节点
  addNode: (type, position) => {
    const id = nanoid(8);
    const data = generateDefaultDeviceData(type);
    
    // 为 PC 和服务器生成唯一 MAC
    if (type === 'pc' || type === 'server') {
      data.mac = generateMac();
      // 生成递增的 IP
      const existingNodes = get().nodes.filter(n => n.data.type === type);
      const baseIp = type === 'pc' ? 100 : 200;
      data.ip = `192.168.1.${baseIp + existingNodes.length}`;
    }
    
    const newNode: Node<DeviceData> = {
      id,
      type: 'deviceNode',
      position,
      data,
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
    }));

    get().addLog({
      type: 'info',
      message: `添加了 ${data.label} (${id})`,
      nodeId: id,
    });
  },

  // 更新节点
  updateNode: (id, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    }));
  },

  // 删除节点
  removeNode: (id) => {
    const node = get().nodes.find((n) => n.id === id);
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    }));
    
    if (node) {
      get().addLog({
        type: 'warning',
        message: `删除了 ${node.data.label} (${id})`,
      });
    }
  },

  setNodes: (nodes) => set({ nodes }),

  // 添加边
  addEdge: (connection) => {
    if (!connection.source || !connection.target) return;
    
    const id = nanoid(8);
    const newEdge: Edge = {
      id,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle ?? undefined,
      targetHandle: connection.targetHandle ?? undefined,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#00d4ff', strokeWidth: 2 },
    };

    set((state) => ({
      edges: [...state.edges, newEdge],
    }));

    const sourceNode = get().nodes.find((n) => n.id === connection.source);
    const targetNode = get().nodes.find((n) => n.id === connection.target);
    
    get().addLog({
      type: 'success',
      message: `建立连接: ${sourceNode?.data.label} ↔ ${targetNode?.data.label}`,
    });
  },

  // 删除边
  removeEdge: (id) => {
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== id),
      selectedEdgeId: state.selectedEdgeId === id ? null : state.selectedEdgeId,
    }));
  },

  setEdges: (edges) => set({ edges }),

  // 选择节点
  selectNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),

  // 选择边
  selectEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),

  // 开始模拟
  startSimulation: (sourceId, targetId, protocol) => {
    const { nodes, edges } = get();
    const sourceNode = nodes.find((n) => n.id === sourceId);
    const targetNode = nodes.find((n) => n.id === targetId);

    if (!sourceNode || !targetNode) {
      get().addLog({
        type: 'error',
        message: '无效的源或目标节点',
      });
      return;
    }

    // 简单的路径查找 (BFS)
    const path = findPath(sourceId, targetId, nodes, edges);
    
    if (path.length === 0) {
      get().addLog({
        type: 'error',
        message: `无法找到从 ${sourceNode.data.label} 到 ${targetNode.data.label} 的路径`,
      });
      return;
    }

    const packet: PacketInfo = {
      id: nanoid(8),
      sourceId,
      targetId,
      protocol,
      currentNodeId: sourceId,
      path,
      status: 'traveling',
      layers: {
        application: protocol === 'ICMP' ? 'ICMP Echo Request' : undefined,
        transport: protocol === 'TCP' ? 'TCP SYN' : protocol === 'UDP' ? 'UDP Datagram' : undefined,
        network: `IP: ${sourceNode.data.ip} → ${targetNode.data.ip}`,
        dataLink: `MAC: ${sourceNode.data.mac} → ${targetNode.data.mac}`,
        physical: '电信号/光信号',
      },
    };

    set((state) => ({
      simulation: {
        ...state.simulation,
        isRunning: true,
        packets: [...state.simulation.packets, packet],
      },
    }));

    get().addLog({
      type: 'info',
      message: `开始 ${protocol} 模拟: ${sourceNode.data.label} → ${targetNode.data.label}`,
      nodeId: sourceId,
    });
  },

  // 停止模拟
  stopSimulation: () => {
    set((state) => ({
      simulation: {
        ...state.simulation,
        isRunning: false,
        packets: [],
      },
    }));
    
    get().addLog({
      type: 'info',
      message: '模拟已停止',
    });
  },

  // 设置模拟速度
  setSimulationSpeed: (speed) => {
    set((state) => ({
      simulation: {
        ...state.simulation,
        speed: Math.max(1, Math.min(10, speed)),
      },
    }));
  },

  // 添加日志
  addLog: (log) => {
    const newLog: SimulationLog = {
      ...log,
      id: nanoid(8),
      timestamp: new Date(),
    };

    set((state) => ({
      simulation: {
        ...state.simulation,
        logs: [newLog, ...state.simulation.logs].slice(0, 100), // 保留最近100条
      },
    }));
  },

  // 清除日志
  clearLogs: () => {
    set((state) => ({
      simulation: {
        ...state.simulation,
        logs: [],
      },
    }));
  },

  // 重置
  reset: () => set(initialState),
}));

// 简单的 BFS 路径查找
function findPath(
  sourceId: string,
  targetId: string,
  nodes: Node[],
  edges: Edge[]
): string[] {
  const adjacencyList = new Map<string, string[]>();
  
  // 构建邻接表
  nodes.forEach((node) => {
    adjacencyList.set(node.id, []);
  });
  
  edges.forEach((edge) => {
    adjacencyList.get(edge.source)?.push(edge.target);
    adjacencyList.get(edge.target)?.push(edge.source);
  });

  // BFS
  const queue: string[][] = [[sourceId]];
  const visited = new Set<string>([sourceId]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const current = path[path.length - 1];

    if (current === targetId) {
      return path;
    }

    const neighbors = adjacencyList.get(current) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  return [];
}
