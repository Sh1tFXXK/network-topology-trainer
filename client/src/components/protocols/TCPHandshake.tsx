/**
 * TCP 三次握手可视化组件
 * 设计风格：赛博朋克科技风 - 深色背景 + 霓虹高亮 + 动画效果
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Server, ArrowRight, ArrowLeft, CheckCircle2, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HandshakeStep {
  id: number;
  name: string;
  direction: 'client-to-server' | 'server-to-client';
  flags: string;
  seq?: number;
  ack?: number;
  description: string;
  detail: string;
}

const handshakeSteps: HandshakeStep[] = [
  {
    id: 1,
    name: '第一次握手',
    direction: 'client-to-server',
    flags: 'SYN',
    seq: 100,
    description: '客户端发送 SYN 包',
    detail: '客户端向服务器发送一个 SYN（同步序列号）标志的数据包，表示请求建立连接。此时客户端进入 SYN_SENT 状态。'
  },
  {
    id: 2,
    name: '第二次握手',
    direction: 'server-to-client',
    flags: 'SYN + ACK',
    seq: 300,
    ack: 101,
    description: '服务器回复 SYN+ACK 包',
    detail: '服务器收到 SYN 后，回复一个 SYN+ACK 包，表示同意建立连接并确认收到客户端的 SYN。服务器进入 SYN_RCVD 状态。'
  },
  {
    id: 3,
    name: '第三次握手',
    direction: 'client-to-server',
    flags: 'ACK',
    ack: 301,
    description: '客户端发送 ACK 包',
    detail: '客户端收到 SYN+ACK 后，发送 ACK 确认包。此时双方都进入 ESTABLISHED 状态，连接建立完成，可以开始传输数据。'
  }
];

export default function TCPHandshake() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentStep < handshakeSteps.length) {
      timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 2000);
    } else if (currentStep >= handshakeSteps.length) {
      setIsPlaying(false);
      setIsComplete(true);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep]);

  const handlePlay = () => {
    if (isComplete) {
      setCurrentStep(0);
      setIsComplete(false);
    }
    setIsPlaying(true);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setIsComplete(false);
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex + 1);
    setIsPlaying(false);
  };

  return (
    <div className="space-y-6">
      {/* 标题区域 */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-cyan-400 font-mono">TCP 三次握手</h2>
        <p className="text-muted-foreground">Three-Way Handshake</p>
      </div>

      {/* 可视化区域 */}
      <div className="relative bg-card/50 rounded-xl border border-cyan-500/30 p-8 overflow-hidden">
        {/* 背景网格 */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: 'linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />
        </div>

        {/* 客户端和服务器 */}
        <div className="relative flex justify-between items-start">
          {/* 客户端 */}
          <div className="flex flex-col items-center space-y-3 z-10">
            <motion.div 
              className="w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-xl border-2 border-cyan-500 flex items-center justify-center"
              animate={{
                boxShadow: currentStep > 0 ? '0 0 30px rgba(0,255,255,0.5)' : '0 0 10px rgba(0,255,255,0.2)'
              }}
            >
              <Monitor className="w-12 h-12 text-cyan-400" />
            </motion.div>
            <span className="text-cyan-400 font-mono font-bold">客户端</span>
            <span className="text-xs text-muted-foreground">Client</span>
            <div className="text-xs font-mono text-cyan-300/70 mt-2">
              {currentStep === 0 && 'CLOSED'}
              {currentStep === 1 && 'SYN_SENT'}
              {currentStep >= 2 && currentStep < 3 && 'SYN_SENT'}
              {currentStep >= 3 && 'ESTABLISHED'}
            </div>
          </div>

          {/* 中间连接线和数据包 */}
          <div className="flex-1 relative h-48 mx-8">
            {/* 连接线 */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500/50 via-cyan-400/30 to-green-500/50 transform -translate-y-1/2" />

            {/* 数据包动画 */}
            <AnimatePresence>
              {handshakeSteps.map((step, index) => (
                currentStep > index && (
                  <motion.div
                    key={step.id}
                    className={`absolute top-1/2 transform -translate-y-1/2 ${
                      step.direction === 'client-to-server' ? 'left-0' : 'right-0'
                    }`}
                    initial={{ 
                      x: step.direction === 'client-to-server' ? 0 : 0,
                      opacity: 0,
                      scale: 0.5
                    }}
                    animate={{ 
                      x: step.direction === 'client-to-server' ? 'calc(100% + 50px)' : 'calc(-100% - 50px)',
                      opacity: [0, 1, 1, 0.7],
                      scale: 1
                    }}
                    transition={{ 
                      duration: 1.5,
                      ease: "easeInOut"
                    }}
                    style={{
                      top: `${30 + index * 25}%`
                    }}
                  >
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold ${
                      step.direction === 'client-to-server' 
                        ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-400' 
                        : 'bg-green-500/20 border border-green-500 text-green-400'
                    }`}>
                      {step.direction === 'client-to-server' ? (
                        <>
                          <span>{step.flags}</span>
                          <ArrowRight className="w-3 h-3" />
                        </>
                      ) : (
                        <>
                          <ArrowLeft className="w-3 h-3" />
                          <span>{step.flags}</span>
                        </>
                      )}
                    </div>
                  </motion.div>
                )
              ))}
            </AnimatePresence>

            {/* 连接成功标志 */}
            <AnimatePresence>
              {isComplete && (
                <motion.div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-mono font-bold">连接已建立</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 服务器 */}
          <div className="flex flex-col items-center space-y-3 z-10">
            <motion.div 
              className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl border-2 border-green-500 flex items-center justify-center"
              animate={{
                boxShadow: currentStep >= 2 ? '0 0 30px rgba(0,255,0,0.5)' : '0 0 10px rgba(0,255,0,0.2)'
              }}
            >
              <Server className="w-12 h-12 text-green-400" />
            </motion.div>
            <span className="text-green-400 font-mono font-bold">服务器</span>
            <span className="text-xs text-muted-foreground">Server</span>
            <div className="text-xs font-mono text-green-300/70 mt-2">
              {currentStep === 0 && 'LISTEN'}
              {currentStep === 1 && 'LISTEN'}
              {currentStep === 2 && 'SYN_RCVD'}
              {currentStep >= 3 && 'ESTABLISHED'}
            </div>
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex justify-center gap-4 mt-8">
          <Button
            onClick={handlePlay}
            disabled={isPlaying}
            className="bg-cyan-500/20 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/30"
          >
            <Play className="w-4 h-4 mr-2" />
            {isComplete ? '重新播放' : '开始演示'}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="border-muted-foreground/30"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            重置
          </Button>
        </div>
      </div>

      {/* 步骤详情 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {handshakeSteps.map((step, index) => (
          <motion.div
            key={step.id}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              currentStep > index
                ? 'bg-cyan-500/10 border-cyan-500/50'
                : 'bg-card/30 border-border/50 opacity-50'
            }`}
            onClick={() => handleStepClick(index)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-sm ${
                currentStep > index
                  ? 'bg-cyan-500 text-black'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step.id}
              </div>
              <div>
                <h4 className="font-bold text-foreground">{step.name}</h4>
                <span className={`text-xs font-mono ${
                  step.direction === 'client-to-server' ? 'text-cyan-400' : 'text-green-400'
                }`}>
                  {step.flags}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{step.description}</p>
            {currentStep > index && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 pt-3 border-t border-border/50"
              >
                <p className="text-xs text-foreground/80">{step.detail}</p>
                {step.seq !== undefined && (
                  <div className="mt-2 text-xs font-mono text-cyan-300/70">
                    SEQ: {step.seq} {step.ack !== undefined && `| ACK: ${step.ack}`}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* 补充说明 */}
      <div className="bg-card/30 rounded-xl border border-border/50 p-6">
        <h3 className="text-lg font-bold text-cyan-400 mb-4">为什么需要三次握手？</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            <span className="text-cyan-400 font-bold">1. 确认双方收发能力：</span>
            三次握手确保客户端和服务器都能正常发送和接收数据。
          </p>
          <p>
            <span className="text-cyan-400 font-bold">2. 同步序列号：</span>
            双方交换初始序列号（ISN），用于后续数据传输的排序和确认。
          </p>
          <p>
            <span className="text-cyan-400 font-bold">3. 防止历史连接：</span>
            避免已失效的连接请求报文段突然又传到服务器，造成错误。
          </p>
        </div>
      </div>
    </div>
  );
}
