import { useState, useEffect } from 'react';
import MerlinSiteProsetWebV2 from './MerlinSiteProsetWebV2';
import MerlinMobileVoiceFirstDemo from './MerlinMobileVoiceFirstDemo';
import { Monitor, Mic } from 'lucide-react';

const PURPLE = '#534AB7';
const VALID = ['web', 'voice'];

export default function App() {
  const [view, setView] = useState(() => {
    const h = window.location.hash.replace('#', '');
    return VALID.includes(h) ? h : 'voice';
  });
  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.replace('#', '');
      if (VALID.includes(h)) setView(h);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const switchTo = (id) => { setView(id); window.location.hash = id; };

  const tabs = [
    { id: 'web',    label: 'Web · ProSet V2',      icon: Monitor },
    { id: 'voice',  label: 'Mobile · Voice-First', icon: Mic },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F1F5F9' }}>
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between flex-shrink-0" style={{ height: 48 }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: PURPLE }}>
            <span className="text-white font-bold text-[12px]">M</span>
          </div>
          <span className="text-[13px] font-bold text-slate-900">Merlin Site Pro · prototype</span>
          <span className="text-[11px] text-slate-500">PLAT-104</span>
        </div>
        <div className="flex items-center rounded-lg bg-slate-100 p-1">
          {tabs.map(t => {
            const isActive = view === t.id;
            return (
              <button key={t.id} onClick={() => switchTo(t.id)}
                className={'flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-bold transition-colors ' + (isActive ? 'bg-white shadow-sm' : 'text-slate-500')}
                style={{ color: isActive ? PURPLE : undefined }}>
                <t.icon size={13} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {view === 'web'    && <MerlinSiteProsetWebV2 />}
        {view === 'voice'  && <MerlinMobileVoiceFirstDemo />}
      </div>
    </div>
  );
}
