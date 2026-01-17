/**
 * TopologyCanvas - 拓扑画布主组件
 * 
 * Design: Cyberpunk Tech Theme
 * - React Flow 集成
 * - 拖拽添加设备
 * - 自定义边样式
 */

import { useCallback, useRef, type DragEvent } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useTopologyStore, type DeviceType, type DeviceData } from '@/store/topologyStore';
import DeviceNode from './DeviceNode';
import PacketDetails from './PacketDetails';
import PacketAnimation from './PacketAnimation';
import RouterSimulator from './RouterSimulator';
import SwitchSimulator from './SwitchSimulator';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// 自定义节点类型
const nodeTypes = {
  deviceNode: DeviceNode,
};

// 自定义边样式
const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: true,
  style: {
    stroke: '#00d4ff',
    strokeWidth: 2,
  },
};

import { useShallow } from 'zustand/react/shallow';

export default function TopologyCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  const {
    storeNodes,
    storeEdges,
    setStoreNodes,
    setStoreEdges,
    addNode,
    addStoreEdge,
    removeNode,
    removeEdge,
    selectNode,
    selectedNodeId,
    activeSimulator,
  } = useTopologyStore(
    useShallow((state) => ({
      storeNodes: state.nodes,
      storeEdges: state.edges,
      setStoreNodes: state.setNodes,
      setStoreEdges: state.setEdges,
      addNode: state.addNode,
      addStoreEdge: state.addEdge,
      removeNode: state.removeNode,
      removeEdge: state.removeEdge,
      selectNode: state.selectNode,
      selectedNodeId: state.selectedNodeId,
      activeSimulator: state.activeSimulator,
    }))
  );

  // 使用 React Flow 的状态管理
  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);

  // 同步 store 状态到本地状态
  useEffect(() => {
    setNodes(storeNodes);
  }, [storeNodes, setNodes]);

  useEffect(() => {
    setEdges(storeEdges);
  }, [storeEdges, setEdges]);

  // 处理节点变化
  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      onNodesChange(changes);
      
      // 处理删除
      changes.forEach((change) => {
        if (change.type === 'remove') {
          removeNode(change.id);
        }
      });
    },
    [onNodesChange, removeNode]
  );

  // 处理边变化
  const handleEdgesChange = useCallback(
    (changes: Parameters<typeof onEdgesChange>[0]) => {
      onEdgesChange(changes);
      
      // 处理删除
      changes.forEach((change) => {
        if (change.type === 'remove') {
          removeEdge(change.id);
        }
      });
    },
    [onEdgesChange, removeEdge]
  );

  // 处理连接
  const onConnect = useCallback(
    (connection: Connection) => {
      addStoreEdge(connection);
    },
    [addStoreEdge]
  );

  // 处理节点点击
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  // 处理画布点击（取消选择）
  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  // 处理拖放
  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as DeviceType;
      if (!type || !reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left - 60,
        y: event.clientY - reactFlowBounds.top - 40,
      };

      addNode(type, position);
    },
    [addNode]
  );

  // 处理键盘删除
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodeId) {
        removeNode(selectedNodeId);
      }
    },
    [selectedNodeId, removeNode]
  );

  return (
    <div
      ref={reactFlowWrapper}
      className="flex-1 h-full"
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        snapToGrid
        snapGrid={[20, 20]}
        className="cyber-grid"
        proOptions={{ hideAttribution: true }}
      >
        {/* 网格背景 */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(0, 212, 255, 0.15)"
        />

        {/* 控制按钮 */}
        <Controls
          className="!bg-slate-900/80 !border-slate-700 !rounded-lg overflow-hidden"
          showInteractive={false}
        />

        {/* 小地图 */}
        <MiniMap
          className="!bg-slate-900/80 !border-slate-700 !rounded-lg"
          nodeColor={(node) => {
            const data = node.data as DeviceData;
            switch (data.type) {
              case 'router':
                return '#00d4ff';
              case 'switch':
                return '#00ff88';
              case 'pc':
                return '#38bdf8';
              case 'server':
                return '#fbbf24';
              default:
                return '#64748b';
            }
          }}
          maskColor="rgba(10, 14, 23, 0.8)"
        />

        {/* 数据包详情 */}
        <PacketDetails />
        <PacketAnimation />

        {/* 设备模拟器悬浮窗 */}
        <AnimatePresence>
          {activeSimulator.nodeId && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute top-4 right-4 z-50 w-[500px] shadow-2xl"
            >
              {activeSimulator.type === 'router' ? (
                <RouterSimulator 
                  routerId={nodes.find(n => n.id === activeSimulator.nodeId)?.data.label as string}
                  highlightDestination={
                    // 从 PacketDetails 获取目标 IP (如果有)
                    // 这里可以简化，直接传 packet 进去，在组件内解析
                    undefined
                  }
                />
              ) : (
                <SwitchSimulator 
                  switchId={nodes.find(n => n.id === activeSimulator.nodeId)?.data.label as string}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 提示面板 */}
        {nodes.length === 0 && (
          <Panel position="top-center" className="mt-20">
            <div className="glass-panel px-6 py-4 rounded-xl text-center">
              <p className="text-cyan-400 font-mono text-sm mb-2">
                欢迎使用网络拓扑训练器
              </p>
              <p className="text-muted-foreground text-xs">
                从左侧设备库拖拽设备到画布中开始构建网络
              </p>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
