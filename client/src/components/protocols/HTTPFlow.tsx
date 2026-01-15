/**
 * HTTP 请求响应流程可视化组件
 * 设计风格：赛博朋克科技风
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Server, ArrowRight, ArrowLeft, FileText, Code, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HTTPStep {
  id: number;
  type: 'request' | 'response';
  title: string;
  method?: string;
  status?: number;
  headers: Record<string, string>;
  body?: string;
  description: string;
}

const httpSteps: HTTPStep[] = [
  {
    id: 1,
    type: 'request',
    title: 'HTTP 请求',
    method: 'GET',
    headers: {
      'Host': 'www.example.com',
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'text/html',
      'Connection': 'keep-alive'
    },
    description: '浏览器向服务器发送 HTTP 请求，包含请求方法、路径、头部信息等。'
  },
  {
    id: 2,
    type: 'response',
    title: 'HTTP 响应',
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Content-Length': '1234',
      'Server': 'nginx/1.18.0',
      'Cache-Control': 'max-age=3600'
    },
    body: '<!DOCTYPE html><html>...</html>',
    description: '服务器处理请求后返回响应，包含状态码、响应头和响应体。'
  }
];

const httpMethods = [
  { method: 'GET', description: '获取资源', color: 'text-green-400', usage: '获取网页、图片、API 数据' },
  { method: 'POST', description: '提交数据', color: 'text-yellow-400', usage: '表单提交、文件上传' },
  { method: 'PUT', description: '更新资源', color: 'text-blue-400', usage: '更新用户信息、修改文章' },
  { method: 'DELETE', description: '删除资源', color: 'text-red-400', usage: '删除用户、移除数据' },
  { method: 'PATCH', description: '部分更新', color: 'text-purple-400', usage: '更新部分字段' },
];

const statusCodes = [
  { range: '1xx', name: '信息响应', example: '100 Continue', color: 'text-gray-400' },
  { range: '2xx', name: '成功', example: '200 OK', color: 'text-green-400' },
  { range: '3xx', name: '重定向', example: '301 Moved Permanently', color: 'text-yellow-400' },
  { range: '4xx', name: '客户端错误', example: '404 Not Found', color: 'text-orange-400' },
  { range: '5xx', name: '服务器错误', example: '500 Internal Server Error', color: 'text-red-400' },
];

export default function HTTPFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isHttps, setIsHttps] = useState(false);

  const handleAnimate = () => {
    setCurrentStep(0);
    setTimeout(() => setCurrentStep(1), 500);
    setTimeout(() => setCurrentStep(2), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 标题区域 */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-cyan-400 font-mono">HTTP/HTTPS 协议</h2>
        <p className="text-muted-foreground">超文本传输协议</p>
      </div>

      <Tabs defaultValue="flow" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card/50">
          <TabsTrigger value="flow">请求流程</TabsTrigger>
          <TabsTrigger value="methods">请求方法</TabsTrigger>
          <TabsTrigger value="status">状态码</TabsTrigger>
          <TabsTrigger value="https">HTTPS 加密</TabsTrigger>
        </TabsList>

        <TabsContent value="flow" className="space-y-6">
          {/* HTTP vs HTTPS 切换 */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-4 p-2 bg-card/50 rounded-lg border border-border/50">
              <button
                onClick={() => setIsHttps(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  !isHttps ? 'bg-cyan-500/20 text-cyan-400' : 'text-muted-foreground'
                }`}
              >
                <Unlock className="w-4 h-4" />
                HTTP
              </button>
              <button
                onClick={() => setIsHttps(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  isHttps ? 'bg-green-500/20 text-green-400' : 'text-muted-foreground'
                }`}
              >
                <Lock className="w-4 h-4" />
                HTTPS
              </button>
            </div>
          </div>

          {/* 可视化区域 */}
          <div className="relative bg-card/50 rounded-xl border border-cyan-500/30 p-8">
            <div className="flex justify-between items-center">
              {/* 浏览器 */}
              <div className="flex flex-col items-center space-y-3">
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-xl border-2 border-cyan-500 flex items-center justify-center"
                  animate={{ boxShadow: currentStep >= 1 ? '0 0 20px rgba(0,255,255,0.5)' : 'none' }}
                >
                  <Globe className="w-10 h-10 text-cyan-400" />
                </motion.div>
                <span className="text-cyan-400 font-mono text-sm">浏览器</span>
              </div>

              {/* 中间流程 */}
              <div className="flex-1 relative h-32 mx-8">
                {/* 连接线 */}
                <div className={`absolute top-1/2 left-0 right-0 h-1 transform -translate-y-1/2 ${
                  isHttps ? 'bg-gradient-to-r from-cyan-500 via-green-500 to-green-500' : 'bg-gradient-to-r from-cyan-500 to-green-500'
                }`} />

                {/* HTTPS 加密标志 */}
                {isHttps && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500 rounded-full">
                      <Lock className="w-4 h-4 text-green-400" />
                      <span className="text-xs font-mono text-green-400">TLS 加密</span>
                    </div>
                  </div>
                )}

                {/* 请求动画 */}
                <AnimatePresence>
                  {currentStep >= 1 && (
                    <motion.div
                      className="absolute left-0"
                      style={{ top: '30%' }}
                      initial={{ x: 0, opacity: 0 }}
                      animate={{ x: 'calc(100% - 120px)', opacity: 1 }}
                      transition={{ duration: 1 }}
                    >
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500 rounded-full text-xs font-mono">
                        <span className="text-cyan-400">GET /index.html</span>
                        <ArrowRight className="w-3 h-3 text-cyan-400" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 响应动画 */}
                <AnimatePresence>
                  {currentStep >= 2 && (
                    <motion.div
                      className="absolute right-0"
                      style={{ top: '60%' }}
                      initial={{ x: 0, opacity: 0 }}
                      animate={{ x: 'calc(-100% + 120px)', opacity: 1 }}
                      transition={{ duration: 1 }}
                    >
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500 rounded-full text-xs font-mono">
                        <ArrowLeft className="w-3 h-3 text-green-400" />
                        <span className="text-green-400">200 OK</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 服务器 */}
              <div className="flex flex-col items-center space-y-3">
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl border-2 border-green-500 flex items-center justify-center"
                  animate={{ boxShadow: currentStep >= 2 ? '0 0 20px rgba(0,255,0,0.5)' : 'none' }}
                >
                  <Server className="w-10 h-10 text-green-400" />
                </motion.div>
                <span className="text-green-400 font-mono text-sm">Web 服务器</span>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <Button onClick={handleAnimate} className="bg-cyan-500/20 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/30">
                演示请求流程
              </Button>
            </div>
          </div>

          {/* 请求和响应详情 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {httpSteps.map((step) => (
              <div
                key={step.id}
                className={`p-4 rounded-xl border ${
                  step.type === 'request'
                    ? 'bg-cyan-500/10 border-cyan-500/50'
                    : 'bg-green-500/10 border-green-500/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  {step.type === 'request' ? (
                    <FileText className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <Code className="w-5 h-5 text-green-400" />
                  )}
                  <h4 className={`font-bold ${step.type === 'request' ? 'text-cyan-400' : 'text-green-400'}`}>
                    {step.title}
                  </h4>
                  {step.method && (
                    <span className="px-2 py-0.5 bg-cyan-500/20 rounded text-xs font-mono text-cyan-400">
                      {step.method}
                    </span>
                  )}
                  {step.status && (
                    <span className="px-2 py-0.5 bg-green-500/20 rounded text-xs font-mono text-green-400">
                      {step.status} OK
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
                
                <div className="bg-black/30 rounded-lg p-3 font-mono text-xs">
                  {step.method && (
                    <div className="text-cyan-400 mb-2">
                      {step.method} /index.html HTTP/1.1
                    </div>
                  )}
                  {step.status && (
                    <div className="text-green-400 mb-2">
                      HTTP/1.1 {step.status} OK
                    </div>
                  )}
                  {Object.entries(step.headers).map(([key, value]) => (
                    <div key={key} className="text-muted-foreground">
                      <span className="text-yellow-400">{key}:</span> {value}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="methods" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {httpMethods.map((item) => (
              <div key={item.method} className="p-4 bg-card/50 rounded-xl border border-border/50">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 bg-card rounded font-mono font-bold ${item.color}`}>
                    {item.method}
                  </span>
                </div>
                <p className="text-foreground font-medium mb-2">{item.description}</p>
                <p className="text-sm text-muted-foreground">{item.usage}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <div className="space-y-3">
            {statusCodes.map((item) => (
              <div key={item.range} className="flex items-center gap-4 p-4 bg-card/50 rounded-xl border border-border/50">
                <span className={`text-2xl font-mono font-bold ${item.color}`}>{item.range}</span>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground font-mono">{item.example}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="https" className="space-y-6">
          <div className="bg-card/50 rounded-xl border border-green-500/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-bold text-green-400">HTTPS = HTTP + TLS/SSL</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              HTTPS 在 HTTP 的基础上增加了 TLS（传输层安全）加密，确保数据在传输过程中的机密性和完整性。
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <h4 className="font-bold text-green-400 mb-2">加密</h4>
                <p className="text-sm text-muted-foreground">数据在传输过程中被加密，防止被窃听</p>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <h4 className="font-bold text-green-400 mb-2">完整性</h4>
                <p className="text-sm text-muted-foreground">数据无法被篡改，任何修改都会被检测到</p>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <h4 className="font-bold text-green-400 mb-2">身份验证</h4>
                <p className="text-sm text-muted-foreground">通过证书验证服务器身份，防止中间人攻击</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
