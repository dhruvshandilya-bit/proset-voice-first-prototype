import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft, Mic, Plus, Clock, Users, ClipboardList, Calendar, AlertTriangle,
  Wrench, Package, FileText, ClipboardCheck, MapPin, Sun, ChevronRight, Sparkles,
  Play, Pause, RotateCcw, Check, Square, Wifi, Battery, Signal, X, Camera,
  Phone as PhoneIcon, Building2, Truck, HardHat, FileSignature, ArrowRight, Eye, ChevronDown,
  Headphones, Bell, Globe, Search, SlidersHorizontal, Moon, Filter, ArrowDownWideNarrow, Lock, Pencil
} from 'lucide-react';

/* ============================================================
   MERLIN MOBILE — Voice-First Daily Log Prototype
   Built for PROSET / CC Scott Bates client review
   Demonstrates Sneha+Chris agreed direction (May 11, 2026)
   ============================================================ */

const C = {
  primary:      '#5b2d8e',
  primaryDark:  '#4a1d6b',
  primaryLight: '#f3e8ff',
  accent:       '#7c3aed',
  bg:           '#f6f7f9',
  surface:      '#ffffff',
  border:       '#e5e7eb',
  text:         '#111827',
  textMuted:    '#6b7280',
  textFaded:    '#9ca3af',
  success:      '#16a34a',
  successBg:    '#dcfce7',
  error:        '#dc2626',
  errorBg:      '#fee2e2',
  warning:      '#ea580c',
  warningBg:    '#ffedd5',
  info:         '#2563eb',
  infoBg:       '#dbeafe',
};

const PROJECT = {
  name: "Test Cambria Hotel — O'Fallon, MO",
  code: 'PROSET',
  number: 'CAMBRIA-OFALLON-26',
  address: "210 Rush Way, O'Fallon, MO 63368",
  city: "O'Fallon, Missouri",
  weather: '78°F · Clear sky',
  windHumidity: 'Wind 12 mph · Humidity 42%',
  start: '5/5/2026',
  end: '5/14/2026',
  status: 'In Progress',
};

const USER = { name: 'Carlos', org: 'Proset', initials: 'CR', role: 'Superintendent' };

/* ---------- Carlos's Morning tour: the 7 voice captures ----------
   This is the script Chris wrote in his PDF. We replay it verbatim. */
const TOUR = [
  {
    time: '7:08 AM',
    title: 'Grid line 3 alignment off',
    spoken: 'Grid line 3 is off by half inch.',
    summary: 'Foundation alignment issue at Grid Line 3 — ½″ variance. Pre-existing condition, not Proset\'s responsibility. Flagged for change-order context and added to tonight\'s Daily Report under "Problems Encountered."',
    category: 'Incident and Delays',
    chip: { label: 'Incident and Delays', icon: AlertTriangle, color: '#dc2626', bg: '#fee2e2' },
    entities: [
      { k: 'Type',           v: 'Foundation error (alignment)' },
      { k: 'Location',       v: 'Grid line 3' },
      { k: 'Variance',       v: '½ inch' },
      { k: 'Responsibility', v: 'Not Proset (pre-existing)' },
    ],
    sideEffects: [
      { icon: FileSignature, label: 'Flagged for Change Order context — visible on Issues tab' },
      { icon: AlertTriangle, label: 'PM notified · added to "Problems Encountered" on tonight\'s Daily Report' },
    ],
  },
  {
    time: '7:14 AM',
    title: 'Boom lifts delivered · 2× JLG 60′',
    spoken: 'United Rental is here with two 60-foot man lifts.',
    summary: 'United Rental delivered 2× JLG 60′ boom lifts at 7:14 AM. Vendor matched in project contacts. Added to "Equipment on Site" on the Daily Report and a cost-track stub created pending PO match.',
    category: 'Deliveries',
    chip: { label: 'Deliveries', icon: Truck, color: '#ea580c', bg: '#ffedd5' },
    entities: [
      { k: 'Vendor',   v: 'United Rental' },
      { k: 'Items',    v: '2× JLG 60′ Boom Lift' },
      { k: 'Arrived',  v: '7:14 AM (inferred from voice timestamp)' },
      { k: 'Match',    v: 'Vendor found in contacts ✓' },
    ],
    sideEffects: [
      { icon: Truck,   label: 'Added to "Equipment on Site" on Daily Report' },
      { icon: Package, label: 'Cost-track stub created · awaits PO match' },
    ],
  },
  {
    time: '7:22 AM',
    title: 'A35 clips missing from delivery',
    spoken: 'Have not located A35 clips — need to check if they were delivered.',
    summary: 'A35 clips possibly missing from delivery. PO-1247 pulled from Estimating — 240 ordered. Saved to "Open Items" to verify once back at the trailer.',
    category: 'Deliveries',
    chip: { label: 'Deliveries', icon: Truck, color: '#ea580c', bg: '#ffedd5' },
    entities: [
      { k: 'Part',     v: 'A35 clips' },
      { k: 'Concern',  v: 'Possibly missing from delivery' },
      { k: 'Action',   v: 'Verify against PO' },
    ],
    sideEffects: [
      { icon: FileText, label: 'Pulled PO-1247 from Estimating → 240× A35 clips ordered' },
      { icon: Eye,      label: 'Saved to "Open Items" — tap to verify when back at trailer' },
    ],
  },
  {
    time: '7:31 AM',
    title: 'Halo inspection complete',
    spoken: 'Halo inspection complete.',
    summary: 'Halo inspection completed by Carlos. Quality checkpoint cleared on schedule. Inspection form auto-filled and waiting on signature.',
    category: 'Inspection',
    chip: { label: 'Inspection', icon: ClipboardCheck, color: '#16a34a', bg: '#dcfce7' },
    // (category already in new taxonomy)
    entities: [
      { k: 'Item',      v: 'Halo' },
      { k: 'Status',    v: 'Complete' },
      { k: 'Inspector', v: `${USER.name} (self)` },
    ],
    sideEffects: [
      { icon: ClipboardCheck, label: 'Halo Inspection form auto-filled — awaiting your signature' },
      { icon: Check,          label: 'Quality checkpoint cleared on schedule' },
    ],
  },
  {
    time: '7:38 AM',
    title: 'Met inspector Mark Daniels',
    spoken: 'Met with 3rd party inspector, gave him set plans. His name is Mark Daniels.',
    summary: 'Met Mark Daniels — 3rd-party inspector. Set plans handed over. Added to project contacts and listed under "On-Site Communications" on the Daily Report.',
    category: 'Personnel',
    chip: { label: 'Personnel', icon: Users, color: '#0891b2', bg: '#cffafe' },
    entities: [
      { k: 'Name',    v: 'Mark Daniels' },
      { k: 'Role',    v: '3rd Party Inspector' },
      { k: 'Action',  v: 'Set plans handed over' },
      { k: 'Capture', v: '📷 Tap to add business card photo' },
    ],
    sideEffects: [
      { icon: Users, label: 'Added Mark Daniels to Project Contacts' },
      { icon: PhoneIcon, label: 'Will appear on Daily Report — "On-Site Communications"' },
    ],
  },
  {
    time: '7:43 AM',
    title: 'Crane arrived · setup in progress',
    spoken: 'Crane arrived at 7:30 AM and is being set up.',
    summary: 'Crane arrived at 7:30 AM and setup is in progress. Crane time logged for billing reconciliation. Operator\'s company will auto-populate Daily Report staffing if sub-contracted.',
    category: 'Deliveries',
    chip: { label: 'Deliveries', icon: Truck, color: '#ea580c', bg: '#ffedd5' },
    entities: [
      { k: 'Item',    v: 'Crane' },
      { k: 'Arrived', v: '7:30 AM (voice-stated)' },
      { k: 'Status',  v: 'Setup in progress' },
    ],
    sideEffects: [
      { icon: Truck, label: 'If crane operator is a sub → auto-listed on Daily Report staffing' },
      { icon: Clock, label: 'Crane time logged for billing reconciliation' },
    ],
  },
  {
    time: '7:51 AM',
    title: 'Insulation install · CO-0008 drafted',
    spoken: 'Sending 3 people to install insulation under first 5 modules until GC\'s contractor shows up.',
    summary: '3 Proset workers installing insulation under modules 1–5 to cover for GC sub delay. Estimated ~$480 in loaded labor (3 × 1.5 hrs × ~$110/hr). Change-Order draft #CO-0008 generated and routed to office — visibility flag set so office decides whether to invoice.',
    category: 'Change Orders',
    chip: { label: 'Change Orders', icon: FileSignature, color: '#be123c', bg: '#ffe4e6' },
    entities: [
      { k: 'Scope',          v: 'Insulation install under mods 1–5' },
      { k: 'Labor',          v: '3 Proset workers' },
      { k: 'Reason',         v: "Cover GC sub delay — don't delay our start" },
      { k: 'Est. Cost',      v: '~$480 (3 workers × ~1.5 hrs × ~$110/hr loaded)' },
    ],
    sideEffects: [
      { icon: FileSignature, label: 'Change Order DRAFT #CO-0008 generated — routed to Proset office' },
      { icon: Eye,           label: 'Visibility flag set: may or may not invoice — office decides' },
    ],
  },
];

/* ---------- Sub-modules the AI classifies voice notes into ---------- */
const FREE_CATEGORIES = {
  'Notes':                { icon: FileText,         color: '#6b7280', bg: '#f3f4f6' },
  'Personnel':            { icon: Users,            color: '#0891b2', bg: '#cffafe' },
  'Deliveries':           { icon: Truck,            color: '#ea580c', bg: '#ffedd5' },
  'Inspection':           { icon: ClipboardCheck,   color: '#16a34a', bg: '#dcfce7' },
  'Safety and Meetings':  { icon: HardHat,          color: '#7c3aed', bg: '#f3e8ff' },
  'Incident and Delays':  { icon: AlertTriangle,    color: '#dc2626', bg: '#fee2e2' },
  'Equipments':           { icon: Wrench,           color: '#2563eb', bg: '#dbeafe' },
  'Change Orders':        { icon: FileSignature,    color: '#be123c', bg: '#ffe4e6' },
};

const FREE_SAMPLES = [
  {
    title: 'Worker tripped near Bay 4 · no injury',
    spoken: 'Worker tripped on a cable run by bay 4, no injury but I want it logged.',
    summary: 'Trip-hazard near miss at Bay 4 — no injury. Cable rerouted and tagged. Logged as near-miss in the Incident log and added to tonight\'s Daily Report.',
    category: 'Incident and Delays',
    entities: [
      { k: 'Type',     v: 'Trip hazard — no injury' },
      { k: 'Location', v: 'Bay 4' },
      { k: 'Severity', v: 'Low (near miss)' },
      { k: 'Action',   v: 'Cable rerouted, tagged' },
    ],
    sideEffects: [
      { icon: AlertTriangle, label: 'Near-miss entry created in Incident log' },
      { icon: FileText,      label: 'Will appear on tonight\'s Daily Report' },
    ],
  },
  {
    title: 'Toolbox talk · fall protection',
    spoken: 'Did the morning toolbox talk on fall protection with all 8 guys.',
    summary: 'Morning toolbox talk on fall protection delivered to all 8 crew (~12 min). Record auto-filled and signed by Carlos. Attendance roll mapped to the clocked-in crew.',
    category: 'Safety and Meetings',
    entities: [
      { k: 'Topic',     v: 'Fall protection' },
      { k: 'Attendees', v: '8 workers' },
      { k: 'Duration',  v: '12 min' },
      { k: 'Signed by', v: `${USER.name} (${USER.role})` },
    ],
    sideEffects: [
      { icon: HardHat, label: 'Toolbox-talk record auto-filled — awaits signatures' },
      { icon: Users,   label: 'Attendance roll mapped to clocked-in crew' },
    ],
  },
  {
    title: 'Concrete pour delayed 90 min',
    spoken: 'Concrete pour delayed 90 minutes — pumper truck still en route from Wentzville.',
    summary: 'Pad C concrete pour delayed ~90 minutes — pumper truck still en route from Wentzville. 3 crew idle until pour starts. Schedule shift flagged for PM review and added to "Problems Encountered" on the Daily Report.',
    category: 'Incident and Delays',
    entities: [
      { k: 'Activity', v: 'Concrete pour — pad C' },
      { k: 'Delay',    v: '~90 minutes' },
      { k: 'Cause',    v: 'Pumper truck in transit' },
      { k: 'Impact',   v: '3 crew idle until pour starts' },
    ],
    sideEffects: [
      { icon: Clock,    label: 'Schedule shift flagged for PM review' },
      { icon: FileText, label: 'Added to "Problems Encountered" on Daily Report' },
    ],
  },
  {
    title: 'Frank — early lunch · dentist 1 PM',
    spoken: 'Quick note — Frank is taking lunch early, dentist appointment at one PM.',
    summary: 'Frank Reilly taking an early lunch for a 1 PM dentist appointment. Saved as a project note. Crew clock reflects the adjusted lunch window.',
    category: 'Notes',
    entities: [
      { k: 'Subject', v: 'Frank Reilly' },
      { k: 'Detail',  v: 'Early lunch — dentist 1 PM' },
    ],
    sideEffects: [
      { icon: FileText, label: 'Saved as project note' },
      { icon: Clock,    label: 'Crew clock reflects adjusted lunch window' },
    ],
  },
  {
    title: 'Safety meeting · crane signaling',
    spoken: 'Safety meeting at noon, covered crane signaling, ten minutes long.',
    summary: '12 PM safety meeting on crane signaling (~10 min). Safety meeting log created and will appear under "Safety" on the Daily Report.',
    category: 'Safety and Meetings',
    entities: [
      { k: 'Topic',    v: 'Crane signaling' },
      { k: 'Duration', v: '10 min' },
      { k: 'Time',     v: '12:00 PM' },
    ],
    sideEffects: [
      { icon: Users,    label: 'Safety meeting log created' },
      { icon: FileText, label: 'Will appear on Daily Report — "Safety"' },
    ],
  },
  {
    title: 'Halo inspection · module 6 complete',
    spoken: 'Halo inspection on module 6 is complete, no defects found.',
    summary: 'Halo inspection on module 6 complete with no defects. Quality checkpoint cleared on schedule; inspection form auto-filled awaiting signature.',
    category: 'Inspection',
    // (category aligned to new taxonomy)
    entities: [
      { k: 'Item',      v: 'Halo — module 6' },
      { k: 'Status',    v: 'Complete · no defects' },
      { k: 'Inspector', v: `${USER.name} (self)` },
    ],
    sideEffects: [
      { icon: ClipboardCheck, label: 'Halo inspection form auto-filled — awaits signature' },
      { icon: Check,          label: 'Quality checkpoint cleared on schedule' },
    ],
  },
  {
    title: 'Skytrak hydraulic warning · swap requested',
    spoken: 'Skytrak forklift is throwing a hydraulic warning, calling rental to swap.',
    summary: 'Skytrak 10054 forklift showing a hydraulic warning light. Rental swap requested from vendor. Equipment fault ticket opened and replacement reservation logged on the Daily Report.',
    category: 'Equipments',
    entities: [
      { k: 'Item',   v: 'Skytrak 10054 forklift' },
      { k: 'Issue',  v: 'Hydraulic warning light' },
      { k: 'Action', v: 'Rental swap requested' },
    ],
    sideEffects: [
      { icon: Wrench,  label: 'Equipment fault ticket opened — vendor notified' },
      { icon: Package, label: 'Replacement reservation logged on Daily Report' },
    ],
  },
  {
    title: 'Boom-lift hydraulic line snapped · fluid spill',
    spoken: 'Hydraulic line on the boom lift snapped — fluid spilled on the slab. Nobody hurt but flagging it.',
    summary: 'Boom-lift hydraulic line failure on the JLG 60′ unit. Fluid spilled on the slab — no injuries. Equipment fault logged. Vendor (United Rental) notified for repair or swap.',
    category: 'Equipments',
    entities: [
      { k: 'Item',     v: 'JLG 60′ boom lift (United Rental)' },
      { k: 'Fault',    v: 'Hydraulic line snapped — fluid spill' },
      { k: 'Injury',   v: 'None' },
      { k: 'Action',   v: 'Vendor notified · area cordoned' },
    ],
    sideEffects: [
      { icon: Wrench, label: 'Equipment fault ticket opened with United Rental' },
    ],
  },
];

const CHIP_FROM_CATEGORY = (cat) => {
  const c = FREE_CATEGORIES[cat] || FREE_CATEGORIES['Notes'];
  return { label: cat, icon: c.icon, color: c.color, bg: c.bg };
};

