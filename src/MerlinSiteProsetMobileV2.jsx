/**
 * MerlinSiteProsetMobileV2.jsx — Mobile counterpart of the ProSet V2 web prototype.
 * Voice-first PLAT-104 capture, mirroring all web sub-modules in mobile UX.
 *
 * Bottom nav (5 items, mic in center as FAB):
 *   Dashboard · On-Site · 🎤 Capture · Reports · AI
 *
 * Sub-modules under On-Site:
 *   Personnel · Deliveries · Safety & Meetings · Incidents & Delays
 *   Inspections · Equipment · Materials · Notes
 */

import React, { useState, useEffect } from 'react';
import {
  Home, ClipboardList, Users, Truck, Wrench, AlertTriangle,
  Calendar, Package, ShieldCheck, Eye, FileText, Settings,
  Mic, Plus, Search, Bell, ChevronDown, ChevronRight, ChevronLeft,
  ArrowRight, X, Check, Sun, MoreHorizontal, CheckCircle2,
  Clock, AlertCircle, AlertOctagon, HardHat, MessageCircle,
  DollarSign, Sparkles, IdCard, Activity, Layers, Box, FolderOpen,
  Receipt, Edit3, Pencil, FileSignature, Camera, Video, Image as ImageIcon,
  Paperclip, Film, StickyNote, Hash, Pin, Shield, UserCheck,
  Send, Mail, Phone, MapPin, Square, Play, Pause, Volume2,
  Download, Share2, Info, BarChart3, Filter, ArrowLeft
} from 'lucide-react';

// ============================================================================
// THEME TOKENS — match web prototype
// ============================================================================
const PURPLE        = '#534AB7';
const PURPLE_DEEP   = '#3B0764';
const PURPLE_LIGHT  = '#EDE9FE';
const SUCCESS       = '#10B981';
const SUCCESS_BG    = '#DCFCE7';
const WARN          = '#F59E0B';
const WARN_BG       = '#FEF3C7';
const DANGER        = '#DC2626';
const DANGER_BG     = '#FECACA';
const INFO_BG       = '#DBEAFE';
const TEXT          = '#0F172A';
const TEXT_MUTED    = '#64748B';
const BORDER        = '#E2E8F0';

const cls = (...x) => x.filter(Boolean).join(' ');
const fmt$ = (v) => '$' + Math.round(v).toLocaleString();
const fmtHrs = (v) => `${v.toFixed(1)}h`;

// ============================================================================
// SEED DATA (mirrors web prototype)
// ============================================================================
const PROJECTS = [
  { id: 'p1', name: 'Lithium Workforce Housing', client: 'Target Construction', address: 'Saddlebrooke, AZ', supervisor: 'Erik Odowd', progress: 6.35, daysIn: 34, daysTotal: 320, type: 'modular',
    weather: { temp: 78, condAM: 'Clear / Sunny', condPM: 'Clear w/ Wind Gusts' },
    modularStats: { setToday: 9, totalSet: 44, remaining: 652, pctComplete: 6.35, panelsSetToday: 12, totalPanelsSet: 88 } },
  { id: 'p2', name: 'Skyline Tower · Phase 2', client: 'Bechtel',  address: 'Pune, MH',         supervisor: 'Rajesh K.',  progress: 42.1,  daysIn: 168, daysTotal: 400, type: 'standard', weather: { temp: 86, condAM: 'Hazy', condPM: 'Hot' } },
  { id: 'p3', name: 'Riverwalk Parkside',       client: 'NextDev', address: 'Indianapolis, IN', supervisor: 'Mary B.',    progress: 18.4,  daysIn: 92,  daysTotal: 500, type: 'modular',  weather: { temp: 71, condAM: 'Cloudy', condPM: 'Light Rain' } },
];

const SEED_PERSONNEL = [
  { id: 1, empId: '101', name: 'Juan Alencastro', role: 'Setter', trade: 'GC', scopeToday: 'Set',    checkIn: '6:30 AM', checkOut: '5:15 PM', hours: 10.75, wageRate: 38, avatar: 'JA', notes: 'Asked about stair-set training Friday with Eric. Strong morning energy.' },
  { id: 2, empId: '134', name: 'Eric Cortez',     role: 'Setter', trade: 'GC', scopeToday: 'Set',    checkIn: '6:30 AM', checkOut: '5:17 PM', hours: 10.78, wageRate: 38, avatar: 'EC', notes: 'Volunteered to pair with Juan on the Friday stair set.' },
  { id: 3, empId: '135', name: 'Carlos Cruz',     role: 'Setter', trade: 'GC', scopeToday: 'Set',    checkIn: '6:30 AM', checkOut: '5:16 PM', hours: 10.77, wageRate: 36, avatar: 'CC' },
  { id: 4, empId: '163', name: 'Mayolo Hernandez',role: 'Setter', trade: 'GC', scopeToday: 'Set',    checkIn: '6:30 AM', checkOut: '5:16 PM', hours: 10.77, wageRate: 36, avatar: 'MH' },
  { id: 5, empId: '288', name: 'Miguel Ortiz',    role: 'Setter', trade: 'GC', scopeToday: 'Set',    checkIn: '6:30 AM', checkOut: '5:16 PM', hours: 10.77, wageRate: 36, avatar: 'MO' },
  { id: 6, empId: '315', name: 'Ricki Andrade',   role: 'Panel',  trade: 'GC', scopeToday: 'Panels', checkIn: '7:00 AM', checkOut: '5:03 PM', hours: 10.05, wageRate: 34, avatar: 'RA' },
  { id: 7, empId: '316', name: 'Carlos Guillen',  role: 'Setter', trade: 'GC', scopeToday: 'Set',    checkIn: '7:00 AM', checkOut: '5:31 PM', hours: 10.52, wageRate: 36, avatar: 'CG' },
  { id: 8, empId: '317', name: 'David Hernandez', role: 'Panel',  trade: 'GC', scopeToday: 'Panels', checkIn: '6:45 AM', checkOut: '5:09 PM', hours: 10.40, wageRate: 34, avatar: 'DH' },
  { id: 9, empId: '318', name: 'Jose Garcia',     role: 'Stitch', trade: 'GC', scopeToday: 'Stitch', checkIn: '6:45 AM', checkOut: '4:50 PM', hours: 10.08, wageRate: 36, avatar: 'JG' },
  { id: 10,empId: '322', name: 'Anthony Marcelja',role: 'Prep',   trade: 'GC', scopeToday: 'Prep',   checkIn: '6:45 AM', checkOut: '4:33 PM', hours: 10.80, wageRate: 32, avatar: 'AM' },
  { id: 11,empId: 'WV1', name: 'Joe Westervelt',  role: 'Sub',    trade: 'Westervelt', scopeToday: 'Sub work', checkIn: '7:00 AM', checkOut: '5:00 PM', hours: 10.0, wageRate: 65, avatar: 'JW', sub: true, notes: 'Arrived 10 min late · gate access slow. Flagged trailer brake squeal at next drop.' },
];

const SEED_EQUIPMENT = [
  { id: 1, name: '45ft Boom Lift',  type: 'Boom lift',     qty: 3, hoursToday: 8.0, dayRate: 410, status: 'ACTIVE',         notes: 'All 3 running. Eric on lift 1, Carlos on 2, Mayolo on 3.' },
  { id: 2, name: 'Crane CT-220',    type: 'Mobile crane',  qty: 1, hoursToday: 6.0, dayRate: 950, status: 'ACTIVE',         notes: 'Hydraulic pressure dipping mid-PM. Operator flagged. Maintenance booked tomorrow.' },
  { id: 3, name: 'JLG Boom Lift',   type: 'Boom lift',     qty: 1, hoursToday: 0,   dayRate: 380, status: 'ACTIVE',         note: 'Received today — 4th unit', notes: 'Operator unfamiliar with new safety lockout · manual requested. Pre-op signed.' },
  { id: 4, name: '10K Forklift',    type: 'Telehandler',   qty: 2, hoursToday: 6.5, dayRate: 320, status: 'ACTIVE' },
  { id: 5, name: 'Mixer M400',      type: 'Concrete mixer',qty: 1, hoursToday: 0,   dayRate: 250, status: 'IN_MAINTENANCE', flag: 'Hydraulic leak', notes: 'Down 4 days. Awaiting pump rebuild kit. ETA Friday.' },
];

const SEED_DELIVERIES = [
  { id: 1, supplier: 'Westervelt Modular', materials: 'Mod D19/786-2',  quantity: 1,  unit: 'mod',    poNumber: 'PO-3042', status: 'Received', date: '7:15 AM',  value: 42000, notes: 'Driver flagged trailer brake squeal — second time. Walkaround at next drop.' },
  { id: 2, supplier: 'Westervelt Modular', materials: 'Mod D19/786-3',  quantity: 1,  unit: 'mod',    poNumber: 'PO-3042', status: 'Received', date: '8:00 AM',  value: 42000 },
  { id: 3, supplier: 'JLG Industries',     materials: '40ft boom lift', quantity: 1,  unit: 'unit',   poNumber: 'PO-4501', status: 'Received', date: '11:00 AM', value: 38500, notes: '4th boom on site. Operator unfamiliar with new safety lockout — manual requested.' },
  { id: 4, supplier: 'BuildMart',          materials: 'Drywall 5/8"',   quantity: 50, unit: 'sheets', poNumber: 'PO-1040', status: 'Damaged',  date: 'Yesterday', value: 750, notes: '4 sheets damaged in transit. BuildMart credit + replacement Wednesday.' },
];

const SEED_INCIDENTS = [
  { id: 'i1', kind: 'INCIDENT', title: 'Crane move mid-day · 786-A2 e-box', severity: 'NEAR_MISS', status: 'RESOLVED', time: '11:30 AM', changeOrderTrigger: true, costImpact: 1850, impactHours: 1.0,
    description: 'Unexpected crane move. 786-A2 stairwell box too wide for corridor. Removed box and cut wire per Dave Ault\'s order.',
    actionTaken: 'Logged on Target HSI with photo evidence. RFI to Westervelt.', reportedBy: 'Erik Odowd',
    notes: 'Crane idle ~1 hr while we cleared. No injuries. Crew was visibly tense after the call.' },
  { id: 'd1', kind: 'DELAY', title: 'Wind shut-down on 10th unit', category: 'Owner directive', status: 'RESOLVED', time: '4:15 PM', changeOrderTrigger: false, costImpact: 850, impactHours: 0.5,
    description: 'Crew ready to set 10th mod. Target Management did not feel comfortable proceeding. PM Decision logged.',
    actionTaken: 'Crew demobilized. Wind cutoff thresholds documented.', reportedBy: 'Erik Odowd',
    notes: 'Crew felt within acceptable level. Owner did not. 10th deferred to tomorrow.' },
];

const SEED_INSPECTIONS = [
  { id: 1, type: 'Module Prep',                  status: 'Pass',           inspector: 'Erik Odowd', date: '9:30 AM',  notes: 'Module Prep inspections noted on HSE, with minimal damage. Photo on file.' },
  { id: 2, type: 'Module 786-A13 review',        status: 'Pass with notes',inspector: 'Erik Odowd', date: '10:15 AM', notes: 'Mod 786-A13 had extra 2x6\'s and additional chases covered with osb. Minor damage to corner post; superficial.' },
];

const SEED_VISITORS = [
  { id: 1, name: 'Chris (Target / Bechtel)', org: 'Target', purpose: 'Boom lift safety meeting', timeIn: '2:00 PM', timeOut: '3:30 PM', notes: 'Chris taking notes — distributing later. Mentioned Bechtel scrutiny continues. Wind cutoff thresholds need to be in writing.' },
];

const SEED_TOOLBOX = [
  { id: 't1', topic: 'Boom lift fall protection · 100% tie-off',         lead: 'Erik Odowd', time: '6:35 AM',  durationMin: 12, attendees: 14, notes: 'Crew engaged. Re-emphasized owner cutoff thresholds. Ricki had a question about double-lanyard config.' },
  { id: 't2', topic: 'High-wind crane operation · Owner cutoff',         lead: 'Erik Odowd', time: '12:30 PM', durationMin: 8,  attendees: 13, notes: 'Documented Target cutoff: 25 mph sustained / 35 mph gust. Mathew Q. + Ana R. signed in late — caught up 1:1.' },
];

const SEED_MATERIALS = [
  { id: 'm1', name: 'Modules · Westervelt',     category: 'Structural', received: 9,   needed: 11,  unit: 'mod',    poNumber: 'PO-3042', value: 462000, status: 'short',   note: '2 short · wind shut-down deferred' },
  { id: 'm2', name: 'Drywall 5/8"',             category: 'Finish',     received: 196, needed: 200, unit: 'sheets', poNumber: 'PO-1040', value: 3920,   status: 'damaged', note: '4 damaged · BuildMart credit pending' },
  { id: 'm3', name: 'Anchor bolts 3/4"',        category: 'Structural', received: 600, needed: 600, unit: 'pcs',    poNumber: 'PO-2210', value: 4200,   status: 'ok',      note: 'Grade 8 confirmed per RFI #42' },
  { id: 'm4', name: 'Stairwell modules',        category: 'Structural', received: 2,   needed: 2,   unit: 'mod',    poNumber: 'PO-3042', value: 84000,  status: 'ok' },
  { id: 'm5', name: 'Sealant · structural',     category: 'Finish',     received: 0,   needed: 48,  unit: 'tubes',  poNumber: 'PO-1108', value: 0,      status: 'pending', note: 'On order · expected Wednesday' },
];

const SEED_NOTES = [
  { id: 'n1', title: 'Yard 3 staging plan revision',          body: 'Reordered units 786-15 → 786-22 in Yard 3 to streamline crane access. Stairwell modules pulled forward.', author: 'Erik Odowd', avatar: 'EO', date: '7:45 AM',  pinned: true,  tags: ['logistics','crane'] },
  { id: 'n2', title: 'Owner walkthrough · 3 PM Thursday',     body: 'Target site visit confirmed. Bring D19 status board + safety log + 786-A2 photo evidence.', author: 'Erik Odowd', avatar: 'EO', date: '11:45 AM', pinned: true,  tags: ['client','meeting','communications'] },
  { id: 'n3', title: 'Lookahead · Dorm 19 Friday Apr 18',     body: 'Keeping with this pace, Dorm 19 set complete in 2 days, expected Friday April 18.', author: 'Erik Odowd', avatar: 'EO', date: '4:30 PM',  pinned: true,  tags: ['lookahead','schedule'] },
  { id: 'n4', title: 'Wind shut-down · PM Decision',          body: '9 mods set, 10th was ready but Target shut us down for wind. We felt within acceptable level. Owner did not feel comfortable.', author: 'Erik Odowd', avatar: 'EO', date: '4:30 PM',  pinned: false, tags: ['communications','client','PM Decision'] },
  { id: 'n5', title: 'JLG cert reminder · Mayolo + Miguel',   body: 'New 4th boom lift requires fresh operator cert. Mayolo + Miguel need recert by Friday — booked refresher via Bechtel safety team.', author: 'Erik Odowd', avatar: 'EO', date: '11:15 AM', pinned: false, tags: ['safety','equipment'] },
  { id: 'n6', title: 'Anchor bolts vendor follow-up',         body: 'BuildMart confirmed 600 anchor bolts received. Next PO 700 pcs scheduled May 12.', author: 'Keirsten McNeely', avatar: 'KM', date: '2:30 PM', pinned: false, tags: ['materials','PO'] },
];

