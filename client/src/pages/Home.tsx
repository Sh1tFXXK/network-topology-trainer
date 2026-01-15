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

export default function Home() {
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
    </div>
    </>
  );
}
