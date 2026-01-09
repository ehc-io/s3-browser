import { useBrowserStore } from '../../store/browserStore';
import { Header } from './Header';
import { BucketSidebar } from '../sidebar/BucketSidebar';
import { FileBrowser } from '../browser/FileBrowser';
import { InspectorPanel } from '../inspector/InspectorPanel';
import { ResizablePanel } from '../common/ResizablePanel';

export function AppLayout() {
  const { selectedFile, inspectorWidth, setInspectorWidth } = useBrowserStore();

  return (
    <div className="flex flex-col h-screen bg-surface-primary dark:bg-dark-primary text-text-primary-light dark:text-text-primary-dark">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Bucket List */}
        <aside className="w-56 flex-shrink-0 bg-surface-secondary dark:bg-dark-secondary border-r border-border-light dark:border-border-dark overflow-y-auto">
          <BucketSidebar />
        </aside>

        {/* Main Content - File Browser */}
        <main className="flex-1 overflow-hidden">
          <FileBrowser />
        </main>

        {/* Right Sidebar - Inspector Panel (conditional & resizable) */}
        {selectedFile && (
          <ResizablePanel
            width={inspectorWidth}
            minWidth={280}
            maxWidth={600}
            onResize={setInspectorWidth}
            resizeFrom="left"
            className="bg-surface-secondary dark:bg-dark-secondary border-l border-border-light dark:border-border-dark overflow-y-auto"
          >
            <InspectorPanel />
          </ResizablePanel>
        )}
      </div>
    </div>
  );
}