const SEED_COMMENTARY = {
  personnel: [
    { id: 'pc1', time: '6:35 AM',  author: 'Erik Odowd', avatar: 'EO', summary: 'Crew morale strong. Juan + Eric requested cross-training on stair set Friday.', quote: '"Juan and Eric want to learn the stair set… let\'s get them on it Friday."' },
    { id: 'pc2', time: '11:00 AM', author: 'Erik Odowd', avatar: 'EO', summary: 'Mathew Q. out tomorrow AM for medical · Tyler covers prep crew.',                  quote: '"Mathew\'s got a medical thing tomorrow morning, won\'t be in until noon."' },
  ],
  deliveries: [
    { id: 'dc1', time: '7:15 AM',  author: 'Erik Odowd', avatar: 'EO', summary: 'Westervelt driver flagged trailer brake squeal — walkaround next drop.',          quote: '"Driver said the trailer\'s been making a brake noise for two weeks."' },
    { id: 'dc2', time: '11:00 AM', author: 'Erik Odowd', avatar: 'EO', summary: 'JLG operator unfamiliar with new boom safety lockout — manual requested.',        quote: '"The new boom guy from JLG asked for the manual on the safety lockout."' },
  ],
  incidents: [
    { id: 'ic1', time: '4:30 PM',  author: 'Erik Odowd', avatar: 'EO', summary: 'Crew jumpy after wind call. Walked the deck, no issues. Owner emphasized zero-tolerance.', quote: '"Everybody seemed on edge after we got shut down."' },
  ],
  equipment: [
    { id: 'ec1', time: '2:30 PM',  author: 'Erik Odowd', avatar: 'EO', summary: 'Crane CT-220 hydraulic pressure dipped mid-afternoon · maintenance check before tomorrow.', quote: '"Crane operator said pressure was riding low this afternoon."' },
  ],
  materials: [
    { id: 'mc1', time: '8:45 AM',  author: 'Erik Odowd', avatar: 'EO', summary: 'Anchor bolt grade mismatch resolved · vendor confirmed Grade 8 received per RFI #42.', quote: '"Anchor bolts came in correct this drop. RFI 42 closed out."' },
  ],
};

const AUDIO_SUMMARY = {
  durationSec: 38,
  capturedAt: '5:30 PM',
  voice: 'Merlin AI · daily roll-up',
  transcript: 'Today was a 9-mod day on Dorm 19. Crew of 15 logged 248 labor hours, on schedule for Friday completion. One change-order trigger flagged at 11:30 AM — the 786-A2 stairwell e-box was modified per Dave Ault. Wind shut-down on the 10th mod at 4:15 PM, owner-driven, logged as PM Decision. JLG boom lift received, fourth on site. 1 near-miss closed.',
  waveform: [3,5,8,11,14,9,6,4,3,5,7,12,16,20,18,14,10,7,5,9,13,17,15,11,8,6,4,3],
};

const ACTIVITY_TIMELINE = [
  { icon: Users,         tone: 'purple', text: '15 workers checked in',                       when: '6:30 AM' },
  { icon: ShieldCheck,   tone: 'green',  text: 'Toolbox talk · fall protection (14 attendees)',when: '6:35 AM' },
  { icon: Truck,         tone: 'green',  text: 'Mods D19/786-2 + 786-3 received',              when: '7:30 AM' },
  { icon: Wrench,        tone: 'green',  text: 'JLG boom lift received (4th on site)',         when: '11:00 AM' },
  { icon: AlertTriangle, tone: 'amber',  text: '786-A2 e-box mod · CO trigger',                when: '11:30 AM' },
  { icon: AlertOctagon,  tone: 'red',    text: 'Wind shut-down on 10th unit · PM Decision',    when: '4:15 PM' },
];

const FORECAST = [
  { d: 'Mon', t: 78, icon: '☀' }, { d: 'Tue', t: 80, icon: '☀' }, { d: 'Wed', t: 82, icon: '☀' },
  { d: 'Thu', t: 72, icon: '🌧' }, { d: 'Fri', t: 79, icon: '☀' }, { d: 'Sat', t: 81, icon: '☀' },
  { d: 'Sun', t: 83, icon: '☀' },
];

const SEV_META = {
  NEAR_MISS:  { label: 'Near-miss',   osha: false, color: '#F59E0B' },
  FIRST_AID:  { label: 'First-aid',   osha: false, color: '#F59E0B' },
  RECORDABLE: { label: 'Recordable',  osha: true,  color: '#DC2626' },
  LOST_TIME:  { label: 'Lost-time',   osha: true,  color: '#991B1B' },
  FATAL:      { label: 'Fatal',       osha: true,  color: '#7F1D1D' },
};

// ============================================================================
// PRIMITIVES
// ============================================================================
const Avatar = ({ initials, size = 'sm', tone = 'purple' }) => {
  const s = size === 'xs' ? 22 : size === 'sm' ? 30 : size === 'md' ? 38 : 46;
  const fz = size === 'xs' ? 9 : size === 'sm' ? 11 : size === 'md' ? 13 : 15;
  const bg = tone === 'amber' ? WARN_BG : tone === 'green' ? SUCCESS_BG : tone === 'slate' ? '#F1F5F9' : PURPLE_LIGHT;
  const fg = tone === 'amber' ? '#92400E' : tone === 'green' ? '#166534' : tone === 'slate' ? '#475569' : PURPLE_DEEP;
  return <div className="rounded-full flex items-center justify-center flex-shrink-0 font-bold" style={{ width: s, height: s, backgroundColor: bg, color: fg, fontSize: fz }}>{initials}</div>;
};

const Badge = ({ tone = 'slate', children }) => {
  const tones = {
    purple: { bg: PURPLE_LIGHT,  fg: PURPLE_DEEP },
    green:  { bg: SUCCESS_BG,    fg: '#166534' },
    amber:  { bg: WARN_BG,       fg: '#92400E' },
    red:    { bg: DANGER_BG,     fg: '#991B1B' },
    slate:  { bg: '#F1F5F9',     fg: '#475569' },
  };
  const t = tones[tone];
  return <span className="inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-0.5 flex-shrink-0" style={{ backgroundColor: t.bg, color: t.fg }}>{children}</span>;
};

const SourcePill = ({ aiSource = 'VOICE' }) => {
  if (aiSource === 'MANUAL') {
    return <Badge tone="slate"><Pencil size={9} /> Manual</Badge>;
  }
  return <Badge tone="purple"><Sparkles size={9} /> Voice</Badge>;
};

const MobileNotesExcerpt = ({ notes, maxChars = 140 }) => {
  const [expanded, setExpanded] = useState(false);
  if (!notes || !notes.trim()) return null;
  const isLong = notes.length > maxChars;
  const display = !expanded && isLong ? notes.slice(0, maxChars).trim() + '…' : notes;
  return (
    <div className="rounded-md border border-purple-100 px-2 py-1.5 mt-1.5" style={{ backgroundColor: '#FAF5FF' }}>
      <div className="flex items-start gap-1.5">
        <Sparkles size={10} style={{ color: PURPLE }} className="mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[8.5px] font-bold uppercase tracking-wide" style={{ color: PURPLE_DEEP, opacity: 0.7 }}>Voice notes</div>
          <div className="text-[10.5px] leading-snug whitespace-pre-line" style={{ color: PURPLE_DEEP }}>{display}</div>
          {isLong && (
            <button onClick={(e) => { e.stopPropagation(); setExpanded(x => !x); }} className="text-[10px] font-bold mt-0.5" style={{ color: PURPLE_DEEP }}>
              {expanded ? 'Show less' : 'Read all →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Card = ({ icon: Icon, title, action, children, updatedAt, updatedBy, source, noPad }) => (
  <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
    {(title || Icon) && (
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100">
        <div className="flex items-center gap-1.5 min-w-0">
          {Icon && <Icon size={15} className="text-slate-700 flex-shrink-0" strokeWidth={2.2} />}
          <span className="text-[13px] font-bold text-slate-900 truncate">{title}</span>
        </div>
        {action && <div className="flex-shrink-0 ml-2">{action}</div>}
      </div>
    )}
    <div className={noPad ? '' : 'p-3'}>{children}</div>
    {(updatedAt || updatedBy) && (
      <div className="border-t border-slate-100 bg-slate-50/40 px-3 py-1.5 flex items-center gap-1.5 text-[10px] text-slate-500">
        <Clock size={9} />
        <span>Updated <strong className="text-slate-700">{updatedAt}</strong>{updatedBy && <> · by <strong className="text-slate-700">{updatedBy}</strong></>}</span>
        {source && <span className="ml-auto inline-flex items-center gap-1 font-bold" style={{ color: source === 'VOICE' ? PURPLE_DEEP : '#475569' }}>
          {source === 'VOICE' ? <><Sparkles size={9} /> Voice</> : <><Pencil size={9} /> Manual</>}
        </span>}
      </div>
    )}
  </div>
);

const KPITile = ({ label, value, sub, icon: Icon, trend, accent, alert, success, onClick }) => (
  <button onClick={onClick} className={cls('rounded-xl border p-2.5 text-left w-full active:scale-[0.98] transition-transform',
    alert ? 'border-amber-300 bg-amber-50' : success ? 'border-green-200 bg-green-50/30' : accent ? 'border-purple-200' : 'border-slate-200 bg-white')}>
    <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
      {Icon && <Icon size={10} />}
      <span className="truncate">{label}</span>
    </div>
    <div className="flex items-baseline gap-1.5 flex-wrap">
      <span className="text-[18px] font-bold text-slate-900 leading-tight">{value}</span>
      {trend && <span className={cls('text-[10px] font-bold', typeof trend === 'number' ? (trend > 0 ? 'text-green-700' : 'text-red-700') : '')}>
        {typeof trend === 'number' ? `${trend > 0 ? '↑' : '↓'} ${Math.abs(trend)}%` : trend}
      </span>}
    </div>
    {sub && <div className="text-[10px] text-slate-500 mt-0.5 truncate">{sub}</div>}
  </button>
);

// ============================================================================
// AI CAPTURED BANNER (voice-first loop closer at top of each screen)
// ============================================================================
const AICapturedBanner = ({ count = 22, manual = 3, onCapture }) => (
  <div className="rounded-xl mb-3 px-3 py-2.5 flex items-center gap-2.5"
    style={{ background: `linear-gradient(135deg, ${PURPLE_LIGHT} 0%, #F5F3FF 100%)`, border: '1px solid #DDD6FE' }}>
    <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 30, height: 30, backgroundColor: PURPLE }}>
      <Sparkles size={14} className="text-white" strokeWidth={2.4} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[12px] font-bold leading-snug" style={{ color: PURPLE_DEEP }}>{count} captured via voice · {manual} manual</div>
      <div className="text-[10px]" style={{ color: PURPLE_DEEP, opacity: 0.7 }}>Last 4:30 PM · tap any item to edit</div>
    </div>
    <button onClick={onCapture} className="rounded-full px-2.5 py-1.5 text-[11px] font-bold flex items-center gap-1 flex-shrink-0" style={{ backgroundColor: PURPLE, color: 'white' }}>
      <Mic size={12} /> +
    </button>
  </div>
);

// ============================================================================
// VOICE COMMENTARY CARD (tops each sub-module screen)
// ============================================================================
const VoiceCommentaryCard = ({ entries = [], moduleLabel, onCapture }) => {
  if (!entries || entries.length === 0) return null;
  return (
    <div className="rounded-xl mb-3 overflow-hidden" style={{ background: `linear-gradient(135deg, ${PURPLE_LIGHT} 0%, #F5F3FF 100%)`, border: '1px solid #DDD6FE' }}>
      <div className="px-3 py-2.5 flex items-center gap-2 border-b" style={{ borderColor: '#DDD6FE' }}>
        <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 26, height: 26, backgroundColor: PURPLE }}>
          <Sparkles size={12} className="text-white" strokeWidth={2.4} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-bold leading-snug" style={{ color: PURPLE_DEEP }}>{moduleLabel} commentary</div>
          <div className="text-[10px]" style={{ color: PURPLE_DEEP, opacity: 0.75 }}>Voice notes that didn't fit a structured entry</div>
        </div>
        <Badge tone="purple">{entries.length}</Badge>
      </div>
      <div className="divide-y" style={{ borderColor: '#DDD6FE' }}>
        {entries.map(e => (
          <div key={e.id} className="px-3 py-2 flex items-start gap-2">
            <Avatar initials={e.avatar} size="xs" />
            <div className="flex-1 min-w-0">
              <div className="text-[11.5px] font-semibold leading-snug" style={{ color: PURPLE_DEEP }}>{e.summary}</div>
              <div className="text-[10.5px] italic mt-0.5 leading-snug" style={{ color: PURPLE_DEEP, opacity: 0.7 }}>{e.quote}</div>
              <div className="text-[9.5px] mt-0.5" style={{ color: PURPLE_DEEP, opacity: 0.6 }}>{e.author} · {e.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// AI DAILY SUMMARY HERO (mobile compact — audio + transcript collapsed)
// ============================================================================
const AIDailyHero = ({ project, audio, dateView }) => {
  const [playing, setPlaying] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const heroLabel = dateView === 'week' ? 'Weekly' : dateView === 'month' ? 'Monthly' : 'Daily';
  const periodLabel = dateView === 'week' ? 'This week' : dateView === 'month' ? 'This month' : dateView === 'yesterday' ? 'Yesterday' : 'Today';
  const showAudio = dateView === 'today' || dateView === 'yesterday';
  const fmtMMSS = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  return (
    <div className="rounded-xl p-3 mb-3" style={{ background: `linear-gradient(135deg, ${PURPLE_LIGHT} 0%, #F5F3FF 100%)`, border: '1px solid #DDD6FE' }}>
      <div className="flex items-start gap-2 mb-2.5">
        <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 32, height: 32, backgroundColor: PURPLE }}>
          <Sparkles size={14} className="text-white" strokeWidth={2.4} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[13px] font-bold" style={{ color: PURPLE_DEEP }}>AI {heroLabel} Summary</span>
            <Badge tone="purple">{periodLabel}</Badge>
            <Badge tone="green">live</Badge>
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: PURPLE_DEEP, opacity: 0.7 }}>auto from {audio ? '5 voice captures' : 'aggregated data'}</div>
        </div>
      </div>

      {/* Audio strip */}
      {showAudio && audio && (
        <div className="rounded-lg bg-white/70 p-2 mb-2.5 flex items-center gap-2" style={{ border: '1px solid #DDD6FE' }}>
          <button onClick={() => setPlaying(p => !p)} className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 32, height: 32, backgroundColor: PURPLE }}>
            {playing ? <Pause size={14} className="text-white" /> : <Play size={14} className="text-white" />}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1">
              <Volume2 size={10} style={{ color: PURPLE_DEEP }} />
              <span className="text-[10px] font-bold truncate" style={{ color: PURPLE_DEEP }}>{audio.voice}</span>
            </div>
            <div className="flex items-end gap-[2px] h-4">
              {audio.waveform.slice(0, 24).map((h, i) => (
                <div key={i} className="rounded-sm" style={{ width: 2, height: `${Math.max(3, h * 0.7)}px`,
                  backgroundColor: playing && i < 10 ? PURPLE_DEEP : PURPLE,
                  opacity: playing && i < 10 ? 1 : 0.55,
                  animation: playing ? `pulseProsetMobV2 0.6s ${i * 0.04}s ease-in-out infinite alternate` : 'none' }} />
              ))}
            </div>
          </div>
          <span className="text-[10px] font-bold flex-shrink-0" style={{ color: PURPLE_DEEP }}>{fmtMMSS(audio.durationSec)}</span>
        </div>
      )}

      {/* Transcript toggle */}
      {showAudio && audio && (
        <button onClick={() => setTranscriptOpen(o => !o)} className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: PURPLE_DEEP }}>
          {transcriptOpen ? 'Hide transcript' : 'Show transcript'} <ChevronDown size={11} className={transcriptOpen ? 'rotate-180' : ''} />
        </button>
      )}
      {showAudio && audio && transcriptOpen && (
        <div className="rounded-lg bg-white/70 p-2.5 mb-2.5 text-[11px] leading-relaxed" style={{ color: PURPLE_DEEP, border: '1px solid #DDD6FE' }}>
          {audio.transcript}
        </div>
      )}

      {/* Narrative */}
      <div className="text-[12px] leading-relaxed" style={{ color: PURPLE_DEEP }}>
        <strong>9 units installed today</strong> (vs 8 yesterday · +12.5%). Crew of 15 logged 248h. <strong className="text-amber-700">786-A2 e-box modification</strong> flagged for change-order review. <strong className="text-red-700">10th unit shut down for wind</strong> per Owner.
      </div>

      <button className="mt-2.5 w-full rounded-md py-1.5 text-[11px] font-bold flex items-center justify-center gap-1" style={{ color: PURPLE_DEEP, border: '1px solid #DDD6FE' }}>
        Ask follow-up →
      </button>
    </div>
  );
};

