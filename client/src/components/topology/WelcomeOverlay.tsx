/**
 * WelcomeOverlay - 欢迎引导覆盖层
 * 
 * Design: Cyberpunk Tech Theme
 * - 首次访问时显示
 * - 介绍基本操作
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Network, 
  MousePointer2, 
  Link2, 
  Play,
  X,
  ChevronRight
} from 'lucide-react';

const steps = [
  {
    icon: MousePointer2,
    title: '拖拽添加设备',
    description: '从左侧设备库拖拽路由器、交换机、计算机等设备到画布中',
    color: 'text-cyan-400',
  },
  {
    icon: Link2,
    title: '连接设备',
    description: '点击设备的连接点并拖拽到另一个设备来建立网络连接',
    color: 'text-emerald-400',
  },
  {
    icon: Play,
    title: '模拟数据传输',
    description: '在底部控制台选择源和目标设备，开始模拟数据包传输过程',
    color: 'text-amber-400',
  },
];

export default function WelcomeOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // 检查是否首次访问
    const hasVisited = localStorage.getItem('nettrainer-visited');
    if (!hasVisited) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('nettrainer-visited', 'true');
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* 内容卡片 */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-lg mx-4 glass-panel rounded-2xl overflow-hidden"
          >
            {/* 关闭按钮 */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 头部 */}
            <div className="p-6 pb-4 text-center border-b border-border/30">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 mb-4">
                <Network className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white font-mono">
                欢迎使用 <span className="text-cyan-400">Net</span>Trainer
              </h2>
              <p className="text-muted-foreground mt-2">
                交互式网络拓扑学习平台
              </p>
            </div>

            {/* 步骤内容 */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center"
                >
                  {(() => {
                    const step = steps[currentStep];
                    const Icon = step.icon;
                    return (
                      <>
                        <div className={cn(
                          'inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4',
                          'bg-slate-800'
                        )}>
                          <Icon className={cn('w-6 h-6', step.color)} />
                        </div>
                        <h3 className={cn('text-lg font-semibold mb-2', step.color)}>
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {step.description}
                        </p>
                      </>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>

              {/* 步骤指示器 */}
              <div className="flex items-center justify-center gap-2 mt-6">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all',
                      index === currentStep
                        ? 'w-6 bg-cyan-400'
                        : 'bg-slate-600 hover:bg-slate-500'
                    )}
                  />
                ))}
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="p-6 pt-0 flex gap-3">
              <Button
                variant="ghost"
                className="flex-1 text-muted-foreground"
                onClick={handleClose}
              >
                跳过
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500"
                onClick={handleNext}
              >
                {currentStep < steps.length - 1 ? (
                  <>
                    下一步
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  '开始使用'
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
