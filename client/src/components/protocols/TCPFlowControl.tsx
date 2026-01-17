import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  Activity, 
  ArrowRight,
  ArrowLeftRight,
  Gauge,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Info
} from 'lucide-react';

// TCP段
interface TCPSegment {
  seq: number;
  ack: number;
  data: string;
  flags: string[];
  window: number;
  sent: boolean;
  acked: boolean;
  retransmit: boolean;
}

// 拥塞控制状态
interface CongestionState {
  cwnd: number;          // 拥塞窗口
  ssthresh: number;      // 慢启动阈值
  rtt: number;           // 往返时间
  phase: 'slow-start' | 'congestion-avoidance' | 'fast-recovery';
  dupAcks: number;       // 重复ACK计数
}

// 滑动窗口状态
interface WindowState {
  sendBase: number;      // 发送窗口基序号
  nextSeq: number;       // 下一个待发送序号
  rwnd: number;          // 接收窗口
  cwnd: number;          // 拥塞窗口
  effectiveWindow: number; // 有效窗口
}

interface TCPFlowControlProps {
  onStateChange?: (state: CongestionState) => void;
}

export const TCPFlowControl: React.FC<TCPFlowControlProps> = ({ onStateChange }) => {
  const [activeTab, setActiveTab] = useState('sliding-window');
  const [isRunning, setIsRunning] = useState(false);
  
  // 滑动窗口状态
  const [windowState, setWindowState] = useState<WindowState>({
    sendBase: 0,
    nextSeq: 0,
    rwnd: 10,
    cwnd: 4,
    effectiveWindow: 4
  });
  
  // 拥塞控制状态
  const [congestionState, setCongestionState] = useState<CongestionState>({
    cwnd: 1,
    ssthresh: 16,
    rtt: 100,
    phase: 'slow-start',
    dupAcks: 0
  });
  
  // 拥塞窗口历史 (用于绘图)
  const [cwndHistory, setCwndHistory] = useState<number[]>([1]);
  
  // TCP段列表
  const [segments, setSegments] = useState<TCPSegment[]>([]);
  
  // 模拟时间
  const [time, setTime] = useState(0);

  // 滑动窗口演示
  const runSlidingWindowDemo = async () => {
    setIsRunning(true);
    setSegments([]);
    setWindowState({
      sendBase: 0,
      nextSeq: 0,
      rwnd: 10,
      cwnd: 4,
      effectiveWindow: 4
    });

    // 模拟发送数据
    for (let i = 0; i < 12; i++) {
      if (!isRunning) break;
      
      // 发送段
      const newSegment: TCPSegment = {
        seq: i,
        ack: 0,
        data: `Data ${i}`,
        flags: ['PSH', 'ACK'],
        window: 10,
        sent: true,
        acked: false,
        retransmit: false
      };
      
      setSegments(prev => [...prev, newSegment]);
      setWindowState(prev => ({
        ...prev,
        nextSeq: i + 1
      }));
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 模拟ACK (有一定延迟)
      if (i > 0 && i % 2 === 0) {
        setSegments(prev => prev.map((seg, idx) => 
          idx < i - 1 ? { ...seg, acked: true } : seg
        ));
        setWindowState(prev => ({
          ...prev,
          sendBase: i - 1,
          effectiveWindow: Math.min(prev.rwnd, prev.cwnd)
        }));
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setIsRunning(false);
  };

  // 拥塞控制演示
  const runCongestionDemo = async () => {
    setIsRunning(true);
    setCwndHistory([1]);
    setCongestionState({
      cwnd: 1,
      ssthresh: 16,
      rtt: 100,
      phase: 'slow-start',
      dupAcks: 0
    });
    setTime(0);

    let cwnd = 1;
    let ssthresh = 16;
    let phase: 'slow-start' | 'congestion-avoidance' | 'fast-recovery' = 'slow-start';
    const history: number[] = [1];

    for (let t = 1; t <= 30; t++) {
      if (!isRunning) break;
      
      setTime(t);
      
      // 模拟丢包事件 (在t=12时)
      if (t === 12) {
        ssthresh = Math.max(cwnd / 2, 2);
        cwnd = 1;
        phase = 'slow-start';
        setCongestionState({
          cwnd,
          ssthresh,
          rtt: 100,
          phase,
          dupAcks: 0
        });
      }
      // 模拟3个重复ACK (在t=22时)
      else if (t === 22) {
        ssthresh = Math.max(cwnd / 2, 2);
        cwnd = ssthresh + 3;
        phase = 'fast-recovery';
        setCongestionState({
          cwnd,
          ssthresh,
          rtt: 100,
          phase,
          dupAcks: 3
        });
      }
      else if (t === 24 && phase === 'fast-recovery') {
        cwnd = ssthresh;
        phase = 'congestion-avoidance';
        setCongestionState({
          cwnd,
          ssthresh,
          rtt: 100,
          phase,
          dupAcks: 0
        });
      }
      else {
        // 正常增长
        if (phase === 'slow-start') {
          cwnd = cwnd * 2; // 指数增长
          if (cwnd >= ssthresh) {
            phase = 'congestion-avoidance';
          }
        } else if (phase === 'congestion-avoidance') {
          cwnd = cwnd + 1; // 线性增长
        }
        
        setCongestionState({
          cwnd,
          ssthresh,
          rtt: 100,
          phase,
          dupAcks: 0
        });
      }
      
      history.push(cwnd);
      setCwndHistory([...history]);
      onStateChange?.({ cwnd, ssthresh, rtt: 100, phase, dupAcks: 0 });
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunning(false);
  };

  // 重置
  const reset = () => {
    setIsRunning(false);
    setSegments([]);
    setWindowState({
      sendBase: 0,
      nextSeq: 0,
      rwnd: 10,
      cwnd: 4,
      effectiveWindow: 4
    });
    setCongestionState({
      cwnd: 1,
      ssthresh: 16,
      rtt: 100,
      phase: 'slow-start',
      dupAcks: 0
    });
    setCwndHistory([1]);
    setTime(0);
  };

  // 阶段颜色
  const phaseColors: Record<string, string> = {
    'slow-start': 'bg-green-500/20 text-green-400 border-green-500/30',
    'congestion-avoidance': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'fast-recovery': 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  };

  const phaseNames: Record<string, string> = {
    'slow-start': '慢启动',
    'congestion-avoidance': '拥塞避免',
    'fast-recovery': '快速恢复'
  };

  return (
    <Card className="bg-slate-900/90 border-yellow-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-yellow-400">
          <Activity className="w-5 h-5" />
          TCP流量控制与拥塞控制
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="sliding-window" className="text-xs">
              <ArrowLeftRight className="w-3 h-3 mr-1" />
              滑动窗口
            </TabsTrigger>
            <TabsTrigger value="congestion" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              拥塞控制
            </TabsTrigger>
            <TabsTrigger value="algorithms" className="text-xs">
              <Gauge className="w-3 h-3 mr-1" />
              控制算法
            </TabsTrigger>
            <TabsTrigger value="reliable" className="text-xs">
              <Activity className="w-3 h-3 mr-1" />
              可靠传输
            </TabsTrigger>
          </TabsList>

          {/* 滑动窗口 */}
          <TabsContent value="sliding-window" className="mt-0">
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                滑动窗口机制实现流量控制，防止发送方发送过快导致接收方缓冲区溢出
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={runSlidingWindowDemo}
                  disabled={isRunning}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  演示滑动窗口
                </Button>
                <Button 
                  variant="outline"
                  onClick={reset}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  重置
                </Button>
              </div>

              {/* 窗口状态 */}
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="bg-slate-800/50 rounded p-2 text-center">
                  <div className="text-slate-500">发送基序号</div>
                  <div className="text-lg font-mono text-cyan-400">{windowState.sendBase}</div>
                </div>
                <div className="bg-slate-800/50 rounded p-2 text-center">
                  <div className="text-slate-500">下一序号</div>
                  <div className="text-lg font-mono text-green-400">{windowState.nextSeq}</div>
                </div>
                <div className="bg-slate-800/50 rounded p-2 text-center">
                  <div className="text-slate-500">接收窗口</div>
                  <div className="text-lg font-mono text-yellow-400">{windowState.rwnd}</div>
                </div>
                <div className="bg-slate-800/50 rounded p-2 text-center">
                  <div className="text-slate-500">有效窗口</div>
                  <div className="text-lg font-mono text-purple-400">{windowState.effectiveWindow}</div>
                </div>
              </div>

              {/* 窗口可视化 */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="text-xs text-slate-400 mb-2">发送窗口可视化</div>
                <div className="flex gap-1 overflow-x-auto pb-2">
                  {Array.from({ length: 16 }, (_, i) => {
                    const isAcked = i < windowState.sendBase;
                    const isSent = i < windowState.nextSeq;
                    const isInWindow = i >= windowState.sendBase && i < windowState.sendBase + windowState.effectiveWindow;
                    
                    return (
                      <motion.div
                        key={i}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`w-8 h-8 rounded flex items-center justify-center text-xs font-mono border ${
                          isAcked 
                            ? 'bg-green-500/30 border-green-500/50 text-green-400' 
                            : isSent 
                            ? 'bg-yellow-500/30 border-yellow-500/50 text-yellow-400'
                            : isInWindow
                            ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                            : 'bg-slate-700/30 border-slate-600 text-slate-500'
                        }`}
                      >
                        {i}
                      </motion.div>
                    );
                  })}
                </div>
                <div className="flex gap-4 text-[10px] mt-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500/30 rounded" />
                    <span className="text-slate-400">已确认</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-500/30 rounded" />
                    <span className="text-slate-400">已发送未确认</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500/20 rounded" />
                    <span className="text-slate-400">可发送</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-slate-700/30 rounded" />
                    <span className="text-slate-400">不可发送</span>
                  </div>
                </div>
              </div>

              {/* 公式说明 */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                <div className="text-xs font-medium text-slate-300 mb-2">有效窗口计算</div>
                <code className="text-sm text-cyan-400">
                  EffectiveWindow = min(rwnd, cwnd) - (NextSeqNum - SendBase)
                </code>
                <p className="text-xs text-slate-500 mt-2">
                  有效窗口 = min(接收窗口, 拥塞窗口) - 已发送未确认的数据量
                </p>
              </div>
            </div>
          </TabsContent>

          {/* 拥塞控制 */}
          <TabsContent value="congestion" className="mt-0">
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                TCP拥塞控制通过调整拥塞窗口(cwnd)来避免网络拥塞
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={runCongestionDemo}
                  disabled={isRunning}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  演示拥塞控制
                </Button>
                <Button 
                  variant="outline"
                  onClick={reset}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  重置
                </Button>
              </div>

              {/* 当前状态 */}
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="bg-slate-800/50 rounded p-2 text-center">
                  <div className="text-slate-500">拥塞窗口 cwnd</div>
                  <div className="text-lg font-mono text-cyan-400">{congestionState.cwnd}</div>
                </div>
                <div className="bg-slate-800/50 rounded p-2 text-center">
                  <div className="text-slate-500">阈值 ssthresh</div>
                  <div className="text-lg font-mono text-yellow-400">{congestionState.ssthresh}</div>
                </div>
                <div className="bg-slate-800/50 rounded p-2 text-center">
                  <div className="text-slate-500">RTT</div>
                  <div className="text-lg font-mono text-green-400">{congestionState.rtt}ms</div>
                </div>
                <div className="bg-slate-800/50 rounded p-2 text-center">
                  <div className="text-slate-500">当前阶段</div>
                  <Badge className={`${phaseColors[congestionState.phase]} text-[10px]`}>
                    {phaseNames[congestionState.phase]}
                  </Badge>
                </div>
              </div>

              {/* cwnd变化图 */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="text-xs text-slate-400 mb-2">拥塞窗口变化 (时间: {time})</div>
                <div className="h-32 flex items-end gap-1">
                  {cwndHistory.map((cwnd, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.min(cwnd * 6, 100)}%` }}
                      className={`flex-1 min-w-[4px] rounded-t ${
                        i === cwndHistory.length - 1 
                          ? 'bg-cyan-500' 
                          : 'bg-cyan-500/50'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>0</span>
                  <span>时间 (RTT)</span>
                  <span>{cwndHistory.length - 1}</span>
                </div>
              </div>

              {/* 事件说明 */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-red-500/10 rounded p-2 border border-red-500/30">
                  <div className="flex items-center gap-1 text-red-400 mb-1">
                    <AlertTriangle className="w-3 h-3" />
                    超时丢包 (t=12)
                  </div>
                  <p className="text-slate-400">
                    ssthresh = cwnd/2, cwnd = 1, 重新慢启动
                  </p>
                </div>
                <div className="bg-orange-500/10 rounded p-2 border border-orange-500/30">
                  <div className="flex items-center gap-1 text-orange-400 mb-1">
                    <TrendingDown className="w-3 h-3" />
                    3个重复ACK (t=22)
                  </div>
                  <p className="text-slate-400">
                    ssthresh = cwnd/2, cwnd = ssthresh+3, 快速恢复
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 控制算法 */}
          <TabsContent value="algorithms" className="mt-0">
            <div className="space-y-3">
              <div className="text-xs text-slate-400 mb-2">
                TCP拥塞控制的四个核心算法
              </div>
              
              {/* 慢启动 */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">慢启动 (Slow Start)</span>
                </div>
                <p className="text-xs text-slate-300 mb-2">
                  初始cwnd=1，每收到一个ACK，cwnd翻倍（指数增长）
                </p>
                <code className="text-[11px] text-cyan-400 bg-slate-900/50 px-2 py-1 rounded block">
                  cwnd = cwnd × 2 (每个RTT)
                </code>
                <p className="text-xs text-slate-500 mt-2">
                  当cwnd ≥ ssthresh时，进入拥塞避免阶段
                </p>
              </div>

              {/* 拥塞避免 */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-400">拥塞避免 (Congestion Avoidance)</span>
                </div>
                <p className="text-xs text-slate-300 mb-2">
                  cwnd线性增长，每个RTT增加1个MSS
                </p>
                <code className="text-[11px] text-cyan-400 bg-slate-900/50 px-2 py-1 rounded block">
                  cwnd = cwnd + 1 (每个RTT)
                </code>
                <p className="text-xs text-slate-500 mt-2">
                  AIMD: 加性增，乘性减
                </p>
              </div>

              {/* 快速重传 */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-yellow-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRight className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">快速重传 (Fast Retransmit)</span>
                </div>
                <p className="text-xs text-slate-300 mb-2">
                  收到3个重复ACK时，立即重传丢失的段，不等待超时
                </p>
                <p className="text-xs text-slate-500">
                  减少等待时间，提高传输效率
                </p>
              </div>

              {/* 快速恢复 */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-orange-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <RotateCcw className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-medium text-orange-400">快速恢复 (Fast Recovery)</span>
                </div>
                <p className="text-xs text-slate-300 mb-2">
                  3个重复ACK触发：ssthresh = cwnd/2, cwnd = ssthresh + 3
                </p>
                <code className="text-[11px] text-cyan-400 bg-slate-900/50 px-2 py-1 rounded block">
                  收到新ACK后: cwnd = ssthresh, 进入拥塞避免
                </code>
              </div>
            </div>
          </TabsContent>

          {/* 可靠传输 */}
          <TabsContent value="reliable" className="mt-0">
            <div className="space-y-3">
              <div className="text-xs text-slate-400 mb-2">
                TCP通过多种机制保证可靠传输
              </div>
              
              {/* 序列号和确认号 */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                <div className="text-sm font-medium text-cyan-400 mb-2">序列号与确认号</div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-slate-400 mb-1">序列号 (Sequence Number)</div>
                    <p className="text-slate-300">
                      标识发送数据的字节位置，用于数据排序和去重
                    </p>
                  </div>
                  <div>
                    <div className="text-slate-400 mb-1">确认号 (Acknowledgment Number)</div>
                    <p className="text-slate-300">
                      期望收到的下一个字节序号，累积确认
                    </p>
                  </div>
                </div>
              </div>

              {/* 超时重传 */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                <div className="text-sm font-medium text-yellow-400 mb-2">超时重传 (Timeout Retransmission)</div>
                <p className="text-xs text-slate-300 mb-2">
                  发送数据后启动定时器，超时未收到ACK则重传
                </p>
                <code className="text-[11px] text-cyan-400 bg-slate-900/50 px-2 py-1 rounded block">
                  RTO = SRTT + 4 × RTTVAR
                </code>
                <p className="text-xs text-slate-500 mt-1">
                  RTO: 重传超时时间, SRTT: 平滑RTT, RTTVAR: RTT变化
                </p>
              </div>

              {/* 选择性确认 */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                <div className="text-sm font-medium text-green-400 mb-2">选择性确认 (SACK)</div>
                <p className="text-xs text-slate-300 mb-2">
                  接收方告知发送方已收到的非连续数据块
                </p>
                <p className="text-xs text-slate-500">
                  允许发送方只重传丢失的段，而非所有后续段
                </p>
              </div>

              {/* 校验和 */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                <div className="text-sm font-medium text-purple-400 mb-2">校验和 (Checksum)</div>
                <p className="text-xs text-slate-300 mb-2">
                  检测数据在传输过程中是否发生错误
                </p>
                <p className="text-xs text-slate-500">
                  计算范围: 伪首部 + TCP首部 + 数据
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TCPFlowControl;