// ============================================================================
// PROJECT HEADER STRIP (Day / % complete + KPIs + weather)
// ============================================================================
const ProjectHeaderStrip = ({ project, totalHrs, laborCost, burnToday, equipCost, matCost }) => {
  return (
    <div className="rounded-xl bg-white border border-slate-200 mb-3 overflow-hidden">
      {/* Day + progress */}
      <div className="px-3 py-2.5 flex items-center gap-2.5">
        <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ width: 32, height: 32, backgroundColor: PURPLE_LIGHT }}>
          <Activity size={14} style={{ color: PURPLE_DEEP }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Day {project.daysIn} of {project.daysTotal}</div>
          <div className="text-[15px] font-bold text-slate-900 leading-tight">{project.progress.toFixed(2)}% complete</div>
        </div>
      </div>
      <div className="px-3 pb-2">
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${project.progress}%`, background: `linear-gradient(90deg, ${PURPLE} 0%, ${PURPLE_DEEP} 100%)` }} />
        </div>
      </div>

      {/* KPI grid 2x2 */}
      <div className="grid grid-cols-2 border-t border-slate-100 divide-x divide-slate-100">
        {[
          { label: 'Units installed', value: project.modularStats?.setToday || 9, trend: '+12.5%', icon: Box },
          { label: '% Complete',      value: `${project.progress.toFixed(2)}%`, trend: '+0.27%', icon: Activity },
        ].map(k => (
          <div key={k.label} className="px-3 py-2">
            <div className="text-[9.5px] text-slate-500 font-semibold uppercase tracking-wide flex items-center gap-1"><k.icon size={9} /> {k.label}</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[16px] font-bold text-slate-900 leading-none">{k.value}</span>
              <span className="text-[9.5px] text-green-700 font-bold">↑ {k.trend}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 border-t border-slate-100 divide-x divide-slate-100">
        <div className="px-3 py-2">
          <div className="text-[9.5px] text-slate-500 font-semibold uppercase tracking-wide flex items-center gap-1"><Clock size={9} /> Crew hours</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[16px] font-bold text-slate-900 leading-none">{totalHrs.toFixed(0)}h</span>
            <span className="text-[9.5px] text-green-700 font-bold">↑ +3%</span>
          </div>
        </div>
        <div className="px-3 py-2" style={{ background: `linear-gradient(135deg, #FAFAFF 0%, ${PURPLE_LIGHT} 100%)` }}>
          <div className="text-[9.5px] font-semibold uppercase tracking-wide flex items-center gap-1" style={{ color: PURPLE_DEEP, opacity: 0.75 }}><DollarSign size={9} /> Today's burn</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[16px] font-bold leading-none" style={{ color: PURPLE_DEEP }}>{fmt$(burnToday)}</span>
            <span className="text-[9.5px] text-green-700 font-bold">↑ on plan</span>
          </div>
        </div>
      </div>

      {/* Burn breakdown */}
      <div className="px-3 py-2 border-t border-slate-100 flex items-center gap-3 text-[10.5px]" style={{ background: `linear-gradient(135deg, #FAFAFF 0%, ${PURPLE_LIGHT} 100%)` }}>
        <span className="font-semibold" style={{ color: PURPLE_DEEP, opacity: 0.7 }}>Lab <strong style={{ color: PURPLE_DEEP, opacity: 1 }}>{fmt$(laborCost)}</strong></span>
        <span style={{ color: PURPLE_DEEP, opacity: 0.4 }}>·</span>
        <span className="font-semibold" style={{ color: PURPLE_DEEP, opacity: 0.7 }}>Eq <strong style={{ color: PURPLE_DEEP, opacity: 1 }}>{fmt$(equipCost)}</strong></span>
        <span style={{ color: PURPLE_DEEP, opacity: 0.4 }}>·</span>
        <span className="font-semibold" style={{ color: PURPLE_DEEP, opacity: 0.7 }}>Mat <strong style={{ color: PURPLE_DEEP, opacity: 1 }}>{fmt$(matCost)}</strong></span>
      </div>
    </div>
  );
};

// ============================================================================
// WEATHER CARD (big temp + 7-day strip)
// ============================================================================
const WeatherCard = ({ project }) => (
  <div className="rounded-xl mb-3 overflow-hidden" style={{ background: `linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)`, border: '1px solid #FCD34D' }}>
    <div className="px-3 py-2.5 flex items-center gap-3">
      <Sun size={32} className="text-amber-500" strokeWidth={2} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-[26px] font-bold text-slate-900 leading-none">{project.weather.temp}°F</span>
        </div>
        <div className="text-[10px] text-slate-700 font-semibold mt-1">AM {project.weather.condAM}</div>
        <div className="text-[10px] text-slate-700 font-semibold">PM {project.weather.condPM}</div>
      </div>
      <Badge tone="amber">7-day below ↓</Badge>
    </div>
    <div className="grid grid-cols-7 px-2 pb-2 gap-1">
      {FORECAST.map(f => (
        <div key={f.d} className="text-center rounded-md bg-white/60 py-1">
          <div className="text-[9px] font-bold text-slate-700">{f.d}</div>
          <div className="text-[14px] my-0.5">{f.icon}</div>
          <div className={cls('text-[10px] font-bold', f.icon === '🌧' ? 'text-amber-700' : 'text-slate-900')}>{f.t}°</div>
        </div>
      ))}
    </div>
    <div className="px-3 pb-2 text-[10px] text-amber-800 font-semibold flex items-center gap-1">
      <AlertCircle size={10} /> Rain expected Thursday — plan accordingly
    </div>
  </div>
);

