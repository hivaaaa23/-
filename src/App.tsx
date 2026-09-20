/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NavigationTab } from './types';
import { 
  PARTS_DATA, 
  ASSEMBLY_STEPS, 
  BIOS_BEEP_CODES, 
  TROUBLESHOOTING_SCENARIOS, 
  QUIZZES_DATA, 
  EDUCATIONAL_RESOURCES 
} from './data/hardwareData';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { PartsView } from './components/PartsView';
import { PartDetailView } from './components/PartDetailView';
import { AssemblyGuideView } from './components/AssemblyGuideView';
import { WorkshopView } from './components/WorkshopView';
import { TroubleshootingView } from './components/TroubleshootingView';
import { QuizzesView } from './components/QuizzesView';
import { ResourcesView } from './components/ResourcesView';
import { ChatAssistant } from './components/ChatAssistant';
import { SearchModal } from './components/SearchModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [selectedPartId, setSelectedPartId] = useState<string>('motherboard');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;
    const tabParam = params.get('tab');
    const partParam = params.get('part') || params.get('id');

    if (partParam) {
      setSelectedPartId(partParam);
      setCurrentTab('part-detail');
    } else if (tabParam) {
      setCurrentTab(tabParam as NavigationTab);
    } else if (path.includes('parts')) {
      setCurrentTab('parts');
    } else if (path.includes('workshop') || path.includes('assembly')) {
      setCurrentTab('workshop');
    }
  }, []);

  const selectedPart = PARTS_DATA.find(p => p.id === selectedPartId) || PARTS_DATA[0];
  const motherboardPart = PARTS_DATA.find(p => p.id === 'motherboard') || PARTS_DATA[0];

  const handleSelectPart = (partId: string) => {
    setSelectedPartId(partId);
    setCurrentTab('part-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: NavigationTab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f5f8] text-[#1a1d24]">
      {/* Top Navbar with RTL Support & Learning Progress */}
      <Navbar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        onOpenSearch={() => setIsSearchOpen(true)}
        progressPercent={25}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'home' && (
          <HomeView
            onTabChange={handleTabChange}
            onSelectPart={handleSelectPart}
            motherboardPart={motherboardPart}
          />
        )}

        {currentTab === 'parts' && (
          <PartsView
            parts={PARTS_DATA}
            onSelectPart={handleSelectPart}
          />
        )}

        {currentTab === 'part-detail' && (
          <PartDetailView
            part={selectedPart}
            onSelectPart={handleSelectPart}
            onBackToParts={() => handleTabChange('parts')}
          />
        )}

        {currentTab === 'workshop' && (
          <WorkshopView
            parts={PARTS_DATA}
          />
        )}

        {currentTab === 'assembly' && (
          <AssemblyGuideView
            steps={ASSEMBLY_STEPS}
          />
        )}

        {currentTab === 'troubleshooting' && (
          <TroubleshootingView
            onNavigateToPart={(partId) => {
              setSelectedPartId(partId);
              setCurrentTab('part-detail');
            }}
          />
        )}

        {currentTab === 'quizzes' && (
          <QuizzesView
            quizzes={QUIZZES_DATA}
            onNavigateToPart={(partId) => {
              setSelectedPartId(partId);
              setCurrentTab('part-detail');
            }}
          />
        )}

        {currentTab === 'resources' && (
          <ResourcesView
            resources={EDUCATIONAL_RESOURCES}
          />
        )}
      </main>

      {/* Global Quick Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        parts={PARTS_DATA}
        steps={ASSEMBLY_STEPS}
        scenarios={TROUBLESHOOTING_SCENARIOS}
        beepCodes={BIOS_BEEP_CODES}
        onNavigate={(tab, extraId) => {
          if (extraId) {
            setSelectedPartId(extraId);
          }
          setCurrentTab(tab);
        }}
      />

      {/* Persian Hardware AI Tutor Chat */}
      <ChatAssistant />

      {/* Footer */}
      <footer className="border-t border-[#d8dce4] bg-white/70 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800">HardwareLab (آزمایشگاه سخت‌افزار)</span>
            <span>—</span>
            <span>سامانه آموزش تعاملی سخت‌افزار و کارگاه مونتاژ رایانه</span>
          </div>
          <div className="font-mono text-gray-400 text-[11px]">
            Google model-viewer • Three.js • React • Tailwind
          </div>
        </div>
      </footer>
    </div>
  );
}
