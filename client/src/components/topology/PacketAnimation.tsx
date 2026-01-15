/**
 * PacketAnimation - 数据包动画组件
 * 
 * Design: Cyberpunk Tech Theme
 * - 沿边路径移动的数据包可视化
 * - 霓虹发光效果
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTopologyStore, type PacketInfo } from '@/store/topologyStore';

interface PacketDotProps {
  packet: PacketInfo;
  pathIndex: number;
}

function PacketDot({ packet, pathIndex }: PacketDotProps) {
  const protocolColors: Record<string, string> = {
    ICMP: '#00d4ff',
    TCP: '#00ff88',
    UDP: '#fbbf24',
    ARP: '#f472b6',
  };

  const color = protocolColors[packet.protocol] || '#00d4ff';

  return (
    <motion.div
      className="absolute pointer-events-none z-50"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* 外层发光 */}
      <div
        className="absolute -inset-2 rounded-full blur-md"
        style={{ backgroundColor: color, opacity: 0.5 }}
      />
      {/* 内核 */}
      <div
        className="w-4 h-4 rounded-full relative"
        style={{ backgroundColor: color }}
      >
        <div
          className="absolute inset-0.5 rounded-full"
          style={{ backgroundColor: 'white', opacity: 0.3 }}
        />
      </div>
      {/* 协议标签 */}
      <div
        className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono whitespace-nowrap"
        style={{ backgroundColor: color, color: '#0a0e17' }}
      >
        {packet.protocol}
      </div>
    </motion.div>
  );
}

export default function PacketAnimation() {
  const { simulation, nodes, edges, addLog } = useTopologyStore();
  const [animatingPackets, setAnimatingPackets] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (!simulation.isRunning || simulation.packets.length === 0) {
      setAnimatingPackets(new Map());
      return;
    }

    const interval = setInterval(() => {
      setAnimatingPackets((prev) => {
        const next = new Map(prev);
        
        simulation.packets.forEach((packet) => {
          if (packet.status !== 'traveling') return;
          
          const currentIndex = next.get(packet.id) ?? 0;
          const nextIndex = currentIndex + 1;

          if (nextIndex >= packet.path.length) {
            // 到达目的地
            next.delete(packet.id);
            addLog({
              type: 'success',
              message: `${packet.protocol} 数据包已到达目标`,
              nodeId: packet.targetId,
            });
          } else {
            next.set(packet.id, nextIndex);
            const currentNode = nodes.find((n) => n.id === packet.path[nextIndex]);
            if (currentNode) {
              const data = currentNode.data as { label?: string };
              addLog({
                type: 'info',
                message: `数据包经过 ${data.label}`,
                nodeId: packet.path[nextIndex],
              });
            }
          }
        });

        return next;
      });
    }, 1000 / simulation.speed);

    return () => clearInterval(interval);
  }, [simulation.isRunning, simulation.packets, simulation.speed, nodes, addLog]);

  // 计算数据包位置
  const getPacketPosition = (packet: PacketInfo, pathIndex: number) => {
    const nodeId = packet.path[pathIndex];
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return null;

    return {
      x: node.position.x + 60, // 节点中心
      y: node.position.y + 40,
    };
  };

  return (
    <AnimatePresence>
      {simulation.packets.map((packet) => {
        const pathIndex = animatingPackets.get(packet.id) ?? 0;
        const position = getPacketPosition(packet, pathIndex);
        
        if (!position || packet.status !== 'traveling') return null;

        return (
          <motion.div
            key={packet.id}
            className="absolute pointer-events-none"
            initial={position}
            animate={position}
            transition={{
              duration: 1 / simulation.speed,
              ease: 'easeInOut',
            }}
            style={{
              left: position.x - 8,
              top: position.y - 8,
            }}
          >
            <PacketDot packet={packet} pathIndex={pathIndex} />
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}
