import Header from '@/components/layout/Header';
import NetworkKnowledgeCenterComponent from '@/components/topology/NetworkKnowledgeCenter';

export default function NetworkKnowledgeCenter() {
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header />
      <div className="flex-1 p-6 bg-slate-900 overflow-hidden">
        <div className="w-full h-full glass-panel rounded-2xl overflow-hidden">
          <NetworkKnowledgeCenterComponent />
        </div>
      </div>
    </div>
  );
}
