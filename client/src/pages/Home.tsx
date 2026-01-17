/**
 * Home - 拓扑编辑器主页
 * 
 * Design: Cyberpunk Tech Theme
 * - 三栏布局：设备库 | 画布 | 属性面板
 * - 底部模拟控制台
 */

import Header from '@/components/layout/Header';
import DevicePalette from '@/components/topology/DevicePalette';
import TopologyCanvas from '@/components/topology/TopologyCanvas';
import PropertyPanel from '@/components/topology/PropertyPanel';
import SimulationConsole from '@/components/topology/SimulationConsole';
import WelcomeOverlay from '@/components/topology/WelcomeOverlay';
import NetworkKnowledgeCenter from '@/components/topology/NetworkKnowledgeCenter';
import { useTopologyStore } from '@/store/topologyStore';
import { X } from 'lucide-react';

export default function Home() {
  const { isVisualizationCenterOpen, setVisualizationCenterOpen } = useTopologyStore();

  return (
    <>
    <WelcomeOverlay />
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* 顶部导航 */}
      <Header />

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧设备库 */}
        <DevicePalette />

        {/* 中央区域 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 拓扑画布 */}
          <TopologyCanvas />

          {/* 底部控制台 */}
          <SimulationConsole />
        </div>

        {/* 右侧属性面板 */}
        <PropertyPanel />
      </div>

      {isVisualizationCenterOpen && (
        <div className="fixed inset-0 z-[90]">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setVisualizationCenterOpen(false)}
          />
          <div className="absolute inset-0 p-4 flex items-center justify-center">
            <div
              className="relative w-full max-w-[1200px] h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="关闭可视化中心"
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-200 hover:bg-slate-800"
                onClick={() => setVisualizationCenterOpen(false)}
              >
                <X className="w-4 h-4 mx-auto" />
              </button>
              <NetworkKnowledgeCenter />
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