// ============================================================================
// VOICE CAPTURE MODAL (full-screen — primary capture flow)
// ============================================================================
const VoiceCaptureModal = ({ open, onClose }) => {
  const [phase, setPhase] = useState('recording'); // recording → review → confirmed
  const [confirmed, setConfirmed] = useState({});
  useEffect(() => { if (open) { setPhase('recording'); setConfirmed({}); } }, [open]);
  if (!open) return null;
  const cards = [
    { id: 1, type: 'Personnel',     tone: 'purple', icon: Users,         label: '15 setters/panel/prep crew · check-in 6:30 AM' },
    { id: 2, type: 'Modular',       tone: 'green',  icon: Box,           label: 'Mods Set Today +9 (D19/786-2 → 786-21)' },
    { id: 3, type: 'Equipment',     tone: 'amber',  icon: Wrench,        label: 'JLG boom lift received (4th unit)' },
    { id: 4, type: 'Problems',      tone: 'amber',  icon: AlertTriangle, label: '786-A2 e-box mod · CO trigger flagged', needsConfirm: true },
    { id: 5, type: 'Communications',tone: 'red',    icon: MessageCircle, label: 'Wind shut-down on 10th · PM Decision' },
  ];
  const toneBg = (tone) => ({ purple: PURPLE_LIGHT, amber: WARN_BG, green: SUCCESS_BG, red: DANGER_BG }[tone]);
  const toneFg = (tone) => ({ purple: PURPLE_DEEP, amber: '#92400E', green: '#166534', red: '#991B1B' }[tone]);
  const confirmedCount = Object.values(confirmed).filter(Boolean).length;
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col" style={{ animation: 'slideUpProsetMobV2 0.2s ease-out' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <button onClick={onClose} className="rounded-full bg-slate-100 flex items-center justify-center" style={{ width: 32, height: 32 }}>
          <X size={15} className="text-slate-700" />
        </button>
        <div className="text-[14px] font-bold text-slate-900">Voice capture</div>
        <button onClick={onClose} className="rounded-md text-white px-3 py-1.5 text-[11px] font-bold" style={{ backgroundColor: PURPLE }}>
          Save
        </button>
      </div>

      {phase === 'recording' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="text-[12px] text-slate-500 font-semibold uppercase tracking-wide mb-6">Recording…</div>
          <button onClick={() => setPhase('review')} className="rounded-full flex items-center justify-center mb-6 active:scale-95 transition-transform"
            style={{ width: 140, height: 140, backgroundColor: '#DC2626', boxShadow: '0 0 0 12px rgba(220,38,38,0.18)' }}>
            <Square size={36} className="text-white" />
          </button>
          <div className="flex items-end gap-1 h-16 mb-6">
            {[8,12,18,24,32,28,20,15,9,14,22,28,35,30,22,16,11,18,24,30].map((h, i) => (
              <div key={i} className="rounded-sm" style={{ width: 4, height: `${h}px`, backgroundColor: PURPLE,
                animation: `pulseProsetMobV2 0.8s ${i * 0.04}s ease-in-out infinite alternate` }} />
            ))}
          </div>
          <div className="text-[18px] font-bold text-slate-900">0:23</div>
          <div className="text-[12px] text-slate-500 mt-1 text-center">Speak naturally — I'll route to the right modules</div>
          <button onClick={() => setPhase('review')} className="mt-6 text-[12px] font-bold text-purple-700 underline">Done speaking</button>
        </div>
      )}

      {phase === 'review' && (
        <div className="flex-1 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100" style={{ backgroundColor: PURPLE_LIGHT }}>
            <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: PURPLE_DEEP }}>Detected updates</div>
            <div className="text-[14px] font-bold text-slate-900">{confirmedCount} of {cards.length} confirmed</div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cards.map(c => {
              const isConfirmed = !!confirmed[c.id];
              return (
                <div key={c.id} className={cls('rounded-xl border-2 p-3', isConfirmed ? 'border-green-300 bg-green-50/30' : 'border-slate-200 bg-white')}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="rounded-lg flex items-center justify-center" style={{ width: 26, height: 26, backgroundColor: toneBg(c.tone) }}>
                      <c.icon size={13} style={{ color: toneFg(c.tone) }} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: toneFg(c.tone) }}>{c.type}</span>
                    <Badge tone="purple"><Sparkles size={9} /> Voice</Badge>
                  </div>
                  <div className="text-[12px] text-slate-900 mb-2">{c.label}</div>
                  {c.needsConfirm && !isConfirmed && (
                    <div className="rounded p-1.5 mb-2 text-[10px]" style={{ backgroundColor: WARN_BG, color: '#92400E' }}>
                      ⚠ Lower confidence — verify before saving
                    </div>
                  )}
                  <div className="flex gap-2">
                    {!isConfirmed && (
                      <button onClick={() => setConfirmed(prev => ({ ...prev, [c.id]: true }))} className="flex-1 rounded-md text-white py-1.5 text-[11px] font-bold flex items-center justify-center gap-1" style={{ backgroundColor: PURPLE }}>
                        <Check size={11} /> Confirm
                      </button>
                    )}
                    {isConfirmed && (
                      <div className="flex-1 rounded-md py-1.5 text-[11px] font-bold flex items-center justify-center gap-1 bg-green-100 text-green-800">
                        <CheckCircle2 size={11} /> Confirmed
                      </div>
                    )}
                    <button className="rounded-md border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700">Edit</button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-slate-200 p-3 flex gap-2">
            <button onClick={onClose} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-[13px] font-bold text-slate-700">Cancel</button>
            <button onClick={onClose} className="flex-[2] rounded-lg text-white py-2.5 text-[13px] font-bold flex items-center justify-center gap-1.5" style={{ backgroundColor: PURPLE }}>
              <Check size={14} /> Save all to modules
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CREATE ITEM BOTTOM SHEET (mobile-styled CreateItemDialog)
// ============================================================================
const ITEM_SCHEMAS = {
  personnel: {
    title: 'Add Personnel',
    voiceHint: '"Juan Alencastro, employee 101, GC setter, in 6:30 AM, $38 wage."',
    fields: [
      { id: 'worker', label: 'Worker name', type: 'text' },
      { id: 'empId',  label: 'Employee ID', type: 'text' },
      { id: 'trade',  label: 'Trade', type: 'select', options: ['GC','Sub'] },
      { id: 'role',   label: 'Role', type: 'select', options: ['Setter','Panel','Stitch','Prep','Other','Sub'] },
      { id: 'checkIn',label: 'Check-in', type: 'time' },
      { id: 'wageRate', label: 'Wage ($/h)', type: 'number' },
      { id: 'ppe',    label: 'PPE verified', type: 'toggle' },
    ],
  },
  delivery: {
    title: 'Add Delivery',
    voiceHint: '"Westervelt dropped 2 mods D19/786-2 and 786-3, PO 3042, received 7:15 AM, full set."',
    fields: [
      { id: 'supplier', label: 'Supplier', type: 'text' },
      { id: 'material', label: 'Material', type: 'text' },
      { id: 'qty',      label: 'Qty', type: 'number' },
      { id: 'unit',     label: 'Unit', type: 'text' },
      { id: 'poNumber', label: 'PO #', type: 'text' },
      { id: 'status',   label: 'Status', type: 'select', options: ['Received','Pending','Damaged'] },
      { id: 'value',    label: 'Value ($)', type: 'number' },
    ],
  },
  safetyMeeting: {
    title: 'Safety meeting / Toolbox talk',
    voiceHint: '"Boom lift fall protection talk, 6:35 AM, 12 minutes, 14 attendees, led by me."',
    fields: [
      { id: 'topic',     label: 'Topic', type: 'text' },
      { id: 'type',      label: 'Type', type: 'select', options: ['Toolbox Talk','Safety Meeting','Pre-task plan','Owner / GC meeting'] },
      { id: 'lead',      label: 'Lead by', type: 'text' },
      { id: 'time',      label: 'Time', type: 'time' },
      { id: 'duration',  label: 'Duration (min)', type: 'number' },
      { id: 'attendees', label: 'Attendees', type: 'number' },
      { id: 'notes',     label: 'Takeaways', type: 'textarea' },
    ],
  },
  incident: {
    title: 'Log Incident or Delay',
    danger: true,
    voiceHint: '"Crane mid-day move, 786-A2 e-box too wide, cut wire per Dave Ault, 1 hour slip."',
    fields: [
      { id: 'kind',     label: 'Type', type: 'select', options: ['Safety incident','Operational delay'] },
      { id: 'title',    label: 'Title', type: 'text' },
      { id: 'category', label: 'Category', type: 'select', options: ['Safety','Schedule','Material shortage','Weather','Equipment','Scope change','Owner directive'] },
      { id: 'severity', label: 'Severity (OSHA)', type: 'select', options: ['N/A','Near-miss','First-aid','Recordable','Lost-time','Fatal'] },
      { id: 'status',   label: 'Status', type: 'select', options: ['OPEN','RESOLVED'] },
      { id: 'description', label: 'What happened', type: 'textarea' },
      { id: 'actionTaken', label: 'Action taken', type: 'textarea' },
      { id: 'impactHours', label: 'Schedule impact (h)', type: 'number' },
      { id: 'costImpact', label: 'Cost impact ($)', type: 'number' },
      { id: 'changeOrderTrigger', label: 'Change-order trigger?', type: 'toggle' },
    ],
  },
  inspection: {
    title: 'Add Inspection',
    voiceHint: '"Module Prep inspection passed, 9:30 AM, minor damage noted."',
    fields: [
      { id: 'type',      label: 'Inspection type', type: 'text' },
      { id: 'status',    label: 'Result', type: 'select', options: ['Pass','Pass with notes','Fail','Re-inspect'] },
      { id: 'inspector', label: 'Inspector', type: 'text' },
      { id: 'notes',     label: 'Notes', type: 'textarea' },
    ],
  },
  equipment: {
    title: 'Log Equipment',
    voiceHint: '"45 ft boom S45H-26609, 8 hours today, $410 day rate, active, pre-op signed."',
    fields: [
      { id: 'name',      label: 'Equipment', type: 'text' },
      { id: 'type',      label: 'Type', type: 'text' },
      { id: 'operator',  label: 'Operator', type: 'text' },
      { id: 'hoursToday',label: 'Hours today', type: 'number' },
      { id: 'dayRate',   label: 'Day rate ($)', type: 'number' },
      { id: 'status',    label: 'Status', type: 'select', options: ['ACTIVE','IN_MAINTENANCE','IDLE'] },
      { id: 'preOpCheck',label: 'Pre-op check', type: 'toggle' },
    ],
  },
  material: {
    title: 'Add Material',
    voiceHint: '"Anchor bolts 3/4, structural, 600 received of 600 needed, PO 2210, all good."',
    fields: [
      { id: 'name',     label: 'Material', type: 'text' },
      { id: 'category', label: 'Category', type: 'select', options: ['Structural','Finish','MEP','Sitework','Misc'] },
      { id: 'received', label: 'Received', type: 'number' },
      { id: 'needed',   label: 'Needed', type: 'number' },
      { id: 'unit',     label: 'Unit', type: 'text' },
      { id: 'poNumber', label: 'PO #', type: 'text' },
      { id: 'value',    label: 'Value ($)', type: 'number' },
      { id: 'status',   label: 'Status', type: 'select', options: ['ok','short','damaged','pending'] },
    ],
  },
  note: {
    title: 'New Note',
    voiceHint: '"Owner walkthrough Thursday 3 PM, bring D19 status board, pin to dashboard, tag client."',
    fields: [
      { id: 'title', label: 'Title', type: 'text' },
      { id: 'body',  label: 'Body', type: 'textarea' },
      { id: 'tags',  label: 'Tags', type: 'text' },
      { id: 'pinned',label: 'Pin to dashboard', type: 'toggle' },
    ],
  },
  visitor: {
    title: 'Sign in Visitor',
    voiceHint: '"Chris from Target, boom lift safety meeting, 2 PM, escorted by me."',
    fields: [
      { id: 'name',    label: 'Visitor name', type: 'text' },
      { id: 'org',     label: 'Organization', type: 'text' },
      { id: 'purpose', label: 'Purpose', type: 'textarea' },
      { id: 'timeIn',  label: 'Time in', type: 'time' },
      { id: 'escort',  label: 'Escort', type: 'text' },
      { id: 'type',    label: 'Type', type: 'select', options: ['Owner','Sub','Inspector','Vendor','Other'] },
    ],
  },
};

// AI fill samples per submodule — mirrors web prototype
const AI_FILL_SAMPLES = {
  personnel: {
    values: { worker: 'Juan Alencastro', empId: '101', trade: 'GC', role: 'Setter', checkIn: '06:30', wageRate: 38, ppe: true },
    residual: 'Crew of 15 on at 6:30. Setters Juan, Eric, Carlos. Panel Ricki, David. Stitch Jose. Prep Anthony, Tyler. Sub Westervelt 2 guys. Juan + Eric asked to learn stair set Friday.',
  },
  delivery: {
    values: { supplier: 'Westervelt Modular', material: 'Mod D19/786-2', qty: 1, unit: 'mod', poNumber: 'PO-3042', status: 'Received', value: 42000 },
    residual: 'Driver mentioned the trailer brake squeal again. Recommend Westervelt walkaround at next drop. Mods set down 7:15 AM.',
  },
  safetyMeeting: {
    values: { topic: 'Boom lift fall protection · 100% tie-off', type: 'Toolbox Talk', lead: 'Erik Odowd', time: '06:35', duration: 12, attendees: 14 },
    residual: 'Crew engaged. Re-emphasized owner cutoff thresholds. Ricki had a question about double-lanyard on the new JLG.',
  },
  incident: {
    values: { kind: 'Operational delay', title: 'Crane move mid-day · 786-A2 e-box', category: 'Scope change', severity: 'N/A', status: 'OPEN', impactHours: 1.0, costImpact: 1850, changeOrderTrigger: true,
      description: '786-A2 stairwell e-box too wide for corridor. Removed box and cut wire per Target Dave Ault.', actionTaken: 'Logged on Target HSI with photo. RFI to Westervelt.' },
    residual: 'Crane idle ~1 hr while we cleared. No injuries. Crew was visibly tense after the call.',
  },
  inspection: {
    values: { type: 'Module Prep', status: 'Pass', inspector: 'Erik Odowd' },
    residual: 'Mod 786-A13 had extra 2x6 down center plus chases. Covered with OSB. Minor damage to corner post; superficial. Photo on file.',
  },
  equipment: {
    values: { name: '45ft Boom Lift', type: 'Boom lift', operator: 'Eric Cortez', hoursToday: 8, dayRate: 410, status: 'ACTIVE', preOpCheck: true },
    residual: 'All 3 boom lifts running. Crane operator noted CT-220 hydraulic pressure dipping mid-afternoon. Booking maintenance for tomorrow.',
  },
  material: {
    values: { name: 'Anchor bolts 3/4"', category: 'Structural', received: 600, needed: 600, unit: 'pcs', poNumber: 'PO-2210', value: 4200, status: 'ok' },
    residual: 'Grade 8 confirmed per RFI #42. BuildMart issuing credit on yesterday\'s damaged drywall.',
  },
  note: {
    values: { title: 'Owner walkthrough · 3 PM Thursday', body: 'Target site visit confirmed. Bring D19 status board, safety incident log, 786-A2 photo evidence.', tags: 'client, meeting, communications', pinned: true },
    residual: 'Coordinate w/ Keirsten on the deck content. Pull RFI 42 close-out for the anchor bolt thread.',
  },
  visitor: {
    values: { name: 'Chris (Target / Bechtel)', org: 'Target', purpose: 'Boom lift safety standards review', timeIn: '14:00', escort: 'Erik Odowd', type: 'Owner' },
    residual: 'Chris taking notes — distributing later. Bechtel scrutiny on perceived safety issues continues.',
  },
};

const CreateItemSheet = ({ type, onClose }) => {
  const schema = ITEM_SCHEMAS[type];
  const [phase, setPhase] = useState('capture');         // capture | review
  const [recording, setRecording] = useState(false);
  const [transcribed, setTranscribed] = useState(false);
  const [filledIds, setFilledIds] = useState(new Set());
  const [values, setValues] = useState({});
  const [photoCount, setPhotoCount] = useState(0);
  if (!schema) return null;
  const setVal = (id, v) => setValues(p => ({ ...p, [id]: v }));

  // Determine residual field per schema
  const ids = schema.fields.map(f => f.id);
  const residualFieldId = (() => {
    if (ids.includes('notes')) return 'notes';
    if (type === 'note' && ids.includes('body')) return 'body';
    if (type === 'incident' && ids.includes('description')) return 'description';
    return 'notes';
  })();
  const fieldsForRender = ids.includes(residualFieldId) ? schema.fields : [...schema.fields, { id: residualFieldId, label: 'Notes · voice residual + extra context', type: 'textarea' }];

  const handleRecord = () => {
    if (recording) {
      setRecording(false);
      setTranscribed(true);
      const sample = AI_FILL_SAMPLES[type];
      if (sample) {
        const merged = { ...sample.values, ...values };
        const existing = values[residualFieldId];
        merged[residualFieldId] = existing ? `${existing}\n\n${sample.residual}` : sample.residual;
        setValues(merged);
        setFilledIds(new Set(Object.keys(sample.values).concat(residualFieldId)));
      }
    } else {
      setRecording(true);
    }
  };

  const filledFieldsCount = Object.entries(values).filter(([k, v]) => v !== undefined && v !== '' && v !== false && (Array.isArray(v) ? v.length > 0 : true)).length;
  const renderValue = (v) => {
    if (v === undefined || v === '' || v === null) return null;
    if (typeof v === 'boolean') return v ? 'Yes' : 'No';
    if (Array.isArray(v)) return v.length > 0 ? v.join(', ') : null;
    return String(v);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/45 z-40" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl flex flex-col" style={{ maxHeight: '92vh', animation: 'slideUpProsetMobV2 0.25s ease-out' }}>
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="rounded-full bg-slate-300" style={{ width: 36, height: 4 }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 min-w-0">
            <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ width: 30, height: 30, backgroundColor: schema.danger ? DANGER_BG : PURPLE_LIGHT }}>
              {schema.danger ? <AlertTriangle size={14} className="text-red-700" /> : <Plus size={14} style={{ color: PURPLE_DEEP }} />}
            </div>
            <div className="min-w-0">
              <div className="text-[14px] font-bold text-slate-900 truncate">{phase === 'review' ? `Review · ${schema.title}` : schema.title}</div>
              <div className="text-[10px] text-slate-500 truncate">{phase === 'review' ? `${filledFieldsCount} fields filled · ${photoCount} media` : 'Tap mic · or fill below · everything saves'}</div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0" style={{ width: 28, height: 28 }}>
            <X size={12} className="text-slate-700" />
          </button>
        </div>

        {phase === 'capture' && (
          <>
            {/* Voice region */}
            <div className="px-4 py-3" style={{ background: `linear-gradient(135deg, ${PURPLE_LIGHT} 0%, #F5F3FF 100%)`, borderBottom: '1px solid #DDD6FE' }}>
              <div className="flex items-start gap-2.5">
                <button onClick={handleRecord}
                  className={cls('rounded-full flex items-center justify-center flex-shrink-0', recording && 'animate-pulse')}
                  style={{ width: 50, height: 50, backgroundColor: recording ? '#DC2626' : PURPLE,
                    boxShadow: recording ? '0 0 0 6px rgba(220,38,38,0.18)' : '0 0 0 4px rgba(83,74,183,0.18)' }}>
                  {recording ? <Square size={18} className="text-white" /> : <Mic size={20} className="text-white" />}
                </button>
                <button onClick={() => setPhotoCount(c => c + 1)}
                  className="rounded-full flex items-center justify-center flex-shrink-0 bg-white hover:bg-slate-50"
                  style={{ width: 50, height: 50, border: `2px solid ${PURPLE}` }}>
                  <Camera size={20} style={{ color: PURPLE }} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold mb-1" style={{ color: PURPLE_DEEP }}>
                    {recording ? 'Listening… tap mic to stop' : transcribed ? 'AI filled · talk again to add more' : 'Tap mic to speak'}
                  </div>
                  <div className="text-[10.5px] italic leading-snug" style={{ color: PURPLE_DEEP, opacity: 0.75 }}>{schema.voiceHint}</div>
                  <div className="text-[10px] mt-1 flex items-start gap-1" style={{ color: PURPLE_DEEP, opacity: 0.7 }}>
                    <Info size={9} className="mt-0.5 flex-shrink-0" />
                    <span>Anything not mapped to a field lands in <strong>Notes</strong> below.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fields */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Form</div>
                <span className="text-[9.5px] text-slate-400">no mandatory fields</span>
              </div>
              <div className="space-y-3">
                {fieldsForRender.map(f => {
                  const isFilled = filledIds.has(f.id);
                  const isResidual = f.id === residualFieldId;
                  const fieldClass = cls('w-full rounded-lg border px-3 py-2 text-[13px] focus:outline-none focus:border-purple-400',
                    isResidual && transcribed ? 'border-purple-300 bg-purple-50/50' : isFilled ? 'border-purple-200 bg-purple-50/30' : 'border-slate-200');
                  return (
                    <div key={f.id}>
                      <label className="block text-[10.5px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                        {f.label}
                        {isFilled && <Sparkles size={9} style={{ color: PURPLE }} />}
                        {isResidual && transcribed && (
                          <span className="ml-1 text-[9px] font-bold rounded px-1 py-0.5" style={{ backgroundColor: PURPLE_LIGHT, color: PURPLE_DEEP }}>residual</span>
                        )}
                      </label>
                      {f.type === 'text' && <input type="text" value={values[f.id] || ''} onChange={(e) => setVal(f.id, e.target.value)} className={fieldClass} />}
                      {f.type === 'number' && <input type="number" value={values[f.id] || ''} onChange={(e) => setVal(f.id, e.target.value)} className={fieldClass} />}
                      {f.type === 'time' && <input type="time" value={values[f.id] || ''} onChange={(e) => setVal(f.id, e.target.value)} className={fieldClass} />}
                      {f.type === 'textarea' && <textarea rows={3} value={values[f.id] || ''} onChange={(e) => setVal(f.id, e.target.value)} className={cls(fieldClass, 'resize-none')} />}
                      {f.type === 'select' && (
                        <select value={values[f.id] || ''} onChange={(e) => setVal(f.id, e.target.value)} className={fieldClass}>
                          <option value="">Select…</option>
                          {(f.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      )}
                      {f.type === 'toggle' && (
                        <button type="button" onClick={() => setVal(f.id, !values[f.id])}
                          className={cls('rounded-lg px-4 py-2 text-[12px] font-bold flex items-center gap-1.5', values[f.id] ? 'text-white' : 'bg-slate-100 text-slate-600')}
                          style={{ backgroundColor: values[f.id] ? PURPLE : undefined }}>
                          {values[f.id] ? <Check size={13} /> : <X size={13} />} {values[f.id] ? 'Yes' : 'No'}
                        </button>
                      )}
                    </div>
                  );
                })}
                <button onClick={() => setPhotoCount(c => c + 1)} className="w-full rounded-lg border-2 border-dashed border-slate-300 py-3 text-[12px] font-bold text-slate-500 flex items-center justify-center gap-2">
                  <Camera size={14} /> Add photo / video {photoCount > 0 && <Badge tone="purple">+{photoCount}</Badge>}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 p-3 flex gap-2 pb-safe">
              <button onClick={onClose} className="flex-1 rounded-lg border border-slate-200 py-3 text-[13px] font-bold text-slate-700">Cancel</button>
              <button onClick={() => setPhase('review')} className="flex-[2] rounded-lg text-white py-3 text-[13px] font-bold flex items-center justify-center gap-1.5" style={{ backgroundColor: schema.danger ? '#DC2626' : PURPLE }}>
                Review <ArrowRight size={14} />
              </button>
            </div>
          </>
        )}

        {phase === 'review' && (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
              <div className="rounded-lg p-2.5 flex items-start gap-2" style={{ backgroundColor: PURPLE_LIGHT }}>
                <Sparkles size={12} style={{ color: PURPLE_DEEP }} className="mt-0.5 flex-shrink-0" />
                <div className="text-[11px] leading-snug" style={{ color: PURPLE_DEEP }}>
                  <strong>{filledFieldsCount} fields</strong>{transcribed && ' · AI fill + manual'}{photoCount > 0 && ` · ${photoCount} media`}. Tap <strong>Edit</strong> to go back.
                </div>
              </div>
              {fieldsForRender.map(f => {
                const v = renderValue(values[f.id]);
                if (v === null) return null;
                const isResidual = f.id === residualFieldId;
                return (
                  <div key={f.id} className={cls('rounded-lg border p-2.5', isResidual ? 'border-purple-200 bg-purple-50/30' : 'border-slate-200 bg-white')}>
                    <div className="text-[9.5px] font-bold uppercase tracking-wide text-slate-500 mb-1 flex items-center gap-1">
                      {isResidual && <Sparkles size={9} style={{ color: PURPLE }} />}
                      {f.label}
                      {filledIds.has(f.id) && <span className="ml-1 text-[8.5px] font-bold rounded px-1 py-0.5" style={{ backgroundColor: PURPLE_LIGHT, color: PURPLE_DEEP }}>voice</span>}
                    </div>
                    <div className="text-[12px] text-slate-900 whitespace-pre-line leading-relaxed">{v}</div>
                  </div>
                );
              })}
              {filledFieldsCount === 0 && (
                <div className="rounded-lg border-2 border-dashed border-slate-300 p-6 text-center">
                  <div className="text-[11px] text-slate-500 italic">Nothing filled yet — that's fine. Save anyway, or tap Edit.</div>
                </div>
              )}
              {photoCount > 0 && (
                <div className="rounded-lg border border-slate-200 p-2.5">
                  <div className="text-[9.5px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 flex items-center gap-1">
                    <Paperclip size={9} /> {photoCount} photo / video attached
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {Array.from({ length: photoCount }).map((_, i) => (
                      <div key={i} className="rounded-md overflow-hidden flex items-center justify-center" style={{ aspectRatio: '1', background: `linear-gradient(135deg, ${PURPLE_LIGHT} 0%, #F5F3FF 100%)` }}>
                        <Camera size={16} style={{ color: PURPLE_DEEP, opacity: 0.6 }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-slate-200 p-3 flex gap-2 pb-safe">
              <button onClick={() => setPhase('capture')} className="flex-1 rounded-lg border border-slate-200 py-3 text-[13px] font-bold text-slate-700 flex items-center justify-center gap-1.5">
                <ArrowLeft size={13} /> Edit
              </button>
              <button onClick={onClose} className="flex-[2] rounded-lg text-white py-3 text-[13px] font-bold flex items-center justify-center gap-1.5" style={{ backgroundColor: schema.danger ? '#DC2626' : PURPLE }}>
                <Check size={14} /> Save
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

// ============================================================================
// SUB-MODULE MIC FAB — voice-first capture for the current sub-module
// ============================================================================
const SubModuleMicFAB = ({ onClick, danger }) => (
  <button onClick={onClick}
    className="fixed right-4 z-30 rounded-full text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
    style={{ bottom: 86, width: 56, height: 56, backgroundColor: danger ? '#DC2626' : PURPLE,
      boxShadow: '0 6px 16px rgba(83,74,183,0.35)' }}>
    <Mic size={22} />
  </button>
);

// ============================================================================
// SCREENS
// ============================================================================

// PROJECTS SCREEN
const ProjectsScreen = ({ projects, onPick }) => (
  <div className="px-3 py-3 space-y-2.5">
    <div className="flex items-baseline justify-between mb-2 px-1">
      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">All projects</div>
      <div className="text-[11px] text-slate-500">{projects.length} active</div>
    </div>
    {projects.map(p => (
      <button key={p.id} onClick={() => onPick(p)} className="w-full rounded-xl bg-white border border-slate-200 p-3 text-left active:scale-[0.99] transition-transform">
        <div className="flex items-start gap-3">
          <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40, backgroundColor: PURPLE_LIGHT }}>
            <HardHat size={18} style={{ color: PURPLE_DEEP }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-bold text-slate-900 truncate">{p.name}</div>
            <div className="text-[11px] text-slate-500 truncate">{p.client} · {p.address}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Sup: {p.supervisor}</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full" style={{ width: `${p.progress}%`, backgroundColor: PURPLE }} />
              </div>
              <span className="text-[11px] font-bold text-slate-900">{p.progress.toFixed(2)}%</span>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400 flex-shrink-0 mt-2" />
        </div>
      </button>
    ))}
  </div>
);

// DASHBOARD SCREEN
// ============================================================================
// MODULES HOME — Project Home (default landing inside a project).
// Slim today snapshot at top + sub-modules grid as primary action surface.
// Mobile UX is voice-first: capture lives inside each sub-module, not in a heavy dashboard.
// ============================================================================
const ModulesHomeScreen = ({ project, onCapture, onPick }) => {
  const [dateView, setDateView] = useState('today');
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const totalHrs = SEED_PERSONNEL.reduce((s, p) => s + p.hours, 0);
  const laborCost = SEED_PERSONNEL.reduce((s, p) => s + p.hours * p.wageRate, 0);
  const equipCost = SEED_EQUIPMENT.filter(e => e.status === 'ACTIVE').reduce((s, e) => s + e.dayRate * e.qty, 0);
  const matCost = SEED_DELIVERIES.filter(d => d.status === 'Received').reduce((s, d) => s + d.value, 0);
  const burnToday = laborCost + equipCost + matCost;
  const modules = [
    { id: 'personnel',   label: 'Personnel',           icon: Users,         count: `${SEED_PERSONNEL.length} on site`,    color: PURPLE_LIGHT, fg: PURPLE_DEEP },
    { id: 'deliveries',  label: 'Deliveries',          icon: Truck,         count: `${SEED_DELIVERIES.length} today`,     color: '#DCFCE7',     fg: '#166534' },
    { id: 'safety',      label: 'Safety & Meetings',   icon: ShieldCheck,   count: `${SEED_TOOLBOX.length} today`,         color: '#DBEAFE',     fg: '#1E40AF' },
    { id: 'incidents',   label: 'Incidents & Delays',  icon: AlertOctagon,  count: `${SEED_INCIDENTS.length} today`,       color: '#FEF3C7',     fg: '#92400E' },
    { id: 'inspections', label: 'Inspections',         icon: Eye,           count: `${SEED_INSPECTIONS.length} today`,     color: '#FCE7F3',     fg: '#831843' },
    { id: 'equipment',   label: 'Equipment',           icon: Wrench,        count: `${SEED_EQUIPMENT.length} on site`,    color: '#FFEDD5',     fg: '#7C2D12' },
    { id: 'materials',   label: 'Materials',           icon: Package,       count: `${SEED_MATERIALS.length} line items`, color: '#E0E7FF',     fg: '#3730A3' },
    { id: 'notes',       label: 'Notes',               icon: StickyNote,    count: `${SEED_NOTES.length} captured`,        color: '#F0FDF4',     fg: '#166534' },
  ];
  const disabled = [
    { id: 'changeorders', label: 'Change Orders', icon: Edit3 },
    { id: 'library',      label: 'Library',       icon: FolderOpen },
    { id: 'sov',          label: 'SOV',           icon: Receipt },
    { id: 'prejob',       label: 'Pre-Job',       icon: ShieldCheck },
  ];
  const fmtMMSS = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  return (
    <div className="px-3 py-3">
      {/* Today snapshot — slim, single card */}
      <div className="rounded-xl bg-white border border-slate-200 mb-3 overflow-hidden">
        <div className="px-3 py-2.5 flex items-center gap-2.5 border-b border-slate-100">
          <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ width: 32, height: 32, backgroundColor: PURPLE_LIGHT }}>
            <Activity size={14} style={{ color: PURPLE_DEEP }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Day {project.daysIn} of {project.daysTotal} · Today</div>
            <div className="text-[14px] font-bold text-slate-900 leading-tight">{project.progress.toFixed(2)}% complete</div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Sun size={16} className="text-amber-500" />
            <span className="text-[13px] font-bold text-slate-900">{project.weather.temp}°F</span>
          </div>
        </div>
        <div className="px-3 pt-2">
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${project.progress}%`, background: `linear-gradient(90deg, ${PURPLE} 0%, ${PURPLE_DEEP} 100%)` }} />
          </div>
        </div>
        <div className="grid grid-cols-3 px-1 py-2 divide-x divide-slate-100">
          <div className="px-2">
            <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-wide flex items-center gap-0.5"><Box size={9} /> Units</div>
            <div className="flex items-baseline gap-1"><span className="text-[15px] font-bold text-slate-900">{project.modularStats?.setToday || 9}</span><span className="text-[9px] text-green-700 font-bold">↑+12.5%</span></div>
          </div>
          <div className="px-2">
            <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-wide flex items-center gap-0.5"><Clock size={9} /> Hours</div>
            <div className="flex items-baseline gap-1"><span className="text-[15px] font-bold text-slate-900">{totalHrs.toFixed(0)}h</span><span className="text-[9px] text-green-700 font-bold">↑+3%</span></div>
          </div>
          <div className="px-2">
            <div className="text-[9px] font-semibold uppercase tracking-wide flex items-center gap-0.5" style={{ color: PURPLE_DEEP }}><DollarSign size={9} /> Burn</div>
            <div className="flex items-baseline gap-1"><span className="text-[15px] font-bold" style={{ color: PURPLE_DEEP }}>{fmt$(burnToday)}</span></div>
          </div>
        </div>
      </div>

      {/* AI Daily Summary slim card with audio + transcript collapsed */}
      <div className="rounded-xl mb-3 p-3" style={{ background: `linear-gradient(135deg, ${PURPLE_LIGHT} 0%, #F5F3FF 100%)`, border: '1px solid #DDD6FE' }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 28, height: 28, backgroundColor: PURPLE }}>
            <Sparkles size={13} className="text-white" strokeWidth={2.4} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[12.5px] font-bold" style={{ color: PURPLE_DEEP }}>AI Daily Summary</span>
              <Badge tone="green">live</Badge>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white/70 p-2 mb-2 flex items-center gap-2" style={{ border: '1px solid #DDD6FE' }}>
          <button onClick={() => setAudioPlaying(p => !p)} className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 30, height: 30, backgroundColor: PURPLE }}>
            {audioPlaying ? <Pause size={13} className="text-white" /> : <Play size={13} className="text-white" />}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-end gap-[2px] h-4">
              {AUDIO_SUMMARY.waveform.slice(0, 22).map((h, i) => (
                <div key={i} className="rounded-sm" style={{ width: 2, height: `${Math.max(3, h * 0.6)}px`,
                  backgroundColor: audioPlaying && i < 9 ? PURPLE_DEEP : PURPLE,
                  opacity: audioPlaying && i < 9 ? 1 : 0.55,
                  animation: audioPlaying ? `pulseProsetMobV2 0.6s ${i * 0.04}s ease-in-out infinite alternate` : 'none' }} />
              ))}
            </div>
          </div>
          <span className="text-[10px] font-bold flex-shrink-0" style={{ color: PURPLE_DEEP }}>{fmtMMSS(AUDIO_SUMMARY.durationSec)}</span>
        </div>
        <button onClick={() => setTranscriptOpen(o => !o)} className="text-[11px] font-bold flex items-center gap-1" style={{ color: PURPLE_DEEP }}>
          {transcriptOpen ? 'Hide transcript' : 'Show transcript'} <ChevronDown size={11} className={transcriptOpen ? 'rotate-180' : ''} />
        </button>
        {transcriptOpen && (
          <div className="rounded-lg bg-white/70 p-2.5 mt-2 text-[11px] leading-relaxed" style={{ color: PURPLE_DEEP, border: '1px solid #DDD6FE' }}>
            {AUDIO_SUMMARY.transcript}
          </div>
        )}
      </div>

      {/* Big mic CTA card — primary action */}
      <button onClick={onCapture} className="w-full rounded-xl mb-3 p-3 flex items-center gap-3 active:scale-[0.99] transition-transform"
        style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, ${PURPLE_DEEP} 100%)`, color: 'white' }}>
        <div className="rounded-full bg-white/20 flex items-center justify-center flex-shrink-0" style={{ width: 44, height: 44 }}>
          <Mic size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-[13px] font-bold">Speak any update</div>
          <div className="text-[10.5px] opacity-85 leading-snug">AI routes to the right module — workers, deliveries, incidents…</div>
        </div>
        <ChevronRight size={16} className="opacity-80" />
      </button>

      {/* Sub-modules grid — primary content */}
      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2 px-1 mt-1">On-site sub-modules</div>
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {modules.map(m => (
          <button key={m.id} onClick={() => onPick(m.id)} className="rounded-xl bg-white border border-slate-200 p-3 text-left active:scale-[0.97] transition-transform">
            <div className="rounded-lg flex items-center justify-center mb-2" style={{ width: 36, height: 36, backgroundColor: m.color }}>
              <m.icon size={16} style={{ color: m.fg }} />
            </div>
            <div className="text-[13px] font-bold text-slate-900">{m.label}</div>
            <div className="text-[10.5px] text-slate-500 mt-0.5">{m.count}</div>
          </button>
        ))}
      </div>

      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2 px-1">Existing modules · out of PLAT-104 scope</div>
      <div className="grid grid-cols-2 gap-2.5">
        {disabled.map(m => (
          <div key={m.id} className="rounded-xl bg-white border border-slate-200 p-3 text-left opacity-50">
            <div className="rounded-lg flex items-center justify-center mb-2 bg-slate-100" style={{ width: 36, height: 36 }}>
              <m.icon size={16} className="text-slate-500" />
            </div>
            <div className="text-[13px] font-bold text-slate-900">{m.label}</div>
            <div className="text-[10.5px] text-slate-500 mt-0.5">existing — preserved</div>
          </div>
        ))}
      </div>
      <div className="h-20" />
    </div>
  );
};

// ============================================================================
// LEGACY DASHBOARD (kept available but no longer the primary mobile view)
// ============================================================================
const DashboardScreen = ({ project, onCapture, onNavSubModule }) => {
  const [dateView, setDateView] = useState('today');
  const totalHrs = SEED_PERSONNEL.reduce((s, p) => s + p.hours, 0);
  const laborCost = SEED_PERSONNEL.reduce((s, p) => s + p.hours * p.wageRate, 0);
  const equipCost = SEED_EQUIPMENT.filter(e => e.status === 'ACTIVE').reduce((s, e) => s + e.dayRate * e.qty, 0);
  const matCost = SEED_DELIVERIES.filter(d => d.status === 'Received').reduce((s, d) => s + d.value, 0);
  const burnToday = laborCost + equipCost + matCost;
  const tones = { purple: PURPLE_LIGHT, amber: WARN_BG, green: SUCCESS_BG, red: DANGER_BG };
  const colors = { purple: PURPLE_DEEP, amber: '#92400E', green: '#166534', red: '#991B1B' };
  return (
    <div className="px-3 py-3">
      <AICapturedBanner onCapture={onCapture} />

      {/* Date pills */}
      <div className="flex items-center gap-1 mb-3 rounded-xl border border-slate-200 bg-white p-1 overflow-x-auto">
        {[
          { id: 'yesterday', label: 'Yesterday' },
          { id: 'today',     label: 'Today' },
          { id: 'week',      label: 'Week' },
          { id: 'month',     label: 'Month' },
        ].map(o => {
          const active = dateView === o.id;
          return (
            <button key={o.id} onClick={() => setDateView(o.id)}
              className={cls('rounded-lg px-3 py-1.5 text-[11px] font-bold flex-1 whitespace-nowrap', active ? 'text-white' : 'text-slate-600')}
              style={{ backgroundColor: active ? PURPLE : undefined }}>
              {o.label}
            </button>
          );
        })}
      </div>

      <ProjectHeaderStrip project={project} totalHrs={totalHrs} laborCost={laborCost} burnToday={burnToday} equipCost={equipCost} matCost={matCost} />

      <AIDailyHero project={project} audio={AUDIO_SUMMARY} dateView={dateView} />

      <WeatherCard project={project} />

      {/* Today's site activity */}
      <Card icon={Clock} title="Today's site activity" action={<Badge tone="purple">all from voice</Badge>} updatedAt="4:30 PM" updatedBy="Erik Odowd" source="VOICE">
        <div className="space-y-1.5">
          {ACTIVITY_TIMELINE.map((a, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="rounded-md flex items-center justify-center flex-shrink-0" style={{ width: 24, height: 24, backgroundColor: tones[a.tone] }}>
                <a.icon size={12} style={{ color: colors[a.tone] }} strokeWidth={2.2} />
              </div>
              <div className="text-[12px] font-semibold text-slate-900 flex-1 truncate">{a.text}</div>
              <span className="text-[10px] text-slate-500 flex-shrink-0">{a.when}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="h-3" />

      {/* Personnel summary mini */}
      <Card icon={Users} title="Personnel · today" action={<button onClick={() => onNavSubModule('personnel')} className="text-[10px] font-bold text-purple-700">All →</button>} updatedAt="6:30 AM" updatedBy="Erik Odowd" source="VOICE">
        <div className="grid grid-cols-3 gap-2 mb-2">
          <KPITile label="On site"      value={SEED_PERSONNEL.filter(p => p.checkIn).length} accent />
          <KPITile label="Total hours"   value={`${totalHrs.toFixed(0)}h`} />
          <KPITile label="Labor cost"   value={fmt$(laborCost)} />
        </div>
        <div className="text-[10px] text-slate-500 italic">Tap "All →" for full crew + trade roll-up</div>
      </Card>

      <div className="h-3" />

      {/* Module AI summary cards */}
      {Object.entries({
        personnel: { icon: Users, title: 'Personnel commentary', tab: 'personnel' },
        materials: { icon: Package, title: 'Materials commentary', tab: 'materials' },
        equipment: { icon: Wrench, title: 'Equipment commentary', tab: 'equipment' },
      }).map(([key, meta]) => (
        <React.Fragment key={key}>
          <Card icon={meta.icon} title={meta.title} action={<button onClick={() => onNavSubModule(meta.tab)} className="text-[10px] font-bold text-purple-700">View →</button>} updatedAt="2:30 PM" updatedBy="Erik Odowd" source="VOICE">
            <div className="space-y-2">
              {(SEED_COMMENTARY[key] || []).map(e => (
                <div key={e.id} className="flex items-start gap-2 border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">
                  <Sparkles size={11} style={{ color: PURPLE }} className="mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11.5px] font-semibold text-slate-900 leading-snug">{e.summary}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{e.author} · {e.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <div className="h-3" />
        </React.Fragment>
      ))}

      {/* Toolbox card */}
      <Card icon={ShieldCheck} title="Safety & meetings" action={<button onClick={() => onNavSubModule('safety')} className="text-[10px] font-bold text-purple-700">All →</button>} updatedAt="12:30 PM" updatedBy="Erik Odowd" source="VOICE">
        <div className="space-y-2">
          {SEED_TOOLBOX.map(t => (
            <div key={t.id} className="rounded-lg border border-slate-200 p-2.5">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="text-[12px] font-bold text-slate-900">{t.topic}</span>
                <Badge tone="purple">{t.attendees} attendees</Badge>
              </div>
              <div className="text-[10px] text-slate-500">{t.time} · {t.durationMin} min · led by {t.lead}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="h-3" />

      {/* Notes */}
      <Card icon={StickyNote} title="Notes" action={<button onClick={() => onNavSubModule('notes')} className="text-[10px] font-bold text-purple-700">All →</button>} updatedAt="2:50 PM" updatedBy="Erik Odowd" source="VOICE">
        <div className="space-y-2">
          {SEED_NOTES.filter(n => n.pinned).slice(0, 3).map(n => (
            <div key={n.id} className="rounded-lg border border-slate-200 p-2.5">
              <div className="flex items-start gap-1.5">
                <Pin size={10} style={{ color: PURPLE }} className="mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-slate-900 truncate">{n.title}</div>
                  <div className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-snug">{n.body}</div>
                  <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                    <span className="text-[9.5px] text-slate-500">{n.author} · {n.date}</span>
                    {n.tags.slice(0, 2).map(t => <span key={t} className="text-[9px] font-bold rounded px-1 py-0.5 bg-slate-100 text-slate-600">#{t}</span>)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="h-3" />

      {/* Footer cards stacked */}
      <Card icon={Eye} title="Inspections today" updatedAt="10:15 AM" updatedBy="Erik Odowd" source="VOICE">
        <div className="space-y-1.5">
          {SEED_INSPECTIONS.map(i => (
            <div key={i.id} className="flex items-start gap-2">
              <Badge tone={i.status === 'Pass' ? 'green' : 'amber'}>{i.status}</Badge>
              <div className="flex-1 min-w-0">
                <div className="text-[11.5px] font-bold text-slate-900 truncate">{i.type}</div>
                <div className="text-[10.5px] text-slate-600 line-clamp-2">{i.notes}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="h-3" />

      <Card icon={IdCard} title="Visitors today" updatedAt="2:00 PM" updatedBy="Erik Odowd" source="VOICE">
        <div className="space-y-1.5">
          {SEED_VISITORS.map(v => (
            <div key={v.id} className="flex items-start gap-2">
              <Avatar initials={v.name.split(' ').map(n => n[0]).join('').slice(0,2)} size="xs" tone="amber" />
              <div className="flex-1 min-w-0">
                <div className="text-[11.5px] font-bold text-slate-900 truncate">{v.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{v.org} · {v.timeIn}–{v.timeOut || 'on site'}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="h-20" />
    </div>
  );
};

// ON-SITE MODULES GRID
const OnSiteScreen = ({ onPick }) => {
  const modules = [
    { id: 'personnel',   label: 'Personnel',           icon: Users,         count: `${SEED_PERSONNEL.length} on site`,  color: PURPLE_LIGHT, fg: PURPLE_DEEP },
    { id: 'deliveries',  label: 'Deliveries',          icon: Truck,         count: `${SEED_DELIVERIES.length} today`,  color: '#DCFCE7',     fg: '#166534' },
    { id: 'safety',      label: 'Safety & Meetings',   icon: ShieldCheck,   count: `${SEED_TOOLBOX.length} today`,      color: '#DBEAFE',     fg: '#1E40AF' },
    { id: 'incidents',   label: 'Incidents & Delays',  icon: AlertOctagon,  count: `${SEED_INCIDENTS.length} today`,    color: '#FEF3C7',     fg: '#92400E' },
    { id: 'inspections', label: 'Inspections',         icon: Eye,           count: `${SEED_INSPECTIONS.length} today`,  color: '#FCE7F3',     fg: '#831843' },
    { id: 'equipment',   label: 'Equipment',           icon: Wrench,        count: `${SEED_EQUIPMENT.length} on site`,  color: '#FFEDD5',     fg: '#7C2D12' },
    { id: 'materials',   label: 'Materials',           icon: Package,       count: `${SEED_MATERIALS.length} line items`,color: '#E0E7FF',    fg: '#3730A3' },
    { id: 'notes',       label: 'Notes',               icon: StickyNote,    count: `${SEED_NOTES.length} captured`,     color: '#F0FDF4',     fg: '#166534' },
  ];
  const disabled = [
    { id: 'changeorders', label: 'Change Orders', icon: Edit3 },
    { id: 'library',      label: 'Library',       icon: FolderOpen },
    { id: 'sov',          label: 'SOV',           icon: Receipt },
    { id: 'prejob',       label: 'Pre-Job',       icon: ShieldCheck },
  ];
  return (
    <div className="px-3 py-3">
      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2 px-1">On-site sub-modules</div>
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {modules.map(m => (
          <button key={m.id} onClick={() => onPick(m.id)} className="rounded-xl bg-white border border-slate-200 p-3 text-left active:scale-[0.97] transition-transform">
            <div className="rounded-lg flex items-center justify-center mb-2" style={{ width: 36, height: 36, backgroundColor: m.color }}>
              <m.icon size={16} style={{ color: m.fg }} />
            </div>
            <div className="text-[13px] font-bold text-slate-900">{m.label}</div>
            <div className="text-[10.5px] text-slate-500 mt-0.5">{m.count}</div>
          </button>
        ))}
      </div>
      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2 px-1">Existing modules · out of PLAT-104 scope</div>
      <div className="grid grid-cols-2 gap-2.5">
        {disabled.map(m => (
          <div key={m.id} className="rounded-xl bg-white border border-slate-200 p-3 text-left opacity-50">
            <div className="rounded-lg flex items-center justify-center mb-2 bg-slate-100" style={{ width: 36, height: 36 }}>
              <m.icon size={16} className="text-slate-500" />
            </div>
            <div className="text-[13px] font-bold text-slate-900 flex items-center gap-1">{m.label}</div>
            <div className="text-[10.5px] text-slate-500 mt-0.5">existing — preserved</div>
          </div>
        ))}
      </div>
      <div className="h-20" />
    </div>
  );
};

// SUB-MODULE SCREENS
const SubModuleHeader = ({ title, subtitle, onBack }) => (
  <div className="sticky top-[60px] z-10 bg-slate-50 px-3 py-2 flex items-center gap-3 border-b border-slate-200">
    <button onClick={onBack} className="rounded-full bg-white border border-slate-200 flex items-center justify-center" style={{ width: 32, height: 32 }}>
      <ArrowLeft size={14} className="text-slate-700" />
    </button>
    <div className="flex-1 min-w-0">
      <div className="text-[14px] font-bold text-slate-900 truncate">{title}</div>
      {subtitle && <div className="text-[10.5px] text-slate-500 truncate">{subtitle}</div>}
    </div>
  </div>
);

const PersonnelScreen = ({ onBack, onCreate }) => {
  const totalHrs = SEED_PERSONNEL.reduce((s,p) => s + p.hours, 0);
  const totalCost = SEED_PERSONNEL.reduce((s,p) => s + p.hours * p.wageRate, 0);
  const subs = SEED_PERSONNEL.filter(p => p.sub).length;
  return (
    <>
      <SubModuleHeader title="Personnel" subtitle={`${SEED_PERSONNEL.length} on site · ${SEED_PERSONNEL.length - subs} GC + ${subs} sub`} onBack={onBack} />
      <div className="px-3 py-3">
        <VoiceCommentaryCard entries={SEED_COMMENTARY.personnel} moduleLabel="Personnel" />

        <div className="grid grid-cols-3 gap-2 mb-3">
          <KPITile label="On site"      value={SEED_PERSONNEL.length} accent />
          <KPITile label="Total hrs"     value={`${totalHrs.toFixed(0)}h`} />
          <KPITile label="Labor"        value={fmt$(totalCost)} />
        </div>

        <Card icon={Users} title="Crew · today" noPad>
          <div className="divide-y divide-slate-100">
            {SEED_PERSONNEL.map(p => (
              <div key={p.id} className="px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <Avatar initials={p.avatar} size="sm" tone={p.sub ? 'amber' : 'purple'} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-bold text-slate-900 truncate">{p.name}{p.sub && <span className="ml-1 text-[9px] font-bold rounded px-1 py-0.5 bg-amber-100 text-amber-800">SUB</span>}</div>
                    <div className="text-[10px] text-slate-500 truncate">{p.empId} · {p.role} · {p.scopeToday}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[12px] font-bold text-slate-900">{p.hours.toFixed(1)}h</div>
                    <div className="text-[10px] font-bold" style={{ color: PURPLE_DEEP }}>{fmt$(p.hours * p.wageRate)}</div>
                  </div>
                </div>
                <MobileNotesExcerpt notes={p.notes} />
              </div>
            ))}
          </div>
        </Card>
        <div className="h-20" />
      </div>
      <SubModuleMicFAB onClick={() => onCreate('personnel')} />
    </>
  );
};

const DeliveriesScreen = ({ onBack, onCreate }) => {
  const received = SEED_DELIVERIES.filter(d => d.status === 'Received').length;
  const damaged = SEED_DELIVERIES.filter(d => d.status === 'Damaged').length;
  const value = SEED_DELIVERIES.filter(d => d.status === 'Received').reduce((s,d) => s + d.value, 0);
  return (
    <>
      <SubModuleHeader title="Deliveries" subtitle={`${SEED_DELIVERIES.length} today · ${received} received`} onBack={onBack} />
      <div className="px-3 py-3">
        <VoiceCommentaryCard entries={SEED_COMMENTARY.deliveries} moduleLabel="Deliveries" />
        <div className="grid grid-cols-3 gap-2 mb-3">
          <KPITile label="Today"    value={SEED_DELIVERIES.length} accent />
          <KPITile label="Received" value={received} success />
          <KPITile label="Damaged"  value={damaged} alert={damaged > 0} />
        </div>
        <Card icon={Truck} title={`Today's drops · ${fmt$(value)} received`} noPad>
          <div className="divide-y divide-slate-100">
            {SEED_DELIVERIES.map(d => (
              <div key={d.id} className="px-3 py-2.5">
                <div className="flex items-start gap-2">
                  <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ width: 32, height: 32, backgroundColor: '#DCFCE7' }}>
                    <Truck size={14} className="text-green-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-bold text-slate-900 truncate">{d.materials}</div>
                    <div className="text-[10.5px] text-slate-500 truncate">{d.supplier} · {d.poNumber}</div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <Badge tone={d.status === 'Received' ? 'green' : d.status === 'Damaged' ? 'red' : 'amber'}>{d.status}</Badge>
                      <span className="text-[10px] text-slate-500">{d.date}</span>
                      <span className="text-[10px] text-slate-500">· {d.quantity} {d.unit}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[12px] font-bold" style={{ color: PURPLE_DEEP }}>{fmt$(d.value)}</div>
                  </div>
                </div>
                <MobileNotesExcerpt notes={d.notes} />
              </div>
            ))}
          </div>
        </Card>
        <div className="h-20" />
      </div>
      <SubModuleMicFAB onClick={() => onCreate('delivery')} />
    </>
  );
};

const SafetyScreen = ({ onBack, onCreate }) => {
  const totalAttendees = SEED_TOOLBOX.reduce((s, t) => s + t.attendees, 0);
  return (
    <>
      <SubModuleHeader title="Safety & Meetings" subtitle={`${SEED_TOOLBOX.length} talks · ${totalAttendees} attendees`} onBack={onBack} />
      <div className="px-3 py-3">
        <div className="rounded-xl mb-3 p-3" style={{ background: `linear-gradient(135deg, ${PURPLE_LIGHT} 0%, #F5F3FF 100%)`, border: '1px solid #DDD6FE' }}>
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={13} style={{ color: PURPLE_DEEP }} />
            <span className="text-[12px] font-bold" style={{ color: PURPLE_DEEP }}>Today's safety narrative</span>
            <Badge tone="green">PPE 95%</Badge>
          </div>
          <div className="text-[11.5px] leading-relaxed" style={{ color: PURPLE_DEEP }}>
            EE's are consistently doing a great job at chalking their wheels, wearing PPE and overall adhering to safety guidelines. 2 PM meeting with Target/Bechtel — boom lift safety standards discussed. Wind cutoff thresholds documented.
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <KPITile label="Talks"     value={SEED_TOOLBOX.length} accent />
          <KPITile label="Attendees" value={totalAttendees} />
          <KPITile label="Avg duration" value={`${Math.round(SEED_TOOLBOX.reduce((s,t) => s + t.durationMin, 0) / Math.max(1, SEED_TOOLBOX.length))}m`} />
        </div>
        <div className="space-y-2.5">
          {SEED_TOOLBOX.map(t => (
            <Card key={t.id}>
              <div className="flex items-start gap-2">
                <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ width: 32, height: 32, backgroundColor: PURPLE_LIGHT }}>
                  <ShieldCheck size={14} style={{ color: PURPLE_DEEP }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-bold text-slate-900">{t.topic}</div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <Badge tone="purple">{t.attendees} attendees</Badge>
                    <Badge tone="slate">{t.durationMin} min</Badge>
                  </div>
                  <div className="text-[10.5px] text-slate-500 mt-1">Led by {t.lead} · {t.time}</div>
                  <MobileNotesExcerpt notes={t.notes} />
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="h-20" />
      </div>
      <SubModuleMicFAB onClick={() => onCreate('safetyMeeting')} />
    </>
  );
};

const IncidentsScreen = ({ onBack, onCreate }) => {
  const [filter, setFilter] = useState('all');
  const filtered = SEED_INCIDENTS.filter(e => filter === 'all' || (filter === 'incidents' && e.kind === 'INCIDENT') || (filter === 'delays' && e.kind === 'DELAY'));
  const open = SEED_INCIDENTS.filter(e => e.status === 'OPEN').length;
  const co = SEED_INCIDENTS.filter(e => e.changeOrderTrigger).length;
  const impact = SEED_INCIDENTS.reduce((s, e) => s + (e.impactHours || 0), 0);
  return (
    <>
      <SubModuleHeader title="Incidents & Delays" subtitle={`${SEED_INCIDENTS.length} today · ${open} open`} onBack={onBack} />
      <div className="px-3 py-3">
        <VoiceCommentaryCard entries={SEED_COMMENTARY.incidents} moduleLabel="Incidents" />
        <div className="grid grid-cols-3 gap-2 mb-3">
          <KPITile label="Open"          value={open}    alert={open > 0} accent />
          <KPITile label="CO triggers"    value={co}      sub="possible CO" />
          <KPITile label="Schedule impact" value={`${impact.toFixed(1)}h`} alert={impact > 0} />
        </div>
        <div className="flex items-center gap-1 mb-3 rounded-xl border border-slate-200 bg-white p-1">
          {[{ id: 'all', label: 'All' }, { id: 'incidents', label: 'Incidents' }, { id: 'delays', label: 'Delays' }].map(o => (
            <button key={o.id} onClick={() => setFilter(o.id)}
              className={cls('rounded-lg px-3 py-1.5 text-[11px] font-bold flex-1', filter === o.id ? 'text-white' : 'text-slate-600')}
              style={{ backgroundColor: filter === o.id ? PURPLE : undefined }}>
              {o.label}
            </button>
          ))}
        </div>
        <div className="space-y-2.5">
          {filtered.map(e => (
            <Card key={e.id}>
              <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                <Badge tone={e.kind === 'INCIDENT' ? 'red' : 'amber'}>{e.kind === 'INCIDENT' ? '⚠ Incident' : '⏱ Delay'}</Badge>
                {e.kind === 'INCIDENT' && e.severity && <Badge tone="slate">{SEV_META[e.severity]?.label}</Badge>}
                {e.kind === 'DELAY' && e.category && <Badge tone="slate">{e.category}</Badge>}
                <Badge tone={e.status === 'OPEN' ? 'amber' : 'green'}>{e.status}</Badge>
                {e.changeOrderTrigger && <Badge tone="amber">⚡ CO trigger</Badge>}
              </div>
              <div className="text-[13px] font-bold text-slate-900 mb-1">{e.title}</div>
              <div className="text-[11.5px] text-slate-700 leading-relaxed">{e.description}</div>
              {e.actionTaken && (
                <div className="mt-2 rounded-lg p-2 text-[10.5px]" style={{ backgroundColor: INFO_BG, color: '#1E40AF' }}>
                  <strong>Action:</strong> {e.actionTaken}
                </div>
              )}
              <div className="mt-2 flex items-center gap-3 text-[10.5px] text-slate-600">
                {e.impactHours > 0 && <span><Clock size={9} className="inline mr-0.5" /> {e.impactHours}h slip</span>}
                {e.costImpact > 0 && <span><DollarSign size={9} className="inline mr-0.5" /> {fmt$(e.costImpact)}</span>}
                <span className="ml-auto text-slate-400">{e.time} · {e.reportedBy}</span>
              </div>
              <MobileNotesExcerpt notes={e.notes} />
            </Card>
          ))}
        </div>
        <div className="h-20" />
      </div>
      <SubModuleMicFAB onClick={() => onCreate('incident')} danger />
    </>
  );
};

const InspectionsScreen = ({ onBack, onCreate }) => (
  <>
    <SubModuleHeader title="Inspections" subtitle={`${SEED_INSPECTIONS.length} today`} onBack={onBack} />
    <div className="px-3 py-3">
      <div className="grid grid-cols-3 gap-2 mb-3">
        <KPITile label="Today" value={SEED_INSPECTIONS.length} accent />
        <KPITile label="Pass"  value={SEED_INSPECTIONS.filter(i => i.status === 'Pass').length} success />
        <KPITile label="Notes" value={SEED_INSPECTIONS.filter(i => i.status === 'Pass with notes').length} />
      </div>
      <div className="space-y-2.5">
        {SEED_INSPECTIONS.map(i => (
          <Card key={i.id}>
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <Badge tone={i.status === 'Pass' ? 'green' : 'amber'}>{i.status}</Badge>
              <span className="text-[10px] text-slate-500 ml-auto">{i.date} · {i.inspector}</span>
            </div>
            <div className="text-[13px] font-bold text-slate-900 mb-1">{i.type}</div>
            <MobileNotesExcerpt notes={i.notes} />
          </Card>
        ))}
      </div>
      <div className="h-20" />
    </div>
    <SubModuleMicFAB onClick={() => onCreate('inspection')} />
  </>
);

const EquipmentScreen = ({ onBack, onCreate }) => {
  const active = SEED_EQUIPMENT.filter(e => e.status === 'ACTIVE').length;
  const equipCost = SEED_EQUIPMENT.filter(e => e.status === 'ACTIVE').reduce((s,e) => s + e.dayRate * e.qty, 0);
  const totalHrs = SEED_EQUIPMENT.reduce((s,e) => s + e.hoursToday, 0);
  return (
    <>
      <SubModuleHeader title="Equipment" subtitle={`${active} active · ${fmt$(equipCost)} today`} onBack={onBack} />
      <div className="px-3 py-3">
        <VoiceCommentaryCard entries={SEED_COMMENTARY.equipment} moduleLabel="Equipment" />
        <div className="grid grid-cols-3 gap-2 mb-3">
          <KPITile label="Active"        value={active} accent />
          <KPITile label="Hours today"   value={`${totalHrs.toFixed(1)}h`} />
          <KPITile label="Cost today"    value={fmt$(equipCost)} />
        </div>
        <div className="space-y-2.5">
          {SEED_EQUIPMENT.map(e => (
            <Card key={e.id}>
              <div className="flex items-start gap-2">
                <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ width: 32, height: 32, backgroundColor: '#FFEDD5' }}>
                  <Wrench size={14} style={{ color: '#7C2D12' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                    <span className="text-[12.5px] font-bold text-slate-900">{e.name}</span>
                    <Badge tone="slate">× {e.qty}</Badge>
                    {e.flag && <Badge tone="red">{e.flag}</Badge>}
                    {e.note && <Badge tone="green">New</Badge>}
                  </div>
                  <div className="text-[10.5px] text-slate-500">{e.type}</div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-700">
                    <span><Clock size={9} className="inline mr-0.5" /> {e.hoursToday}h</span>
                    {e.status === 'ACTIVE' && <span><DollarSign size={9} className="inline mr-0.5" /> {fmt$(e.dayRate * e.qty)}</span>}
                    {e.status === 'IN_MAINTENANCE' && <span className="text-amber-700 font-bold">In maintenance</span>}
                  </div>
                  <MobileNotesExcerpt notes={e.notes} />
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="h-20" />
      </div>
      <SubModuleMicFAB onClick={() => onCreate('equipment')} />
    </>
  );
};

const MaterialsScreen = ({ onBack, onCreate }) => {
  const totalValue = SEED_MATERIALS.reduce((s,m) => s + m.value, 0);
  const short = SEED_MATERIALS.filter(m => m.status === 'short').length;
  const damaged = SEED_MATERIALS.filter(m => m.status === 'damaged').length;
  return (
    <>
      <SubModuleHeader title="Materials" subtitle={`${SEED_MATERIALS.length} line items · ${fmt$(totalValue)}`} onBack={onBack} />
      <div className="px-3 py-3">
        <VoiceCommentaryCard entries={SEED_COMMENTARY.materials} moduleLabel="Materials" />
        <div className="grid grid-cols-3 gap-2 mb-3">
          <KPITile label="Line items"  value={SEED_MATERIALS.length} accent />
          <KPITile label="Short"        value={short}      alert={short > 0} />
          <KPITile label="Damaged"      value={damaged}    alert={damaged > 0} />
        </div>
        <div className="space-y-2.5">
          {SEED_MATERIALS.map(m => {
            const variance = m.received - m.needed;
            const pct = m.needed > 0 ? Math.min(100, (m.received / m.needed) * 100) : 100;
            const barColor = variance < 0 ? '#DC2626' : m.status === 'damaged' ? '#F59E0B' : m.status === 'pending' ? '#94A3B8' : '#10B981';
            return (
              <Card key={m.id}>
                <div className="flex items-start gap-1.5 mb-1.5 flex-wrap">
                  <span className="text-[12.5px] font-bold text-slate-900">{m.name}</span>
                  {variance < 0 && <Badge tone="red">SHORT {variance}</Badge>}
                  {m.status === 'damaged' && <Badge tone="amber">DMG</Badge>}
                  {m.status === 'pending' && <Badge tone="slate">Pending</Badge>}
                  {m.status === 'ok' && <Badge tone="green">OK</Badge>}
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10.5px] text-slate-500">{m.category} · {m.poNumber}</span>
                  <span className="text-[11px] font-bold text-slate-700">{m.received} / {m.needed} {m.unit}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                </div>
                <div className="text-[11px] font-bold mt-1.5" style={{ color: PURPLE_DEEP }}>{fmt$(m.value)}</div>
                <MobileNotesExcerpt notes={m.notes || m.note} />
              </Card>
            );
          })}
        </div>
        <div className="h-20" />
      </div>
      <SubModuleMicFAB onClick={() => onCreate('material')} />
    </>
  );
};

const NotesScreen = ({ onBack, onCreate }) => {
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const allTags = Array.from(new Set(SEED_NOTES.flatMap(n => n.tags || [])));
  const filtered = SEED_NOTES.filter(n =>
    (!search || n.title.toLowerCase().includes(search.toLowerCase()) || n.body.toLowerCase().includes(search.toLowerCase())) &&
    (tagFilter === 'all' || (n.tags || []).includes(tagFilter))
  );
  const pinned = filtered.filter(n => n.pinned);
  const others = filtered.filter(n => !n.pinned);
  return (
    <>
      <SubModuleHeader title="Notes" subtitle={`${SEED_NOTES.length} captured · ${SEED_NOTES.filter(n => n.pinned).length} pinned`} onBack={onBack} />
      <div className="px-3 py-3">
        <div className="rounded-xl bg-white border border-slate-200 mb-3 px-3 py-2 flex items-center gap-2">
          <Search size={14} className="text-slate-400 flex-shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes…" className="flex-1 text-[13px] focus:outline-none bg-transparent" />
        </div>
        <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
          {[{ id: 'all', label: 'All' }, ...allTags.map(t => ({ id: t, label: `#${t}` }))].map(t => {
            const active = tagFilter === t.id;
            return (
              <button key={t.id} onClick={() => setTagFilter(t.id)}
                className={cls('rounded-full px-3 py-1.5 text-[11px] font-bold flex-shrink-0', active ? 'text-white' : 'bg-slate-100 text-slate-600')}
                style={{ backgroundColor: active ? PURPLE : undefined }}>
                {t.label}
              </button>
            );
          })}
        </div>
        {pinned.length > 0 && (
          <div className="mb-3">
            <div className="text-[10.5px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 flex items-center gap-1"><Pin size={10} style={{ color: PURPLE }} /> Pinned</div>
            <div className="space-y-2">{pinned.map(n => <NoteCard key={n.id} n={n} />)}</div>
          </div>
        )}
        {others.length > 0 && (
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">All notes</div>
            <div className="space-y-2">{others.map(n => <NoteCard key={n.id} n={n} />)}</div>
          </div>
        )}
        <div className="h-20" />
      </div>
      <SubModuleMicFAB onClick={() => onCreate('note')} />
    </>
  );
};

const NoteCard = ({ n }) => (
  <Card>
    <div className="flex items-start gap-1.5 mb-1">
      <Avatar initials={n.avatar} size="xs" />
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-bold text-slate-900 truncate">{n.title}</div>
        <div className="text-[10px] text-slate-500">{n.author} · {n.date}</div>
      </div>
      {n.pinned && <Pin size={10} style={{ color: PURPLE, fill: PURPLE }} />}
    </div>
    <div className="text-[11.5px] text-slate-700 leading-snug">{n.body}</div>
    {(n.tags || []).length > 0 && (
      <div className="flex items-center gap-1 mt-1.5 flex-wrap">
        {n.tags.map(t => <span key={t} className="text-[9px] font-bold rounded px-1 py-0.5 bg-slate-100 text-slate-600">#{t}</span>)}
      </div>
    )}
  </Card>
);

// REPORTS SCREEN
const ReportsScreen = ({ project }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  return (
    <div className="px-3 py-3">
      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2 px-1">Today</div>
      <Card icon={FileText} title="Daily Field Report · today" updatedAt="5:30 PM" updatedBy="Auto-compiled" source="VOICE">
        <div className="text-[11.5px] text-slate-700 leading-relaxed mb-3">
          {project.name} · Mon, 5 May 2026 · 9 units installed · 248 crew hours · 1 CO trigger flagged
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPreviewOpen(true)} className="flex-1 rounded-lg border-2 border-slate-200 bg-white py-2 text-[12px] font-bold text-slate-700 flex items-center justify-center gap-1">
            <Eye size={12} /> Preview PDF
          </button>
          <button onClick={() => setShareOpen(true)} className="flex-1 rounded-lg text-white py-2 text-[12px] font-bold flex items-center justify-center gap-1" style={{ backgroundColor: PURPLE }}>
            <Share2 size={12} /> Quick Share
          </button>
        </div>
      </Card>

      <div className="h-3" />

      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2 px-1">This week</div>
      <Card icon={BarChart3} title="Weekly Report · Apr 14–20">
        <div className="grid grid-cols-3 gap-2 mb-2">
          <KPITile label="Mods set"   value={44} />
          <KPITile label="Crew hrs"    value="1.6K" />
          <KPITile label="Open flags"  value={3} />
        </div>
        <div className="text-[11.5px] text-slate-700 leading-relaxed mb-2">
          On track for Dorm 19 completion Friday April 18. Crew avg 248h/week. 3 incidents recorded, 0 OSHA-recordable. Material spend on plan.
        </div>
        <button className="w-full rounded-lg border border-slate-200 py-2 text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1">
          View weekly report <ChevronRight size={11} />
        </button>
      </Card>

      <div className="h-3" />

      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2 px-1">Past reports</div>
      <Card noPad>
        <div className="divide-y divide-slate-100">
          {[
            { d: 'Sun · 4 May 2026', meta: '8 mods · 240h · clear AM' },
            { d: 'Sat · 3 May 2026', meta: '5 mods · 88h · half day' },
            { d: 'Fri · 2 May 2026', meta: '9 mods · 252h · owner walkthrough' },
            { d: 'Thu · 1 May 2026', meta: '6 mods · 252h · rain in PM' },
            { d: 'Wed · 30 Apr 2026',meta: '8 mods · 248h' },
          ].map((r, i) => (
            <button key={i} className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-50 text-left">
              <FileText size={14} className="text-slate-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-bold text-slate-900">{r.d}</div>
                <div className="text-[10.5px] text-slate-500 truncate">{r.meta}</div>
              </div>
              <ChevronRight size={12} className="text-slate-300" />
            </button>
          ))}
        </div>
      </Card>

      <div className="h-20" />

      {previewOpen && <PdfPreviewModal project={project} onClose={() => setPreviewOpen(false)} />}
      {shareOpen && <QuickShareModal project={project} onClose={() => setShareOpen(false)} />}
    </div>
  );
};

const PdfPreviewModal = ({ project, onClose }) => (
  <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col">
    <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
      <button onClick={onClose} className="rounded-full bg-slate-700 flex items-center justify-center" style={{ width: 32, height: 32 }}>
        <X size={14} className="text-white" />
      </button>
      <div className="text-[13px] font-bold text-white">Daily Field Report</div>
      <div className="flex gap-1.5">
        <button className="rounded-md bg-slate-700 text-white px-2.5 py-1 text-[10.5px] font-bold flex items-center gap-1"><Download size={11} /></button>
        <button className="rounded-md text-white px-2.5 py-1 text-[10.5px] font-bold flex items-center gap-1" style={{ backgroundColor: PURPLE }}><Share2 size={11} /></button>
      </div>
    </div>
    <div className="flex-1 overflow-y-auto bg-slate-200 px-3 py-4">
      <div className="bg-white rounded-md shadow-md mx-auto" style={{ maxWidth: 380, padding: '20px 24px' }}>
        <div className="border-b-2 pb-2 mb-3" style={{ borderColor: PURPLE }}>
          <div className="text-[15px] font-bold" style={{ color: PURPLE_DEEP }}>Daily Field Report</div>
          <div className="text-[10px] text-slate-700 mt-0.5">{project.name} · {project.client}</div>
          <div className="text-[10px] text-slate-700">Mon · 5 May 2026 · Sup: {project.supervisor}</div>
        </div>
        {[
          { title: '1. Production Summary',  body: '9 units installed today (D19/786-2 → 786-21). Total 44 of 696 (6.35%). Crew of 15 logged 248h labor.' },
          { title: '2. Employees',           body: 'Juan Alencastro · Setter · 10.75h\nEric Cortez · Setter · 10.78h\nCarlos Cruz · Setter · 10.77h\n+ 12 more (see Personnel)' },
          { title: '3. Toolbox Talks',       body: '· 6:35 AM · Boom lift fall protection — 14 attendees (12 min)\n· 12:30 PM · High-wind crane operation — 13 attendees (8 min)' },
          { title: '4. Tasks Worked On',     body: 'Began setting Dorm 19, starting with stairwell box. Crane set mods D19/786-2, 786-3, 786-11, 786-4, 786-10, 786-12, 786-13, 786-21.' },
          { title: '5. Problems / Delays',   body: 'Unexpected crane move mid-day. 786-A2 stairwell box too wide; removed and cut wire per Dave Ault. Logged to Target HSI.' },
          { title: '6. Communications',      body: '10th unit shut-down for wind per Owner. PM Decision logged.' },
          { title: '7. Lookahead',           body: 'Dorm 19 set expected complete Friday April 18 at current pace.' },
        ].map(s => (
          <div key={s.title} className="mb-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: PURPLE_DEEP }}>{s.title}</div>
            <div className="text-[10px] text-slate-700 leading-relaxed whitespace-pre-line">{s.body}</div>
          </div>
        ))}
        <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-slate-300">
          {['Contractor Rep','Owner Rep'].map(role => (
            <div key={role}>
              <div className="text-[9px] font-bold text-slate-700 mb-4">{role}</div>
              <div className="border-b border-slate-400 mb-1" />
              <div className="text-[8px] text-slate-500">Signature · Date</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const QuickShareModal = ({ project, onClose }) => {
  const [channel, setChannel] = useState('email');
  const [sent, setSent] = useState(false);
  const channels = [
    { id: 'email', label: 'Email',     icon: Mail },
    { id: 'slack', label: 'Slack',     icon: Send },
    { id: 'sms',   label: 'SMS',       icon: Phone },
    { id: 'link',  label: 'Share link',icon: Share2 },
  ];
  return (
    <>
      <div className="fixed inset-0 bg-black/45 z-40" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
        <div className="flex justify-center pt-2 pb-1">
          <div className="rounded-full bg-slate-300" style={{ width: 36, height: 4 }} />
        </div>
        <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-200">
          <div>
            <div className="text-[14px] font-bold text-slate-900">Quick Share</div>
            <div className="text-[10px] text-slate-500">Daily Field Report · {project.name}</div>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 flex items-center justify-center" style={{ width: 28, height: 28 }}><X size={12} className="text-slate-700" /></button>
        </div>
        {sent ? (
          <div className="px-4 py-10 flex flex-col items-center text-center">
            <div className="rounded-full flex items-center justify-center mb-3" style={{ width: 56, height: 56, backgroundColor: SUCCESS_BG }}>
              <CheckCircle2 size={28} style={{ color: '#166534' }} />
            </div>
            <div className="text-[14px] font-bold text-slate-900">Shared via {channels.find(c => c.id === channel).label}</div>
            <button onClick={onClose} className="mt-5 rounded-lg text-white px-5 py-2.5 font-bold text-[13px]" style={{ backgroundColor: PURPLE }}>Done</button>
          </div>
        ) : (
          <>
            <div className="px-4 py-3 space-y-3 overflow-y-auto">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-600 mb-1.5">Channel</div>
                <div className="grid grid-cols-2 gap-2">
                  {channels.map(c => {
                    const active = channel === c.id;
                    return (
                      <button key={c.id} onClick={() => setChannel(c.id)}
                        className="rounded-lg border-2 p-2.5 flex items-center gap-2 text-left"
                        style={{ borderColor: active ? PURPLE : BORDER, backgroundColor: active ? PURPLE_LIGHT : 'white' }}>
                        <c.icon size={14} style={{ color: active ? PURPLE_DEEP : '#64748B' }} />
                        <span className="text-[12px] font-bold text-slate-900">{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-600 mb-1.5">Recipients</div>
                <input placeholder="owner@target.com, sup@erikodowd.com" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[12px] focus:outline-none focus:border-purple-400" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-600 mb-1.5">Message · auto-generated, edit if needed</div>
                <textarea rows={3} defaultValue={`Today's Daily Field Report for ${project.name} attached. 9 units installed, 1 CO trigger flagged for review.`} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[12px] focus:outline-none focus:border-purple-400 resize-none" />
              </div>
              <div className="rounded-lg p-2 flex items-start gap-2" style={{ backgroundColor: PURPLE_LIGHT }}>
                <FileText size={12} style={{ color: PURPLE_DEEP }} className="mt-0.5 flex-shrink-0" />
                <div className="text-[10.5px]" style={{ color: PURPLE_DEEP }}><strong>Attached:</strong> DailyFieldReport_2026-05-05.pdf · 7 sections</div>
              </div>
            </div>
            <div className="border-t border-slate-200 p-3 flex gap-2 pb-safe">
              <button onClick={onClose} className="flex-1 rounded-lg border border-slate-200 py-3 text-[13px] font-bold text-slate-700">Cancel</button>
              <button onClick={() => setSent(true)} className="flex-[2] rounded-lg text-white py-3 text-[13px] font-bold flex items-center justify-center gap-1.5" style={{ backgroundColor: PURPLE }}>
                <Share2 size={14} /> Send via {channels.find(c => c.id === channel).label}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

// AI SCREEN — chat shell
const AIScreen = ({ onCapture }) => {
  const [input, setInput] = useState('');
  const messages = [
    { role: 'ai', text: 'Hi Erik — I\'ve summarized today\'s site activity. 9 mods set on Dorm 19, 1 CO trigger flagged for the 786-A2 e-box. Anything you\'d like me to dig into?' },
    { role: 'user', text: 'How does today compare to last Tuesday?' },
    { role: 'ai', text: 'Last Tuesday (Apr 28) you set 8 mods with 240 crew hours. Today: 9 mods / 248h — slightly faster pace. No CO triggers last Tue, 1 today. Crew composition same.' },
    { role: 'user', text: 'Draft change order text for the 786-A2 issue' },
    { role: 'ai', text: 'Draft CO #2026-014:\n\n"Per Target Site Lead Dave Ault directive on 5/5/26, the 786-A2 stairwell e-box was modified in field due to corridor dimension conflict. Wire was cut and re-routed. Photo evidence on Target HSI platform. Estimated cost impact: $1,850 (1.0 hr crane delay + materials). Recommend ratification by Owner."\n\nWant me to send to your CO module?' },
  ];
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 pt-3 pb-2">
        <div className="rounded-xl p-3 mb-3" style={{ background: `linear-gradient(135deg, ${PURPLE_LIGHT} 0%, #F5F3FF 100%)`, border: '1px solid #DDD6FE' }}>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} style={{ color: PURPLE_DEEP }} />
            <span className="text-[13px] font-bold" style={{ color: PURPLE_DEEP }}>Ask Merlin AI</span>
          </div>
          <div className="text-[11px]" style={{ color: PURPLE_DEEP, opacity: 0.75 }}>About this project · this week · OSHA · CO drafting · weather impact</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2.5">
        {messages.map((m, i) => (
          <div key={i} className={cls('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cls('rounded-2xl px-3 py-2 max-w-[85%]', m.role === 'user' ? 'rounded-br-md text-white' : 'rounded-bl-md bg-white border border-slate-200 text-slate-800')}
              style={{ backgroundColor: m.role === 'user' ? PURPLE : undefined }}>
              <div className="text-[12.5px] leading-relaxed whitespace-pre-line">{m.text}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 bg-white px-3 py-2 flex items-center gap-2 pb-safe">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything…"
          className="flex-1 rounded-full border border-slate-200 px-3 py-2.5 text-[13px] focus:outline-none focus:border-purple-400" />
        <button onClick={onCapture} className="rounded-full text-white flex items-center justify-center" style={{ width: 40, height: 40, backgroundColor: PURPLE }}>
          <Mic size={16} />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// TOP HEADER (project, supervisor, date, projects switcher)
// ============================================================================
const TopHeader = ({ project, onProjects, showBack, onBack }) => (
  <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-3 py-2.5 flex items-center gap-2.5" style={{ height: 60 }}>
    {showBack ? (
      <button onClick={onBack} className="rounded-full bg-slate-100 flex items-center justify-center" style={{ width: 36, height: 36 }}>
        <ChevronLeft size={16} className="text-slate-700" />
      </button>
    ) : (
      <button onClick={onProjects} className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ width: 36, height: 36, backgroundColor: PURPLE }}>
        <span className="text-white font-bold text-[14px]">M</span>
      </button>
    )}
    <button onClick={onProjects} className="flex-1 min-w-0 text-left">
      <div className="text-[13px] font-bold text-slate-900 truncate flex items-center gap-1">
        {project.name} <ChevronDown size={11} className="text-slate-400 flex-shrink-0" />
      </div>
      <div className="text-[10px] text-slate-500 truncate">{project.address} · Sup: {project.supervisor}</div>
    </button>
    <button className="rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 relative" style={{ width: 36, height: 36 }}>
      <Bell size={14} className="text-slate-700" />
      <span className="absolute -top-0.5 -right-0.5 rounded-full text-white text-[8px] font-bold flex items-center justify-center" style={{ width: 14, height: 14, backgroundColor: '#DC2626' }}>3</span>
    </button>
  </div>
);

// ============================================================================
// BOTTOM NAV (5 items, mic FAB in center)
// ============================================================================
const BottomNav = ({ active, onChange, onCapture }) => {
  const items = [
    { id: 'modules',  label: 'Modules',  icon: Home },
    { id: 'reports',  label: 'Reports',  icon: FileText },
    { id: 'capture',  label: '',         icon: Mic, isMic: true },
    { id: 'ai',       label: 'AI',       icon: Sparkles },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
  ];
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 bg-white border-t border-slate-200 grid grid-cols-5 px-1 pb-safe" style={{ paddingTop: 6, paddingBottom: 6 }}>
      {items.map(it => {
        if (it.isMic) {
          return (
            <button key={it.id} onClick={onCapture} className="flex flex-col items-center justify-center relative">
              <div className="rounded-full text-white flex items-center justify-center shadow-lg" style={{ width: 52, height: 52, backgroundColor: PURPLE, marginTop: -22, boxShadow: '0 4px 12px rgba(83,74,183,0.4)' }}>
                <Mic size={22} />
              </div>
            </button>
          );
        }
        const isActive = active === it.id;
        return (
          <button key={it.id} onClick={() => onChange(it.id)} className="flex flex-col items-center justify-center gap-0.5 py-1">
            <it.icon size={18} style={{ color: isActive ? PURPLE : '#94A3B8' }} strokeWidth={isActive ? 2.4 : 2} />
            <span className="text-[9px] font-bold" style={{ color: isActive ? PURPLE_DEEP : '#94A3B8' }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// ============================================================================
// MAIN APP — phone-frame container, screen routing, modals
// ============================================================================
export default function MerlinSiteProsetMobileV2() {
  // Mobile flow: Projects list (entry) → Project Home (modules grid) → Sub-module → Mic capture
  const [project, setProject] = useState(null);          // null = on Projects list (no bottom nav)
  const [tab, setTab] = useState('modules');             // modules | reports | ai | projects
  const [subTab, setSubTab] = useState(null);             // null | personnel | deliveries | …
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [createType, setCreateType] = useState(null);

  const onPickProject = (p) => { setProject(p); setTab('modules'); setSubTab(null); };
  const navTo = (t) => {
    if (t === 'projects') { setProject(null); setTab('modules'); setSubTab(null); return; }
    setSubTab(null); setTab(t);
  };
  const goSubModule = (id) => { setTab('modules'); setSubTab(id); };

  // Projects list landing — no bottom nav, simple top header
  if (!project) {
    return (
      <div className="min-h-screen flex items-start justify-center" style={{ backgroundColor: '#0F172A' }}>
        <style>{`
          @keyframes pulseProsetMobV2 { from { transform: scaleY(0.4); opacity: 0.6; } to { transform: scaleY(1); opacity: 1; } }
          @keyframes slideUpProsetMobV2 { from { transform: translateY(100%); } to { transform: translateY(0); } }
          .pb-safe { padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 6px); }
        `}</style>
        <div className="relative bg-slate-50 overflow-hidden flex flex-col" style={{
          width: '100%', maxWidth: 420, minHeight: '100vh',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 25px 50px -12px rgba(0,0,0,0.6)',
        }}>
          <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-3 py-2.5 flex items-center gap-2.5" style={{ height: 60 }}>
            <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ width: 36, height: 36, backgroundColor: PURPLE }}>
              <span className="text-white font-bold text-[14px]">M</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-bold text-slate-900">Merlin Site Pro</div>
              <div className="text-[10px] text-slate-500">Sup: Erik Odowd</div>
            </div>
            <button className="rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0" style={{ width: 36, height: 36 }}>
              <Settings size={14} className="text-slate-700" />
            </button>
          </div>
          <main className="flex-1 overflow-y-auto">
            <ProjectsScreen projects={PROJECTS} onPick={onPickProject} />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-start justify-center" style={{ backgroundColor: '#0F172A' }}>
      <style>{`
        @keyframes pulseProsetMobV2 { from { transform: scaleY(0.4); opacity: 0.6; } to { transform: scaleY(1); opacity: 1; } }
        @keyframes slideUpProsetMobV2 { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .pb-safe { padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 6px); }
      `}</style>

      <div className="relative bg-slate-50 overflow-hidden flex flex-col" style={{
        width: '100%', maxWidth: 420, minHeight: '100vh',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 25px 50px -12px rgba(0,0,0,0.6)',
      }}>
        <TopHeader project={project} onProjects={() => setProject(null)} showBack={!!subTab} onBack={() => setSubTab(null)} />

        <main className="flex-1 overflow-y-auto pb-16">
          {/* Sub-module screens */}
          {subTab === 'personnel'   && <PersonnelScreen   onBack={() => setSubTab(null)} onCreate={(t) => setCreateType(t)} />}
          {subTab === 'deliveries'  && <DeliveriesScreen  onBack={() => setSubTab(null)} onCreate={(t) => setCreateType(t)} />}
          {subTab === 'safety'      && <SafetyScreen      onBack={() => setSubTab(null)} onCreate={(t) => setCreateType(t)} />}
          {subTab === 'incidents'   && <IncidentsScreen   onBack={() => setSubTab(null)} onCreate={(t) => setCreateType(t)} />}
          {subTab === 'inspections' && <InspectionsScreen onBack={() => setSubTab(null)} onCreate={(t) => setCreateType(t)} />}
          {subTab === 'equipment'   && <EquipmentScreen   onBack={() => setSubTab(null)} onCreate={(t) => setCreateType(t)} />}
          {subTab === 'materials'   && <MaterialsScreen   onBack={() => setSubTab(null)} onCreate={(t) => setCreateType(t)} />}
          {subTab === 'notes'       && <NotesScreen       onBack={() => setSubTab(null)} onCreate={(t) => setCreateType(t)} />}

          {/* Top-level screens */}
          {!subTab && tab === 'modules' && <ModulesHomeScreen project={project} onCapture={() => setVoiceOpen(true)} onPick={goSubModule} />}
          {!subTab && tab === 'reports' && <ReportsScreen project={project} />}
          {!subTab && tab === 'ai'      && <AIScreen onCapture={() => setVoiceOpen(true)} />}
        </main>

        <BottomNav active={tab} onChange={navTo} onCapture={() => setVoiceOpen(true)} />

        {/* Modals */}
        <VoiceCaptureModal open={voiceOpen} onClose={() => setVoiceOpen(false)} />
        {createType && <CreateItemSheet type={createType} onClose={() => setCreateType(null)} />}
      </div>
    </div>
  );
}