const fmtTime = () => {
  const d = new Date();
  const h12 = ((d.getHours() + 11) % 12) + 1;
  return `${h12}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
};

/* ---------- Multi-segment samples ----------
   A single voice note that the AI splits across multiple sub-modules.
   Each segment becomes its own Activity Timeline entry on save. */
const MULTI_SEGMENT_SAMPLES = [
  {
    title: 'Crew on site · concrete delivered · Bobcat issue',
    spoken: "Joe and Marcus on site at 7 AM. ABC Concrete dropped 5 yards, looked good. Bobcat's running rough — flag it for maintenance.",
    segments: [
      {
        category: 'Personnel',
        match: 'matched',
        title: 'Joe + Marcus on site at 7 AM',
        summary: 'Joe Smith and Marcus Lee on site at 7:00 AM. Matched to project crew roster.',
        entities: [
          { k: 'Joe Smith',  v: 'Carpenter', check: true },
          { k: 'Marcus Lee', v: 'Laborer',   check: true },
          { k: 'Start',      v: '7:00 AM' },
        ],
        sideEffects: [
          { icon: Users, label: 'Added to "On-Site Crew" on Daily Report' },
        ],
      },
      {
        category: 'Deliveries',
        match: 'matched',
        title: 'ABC Concrete · 5 yards received',
        summary: 'ABC Concrete delivered 5 yards. Received in good condition. Cost-track stub created pending PO match.',
        entities: [
          { k: 'Supplier',  v: 'ABC Concrete ✓' },
          { k: 'Quantity',  v: '5 yards' },
          { k: 'Status',    v: 'Received', okay: true },
        ],
        sideEffects: [
          { icon: Truck,   label: 'Added to "Materials Delivered" on Daily Report' },
          { icon: Package, label: 'Cost-track stub created · awaits PO match' },
        ],
      },
      {
        category: 'Equipments',
        match: 'confirm-match',
        title: 'Bobcat E26 · maintenance flagged',
        summary: 'Bobcat E26 reported running rough — flagged for maintenance.',
        entities: [
          { k: 'Heard', v: '"Bobcat"' },
          { k: 'Match', v: 'Bobcat E26 ✓', changeable: true },
          { k: 'Flag',  v: 'Needs maintenance', warn: true },
        ],
        sideEffects: [
          { icon: Wrench, label: 'Equipment fault ticket drafted for Bobcat E26' },
        ],
      },
    ],
  },
];

const makeFreeCapture = (sample) => ({
  title:       sample.title,
  time:        fmtTime(),
  spoken:      sample.spoken,
  summary:     sample.summary,
  category:    sample.category,
  chip:        sample.category ? CHIP_FROM_CATEGORY(sample.category) : null,
  extraChips:  (sample.extraCategories || []).map(CHIP_FROM_CATEGORY),
  entities:    sample.entities,
  sideEffects: sample.sideEffects,
  segments:    sample.segments,
});

/* ---------- Mock crew roster ----------
   Each entry has the *latest* punch state — once a worker has clocked out
   we still keep their clockIn/clockOut times for display. */
const CREW = [
  { id: 'm1', name: 'Frank Reilly',    role: 'Foreman',          initials: 'FR', status: 'on-site',  clockIn: '6:48 AM', clockOut: null,      worked: '4h 20m' },
  { id: 'm2', name: 'Luis Hernandez',  role: 'Lead Carpenter',   initials: 'LH', status: 'on-site',  clockIn: '6:52 AM', clockOut: null,      worked: '4h 16m' },
  { id: 'm3', name: 'Marcus Thompson', role: 'Carpenter',        initials: 'MT', status: 'on-site',  clockIn: '6:55 AM', clockOut: null,      worked: '4h 13m' },
  { id: 'm4', name: 'Diego Alvarez',   role: 'Carpenter',        initials: 'DA', status: 'on-site',  clockIn: '6:58 AM', clockOut: null,      worked: '4h 10m' },
  { id: 'm5', name: 'Pete Owens',      role: 'Apprentice',       initials: 'PO', status: 'off-site', clockIn: '7:01 AM', clockOut: '9:45 AM', worked: '2h 44m' },
  { id: 'm6', name: 'Tony Russo',      role: 'Laborer',          initials: 'TR', status: 'on-site',  clockIn: '7:03 AM', clockOut: null,      worked: '4h 05m' },
  { id: 'm7', name: 'Kevin Maddox',    role: 'Laborer',          initials: 'KM', status: 'on-site',  clockIn: '7:32 AM', clockOut: null,      worked: '3h 36m' },
  { id: 'm8', name: 'Jaime Ortiz',     role: 'Operator (Crane)', initials: 'JO', status: 'off-site', clockIn: null,      clockOut: null,      worked: null    },
];

/* ---------- Morning / Evening Report question sets ---------- */
const MORNING_QUESTIONS = [
  { q: 'How many picks are planned?',                       sample: 'Seven picks today — modules 1 through 5 plus the crane setup and material staging.' },
  { q: 'What else is being worked on today?',               sample: 'Setting modules 1 through 5 and getting the crane fully staged for the next phase.' },
  { q: 'How many team members are expected on site today?', sample: 'Eight crew expected. Two laborers, three carpenters, foreman, lead carpenter, and the crane operator.' },
];

const EVENING_QUESTIONS = [
  { q: 'How many picks were completed?',                    sample: 'Six of seven picks completed. A35 clip verification still pending.' },
  { q: 'Any issues we haven’t logged yet?',                 sample: 'Grid line 3 was off by half an inch — pre-existing condition. Concrete pour delayed 90 minutes.' },
  { q: 'Any notes for tomorrow?',                           sample: 'Start with insulation under remaining modules. Confirm A35 clip delivery first thing. Crane setup continues.' },
];

/* Executive summaries are short paraphrases that compile each report's
   answers into a single statement (matches the web "Daily Field Reports" UI). */
const MORNING_SUMMARY =
  "The team is at Test Cambria Hotel — O'Fallon to lay out foundations and stage the crane, with 7 picks planned and 8 crew expected on site.";
const EVENING_SUMMARY =
  "Six of seven picks completed today. Grid line 3 alignment (pre-existing) and a 90-min concrete pour delay were flagged. Tomorrow opens with insulation under remaining modules, A35 clip verification, and continued crane setup.";

const MORNING_TAGS = [
  { k: 'Picks', v: '7' },
  { k: 'Crew',  v: '8 expected' },
];
const EVENING_TAGS = [
  { k: 'Picks done', v: '6 / 7' },
  { k: 'Variance',   v: '-1', warn: true },
];

/* ---------- Today's planned items (for KPI + Evening Report) ---------- */
const DAILY_PLAN = [
  { id: 'p1', label: 'Set grid lines 1–4',                  done: true },
  { id: 'p2', label: 'Receive equipment from United Rental', done: true },
  { id: 'p3', label: 'Halo inspection — module 1',          done: true },
  { id: 'p4', label: 'Halo inspection — module 6',          done: false },
  { id: 'p5', label: 'Begin insulation under mods 1–5',     done: true },
  { id: 'p6', label: 'Crane staging + setup',               done: true },
  { id: 'p7', label: 'Verify A35 clip delivery (PO-1247)',  done: false },
];

const tourToActivity = (t, idx) => ({
  id: `T${idx}`,
  title:         t.title,
  time:          t.time,
  text:          t.spoken,
  summary:       t.summary,
  category:      t.category,
  chip:          t.chip,
  extraChips:    (t.extraCategories || []).map(CHIP_FROM_CATEGORY),
  entities:      t.entities,
  sideEffects:   t.sideEffects,
  user:          t.user || USER.name,
  userInitials:  t.userInitials || USER.initials,
});

/* ---------- Foreman entries (shown at the bottom of the timeline to
   demonstrate the user-grouping pattern). Frank started his day before
   Carlos's tour. */
const FOREMAN_ENTRIES = [
  {
    id: 'F-pre-1',
    title: 'Pre-shift walk-through complete',
    time: '6:55 AM',
    text: 'Pre-shift walk-through complete across all active zones. No blockers.',
    summary: 'Pre-shift walk-through complete across all active work zones (modules 1–5, foundation, staging yard). No blockers found. Crew cleared to start.',
    category: 'Inspection',
    chip: { label: 'Inspection', icon: ClipboardCheck, color: '#16a34a', bg: '#dcfce7' },
    user: 'Frank Reilly',
    userInitials: 'FR',
  },
  {
    id: 'F-pre-2',
    title: 'Crew of 8 clocked in',
    time: '6:48 AM',
    text: 'Eight crew clocked in for the day, everyone accounted for.',
    summary: 'All 8 crew members clocked in and accounted for. Hours tracking started at 6:48 AM. Two laborers, three carpenters, foreman, lead carpenter, crane operator.',
    category: 'Personnel',
    chip: { label: 'Personnel', icon: Users, color: '#0891b2', bg: '#cffafe' },
    user: 'Frank Reilly',
    userInitials: 'FR',
  },
];

/* ---------- A "live new entry" we can push to demonstrate the
   multi-user group header animating in. */
const SIM_INCOMING = {
  title: 'Spotted nail strip near loading dock',
  spoken: "Found a nail strip near the loading dock — picking it up now before someone steps on it.",
  summary: 'Nail strip spotted near the loading dock and cleared on the spot. No injury — logged as a housekeeping hazard.',
  category: 'Incident and Delays',
  entities: [
    { k: 'Type',     v: 'Housekeeping hazard' },
    { k: 'Location', v: 'Loading dock' },
    { k: 'Action',   v: 'Cleared on the spot' },
  ],
  sideEffects: [
    { icon: AlertTriangle, label: 'Logged in Incident register — housekeeping' },
  ],
};

/* ============================================================
   ROOT APP
   ============================================================ */

export default function App() {
  const [screen, setScreen] = useState('detail'); // home | projects | detail | voice | review | clockin | morning | crew | evening
  const [activity, setActivity] = useState(() => [
    ...TOUR.map(tourToActivity).reverse(), // newest Carlos entry first
    ...FOREMAN_ENTRIES,                    // Frank's earlier entries at the bottom
  ]);
  const [activeItem, setActiveItem] = useState(null); // tapped timeline entry
  const [activeReport, setActiveReport] = useState(null); // {title, submittedAt, submittedBy, summary, questions, tags, accent, icon}

  const updateActivity = (id, patch) => {
    setActivity(prev => prev.map(a => (a.id === id ? { ...a, ...patch } : a)));
    setActiveItem(cur => (cur && cur.id === id ? { ...cur, ...patch } : cur));
  };
  const [tour, setTour] = useState({ active: false, step: 0, playing: false });
  const [voiceState, setVoiceState] = useState({ phase: 'idle', transcript: '', categoryIdx: 0, capture: null });
  const [showSideEffects, setShowSideEffects] = useState(true);
  // Demo: Carlos clocked in at 6:48 AM today
  const [clockedInAt, setClockedInAt] = useState(() => {
    const d = new Date();
    d.setHours(6, 48, 0, 0);
    return d;
  });
  const [planItems, setPlanItems] = useState(DAILY_PLAN);

  /* Pool of samples for the free-form mic flow.
     First tap shows the multi-segment scenario so the segregation
     behavior is reliably visible during a client demo; subsequent
     taps cycle through single-category examples. */
  const FREE_POOL = useRef([...MULTI_SEGMENT_SAMPLES, ...FREE_SAMPLES]);
  const freeIdx = useRef(0);

  /* Free-form voice capture (non-tour mode):
     pick the next sample, type out transcript, "analyze", show review */
  const startFreeCapture = () => {
    if (tour.active && tour.playing) return;
    const pool = FREE_POOL.current;
    const sample = pool[freeIdx.current % pool.length];
    freeIdx.current += 1;
    const capture = makeFreeCapture(sample);
    setVoiceState({ phase: 'recording', transcript: '', categoryIdx: -1, capture });
    setScreen('voice');

    const txt = capture.spoken;
    let i = 0;
    const typer = setInterval(() => {
      i++;
      setVoiceState(v => ({ ...v, transcript: txt.slice(0, i) }));
      if (i >= txt.length) clearInterval(typer);
    }, 36);

    setTimeout(() => setVoiceState(v => ({ ...v, phase: 'analyzing' })),
               txt.length * 36 + 500);
    setTimeout(() => {
      setVoiceState(v => ({ ...v, phase: 'review' }));
      setScreen('review');
    }, txt.length * 36 + 1500);
  };

  const saveFreeCapture = () => {
    const cap = voiceState.capture;
    if (!cap) { setScreen('detail'); return; }
    setActivity(prev => [
      {
        id: `F${Date.now()}`,
        title: cap.title,
        time: cap.time,
        text: cap.spoken,
        summary: cap.summary,
        category: cap.category,
        chip: cap.chip,
        extraChips: cap.extraChips || [],
        entities: cap.entities,
        sideEffects: cap.sideEffects,
        user: USER.name,
        userInitials: USER.initials,
      },
      ...prev,
    ]);
    setVoiceState({ phase: 'idle', transcript: '', categoryIdx: 0, capture: null });
    setScreen('detail');
  };

  /* When a single voice note was segregated by the AI into multiple
     sub-modules, each confirmed segment becomes its own timeline entry.
     They share the spoken text but get their own chip / summary / fields. */
  const saveSegmentedCapture = (segments) => {
    const cap = voiceState.capture;
    if (!cap || !segments || segments.length === 0) { setScreen('detail'); return; }
    const stamp = Date.now();
    const newEntries = segments.map((seg, i) => ({
      id: `MS${stamp}-${i}`,
      title: seg.title,
      time: cap.time,
      text: cap.spoken,
      summary: seg.summary,
      category: seg.category,
      chip: CHIP_FROM_CATEGORY(seg.category),
      extraChips: [],
      entities: seg.entities,
      sideEffects: seg.sideEffects || [],
      user: USER.name,
      userInitials: USER.initials,
    }));
    setActivity(prev => [...newEntries, ...prev]);
    setVoiceState({ phase: 'idle', transcript: '', categoryIdx: 0, capture: null });
    setScreen('detail');
  };

  const togglePlanItem = (id) =>
    setPlanItems(prev => prev.map(p => (p.id === id ? { ...p, done: !p.done } : p)));

  /* Simulate a brand-new entry coming in from Frank (the foreman) — used to
     demo the multi-user grouping in the Activity Timeline. */
  const simulateForemanEntry = () => {
    const chip = CHIP_FROM_CATEGORY(SIM_INCOMING.category);
    setActivity(prev => [
      {
        id: `LIVE-${Date.now()}`,
        title:        SIM_INCOMING.title,
        time:         fmtTime(),
        text:         SIM_INCOMING.spoken,
        summary:      SIM_INCOMING.summary,
        category:     SIM_INCOMING.category,
        chip,
        entities:     SIM_INCOMING.entities,
        sideEffects:  SIM_INCOMING.sideEffects,
        user:         'Frank Reilly',
        userInitials: 'FR',
        isNew:        true,
      },
      ...prev,
    ]);
    setScreen('detail');
  };

  // Tour autoplay
  useEffect(() => {
    if (!tour.active || !tour.playing) return;
    const step = TOUR[tour.step];
    if (!step) return;

    // Phase machine: detail → voice (transcribing) → voice (analyzing) → review → back to detail
    let timers = [];
    setScreen('voice');
    setVoiceState({ phase: 'recording', transcript: '', categoryIdx: tour.step, capture: step });

    // Type out transcript char-by-char
    const txt = step.spoken;
    let i = 0;
    const typer = setInterval(() => {
      i++;
      setVoiceState(v => ({ ...v, transcript: txt.slice(0, i) }));
      if (i >= txt.length) clearInterval(typer);
    }, 38);
    timers.push(() => clearInterval(typer));

    // After transcript: analyzing
    timers.push(setTimeout(() => {
      setVoiceState(v => ({ ...v, phase: 'analyzing' }));
    }, txt.length * 38 + 600));

    // Then: review
    timers.push(setTimeout(() => {
      setVoiceState(v => ({ ...v, phase: 'review' }));
      setScreen('review');
    }, txt.length * 38 + 1500));

    // Then save + advance
    timers.push(setTimeout(() => {
      setActivity(prev => [
        tourToActivity(step, tour.step),
        ...prev,
      ]);
      setScreen('detail');
      setVoiceState({ phase: 'idle', transcript: '', categoryIdx: 0, capture: null });

      if (tour.step + 1 < TOUR.length) {
        setTimeout(() => setTour(t => ({ ...t, step: t.step + 1 })), 1200);
      } else {
        setTour(t => ({ ...t, playing: false }));
      }
    }, txt.length * 38 + 3000));

    return () => {
      timers.forEach(t => (typeof t === 'function' ? t() : clearTimeout(t)));
    };
  }, [tour.active, tour.step, tour.playing]);

  const startTour = () => {
    setActivity([]); // tour will refill step-by-step
    setScreen('detail');
    setTour({ active: true, step: 0, playing: true });
  };
  const resetTour = () => {
    setActivity(TOUR.map(tourToActivity).reverse());
    setTour({ active: false, step: 0, playing: false });
    setVoiceState({ phase: 'idle', transcript: '', categoryIdx: 0, capture: null });
    setScreen('detail');
  };

  const currentTour = tour.active ? TOUR[tour.step] : null;

  return (
    <div
      className="min-h-screen w-full flex items-stretch"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif",
        background: 'linear-gradient(135deg, #1f1334 0%, #2c1b4a 40%, #1a1130 100%)',
      }}
    >
      {/* LEFT — narrative & controls */}
      <LeftPanel
        tour={tour}
        startTour={startTour}
        resetTour={resetTour}
        setTour={setTour}
        screen={screen}
        setScreen={setScreen}
        simulateForemanEntry={simulateForemanEntry}
      />

      {/* CENTER — phone */}
      <div className="flex-1 flex items-center justify-center py-10 px-6">
        <Phone>
          {screen === 'home'     && <HomeScreen     setScreen={setScreen} />}
          {screen === 'projects' && <ProjectsScreen setScreen={setScreen} />}
          {screen === 'detail'   && <DetailScreen
                                       setScreen={setScreen}
                                       activity={activity}
                                       tour={tour}
                                       planItems={planItems}
                                       clockedIn={!!clockedInAt}
                                       onMicTap={startFreeCapture}
                                       onOpenItem={setActiveItem}
                                       onOpenReport={setActiveReport}
                                     />}
          {screen === 'voice'    && <VoiceScreen    setScreen={setScreen} voiceState={voiceState} tour={tour} />}
          {screen === 'review'   && <ReviewScreen
                                       setScreen={setScreen}
                                       voiceState={voiceState}
                                       setVoiceState={setVoiceState}
                                       tour={tour}
                                       onSave={tour.active ? () => {} : saveFreeCapture}
                                       onSaveSegments={tour.active ? () => {} : saveSegmentedCapture}
                                     />}
          {screen === 'clockin'  && <ClockInScreen       setScreen={setScreen} clockedInAt={clockedInAt} setClockedInAt={setClockedInAt} />}
          {screen === 'morning'  && <MorningReportScreen setScreen={setScreen} />}
          {screen === 'crew'     && <CrewRosterScreen    setScreen={setScreen} />}
          {screen === 'evening'  && <EveningReportScreen setScreen={setScreen} />}
          {activeItem && <ActivityDetailModal item={activeItem} onClose={() => setActiveItem(null)} onUpdate={updateActivity} />}
          {activeReport && <ReportDetailModal report={activeReport} onClose={() => setActiveReport(null)} />}
        </Phone>
      </div>

      {/* RIGHT — AI extraction details */}
      <RightPanel
        tour={tour}
        currentTour={currentTour}
        voiceState={voiceState}
        showSideEffects={showSideEffects}
        setShowSideEffects={setShowSideEffects}
      />
    </div>
  );
}

/* ============================================================
   PHONE SHELL
   ============================================================ */
function Phone({ children }) {
  return (
    <div
      className="relative"
      style={{
        width: 390,
        height: 800,
        borderRadius: 48,
        background: '#000',
        padding: 12,
        boxShadow:
          '0 50px 100px rgba(0,0,0,0.5), 0 30px 60px rgba(91,45,142,0.25), inset 0 0 0 1px rgba(255,255,255,0.06)',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 38,
          overflow: 'hidden',
          background: C.bg,
          position: 'relative',
        }}
      >
        {/* Dynamic island */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 120,
            height: 32,
            background: '#000',
            borderRadius: 24,
            zIndex: 50,
          }}
        />
        {/* Status bar */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between"
          style={{ padding: '16px 28px 0 28px', zIndex: 40, pointerEvents: 'none' }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>11:08</span>
          <div className="flex items-center gap-1.5" style={{ color: C.text }}>
            <Signal size={15} strokeWidth={2.5} />
            <Wifi size={15} strokeWidth={2.5} />
            <div className="flex items-center gap-0.5">
              <div style={{
                width: 22, height: 11, border: `1.5px solid ${C.text}`, borderRadius: 3, position: 'relative',
              }}>
                <div style={{ position: 'absolute', inset: 1.5, background: '#facc15', borderRadius: 1, width: '40%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0" style={{ paddingTop: 48 }}>
          {children}
        </div>

        {/* Home indicator */}
        <div
          style={{
            position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
            width: 134, height: 5, borderRadius: 3, background: 'rgba(0,0,0,0.35)',
          }}
        />
      </div>
    </div>
  );
}

/* ============================================================
   SCREEN 1 — HOME (simplified per Sneha's email)
   ============================================================ */
function HomeScreen({ setScreen }) {
  return (
    <div className="h-full w-full overflow-y-auto" style={{ background: C.bg }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 0' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="relative"
              style={{
                width: 44, height: 44, borderRadius: '50%',
                background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: C.textMuted, fontWeight: 600, fontSize: 14,
              }}
            >
              {USER.initials}
              <div
                style={{
                  position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: '50%',
                  background: '#22c55e', border: `2px solid ${C.bg}`,
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>Hi, {USER.name}</div>
              <div className="flex items-center gap-1" style={{ fontSize: 13, color: C.textMuted }}>
                <span>{USER.org}</span>
                <ChevronDown size={14} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3" style={{ color: C.textMuted }}>
            <Globe size={20} />
            <Headphones size={20} />
            <Bell size={20} />
          </div>
        </div>
      </div>

      {/* Calendar card */}
      <div style={{ padding: '20px 20px 0' }}>
        <div
          className="flex items-center gap-3"
          style={{
            background: C.surface, borderRadius: 14, padding: '14px 16px',
            border: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              width: 52, height: 52, borderRadius: 10, background: '#dbeafe',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, color: C.info, letterSpacing: 1 }}>MAY</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.info, lineHeight: 1 }}>12</div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>Calendar</div>
              <div style={{
                background: '#dbeafe', color: C.info, fontSize: 11, fontWeight: 600,
                padding: '2px 8px', borderRadius: 8,
              }}>
                Tuesday
              </div>
            </div>
            <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>
              View your schedule and events
            </div>
          </div>
          <ArrowRight size={20} color={C.info} />
        </div>
      </div>

      {/* ACTIONS — single tile only */}
      <div style={{ padding: '24px 20px 0' }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
          <div
            style={{
              width: 16, height: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2,
            }}
          >
            {[0,1,2,3].map(i => (
              <div key={i} style={{ background: C.textMuted, borderRadius: 2 }} />
            ))}
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, letterSpacing: 1.2 }}>
            ACTIONS
          </div>
        </div>

        <div
          onClick={() => setScreen('projects')}
          className="cursor-pointer active:scale-[0.98] transition-transform"
          style={{
            background: C.surface, borderRadius: 16, padding: 20,
            border: `1px solid ${C.border}`,
          }}
        >
          <div className="flex items-start gap-4">
            <div
              style={{
                width: 64, height: 64, borderRadius: 14, background: C.primaryLight,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Building2 size={32} color={C.primary} strokeWidth={2.2} />
            </div>
            <div className="flex-1">
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Projects</div>
              <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4, lineHeight: 1.4 }}>
                Daily log, clock-in, voice notes — everything happens inside a project.
              </div>
              <div className="flex items-center gap-2" style={{ marginTop: 10 }}>
                <span style={{
                  fontSize: 11, fontWeight: 600, color: C.primary,
                  background: C.primaryLight, padding: '3px 8px', borderRadius: 6,
                }}>
                  3 PROJECTS
                </span>
              </div>
            </div>
            <ChevronRight size={20} color={C.textMuted} style={{ marginTop: 8 }} />
          </div>
        </div>
      </div>

      {/* Recently used */}
      <div style={{ padding: '24px 20px 100px' }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
          <Clock size={14} color={C.textMuted} />
          <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, letterSpacing: 1.2 }}>
            RECENTLY USED
          </div>
        </div>

        <div
          onClick={() => setScreen('detail')}
          className="cursor-pointer active:scale-[0.98] transition-transform"
          style={{
            background: C.surface, borderRadius: 12, padding: '14px 16px',
            border: `1px solid ${C.border}`, marginBottom: 10,
          }}
        >
          <div className="flex items-center gap-3">
            <div style={{ width: 8, height: 8, borderRadius: 4, background: C.primary }} />
            <div className="flex-1">
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                {PROJECT.name}
              </div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
                {PROJECT.city}
              </div>
            </div>
            <ChevronRight size={18} color={C.textMuted} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SCREEN 2 — PROJECTS LIST
   ============================================================ */
function ProjectsScreen({ setScreen }) {
  return (
    <div className="h-full w-full overflow-y-auto" style={{ background: C.bg }}>
      {/* Top bar */}
      <div style={{ padding: '12px 20px 8px' }} className="flex items-center gap-3">
        <button onClick={() => setScreen('home')} className="flex items-center justify-center" style={{ width: 32, height: 32 }}>
          <ChevronLeft size={24} color={C.text} />
        </button>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>Projects</div>
        <div style={{ flex: 1 }} />
        <div style={{ width: 32, height: 32 }} className="flex items-center justify-center">
          <Headphones size={20} color={C.text} />
        </div>
      </div>

      {/* Search + sort + filter */}
      <div style={{ padding: '8px 20px 0' }} className="flex items-center gap-2">
        <div
          className="flex items-center flex-1 gap-2"
          style={{
            background: C.surface, borderRadius: 12, padding: '11px 14px',
            border: `1px solid ${C.border}`,
          }}
        >
          <Search size={16} color={C.textFaded} />
          <span style={{ fontSize: 14, color: C.textFaded }}>Search projects</span>
        </div>
        <button
          style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
            width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ArrowDownWideNarrow size={18} color={C.textMuted} />
        </button>
        <button
          style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
            width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Filter size={18} color={C.textMuted} />
        </button>
      </div>

      {/* Project cards */}
      <div style={{ padding: '20px 20px 100px' }}>
        <ProjectCard
          name="Dry run - Chris Setup"
          number="PRO-PRJ-0024"
          location="NA"
          start="5/8/2026"
          end="8/4/2026"
          status="SCHEDULED"
          statusColor={C.primary}
          onClick={() => setScreen('detail')}
        />
        <div style={{ height: 12 }} />
        <ProjectCard
          name={PROJECT.name}
          number={PROJECT.number}
          location={PROJECT.address}
          start={PROJECT.start}
          end={PROJECT.end}
          status="In Progress"
          statusColor={C.primary}
          onClick={() => setScreen('detail')}
        />
      </div>
    </div>
  );
}

function ProjectCard({ name, number, location, start, end, status, statusColor, onClick }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer active:scale-[0.99] transition-transform"
      style={{
        background: C.surface, borderRadius: 14, padding: 16,
        border: `1px solid ${C.border}`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>
            {name}
          </div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>
            Project no. : {number}
          </div>
        </div>
        <div
          className="flex items-center gap-1.5"
          style={{
            background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8,
            padding: '5px 9px',
          }}
        >
          <div
            style={{
              width: 14, height: 14, borderRadius: 7, background: statusColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 9, fontWeight: 700,
            }}
          >
            i
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.text, letterSpacing: 0.3 }}>
            {status}
          </span>
        </div>
      </div>

      <div style={{ height: 1, background: C.border, margin: '12px 0' }} />

      <div className="flex items-center gap-2.5">
        <div
          style={{
            width: 28, height: 28, borderRadius: 14, background: '#f3f4f6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Building2 size={14} color={C.textMuted} />
        </div>
        <div style={{ fontSize: 13, color: C.text, lineHeight: 1.3, flex: 1 }}>
          {location}
        </div>
      </div>

      <div style={{ height: 1, background: C.border, margin: '12px 0' }} />

      <div style={{ fontSize: 12, color: C.textMuted }}>
        Start Date: {start}  -  End Date: {end}
      </div>
    </div>
  );
}

/* ============================================================
   SCREEN 3 — PROJECT DETAIL (the unified screen)
   This is where Site Activity + Daily Log + Clock-in live.
   ============================================================ */
function DetailScreen({ setScreen, activity, tour, planItems, clockedIn, onMicTap, onOpenItem, onOpenReport }) {
  const [expandAll, setExpandAll] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  // All tabs visible, sorted by activity count (desc). "All" stays first.
  const tabsWithCounts = TAB_DEFS.map(t => ({
    ...t,
    count: t.id === 'all' ? activity.length : activity.filter(a => t.match(a.category)).length,
  }));
  const visibleTabs = [
    ...tabsWithCounts.filter(t => t.id === 'all'),
    ...tabsWithCounts.filter(t => t.id !== 'all').sort((a, b) => b.count - a.count),
  ];
  const [activeTab, setActiveTab] = useState('all');
  // Keep activeTab valid as tabs appear/disappear
  useEffect(() => {
    if (!visibleTabs.find(t => t.id === activeTab)) setActiveTab('all');
  }, [visibleTabs.map(t => t.id).join(',')]);

  const visibleActivity =
    activeTab === 'all'
      ? activity
      : activity.filter(a => TAB_DEFS.find(t => t.id === activeTab).match(a.category));

  return (
    <div className="h-full w-full overflow-y-auto" style={{ background: C.bg }}>
      {/* Purple gradient header */}
      <div
        style={{
          background: `linear-gradient(180deg, ${C.primaryDark} 0%, ${C.primary} 100%)`,
          padding: '12px 20px 22px',
          color: '#fff',
          position: 'relative',
        }}
      >
        {/* Glow circles */}
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 200, height: 200,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -30, width: 180, height: 180,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)',
        }} />

        <div className="flex items-center justify-between" style={{ position: 'relative' }}>
          <button onClick={() => setScreen('projects')}>
            <ChevronLeft size={22} color="#fff" />
          </button>
          <div
            className="flex items-center gap-1.5"
            style={{
              background: 'rgba(255,255,255,0.18)', borderRadius: 20, padding: '6px 14px',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Calendar size={13} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>Tue, May 12, 2026</span>
            <ChevronDown size={14} />
          </div>
          <div
            className="flex items-center gap-1.5"
            style={{
              background: 'rgba(255,255,255,0.18)', borderRadius: 20, padding: '6px 12px',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Sun size={13} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>78°F</span>
          </div>
        </div>

        <div style={{ position: 'relative', marginTop: 18 }}>
          <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>
            {PROJECT.name} / {PROJECT.code}
          </div>
          <div className="flex items-center gap-1.5" style={{ marginTop: 10, fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>
            <MapPin size={14} />
            <span>{PROJECT.city}</span>
          </div>
          <div className="flex items-center gap-1.5" style={{ marginTop: 4, fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>
            <Sun size={14} />
            <span>Clear sky</span>
          </div>
          <div style={{ marginTop: 2, fontSize: 12, color: 'rgba(255,255,255,0.7)', marginLeft: 22 }}>
            {PROJECT.windHumidity}
          </div>
        </div>

        {/* KPI strip */}
        <div
          className="flex"
          style={{
            position: 'relative', marginTop: 16,
            background: 'rgba(255,255,255,0.14)', borderRadius: 14, padding: '12px 4px',
            backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <KPI icon={Users}          label="Workers" value={CREW.filter(c => c.status === 'on-site' || c.status === 'late').length} />
          <KPISep />
          <KPI icon={Clock}          label="Hours"   value={(activity.length * 0.75).toFixed(1)} />
          <KPISep />
          <KPI icon={ClipboardList}  label="Planned" value={planItems.length} />
          <KPISep />
          <KPI icon={Check}          label="Done"    value={planItems.filter(p => p.done).length} />
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ padding: '18px 20px 0' }}>
        <div className="grid grid-cols-4 gap-2.5">
          <QuickAction icon={Clock}        label={clockedIn ? 'Clock Out' : 'Clock In'} bg="#dcfce7"         iconColor="#16a34a" onClick={() => setScreen('clockin')} />
          <QuickAction icon={Mic}          label="Morning Rpt" bg={C.primaryLight}  iconColor={C.primary} onClick={() => setScreen('morning')} />
          <QuickAction icon={Users}        label="Crew Roster" bg={C.primaryLight}  iconColor={C.primary} onClick={() => setScreen('crew')} />
          <QuickAction icon={Moon}         label="Evening Rpt" bg="#ffedd5"         iconColor={C.warning} onClick={() => setScreen('evening')} />
        </div>
      </div>

      {/* AI Summary */}
      <div style={{ padding: '16px 20px 0' }}>
        <div
          style={{
            borderRadius: 14, overflow: 'hidden',
            border: `1px solid ${C.border}`, background: C.surface,
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
              padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={16} color="#fff" />
            </div>
            <div className="flex-1">
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>AI Summary</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>
                Auto-generated from today's logs
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: '3px 9px',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: '#fff' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>AI</span>
            </div>
          </div>
          <div style={{ padding: '14px 14px 14px 18px', display: 'flex', gap: 10 }}>
            <div style={{ width: 3, borderRadius: 2, background: '#2563eb', flexShrink: 0 }} />
            <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>
              {activity.length === 0
                ? <span style={{ color: C.textMuted }}>No activity logged yet today. Tap the mic to capture the first event.</span>
                : activity.length < 3
                  ? `Early-morning activity captured: ${activity[activity.length-1].text.slice(0, 80)}${activity[activity.length-1].text.length > 80 ? '…' : ''}`
                  : `${activity.length} captures logged so far this morning. Notable: ${activity.filter(a => a.category === 'Change Order').length} change order draft${activity.filter(a => a.category === 'Change Order').length !== 1 ? 's' : ''}, ${activity.filter(a => a.category === 'Equipment').length} equipment update${activity.filter(a => a.category === 'Equipment').length !== 1 ? 's' : ''}, and ${activity.filter(a => a.category === 'Issue').length} issue${activity.filter(a => a.category === 'Issue').length !== 1 ? 's' : ''} flagged.`
              }
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div style={{ padding: '16px 12px 0' }}>
        <div
          style={{
            background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`,
            padding: '14px 12px',
          }}
        >
          <div className="flex items-center gap-2.5" style={{ marginBottom: 14 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, background: C.primaryLight,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Clock size={16} color={C.primary} />
            </div>
            <div className="flex-1">
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Activity Timeline</div>
              <div style={{ fontSize: 12, color: C.textMuted }}>
                {activity.length} {activity.length === 1 ? 'entry' : 'entries'}
              </div>
            </div>
            {activity.length > 0 && (
              <button
                onClick={() => setExpandAll(v => !v)}
                style={{
                  fontSize: 12, fontWeight: 700, color: C.primary,
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '4px 8px', borderRadius: 6,
                  background: expandAll ? C.primaryLight : 'transparent',
                }}
              >
                {expandAll ? 'Collapse all' : 'Expand all'}
                <ChevronDown
                  size={13}
                  style={{ transform: expandAll ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                />
              </button>
            )}
          </div>

          {/* Tabs — sorted by count, descending. "All" pinned first. */}
          <div className="flex gap-1.5 overflow-x-auto" style={{ paddingBottom: 4, marginBottom: 12 }}>
            {visibleTabs.map(t => {
              const isActive = activeTab === t.id;
              const isEmpty  = t.id !== 'all' && t.count === 0;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    background: isActive ? C.primary : '#f3f4f6',
                    color:      isActive ? '#fff' : (isEmpty ? C.textFaded : C.text),
                    fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 16,
                    whiteSpace: 'nowrap', flexShrink: 0,
                    display: 'flex', alignItems: 'center', gap: 6,
                    opacity: isEmpty ? 0.75 : 1,
                  }}
                >
                  {t.label}
                  {t.id !== 'all' && (
                    <span style={{
                      background: isActive
                        ? 'rgba(255,255,255,0.25)'
                        : (isEmpty ? '#e5e7eb' : C.primary),
                      color: isActive ? '#fff' : (isEmpty ? C.textFaded : '#fff'),
                      fontSize: 10, fontWeight: 700,
                      minWidth: 16, height: 16, borderRadius: 8,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      padding: '0 5px',
                    }}>
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {visibleActivity.length === 0 ? (
            <div
              style={{
                padding: '32px 16px', textAlign: 'center',
                background: '#fafafa', borderRadius: 10, border: `1px dashed ${C.border}`,
              }}
            >
              <Mic size={28} color={C.textFaded} style={{ margin: '0 auto 10px' }} />
              <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.5 }}>
                Nothing captured yet. Tap the <strong style={{ color: C.primary }}>mic</strong> to log
                what's happening on site — AI will categorize it.
              </div>
            </div>
          ) : (
            (() => {
              const RECENT_LIMIT = 5;
              const limited = showAllActivity ? visibleActivity : visibleActivity.slice(0, RECENT_LIMIT);
              const remaining = visibleActivity.length - limited.length;
              return (
                <>
                  <div style={{ position: 'relative' }}>
                    {/* Vertical timeline rail (centered in the 48-px column) */}
                    <div
                      style={{
                        position: 'absolute',
                        left: 23, top: 20, bottom: 20,
                        width: 2, background: C.border,
                        zIndex: 0,
                      }}
                    />
                    <div className="flex flex-col gap-2" style={{ position: 'relative', zIndex: 1 }}>
                      {limited.map((item, i) => {
                        const prev = limited[i - 1];
                        const itemUser = item.user || USER.name;
                        const showHeader = !prev || (prev.user || USER.name) !== itemUser;
                        return (
                          <React.Fragment key={item.id}>
                            {showHeader && (
                              <UserGroupHeader
                                name={itemUser}
                                initials={item.userInitials || itemUser.split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase()}
                                isLive={!!item.isNew}
                              />
                            )}
                            <ActivityItem
                              item={item}
                              expanded={expandAll}
                              onClick={() => onOpenItem && onOpenItem(item)}
                            />
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                  {(remaining > 0 || showAllActivity) && (
                    <button
                      onClick={() => setShowAllActivity(v => !v)}
                      style={{
                        width: '100%', marginTop: 12, padding: '10px 12px',
                        background: '#fff', border: `1px solid ${C.border}`,
                        borderRadius: 10,
                        fontSize: 12.5, fontWeight: 700, color: C.primary,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}
                    >
                      {showAllActivity
                        ? <>Show less <ChevronDown size={14} style={{ transform: 'rotate(180deg)' }} /></>
                        : <>View {remaining} more <ChevronDown size={14} /></>}
                    </button>
                  )}
                </>
              );
            })()
          )}
        </div>
      </div>

      {/* Daily Field Reports — both shown as submitted to preview the post-submit state */}
      <div style={{ padding: '20px 12px 0' }}>
        <div className="flex items-center gap-1.5" style={{ marginBottom: 10, paddingLeft: 4 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Daily Field Reports</div>
        </div>
        <div className="flex flex-col gap-2.5">
          <ReportSummaryWidget
            title="Morning Check-In"
            icon={Calendar}
            accent={C.info}
            submittedAt="7:14 AM"
            submittedBy={USER.name}
            summary={MORNING_SUMMARY}
            tags={MORNING_TAGS}
            onOpen={() => onOpenReport && onOpenReport({
              kind: 'morning',
              title: 'Morning Check-In',
              icon: Calendar,
              accent: C.info,
              submittedAt: '7:14 AM',
              submittedBy: USER.name,
              summary: MORNING_SUMMARY,
              questions: MORNING_QUESTIONS,
              tags: MORNING_TAGS,
            })}
          />
          <ReportSummaryWidget
            title="Evening Report"
            icon={Moon}
            accent={C.warning}
            submittedAt="5:42 PM"
            submittedBy={USER.name}
            summary={EVENING_SUMMARY}
            tags={EVENING_TAGS}
            onOpen={() => onOpenReport && onOpenReport({
              kind: 'evening',
              title: 'Evening Report',
              icon: Moon,
              accent: C.warning,
              submittedAt: '5:42 PM',
              submittedBy: USER.name,
              summary: EVENING_SUMMARY,
              questions: EVENING_QUESTIONS,
              tags: EVENING_TAGS,
            })}
          />
        </div>
      </div>

      <div style={{ height: 110 }} />

      {/* Single Mic FAB — AI categorizes free-form voice notes */}
      <div
        style={{
          position: 'absolute', bottom: 22, right: 18, zIndex: 30,
        }}
      >
        <button
          onClick={() => (tour.active ? null : onMicTap && onMicTap())}
          style={{
            width: 64, height: 64, borderRadius: 32, background: C.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 14px 28px rgba(91,45,142,0.45), 0 4px 8px rgba(0,0,0,0.15)',
            position: 'relative',
          }}
        >
          {tour.active && tour.playing && (
            <span
              style={{
                position: 'absolute', inset: -8, borderRadius: 40,
                border: `2px solid ${C.primary}`, opacity: 0.5,
                animation: 'pulse 1.6s ease-out infinite',
              }}
            />
          )}
          <Mic size={28} color="#fff" strokeWidth={2.4} />
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

const TAB_DEFS = [
  { id: 'all',           label: 'All',              match: () => true },
  { id: 'notes',         label: 'Notes',            match: c => c === 'Notes' },
  { id: 'personnel',     label: 'Personnel',        match: c => c === 'Personnel' },
  { id: 'deliveries',    label: 'Deliveries',       match: c => c === 'Deliveries' },
  { id: 'inspection',    label: 'Inspection',       match: c => c === 'Inspection' },
  { id: 'safety',        label: 'Safety & Meetings', match: c => c === 'Safety and Meetings' },
  { id: 'incident',      label: 'Incidents & Delays', match: c => c === 'Incident and Delays' },
  { id: 'equipments',    label: 'Equipments',       match: c => c === 'Equipments' },
  { id: 'change_orders', label: 'Change Orders',    match: c => c === 'Change Orders' },
];

function KPI({ icon: Icon, label, value }) {
  return (
    <div className="flex-1 flex flex-col items-center" style={{ padding: '0 8px' }}>
      <Icon size={16} color="rgba(255,255,255,0.85)" />
      <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginTop: 4, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>{label}</div>
    </div>
  );
}
function KPISep() {
  return <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />;
}

function QuickAction({ icon: Icon, label, bg, iconColor, onClick }) {
  return (
    <button
      onClick={onClick}
      className="active:scale-[0.96] transition-transform"
      style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
        padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center',
        position: 'relative', cursor: 'pointer', width: '100%',
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 10, background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6,
      }}>
        <Icon size={20} color={iconColor} strokeWidth={2.2} />
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.text, textAlign: 'center', lineHeight: 1.2 }}>
        {label}
      </div>
    </button>
  );
}

function ActivityItem({ item, onClick, expanded }) {
  const Icon = item.chip.icon;
  return (
    <button
      onClick={onClick}
      className="text-left w-full active:scale-[0.985] transition-transform"
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 8,
        background: 'transparent', padding: 0,
        position: 'relative',
      }}
    >
      {/* Timeline column — icon node + time below */}
      <div
        style={{
          width: 48, flexShrink: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          position: 'relative', zIndex: 2, marginTop: 3,
        }}
      >
        <div
          style={{
            width: 32, height: 32, borderRadius: 16,
            background: item.chip.bg, color: item.chip.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `2px solid ${C.bg}`,
            boxShadow: `0 0 0 1.5px ${item.chip.color}30`,
          }}
        >
          <Icon size={15} strokeWidth={2.4} />
        </div>
        <span
          style={{
            fontSize: 10.5, color: C.textMuted, fontWeight: 600,
            marginTop: 4, whiteSpace: 'nowrap',
            background: C.bg, padding: '0 2px', borderRadius: 3,
          }}
        >
          {item.time}
        </span>
      </div>

      {/* Content card */}
      <div
        style={{
          flex: 1, minWidth: 0,
          background: '#fff',
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: '11px 12px 11px 14px',
          boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
        }}
      >
        <div className="flex items-start gap-2">
          <div
            style={{
              flex: 1, minWidth: 0,
              fontSize: 14.5, color: C.text, fontWeight: 600, lineHeight: 1.3,
            }}
          >
            {item.title || item.text}
          </div>
          <div className="flex items-center gap-1.5" style={{ flexShrink: 0, marginTop: 2 }}>
            {item.isNew && (
              <span
                style={{
                  background: C.primary, color: '#fff',
                  fontSize: 9, fontWeight: 800, letterSpacing: 0.4,
                  padding: '2px 6px', borderRadius: 4,
                  animation: 'newPulse 1.6s ease-out',
                }}
              >
                NEW
              </span>
            )}
            <ChevronRight size={13} color={C.textFaded} />
          </div>
        </div>
        <div
          style={{
            fontSize: 12.5, color: C.textMuted, marginTop: 4, lineHeight: 1.45,
            display: expanded ? 'block' : '-webkit-box',
            WebkitLineClamp: expanded ? 'unset' : 2,
            WebkitBoxOrient: 'vertical',
            overflow: expanded ? 'visible' : 'hidden',
          }}
        >
          {item.summary || item.text}
        </div>
        {/* Category label */}
        <div className="flex items-center gap-2" style={{ marginTop: 8 }}>
          <div
            className="flex items-center gap-1"
            style={{
              background: item.chip.bg, color: item.chip.color,
              fontSize: 10, fontWeight: 700, letterSpacing: 0.3,
              padding: '2px 7px', borderRadius: 5, textTransform: 'uppercase',
            }}
          >
            {item.chip.label}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes newPulse {
          0%   { transform: scale(0.9); opacity: 0; }
          40%  { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </button>
  );
}

function ReportSummaryWidget({ title, icon: Icon, accent, submittedAt, submittedBy = USER.name, summary, tags = [], onOpen }) {
  const tintBg = accent === C.info ? C.infoBg
    : (accent === C.warning ? '#ffedd5'
    : C.primaryLight);
  return (
    <button
      onClick={onOpen}
      className="text-left w-full active:scale-[0.99] transition-transform"
      style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
        padding: 14, cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
        display: 'block',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          style={{
            width: 38, height: 38, borderRadius: 10,
            background: tintBg, color: accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={18} strokeWidth={2.2} />
        </div>

        <div className="flex-1" style={{ minWidth: 0 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 2 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{title}</div>
            <span style={{ fontSize: 12, color: C.textMuted }}>·</span>
            <span style={{ fontSize: 12, color: C.textMuted }}>{submittedAt}</span>
          </div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>
            — Submitted by <strong style={{ color: C.text, fontWeight: 600 }}>{submittedBy}</strong>
          </div>

          <div
            style={{
              fontSize: 13, color: C.text, lineHeight: 1.5,
            }}
          >
            {summary}
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5" style={{ marginTop: 10 }}>
              {tags.map((t, i) => (
                <span
                  key={i}
                  style={{
                    background: t.warn ? '#fee2e2' : '#f3f4f6',
                    color: t.warn ? '#9a3412' : C.text,
                    border: t.warn ? '1px solid #fecaca' : `1px solid ${C.border}`,
                    fontSize: 11, fontWeight: 600,
                    padding: '3px 9px', borderRadius: 999,
                  }}
                >
                  {t.k}: {t.v}
                </span>
              ))}
            </div>
          )}
        </div>

        <ChevronRight size={16} color={C.textFaded} style={{ marginTop: 2, flexShrink: 0 }} />
      </div>
    </button>
  );
}

function UserGroupHeader({ name, initials, isLive }) {
  return (
    <div className="flex items-center" style={{ padding: '8px 0 4px', position: 'relative', gap: 8 }}>
      <div style={{ width: 48, flexShrink: 0, display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
        <div
          style={{
            width: 32, height: 32, borderRadius: 16,
            background: C.primary, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700,
            border: `2px solid ${C.bg}`,
            boxShadow: `0 0 0 1.5px ${C.border}`,
          }}
        >
          {initials}
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{name}</div>
      <div style={{ flex: 1 }} />
      {isLive && (
        <div
          className="flex items-center gap-1"
          style={{
            background: '#dcfce7', color: C.success,
            fontSize: 9, fontWeight: 800, letterSpacing: 0.5,
            padding: '3px 7px', borderRadius: 5,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: 3, background: C.success,
                          animation: 'liveDot 1.2s ease-in-out infinite' }} />
          LIVE
        </div>
      )}
      <style>{`
        @keyframes liveDot {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}

/* ============================================================
   SCREEN 4 — VOICE CAPTURE
   Recording → analyzing → review
   ============================================================ */
function VoiceScreen({ setScreen, voiceState, tour }) {
  const isRecording = voiceState.phase === 'recording';
  const isAnalyzing = voiceState.phase === 'analyzing';
  const currentStep = tour.active ? TOUR[voiceState.categoryIdx] : null;

  return (
    <div className="h-full w-full flex flex-col" style={{ background: C.bg }}>
      {/* Top bar */}
      <div style={{ padding: '12px 20px 8px' }} className="flex items-center justify-between">
        <button onClick={() => !tour.active && setScreen('detail')}>
          <X size={22} color={C.text} />
        </button>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Voice Capture</div>
        <div style={{ width: 22 }} />
      </div>

      {/* Project context (auto-filled, not asking) */}
      <div style={{ padding: '8px 20px 0' }}>
        <div
          style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
            padding: '10px 12px',
          }}
        >
          <div className="flex items-center gap-2">
            <Building2 size={14} color={C.primary} />
            <span style={{ fontSize: 12, color: C.textMuted }}>Logging to</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {PROJECT.name}
            </span>
          </div>
        </div>
      </div>

      {/* Tip about keywords (per Sneha's email — initial training) */}
      <div style={{ padding: '10px 20px 0' }}>
        <div
          style={{
            background: '#fef9c3', border: '1px solid #fde047', borderRadius: 10,
            padding: '8px 12px', display: 'flex', gap: 8, alignItems: 'flex-start',
          }}
        >
          <Sparkles size={14} color="#a16207" style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ fontSize: 11, color: '#713f12', lineHeight: 1.4 }}>
            <strong>Tip:</strong> Start with a keyword like "Equipment", "Incident", "Note", or "Worker" — helps AI learn faster. (Optional after first few weeks.)
          </div>
        </div>
      </div>

      {/* Mic + transcript */}
      <div className="flex-1 flex flex-col items-center justify-center" style={{ padding: '20px' }}>
        {/* Mic with animated rings */}
        <div style={{ position: 'relative', marginBottom: 28 }}>
          {isRecording && (
            <>
              <span style={{
                position: 'absolute', inset: -20, borderRadius: '50%',
                background: C.primaryLight, opacity: 0.7,
                animation: 'pulseRing 1.8s ease-out infinite',
              }} />
              <span style={{
                position: 'absolute', inset: -10, borderRadius: '50%',
                background: C.primaryLight, opacity: 0.5,
                animation: 'pulseRing 1.8s ease-out 0.6s infinite',
              }} />
            </>
          )}
          <div
            style={{
              width: 120, height: 120, borderRadius: 60,
              background: isRecording
                ? `linear-gradient(135deg, ${C.accent}, ${C.primary})`
                : isAnalyzing
                  ? `linear-gradient(135deg, #2563eb, #4f46e5)`
                  : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: isRecording
                ? '0 20px 50px rgba(91,45,142,0.5)'
                : '0 12px 30px rgba(0,0,0,0.12)',
              border: !isRecording && !isAnalyzing ? `2px solid ${C.primary}` : 'none',
              position: 'relative',
              transition: 'all 0.3s',
            }}
          >
            {isAnalyzing ? (
              <Sparkles size={44} color="#fff" />
            ) : (
              <Mic size={44} color={isRecording ? '#fff' : C.primary} strokeWidth={2} />
            )}
          </div>
        </div>

        {/* Status */}
        <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 6 }}>
          {voiceState.phase === 'idle' && 'Tap to start'}
          {isRecording && (
            <span className="flex items-center gap-2">
              <span style={{ width: 8, height: 8, borderRadius: 4, background: C.error,
                animation: 'blink 1s infinite' }} />
              Listening…
            </span>
          )}
          {isAnalyzing && 'Categorizing with AI…'}
        </div>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 28 }}>
          {isRecording && 'Tap mic to stop · or pause naturally (no timeout)'}
          {isAnalyzing && 'Extracting people, equipment, times, parts…'}
          {voiceState.phase === 'idle' && 'Press once to start, press again to stop'}
        </div>

        {/* Live transcript */}
        {(isRecording || isAnalyzing) && (
          <div
            style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
              padding: '14px 16px', width: '100%', minHeight: 80, maxWidth: 320,
            }}
          >
            <div style={{ fontSize: 11, color: C.textFaded, fontWeight: 600, letterSpacing: 0.5, marginBottom: 6 }}>
              LIVE TRANSCRIPT
            </div>
            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.5, minHeight: 42 }}>
              "{voiceState.transcript}"
              {isRecording && <span style={{ color: C.primary, marginLeft: 2 }}>|</span>}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

/* ============================================================
   SCREEN 5 — REVIEW & SAVE
   AI-categorized + extracted entities, editable before save
   ============================================================ */
function ReviewScreen({ setScreen, voiceState, setVoiceState, tour, onSave, onSaveSegments }) {
  const step = voiceState.capture || TOUR[voiceState.categoryIdx];
  const [pickerOpen, setPickerOpen] = useState(false);

  const CATEGORY_OPTIONS = [...Object.keys(FREE_CATEGORIES), 'Change Order'];

  if (!step) return null;

  // When the AI split this voice note across multiple sub-modules,
  // render the segmented review (per-item Confirm / Edit / Confirm all).
  if (step.segments && step.segments.length > 0) {
    return (
      <SegmentedReviewBody
        step={step}
        setScreen={setScreen}
        onSaveSegments={onSaveSegments}
      />
    );
  }

  const Icon = step.chip.icon;

  const changeCategory = (newCat) => {
    if (setVoiceState) {
      setVoiceState(v => ({
        ...v,
        capture: { ...v.capture, category: newCat, chip: CHIP_FROM_CATEGORY(newCat) },
      }));
    }
    setPickerOpen(false);
  };

  return (
    <div className="h-full w-full overflow-y-auto" style={{ background: C.bg }}>
      <div style={{ padding: '12px 20px 8px' }} className="flex items-center justify-between">
        <button onClick={() => setScreen('detail')}>
          <ChevronLeft size={22} color={C.text} />
        </button>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Review & Save</div>
        <div style={{ width: 22 }} />
      </div>

      {/* Transcript card */}
      <div style={{ padding: '8px 20px 0' }}>
        <div
          style={{
            background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12,
            padding: '14px 16px',
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: C.textFaded, fontWeight: 600, letterSpacing: 0.5 }}>
              YOU SAID · {step.time}
            </div>
            <button style={{ fontSize: 11, color: C.primary, fontWeight: 600 }}>Edit</button>
          </div>
          <div style={{ fontSize: 15, color: C.text, lineHeight: 1.5 }}>
            "{step.spoken}"
          </div>
        </div>
      </div>

      {/* AI category chip — editable (tap to change) */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ fontSize: 11, color: C.textFaded, fontWeight: 600, letterSpacing: 0.5, marginBottom: 8 }}>
          AI CATEGORIZED AS
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPickerOpen(v => !v)}
            className="flex items-center gap-2"
            style={{
              background: step.chip.bg, color: step.chip.color, fontWeight: 700,
              padding: '8px 14px', borderRadius: 10, fontSize: 14,
              border: `1.5px solid ${step.chip.color}30`,
              cursor: 'pointer',
            }}
          >
            <Icon size={15} strokeWidth={2.5} />
            {step.chip.label}
            <ChevronDown
              size={14}
              style={{ marginLeft: 2, transform: pickerOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            />
          </button>
          <span style={{ fontSize: 11, color: C.textMuted }}>Tap to change</span>
        </div>

        {pickerOpen && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textFaded, letterSpacing: 0.5, marginBottom: 8 }}>
              CHANGE CATEGORY
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(cat => {
                const c = CHIP_FROM_CATEGORY(cat);
                const CIcon = c.icon;
                const isCurrent = cat === step.category;
                return (
                  <button
                    key={cat}
                    onClick={() => changeCategory(cat)}
                    className="flex items-center gap-1.5"
                    style={{
                      background: isCurrent ? c.bg : '#fff',
                      color: isCurrent ? c.color : C.text,
                      border: `1.5px solid ${isCurrent ? c.color : C.border}`,
                      fontSize: 12, fontWeight: 600,
                      padding: '6px 11px', borderRadius: 18,
                      cursor: 'pointer',
                    }}
                  >
                    <CIcon size={13} strokeWidth={2.4} color={isCurrent ? c.color : C.textMuted} />
                    {cat}
                    {isCurrent && <Check size={12} color={c.color} strokeWidth={2.8} />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* AI Summary — single box */}
      <div style={{ padding: '16px 20px 0' }}>
        <div className="flex items-center gap-1.5" style={{ marginBottom: 8 }}>
          <Sparkles size={12} color={C.primary} />
          <div style={{ fontSize: 11, color: C.textFaded, fontWeight: 600, letterSpacing: 0.5 }}>
            AI SUMMARY
          </div>
        </div>
        <div
          style={{
            background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12,
            padding: '14px 16px', display: 'flex', gap: 10,
          }}
        >
          <div style={{ width: 3, borderRadius: 2, background: C.primary, flexShrink: 0 }} />
          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.55 }}>
            {step.summary || step.spoken}
          </div>
        </div>
      </div>

      {/* Add photo + Save */}
      <div style={{ padding: '20px 20px 24px' }}>
        <button
          style={{
            width: '100%', padding: '11px 16px', borderRadius: 12,
            background: '#fff', border: `1px dashed ${C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontSize: 13, color: C.textMuted, fontWeight: 600, marginBottom: 12,
          }}
        >
          <Camera size={16} />
          Add photo (optional)
        </button>
        <button
          onClick={onSave}
          style={{
            width: '100%', padding: '14px 16px', borderRadius: 12,
            background: C.primary, color: '#fff', fontSize: 15, fontWeight: 600,
            boxShadow: '0 8px 16px rgba(91,45,142,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <Check size={18} />
          Save to Activity Timeline
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   SEGMENTED REVIEW — single voice note → multiple sub-module items
   The AI split the spoken note across categories. Field user
   confirms or edits each item, then "Confirm all" saves each
   segment as its own Activity Timeline entry.
   ============================================================ */
function SegmentedReviewBody({ step, setScreen, onSaveSegments }) {
  const [segments, setSegments] = useState(step.segments);
  const [confirmed, setConfirmed] = useState(() => new Set());
  // editDraft = { idx, title, summary, category } | null
  const [editDraft, setEditDraft] = useState(null);
  // voiceRec = { target: 'title' | 'body' } | null
  const [voiceRec, setVoiceRec] = useState(null);
  const voiceTimerRef = useRef(null);

  const openEdit = (idx) => {
    const s = segments[idx];
    setEditDraft({ idx, title: s.title, summary: s.summary, category: s.category });
  };
  const cancelEdit = () => {
    setEditDraft(null);
    setVoiceRec(null);
    if (voiceTimerRef.current) { clearTimeout(voiceTimerRef.current); voiceTimerRef.current = null; }
  };
  const saveEdit = () => {
    if (!editDraft) return;
    setSegments(prev => prev.map((s, i) => (i === editDraft.idx
      ? { ...s, title: editDraft.title, summary: editDraft.summary, category: editDraft.category }
      : s)));
    setConfirmed(prev => new Set(prev).add(editDraft.idx));
    setEditDraft(null);
    setVoiceRec(null);
    if (voiceTimerRef.current) { clearTimeout(voiceTimerRef.current); voiceTimerRef.current = null; }
  };
  const toggleConfirmed = (idx) => {
    setConfirmed(prev => {
      const n = new Set(prev);
      if (n.has(idx)) n.delete(idx); else n.add(idx);
      return n;
    });
  };

  // Prototype voice dictation: simulate listening, then append a canned
  // phrase to the active field. Real product would route through the
  // same speech pipeline as the main mic capture.
  const DICTATED = 'Also notify the office and schedule a follow-up.';
  const startVoiceFor = (target) => {
    if (voiceRec) return;
    setVoiceRec({ target });
    voiceTimerRef.current = setTimeout(() => {
      setEditDraft(d => {
        if (!d) return d;
        if (target === 'title') return { ...d, title: `${d.title} — follow-up` };
        return { ...d, summary: `${d.summary} ${DICTATED}` };
      });
      setVoiceRec(null);
      voiceTimerRef.current = null;
    }, 2200);
  };
  const stopVoice = () => {
    if (voiceTimerRef.current) { clearTimeout(voiceTimerRef.current); voiceTimerRef.current = null; }
    setVoiceRec(null);
  };

  return (
    <div className="h-full w-full overflow-y-auto" style={{ background: C.bg }}>
      {/* Header */}
      <div style={{ padding: '12px 20px 8px' }} className="flex items-center justify-between">
        <button onClick={() => setScreen('detail')}>
          <ChevronLeft size={22} color={C.text} />
        </button>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Review & Save</div>
        <div style={{ width: 22 }} />
      </div>

      {/* Transcript */}
      <div style={{ padding: '8px 20px 0' }}>
        <div
          style={{
            background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12,
            padding: '14px 16px',
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: C.textFaded, fontWeight: 600, letterSpacing: 0.5 }}>
              YOU SAID · {step.time}
            </div>
            <button style={{ fontSize: 11, color: C.primary, fontWeight: 600 }}>Edit</button>
          </div>
          <div style={{ fontSize: 15, color: C.text, lineHeight: 1.5, fontStyle: 'italic' }}>
            "{step.spoken}"
          </div>
        </div>
      </div>

      {/* "Here's what I caught" */}
      <div style={{ padding: '16px 20px 0' }}>
        <div className="flex items-center gap-1.5">
          <Sparkles size={12} color={C.primary} />
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textFaded, letterSpacing: 0.5 }}>
            HERE'S WHAT I CAUGHT
          </div>
        </div>
        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
          {segments.length} items · tap to confirm or edit
        </div>
      </div>

      {/* Segment cards */}
      <div style={{ padding: '12px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {segments.map((seg, idx) => {
          const chip = CHIP_FROM_CATEGORY(seg.category);
          const SegIcon = chip.icon;
          const isConfirmed = confirmed.has(idx);
          const isEditing = editDraft && editDraft.idx === idx;

          return (
            <div
              key={idx}
              style={{
                background: '#fff',
                border: `1px solid ${isConfirmed ? chip.color + '70' : C.border}`,
                borderRadius: 12,
                padding: '12px 14px',
                boxShadow: isConfirmed ? `0 0 0 2px ${chip.color}15` : 'none',
                transition: 'all 0.15s',
              }}
            >
              {/* Header: icon + category */}
              <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
                <div
                  style={{
                    background: chip.bg, color: chip.color,
                    width: 26, height: 26, borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <SegIcon size={14} strokeWidth={2.6} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{chip.label}</div>
              </div>

              {/* Body — either read-only (Title + Body) or full editor */}
              {isEditing ? (
                <SegmentEditor
                  draft={editDraft}
                  setDraft={setEditDraft}
                  voiceRec={voiceRec}
                  startVoiceFor={startVoiceFor}
                  stopVoice={stopVoice}
                />
              ) : (
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, lineHeight: 1.4 }}>
                    {seg.title}
                  </div>
                  <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.55, marginTop: 6 }}>
                    {seg.summary}
                  </div>
                </div>
              )}

              {/* Footer buttons */}
              <div className="flex gap-2" style={{ marginTop: 12 }}>
                {isEditing ? (
                  <>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center justify-center gap-1.5"
                      style={{
                        flex: 1, padding: '7px 0', borderRadius: 8,
                        fontSize: 12, fontWeight: 600,
                        background: '#fff', color: C.textMuted,
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      <X size={12} strokeWidth={2.4} />
                      Cancel
                    </button>
                    <button
                      onClick={saveEdit}
                      className="flex items-center justify-center gap-1.5"
                      style={{
                        flex: 1, padding: '7px 0', borderRadius: 8,
                        fontSize: 12, fontWeight: 700,
                        background: C.primary, color: '#fff',
                      }}
                    >
                      <Check size={12} strokeWidth={2.8} />
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => openEdit(idx)}
                      className="flex items-center justify-center gap-1.5"
                      style={{
                        flex: 1, padding: '7px 0', borderRadius: 8,
                        fontSize: 12, fontWeight: 600,
                        background: '#fff', color: C.text,
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      <Pencil size={11} strokeWidth={2.4} />
                      Edit
                    </button>
                    <button
                      onClick={() => toggleConfirmed(idx)}
                      className="flex items-center justify-center gap-1.5"
                      style={{
                        flex: 1, padding: '7px 0', borderRadius: 8,
                        fontSize: 12, fontWeight: 700,
                        background: isConfirmed ? chip.bg : C.primary,
                        color: isConfirmed ? chip.color : '#fff',
                        border: isConfirmed ? `1px solid ${chip.color}40` : 'none',
                      }}
                    >
                      <Check size={12} strokeWidth={2.8} />
                      {isConfirmed ? 'Confirmed' : 'Confirm'}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer action bar */}
      <div style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={() => onSaveSegments(segments)}
          style={{
            width: '100%', padding: '14px 16px', borderRadius: 12,
            background: C.primary, color: '#fff', fontSize: 15, fontWeight: 700,
            boxShadow: '0 8px 16px rgba(91,45,142,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <Check size={18} />
          Confirm all ({segments.length})
        </button>
        <button
          onClick={() => setScreen('detail')}
          style={{
            width: '100%', padding: '11px 16px', borderRadius: 12,
            background: '#fff', color: C.textMuted, fontSize: 13, fontWeight: 600,
            border: `1px solid ${C.border}`,
          }}
        >
          Discard
        </button>
      </div>
    </div>
  );
}

/* Inline editor for a single segment: compact category dropdown + editable
   title + body, each text field has its own mic button to dictate edits. */
function SegmentEditor({ draft, setDraft, voiceRec, startVoiceFor, stopVoice }) {
  const [catOpen, setCatOpen] = useState(false);
  const curChip = CHIP_FROM_CATEGORY(draft.category);
  const CurCatIcon = curChip.icon;

  return (
    <div style={{ padding: 10, background: C.bg, borderRadius: 8 }}>
      {/* Category — collapsed dropdown */}
      <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
        <div
          style={{
            fontSize: 10, fontWeight: 700, color: C.textFaded,
            letterSpacing: 0.5,
          }}
        >
          CATEGORY
        </div>
        <button
          onClick={() => setCatOpen(o => !o)}
          className="flex items-center gap-1"
          style={{
            background: curChip.bg, color: curChip.color,
            border: `1px solid ${curChip.color}40`,
            fontSize: 11, fontWeight: 700,
            padding: '3px 8px', borderRadius: 12,
            cursor: 'pointer',
          }}
        >
          <CurCatIcon size={11} strokeWidth={2.6} />
          {curChip.label}
          <ChevronDown
            size={11}
            style={{
              marginLeft: 1,
              transform: catOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.15s',
            }}
          />
        </button>
      </div>
      {catOpen && (
        <div className="flex flex-wrap gap-1" style={{ marginBottom: 10 }}>
          {Object.keys(FREE_CATEGORIES)
            .filter(cat => cat !== draft.category)
            .map(cat => {
              const c = CHIP_FROM_CATEGORY(cat);
              const CIcon = c.icon;
              return (
                <button
                  key={cat}
                  onClick={() => { setDraft(d => ({ ...d, category: cat })); setCatOpen(false); }}
                  className="flex items-center gap-1"
                  style={{
                    background: '#fff', color: C.text,
                    border: `1px solid ${C.border}`,
                    fontSize: 10, fontWeight: 600,
                    padding: '3px 7px', borderRadius: 12,
                    cursor: 'pointer',
                  }}
                >
                  <CIcon size={10} strokeWidth={2.4} color={C.textMuted} />
                  {cat}
                </button>
              );
            })}
        </div>
      )}

      {/* Title */}
      <EditorField
        label="TITLE"
        target="title"
        value={draft.title}
        onChange={(v) => setDraft(d => ({ ...d, title: v }))}
        voiceRec={voiceRec}
        startVoiceFor={startVoiceFor}
        stopVoice={stopVoice}
      />

      {/* Body */}
      <EditorField
        label="BODY"
        target="body"
        multiline
        value={draft.summary}
        onChange={(v) => setDraft(d => ({ ...d, summary: v }))}
        voiceRec={voiceRec}
        startVoiceFor={startVoiceFor}
        stopVoice={stopVoice}
      />
    </div>
  );
}

function EditorField({ label, target, value, onChange, multiline, voiceRec, startVoiceFor, stopVoice }) {
  const recording = voiceRec && voiceRec.target === target;
  const otherRecording = voiceRec && voiceRec.target !== target;
  const accent = recording ? '#dc2626' : C.primary;

  const sharedInputStyle = {
    width: '100%',
    fontSize: 13,
    padding: '7px 9px',
    borderRadius: 8,
    border: `1px solid ${recording ? '#dc2626' : C.border}`,
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: 1.5,
    background: '#fff',
    color: C.text,
    boxShadow: recording ? '0 0 0 3px rgba(220,38,38,0.12)' : 'none',
    transition: 'box-shadow 0.15s, border-color 0.15s',
  };

  return (
    <div style={{ marginBottom: target === 'title' ? 10 : 0 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.textFaded, letterSpacing: 0.5 }}>
          {label}
        </div>
        <div className="flex items-center gap-1.5">
          {recording && (
            <>
              <span
                style={{
                  width: 5, height: 5, borderRadius: 3,
                  background: '#dc2626',
                  animation: 'recDot 0.9s ease-in-out infinite',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', letterSpacing: 0.3 }}>
                Listening…
              </span>
              <style>{`@keyframes recDot { 0%,100% { opacity: 1; } 50% { opacity: 0.25; } }`}</style>
            </>
          )}
          <button
            onClick={() => (recording ? stopVoice() : startVoiceFor(target))}
            disabled={otherRecording}
            aria-label={recording ? 'Stop dictation' : 'Dictate edit'}
            style={{
              width: 20, height: 20, borderRadius: 10,
              background: recording ? '#dc2626' : '#fff',
              color: recording ? '#fff' : accent,
              border: recording ? 'none' : `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: otherRecording ? 0.35 : 1,
              cursor: otherRecording ? 'not-allowed' : 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s',
            }}
          >
            <Mic size={10} strokeWidth={2.6} />
          </button>
        </div>
      </div>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          style={{ ...sharedInputStyle, resize: 'vertical', minHeight: 64 }}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={sharedInputStyle}
        />
      )}
    </div>
  );
}

/* ============================================================
   LEFT PANEL — workflow narrative + tour controls
   ============================================================ */
function LeftPanel({ tour, startTour, resetTour, setTour, screen, setScreen, simulateForemanEntry }) {
  return (
    <div
      className="hidden lg:flex flex-col gap-4"
      style={{
        width: 340, padding: '36px 28px',
        background: 'rgba(255,255,255,0.04)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, color: '#c4b5fd' }}>
          MERLIN MOBILE · v2 PROPOSAL
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginTop: 6, lineHeight: 1.25 }}>
          Voice-First Daily Log
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 8, lineHeight: 1.5 }}>
          PROSET / CC Scott Bates · field super flow
        </div>
      </div>

      <div
        style={{
          background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(167,139,250,0.3)',
          borderRadius: 12, padding: 14,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: '#c4b5fd', letterSpacing: 1 }}>
          ✦ RUN THE DEMO
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 8, lineHeight: 1.5 }}>
          Auto-plays Carlos's morning — 7 voice captures in 30 minutes — to show how AI categorizes on the fly.
        </div>
        <div className="flex gap-2" style={{ marginTop: 12 }}>
          {!tour.active || !tour.playing ? (
            <button
              onClick={startTour}
              style={{
                background: '#fff', color: C.primary, fontSize: 13, fontWeight: 700,
                padding: '8px 14px', borderRadius: 8, display: 'flex',
                alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center',
              }}
            >
              <Play size={14} fill={C.primary} />
              Run Carlos's Morning
            </button>
          ) : (
            <button
              onClick={() => setTour(t => ({ ...t, playing: false }))}
              style={{
                background: '#fff', color: C.primary, fontSize: 13, fontWeight: 700,
                padding: '8px 14px', borderRadius: 8, display: 'flex',
                alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center',
              }}
            >
              <Pause size={14} fill={C.primary} />
              Pause
            </button>
          )}
          <button
            onClick={resetTour}
            style={{
              background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, fontWeight: 700,
              padding: '8px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6,
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <RotateCcw size={14} />
          </button>
        </div>
        {tour.active && (
          <div style={{ marginTop: 12 }}>
            <div className="flex items-center justify-between" style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
              <span>Capture {tour.step + 1} of {TOUR.length}</span>
              <span>{Math.round(((tour.step + 1) / TOUR.length) * 100)}%</span>
            </div>
            <div style={{
              marginTop: 4, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, overflow: 'hidden',
            }}>
              <div style={{
                width: `${((tour.step + 1) / TOUR.length) * 100}%`, height: '100%',
                background: 'linear-gradient(90deg, #c4b5fd, #fff)', transition: 'width 0.5s',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Multi-user demo trigger */}
      <button
        onClick={simulateForemanEntry}
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px dashed rgba(196,181,253,0.4)',
          borderRadius: 10, padding: '10px 12px',
          color: '#fff', fontSize: 12, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8,
          marginTop: 4,
        }}
      >
        <Users size={14} color="#c4b5fd" />
        <div style={{ textAlign: 'left', lineHeight: 1.3 }}>
          <div>Simulate: Frank logs an incident</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}>
            See a new user enter the timeline live
          </div>
        </div>
      </button>

      <div style={{ fontSize: 11, fontWeight: 700, color: '#c4b5fd', letterSpacing: 1, marginTop: 8 }}>
        WHAT CHANGED (vs current app)
      </div>
      <div className="flex flex-col gap-2">
        <ChangePill text="Single mic FAB — AI categorizes everything (no + button needed)." />
        <ChangePill text="Categories: Note · Incident · Inspection · Safety Meeting · Toolbox Talk · Equipment · Delay." />
        <ChangePill text="Top KPI strip shows Workers · Hours · Planned · Done." />
        <ChangePill text="Functional tiles: Clock In · Morning Report · Crew Roster · Evening Report." />
        <ChangePill text="Activity Timeline pre-filled with today's captures." />
        <ChangePill text="Timeline tabs sorted by activity count (busiest categories surface first)." />
        <ChangePill text="Mic supports natural pauses — no timeout." />
        <ChangePill text="AI extracts entities + drafts side-effects (forms, PO lookups, CO drafts)." />
      </div>

      <div style={{ flex: 1 }} />

      <div className="flex gap-2 flex-wrap">
        {['home', 'projects', 'detail', 'clockin', 'morning', 'crew', 'evening'].map(s => (
          <button
            key={s}
            onClick={() => setScreen(s)}
            style={{
              fontSize: 11, fontWeight: 600,
              padding: '6px 10px', borderRadius: 6,
              background: screen === s ? 'rgba(196,181,253,0.25)' : 'rgba(255,255,255,0.06)',
              color: screen === s ? '#fff' : 'rgba(255,255,255,0.7)',
              border: `1px solid ${screen === s ? 'rgba(196,181,253,0.4)' : 'rgba(255,255,255,0.1)'}`,
              textTransform: 'capitalize',
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChangePill({ text }) {
  return (
    <div className="flex items-start gap-2" style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
      <div style={{
        width: 5, height: 5, borderRadius: 3, background: '#c4b5fd', marginTop: 7, flexShrink: 0,
      }} />
      <div>{text}</div>
    </div>
  );
}

/* ============================================================
   RIGHT PANEL — AI extraction details for current tour step
   ============================================================ */
function RightPanel({ tour, currentTour, voiceState, showSideEffects, setShowSideEffects }) {
  return (
    <div
      className="hidden lg:flex flex-col gap-4 overflow-y-auto"
      style={{
        width: 360, padding: '36px 28px',
        background: 'rgba(255,255,255,0.04)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, color: '#c4b5fd' }}>
          BEHIND THE SCENES
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginTop: 6, lineHeight: 1.25 }}>
          {tour.active ? 'AI Pipeline' : 'Carlos\'s Morning'}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 8, lineHeight: 1.5 }}>
          {tour.active
            ? 'What gets extracted from each utterance.'
            : 'Hit Play to step through 7 captures in 30 minutes.'}
        </div>
      </div>

      {!tour.active && (
        <div className="flex flex-col gap-2" style={{ marginTop: 8 }}>
          {TOUR.map((t, i) => {
            const Icon = t.chip.icon;
            return (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, padding: 12,
                }}
              >
                <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                  <div style={{
                    background: t.chip.bg, color: t.chip.color, fontSize: 10, fontWeight: 700,
                    padding: '2px 7px', borderRadius: 5,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <Icon size={10} strokeWidth={2.5} />
                    {t.chip.label}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{t.time}</div>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>
                  "{t.spoken}"
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tour.active && currentTour && (
        <RightPanelTourBody currentTour={currentTour} tour={tour} />
      )}
    </div>
  );
}

function RightPanelTourBody({ currentTour, tour }) {
  return (
    <>
      {/* Current capture header */}
          <div
            style={{
              background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(167,139,250,0.35)',
              borderRadius: 12, padding: 14,
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: '#c4b5fd', fontWeight: 700, letterSpacing: 1 }}>
                CAPTURE {tour.step + 1} / {TOUR.length}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{currentTour.time}</div>
            </div>
            <div style={{ fontSize: 14, color: '#fff', lineHeight: 1.5, fontStyle: 'italic' }}>
              "{currentTour.spoken}"
            </div>
          </div>

          {/* Category */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: '#c4b5fd', marginBottom: 6 }}>
              CATEGORY
            </div>
            <div
              className="inline-flex items-center gap-2"
              style={{
                background: currentTour.chip.bg, color: currentTour.chip.color,
                fontSize: 14, fontWeight: 700, padding: '6px 12px', borderRadius: 8,
              }}
            >
              <currentTour.chip.icon size={14} strokeWidth={2.5} />
              {currentTour.chip.label}
            </div>
          </div>

          {/* Entities */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: '#c4b5fd', marginBottom: 8 }}>
              ENTITIES EXTRACTED
            </div>
            <div
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10, overflow: 'hidden',
              }}
            >
              {currentTour.entities.map((e, i) => (
                <div
                  key={i}
                  style={{
                    padding: '9px 12px',
                    borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginBottom: 2 }}>
                    {e.k}
                  </div>
                  <div style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>
                    {e.v}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side effects */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: '#c4b5fd', marginBottom: 8 }}>
              SYSTEM SIDE-EFFECTS
            </div>
            <div className="flex flex-col gap-2">
              {currentTour.sideEffects.map((s, i) => {
                const SIcon = s.icon;
                return (
                  <div
                    key={i}
                    className="flex items-start gap-2"
                    style={{
                      background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
                      borderRadius: 10, padding: '10px 12px',
                    }}
                  >
                    <SIcon size={14} color="#86efac" style={{ marginTop: 1, flexShrink: 0 }} />
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', lineHeight: 1.45 }}>
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
    </>
  );
}

/* ============================================================
   SCREEN — CLOCK IN
   ============================================================ */
function ClockInScreen({ setScreen, clockedInAt, setClockedInAt }) {
  // Local "just submitted" state — survives until the user navigates away & back
  const [submission, setSubmission] = useState(null); // { kind: 'in'|'out', time: Date }
  // Tick every minute so the running duration stays fresh
  const [, force] = useState(0);
  useEffect(() => {
    const id = setInterval(() => force(n => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const fmt12 = (d) => {
    const h12 = ((d.getHours() + 11) % 12) + 1;
    return `${h12}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
  };
  const durLabel = (start) => {
    const ms = Math.max(0, Date.now() - start.getTime());
    const totalMin = Math.floor(ms / 60000);
    return `${Math.floor(totalMin / 60)}h ${String(totalMin % 60).padStart(2, '0')}m`;
  };

  const handleClockIn = () => {
    const now = new Date();
    setClockedInAt(now);
    setSubmission({ kind: 'in', time: now });
  };
  const handleClockOut = () => {
    const now = new Date();
    const start = clockedInAt;
    setClockedInAt(null);
    setSubmission({ kind: 'out', time: now, start, worked: start ? durLabel(start) : null });
  };

  /* ----- View A: confirmation (after pressing the button) ----- */
  if (submission) {
    const isIn = submission.kind === 'in';
    const tint = isIn ? C.success : '#ea580c';
    const tintBg = isIn ? C.successBg : '#ffedd5';
    const tintBorder = isIn ? '#86efac' : '#fed7aa';
    return (
      <div className="h-full w-full flex flex-col" style={{ background: C.bg }}>
        <ScreenHeader title={isIn ? 'Clocked In' : 'Clocked Out'} onBack={() => setScreen('detail')} />

        <div className="flex-1 flex flex-col items-center justify-center" style={{ padding: '0 28px' }}>
          <div
            style={{
              width: 148, height: 148, borderRadius: 74,
              background: tint,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 60px ${isIn ? 'rgba(34,197,94,0.40)' : 'rgba(234,88,12,0.35)'}`,
            }}
          >
            <Check size={64} color="#fff" strokeWidth={2.6} />
          </div>

          <div style={{
            fontSize: 26, fontWeight: 700, color: C.text,
            marginTop: 28, textAlign: 'center', lineHeight: 1.25,
          }}>
            {isIn ? 'You\'re clocked in' : 'You\'re clocked out'}
          </div>
          <div style={{ fontSize: 15, color: C.textMuted, marginTop: 6, textAlign: 'center' }}>
            {PROJECT.name}
          </div>

          <div
            style={{
              marginTop: 22, width: '100%',
              background: tintBg, border: `1px solid ${tintBorder}`,
              borderRadius: 14, padding: '14px 16px',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
              color: tint, textTransform: 'uppercase' }}>
              {isIn ? 'Clocked in at' : 'Clocked out at'}
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: tint, marginTop: 2, lineHeight: 1.05 }}>
              {fmt12(submission.time)}
            </div>
            {!isIn && submission.worked && (
              <div style={{ fontSize: 12.5, color: tint, marginTop: 6 }}>
                Total time on site: <strong>{submission.worked}</strong>
              </div>
            )}
            {isIn && (
              <div style={{ fontSize: 12.5, color: tint, marginTop: 6 }}>
                Go back to the project — return here to clock out.
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '0 20px 32px' }}>
          <button
            disabled
            style={{
              width: '100%', padding: '18px 16px', borderRadius: 14,
              background: '#e5e7eb', color: C.textFaded,
              fontSize: 17, fontWeight: 700,
              cursor: 'not-allowed',
            }}
          >
            {isIn ? 'Clock In submitted' : 'Clock Out submitted'}
          </button>
        </div>
      </div>
    );
  }

  /* ----- View B: currently clocked in → show running duration + Clock Out ----- */
  if (clockedInAt) {
    return (
      <div className="h-full w-full flex flex-col" style={{ background: C.bg }}>
        <ScreenHeader title="Clock Out" onBack={() => setScreen('detail')} />

        <div className="flex-1 flex flex-col items-center justify-center" style={{ padding: '0 28px' }}>
          <div
            style={{
              width: 148, height: 148, borderRadius: 74,
              background: '#fb923c',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 60px rgba(251,146,60,0.35)',
            }}
          >
            <Clock size={64} color="#fff" strokeWidth={2.2} />
          </div>

          <div style={{
            fontSize: 26, fontWeight: 700, color: C.text,
            marginTop: 32, textAlign: 'center', lineHeight: 1.25,
          }}>
            Ready to Clock Out?
          </div>
          <div style={{ fontSize: 15, color: C.textMuted, marginTop: 6, textAlign: 'center' }}>
            {PROJECT.name}
          </div>

          <div
            style={{
              marginTop: 22, width: '100%',
              background: '#ffedd5', border: '1px solid #fed7aa',
              borderRadius: 14, padding: '14px 16px',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
              color: '#9a3412', textTransform: 'uppercase' }}>
              On site for
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: '#9a3412', marginTop: 2, lineHeight: 1.05 }}>
              {durLabel(clockedInAt)}
            </div>
            <div style={{ fontSize: 12.5, color: '#9a3412', marginTop: 6 }}>
              Clocked in at <strong>{fmt12(clockedInAt)}</strong> · now {fmt12(new Date())}
            </div>
          </div>
        </div>

        <div style={{ padding: '0 20px 32px' }}>
          <button
            onClick={handleClockOut}
            style={{
              width: '100%', padding: '18px 16px', borderRadius: 14,
              background: C.primary, color: '#fff', fontSize: 17, fontWeight: 700,
              boxShadow: '0 12px 24px rgba(91,45,142,0.32)',
            }}
          >
            Clock Out
          </button>
        </div>
      </div>
    );
  }

  /* ----- View C: not clocked in → show next clock-in time + Clock In ----- */
  const now = new Date();
  return (
    <div className="h-full w-full flex flex-col" style={{ background: C.bg }}>
      <ScreenHeader title="Clock In" onBack={() => setScreen('detail')} />

      <div className="flex-1 flex flex-col items-center justify-center" style={{ padding: '0 28px' }}>
        <div
          style={{
            width: 148, height: 148, borderRadius: 74,
            background: '#22c55e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 60px rgba(34,197,94,0.40)',
          }}
        >
          <Clock size={64} color="#fff" strokeWidth={2.2} />
        </div>

        <div style={{
          fontSize: 26, fontWeight: 700, color: C.text,
          marginTop: 32, textAlign: 'center', lineHeight: 1.25,
        }}>
          Ready to Clock In?
        </div>
        <div style={{ fontSize: 15, color: C.textMuted, marginTop: 6, textAlign: 'center' }}>
          {PROJECT.name}
        </div>

        <div
          style={{
            marginTop: 22, width: '100%',
            background: C.successBg, border: '1px solid #86efac',
            borderRadius: 14, padding: '14px 16px',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
            color: '#166534', textTransform: 'uppercase' }}>
            You'll be checked in at
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#166534', marginTop: 2, lineHeight: 1.05 }}>
            {fmt12(now)}
          </div>
          <div style={{ fontSize: 12.5, color: '#166534', marginTop: 6 }}>
            Tuesday, May 12, 2026
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px 32px' }}>
        <button
          onClick={handleClockIn}
          style={{
            width: '100%', padding: '18px 16px', borderRadius: 14,
            background: C.primary, color: '#fff', fontSize: 17, fontWeight: 700,
            boxShadow: '0 12px 24px rgba(91,45,142,0.32)',
          }}
        >
          Clock In
        </button>
      </div>
    </div>
  );
}

const activityHours = () => 5.2; // mock — what the day's clocked-in crew totals

/* ============================================================
   SHARED — Questionnaire (Morning / Evening Report)
   ============================================================ */
function QuestionnaireScreen({ setScreen, title, accentColor, questions, completionText, locked, lockedAt, submittedAt }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState(() => questions.map(q => q.prefill || ''));
  const [submitted, setSubmitted] = useState(false);
  const [listening, setListening] = useState(false);
  const total = questions.length;
  const isLast = idx === total - 1;
  const currentQuestion = questions[idx];
  const isPrefilled = !!currentQuestion.prefill;

  const hasAnswer = !!(answers[idx] && answers[idx].length);

  const startMockSpeech = () => {
    if (listening || isPrefilled) return;
    setListening(true);
    // Clear existing answer so a re-record replaces it instead of appending
    setAnswers(a => a.map((v, k) => (k === idx ? '' : v)));
    const txt = currentQuestion.sample || '';
    let i = 0;
    const typer = setInterval(() => {
      i++;
      setAnswers(a => a.map((v, k) => (k === idx ? txt.slice(0, i) : v)));
      if (i >= txt.length) { clearInterval(typer); setListening(false); }
    }, 30);
  };

  if (locked) {
    return (
      <LockedReportView
        setScreen={setScreen}
        title={title}
        questions={questions}
        lockedAt={lockedAt}
        submittedAt={submittedAt}
      />
    );
  }

  if (submitted) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center"
           style={{ background: C.bg, padding: 40 }}>
        <div style={{
          width: 110, height: 110, borderRadius: 55,
          background: C.successBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 50px rgba(22,163,74,0.22)',
        }}>
          <Check size={50} color={C.success} strokeWidth={2.6} />
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.text, marginTop: 28, textAlign: 'center' }}>
          {completionText}
        </div>
        <div style={{ fontSize: 14, color: C.textMuted, marginTop: 8, textAlign: 'center', lineHeight: 1.5 }}>
          Your responses have been saved to today's Daily Log.
        </div>
        <button
          onClick={() => setScreen('detail')}
          style={{
            marginTop: 32, padding: '14px 32px', borderRadius: 12,
            background: C.primary, color: '#fff', fontSize: 15, fontWeight: 700,
          }}
        >
          Back to Site Report
        </button>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col" style={{ background: C.bg }}>
      <ScreenHeader title={title} onBack={() => setScreen('detail')} />

      {/* Progress bar */}
      <div style={{ padding: '0 20px 14px' }} className="flex items-center gap-3">
        <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            width: `${((idx + 1) / total) * 100}%`, height: '100%',
            background: accentColor, transition: 'width 0.35s ease',
          }} />
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, minWidth: 28, textAlign: 'right' }}>
          {idx + 1}/{total}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: '0 20px 12px' }}>
        {/* Previously answered (collapsed) */}
        {idx > 0 && (
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
            padding: '14px 16px', marginBottom: 14,
          }}>
            <div className="flex flex-col gap-3">
              {questions.slice(0, idx).map((q, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div style={{
                    width: 22, height: 22, borderRadius: 11, background: C.successBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 1,
                  }}>
                    <Check size={13} color={C.success} strokeWidth={3} />
                  </div>
                  <div className="flex-1" style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, color: C.textFaded, lineHeight: 1.35 }}>{q.q}</div>
                    <div style={{
                      fontSize: 13, color: C.text, marginTop: 3, lineHeight: 1.35,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {answers[i] || '—'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current question */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
          padding: '18px 18px 20px',
        }}>
          <div style={{
            display: 'inline-block',
            background: C.primaryLight, color: C.primary, fontSize: 12, fontWeight: 600,
            padding: '4px 11px', borderRadius: 8, marginBottom: 14,
          }}>
            Question {idx + 1}
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, color: C.text, lineHeight: 1.35, marginBottom: 22 }}>
            {currentQuestion.q}
          </div>

          {isPrefilled && (
            <div
              className="flex items-center gap-2"
              style={{
                background: C.successBg, border: '1px solid #86efac',
                borderRadius: 10, padding: '10px 12px', marginBottom: 14,
              }}
            >
              <Sparkles size={14} color={C.success} />
              <div style={{ fontSize: 12, color: '#166534', lineHeight: 1.4 }}>
                <strong>Auto-filled</strong> from the project you're submitting this report for.
              </div>
            </div>
          )}

          <div className="flex flex-col items-center" style={{ marginBottom: 18, opacity: isPrefilled ? 0.4 : 1 }}>
            <button
              onClick={startMockSpeech}
              disabled={isPrefilled}
              style={{
                width: 68, height: 68, borderRadius: 34,
                background: C.primaryLight, border: `2px solid ${C.primary}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                cursor: isPrefilled ? 'not-allowed' : 'pointer',
              }}
            >
              {listening && (
                <span style={{
                  position: 'absolute', inset: -6, borderRadius: 40,
                  border: `2px solid ${C.primary}`, opacity: 0.45,
                  animation: 'pulse 1.4s ease-out infinite',
                }} />
              )}
              <Mic size={26} color={C.primary} strokeWidth={2.2} />
            </button>
            <div style={{ fontSize: 13, color: C.textMuted, marginTop: 10 }}>
              {isPrefilled
                ? 'Pre-filled — no voice needed'
                : (listening
                    ? 'Listening…'
                    : (hasAnswer ? 'Tap to re-record' : 'Tap to speak'))}
            </div>
          </div>

          <textarea
            value={answers[idx]}
            onChange={e => setAnswers(a => a.map((v, k) => (k === idx ? e.target.value : v)))}
            placeholder="Type or speak your answer..."
            readOnly={isPrefilled}
            style={{
              width: '100%', minHeight: 64, padding: '12px 14px', borderRadius: 10,
              border: `1px solid ${C.border}`,
              background: isPrefilled ? '#f3f4f6' : '#f9fafb',
              color: isPrefilled ? C.text : C.text,
              fontWeight: isPrefilled ? 600 : 400,
              fontSize: 14, resize: 'none', outline: 'none',
              fontFamily: 'inherit', lineHeight: 1.45,
              cursor: isPrefilled ? 'not-allowed' : 'text',
            }}
          />
        </div>
        <div style={{ height: 12 }} />
      </div>

      {/* Footer nav */}
      <div
        style={{
          padding: '14px 20px 22px',
          borderTop: `1px solid ${C.border}`,
          background: C.bg,
        }}
        className="flex gap-3"
      >
        {idx > 0 && (
          <button
            onClick={() => setIdx(i => Math.max(0, i - 1))}
            style={{
              padding: '14px 28px', borderRadius: 12,
              background: '#fff', border: `1px solid ${C.border}`,
              color: C.text, fontSize: 15, fontWeight: 600,
            }}
          >
            Back
          </button>
        )}
        <button
          onClick={() => {
            if (isLast) setSubmitted(true);
            else setIdx(i => i + 1);
          }}
          style={{
            flex: 1, padding: '14px 16px', borderRadius: 12,
            background: C.primary, color: '#fff', fontSize: 15, fontWeight: 700,
          }}
        >
          {isLast ? 'Submit' : 'Next Question'}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   ACTIVITY DETAIL MODAL — bottom-sheet showing transcript +
   AI summary + extracted entities + side-effects.
   ============================================================ */
function ActivityDetailModal({ item, onClose, onUpdate }) {
  const [said, setSaid] = useState(item.text);
  const [summary, setSummary] = useState(item.summary || item.text);
  const [editingSaid, setEditingSaid] = useState(false);
  const [editingSummary, setEditingSummary] = useState(false);
  const [listening, setListening] = useState(null); // 'said' | 'summary' | null
  const [pickerOpen, setPickerOpen] = useState(false);
  const Icon = item.chip.icon;

  // Single-select category picker
  const CATEGORY_OPTIONS = [
    ...Object.keys(FREE_CATEGORIES),
    'Change Order',
  ];

  const changeCategory = (newCat) => {
    onUpdate && onUpdate(item.id, {
      category: newCat,
      chip: CHIP_FROM_CATEGORY(newCat),
    });
    setPickerOpen(false);
  };

  const fakeRecord = (target) => {
    if (listening) return;
    setListening(target);
    setTimeout(() => setListening(null), 1800);
  };

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 60,
        display: 'flex', alignItems: 'flex-end',
        pointerEvents: 'auto',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(15,23,42,0.55)',
          animation: 'sheetFade 0.22s ease-out',
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'relative', width: '100%', maxHeight: '88%',
          background: '#fff',
          borderTopLeftRadius: 22, borderTopRightRadius: 22,
          boxShadow: '0 -10px 40px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column',
          animation: 'sheetSlide 0.28s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* Grab handle */}
        <div style={{
          width: 44, height: 4, borderRadius: 2,
          background: '#cbd5e1', margin: '10px auto 0',
        }} />

        {/* Header */}
        <div style={{ padding: '14px 18px 12px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div
            style={{
              width: 44, height: 44, borderRadius: 12,
              background: item.chip.bg, color: item.chip.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={20} strokeWidth={2.2} />
          </div>
          <div className="flex-1" style={{ minWidth: 0 }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
              <button
                onClick={() => setPickerOpen(v => !v)}
                style={{
                  background: item.chip.bg, color: item.chip.color,
                  fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
                  padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  cursor: 'pointer',
                }}
                title="Change category"
              >
                {item.chip.label}
                <ChevronDown
                  size={11}
                  style={{ transform: pickerOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                />
              </button>
              <div className="flex items-center gap-1" style={{ fontSize: 11, color: C.textMuted }}>
                <Clock size={11} />
                <span>{item.time}</span>
              </div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>
              {item.title || 'Capture detail'}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 16, background: '#f3f4f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <X size={16} color={C.text} />
          </button>
        </div>

        <div style={{ height: 1, background: C.border, margin: '0 18px' }} />

        {/* Category picker — tap one to change */}
        {pickerOpen && (
          <div style={{ padding: '12px 18px 0' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textFaded, letterSpacing: 0.5, marginBottom: 8 }}>
              CHANGE CATEGORY
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(cat => {
                const c = CHIP_FROM_CATEGORY(cat);
                const CIcon = c.icon;
                const isCurrent = cat === item.category;
                return (
                  <button
                    key={cat}
                    onClick={() => changeCategory(cat)}
                    className="flex items-center gap-1.5"
                    style={{
                      background: isCurrent ? c.bg : '#fff',
                      color: isCurrent ? c.color : C.text,
                      border: `1.5px solid ${isCurrent ? c.color : C.border}`,
                      fontSize: 12, fontWeight: 600,
                      padding: '6px 11px', borderRadius: 18,
                      cursor: 'pointer',
                    }}
                  >
                    <CIcon size={13} strokeWidth={2.4} color={isCurrent ? c.color : C.textMuted} />
                    {cat}
                    {isCurrent && <Check size={12} color={c.color} strokeWidth={2.8} />}
                  </button>
                );
              })}
            </div>
            <div style={{ height: 1, background: C.border, marginTop: 14 }} />
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '16px 18px 24px' }}>
          {/* YOU SAID */}
          <EditableBlock
            label="YOU SAID"
            value={said}
            onChange={setSaid}
            editing={editingSaid}
            setEditing={setEditingSaid}
            listening={listening === 'said'}
            onMic={() => fakeRecord('said')}
            quoted
            accentColor={C.textFaded}
          />

          {/* AI SUMMARY — the primary box */}
          <div style={{ height: 16 }} />
          <EditableBlock
            label="AI SUMMARY"
            value={summary}
            onChange={setSummary}
            editing={editingSummary}
            setEditing={setEditingSummary}
            listening={listening === 'summary'}
            onMic={() => fakeRecord('summary')}
            sparkle
            accentColor={C.primary}
          />

          <div style={{ height: 6 }} />
        </div>
      </div>

      <style>{`
        @keyframes sheetSlide {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes sheetFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function ReportDetailModal({ report, onClose }) {
  const Icon = report.icon;
  const tintBg = report.accent === C.info ? C.infoBg
    : (report.accent === C.warning ? '#ffedd5'
    : C.primaryLight);
  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 60,
        display: 'flex', alignItems: 'flex-end',
        pointerEvents: 'auto',
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(15,23,42,0.55)',
          animation: 'sheetFade 0.22s ease-out',
        }}
      />

      <div
        style={{
          position: 'relative', width: '100%', maxHeight: '90%',
          background: '#fff',
          borderTopLeftRadius: 22, borderTopRightRadius: 22,
          boxShadow: '0 -10px 40px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column',
          animation: 'sheetSlide 0.28s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <div style={{
          width: 44, height: 4, borderRadius: 2,
          background: '#cbd5e1', margin: '10px auto 0',
        }} />

        {/* Header */}
        <div style={{ padding: '14px 18px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 42, height: 42, borderRadius: 12,
              background: tintBg, color: report.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={20} strokeWidth={2.2} />
          </div>
          <div className="flex-1" style={{ minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, lineHeight: 1.25 }}>
              {report.title}
            </div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
              {report.submittedBy} · {report.submittedAt}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 16, background: '#f3f4f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <X size={16} color={C.text} />
          </button>
        </div>

        <div style={{ height: 1, background: C.border, margin: '0 18px' }} />

        {/* Body */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '16px 18px 24px' }}>
          {/* Executive Summary */}
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textFaded, letterSpacing: 0.5, marginBottom: 8 }}>
            EXECUTIVE SUMMARY
          </div>
          <div
            style={{
              background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12,
              padding: '14px 16px',
            }}
          >
            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.55 }}>
              {report.summary}
            </div>
            {report.tags && report.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5" style={{ marginTop: 10 }}>
                {report.tags.map((t, i) => (
                  <span
                    key={i}
                    style={{
                      background: t.warn ? '#fee2e2' : '#f3f4f6',
                      color: t.warn ? '#9a3412' : C.text,
                      border: t.warn ? '1px solid #fecaca' : `1px solid ${C.border}`,
                      fontSize: 11, fontWeight: 600,
                      padding: '3px 9px', borderRadius: 999,
                    }}
                  >
                    {t.k}: {t.v}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Detailed Responses */}
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textFaded, letterSpacing: 0.5, marginTop: 20, marginBottom: 10 }}>
            DETAILED RESPONSES
          </div>
          <div className="flex flex-col gap-3">
            {report.questions.map((qq, i) => (
              <div key={i} style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 3, borderRadius: 2, background: report.accent, flexShrink: 0 }} />
                <div className="flex-1">
                  <div style={{ fontSize: 12.5, color: C.textMuted, lineHeight: 1.4 }}>
                    {qq.q}
                  </div>
                  <div
                    style={{
                      fontSize: 14, color: C.text, fontWeight: 500,
                      marginTop: 4, lineHeight: 1.5,
                    }}
                  >
                    {qq.prefill || qq.sample || '—'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ height: 4 }} />
        </div>
      </div>

      <style>{`
        @keyframes sheetSlide {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes sheetFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function EditableBlock({ label, value, onChange, editing, setEditing, listening, onMic, accentColor, quoted, sparkle }) {
  const [expanded, setExpanded] = useState(false);
  const LONG_CHARS = 180;
  const isLong = (value || '').length > LONG_CHARS;
  const displayed = (!expanded && isLong) ? value.slice(0, LONG_CHARS).trimEnd() + '…' : value;

  return (
    <div>
      <div className="flex items-center gap-1.5" style={{ marginBottom: 8 }}>
        {sparkle && <Sparkles size={12} color={C.primary} />}
        <div style={{ fontSize: 11, fontWeight: 700, color: C.textFaded, letterSpacing: 0.5 }}>
          {label}
        </div>
        <div style={{ flex: 1 }} />
        <button
          onClick={onMic}
          disabled={listening}
          style={{
            width: 48, height: 48, borderRadius: 24,
            background: listening ? C.primary : C.primaryLight,
            border: listening ? 'none' : `1.5px solid ${C.primary}`,
            color: listening ? '#fff' : C.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
            boxShadow: listening ? '0 6px 14px rgba(91,45,142,0.35)' : 'none',
          }}
          title="Re-record"
        >
          {listening && (
            <span style={{
              position: 'absolute', inset: -6, borderRadius: 28,
              border: `2px solid ${C.primary}`, opacity: 0.45,
              animation: 'pulseDot 1.4s ease-out infinite',
            }} />
          )}
          <Mic size={22} strokeWidth={2.2} />
        </button>
        <button
          onClick={() => setEditing(v => !v)}
          style={{
            width: 38, height: 38, borderRadius: 19,
            background: editing ? C.primary : '#fff',
            border: `1px solid ${editing ? C.primary : C.border}`,
            color: editing ? '#fff' : C.text,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          title={editing ? 'Done editing' : 'Edit'}
        >
          {editing ? <Check size={17} strokeWidth={2.5} /> : <Pencil size={15} strokeWidth={2.2} />}
        </button>
      </div>

      {editing ? (
        <textarea
          autoFocus
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', minHeight: 90, padding: '12px 14px',
            borderRadius: 12, border: `1.5px solid ${C.primary}`,
            background: '#fff', fontSize: 14, color: C.text,
            lineHeight: 1.55, resize: 'none', outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      ) : (
        <div
          style={{
            background: '#fff',
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: '14px 16px',
            boxShadow: sparkle ? '0 2px 6px rgba(91,45,142,0.06)' : '0 1px 2px rgba(15,23,42,0.04)',
          }}
        >
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 3, borderRadius: 2, background: accentColor, flexShrink: 0 }} />
            <div style={{
              fontSize: 14, color: C.text, lineHeight: 1.6,
              fontStyle: quoted ? 'italic' : 'normal',
            }}>
              {quoted ? `"${displayed}"` : displayed}
            </div>
          </div>
          {isLong && (
            <button
              onClick={() => setExpanded(v => !v)}
              style={{
                marginTop: 10, marginLeft: 13,
                fontSize: 12, fontWeight: 700, color: C.primary,
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}
            >
              {expanded ? 'View less' : 'View more'}
              <ChevronDown
                size={13}
                style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
              />
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulseDot {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ============================================================
   LOCKED REPORT VIEW (read-only after the report's cut-off time)
   ============================================================ */
function LockedReportView({ setScreen, title, questions, lockedAt, submittedAt }) {
  return (
    <div className="h-full w-full flex flex-col" style={{ background: C.bg }}>
      <ScreenHeader title={title} onBack={() => setScreen('detail')} />

      <div style={{ padding: '0 20px 14px' }}>
        <div
          className="flex items-start gap-2.5"
          style={{
            background: C.warningBg, border: '1px solid #fed7aa', borderRadius: 12,
            padding: '12px 14px',
          }}
        >
          <Lock size={16} color={C.warning} style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#9a3412' }}>
              Locked at {lockedAt}
            </div>
            <div style={{ fontSize: 12, color: '#9a3412', marginTop: 2, lineHeight: 1.45 }}>
              {submittedAt
                ? `Submitted by ${USER.name} at ${submittedAt}. Reports are read-only after the cut-off.`
                : 'Reports become read-only after the daily cut-off time.'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: '0 20px 28px' }}>
        <div
          style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
          }}
        >
          {questions.map((q, i) => (
            <div
              key={i}
              style={{
                padding: '14px 16px',
                borderTop: i === 0 ? 'none' : `1px solid ${C.border}`,
              }}
            >
              <div className="flex items-start gap-2.5">
                <div
                  style={{
                    width: 22, height: 22, borderRadius: 11, background: C.successBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 2,
                  }}
                >
                  <Check size={13} color={C.success} strokeWidth={3} />
                </div>
                <div className="flex-1">
                  <div style={{ fontSize: 11, color: C.textFaded, fontWeight: 600, letterSpacing: 0.4 }}>
                    QUESTION {i + 1}
                  </div>
                  <div style={{ fontSize: 14, color: C.text, marginTop: 2, lineHeight: 1.35 }}>
                    {q.q}
                  </div>
                  <div
                    style={{
                      fontSize: 13, color: C.textMuted, marginTop: 8,
                      padding: '10px 12px', background: '#f9fafb',
                      borderRadius: 8, lineHeight: 1.45,
                    }}
                  >
                    {q.prefill || q.sample || '—'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SCREEN — MORNING REPORT
   ============================================================ */
function MorningReportScreen({ setScreen }) {
  const morningLocked = new Date().getHours() >= 9;
  return (
    <QuestionnaireScreen
      setScreen={setScreen}
      title="Morning Report"
      accentColor={C.primary}
      questions={MORNING_QUESTIONS}
      completionText="Morning Report submitted"
      locked={morningLocked}
      lockedAt="9:00 AM"
      submittedAt="7:14 AM"
    />
  );
}

/* ============================================================
   SCREEN — CREW ROSTER
   ============================================================ */
function CrewRosterScreen({ setScreen }) {
  // Per-member state mirroring CREW; updated when actions are taken
  const [crewState, setCrewState] = useState(() => {
    const m = {};
    CREW.forEach(c => {
      m[c.id] = {
        status: c.status === 'on-site' ? 'on-site' : 'off-site',
        clockIn: c.clockIn,
        clockOut: c.clockOut,
        worked: c.worked,
      };
    });
    return m;
  });
  const [selected, setSelected] = useState(() => new Set());
  const [lastAction, setLastAction] = useState(null); // { kind, count, time }

  const fmt12 = () => {
    const d = new Date();
    const h12 = ((d.getHours() + 11) % 12) + 1;
    return `${h12}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
  };

  const toggle = (id) => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const selectAll = () => setSelected(new Set(CREW.map(c => c.id)));
  const clearSelection = () => setSelected(new Set());

  // Buttons only act on the *valid* slice of the current selection
  const eligibleForIn  = [...selected].filter(id => crewState[id].status === 'off-site');
  const eligibleForOut = [...selected].filter(id => crewState[id].status === 'on-site');

  const onClockSelected = (kind) => {
    const ids = kind === 'in' ? eligibleForIn : eligibleForOut;
    if (ids.length === 0) return;
    const time = fmt12();
    setCrewState(prev => {
      const next = { ...prev };
      ids.forEach(id => {
        const m = { ...next[id] };
        if (kind === 'in') {
          m.status = 'on-site';
          m.clockIn = time;
          m.clockOut = null;
          m.worked = '0h 00m';
        } else {
          m.status = 'off-site';
          m.clockOut = time;
          // keep clockIn / leave worked as-is (mock)
        }
        next[id] = m;
      });
      return next;
    });
    setLastAction({ kind, count: ids.length, time });
    clearSelection();
  };

  return (
    <div className="h-full w-full flex flex-col" style={{ background: C.bg }}>
      <ScreenHeader title="Crew Roster" onBack={() => setScreen('detail')} />

      {/* Selection meta row */}
      <div style={{ padding: '4px 20px 0' }} className="flex items-center gap-2">
        <div style={{ fontSize: 13, color: C.textMuted, fontWeight: 600 }}>
          {selected.size > 0 ? `${selected.size} selected` : 'Tap rows to select crew'}
        </div>
        <div style={{ flex: 1 }} />
        {selected.size > 0 ? (
          <button onClick={clearSelection} style={{ fontSize: 12, fontWeight: 700, color: C.textMuted }}>
            Clear
          </button>
        ) : (
          <button onClick={selectAll} style={{ fontSize: 12, fontWeight: 700, color: C.primary }}>
            Select all
          </button>
        )}
      </div>

      {/* Last-action toast */}
      {lastAction && (
        <div style={{ padding: '10px 20px 0' }}>
          <div
            className="flex items-center gap-2"
            style={{
              background: lastAction.kind === 'in' ? C.successBg : '#ffedd5',
              border: `1px solid ${lastAction.kind === 'in' ? '#86efac' : '#fed7aa'}`,
              borderRadius: 10, padding: '10px 12px',
            }}
          >
            <Check size={14} color={lastAction.kind === 'in' ? C.success : C.warning} strokeWidth={3} />
            <div style={{ fontSize: 12.5, color: C.text, flex: 1 }}>
              <strong>{lastAction.count}</strong> crew {lastAction.kind === 'in' ? 'clocked in' : 'clocked out'} at <strong>{lastAction.time}</strong>
            </div>
            <button onClick={() => setLastAction(null)}>
              <X size={14} color={C.textMuted} />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto" style={{ padding: '12px 20px 100px' }}>
        <div className="flex flex-col gap-2.5">
          {CREW.map(m => {
            const s = crewState[m.id];
            const isSel = selected.has(m.id);
            const isOn  = s.status === 'on-site';
            return (
              <button
                key={m.id}
                onClick={() => toggle(m.id)}
                className="text-left w-full active:scale-[0.99] transition-transform"
                style={{
                  background: C.surface,
                  border: isSel ? `1.5px solid ${C.primary}` : `1px solid ${C.border}`,
                  borderRadius: 14, padding: 12,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}
              >
                <div
                  style={{
                    width: 44, height: 44, borderRadius: 22,
                    background: isOn ? C.successBg : '#e5e7eb',
                    color: isOn ? C.success : C.textMuted,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, flexShrink: 0,
                  }}
                >
                  {m.initials}
                </div>
                <div className="flex-1" style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{m.role}</div>
                  {s.clockIn ? (
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1" style={{ marginTop: 6 }}>
                      <span style={{ fontSize: 11, color: C.textMuted }}>
                        <strong style={{ color: C.text, fontWeight: 600 }}>In</strong> {s.clockIn}
                      </span>
                      <span style={{ fontSize: 11, color: C.textMuted }}>
                        <strong style={{ color: C.text, fontWeight: 600 }}>Out</strong> {s.clockOut || '—'}
                      </span>
                      <span style={{ fontSize: 11, color: C.textMuted }}>
                        <strong style={{ color: C.text, fontWeight: 600 }}>Hours</strong> {s.worked || '—'}
                      </span>
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: C.textFaded, marginTop: 6 }}>
                      Not clocked in yet
                    </div>
                  )}
                </div>
                <div
                  style={{
                    width: 26, height: 26, borderRadius: 6,
                    background: isSel ? C.primary : '#fff',
                    border: isSel ? 'none' : `1.5px solid ${C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >
                  {isSel && <Check size={15} color="#fff" strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky bottom action bar — buttons reflect only valid candidates */}
      <div
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          padding: '12px 16px 18px', background: C.surface,
          borderTop: `1px solid ${C.border}`,
          boxShadow: '0 -6px 18px rgba(15,23,42,0.06)',
          display: 'flex', gap: 10,
        }}
      >
        <button
          onClick={() => onClockSelected('out')}
          disabled={eligibleForOut.length === 0}
          style={{
            flex: 1, padding: '14px 8px', borderRadius: 12,
            background: '#fff',
            border: `1.5px solid ${eligibleForOut.length === 0 ? C.border : '#fb923c'}`,
            color: eligibleForOut.length === 0 ? C.textFaded : '#9a3412',
            fontSize: 14, fontWeight: 700,
            cursor: eligibleForOut.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          Clock Out{eligibleForOut.length > 0 ? ` (${eligibleForOut.length})` : ''}
        </button>
        <button
          onClick={() => onClockSelected('in')}
          disabled={eligibleForIn.length === 0}
          style={{
            flex: 1.2, padding: '14px 8px', borderRadius: 12,
            background: eligibleForIn.length === 0 ? '#f3f4f6' : C.primary,
            color: eligibleForIn.length === 0 ? C.textFaded : '#fff',
            border: 'none',
            fontSize: 14, fontWeight: 700,
            cursor: eligibleForIn.length === 0 ? 'not-allowed' : 'pointer',
            boxShadow: eligibleForIn.length === 0 ? 'none' : '0 8px 16px rgba(91,45,142,0.28)',
          }}
        >
          Clock In{eligibleForIn.length > 0 ? ` (${eligibleForIn.length})` : ''}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   SCREEN — EVENING REPORT
   ============================================================ */
function EveningReportScreen({ setScreen }) {
  return (
    <QuestionnaireScreen
      setScreen={setScreen}
      title="Evening Report"
      accentColor={C.warning}
      questions={EVENING_QUESTIONS}
      completionText="Evening Report submitted"
    />
  );
}

/* ============================================================
   Shared small components for the new screens
   ============================================================ */
function ScreenHeader({ title, onBack }) {
  return (
    <div style={{ padding: '12px 20px 8px' }} className="flex items-center justify-between">
      <button onClick={onBack} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center' }}>
        <ChevronLeft size={24} color={C.text} />
      </button>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{title}</div>
      <div style={{ width: 32 }} />
    </div>
  );
}

function ProjectLabel() {
  return (
    <div
      style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
        padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8,
      }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 8, background: C.primaryLight,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <MapPin size={14} color={C.primary} />
      </div>
      <div className="flex-1" style={{ overflow: 'hidden' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {PROJECT.name}
        </div>
        <div style={{ fontSize: 11, color: C.textMuted }}>{PROJECT.city}</div>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 1, marginBottom: 8 }}>
      {children}
    </div>
  );
}

function Avatar({ initials, size = 36 }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: size / 2,
        background: C.primaryLight, color: C.primary,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size < 28 ? 10 : 12, fontWeight: 700, flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function SummaryCell({ label, value }) {
  return (
    <div className="flex-1 flex flex-col items-center" style={{ padding: '0 8px' }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: C.text, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function DividerV() {
  return <div style={{ width: 1, background: C.border }} />;
}
