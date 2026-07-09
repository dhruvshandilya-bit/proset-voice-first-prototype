/**
 * MerlinSiteProsetWebV2.jsx — PLAT-104 ProSet variant V2 (voice-first)
 *
 * What's different from V1 (MerlinSiteProsetWeb.jsx):
 *   1. VISUAL: matches MerlinSiteProWeb's design language (V2's visual system)
 *      — same gradient hero, AI Weekly Summary card, sectioned cards, KPI shapes
 *   2. VOICE-FIRST: every module screen reframed as "captured data + edit"
 *      not "fill in this form". Forms exist as fallback only.
 *   3. ORG DASHBOARD CONFIG: widget visibility is org-level, not per-user.
 *      Admin in Settings → Dashboard configures.
 *   4. PROSET DEDICATED REPORT: org-specific OrgReportTemplate. PROSET
 *      gets their custom layout (matches the PDF reference). Other orgs
 *      get generic / their own.
 *   5. AI CAPTURED BANNER on every module screen — closes the loop:
 *      "23 check-ins captured via voice at 6:30 AM today · review →"
 *   6. INLINE EDIT + CONFIDENCE PILL on every captured field.
 *   7. + Create button DEMOTED to a small icon. Ask AI is the prominent CTA.
 *
 * Per CLAUDE.md Law 14: org-specific behavior driven by OrgFeatureConfig
 * (dashboardWidgets, reportTemplate, scopeLibrary). No client-name conditionals.
 */

import React, { useState, useEffect } from 'react';
import {
  Home, ClipboardList, Users, Truck, Wrench, AlertTriangle,
  Calendar, Package, ShieldCheck, ClipboardCheck, FileText,
  Settings, Mic, Plus, Search, Bell, ChevronDown, ChevronRight,
  ChevronLeft, ChevronUp, ArrowLeft, ArrowRight, X, Check, MoreVertical,
  Sun, MoreHorizontal, CheckCircle2, Circle, Clock, AlertCircle,
  HardHat, MessageCircle, Briefcase, DollarSign, Sparkles, IdCard,
  TrendingUp, TrendingDown, Activity, Layers, FilePlus, FileDown,
  Download, Share2, Loader2, FileSignature, Edit3, Trash, Mail,
  MapPin, Phone, Headphones, Square, Play, Pause, Volume2, BarChart3,
  AlertOctagon, UserCheck, UserPlus, Shield, Eye, ThumbsUp, ThumbsDown,
  RefreshCw, FolderOpen, Star, Pin, Moon, ArrowLeftRight, LayoutGrid,
  Receipt, Box, Cog, Send, Image as ImageIcon, Pencil, EyeOff,
  Filter, SlidersHorizontal, Zap, Info, Camera, Video, Paperclip, Film,
  StickyNote, GripVertical, Hash
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

// ============================================================================
// THEME / TOKENS — matches MerlinSiteProWeb (V2)
// ============================================================================
const PURPLE       = '#534AB7';
const PURPLE_LIGHT = '#EEEDFE';
const PURPLE_DEEP  = '#3C3489';
const SUCCESS      = '#16A34A';
const SUCCESS_BG   = '#DCFCE7';
const DANGER       = '#DC2626';
const DANGER_BG    = '#FEE2E2';
const WARN         = '#D97706';
const WARN_BG      = '#FEF3C7';
const INFO         = '#2563EB';
const INFO_BG      = '#DBEAFE';
const TEXT         = '#0F172A';
const TEXT_MUTED   = '#475569';
const BORDER       = '#E2E8F0';

// ============================================================================
// SEED DATA — PROSET project (Lithium Workforce Housing — modular)
// Data here is meant to look "captured by AI from voice" not "manually entered"
// ============================================================================
const PROJECTS = [
  { id: 'p1', name: 'Lithium Workforce Housing', client: 'Target Construction', address: '4400 Industrial Pkwy · Phoenix, AZ', superintendent: 'Erik Odowd',
    progress: 6.35, daysIn: 34, daysTotal: 320, type: 'modular',
    weather: { temp: 78, condAM: 'Clear / Sunny', condPM: 'Clear w/ Wind Gusts', wind: '15 mph PM', morningTemp: 49 },
    modularStats: { setToday: 9, totalSet: 44, remaining: 652, pctComplete: 6.35, panelsSetToday: 0, totalPanelsSet: 0 } },
  { id: 'p2', name: 'Andrew Briggs Residence', client: 'Briggs Holdings LLC', address: '1247 Elm St · Dallas, TX', superintendent: 'Mike Reyes', progress: 25, daysIn: 34, daysTotal: 120, type: 'standard', weather: { temp: 78, condAM: 'Clear', condPM: 'Clear', wind: '6 mph' }, modularStats: null },
];

// ============================================================================
// ORG-LEVEL CONFIG (Law 14 — Config not Code)
// In production, fetched from /api/v1/org/feature-config and merged with
// project-level overrides. Everything below is the SaaS configurability surface
// for First Go: catalogs, feature flags, report template, dashboard widgets.
// ============================================================================
const ORG_DASHBOARD_CONFIG = {
  // -------- CATALOGS (org-editable dropdowns / option lists) ---------------
  // Each is an array of strings (or {value,label} pairs where order matters).
  // Edited via OrgConfigPanel → Catalogs tab. AI extraction uses these to
  // constrain the captured value set.
  catalogs: {
    trades:               ['GC','Electrical','Plumbing','HVAC','Steel','Concrete','Drywall','Roofing','Carpentry','Masonry','Earthwork','Sub'],
    designations:         ['STAFF','SUBCONTRACTOR','1099','PER_DIEM','OWNER_OP'],
    roles:                ['Setter','Panel','Stitch','Prep','Foreman','Journeyman','Apprentice','Helper','Operator','Laborer','PM','Super','Sub','Other'],
    scopes:               ['Crane Set','Stairs','Panel Set','Structural Connections','Exterior Stitch','Interior Stitch','Temp Dry In Mods','Change Order Work','Other'],
    units:                ['mod','sheets','pcs','EA','LF','SF','SY','CY','TON','LB','GAL','BAG','tubes','units'],
    severityScale:        ['N/A','Near-miss','First-aid','Recordable','Lost-time','Fatal'],
    delaySeverity:        ['Minor','Major','Critical'],
    incidentCategories:   ['Safety','Schedule','Material shortage','Weather','Equipment','Scope change','Owner directive','Crew issue','Quality','Coordination','Other'],
    incidentStatuses:     ['OPEN','IN_PROGRESS','RESOLVED','ESCALATED'],
    delayReasons:         ['Weather','Owner directive','Subcontractor','Material short','Equipment breakdown','Inspection failure','Permit','Design clarification','Other'],
    deliveryStatuses:     ['Received','Pending','Damaged','Short','Returned','Partial','Cancelled'],
    equipmentStatuses:    ['ACTIVE','IDLE','IN_MAINTENANCE','BROKEN','RETURNED','ON_RENT'],
    equipmentTypes:       ['Boom lift','Telehandler','Crane','Excavator','Skid steer','Generator','Mixer','Forklift','Truck','Other'],
    equipmentOwnership:   ['OWNED','RENTED','LEASED'],
    materialCategories:   ['Structural','Finish','MEP','Sitework','Fire/Life Safety','Doors/Glazing','Misc'],
    materialStatuses:     ['ok','short','damaged','pending','returned','stored_offsite'],
    inspectionTypes:      ['Pre-pour','Pre-grout','Structural','MEP rough','Framing','Insulation','Drywall','Fire','Final','Module Prep','Module Set','Punch'],
    inspectionResults:    ['Pass','Pass with notes','Fail','Re-inspect','Conditional'],
    inspectorAffiliations:['Owner','AHJ','Third-party','Self','Subcontractor'],
    visitorTypes:         ['Owner','Sub','Inspector','Vendor','AHJ','Media','Other'],
    visitorPurposes:      ['Inspection','Tour','Meeting','Delivery','Audit'],
    meetingTypes:         ['Toolbox Talk','Safety Meeting','Pre-task plan','Incident stand-down','Owner/GC meeting','Pull plan','Coordination'],
    noteTags:             ['logistics','client','safety','communications','lookahead','quality','schedule','hot','archived','PM Decision'],
    weatherConditions:    ['Clear','Sunny','Partly cloudy','Cloudy','Overcast','Rain','T-storm','Snow','Sleet','Fog','Haze','Smoke'],
    ppeRequired:          ['Hard hat','Eye','Ear','Hand','Fall','Hi-vis','Respiratory'],
    certifications:       ['OSHA 10','OSHA 30','Crane Sig','First Aid','CPR','Forklift','Aerial Lift','Confined Space','Welding'],
    projectTypes:         ['standard','modular'],
    costCodes:            ['01-100 General','03-300 Concrete','05-100 Structural Steel','06-100 Rough Carpentry','09-200 Drywall','13-340 Modular Units','EQ-001 Boom Lift','EQ-002 Crane','EQ-003 Forklift'],
    visibility:           ['private','team','org','client'],
    compensableExcusable: ['Compensable','Excusable non-compensable','Non-excusable'],
  },

  // -------- FEATURE FLAGS (org-level toggles) ------------------------------
  // Defaults below honor the locked Phase 1 decisions:
  //   - dual signature / submit-to-client OFF (no e-sign workflow Phase 1/2)
  //   - voice always requires human review (handled in capture flow, not a flag)
  featureFlags: {
    requireDualSignature:                  false,  // LOCKED OFF Phase 1/2
    submitToClientFlow:                    false,  // LOCKED OFF Phase 1/2
    aiTriggerScanning:                     true,
    requirePhotoForDeliveries:             false,
    requirePhotoForIncidents:              true,
    requirePreShiftEquipmentInspection:    true,
    requireDailyToolboxTalk:               true,
    enableQuantitiesInstalled:             true,
    enableLaborCostVisibility:             false,  // role-gated; off for non-PM
    enableWeatherDelaySubmodule:           true,   // mobile parity
    enableSubcontractorDailyReport:        false,  // Phase 2
    enableRfisModule:                      false,  // Phase 2
    enableSubmittalsModule:                false,  // Phase 2
  },

  // -------- OPTIONAL FIELDS (per submodule, admin-opt-in) ------------------
  // Each schema in buildItemSchemas() declares some fields as `advanced: true`.
  // These are NOT shown in the capture dialog by default — keeps the form
  // short. Orgs that want any of them surfaced flip the field id on here:
  //   enabledOptionalFields: { delivery: ['billOfLading','truckPlate'] }
  // For First Go we ship with none enabled — essentials only across the board.
  // (Each schema's `advanced` field defs stay in code as the menu of available
  // extras; no UI editor for this in First Go — admins toggle via support.)
  enabledOptionalFields: {
    personnel:           [],
    delivery:            [],
    safetyMeeting:       [],
    incident:            [],
    inspection:          [],
    equipment:           [],
    material:            [],
    note:                [],
    weatherDelay:        [],
    quantitiesInstalled: [],
    subOnSite:           [],
  },

  // -------- VOICE-CAPTURE HINTS (per submodule, admin-editable) ------------
  // The schema (fields + catalog enums) is the AI extraction contract — that's
  // auto-generated, not edited. What admins CAN tune per submodule:
  //   examples[]  — phrases your crew actually says (few-shot for the AI)
  //   triggers[]  — words/phrases that should be FLAGGED on the daily log
  //                 (change-order, PM Decision, owner directive, near-miss,
  //                 recordable, OSHA, lookahead, etc.) — read by AI_TRIGGERS
  //                 highlighter and the report's "needs attention" list.
  // Examples below are seeded with Proset-driven scenarios pulled from their
  // 04.16.25 Daily Report PDF and the captured-voice commentary patterns we
  // see in the field. Add / edit / remove freely from the AI capture hints
  // tab — every change flows into the next AI extraction.
  // Each example below is hand-tuned to mention EVERY essential field for that
  // submodule, in the order/phrasing a foreman naturally speaks. If the user
  // says any of these, the AI fills the entire essential set in one pass.
  // Field coverage notes (in order of appearance) live in comments per submodule.
  voiceHints: {
    // PERSONNEL essentials covered: worker · empId · trade · role · scopeToday · checkIn · checkOut · wageRate · overtimeFlag · ppeVerified
    personnel: {
      examples: [
        '"Juan Alencastro, employee 101, GC trade, setter role, scope set, in at 6:30 AM out 5:15 PM, $38 per hour, no overtime, PPE verified."',
        '"Eric Cortez, ID 134, GC setter, scope set crew, in 6:30 out 5:17, $38 wage, overtime yes, PPE good."',
        '"Westervelt sub Joe, employee WV1, sub trade, sub role, scope other, in 7 AM out 5 PM, $65 hour, overtime no, PPE checked."',
        '"Tyler Staas, ID 323, GC prep, scope prep, in 6:45 out 4:42, $32 hour, no OT, PPE on."',
        '"Mayolo Hernandez, employee 163, GC setter, scope set, 6:30 to 5:16, $36 per hour, no overtime, PPE verified."',
      ],
      triggers: ['late', 'no-show', 'medical', 'recert due', 'cross-train', 'short-handed', 'overtime'],
    },
    // DELIVERY essentials covered: supplier · material · qty · unit · poNumber · status · storageLocation · notes
    delivery: {
      examples: [
        '"Westervelt supplier, material mod D19/786-2, qty 1 mod, PO 3042, status received, stored Yard 3 — full set in good condition."',
        '"JLG Industries supplier, 40-foot boom lift material, qty 1 unit, PO 4501, status received, stored Yard 3 — fourth boom on site."',
        '"BuildMart supplier, drywall 5/8 inch, qty 50 sheets, PO 1040, status damaged, stored lay-down — 4 sheets cracked, credit pending."',
        '"Simpson Strong-Tie supplier, anchor bolts 3/4 inch Grade 8, 600 pcs, PO 2210, status received, Yard 2 — RFI 42 closed."',
        '"Pending sealant supplier, structural silicone, 48 tubes, PO 1108, status pending, no storage yet — long-lead expected Wednesday."',
      ],
      triggers: ['damaged', 'short', 'discrepancy', 'wrong material', 'pending', 'late', 'credit pending', 'RFI', 'long-lead'],
    },
    // SAFETY MEETING essentials covered: topic · type · lead · time · duration · attendees · notes
    safetyMeeting: {
      examples: [
        '"Topic boom lift fall protection 100% tie-off, type Toolbox Talk, lead Erik Odowd, time 6:35 AM, 12 minutes, 14 attendees — solid attention, all signed."',
        '"Topic high-wind crane cutoff thresholds, type Pre-task plan, lead Erik, time 12:30 PM, 8 minutes, 13 attendees — Mayolo and Miguel missed."',
        '"Topic 786-A2 e-box stand-down, type Incident stand-down, lead Erik, time 4:30 PM, 5 minutes, 15 attendees — full crew briefed on near-miss."',
        '"Topic Target boom lift safety standards meeting, type Owner/GC meeting, lead Chris from Target, time 2 PM, 30 minutes, 6 attendees — Bechtel notes to follow."',
        '"Topic stair set pre-task plan, type Pre-task plan, lead Erik, time 6:50 AM, 10 minutes, 7 attendees — Spanish translation by Carlos."',
      ],
      triggers: ['missed', 'stand-down', 'near-miss follow-up', 'recert due', 'translator needed', 'language barrier'],
    },
    // INCIDENT essentials covered: kind · title · category · severity · time · location · description · actionTaken · impactHours · changeOrderTrigger
    incident: {
      examples: [
        '"Safety incident, title crane move mid-day, category Scope change, severity Near-miss, time 11:30 AM, location Dorm 19 stairwell, description 786-A2 e-box too wide for corridor, action taken removed box and cut wire per Dave Ault, 1 hour impact, change-order trigger yes."',
        '"Operational delay, title wind shut-down on 10th mod, category Owner directive, severity N/A, time 4:15 PM, location Dorm 19 set zone, description Target Management did not feel comfortable proceeding, action taken crew demobilized and PM Decision logged, 0.5 hour impact, no change order."',
        '"Safety incident, title near-miss on stairwell pivot, category Safety, severity Near-miss, time 10:30 AM, location Dorm 19 column 14, description mod corner came close to column on pivot, action taken adjusted rigging and stopped pour, 0.25 hour impact, no change order."',
        '"Operational delay, title Yard 2 staging reshuffle, category Schedule, severity N/A, time 7:30 AM, location Yard 2, description re-cribbed mods to support set sequence, action taken moved several units to Yard 3, 0.5 hour impact, no change order."',
        '"Safety incident, title sub trip on rigging, category Crew issue, severity First-aid, time 1:15 PM, location D19 floor 1, description sub tripped over rigging line, action taken first aid given by Erik, 0 hour impact, no change order."',
      ],
      triggers: ['change order', 'CO trigger', 'PM Decision', 'owner directive', 'near-miss', 'recordable', 'lost time', 'OSHA', 'escalate', 'shut-down', 'cut the wire', 'unexpected', 'remove', 'extra'],
    },
    // INSPECTION essentials covered: type · status · inspector · date · deficiencies · notes
    inspection: {
      examples: [
        '"Type Module Prep, status Pass, inspector Erik Odowd, date today 9:30 AM, no deficiencies, notes minimal damage noted on HSE platform."',
        '"Type Module Set, status Pass with notes, inspector Erik, today 10:15 AM, deficiencies extra 2x6s and OSB chase covers, notes 786-A13 review documented."',
        '"Type Framing, status Pass, inspector AHJ Building, today 11 AM, no deficiencies, notes permit BLDG-2025-0421 card #14."',
        '"Type Pre-pour, status Fail, inspector AHJ, today 8 AM, deficiency missing rebar tie-back at column 14, notes re-inspect Wednesday 7 AM."',
        '"Type Structural welds, status Conditional, inspector Third-party UT, today 2 PM, deficiency 1 of 12 welds conditional, notes repair scheduled."',
      ],
      triggers: ['failed', 'fail', 'deficiency', 're-inspect', 'AHJ', 'code violation', 'missing', 'punch', 'conditional'],
    },
    // EQUIPMENT essentials covered: name · type · qty · status · assignedOperator · hoursToday · dayRate · preShiftInspectionCompleted · maintenanceNotes
    equipment: {
      examples: [
        '"Equipment 45-foot boom, type Boom lift, qty 3 on site, status active, operator Juan Alencastro, 8 hours today, $410 day rate, pre-shift inspection done, no maintenance notes."',
        '"10K Forklift, Telehandler, qty 2, active, operator Tyler Staas, 6.5 hours, $320 rate, pre-op signed, no notes."',
        '"Crane CT-220, Mobile crane, qty 1, active, operator Mike, 6 hours today, $950 rate, pre-shift done, hydraulic pressure dipping — schedule tech check tomorrow."',
        '"JLG boom received today, Boom lift, qty 1, active, operator pending, 0 hours today, $380 rate, walkthrough done, no maintenance."',
        '"Mixer M400, Concrete mixer, qty 1, in maintenance, no operator, 0 hours, $250 rate, no pre-shift, hydraulic leak day 4 parts on order."',
      ],
      triggers: ['hydraulic', 'pressure', 'leak', 'breakdown', 'maintenance', 'recall', 'pre-op fail', 'expired cert', 'rental return due'],
    },
    // MATERIAL essentials covered: name · category · received · needed · unit · status · note
    material: {
      examples: [
        '"Anchor bolts 3/4 inch, structural category, 600 received of 600 needed, unit pcs, status ok, note Grade 8 confirmed per RFI 42."',
        '"Modules D19 set, structural, 9 received of 11 needed, mods, status short, note 2 short due wind shut-down."',
        '"Drywall 5/8 inch, finish category, 196 of 200 needed, sheets, status damaged, note 4 sheets damaged BuildMart credit pending."',
        '"Stairwell mods, structural, 2 of 2 received, mods, status ok, note ready for Friday set."',
        '"Structural silicone sealant, finish, 0 of 48 needed, tubes, status pending, note long-lead expected Wednesday."',
      ],
      triggers: ['short', 'damaged', 'returned', 'RFI', 'submittal pending', 'long-lead', 'wrong grade', 'credit pending', 'stored offsite'],
    },
    // NOTE essentials covered: title · body · tags · reminderDate · urgent · pinned
    note: {
      examples: [
        '"Title owner walkthrough Thursday 3 PM. Body Target on site to review D19 progress, bring status board and 786-A2 photo evidence, close out RFI 42. Tags client, meeting, communications. Reminder Thursday. Urgent yes. Pin to dashboard yes."',
        '"Title lookahead Dorm 19 completion. Body keeping current pace, expected complete Friday April 18. Tags lookahead, schedule. No reminder needed. Not urgent. Pin yes."',
        '"Title PM Decision wind cutoff thresholds. Body Target / Bechtel agreed crane cutoff at 25 mph sustained 35 mph gust, documented in writing, add to morning toolbox talks. Tags PM Decision, safety, client. No reminder. Urgent yes. Pin yes."',
        '"Title JLG boom operator cert reminder. Body new fourth boom requires fresh operator certification, Mayolo and Miguel need recert by Friday — Bechtel scheduled. Tags safety, equipment. Reminder Friday. Urgent no. Don\'t pin."',
        '"Title Yard 3 staging plan revision. Body reordered units 786-15 through 786-22, save 30 min per day Friday set. Tags logistics, crane. No reminder. Not urgent. Pin yes."',
      ],
      triggers: ['lookahead', 'PM Decision', 'urgent', 'client', 'follow-up', 'walkthrough', 'recert', 'reminder'],
    },
    // visitor: V2 — capture flow deferred. Catalogs (visitorTypes, visitorPurposes) remain for reporting/dashboard use.
    // WEATHER DELAY essentials covered: delayReason · weatherCondition · startTime · endTime · hoursLost · activitiesAffected · notes
    weatherDelay: {
      examples: [
        '"Delay reason Weather, condition T-storm wind, started 4:15 PM, ended 5:45 PM, lost 1.5 hours, affected slab pour and crane sets, notice sent to owner."',
        '"Reason Weather, rain condition, started 3 PM, ended 5 PM, 2 hours lost, affected concrete pour and exterior stitch, owner notified, compensable per contract."',
        '"Reason Weather, lightning within 8 miles, started 2:30 PM, ended 3:30 PM, 1 hour lost, affected all activities, full evacuation."',
        '"Reason Weather, heat advisory condition, started 11 AM, ended 3 PM, 4 hours lost productivity, affected exterior stitch, no shut-down notice."',
        '"Reason Weather, cold and wind, started 6:45 AM, ended 8:45 AM, 2 hours stop, affected mortar work, owner notified."',
      ],
      triggers: ['shut-down', 'evacuate', 'cutoff', 'lightning', 'gust', 'compensable', 'notice sent', 'float consumed'],
    },
    // QUANTITIES essentials covered: scope · unit · quantityToday · quantityToDate · quantityContract · location · notes
    quantitiesInstalled: {
      examples: [
        '"Scope Crane Set, unit mod, today 9, to date 44, contract 696, location Dorm 19 floors 1-3, on pace for Friday."',
        '"Scope Panel Set, unit pcs, 24 today, 132 to date, of 580 contract, location D19 corridors, ahead of plan."',
        '"Scope Stairs, unit mod, 2 today, 8 to date, 14 contract, D19, ready for Friday set."',
        '"Scope Structural Connections, unit pcs, 18 stitches today, 92 to date, 410 contract, location D19 floors 1-2."',
        '"Scope Exterior Stitch, unit LF, 240 today, 1450 to date, 8200 contract, location D19 east elevation, behind plan."',
      ],
      triggers: ['% complete', 'pay app', 'cost code', 'production rate', 'behind plan', 'ahead of plan'],
    },
    // SUB ON-SITE essentials covered: subName · trade · crewCount · crewHours · scopeToday · startTime · endTime · workCompleted · foremanName
    subOnSite: {
      examples: [
        '"Sub Westervelt, trade GC, 2 guys, 20 crew hours total, scope Structural Connections, started 7 AM, ended 5 PM, work completed 18 mod stitches finished. Foreman Joe Westervelt."',
        '"Sub ABC Electrical, Electrical trade, 4 crew, 32 hours total, MEP Rough scope, 6:30 AM to 4:30 PM, completed floor 2 rough-in. Foreman Mike Reyes."',
        '"Sub XYZ Drywall, Drywall trade, 6 crew, 36 hours total, scope Drywall, 8 AM to 2 PM partial day, hung 800 square feet. Foreman Carlos Cruz."',
        '"Sub Acme Concrete, Concrete trade, 8 crew, 64 hours total, scope Foundation, 6 AM to 2 PM, completed footings sector B. Foreman Tony Marcelja."',
        '"Sub PaintPro, Finish trade, 3 crew, 24 hours, scope Finishes, 7 AM to 3 PM, completed primer floor 1. Foreman Keirsten McNeely."',
      ],
      triggers: ['COI expired', 'COI expires', 'no foreman', 'sub late', 'sub no-show', 'incident on sub'],
    },
  },

  // -------- PER-PROJECT-TYPE WIDGET ENABLEMENT (admin configurable) --------
  widgetCatalog: {
    // Hero / summary
    burn:                  { label: "Today's burn ($)",            group: 'Summary',     enabled: true,  projectTypes: ['standard','modular'] },
    aiWeekly:              { label: "AI Weekly Summary",           group: 'Summary',     enabled: true,  projectTypes: ['standard','modular'] },
    aiSummaryToday:        { label: "AI Summary today (live)",     group: 'Summary',     enabled: true,  projectTypes: ['standard','modular'] },
    weatherAMPM:           { label: "Weather AM / PM",              group: 'Summary',     enabled: true,  projectTypes: ['standard','modular'] },
    forecast:              { label: "7-day forecast",                group: 'Summary',     enabled: true,  projectTypes: ['standard','modular'] },

    // Production metrics (project-type specific) — modular-construction-specific
    productionMetrics:     { label: "Production metrics (units / panels)",     group: 'Production', enabled: true,  projectTypes: ['modular'] },
    yardInventory:         { label: "Yard / staging inventory (mods waiting)", group: 'Production', enabled: false, disabled: true, projectTypes: ['modular'] },
    craneUtilization:      { label: "Crane utilization (picks / cycle time)",  group: 'Production', enabled: true,  projectTypes: ['modular'] },
    stackProgress:         { label: "Stack progress · floor by floor",          group: 'Production', enabled: false, disabled: true, projectTypes: ['modular'] },
    factorySiteCadence:    { label: "Factory ship vs site set rate",            group: 'Production', enabled: false, projectTypes: ['modular'] },
    moduleReadinessQC:     { label: "Module readiness checklist",               group: 'Production', enabled: false, projectTypes: ['modular'] },
    weatherWindow:         { label: "Crane weather window (wind threshold)",    group: 'Production', enabled: false, projectTypes: ['modular'] },

    // Personnel metrics — user can pin any to dashboard
    personnelOnSite:       { label: "Personnel on site",             group: 'Personnel',   enabled: true,  projectTypes: ['standard','modular'] },
    personnelLate:         { label: "Late arrivals",                  group: 'Personnel',   enabled: true,  projectTypes: ['standard','modular'] },
    personnelByTrade:      { label: "Headcount by trade",             group: 'Personnel',   enabled: false, projectTypes: ['standard','modular'] },
    crewHours:             { label: "Crew hours summary",             group: 'Personnel',   enabled: true,  projectTypes: ['standard','modular'] },
    laborCost:             { label: "Labor cost today ($)",           group: 'Personnel',   enabled: false, disabled: true, projectTypes: ['standard','modular'] },
    overtimeCount:         { label: "Workers in overtime",            group: 'Personnel',   enabled: false, projectTypes: ['standard','modular'] },

    // Deliveries metrics
    deliveriesToday:       { label: "Deliveries today (count)",       group: 'Deliveries',  enabled: true,  projectTypes: ['standard','modular'] },
    deliveriesValue:       { label: "Materials value received ($)",   group: 'Deliveries',  enabled: false, disabled: true, projectTypes: ['standard','modular'] },
    deliveriesDamaged:     { label: "Damaged deliveries",             group: 'Deliveries',  enabled: false, projectTypes: ['standard','modular'] },
    deliveriesPending:     { label: "Pending deliveries",             group: 'Deliveries',  enabled: false, projectTypes: ['standard','modular'] },

    // Incidents metrics
    incidentsOpen:         { label: "Open incidents",                 group: 'Incidents',   enabled: true,  projectTypes: ['standard','modular'] },
    incidentsOSHA:         { label: "OSHA recordable incidents",      group: 'Incidents',   enabled: false, projectTypes: ['standard','modular'] },
    incidentsDaysSince:    { label: "Days since last incident",       group: 'Incidents',   enabled: false, projectTypes: ['standard','modular'] },

    // Equipment / Visitors
    equipmentActive:       { label: "Equipment active",               group: 'Equipment',   enabled: true,  projectTypes: ['standard','modular'] },
    equipmentMaint:        { label: "Equipment in maintenance",       group: 'Equipment',   enabled: false, projectTypes: ['standard','modular'] },
    visitorsOnSite:        { label: "Visitors on site",               group: 'Visitors',    enabled: false, disabled: true, projectTypes: ['standard','modular'] },

    // Personnel & Deliveries summary tables (live tables, not just KPI tiles)
    personnelTable:        { label: "Personnel summary table",         group: 'Personnel',   enabled: true,  projectTypes: ['standard','modular'] },
    deliveriesTable:       { label: "Deliveries summary table",        group: 'Deliveries',  enabled: true,  projectTypes: ['standard','modular'] },

    // AI module commentary summaries (Dashboard surfaces what the sub-tab AI captures)
    personnelSummary:      { label: "Personnel · AI summary",          group: 'Personnel',   enabled: true,  projectTypes: ['standard','modular'] },
    materialsSummary:      { label: "Materials · AI summary",          group: 'Deliveries',  enabled: true,  projectTypes: ['standard','modular'] },
    equipmentSummary:      { label: "Equipment · AI summary",          group: 'Equipment',   enabled: true,  projectTypes: ['standard','modular'] },

    // Safety
    toolboxTalks:          { label: "Safety & Meetings",                group: 'Safety',      enabled: true,  projectTypes: ['standard','modular'] },

    // Notes
    notesPinned:           { label: "Notes",                            group: 'Notes',       enabled: true,  projectTypes: ['standard','modular'] },

    // Daily Log narrative (now combined into Dashboard)
    activityTimeline:      { label: "Today's activity timeline",      group: 'Daily Log',   enabled: true,  projectTypes: ['standard','modular'] },
    needsAttention:        { label: "Needs attention",                 group: 'Daily Log',   enabled: true,  projectTypes: ['standard','modular'] },
    lookahead:             { label: "Lookahead",                       group: 'Daily Log',   enabled: true,  projectTypes: ['standard','modular'] },
    voiceCaptures:         { label: "Voice captures today",            group: 'Daily Log',   enabled: true,  projectTypes: ['standard','modular'] },
  },
  // -------- DAILY REPORT TEMPLATE (org-configurable) -----------------------
  // sections[] is the ordered list of section IDs to render.
  // sectionMeta lets admins override the label/source per section without code.
  // requireDualSignature / submitToClientFlow now read from featureFlags
  // (kept here as duplicate read-only mirrors for the report editor UI).
  reportTemplate: {
    name: 'Daily Field Report',
    sections: [
      'header',
      'modularSummary',         // shown only when project.type === 'modular'
      'scopes',                 // scopes worked today (from catalogs.scopes)
      'employees',
      'subcontractorsOnSite',   // NEW — sub + crew + hours
      'tasksWorkedOn',
      'quantitiesInstalled',    // NEW — % complete by scope (Pay App)
      'elevatedNotification',
      'problemsDelays',
      'delaysSummary',          // NEW — rolled up from incidents w/ schedule impact
      'inspections',
      'safetyMeetings',
      'communications',
      'visitorsSummary',        // NEW — visitor count + list
      'lookahead',
      'equipment',
      'storedMaterials',        // NEW — stored this period
      'photos',
      'acknowledgements',
    ],
    sectionMeta: {
      header:                {label: 'Header',                 source: 'Project · Auth context'},
      modularSummary:        {label: 'Summary · Modular',      source: 'Modular tracking'},
      scopes:                {label: 'Scopes Worked Today',    source: 'Daily Log dashboard'},
      employees:             {label: 'Employees On Site',      source: 'Personnel/Timesheets'},
      subcontractorsOnSite:  {label: 'Subcontractors On Site', source: 'Personnel'},
      tasksWorkedOn:         {label: 'Tasks Worked On',        source: 'Daily Log'},
      quantitiesInstalled:   {label: 'Quantities Installed',   source: 'Production'},
      elevatedNotification:  {label: 'Elevated Notification',  source: 'Notifications'},
      problemsDelays:        {label: 'Problems / Delays',      source: 'Daily Log'},
      delaysSummary:         {label: 'Delays Summary',         source: 'Incidents · Weather Delay'},
      inspections:           {label: 'Inspections',            source: 'Inspections module'},
      safetyMeetings:        {label: 'Safety and Meetings',    source: 'Safety + Daily Log'},
      communications:        {label: 'Communications',         source: 'Daily Log'},
      visitorsSummary:       {label: 'Visitors Summary',       source: 'Visitors module'},
      lookahead:             {label: 'Lookahead',              source: 'Daily Log'},
      equipment:             {label: 'Equipment On Site',      source: 'Equipment module'},
      storedMaterials:       {label: 'Stored Materials',       source: 'Materials module'},
      photos:                {label: 'Photos',                 source: 'Voice capture · phone'},
      acknowledgements:      {label: 'Acknowledgements',       source: 'Signature capture'},
    },
    dualSignerRoles: ['Contractor Rep','Owner Rep'],
    // The two below are kept for the report editor UI but the actual gate is
    // ORG_DASHBOARD_CONFIG.featureFlags.requireDualSignature / submitToClientFlow.
    requireDualSignature: false,
    submitToClientFlow:   false,
    aiTriggerScanning:    true,
    includeWeather:       true,
  },
};

// VOICE-CAPTURED data (everything has confidence + source banner)
const SEED_PERSONNEL = [
  { id: 1,  empId: '101', name: 'Juan Alencastro', role: 'Setter', trade: 'GC', designation: 'STAFF', scopeToday: 'Set', checkIn: '6:30 AM', checkOut: '5:15 PM', hours: 10.75, wageRate: 38, avatar: 'JA', certs: ['OSHA 10','Crane Sig'], aiSource: 'VOICE', confidence: 0.96, capturedAt: '6:30 AM', notes: 'Asked about stair-set training Friday with Eric. Strong morning energy.' },
  { id: 2,  empId: '134', name: 'Eric Cortez',     role: 'Setter', trade: 'GC', designation: 'STAFF', scopeToday: 'Set', checkIn: '6:30 AM', checkOut: '5:17 PM', hours: 10.78, wageRate: 38, avatar: 'EC', certs: ['OSHA 10'],            aiSource: 'VOICE', confidence: 0.96, capturedAt: '6:30 AM', notes: 'Wants to pair with Juan for the Friday stair set. Volunteered.' },
  { id: 3,  empId: '135', name: 'Carlos Cruz',     role: 'Setter', trade: 'GC', designation: 'STAFF', scopeToday: 'Set', checkIn: '6:30 AM', checkOut: '5:16 PM', hours: 10.77, wageRate: 36, avatar: 'CC', certs: ['OSHA 10'],            aiSource: 'VOICE', confidence: 0.96, capturedAt: '6:30 AM' },
  { id: 4,  empId: '163', name: 'Mayolo Hernandez',role: 'Setter', trade: 'GC', designation: 'STAFF', scopeToday: 'Set', checkIn: '6:30 AM', checkOut: '5:16 PM', hours: 10.77, wageRate: 36, avatar: 'MH', certs: ['OSHA 10'],            aiSource: 'VOICE', confidence: 0.96, capturedAt: '6:30 AM' },
  { id: 5,  empId: '288', name: 'Miguel Ortiz',    role: 'Setter', trade: 'GC', designation: 'STAFF', scopeToday: 'Set', checkIn: '6:30 AM', checkOut: '5:16 PM', hours: 10.77, wageRate: 36, avatar: 'MO', certs: ['OSHA 10'],            aiSource: 'VOICE', confidence: 0.96, capturedAt: '6:30 AM' },
  { id: 6,  empId: '319', name: 'Maciel Santos',   role: 'Setter', trade: 'GC', designation: 'STAFF', scopeToday: 'Set', checkIn: '6:30 AM', checkOut: '5:16 PM', hours: 10.77, wageRate: 36, avatar: 'MS', certs: ['OSHA 10'],            aiSource: 'VOICE', confidence: 0.96, capturedAt: '6:30 AM' },
  { id: 7,  empId: '346', name: 'Alexis Hernandez',role: 'Setter', trade: 'GC', designation: 'STAFF', scopeToday: 'Set', checkIn: '6:30 AM', checkOut: '5:15 PM', hours: 10.75, wageRate: 36, avatar: 'AH', certs: ['OSHA 10'],            aiSource: 'VOICE', confidence: 0.96, capturedAt: '6:30 AM' },
  { id: 8,  empId: '315', name: 'Ricki Andrade',   role: 'Panel',  trade: 'GC', designation: 'STAFF', scopeToday: 'Panels',checkIn: '7:00 AM',checkOut: '5:03 PM',hours: 10.05, wageRate: 34, avatar: 'RA', certs: ['OSHA 10'],            aiSource: 'VOICE', confidence: 0.91, capturedAt: '7:00 AM' },
  { id: 9,  empId: '316', name: 'Carlos Guillen',  role: 'Setter', trade: 'GC', designation: 'STAFF', scopeToday: 'Set', checkIn: '7:00 AM', checkOut: '5:31 PM', hours: 10.52, wageRate: 36, avatar: 'CG', certs: ['OSHA 10'],            aiSource: 'VOICE', confidence: 0.91, capturedAt: '7:00 AM' },
  { id: 10, empId: '345', name: 'Keirsten McNeely',role: 'Other',  trade: 'GC', designation: 'STAFF', scopeToday: 'Other',checkIn: '6:30 AM',checkOut: '5:29 PM',hours: 10.98, wageRate: 38, avatar: 'KM', certs: ['OSHA 30'],            aiSource: 'VOICE', confidence: 0.96, capturedAt: '6:30 AM' },
  { id: 11, empId: '317', name: 'David Hernandez', role: 'Panel',  trade: 'GC', designation: 'STAFF', scopeToday: 'Panels',checkIn: '6:45 AM',checkOut: '5:09 PM',hours: 10.40, wageRate: 34, avatar: 'DH', certs: ['OSHA 10'],            aiSource: 'VOICE', confidence: 0.94, capturedAt: '6:45 AM' },
  { id: 12, empId: '318', name: 'Jose Garcia',     role: 'Stitch', trade: 'GC', designation: 'STAFF', scopeToday: 'Stitch',checkIn: '6:45 AM',checkOut: '4:50 PM',hours: 10.08, wageRate: 36, avatar: 'JG', certs: ['OSHA 10'],            aiSource: 'VOICE', confidence: 0.94, capturedAt: '6:45 AM' },
  { id: 13, empId: '322', name: 'Anthony Marcelja',role: 'Prep',   trade: 'GC', designation: 'STAFF', scopeToday: 'Prep', checkIn: '6:45 AM', checkOut: '4:33 PM', hours: 10.80, wageRate: 32, avatar: 'AM', certs: ['OSHA 10'],            aiSource: 'VOICE', confidence: 0.94, capturedAt: '6:45 AM' },
  { id: 14, empId: '323', name: 'Tyler Staas',     role: 'Prep',   trade: 'GC', designation: 'STAFF', scopeToday: 'Prep', checkIn: '6:45 AM', checkOut: '4:42 PM', hours: 10.95, wageRate: 32, avatar: 'TS', certs: ['OSHA 10'],            aiSource: 'VOICE', confidence: 0.94, capturedAt: '6:45 AM' },
  { id: 15, empId: 'WV1', name: 'Joe Westervelt',  role: 'Sub',    trade: 'Westervelt', designation: 'SUBCONTRACTOR', scopeToday: 'Other', checkIn: '7:00 AM', checkOut: '5:00 PM', hours: 10.0, wageRate: 65, avatar: 'JW', certs: ['Master'], subHourly: true, aiSource: 'MANUAL', confidence: 1.0, capturedAt: 'Manual entry', notes: 'Arrived ~10 min late · gate access slow. Flagged trailer brake squeal — recommend walkaround at next drop.' },
];

const SEED_EQUIPMENT = [
  { id: 1, name: '45\' Boom',     type: 'Boom lift',          qty: 3, serials: ['S45H-26609','S45XCH-2493','S45H-25783'], status: 'ACTIVE',         hoursToday: 8.0, dayRate: 410, aiSource: 'VOICE', confidence: 0.92, capturedAt: '7:30 AM', notes: 'All 3 running. Eric on lift 1 today, Carlos on 2, Mayolo on 3.' },
  { id: 2, name: '10K Forklift',  type: 'Telehandler',        qty: 2, serials: ['TH10K-A','TH10K-B'],                       status: 'ACTIVE',         hoursToday: 6.5, dayRate: 320, aiSource: 'VOICE', confidence: 0.88, capturedAt: '7:30 AM' },
  { id: 3, name: 'JLG Boom',      type: 'Boom lift (received today)', qty: 1, serials: ['JLG-9982'],                       status: 'ACTIVE',         hoursToday: 0,   dayRate: 380, note: 'Received today — 4th boom lift', aiSource: 'VOICE', confidence: 0.94, capturedAt: '11:00 AM', notes: 'Operator unfamiliar with new safety lockout — manual requested. Pre-op signed off. Staged in Yard 3, fueled.' },
  { id: 4, name: 'Crane CT-220',  type: 'Mobile crane',       qty: 1, serials: ['CT-220-MAIN'],                              status: 'ACTIVE',         hoursToday: 6.0, dayRate: 950, aiSource: 'VOICE', confidence: 0.96, capturedAt: '7:00 AM', notes: 'Hydraulic pressure dipping mid-afternoon · operator flagged. Maintenance booked tomorrow before picks resume.' },
  { id: 5, name: 'Genset G20',    type: 'Generator',          qty: 2, serials: ['G20-A','G20-B'],                            status: 'ACTIVE',         hoursToday: 9.5, dayRate: 180, aiSource: 'MANUAL', confidence: 1.0, capturedAt: 'Yesterday' },
  { id: 6, name: 'Mixer M400',    type: 'Concrete mixer',     qty: 1, serials: ['M400-OUT'],                                 status: 'IN_MAINTENANCE', hoursToday: 0,   dayRate: 250, flag: 'Hydraulic leak', aiSource: 'VOICE', confidence: 0.91, capturedAt: '4 days ago', notes: 'Down 4 days · awaiting pump rebuild kit from vendor. ETA Friday. Substituted with on-site power-trowel for slab finish.' },
];

const SEED_DELIVERIES = [
  { id: 1, supplier: 'Westervelt Modular', materials: 'Mod D19/786-2',  quantity: 1, unit: 'mod',    poNumber: 'PO-3042', status: 'Received', date: 'Today 7:15 AM',  value: 42000, receivedBy: 'Erik Odowd', aiSource: 'VOICE', confidence: 0.95, capturedAt: '7:30 AM', notes: 'Driver mentioned trailer brake squeal again — second time this month. Recommend Westervelt walkaround at next drop. All 3 boom lifts fired up at unload.', attachments: [{ id: 'del-1-a1', kind: 'photo', label: 'Mod 786-2 on truck', placeholder: 'truck' }] },
  { id: 2, supplier: 'Westervelt Modular', materials: 'Mod D19/786-3',  quantity: 1, unit: 'mod',    poNumber: 'PO-3042', status: 'Received', date: 'Today 8:00 AM',  value: 42000, receivedBy: 'Erik Odowd', aiSource: 'VOICE', confidence: 0.95, capturedAt: '7:30 AM', notes: 'Same trailer as 786-2 drop. Smooth unload, crane handoff clean.', attachments: [] },
  { id: 3, supplier: 'JLG Industries',     materials: '40ft boom lift', quantity: 1, unit: 'unit',   poNumber: 'PO-4501', status: 'Received', date: 'Today 11:00 AM', value: 38500, receivedBy: 'Erik Odowd', aiSource: 'VOICE', confidence: 0.94, capturedAt: '11:00 AM', notes: '4th boom lift on site. Operator unfamiliar with the new safety lockout — requested ops manual. Pre-op signed; staged in Yard 3.', attachments: [{ id: 'del-3-a1', kind: 'photo', label: 'JLG boom unloading', placeholder: 'boom' }, { id: 'del-3-a2', kind: 'photo', label: 'Serial plate JLG-9982', placeholder: 'serial' }] },
  { id: 4, supplier: 'BuildMart',          materials: 'Drywall 5/8"',   quantity: 50,unit: 'sheets', poNumber: 'PO-1040', status: 'Damaged',  date: 'Yesterday',      value: 750,   aiSource: 'MANUAL', confidence: 1.0, capturedAt: 'Yesterday', notes: '4 sheets damaged in transit. BuildMart issuing credit + replacement ships Wednesday.', attachments: [{ id: 'del-4-a1', kind: 'photo', label: 'Damaged drywall corner', placeholder: 'damage' }] },
];

const SEED_INCIDENTS = [
  { id: 1, name: 'Crane move mid-day', description: 'Unexpected crane move mid-day to set 2 Arctic Corridor mods. Mod 786-A2 (first floor stairwell) had an electrical box too wide for our corridor dimension. Removed box and cut wire per Target\'s Dave Ault\'s order.', location: 'Dorm 19 corridor', severity: 'NEAR_MISS', status: 'RESOLVED', date: '11:30 AM', images: 1, reportedBy: 'Erik Odowd', flag: 'CHANGE_ORDER_TRIGGER', actionTaken: 'Issue noted on Target HSI platform with photo evidence.', aiSource: 'VOICE', confidence: 0.88, capturedAt: '11:30 AM', attachments: [{ id: 'inc-1-a1', kind: 'photo', label: '786-A2 e-box before mod', placeholder: 'ebox-before' }, { id: 'inc-1-a2', kind: 'photo', label: '786-A2 after wire cut', placeholder: 'ebox-after' }, { id: 'inc-1-a3', kind: 'video', label: 'Crane move sequence', placeholder: 'crane', durationSec: 41 }] },
  { id: 2, name: 'Laceration on panel edge', description: 'Ricki Andrade caught his right forearm on a sheared panel bracket while stitching D19 floor 1. Bleeding through glove; wound required stitches at urgent care. Bracket edge was un-deburred.', location: 'Dorm 19 · floor 1 stitch line', severity: 'RECORDABLE', status: 'OPEN', date: 'Today', time: '1:15 PM', reportedBy: 'Erik Odowd', injuredEmployee: 'Ricki Andrade', jobTitle: 'Panel / Stitch', bodyPart: 'Right forearm', cause: 'Un-deburred panel bracket edge', firstAidByWhom: 'Erik Odowd', sentToMedical: true, medicalLocation: 'Banner Urgent Care · Phoenix', daysLost: 0, restrictedDutyDays: 3, witnessNames: ['Jose Garcia', 'David Hernandez'], actionTaken: 'Wound cleaned and wrapped on site; driven to urgent care. Bracket lot pulled and flagged to fab for deburring. Light-duty assignment for 3 days.', impactHours: 1.5, aiSource: 'VOICE', confidence: 0.9, capturedAt: '1:20 PM', attachments: [{ id: 'inc-2-a1', kind: 'photo', label: 'Sheared bracket edge', placeholder: 'ebox-before' }] },
];

const SEED_INSPECTIONS = [
  { id: 1, type: 'Module Prep', status: 'Pass',           notes: 'Module Prep inspections noted on HSE, with minimal damage.', inspector: 'Erik Odowd', date: 'Today AM', aiSource: 'VOICE', confidence: 0.93, capturedAt: '9:30 AM', attachments: [{ id: 'ins-1-a1', kind: 'photo', label: 'Mod prep checklist', placeholder: 'check' }] },
  { id: 2, type: 'Module 786-A13 review', status: 'Pass with notes', notes: 'Mod 786-A13 had some extra 2x6\'s running down the center, as well as additional chases which were covered with osb.', inspector: 'Erik Odowd', date: 'Today AM', aiSource: 'VOICE', confidence: 0.91, capturedAt: '10:15 AM', attachments: [{ id: 'ins-2-a1', kind: 'photo', label: '786-A13 extra 2x6s', placeholder: 'beam' }, { id: 'ins-2-a2', kind: 'photo', label: 'OSB chase covers', placeholder: 'osb' }] },
];

const SEED_VISITORS = [
  { id: 1, name: 'Chris (Target / Bechtel)', org: 'Target', purpose: '2 PM meeting · boom lift safety standards', timeIn: '2:00 PM', timeOut: '3:30 PM', escort: 'Erik Odowd', type: 'Owner', aiSource: 'VOICE', confidence: 0.94, capturedAt: '2:30 PM', notes: 'Chris taking notes — distributing later. Bechtel scrutiny on perceived safety issues continues. Mentioned the wind cutoff thresholds need to be in writing.' },
];

const SEED_REPORT_TEXT = {
  tasksWorkedOn:  'Began setting Dorm 19, starting with the stairwell box. Rearrange and re-crib some mods in Yard 2 due to staging — Moved several to Yard 3.\nCrane set mods = D19/786-2, D19/786-3, D19/786-11, D19/786-4, D19/786-10, D19/786-12, D19/786-13, D19/786-21, D19/786-10',
  problemsDelays: 'We had an unexpected crane move mid-day because of the crane\'s location from Tuesday when we set the 2 Arctic Corridor mods. Mod 786-A2 (first floor stairwell) had an electrical box that was too wide for our corridor dimension. We removed the box and cut the wire per Target\'s Dave Ault\'s order. This issue was also noted on Target\'s HSI platform along with this photo as evidence.',
  inspectionsNotes: 'Module Prep inspections noted on HSE, with minimal damage.\nMod 786-A13 had some extra 2x6\'s running down the center, as well as additional chases which were covered with osb.',
  safetyMeetings:  'EE\'s are consistently doing a great job at chalking their wheels, wearing PPE and overall adhering to safety guidelines.\n\n2 pm meeting with Target and Bechtel where more questions are being raised related to our submitted boom lift safety standards and working from height. Chris stated that he would take notes and distribute them to all later in the afternoon.\n\nChris stated that his overall perception is that Bechtel is diligently working to create barriers that can be used as leverage against Target at a later date — this statement was only an opinion.',
  communications:  '9 mods were set today, with some unexpected delays such as the crane move, and the need to shuffle mods in laydown 2. We were ready to set the 10th mod but were shut us down for wind.\n\nWe felt the wind was within our acceptable level to control, and although we flew one mod when the wind started to pick up, Target Management did not feel comfortable allowing us to proceed with the 10th. [PM Decision]\n\nWe do recognize the scrutiny being placed on Target and Proset with regard to any perceived safety issues.',
  lookahead:       'Keeping with this pace, we should complete the set of Dorm 19 in the next 2 days, expected completion Friday, April 18.',
};

const SEED_TOOLBOX_TALKS = [
  { id: 'tbt-1', topic: 'Boom lift fall protection · 100% tie-off', lead: 'Erik Odowd', time: '6:35 AM', durationMin: 12, attendees: 14, attendeeNames: ['Juan A.','Eric C.','Carlos C.','Mayolo H.','Miguel O.','Maciel S.','Alexis H.','Ricki A.','Carlos G.','Keirsten M.','David H.','Jose G.','Anthony M.','Tyler S.'], aiSource: 'VOICE', confidence: 0.94, notes: 'Crew engaged. Re-emphasized owner cutoff thresholds. Ricki had a question about double-lanyard configuration on the new JLG.', attachments: [{ id: 'a1', kind: 'photo', label: 'Crew briefing', placeholder: 'crew' }] },
  { id: 'tbt-2', topic: 'High-wind crane operation · Owner cutoff thresholds', lead: 'Erik Odowd', time: '12:30 PM', durationMin: 8, attendees: 13, attendeeNames: ['Juan A.','Eric C.','Carlos C.','Mayolo H.','Miguel O.','Maciel S.','Alexis H.','Ricki A.','Carlos G.','Keirsten M.','David H.','Jose G.','Anthony M.'], aiSource: 'VOICE', confidence: 0.91, notes: 'Documented Target cutoff: 25 mph sustained / 35 mph gust. Two crew (Mathew Q., Ana R.) signed in late — caught up on the topic 1:1.', attachments: [{ id: 'a2', kind: 'photo', label: 'Wind gauge reading', placeholder: 'wind' }, { id: 'a3', kind: 'video', label: 'Owner cutoff demo', placeholder: 'crane', durationSec: 24 }] },
];

const SEED_NOTES = [
  { id: 'n1', title: 'Yard 3 staging plan revision', body: 'Reordered units 786-15 through 786-22 in Yard 3 to streamline crane access. Stairwell modules pulled forward — saves ~30 min/day on Friday set.', author: 'Erik Odowd', avatar: 'EO', date: 'Today · 7:45 AM', pinned: true, tags: ['logistics','crane'], aiSource: 'VOICE', attachments: [{ id: 'na1', kind: 'photo', label: 'Yard 3 layout sketch', placeholder: 'layout' }] },
  { id: 'n-look-1', title: 'Lookahead · Dorm 19 completion Friday April 18', body: '"Keeping with this pace, we should complete the set of Dorm 19 in the next 2 days, expected completion Friday, April 18."', author: 'Erik Odowd', avatar: 'EO', date: 'Today · 4:30 PM', pinned: true, tags: ['lookahead','schedule'], aiSource: 'VOICE', attachments: [] },
  { id: 'n2', title: 'Owner walkthrough · 3 PM Thursday', body: 'Target site visit confirmed for Thursday afternoon. Bring D19 set status board + safety incident log. Chris will lead from Bechtel side. Bring mod 786-A2 photo evidence.', author: 'Erik Odowd', avatar: 'EO', date: 'Today · 11:45 AM', pinned: true, tags: ['client','meeting','communications'], aiSource: 'VOICE', attachments: [] },
  { id: 'n-comm-1', title: 'On-site comms · Wind shut-down PM Decision', body: '9 mods set today, with some unexpected delays such as the crane move, and the need to shuffle mods in laydown 2. We were ready to set the 10th mod but were shut us down for wind. We felt the wind was within our acceptable level to control, although we flew one mod when wind started picking up. Target Management did not feel comfortable with the 10th. [PM Decision]', author: 'Erik Odowd', avatar: 'EO', date: 'Today · 4:30 PM', pinned: false, tags: ['communications','client','PM Decision'], aiSource: 'VOICE', attachments: [{ id: 'ncomm-1', kind: 'photo', label: 'Wind gauge reading', placeholder: 'wind' }] },
  { id: 'n3', title: 'JLG boom lift operating cert reminder', body: 'New 4th boom lift requires fresh operator certification check before tomorrow. Pulled rosters: Juan, Eric, Carlos verified. Mayolo + Miguel need recert by Friday — booked refresher via Bechtel safety team.', author: 'Erik Odowd', avatar: 'EO', date: 'Today · 11:15 AM', pinned: false, tags: ['safety','equipment'], aiSource: 'VOICE', attachments: [{ id: 'na2', kind: 'photo', label: 'JLG cert sheet', placeholder: 'cert' }] },
  { id: 'n4', title: 'Anchor bolt vendor follow-up', body: 'BuildMart confirmed 600 anchor bolts received. Next PO 700 pcs scheduled for May 12 delivery — need to align with crew rotation.', author: 'Keirsten McNeely', avatar: 'KM', date: 'Today · 2:30 PM', pinned: false, tags: ['materials','PO'], aiSource: 'MANUAL', attachments: [] },
  { id: 'n5', title: 'Wind cutoff threshold · Owner agreement', body: 'Per Target / Bechtel meeting — Owner cutoff for crane at 25 mph sustained, 35 mph gust. Documented in writing. Add to morning toolbox talk template.', author: 'Erik Odowd', avatar: 'EO', date: 'Today · 2:50 PM', pinned: false, tags: ['safety','client','communications'], aiSource: 'VOICE', attachments: [] },
  { id: 'n-look-2', title: 'Lookahead · Owner walkthrough deck prep', body: 'Need to prep set status board for Thursday\'s Target walkthrough. Pull mod 786-A2 photo evidence + close-out RFI 42 anchor bolt thread.', author: 'Erik Odowd', avatar: 'EO', date: 'Today · 3:00 PM', pinned: false, tags: ['lookahead','client'], aiSource: 'VOICE', attachments: [] },
];

const SEED_MAT_RECONCILIATION = [
  { id: 'mr-1', item: 'Modules (D19 set)',     needed: 11, received: 9,  unit: 'mods',    status: 'short',   note: '2 short · wind shut-down' },
  { id: 'mr-2', item: 'Boom lifts',             needed: 4,  received: 4,  unit: 'units',   status: 'ok',      note: 'JLG arrived 11:00 AM' },
  { id: 'mr-3', item: 'Drywall 5/8"',           needed: 200,received: 196,unit: 'sheets',  status: 'damaged', note: '4 damaged in transit' },
  { id: 'mr-4', item: 'Anchor bolts 3/4"',      needed: 600,received: 600,unit: 'pcs',     status: 'ok',      note: '' },
  { id: 'mr-5', item: 'Stairwell modules',      needed: 2,  received: 2,  unit: 'mods',    status: 'ok',      note: '' },
];

// Free-form voice commentary captured per module — not all voice gets logged as
// a structured entry. AI extracts and routes the rest into a "commentary" feed
// that lives at the top of each sub-module tab.
const SEED_VOICE_COMMENTARY = {
  personnel: [
    { id: 'pc-1', time: '6:35 AM', author: 'Erik Odowd', avatar: 'EO', summary: 'Crew morale strong this morning. Juan and Eric requested cross-training on stair set this Friday.', quote: '"Juan and Eric want to learn the stair set… they\'ve been watching all week. Let\'s get them on it Friday."' },
    { id: 'pc-2', time: '11:00 AM', author: 'Erik Odowd', avatar: 'EO', summary: 'Mathew Q. heads-up: out tomorrow for medical appointment. Tyler will cover prep crew.', quote: '"Mathew\'s got a medical thing tomorrow morning, won\'t be in until noon. Tyler can hold prep down till he\'s back."' },
    { id: 'pc-3', time: '2:00 PM', author: 'Erik Odowd', avatar: 'EO', summary: 'Westervelt sub crew arrived 10 min late · documented for the daily log.', quote: '"Westervelt guys rolled in around 7:10, gate access was slow."' },
  ],
  deliveries: [
    { id: 'dc-1', time: '7:15 AM', author: 'Erik Odowd', avatar: 'EO', summary: 'Westervelt driver mentioned a recurring trailer brake squeal — flagged for next drop walkaround.', quote: '"Driver said the trailer\'s been making a brake noise for two weeks. Westervelt should inspect."' },
    { id: 'dc-2', time: '11:00 AM', author: 'Erik Odowd', avatar: 'EO', summary: 'JLG operator unfamiliar with new boom safety system — requested ops manual.', quote: '"The new boom guy from JLG asked for the manual on the safety lockout… first time he\'s seen this model."' },
  ],
  incidents: [
    { id: 'ic-1', time: '4:30 PM', author: 'Erik Odowd', avatar: 'EO', summary: 'Crew jumpy after wind call — walked the deck, no issues. Owner emphasized zero tolerance on wind exceptions going forward.', quote: '"Everybody seemed on edge after we got shut down. Did a quick walkaround… everything\'s solid. Target was clear: no exceptions, period."' },
    { id: 'ic-2', time: '11:30 AM', author: 'Erik Odowd', avatar: 'EO', summary: 'Near-miss on stairwell mod corner during pivot — crew adjusted technique without formal report.', quote: '"Mod corner came close to the column when we pivoted. Adjusted the rigging, no contact, but tighter than I\'d like."' },
  ],
  equipment: [
    { id: 'ec-1', time: '2:30 PM', author: 'Erik Odowd', avatar: 'EO', summary: 'Crane CT-220 operator noted hydraulic pressure dipping mid-afternoon — recommended maintenance check before tomorrow.', quote: '"Crane operator said pressure was riding low this afternoon. Want a tech to look at it before we\'re back on the picks tomorrow."' },
    { id: 'ec-2', time: '11:00 AM', author: 'Erik Odowd', avatar: 'EO', summary: 'JLG boom received early — staged in Yard 3, fueled, pre-op signed off.', quote: '"JLG showed up at 11. Got it staged in three, fueled, walkthrough done."' },
  ],
  materials: [
    { id: 'mc-1', time: '8:45 AM', author: 'Erik Odowd', avatar: 'EO', summary: 'Anchor bolt grade mismatch flagged earlier this week — vendor confirmed Grade 8 received per RFI #42.', quote: '"Anchor bolts came in correct this drop. RFI 42 closed out. We\'re good for stair attach."' },
    { id: 'mc-2', time: '3:15 PM', author: 'Erik Odowd', avatar: 'EO', summary: 'Drywall PO needs reorder — 4 sheets damaged in transit, BuildMart will credit and ship replacement.', quote: '"Four damaged sheets on yesterday\'s drywall drop. BuildMart\'s issuing credit. Replacement ships Wednesday."' },
  ],
};

const SEED_PROBLEMS = [
  { id: 'pd-1', title: 'Crane move mid-day · 786-A2 e-box modification', type: 'Scope change', time: '11:30 AM', impactHours: 1.0, description: 'Unexpected crane move mid-day to reposition for Arctic Corridor mods. 786-A2 (first floor stairwell) had an electrical box too wide for corridor dimension. Removed box and cut the wire per Target/Dave Ault\'s order.', actionTaken: 'Logged on Target HSI platform with photo evidence. RFI to Westervelt for corrected design.', changeOrderTrigger: true, costImpact: 1850, status: 'OPEN', reportedBy: 'Erik Odowd', aiSource: 'VOICE', confidence: 0.88, attachments: [{ id: 'pd1-a1', kind: 'photo', label: '786-A2 e-box before', placeholder: 'ebox-before' }, { id: 'pd1-a2', kind: 'photo', label: 'After wire cut', placeholder: 'ebox-after' }] },
  { id: 'pd-2', title: 'Wind shut-down on 10th unit · Owner directive', type: 'Owner directive', time: '4:15 PM', impactHours: 0.5, description: 'Crew was set to install 10th mod. Crane operator and superintendent felt wind was within acceptable limits — flew one mod when wind picked up. Target Management did not feel comfortable proceeding with the 10th. PM Decision logged.', actionTaken: 'Crew demobilized. Wind cutoff thresholds documented in afternoon toolbox talk.', changeOrderTrigger: false, costImpact: 850, status: 'RESOLVED', reportedBy: 'Erik Odowd', aiSource: 'VOICE', confidence: 0.91, attachments: [{ id: 'pd2-a1', kind: 'photo', label: 'Wind gauge reading', placeholder: 'wind' }] },
  { id: 'pd-3', title: 'Yard 2 staging reshuffle', type: 'Schedule', time: '7:30 AM', impactHours: 0.5, description: 'Several mods in Yard 2 needed re-cribbing to support today\'s set sequence. Moved units to Yard 3 to streamline crane access.', actionTaken: 'Re-cribbed and verified clear access. Documented new layout for tomorrow\'s set.', changeOrderTrigger: false, costImpact: 0, status: 'RESOLVED', reportedBy: 'Erik Odowd', aiSource: 'VOICE', confidence: 0.92, attachments: [] },
];

const SEED_MATERIALS = [
  { id: 'mat-1', name: 'Modules · Westervelt',         category: 'Structural', unit: 'mod',    received: 9,   needed: 11,  poNumber: 'PO-3042', value: 462000, status: 'short',   note: '2 short · wind shut-down deferred', updatedAt: '8:00 AM',  updatedBy: 'Erik Odowd', aiSource: 'VOICE' },
  { id: 'mat-2', name: 'Drywall 5/8"',                 category: 'Finish',     unit: 'sheets', received: 196, needed: 200, poNumber: 'PO-1040', value: 3920,   status: 'damaged', note: '4 sheets damaged · BuildMart credit pending', updatedAt: 'Yesterday', updatedBy: 'Erik Odowd', aiSource: 'MANUAL' },
  { id: 'mat-3', name: 'Anchor bolts 3/4"',            category: 'Structural', unit: 'pcs',    received: 600, needed: 600, poNumber: 'PO-2210', value: 4200,   status: 'ok',      note: 'Grade 8 confirmed per RFI #42', updatedAt: 'Yesterday', updatedBy: 'Erik Odowd', aiSource: 'VOICE' },
  { id: 'mat-4', name: 'Stairwell modules',            category: 'Structural', unit: 'mod',    received: 2,   needed: 2,   poNumber: 'PO-3042', value: 84000,  status: 'ok',      note: '', updatedAt: 'Today 7:30 AM', updatedBy: 'Erik Odowd', aiSource: 'VOICE' },
  { id: 'mat-5', name: 'Sealant · structural silicone', category: 'Finish',     unit: 'tubes',  received: 0,   needed: 48,  poNumber: 'PO-1108', value: 0,      status: 'pending', note: 'On order · expected Wednesday', updatedAt: '—',         updatedBy: '—',           aiSource: 'MANUAL' },
];

const AI_DAILY_SUMMARY_AUDIO = {
  durationSec: 38,
  capturedAt: '5:30 PM',
  voice: 'Merlin AI · daily roll-up',
  transcript: 'Today was a 9-mod day on Dorm 19. Crew of 15 logged 248 labor hours, on schedule for Friday completion. One change-order trigger flagged at 11:30 AM — the 786-A2 stairwell e-box was modified per Dave Ault. Wind shut-down on the 10th mod at 4:15 PM, owner-driven, logged as PM Decision. All 14 attendees signed the morning toolbox talk on fall protection. Two crew missed the high-wind talk. JLG boom lift received, fourth on site. 1 near-miss closed. Forecast tomorrow: clear AM, gusts after 3 PM — recommend pulling crane work forward.',
  waveform: [3,5,8,11,14,9,6,4,3,5,7,12,16,20,18,14,10,7,5,9,13,17,15,11,8,6,4,3],
};

const AI_TRIGGERS = [
  { phrase: 'unexpected', category: 'change_order',   tone: 'amber', explanation: 'Possible scope change' },
  { phrase: 'remove',      category: 'change_order',   tone: 'amber', explanation: 'Removal of work items' },
  { phrase: 'cut the wire',category: 'change_order',   tone: 'amber', explanation: 'Field modification' },
  { phrase: 'shut us down',category: 'schedule',       tone: 'red',   explanation: 'Schedule impact — flag for time extension' },
  { phrase: 'did not feel comfortable', category: 'safety_decision', tone: 'red', explanation: 'Owner decision affecting schedule' },
  { phrase: 'acceptable level', category: 'safety_decision', tone: 'amber', explanation: 'Disputed safety call' },
  { phrase: 'wind',        category: 'weather',        tone: 'amber', explanation: 'Weather event' },
  { phrase: 'extra',       category: 'change_order',   tone: 'amber', explanation: 'Extra material/scope' },
];

// Fallback scopes when no config is provided (kept for any consumer that still
// imports the constant directly). The source of truth is
// ORG_DASHBOARD_CONFIG.catalogs.scopes — read via getScopes(config).
const SCOPES_LIBRARY = ['Crane Set','Stairs','Panel Set','Structural Connections','Exterior Stitch','Interior Stitch','Temp Dry In Mods','Change Order Work','Other'];
const SCOPES_CHECKED = ['Crane Set','Stairs','Structural Connections','Exterior Stitch','Interior Stitch','Temp Dry In Mods'];
const getScopes = (cfg) => cfg?.catalogs?.scopes ?? SCOPES_LIBRARY;
const getCatalog = (cfg, key, fallback = []) => cfg?.catalogs?.[key] ?? fallback;
const getFlag = (cfg, key, fallback = false) => cfg?.featureFlags?.[key] ?? fallback;

const SUMMARY_ENTRIES = [
  { id: 'wl-1', date: 'Today · 6:30 AM',  author: 'Erik Odowd', avatar: 'EO', title: '15 workers checked in · Dorm 19 setup',
    transcript: '"Crew of 15 on site at 6:30. Started Dorm 19 with stairwell box. Setters Juan, Eric, Carlos, Mayolo, Miguel, Maciel, Alexis. Panel crew Ricki, David. Stitch Jose. Prep Anthony, Tyler, Mathew, Ana. Sub Westervelt 2 guys."',
    confidence: 0.94, routed: ['Personnel (15)','Timesheets','Scope assignment'] },
  { id: 'wl-2', date: 'Today · 7:30 AM',  author: 'Erik Odowd', avatar: 'EO', title: 'Mods D19/786-2 + D19/786-3 received',
    transcript: '"Westervelt dropped two mods, 786-2 and 786-3 around 7:15. Crane staged. 45 boom lifts all 3 fired up. JLG boom lift coming later today."',
    confidence: 0.95, routed: ['Deliveries (2)','Equipment activation','Crew dispatched'] },
  { id: 'wl-3', date: 'Today · 11:30 AM', author: 'Erik Odowd', avatar: 'EO', title: '786-A2 e-box modification + crane move',
    transcript: '"Unexpected crane move mid-day. 786-A2 stairwell box too wide. Removed it, cut the wire per Dave Ault\'s order. Logged to Target HSI."',
    confidence: 0.88, routed: ['Incident · CO trigger','Inspection','Photos','Tasks'] },
  { id: 'wl-4', date: 'Today · 2:30 PM',  author: 'Erik Odowd', avatar: 'EO', title: 'Boom lift safety meeting · Target / Bechtel',
    transcript: '"Met with Chris from Target and Bechtel on boom lift safety standards. Chris taking notes. Bechtel scrutiny continues."',
    confidence: 0.94, routed: ['Visitor sign-in','Safety meeting','Communications · PM Decision'] },
  { id: 'wl-5', date: 'Today · 4:30 PM',  author: 'Erik Odowd', avatar: 'EO', title: 'Wind shut-down on 10th mod · lookahead',
    transcript: '"Set 9 mods today. 10th was ready but Target shut us down for wind. We felt acceptable but they did not feel comfortable. PM Decision. Should finish Dorm 19 by Friday April 18 at this pace."',
    confidence: 0.91, routed: ['Communications','Lookahead','Modular metric (-1 mod)'] },
];

const TREND_HOURS = [
  { d: 'Mon', v: 235 }, { d: 'Tue', v: 248 }, { d: 'Wed', v: 268 }, { d: 'Thu', v: 252 },
  { d: 'Fri', v: 240 }, { d: 'Sat', v: 88  }, { d: 'Sun', v: 0   }
];
const TREND_MODS = [
  { d: 'Mon', v: 7 }, { d: 'Tue', v: 8 }, { d: 'Wed', v: 9 }, { d: 'Thu', v: 6 },
  { d: 'Fri', v: 9 }, { d: 'Sat', v: 5 }, { d: 'Sun', v: 0 }
];

const SEV_META = {
  NEAR_MISS:  { label: 'Near-miss',  cls: 'bg-slate-100 text-slate-700', osha: false },
  FIRST_AID:  { label: 'First aid',  cls: 'bg-blue-50 text-blue-700',    osha: false },
  RECORDABLE: { label: 'Recordable', cls: 'bg-amber-50 text-amber-700',  osha: true  },
  LOST_TIME:  { label: 'Lost-time',  cls: 'bg-orange-50 text-orange-700',osha: true  },
  FATAL:      { label: 'Fatal',      cls: 'bg-red-50 text-red-700',      osha: true  },
};

// ============================================================================
// HELPERS
// ============================================================================
const cls   = (...a) => a.filter(Boolean).join(' ');
const fmt$  = (n) => n == null ? '—' : `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const fmtHrs = (n) => n == null ? '—' : `${n.toFixed(1)}h`;

const highlightTriggers = (text) => {
  if (!text) return null;
  const triggers = AI_TRIGGERS.map(t => t.phrase.toLowerCase());
  const pattern = new RegExp(`(${triggers.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(pattern);
  return parts.map((p, i) => {
    const trigger = AI_TRIGGERS.find(t => t.phrase.toLowerCase() === p.toLowerCase());
    if (trigger) {
      const bg = trigger.tone === 'red' ? DANGER_BG : WARN_BG;
      const fg = trigger.tone === 'red' ? '#991B1B' : '#92400E';
      return <mark key={i} title={trigger.explanation} className="rounded px-1 cursor-help" style={{ backgroundColor: bg, color: fg, fontWeight: 600 }}>{p}</mark>;
    }
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
};

// ============================================================================
// V2-MATCHED PRIMITIVES — same visual system as MerlinSiteProWeb
// ============================================================================
const Avatar = ({ initials, size = 'md', tone = 'purple' }) => {
  const sizes = { xs: 'w-6 h-6 text-[10px]', sm: 'w-8 h-8 text-[11px]', md: 'w-10 h-10 text-[13px]', lg: 'w-12 h-12 text-[15px]' };
  const tones = { purple: { bg: PURPLE_LIGHT, color: PURPLE_DEEP }, green: { bg: SUCCESS_BG, color: '#166534' }, amber: { bg: WARN_BG, color: '#92400E' }, red: { bg: DANGER_BG, color: '#991B1B' } };
  const t = tones[tone];
  return <div className={cls('rounded-full flex items-center justify-center font-semibold flex-shrink-0', sizes[size])} style={{ backgroundColor: t.bg, color: t.color }}>{initials}</div>;
};

const Badge = ({ children, tone = 'slate' }) => {
  const tones = {
    slate: 'bg-slate-100 text-slate-700', purple: 'bg-purple-100 text-purple-700',
    green: 'bg-green-100 text-green-700', amber: 'bg-amber-100 text-amber-700',
    red:   'bg-red-100 text-red-700',     blue:  'bg-blue-100 text-blue-700',
  };
  return <span className={cls('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold', tones[tone])}>{children}</span>;
};

const KPI = ({ label, value, sub, trend, icon: Icon, accent, alert, success, onClick }) => {
  const valueColor = alert ? DANGER : success ? SUCCESS : accent ? PURPLE : TEXT;
  return (
    <button onClick={onClick} disabled={!onClick}
      className={cls('rounded-xl text-left transition-colors', alert ? 'bg-red-50 border border-red-200' : 'bg-white border border-slate-200 hover:border-slate-300')}
      style={{ padding: 16, minHeight: 96 }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-semibold text-slate-500">{label}</span>
        {Icon && <Icon size={15} className="text-slate-400" />}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-[28px] font-bold leading-none" style={{ color: valueColor }}>{value}</span>
        {trend != null && (
          <span className={cls('text-[12px] flex items-center gap-0.5 font-semibold', trend > 0 ? 'text-green-600' : 'text-red-600')}>
            {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{Math.abs(trend)}%
          </span>
        )}
      </div>
      {sub && <div className="text-[12px] text-slate-500 mt-2">{sub}</div>}
    </button>
  );
};

const Card = ({ icon: Icon, title, action, children, className, noPad, updatedAt, updatedBy, source }) => (
  <div className={cls('rounded-xl bg-white border border-slate-200 overflow-hidden', className)}>
    {(title || Icon) && (
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-slate-700" strokeWidth={2.2} />}
          <span className="text-[14px] font-bold text-slate-900">{title}</span>
        </div>
        {action}
      </div>
    )}
    <div className={noPad ? '' : 'p-4'}>{children}</div>
    {(updatedAt || updatedBy) && (
      <div className="border-t border-slate-100 bg-slate-50/40 px-4 py-1.5 flex items-center gap-2 text-[10.5px] text-slate-500">
        <Clock size={10} />
        <span>Updated <strong className="text-slate-700">{updatedAt}</strong>{updatedBy && <> · by <strong className="text-slate-700">{updatedBy}</strong></>}</span>
        {source === 'MANUAL' && <span className="ml-auto inline-flex items-center gap-1 font-bold text-slate-600">
          <Pencil size={9} /> Manual
        </span>}
      </div>
    )}
  </div>
);

// ============================================================================
// VOICE-FIRST PRIMITIVES — what makes V2 different from V1
// ============================================================================

// The banner that appears on every module screen — closes the voice loop
const AICapturedBanner = ({ count, manualCount, lastCaptureTime, onReview, onAskAI }) => {
  const total = count + manualCount;
  return (
    <div className="rounded-xl p-3.5 mb-4 flex items-center gap-3" style={{ background: `linear-gradient(135deg, ${PURPLE_LIGHT} 0%, #F5F3FF 100%)`, border: `1px solid #DDD6FE` }}>
      <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 36, height: 36, backgroundColor: PURPLE }}>
        <Sparkles size={16} className="text-white" strokeWidth={2.4} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold" style={{ color: PURPLE_DEEP }}>
          {count} captured via voice today {manualCount > 0 && <span className="font-normal opacity-70">· {manualCount} manual</span>}
        </div>
        <div className="text-[11px]" style={{ color: PURPLE_DEEP, opacity: 0.75 }}>
          Last capture {lastCaptureTime} · tap anything to edit
        </div>
      </div>
      <button onClick={onReview} className="rounded-md px-3 py-1.5 text-[11px] font-bold hover:bg-white/40" style={{ color: PURPLE_DEEP }}>
        Review captures →
      </button>
      <button onClick={onAskAI} className="rounded-md text-white px-3 py-1.5 text-[11px] font-bold flex items-center gap-1.5 active:scale-[0.97]" style={{ backgroundColor: PURPLE }}>
        <Mic size={11} /> Capture more
      </button>
    </div>
  );
};

// AI source pill — only renders for MANUAL entries. Voice is the default
// capture path (most records); no need to label every voice-captured row.
const SourcePill = ({ aiSource }) => {
  if (aiSource !== 'MANUAL') return null;
  return <span className="inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-1.5 py-0.5 bg-slate-100 text-slate-600">
    <Pencil size={9} /> Manual
  </span>;
};

// Voice residual / notes excerpt — appears under each list entry to surface
// freeform voice context that didn't map to structured fields. Truncates with
// "Read all →" expansion for long content.
const NotesExcerpt = ({ notes, maxChars = 180, compact, label = 'Voice notes' }) => {
  const [expanded, setExpanded] = useState(false);
  if (!notes || !notes.trim()) return null;
  const isLong = notes.length > maxChars;
  const display = !expanded && isLong ? notes.slice(0, maxChars).trim() + '…' : notes;
  return (
    <div className={cls('rounded-md border border-purple-100 px-2.5 py-1.5', compact ? 'mt-1.5' : 'mt-2')} style={{ backgroundColor: '#FAF5FF' }}>
      <div className="flex items-start gap-1.5">
        <Sparkles size={10} style={{ color: PURPLE }} className="mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[9px] font-bold uppercase tracking-wide" style={{ color: PURPLE_DEEP, opacity: 0.7 }}>{label}</div>
          <div className="text-[11px] leading-snug whitespace-pre-line" style={{ color: PURPLE_DEEP }}>{display}</div>
          {isLong && (
            <button onClick={(e) => { e.stopPropagation(); setExpanded(x => !x); }} className="text-[10px] font-bold mt-0.5 hover:underline" style={{ color: PURPLE_DEEP }}>
              {expanded ? 'Show less ↑' : 'Read all →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MEDIA ATTACHMENTS — photo / video chips with thumbnail + lightbox preview.
// Fully shared component used across incidents, deliveries, inspections,
// daily-log narratives, toolbox talks, and notes.
// ============================================================================
const PLACEHOLDER_GRADIENTS = {
  ebox:        ['#FED7AA', '#9A3412'],
  'ebox-before': ['#FECACA', '#7F1D1D'],
  'ebox-after': ['#BBF7D0', '#14532D'],
  crane:       ['#DBEAFE', '#1E3A8A'],
  truck:       ['#E5E7EB', '#1F2937'],
  boom:        ['#FEF3C7', '#78350F'],
  serial:      ['#F1F5F9', '#0F172A'],
  damage:      ['#FECACA', '#991B1B'],
  beam:        ['#E7E5E4', '#44403C'],
  osb:         ['#FED7AA', '#7C2D12'],
  check:       ['#DCFCE7', '#14532D'],
  wind:        ['#E0F2FE', '#0C4A6E'],
  crew:        ['#EDE9FE', PURPLE_DEEP || '#3B0764'],
  layout:      ['#F1F5F9', '#475569'],
  cert:        ['#FEF3C7', '#78350F'],
  default:     [PURPLE_LIGHT, PURPLE_DEEP || '#3B0764'],
};

const MediaThumb = ({ att, size = 48, onClick, showLabel = false }) => {
  const [from, to] = PLACEHOLDER_GRADIENTS[att.placeholder] || PLACEHOLDER_GRADIENTS.default;
  const Icon = att.kind === 'video' ? Film : ImageIcon;
  return (
    <button onClick={onClick} className="relative rounded-lg overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-purple-300 transition-all" style={{ width: size, height: size }} title={att.label}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon size={Math.round(size * 0.36)} className="text-white opacity-80" strokeWidth={2} />
      </div>
      {att.kind === 'video' && (
        <div className="absolute bottom-0.5 right-0.5 rounded bg-black/70 px-1 py-0.5 flex items-center gap-0.5">
          <Play size={7} className="text-white" />
          {att.durationSec && <span className="text-[8px] font-bold text-white">{Math.floor(att.durationSec/60)}:{String(att.durationSec%60).padStart(2,'0')}</span>}
        </div>
      )}
      {showLabel && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 py-1">
          <div className="text-[9px] font-bold text-white truncate">{att.label}</div>
        </div>
      )}
    </button>
  );
};

const MediaAttachments = ({ items = [], onAdd, compact, max = 6, label = 'Photos / videos', captureLabel = 'Capture', showAddByDefault = true }) => {
  const [openIdx, setOpenIdx] = useState(null);
  const visible = items.slice(0, max);
  const overflow = items.length - visible.length;
  const hasItems = items.length > 0;
  if (!hasItems && !showAddByDefault) return null;
  return (
    <>
      <div className={cls('flex items-center gap-2 flex-wrap', !compact && 'mt-2')}>
        {!compact && <span className="text-[10.5px] text-slate-500 font-bold uppercase tracking-wide flex items-center gap-1"><Paperclip size={10} /> {label}</span>}
        {visible.map((att, i) => (
          <MediaThumb key={att.id} att={att} size={compact ? 32 : 44} onClick={() => setOpenIdx(i)} />
        ))}
        {overflow > 0 && (
          <button onClick={() => setOpenIdx(0)} className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center" style={{ width: compact ? 32 : 44, height: compact ? 32 : 44 }}>
            +{overflow}
          </button>
        )}
        {onAdd && (
          <button onClick={onAdd} className="rounded-lg border-2 border-dashed border-slate-300 hover:border-purple-400 hover:bg-purple-50/40 text-slate-500 hover:text-purple-700 flex items-center justify-center transition-colors" style={{ width: compact ? 32 : 44, height: compact ? 32 : 44 }} title={captureLabel}>
            {compact ? <Plus size={13} /> : <Camera size={15} />}
          </button>
        )}
      </div>
      {openIdx !== null && items[openIdx] && (
        <Lightbox items={items} startIdx={openIdx} onClose={() => setOpenIdx(null)} />
      )}
    </>
  );
};

const Lightbox = ({ items, startIdx, onClose }) => {
  const [idx, setIdx] = useState(startIdx);
  const cur = items[idx];
  const [from, to] = PLACEHOLDER_GRADIENTS[cur.placeholder] || PLACEHOLDER_GRADIENTS.default;
  const Icon = cur.kind === 'video' ? Film : ImageIcon;
  const [playing, setPlaying] = useState(false);
  return (
    <>
      <div className="fixed inset-0 bg-black/85 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-8 pointer-events-none">
        <div className="bg-slate-950 rounded-2xl shadow-2xl flex flex-col pointer-events-auto" style={{ width: 920, maxHeight: 'calc(100vh - 80px)' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-white">
              <Icon size={14} />
              <span className="text-[13px] font-bold">{cur.label}</span>
              <span className="text-[11px] opacity-60">· {cur.kind === 'video' ? 'Video' : 'Photo'} {idx + 1} of {items.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-md bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 text-[11px] font-bold flex items-center gap-1.5">
                <Download size={11} /> Download
              </button>
              <button className="rounded-md bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 text-[11px] font-bold flex items-center gap-1.5">
                <Share2 size={11} /> Share
              </button>
              <button onClick={onClose} className="rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center" style={{ width: 30, height: 30 }}>
                <X size={14} className="text-white" />
              </button>
            </div>
          </div>
          {/* Media canvas */}
          <div className="flex-1 relative flex items-center justify-center p-6" style={{ minHeight: 480 }}>
            <button onClick={() => setIdx(i => (i - 1 + items.length) % items.length)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center z-10" style={{ width: 36, height: 36 }} disabled={items.length <= 1}>
              <ChevronLeft size={16} className="text-white" />
            </button>
            <div className="rounded-xl overflow-hidden flex items-center justify-center" style={{ width: 720, height: 460, background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}>
              <Icon size={120} className="text-white opacity-50" strokeWidth={1.2} />
              {cur.kind === 'video' && (
                <button onClick={() => setPlaying(p => !p)} className="absolute rounded-full flex items-center justify-center" style={{ width: 72, height: 72, backgroundColor: 'rgba(0,0,0,0.55)' }}>
                  {playing ? <Pause size={28} className="text-white" /> : <Play size={28} className="text-white" />}
                </button>
              )}
            </div>
            <button onClick={() => setIdx(i => (i + 1) % items.length)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center z-10" style={{ width: 36, height: 36 }} disabled={items.length <= 1}>
              <ChevronRight size={16} className="text-white" />
            </button>
          </div>
          {/* Thumb strip */}
          {items.length > 1 && (
            <div className="border-t border-slate-800 px-4 py-2 flex items-center gap-2 overflow-x-auto">
              {items.map((it, i) => (
                <div key={it.id} className={cls('rounded-md overflow-hidden flex-shrink-0 cursor-pointer', i === idx && 'ring-2 ring-purple-400')} onClick={() => setIdx(i)}>
                  <MediaThumb att={it} size={48} onClick={() => setIdx(i)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const AddMediaDialog = ({ onClose, onAdd, target }) => {
  const sources = [
    { id: 'camera',  label: 'Take photo',     icon: Camera, hint: 'Use device camera' },
    { id: 'video',   label: 'Record video',   icon: Video,  hint: 'Up to 60 seconds' },
    { id: 'gallery', label: 'Upload from device', icon: ImageIcon, hint: 'JPG, PNG, MP4 · max 25 MB' },
    { id: 'voice',   label: 'Voice → photo prompt', icon: Mic, hint: 'Say what to capture, AI tags it' },
  ];
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col pointer-events-auto" style={{ width: 480 }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div>
              <div className="text-[15px] font-bold text-slate-900">Add photo or video</div>
              <div className="text-[11px] text-slate-500">Attach to <strong className="text-slate-700">{target || 'this entry'}</strong></div>
            </div>
            <button onClick={onClose} className="rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center" style={{ width: 30, height: 30 }}>
              <X size={13} className="text-slate-700" />
            </button>
          </div>
          <div className="p-5 grid grid-cols-2 gap-2.5">
            {sources.map(s => (
              <button key={s.id} onClick={() => { onAdd?.(s.id); onClose(); }}
                className="rounded-lg border-2 border-slate-200 hover:border-purple-400 hover:bg-purple-50/40 p-3.5 text-left transition-all">
                <div className="rounded-lg flex items-center justify-center mb-2" style={{ width: 36, height: 36, backgroundColor: PURPLE_LIGHT }}>
                  <s.icon size={16} style={{ color: PURPLE_DEEP }} />
                </div>
                <div className="text-[12px] font-bold text-slate-900">{s.label}</div>
                <div className="text-[10.5px] text-slate-500 mt-0.5">{s.hint}</div>
              </button>
            ))}
          </div>
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-[10.5px] text-slate-500 flex items-start gap-1.5">
            <Info size={11} className="mt-0.5 flex-shrink-0" />
            <span>Captured media is auto-tagged to this entry, geo-stamped, and routed to the Daily Field Report.</span>
          </div>
        </div>
      </div>
    </>
  );
};

// Inline edit pencil — appears on hover/focus on captured rows
const EditPencil = ({ onClick, label = 'Edit' }) => (
  <button onClick={onClick} title={label} className="rounded p-1 hover:bg-slate-100 text-slate-400 hover:text-purple-700 transition-colors">
    <Pencil size={12} />
  </button>
);

// "Use this only if AI missed something" demoter banner — appears in form modals
const FormFallbackBanner = () => (
  <div className="rounded-md p-2.5 mb-3 flex items-start gap-2" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
    <Info size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
    <div className="text-[11px] text-slate-600">
      Most entries flow in via voice — use this form only if AI missed something. <button className="font-bold text-purple-700 hover:underline">Try Ask AI instead →</button>
    </div>
  </div>
);

// Section header used inside cards/widgets
const SectionLabel = ({ children, action, sub }) => (
  <div className="flex items-end justify-between mb-3">
    <div>
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{children}</div>
      {sub && <div className="text-[12px] text-slate-500 mt-1">{sub}</div>}
    </div>
    {action}
  </div>
);

// ============================================================================
// MERLIN AI SIDEBAR — matches actual app
// ============================================================================
const MerlinSidebar = ({ active, onNavigate, role, setRole, dark, setDark }) => {
  const main = [
    { id: 'sales',      icon: TrendingUp,   label: 'Sales' },
    { id: 'projects',   icon: LayoutGrid,   label: 'Projects', pinned: true },
    { id: 'materials',  icon: ArrowLeftRight,label: 'Materials' },
    { id: 'finance',    icon: Receipt,      label: 'Finance' },
    { id: 'orders',     icon: Box,          label: 'Orders' },
    { id: 'operations', icon: Cog,          label: 'Operations' },
  ];
  const comm  = [{ id: 'calendar',  icon: Calendar,  label: 'Calendar' }];
  const tools = [{ id: 'dashboard', icon: BarChart3, label: 'Dashboard' }];
  const others = [{ id: 'settings', icon: Settings,  label: 'Settings' }];

  const renderItem = (it) => {
    const isActive = active === it.id;
    return (
      <button key={it.id} onClick={() => onNavigate(it.id)}
        className={cls('w-full flex items-center gap-3 rounded-lg px-3 py-2.5 mb-0.5 transition-colors',
          isActive ? 'bg-purple-50' : 'hover:bg-slate-50')}>
        <it.icon size={17} strokeWidth={isActive ? 2.4 : 1.8} style={{ color: isActive ? PURPLE_DEEP : TEXT_MUTED }} />
        <span className={cls('text-[13px] flex-1 text-left', isActive ? 'font-bold' : 'font-medium')}
          style={{ color: isActive ? PURPLE_DEEP : TEXT }}>
          {it.label}
        </span>
        {it.pinned && <Pin size={12} style={{ color: PURPLE_DEEP }} fill={PURPLE_DEEP} />}
      </button>
    );
  };

  return (
    <aside className="bg-white border-r border-slate-200 flex flex-col flex-shrink-0" style={{ width: 248 }}>
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-slate-100">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: PURPLE }}>
          <span className="text-white font-bold text-[13px]">MI</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold text-slate-900 truncate">Merlin AI</div>
        </div>
        <button className="p-1.5 rounded hover:bg-slate-100">
          <ChevronLeft size={14} className="text-slate-400" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">Main</div>
        {main.map(renderItem)}
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5 mt-4">Communication</div>
        {comm.map(renderItem)}
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5 mt-4">Tools</div>
        {tools.map(renderItem)}
      </nav>
      <div className="px-2 py-2 border-t border-slate-100">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">Others</div>
        {others.map(renderItem)}
      </div>
      {/* Worker view removed — Manager is the single primary persona for this view */}
      <div className="flex items-center gap-2 px-3 py-3 border-t border-slate-100">
        <Avatar initials="DS" size="sm" />
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-bold text-slate-900 truncate">Dhruv</div>
          <div className="text-[10px] text-slate-500 truncate">Merlin AI</div>
        </div>
        <button className="p-1 hover:bg-slate-100 rounded"><ChevronDown size={12} className="text-slate-400" /></button>
        <button onClick={() => setDark(!dark)} className="p-1 hover:bg-slate-100 rounded">{dark ? <Sun size={14} className="text-slate-400" /> : <Moon size={14} className="text-slate-400" />}</button>
      </div>
    </aside>
  );
};

// ============================================================================
// PROJECT TOP NAV — matches actual app
// (Voice-first: Ask AI is THE primary CTA. + Create is demoted to icon.)
// ============================================================================
const ProjectTopNav = ({ activeTab, onTab, onAskAI, onCreate, notifications }) => {
  const tabs = [
    { id: 'home',      label: 'Home' },
    { id: 'tasks',     label: 'Tasks' },
    { id: 'services',  label: 'Services' },
    { id: 'templates', label: 'Project Templates' },
    { id: 'phases',    label: 'Project Phases' },
    { id: 'onsite',    label: 'On-Site' },
  ];
  return (
    <div className="bg-white border-b border-slate-200 px-4 flex items-center gap-6" style={{ height: 56 }}>
      <div className="flex items-center gap-1">
        {tabs.map(t => {
          const isActive = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => onTab(t.id)}
              className={cls('text-[14px] font-bold px-3 py-1.5 rounded-lg transition-colors', isActive ? '' : 'text-slate-600 hover:bg-slate-50')}
              style={{ color: isActive ? TEXT : undefined, position: 'relative' }}>
              {t.label}
              {isActive && <span className="absolute left-3 right-3 -bottom-[14px] h-0.5 rounded-full" style={{ backgroundColor: PURPLE }} />}
            </button>
          );
        })}
      </div>
      <div className="flex-1" />
      <div className="relative" style={{ width: 220 }}>
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input placeholder="Search..." className="w-full bg-slate-50 rounded-lg pl-9 pr-12 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-purple-300" />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono bg-white border border-slate-200 rounded px-1.5 py-0.5">⌘K</span>
      </div>
      <Badge tone="amber">Beta</Badge>
      {/* PRIMARY CTA — Ask AI (voice-first paradigm) */}
      <button onClick={onAskAI} className="flex items-center gap-2 rounded-lg px-4 py-2 text-white font-bold text-[13px] shadow-sm active:scale-[0.97]"
        style={{ background: `linear-gradient(135deg, ${PURPLE_DEEP} 0%, ${PURPLE} 100%)` }}>
        <Star size={14} fill="white" /> Ask AI <span className="opacity-70">(Beta)</span>
      </button>
      {/* DEMOTED — small + icon for manual entry fallback */}
      <button onClick={onCreate} title="Manual entry (most data flows from voice)"
        className="rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center" style={{ width: 32, height: 32 }}>
        <Plus size={14} className="text-slate-600" strokeWidth={2.4} />
      </button>
      <button className="relative flex items-center justify-center" style={{ width: 32, height: 32 }}>
        <Bell size={16} className="text-slate-700" />
        {notifications > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">{notifications}+</span>
        )}
      </button>
    </div>
  );
};

// ============================================================================
// ON-SITE PAGE — orchestrates sub-tabs
// ============================================================================
const OnSitePage = ({ project, personnel, equipment, deliveries, incidents, inspections, visitors, toolboxTalks, notes, materials, voiceCommentary, matReconciliation, audioSummary, summaryEntries, reportText, dashboardConfig, reportTemplate, onOpenModal, onAskAI, onOpenSettings }) => {
  const [tab, setTab] = useState('dashboard');
  // Dashboard + Daily Log combined into single 'dashboard' tab
  // Reports tab removed — Daily Field Report exports are surfaced from the Dashboard
  const tabs = [
    { id: 'dashboard',    label: 'Dashboard',          icon: BarChart3 },
    { id: 'personnel',    label: 'Personnel',          icon: Users },
    { id: 'deliveries',   label: 'Deliveries',         icon: Truck },
    { id: 'safety',       label: 'Safety & Meetings',  icon: ShieldCheck },
    { id: 'incidents',    label: 'Incidents & Delays', icon: AlertOctagon },
    { id: 'inspections',  label: 'Inspections',        icon: Eye },
    { id: 'equipment',    label: 'Equipment',          icon: Wrench },
    { id: 'materials',    label: 'Materials',          icon: Package,       disabled: true },
    { id: 'notes',        label: 'Notes',              icon: StickyNote },
    { id: 'changeorders', label: 'Change Orders',      icon: Edit3,         disabled: true },
    { id: 'library',      label: 'Library',            icon: FolderOpen,    disabled: true },
    { id: 'sov',          label: 'SOV',                icon: Receipt,       disabled: true },
    { id: 'prejob',       label: 'Pre-Job',            icon: ClipboardCheck, disabled: true },
  ];
  return (
    <div className="px-6 py-5 max-w-[1480px] mx-auto">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">On-Site · Daily Logs Management</div>
          <div className="text-[24px] font-bold text-slate-900 mt-1">{project.name}</div>
          <div className="text-[12px] text-slate-500 mt-0.5">{project.client} · {project.address} · Sup: {project.superintendent}</div>
        </div>
        <Badge tone="purple">{project.progress.toFixed(2)}% complete</Badge>
      </div>

      {/* Sub-tab strip — square-card style with icons */}
      <div className="flex gap-2.5 mb-5 overflow-x-auto pb-1">
        {tabs.map(t => {
          const isActive = tab === t.id;
          const isDisabled = t.disabled;
          return (
            <button key={t.id} onClick={() => !isDisabled && setTab(t.id)}
              disabled={isDisabled}
              title={isDisabled ? 'Out of PLAT-104 scope · existing module preserved' : t.label}
              className={cls('flex items-center gap-2 rounded-xl border-2 px-3.5 py-2 flex-shrink-0 transition-all',
                isActive ? 'shadow-sm' : (isDisabled ? 'cursor-not-allowed' : 'hover:border-slate-300 hover:shadow-sm'))}
              style={{
                borderColor: isActive ? PURPLE : BORDER,
                backgroundColor: isActive ? PURPLE_LIGHT : 'white',
                opacity: isDisabled ? 0.5 : 1,
              }}>
              <div className="rounded-md flex items-center justify-center" style={{ width: 24, height: 24, backgroundColor: isActive ? 'white' : '#F1F5F9' }}>
                {t.icon && <t.icon size={13} style={{ color: isActive ? PURPLE_DEEP : TEXT_MUTED }} strokeWidth={2.2} />}
              </div>
              <span className="text-[13px] font-bold" style={{ color: isActive ? PURPLE_DEEP : TEXT }}>{t.label}</span>
              {isDisabled && <span className="text-[9px] font-bold rounded-full px-1.5 py-0.5 bg-slate-200 text-slate-600">existing</span>}
            </button>
          );
        })}
      </div>

      {tab === 'dashboard'   && <DashboardTab project={project} personnel={personnel} equipment={equipment} deliveries={deliveries} incidents={incidents} inspections={inspections} visitors={visitors} toolboxTalks={toolboxTalks} notes={notes} voiceCommentary={voiceCommentary} matReconciliation={matReconciliation} audioSummary={audioSummary} summaryEntries={summaryEntries} reportText={reportText} dashboardConfig={dashboardConfig} reportTemplate={reportTemplate} onOpenModal={onOpenModal} onAskAI={onAskAI} onOpenSettings={onOpenSettings} onNavigateTab={setTab} />}
      {tab === 'personnel'   && <PersonnelTab personnel={personnel} commentary={voiceCommentary?.personnel} onAskAI={onAskAI} onOpenModal={onOpenModal} />}
      {tab === 'deliveries'  && <DeliveriesTab deliveries={deliveries} commentary={voiceCommentary?.deliveries} matReconciliation={matReconciliation} onAskAI={onAskAI} onOpenModal={onOpenModal} />}
      {tab === 'safety'      && <SafetyMeetingsTab toolboxTalks={toolboxTalks} reportText={reportText} onAskAI={onAskAI} onOpenModal={onOpenModal} />}
      {tab === 'incidents'   && <IncidentsDelaysTab incidents={incidents} problems={SEED_PROBLEMS} reportText={reportText} commentary={voiceCommentary?.incidents} onAskAI={onAskAI} onOpenModal={onOpenModal} />}
      {tab === 'inspections' && <InspectionsTab inspections={inspections} onAskAI={onAskAI} onOpenModal={onOpenModal} />}
      {tab === 'equipment'   && <EquipmentTab equipment={equipment} commentary={voiceCommentary?.equipment} matReconciliation={matReconciliation} onAskAI={onAskAI} onOpenModal={onOpenModal} />}
      {tab === 'materials'   && <MaterialsTab materials={materials} commentary={voiceCommentary?.materials} matReconciliation={matReconciliation} onAskAI={onAskAI} onOpenModal={onOpenModal} />}
      {tab === 'notes'       && <NotesTab notes={notes} onAskAI={onAskAI} onOpenModal={onOpenModal} />}
      {tab === 'changeorders'&& <PreservedTab title="Change Orders" desc="Existing module — Customer-Initiated Change Orders flow. Voice triggers can draft entries here." />}
      {tab === 'library'     && <PreservedTab title="Library" desc="Project document library — drawings, specs, contracts. Existing module preserved." />}
      {tab === 'sov'         && <PreservedTab title="Schedule of Values" desc="AIA G702/G703 progress billing. Daily-log % complete data feeds into this module via Finance." />}
      {tab === 'prejob'      && <PreservedTab title="Pre-Job Setup" desc="Project kickoff checklist · contracts · permits · COIs. Existing module preserved." />}
    </div>
  );
};

const PreservedTab = ({ title, desc }) => (
  <Card>
    <div className="flex flex-col items-center text-center py-12">
      <div className="rounded-full flex items-center justify-center mb-3" style={{ width: 64, height: 64, backgroundColor: PURPLE_LIGHT }}>
        <Layers size={28} style={{ color: PURPLE_DEEP }} strokeWidth={1.6} />
      </div>
      <div className="text-[16px] font-bold text-slate-900 mb-1">{title}</div>
      <div className="text-[12px] text-slate-500 max-w-[440px]">{desc}</div>
      <div className="text-[10px] text-slate-400 mt-3 italic">Preserved from existing Merlin app — no changes</div>
    </div>
  </Card>
);

// ============================================================================
// DASHBOARD TAB — driven by ORG_DASHBOARD_CONFIG
// Each widget respects: enabled flag + project type whitelist
// ============================================================================
const DashboardTab = ({ project, personnel, equipment, deliveries, incidents, inspections, visitors, toolboxTalks = [], notes = [], voiceCommentary = {}, matReconciliation = [], audioSummary, summaryEntries, reportText, dashboardConfig, reportTemplate, onOpenModal, onAskAI, onOpenSettings, onNavigateTab }) => {
  const onSite     = personnel.filter(p => p.checkIn).length;
  const totalHrs   = personnel.reduce((s,p) => s + (p.hours || 0), 0);
  const laborCost  = personnel.reduce((s,p) => s + ((p.hours || 0) * p.wageRate), 0);
  const equipCost  = equipment.filter(e => e.status === 'ACTIVE').reduce((s,e) => s + e.dayRate * e.qty, 0);
  const matCost    = deliveries.filter(d => d.status === 'Received').reduce((s,d) => s + d.value, 0);
  const burnToday  = laborCost + equipCost + matCost;
  const openInc    = incidents.filter(i => i.status === 'OPEN').length;
  // Banner count covers every captured surface, not just personnel/deliveries/equipment.
  const captureSources = [
    ...personnel, ...deliveries, ...equipment, ...incidents,
    ...inspections, ...visitors, ...toolboxTalks, ...notes,
  ];
  const aiCount     = captureSources.filter(x => x?.aiSource === 'VOICE').length;
  const manualCount = captureSources.filter(x => x?.aiSource === 'MANUAL').length;
  const isModular  = project.type === 'modular';
  const m          = project.modularStats;

  // Date-view selector: yesterday / today / week / month
  const [dateView, setDateView] = useState('today');
  const compareLabel = { yesterday: 'vs prior day', today: 'vs yesterday', week: 'vs prior week', month: 'vs prior month' }[dateView];
  const periodLabel  = { yesterday: 'Yesterday', today: 'Today', week: 'This week', month: 'This month' }[dateView];

  // Helper: should this widget render? Check org config + project-type filter.
  // Widgets marked `disabled: true` never render and are not togglable in
  // Customize — they're reserved for V2 / future enablement.
  const showWidget = (id) => {
    const w = dashboardConfig.widgetCatalog[id];
    if (!w || w.disabled) return false;
    return w.enabled && w.projectTypes.includes(project.type);
  };

  // Click-through helper — redirect KPI card to source sub-module tab
  const goTo = (tabId) => () => onNavigateTab?.(tabId);

  // === Layout customization (org-level): user can reorder sections ===
  const DEFAULT_LAYOUT = ['progress','aiHero','production','modularExtras','kpis','tablesPersDel','moduleSummaries','toolbox','notesAndPhotos','splitColumn','dailyLog'];
  const [customizeMode, setCustomizeMode] = useState(false);
  const [layoutOrder, setLayoutOrder] = useState(DEFAULT_LAYOUT);
  const [dragId, setDragId] = useState(null);
  const moveSection = (id, dir) => {
    setLayoutOrder(prev => {
      const idx = prev.indexOf(id);
      const target = idx + dir;
      if (idx < 0 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };
  const onDragStart = (id) => () => setDragId(id);
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (id) => (e) => {
    e.preventDefault();
    if (!dragId || dragId === id) return;
    setLayoutOrder(prev => {
      const next = prev.filter(x => x !== dragId);
      const ti = next.indexOf(id);
      next.splice(ti, 0, dragId);
      return next;
    });
    setDragId(null);
  };

  return (
    <div>
      {/* === Date-view selector + Calendar === */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
          {[
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'today',     label: 'Today' },
            { id: 'week',      label: 'Week' },
            { id: 'month',     label: 'Month' },
          ].map(opt => {
            const isActive = dateView === opt.id;
            return (
              <button key={opt.id} onClick={() => setDateView(opt.id)}
                className={'rounded-lg px-3 py-1.5 text-[12px] font-bold transition-colors ' + (isActive ? 'text-white' : 'text-slate-600 hover:bg-slate-50')}
                style={{ backgroundColor: isActive ? PURPLE : undefined }}>
                {opt.label}
              </button>
            );
          })}
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-bold text-slate-700 hover:bg-slate-50">
          <Calendar size={13} /> {dateView === 'today' ? 'Mon · 5 May 2026' : dateView === 'yesterday' ? 'Sun · 4 May' : dateView === 'week' ? 'May 4 – May 10' : 'May 2026'}
          <ChevronDown size={11} className="text-slate-400" />
        </button>
        <div className="text-[11px] text-slate-500 flex-1">Period: <strong>{periodLabel}</strong> · comparison <strong>{compareLabel}</strong></div>
        <button onClick={() => setCustomizeMode(m => !m)} className={cls('rounded-lg px-3 py-1.5 text-[12px] font-bold flex items-center gap-1.5 border-2 transition-colors', customizeMode ? 'text-white' : 'text-slate-700 hover:bg-slate-50')}
          style={{ backgroundColor: customizeMode ? PURPLE : 'white', borderColor: customizeMode ? PURPLE : BORDER }}>
          {customizeMode ? <Check size={13} /> : <SlidersHorizontal size={13} />}
          {customizeMode ? 'Done arranging' : 'Customize layout'}
        </button>
        {customizeMode && layoutOrder.join() !== DEFAULT_LAYOUT.join() && (
          <button onClick={() => setLayoutOrder(DEFAULT_LAYOUT)} className="text-[11px] font-bold text-slate-500 hover:text-purple-700">Reset</button>
        )}
      </div>

      {customizeMode && (
        <div className="rounded-lg p-2.5 mb-4 flex items-start gap-2" style={{ backgroundColor: PURPLE_LIGHT, border: `1px solid #DDD6FE` }}>
          <Info size={13} style={{ color: PURPLE_DEEP }} className="mt-0.5 flex-shrink-0" />
          <div className="text-[11px]" style={{ color: PURPLE_DEEP }}>
            <strong>Layout customize mode</strong> — drag sections by the grip handle, or use ↑ ↓ buttons to reorder. Org-level: changes apply to everyone in the org. Click <em>Done arranging</em> to save.
          </div>
        </div>
      )}

      <div className="flex flex-col">
      {(() => {
        const sectionProps = (id, label) => ({ id, label, idx: layoutOrder.indexOf(id), total: layoutOrder.length, customize: customizeMode, onMove: moveSection, onDragStart, onDragOver, onDrop, dragId });
        return <>
      {/* === AI DAILY SUMMARY — WIDE HERO with audio + transcript + activity timeline + burn folded in === */}
      <DraggableSection {...sectionProps('aiHero', 'AI Daily Summary')}>
      {showWidget('aiSummaryToday') && (
        <AIDailySummaryHero
          dateView={dateView}
          periodLabel={periodLabel}
          compareLabel={compareLabel}
          m={m}
          totalHrs={totalHrs}
          laborCost={laborCost}
          burnToday={burnToday}
          equipCost={equipCost}
          matCost={matCost}
          onSite={onSite}
          openInc={openInc}
          audio={audioSummary}
          summaryEntries={summaryEntries}
          onAskAI={onAskAI}
          showBurn={showWidget('burn')}
        />
      )}
      </DraggableSection>

      {/* Thick project header — Day/% + progress bar + KPIs incl. Today's burn breakdown + weather (big temp + 7-day strip) */}
      <DraggableSection {...sectionProps('progress', 'Project header · KPIs · weather')}>
      {showWidget('burn') && (
        <div className="rounded-2xl bg-white border border-slate-200 mb-5 overflow-hidden">
          {/* Row 1 — Day · % · progress bar */}
          <div className="px-5 pt-4 pb-3 flex items-center gap-4">
            <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ width: 38, height: 38, backgroundColor: PURPLE_LIGHT }}>
              <Activity size={17} style={{ color: PURPLE_DEEP }} />
            </div>
            <div className="flex-shrink-0">
              <div className="text-[10.5px] text-slate-500 font-semibold uppercase tracking-wide">Day {project.daysIn} of {project.daysTotal}</div>
              <div className="text-[18px] font-bold text-slate-900 leading-tight">{project.progress.toFixed(2)}% complete</div>
            </div>
            <div className="flex-1 mx-2">
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${project.progress}%`, background: `linear-gradient(90deg, ${PURPLE} 0%, ${PURPLE_DEEP} 100%)` }} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-semibold mt-1">
                <span>Started {project.daysIn} days in</span>
                <span>{project.daysTotal - project.daysIn} days remaining</span>
              </div>
            </div>
          </div>
          {/* Row 2 — KPIs (Units / % / Crew) + Today's burn + Weather (big temp + 7-day) */}
          <div className="border-t border-slate-100 grid grid-cols-12 divide-x divide-slate-100">
            {[
              { label: 'Units installed', value: m?.setToday || 9, trend: '+12.5%', icon: Box },
              { label: '% Complete',       value: `${project.progress.toFixed(2)}%`, trend: '+0.27%', icon: Activity },
              { label: 'Crew hours',       value: `${totalHrs.toFixed(0)}h`, trend: '+3%', icon: Clock,
                extras: [{ k: 'Start', v: '6:30 AM' }, { k: 'End', v: '5:30 PM' }] },
            ].map(k => (
              <div key={k.label} className="col-span-2 px-4 py-3">
                <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide flex items-center gap-1"><k.icon size={10} /> {k.label}</div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-[19px] font-bold text-slate-900 leading-none">{k.value}</span>
                  <span className="text-[10.5px] text-green-700 font-bold">↑ {k.trend}</span>
                </div>
                {k.extras && (
                  <div className="grid grid-cols-2 gap-1 mt-1.5 pt-1.5" style={{ borderTop: '1px dashed #E2E8F0' }}>
                    {k.extras.map(e => (
                      <div key={e.k}>
                        <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-wide">{e.k}</div>
                        <div className="text-[12px] font-bold text-slate-900 leading-tight">{e.v}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {/* Today's burn — col-span 3 with breakdown */}
            <div className="col-span-3 px-4 py-3" style={{ background: `linear-gradient(135deg, #FAFAFF 0%, ${PURPLE_LIGHT} 100%)` }}>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide flex items-center gap-1" style={{ color: PURPLE_DEEP, opacity: 0.75 }}>
                  <DollarSign size={10} /> Today's burn
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-[19px] font-bold leading-none" style={{ color: PURPLE_DEEP }}>{fmt$(burnToday)}</span>
                  <span className="text-[10.5px] text-green-700 font-bold">↑ on plan</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5 mt-2 pt-2" style={{ borderTop: '1px dashed #DDD6FE' }}>
                {[
                  { k: 'Labor',     v: fmt$(laborCost),       i: Users },
                  { k: 'Equipment', v: fmt$(equipCost || 0),  i: Wrench },
                  { k: 'Materials', v: fmt$(matCost || 0),    i: Package },
                ].map(b => (
                  <div key={b.k}>
                    <div className="text-[9px] font-semibold flex items-center gap-0.5" style={{ color: PURPLE_DEEP, opacity: 0.7 }}>
                      <b.i size={9} /> {b.k}
                    </div>
                    <div className="text-[11px] font-bold mt-0.5 truncate" style={{ color: PURPLE_DEEP }}>{b.v}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Weather — col-span 3 with BIG temp + embedded 7-day forecast */}
            <div className="col-span-3 px-4 py-3" style={{ background: `linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)` }}>
              <div className="flex items-start gap-3">
                {/* Big temperature */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Sun size={28} className="text-amber-500" strokeWidth={2} />
                  <div>
                    <div className="text-[28px] font-bold text-slate-900 leading-none">{project.weather.temp}°F</div>
                    <div className="text-[9px] text-slate-600 font-semibold mt-0.5">AM {project.weather.condAM}</div>
                    <div className="text-[9px] text-slate-600 font-semibold">PM {project.weather.condPM}</div>
                  </div>
                </div>
                {/* 7-day mini strip */}
                <div className="flex-1 grid grid-cols-7 gap-0.5 pl-2 ml-1" style={{ borderLeft: '1px dashed #FCD34D' }}>
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => {
                    const temps = [78, 80, 82, 72, 79, 81, 83];
                    const icons = ['☀','☀','☀','🌧','☀','☀','☀'];
                    const isRain = i === 3;
                    return (
                      <div key={d} className="text-center">
                        <div className="text-[8.5px] text-slate-600 font-bold">{d}</div>
                        <div className="text-[14px] my-0.5">{icons[i]}</div>
                        <div className={cls('text-[9.5px] font-bold', isRain ? 'text-amber-700' : 'text-slate-900')}>{temps[i]}°</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="text-[9.5px] text-amber-800 font-semibold mt-1.5 flex items-center gap-1">
                <AlertCircle size={9} /> Rain Thu · plan accordingly
              </div>
            </div>
          </div>
        </div>
      )}
      </DraggableSection>

      {/* Production metrics row — modular projects only (industry-generic terminology) */}
      <DraggableSection {...sectionProps('production', 'Production metrics')}>
      {showWidget('productionMetrics') && isModular && (
        // Panels Today / Total Panels intentionally removed — Proset doesn't
        // track panels separately. Re-introduce as opt-in widgets if a future
        // org needs them.
        <div className="grid grid-cols-4 gap-3 mb-5">
          <KPI label="Units Installed Today" value={m.setToday}     sub="vs target 12"                     icon={Box}           accent trend={12} onClick={goTo('changeorders')} />
          <KPI label="Total Units Installed" value={m.totalSet}     sub={`of ${m.totalSet + m.remaining}`} icon={Layers}                 onClick={goTo('changeorders')} />
          <KPI label="Units Remaining"        value={m.remaining}                                            icon={ClipboardList}            onClick={goTo('changeorders')} />
          <KPI label="% Complete"             value={`${m.pctComplete}%`}                                    icon={Activity}      trend={2}  onClick={goTo('sov')} />
        </div>
      )}
      </DraggableSection>

      {/* Modular-specific extras: yard inventory, crane utilization, stack progress, etc. */}
      <DraggableSection {...sectionProps('modularExtras', 'Modular extras')}>
      {isModular && (showWidget('yardInventory') || showWidget('craneUtilization') || showWidget('stackProgress') || showWidget('factorySiteCadence') || showWidget('moduleReadinessQC') || showWidget('weatherWindow')) && (
        <div className="grid grid-cols-4 gap-3 mb-5">
          {showWidget('yardInventory')      && <KPI label="Yard inventory"         value={6}    sub="units waiting in laydown"        icon={Layers}      onClick={goTo('deliveries')} />}
          {showWidget('craneUtilization')   && <KPI label="Crane picks today"      value={9}    sub="avg 42 min cycle · 7.2h on crane" icon={Wrench}    accent onClick={goTo('equipment')} />}
          {showWidget('stackProgress')      && <KPI label="Floor 3 progress"        value="62%"  sub="14 of 22 units set"               icon={Layers}     trend={5} onClick={goTo('sov')} />}
          {showWidget('factorySiteCadence') && <KPI label="Factory ↔ site gap"     value="+2"    sub="factory ahead of site"            icon={ArrowRight} onClick={goTo('deliveries')} />}
          {showWidget('moduleReadinessQC')  && <KPI label="Modules ready to set"   value={8}     sub="QC passed · awaiting crane"      icon={CheckCircle2} success onClick={goTo('inspections')} />}
          {showWidget('weatherWindow')      && <KPI label="Crane wind window"      value="OK"    sub="15 mph · max 35 mph"             icon={Sun}        onClick={goTo('dashboard')} />}
        </div>
      )}
      </DraggableSection>

      {/* User-pinned metrics — Personnel / Deliveries / Incidents / Equipment driven by org config */}
      <DraggableSection {...sectionProps('kpis', 'KPI tiles')}>
      <div className="grid grid-cols-4 gap-3 mb-5">
        {showWidget('personnelOnSite') && <KPI label="Personnel on site"     value={onSite} sub={`${personnel.length} on roster`}                        icon={Users}      trend={12}  onClick={goTo('personnel')} />}
        {showWidget('personnelLate')   && <KPI label="Late arrivals"          value={personnel.filter(p => p.late).length} sub="today"                  icon={Clock}      alert={personnel.some(p => p.late)} onClick={goTo('personnel')} />}
        {showWidget('overtimeCount')   && <KPI label="Workers in overtime"    value={personnel.filter(p => (p.hours || 0) > 8).length} sub="over 8h today" icon={TrendingUp} alert={personnel.filter(p => (p.hours || 0) > 8).length > 0} onClick={goTo('personnel')} />}
        {showWidget('crewHours')       && <KPI label="Crew hours"             value={fmtHrs(totalHrs)} sub={`${personnel.filter(p => p.checkIn).length} workers`} icon={Clock}                 onClick={goTo('personnel')} />}
        {showWidget('laborCost')       && <KPI label="Labor cost today"       value={fmt$(laborCost)} sub={`${totalHrs.toFixed(1)}h × wage`}              icon={DollarSign} accent       onClick={goTo('personnel')} />}
        {showWidget('deliveriesToday') && <KPI label="Deliveries today"        value={deliveries.length} sub={`${deliveries.filter(d => d.status === 'Received').length} received`} icon={Truck} onClick={goTo('deliveries')} />}
        {showWidget('deliveriesValue') && <KPI label="Materials value"         value={fmt$(deliveries.filter(d => d.status === 'Received').reduce((s,d) => s + d.value, 0))} sub="received today" icon={DollarSign} onClick={goTo('deliveries')} />}
        {showWidget('deliveriesDamaged') && <KPI label="Damaged deliveries"    value={deliveries.filter(d => d.status === 'Damaged').length} sub="needs follow-up" icon={AlertTriangle} alert={deliveries.some(d => d.status === 'Damaged')} onClick={goTo('deliveries')} />}
        {showWidget('deliveriesPending') && <KPI label="Pending deliveries"    value={deliveries.filter(d => d.status === 'Pending').length} sub="awaiting receipt" icon={Loader2} onClick={goTo('deliveries')} />}
        {showWidget('incidentsOpen')   && <KPI label="Open incidents"          value={openInc} sub={openInc > 0 ? 'tap to triage' : 'all clear'}        icon={AlertTriangle} alert={openInc > 0} onClick={goTo('incidents')} />}
        {showWidget('incidentsOSHA')   && <KPI label="OSHA recordable"         value={incidents.filter(i => SEV_META[i.severity]?.osha).length} sub="this period" icon={Shield} onClick={goTo('incidents')} />}
        {showWidget('incidentsDaysSince') && <KPI label="Days since incident" value={14} sub="all-clear streak"                                          icon={CheckCircle2} success     onClick={goTo('incidents')} />}
        {showWidget('equipmentActive') && <KPI label="Equipment active"        value={equipment.filter(e => e.status === 'ACTIVE').reduce((s,e) => s + e.qty, 0)} sub={`${equipment.filter(e => e.status === 'IN_MAINTENANCE').length} in maintenance`} icon={Wrench} onClick={goTo('equipment')} />}
        {showWidget('equipmentMaint')  && <KPI label="In maintenance"          value={equipment.filter(e => e.status === 'IN_MAINTENANCE').length} sub="needs attention" icon={Wrench} alert={equipment.some(e => e.status === 'IN_MAINTENANCE')} onClick={goTo('equipment')} />}
        {showWidget('visitorsOnSite')  && <KPI label="Visitors on site"        value={visitors?.filter(v => !v.timeOut).length || 0} sub="signed in"   icon={IdCard}                onClick={goTo('dashboard')} />}
      </div>
      </DraggableSection>

      {/* === Personnel + Deliveries summary tables === */}
      <DraggableSection {...sectionProps('tablesPersDel', 'Personnel & Deliveries tables')}>
      {(showWidget('personnelTable') || showWidget('deliveriesTable')) && (
        <div className="grid grid-cols-2 gap-5 mb-5">
          {showWidget('personnelTable') && (
            <Card icon={Users} title="Personnel summary · today" action={<button onClick={goTo('personnel')} className="text-[11px] font-bold text-purple-700 hover:underline">View all {personnel.length} →</button>} updatedAt="6:30 AM" updatedBy="Erik Odowd" source="VOICE">
              <div className="overflow-hidden -mx-4 -mb-4">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left font-bold text-slate-600 px-3 py-2 text-[10.5px] uppercase tracking-wide">Worker</th>
                      <th className="text-left font-bold text-slate-600 px-2 py-2 text-[10.5px] uppercase tracking-wide">Role</th>
                      <th className="text-right font-bold text-slate-600 px-2 py-2 text-[10.5px] uppercase tracking-wide">Hrs</th>
                      <th className="text-right font-bold text-slate-600 px-3 py-2 text-[10.5px] uppercase tracking-wide">$ Today</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personnel.slice(0, 6).map(p => (
                      <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-purple-50/40 cursor-pointer" onClick={goTo('personnel')}>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Avatar initials={p.avatar} size="xs" />
                            <div className="min-w-0">
                              <div className="text-[12px] font-bold text-slate-900 truncate">{p.name}</div>
                              <div className="text-[10px] text-slate-500">{p.empId} · {p.trade}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-slate-700">{p.role}</td>
                        <td className="px-2 py-2 text-right font-semibold text-slate-900">{p.hours.toFixed(1)}h</td>
                        <td className="px-3 py-2 text-right font-bold" style={{ color: PURPLE_DEEP }}>{fmt$(p.hours * p.wageRate)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 border-t border-slate-200">
                      <td className="px-3 py-2 text-[11px] font-bold text-slate-600">Totals · {personnel.length} workers</td>
                      <td className="px-2 py-2"></td>
                      <td className="px-2 py-2 text-right font-bold text-slate-900">{fmtHrs(totalHrs)}</td>
                      <td className="px-3 py-2 text-right font-bold" style={{ color: PURPLE_DEEP }}>{fmt$(laborCost)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          )}

          {showWidget('deliveriesTable') && (
            <Card icon={Truck} title="Deliveries summary · today" action={<button onClick={goTo('deliveries')} className="text-[11px] font-bold text-purple-700 hover:underline">View all {deliveries.length} →</button>} updatedAt="11:00 AM" updatedBy="Erik Odowd" source="VOICE">
              <div className="overflow-hidden -mx-4 -mb-4">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left font-bold text-slate-600 px-3 py-2 text-[10.5px] uppercase tracking-wide">Material / PO</th>
                      <th className="text-left font-bold text-slate-600 px-2 py-2 text-[10.5px] uppercase tracking-wide">Supplier</th>
                      <th className="text-center font-bold text-slate-600 px-2 py-2 text-[10.5px] uppercase tracking-wide">Status</th>
                      <th className="text-right font-bold text-slate-600 px-3 py-2 text-[10.5px] uppercase tracking-wide">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveries.slice(0, 6).map(d => (
                      <tr key={d.id} className="border-b border-slate-100 last:border-0 hover:bg-purple-50/40 cursor-pointer" onClick={goTo('deliveries')}>
                        <td className="px-3 py-2">
                          <div className="text-[12px] font-bold text-slate-900 truncate">{d.materials}</div>
                          <div className="text-[10px] text-slate-500">{d.poNumber} · {d.quantity} {d.unit}</div>
                        </td>
                        <td className="px-2 py-2 text-slate-700 truncate">{d.supplier}</td>
                        <td className="px-2 py-2 text-center">
                          <Badge tone={d.status === 'Received' ? 'green' : d.status === 'Damaged' ? 'red' : 'amber'}>{d.status}</Badge>
                        </td>
                        <td className="px-3 py-2 text-right font-bold" style={{ color: PURPLE_DEEP }}>{fmt$(d.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 border-t border-slate-200">
                      <td className="px-3 py-2 text-[11px] font-bold text-slate-600">Received total</td>
                      <td className="px-2 py-2"></td>
                      <td className="px-2 py-2 text-center text-[11px] text-slate-600">{deliveries.filter(d => d.status === 'Received').length} of {deliveries.length}</td>
                      <td className="px-3 py-2 text-right font-bold" style={{ color: PURPLE_DEEP }}>{fmt$(deliveries.filter(d => d.status === 'Received').reduce((s, d) => s + d.value, 0))}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
      </DraggableSection>

      {/* === Module AI summary cards — Personnel / Materials / Equipment (replaces trade roll-up + reconciliation) === */}
      <DraggableSection {...sectionProps('moduleSummaries', 'Module AI summaries')}>
      {(showWidget('personnelSummary') || showWidget('materialsSummary') || showWidget('equipmentSummary')) && (
        <div className="grid grid-cols-3 gap-5 mb-5">
          {showWidget('personnelSummary') && (
            <DashboardModuleSummary
              icon={Users}
              title="Personnel · AI summary"
              entries={voiceCommentary?.personnel || []}
              onView={() => onNavigateTab?.('personnel')}
              updatedAt="2:00 PM"
            />
          )}
          {showWidget('materialsSummary') && (
            <DashboardModuleSummary
              icon={Package}
              title="Materials · AI summary"
              entries={voiceCommentary?.materials || []}
              onView={() => onNavigateTab?.('materials')}
              updatedAt="3:15 PM"
            />
          )}
          {showWidget('equipmentSummary') && (
            <DashboardModuleSummary
              icon={Wrench}
              title="Equipment · AI summary"
              entries={voiceCommentary?.equipment || []}
              onView={() => onNavigateTab?.('equipment')}
              updatedAt="2:30 PM"
            />
          )}
        </div>
      )}
      </DraggableSection>

      {/* === Safety & Meetings (toolbox talks + safety briefings) === */}
      <DraggableSection {...sectionProps('toolbox', 'Safety & Meetings')}>
      {showWidget('toolboxTalks') && (toolboxTalks?.length || 0) > 0 && (
        <div className="mb-5">
          <Card
            icon={ShieldCheck}
            title="Safety & Meetings · today"
            updatedAt="12:30 PM"
            updatedBy="Erik Odowd"
            source="VOICE"
            action={
              <div className="flex items-center gap-2">
                <Badge tone="purple">{toolboxTalks.reduce((s,t) => s + t.attendees, 0)} attendees</Badge>
                <button onClick={() => onNavigateTab?.('safety')} className="text-[11px] font-bold text-purple-700 hover:underline">View all →</button>
              </div>
            }>
            <div className="space-y-2.5">
              {toolboxTalks.map(t => {
                const sampleAttendees = (t.attendeeNames || []).map(n => n.split(' ').map(p => p[0]).join('').slice(0,2));
                return (
                  <div key={t.id} className="rounded-xl p-3 bg-white border border-slate-200">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ width: 36, height: 36, backgroundColor: PURPLE_LIGHT }}>
                        <ShieldCheck size={15} style={{ color: PURPLE_DEEP }} strokeWidth={2.2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[13px] font-bold text-slate-900">{t.topic}</span>
                          <Badge tone="purple">{t.attendees} attendees</Badge>
                          <SourcePill aiSource={t.aiSource} />
                        </div>
                        <div className="text-[10.5px] text-slate-500 mb-2">
                          Led by <strong className="text-slate-700">{t.lead}</strong> · {t.time} · {t.durationMin} min
                        </div>

                        {/* Attendee roster */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <div className="flex -space-x-1.5">
                            {sampleAttendees.slice(0, 8).map((s, i) => (
                              <div key={i} className="rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-white" style={{ width: 22, height: 22, backgroundColor: PURPLE_LIGHT, color: PURPLE_DEEP }}>
                                {s}
                              </div>
                            ))}
                            {t.attendees > 8 && (
                              <div className="rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-white bg-slate-100 text-slate-700" style={{ width: 22, height: 22 }}>
                                +{t.attendees - 8}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
      </DraggableSection>

      {/* === Notes (pinned) === */}
      <DraggableSection {...sectionProps('notesAndPhotos', 'Notes')}>
      {showWidget('notesPinned') && (() => {
        const pinnedNotes = (notes || []).filter(n => n.pinned).slice(0, 4);
        return (
          <div className="mb-5">
            <Card icon={StickyNote} title="Notes" action={<button onClick={() => onNavigateTab?.('notes')} className="text-[11px] font-bold text-purple-700 hover:underline">All notes →</button>} updatedAt="2:50 PM" updatedBy="Erik Odowd" source="VOICE">
              <div className="grid grid-cols-2 gap-2.5">
                {pinnedNotes.length === 0 ? (
                  <div className="col-span-2 text-[11px] text-slate-500 italic py-2">No pinned notes — pin important context to keep it surfaced here.</div>
                ) : pinnedNotes.map(n => (
                  <div key={n.id} className="rounded-lg border border-slate-200 p-2.5 hover:bg-slate-50 cursor-pointer" onClick={() => onNavigateTab?.('notes')}>
                    <div className="flex items-start gap-2">
                      <Pin size={11} style={{ color: PURPLE }} className="mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[12px] font-bold text-slate-900 truncate">{n.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{n.body}</div>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className="text-[10px] text-slate-500">{n.author} · {n.date}</span>
                          {n.tags?.slice(0,2).map(t => <span key={t} className="text-[9px] font-bold rounded px-1.5 py-0.5 bg-slate-100 text-slate-600">#{t}</span>)}
                          {(n.attachments?.length || 0) > 0 && (
                            <span className="text-[10px] text-slate-500 flex items-center gap-0.5"><Paperclip size={9} /> {n.attachments.length}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );
      })()}
      </DraggableSection>

      <DraggableSection {...sectionProps('splitColumn', 'Trend chart')}>
      <div className="space-y-5">
        {/* AI Weekly Summary — only shows in Week / Month view per user request */}
        {showWidget('aiWeekly') && (dateView === 'week' || dateView === 'month') && <AIWeeklyCard m={m} onAskAI={onAskAI} />}

        {showWidget('weekTrend') && (
          <Card icon={Activity} title="Crew hours · last 7 days" updatedAt="5:30 PM" updatedBy="Auto · timesheet aggregator">
            <div style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TREND_HOURS}>
                  <defs>
                    <linearGradient id="prosetV2Grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={PURPLE} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={PURPLE} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area dataKey="v" stroke={PURPLE} strokeWidth={2.5} fill="url(#prosetV2Grad)" />
                  <XAxis dataKey="d" tick={{ fontSize: 10, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>
      </DraggableSection>

      <DraggableSection {...sectionProps('dailyLog', 'Tasks Worked On + footer')}>
      {/* === Tasks Worked On (full width) === */}
      <div className="mt-2 mb-3 flex items-baseline justify-between">
        <div>
          <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">Daily Log narrative</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Captured via voice across the day · tap to edit</div>
        </div>
        <Badge tone="purple">all from voice</Badge>
      </div>
      <NarrativeCard icon={ClipboardList} title="Tasks Worked On" text={reportText.tasksWorkedOn} confidence={0.93} capturedAt="7:30 AM"
        attachments={[{ id: 'rep-tw-1', kind: 'photo', label: 'Stairwell box set', placeholder: 'crew' }, { id: 'rep-tw-2', kind: 'photo', label: 'Yard 2 → Yard 3 reshuffle', placeholder: 'truck' }]} />

      {/* === 3-col footer: Inspections / Visitors (V2 — greyed) / Equipment === */}
      {/* Crew Hours card removed — Start / End / Total now sit in the top KPI bar */}
      <div className="grid grid-cols-3 gap-4 mt-5">
        <Card icon={Eye} title="Inspections today" action={<button onClick={goTo('inspections')} className="text-[11px] font-bold text-purple-700">All →</button>} updatedAt="10:15 AM" updatedBy="Erik Odowd" source="VOICE">
          <div className="space-y-2">
            {(inspections || []).map(i => (
              <div key={i.id} className="flex items-start gap-2 py-1.5 border-b border-slate-100 last:border-0">
                <Badge tone={i.status === 'Pass' ? 'green' : 'amber'}>{i.status}</Badge>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-slate-900 truncate">{i.type}</div>
                  <div className="text-[11px] text-slate-600 line-clamp-2">{i.notes}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        {/* Visitors today — V2: visible but disabled, with greyed-out "Sign in visitor" CTA */}
        <div className="rounded-xl bg-white border border-slate-200 overflow-hidden opacity-70 pointer-events-none select-none" title="Visitors capture coming in V2">
          <div className="border-b border-slate-100 bg-slate-50/40 px-4 py-2.5 flex items-center gap-2">
            <IdCard size={15} className="text-slate-500" strokeWidth={2.2} />
            <span className="text-[13px] font-bold text-slate-700">Visitors today</span>
            <Badge tone="slate">V2</Badge>
          </div>
          <div className="p-4 space-y-3">
            <div className="space-y-2">
              {(visitors || []).slice(0, 2).map(v => (
                <div key={v.id} className="flex items-start gap-2">
                  <Avatar initials={v.name.split(' ').map(n => n[0]).join('').slice(0,2)} size="sm" tone="amber" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-slate-700 truncate">{v.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{v.org} · {v.timeIn}–{v.timeOut || 'on site'}</div>
                  </div>
                </div>
              ))}
            </div>
            <button disabled className="w-full rounded-lg border-2 border-dashed border-slate-300 px-3 py-2 text-[11.5px] font-bold text-slate-400 flex items-center justify-center gap-1.5 cursor-not-allowed">
              <Plus size={12} /> Sign in visitor
              <span className="text-[9px] uppercase tracking-wide">V2</span>
            </button>
          </div>
        </div>
        <Card icon={Wrench} title="Equipment today" action={<Badge tone="purple">{fmt$(equipCost)}</Badge>} updatedAt="11:00 AM" updatedBy="Erik Odowd" source="VOICE">
          <div className="space-y-2">
            {equipment.slice(0, 4).map(e => {
              const ranToday = (e.hoursToday || 0) > 0 && e.status === 'ACTIVE';
              return (
                <div key={e.id} className="flex items-start gap-2 py-1 border-b border-slate-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-slate-900 truncate">{e.name}<span className="text-slate-500 font-normal"> × {e.qty}</span></div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock size={9} /> {e.hoursToday ?? 0}h
                      {ranToday && <>· {fmt$((e.dayRate || 0) * e.qty)}</>}
                      {e.status === 'IN_MAINTENANCE' && <span className="text-amber-700 font-bold">· Maint</span>}
                    </div>
                  </div>
                  {e.flag && <Badge tone="red">{e.flag}</Badge>}
                  {e.note && <Badge tone="green">New</Badge>}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
      </DraggableSection>
        </>;
      })()}
      </div>

      {/* Daily Field Report export — Preview PDF + Quick Share (Submit to Client removed) */}
      <div className="mt-6 rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: PURPLE_LIGHT, border: `1px solid #DDD6FE` }}>
        <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40, backgroundColor: PURPLE }}>
          <FileText size={18} className="text-white" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold" style={{ color: PURPLE_DEEP }}>{reportTemplate?.name || 'Daily Field Report'}</div>
          <div className="text-[11px]" style={{ color: PURPLE_DEEP, opacity: 0.85 }}>Auto-generated from {periodLabel.toLowerCase()}'s data</div>
        </div>
        <button onClick={() => onOpenModal && onOpenModal('previewPDF')} className="rounded-lg border-2 border-slate-200 bg-white px-4 py-2 text-[12px] font-bold text-slate-700 flex items-center gap-1.5 hover:bg-slate-50">
          <Eye size={13} /> Preview PDF
        </button>
        <button onClick={() => onOpenModal && onOpenModal('quickShare')} className="rounded-lg text-white px-4 py-2 text-[12px] font-bold flex items-center gap-1.5" style={{ backgroundColor: PURPLE }}>
          <Share2 size={13} /> Quick Share
        </button>
      </div>

      {/* Footer hint about config */}
      <div className="mt-6 text-center">
        <button onClick={onOpenSettings} className="text-[11px] text-slate-500 hover:text-purple-700 font-bold flex items-center gap-1.5 mx-auto">
          <SlidersHorizontal size={11} /> Customize widgets (org-level)
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// DRAGGABLE SECTION — wraps a dashboard section so customize-mode users can
// reorder via grip handle drag-and-drop or up/down arrow buttons.
// ============================================================================
const DraggableSection = ({ id, label, idx, total, customize, onMove, onDragStart, onDragOver, onDrop, dragId, children }) => {
  if (!children || children === false) return null;
  const isDragging = dragId === id;
  return (
    <div
      data-section={id}
      style={{ order: idx }}
      draggable={customize}
      onDragStart={customize ? onDragStart(id) : undefined}
      onDragOver={customize ? onDragOver : undefined}
      onDrop={customize ? onDrop(id) : undefined}
      className={cls('relative', customize && 'rounded-2xl', customize && isDragging && 'opacity-50',
        customize ? 'ring-2 ring-dashed transition-shadow' : '')}
      data-customize={customize ? 'true' : undefined}
    >
      {customize && (
        <div className="absolute -top-2 left-3 z-10 flex items-center gap-1 bg-white rounded-full border border-slate-200 px-2 py-0.5 shadow-sm" style={{ borderColor: PURPLE }}>
          <span className="cursor-move text-[11px] font-bold flex items-center gap-1" style={{ color: PURPLE_DEEP }} title="Drag to reorder">
            <span style={{ fontSize: 12, lineHeight: 1 }}>⠿</span> {label}
          </span>
          <button
            onClick={() => onMove(id, -1)}
            disabled={idx === 0}
            className="rounded p-0.5 hover:bg-slate-100 disabled:opacity-30"
            style={{ color: PURPLE_DEEP }}
            title="Move up"
          ><ChevronUp size={12} /></button>
          <button
            onClick={() => onMove(id, 1)}
            disabled={idx === total - 1}
            className="rounded p-0.5 hover:bg-slate-100 disabled:opacity-30"
            style={{ color: PURPLE_DEEP }}
            title="Move down"
          ><ChevronDown size={12} /></button>
        </div>
      )}
      <div style={{ padding: customize ? 4 : 0 }}>{children}</div>
    </div>
  );
};

// ============================================================================
// AI DAILY SUMMARY HERO — wide hero box with audio playback + transcript
// + activity timeline absorbed inside (replaces Today's site Activity).
// ============================================================================
const AIDailySummaryHero = ({ dateView, periodLabel, compareLabel, m, totalHrs, laborCost, burnToday, equipCost, matCost, onSite, openInc, audio, summaryEntries, onAskAI, showBurn }) => {
  const [playing, setPlaying] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false); // collapsed by default per user feedback
  const heroLabel = dateView === 'week' ? 'Weekly' : dateView === 'month' ? 'Monthly' : 'Daily';
  const showAudio = dateView === 'today' || dateView === 'yesterday'; // audio is per-day capture
  const wave = audio?.waveform || [4,7,11,15,9,6,4,3,5,8,12,16,13,10,7,5];
  const fmtMMSS = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  const activity = [
    { icon: Users,         tone: 'purple', text: `${onSite || 15} workers checked in`,            when: '6:30 AM' },
    { icon: ShieldCheck,   tone: 'green',  text: 'Toolbox talk · fall protection (14 attendees)', when: '6:35 AM' },
    { icon: Truck,         tone: 'green',  text: 'Mods D19/786-2 + 786-3 received',                when: '7:30 AM' },
    { icon: Wrench,        tone: 'green',  text: 'JLG boom lift received (4th on site)',           when: '11:00 AM' },
    { icon: AlertTriangle, tone: 'amber',  text: '786-A2 e-box mod · CO trigger',                  when: '11:30 AM' },
    { icon: AlertOctagon,  tone: 'red',    text: 'Wind shut-down on 10th unit · PM Decision',      when: '4:15 PM' },
  ];
  const tones = { purple: PURPLE_LIGHT, amber: WARN_BG, green: SUCCESS_BG, red: DANGER_BG };
  const colors = { purple: PURPLE_DEEP, amber: '#92400E', green: '#166534', red: '#991B1B' };

  return (
    <div className="rounded-2xl p-5 mb-5" style={{ background: `linear-gradient(135deg, ${PURPLE_LIGHT} 0%, #F5F3FF 100%)`, border: `1px solid #DDD6FE` }}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40, backgroundColor: PURPLE }}>
          <Sparkles size={18} className="text-white" strokeWidth={2.4} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold" style={{ color: PURPLE_DEEP }}>AI {heroLabel} Summary</span>
            <Badge tone="purple">{periodLabel}</Badge>
            <Badge tone="green">live</Badge>
          </div>
          <div className="text-[11px]" style={{ color: PURPLE_DEEP, opacity: 0.75 }}>{compareLabel} · auto-generated from {summaryEntries.length} voice captures</div>
        </div>
        <button onClick={onAskAI} className="rounded-md px-3 py-1.5 text-[11px] font-bold hover:bg-white/60" style={{ color: PURPLE_DEEP }}>
          Ask follow-up →
        </button>
      </div>

      {/* Audio player (today / yesterday only) — visible by default per user request */}
      {showAudio && audio && (
        <div className="rounded-xl bg-white/70 p-3 mb-4 flex items-center gap-3" style={{ border: '1px solid #DDD6FE' }}>
          <button
            onClick={() => setPlaying(p => !p)}
            className="rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-90"
            style={{ width: 36, height: 36, backgroundColor: PURPLE }}
            aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? <Pause size={16} className="text-white" /> : <Play size={16} className="text-white" />}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Volume2 size={12} style={{ color: PURPLE_DEEP }} />
              <span className="text-[11px] font-bold" style={{ color: PURPLE_DEEP }}>{audio.voice}</span>
              <span className="text-[10px]" style={{ color: PURPLE_DEEP, opacity: 0.7 }}>· captured {audio.capturedAt}</span>
            </div>
            <div className="flex items-end gap-[2px] h-6">
              {wave.map((h, i) => (
                <div key={i} className="rounded-sm" style={{
                  width: 3, height: `${Math.max(4, h)}px`,
                  backgroundColor: playing && i < (wave.length * 0.4) ? PURPLE_DEEP : PURPLE,
                  opacity: playing && i < (wave.length * 0.4) ? 1 : 0.55,
                  animation: playing ? `pulseProsetV2 0.8s ${i * 0.04}s ease-in-out infinite alternate` : 'none',
                }} />
              ))}
            </div>
          </div>
          <span className="text-[11px] font-bold flex-shrink-0" style={{ color: PURPLE_DEEP }}>{fmtMMSS(audio.durationSec)}</span>
          <button onClick={() => setTranscriptOpen(o => !o)} className="rounded-md px-2 py-1 text-[11px] font-bold hover:bg-white" style={{ color: PURPLE_DEEP }}>
            {transcriptOpen ? 'Hide transcript' : 'Show transcript'}
          </button>
        </div>
      )}

      {/* Transcript (open by default) */}
      {showAudio && audio && transcriptOpen && (
        <div className="rounded-xl bg-white/60 p-3 mb-4 text-[12.5px] leading-relaxed" style={{ color: PURPLE_DEEP, border: '1px solid #DDD6FE' }}>
          <div className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: PURPLE_DEEP, opacity: 0.75 }}>Transcript</div>
          <div>{audio.transcript}</div>
        </div>
      )}

      {/* Period-aware narrative + activity timeline (KPIs and burn moved to top progress strip) */}
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-2 text-[13px] leading-relaxed flex flex-col justify-between" style={{ color: PURPLE_DEEP }}>
          <div>
            {dateView === 'week'
              ? <><strong>{m?.totalSet || 44} units installed this week</strong> ({m?.setToday || 9} today). On track for current building completion <strong>Friday April 18</strong>. <strong className="text-amber-700">Crane move mid-day cost ~1 hr</strong> due to field condition. <strong className="text-red-700">10th unit shut down for wind</strong> per Owner.</>
              : dateView === 'month'
              ? <><strong>{m?.totalSet || 44} units installed in May</strong>. Crew averaged 248h/week. 3 incidents recorded, 0 OSHA-recordable. Material spend on plan. <strong className="text-amber-700">2 change-order triggers</strong> open for review.</>
              : dateView === 'yesterday'
              ? <><strong>8 units installed yesterday</strong>. Crew of 14 worked 240h. 1 near-miss reported, resolved. JLG boom lift on order, expected today. Owner walkthrough at 3 PM went smoothly.</>
              : <><strong>9 units installed today</strong> (vs 8 yesterday · +12.5%). Crew of 15 logged 248h. Foundation pour east wing started. <strong className="text-amber-700">786-A2 e-box modification</strong> flagged for change-order review. <strong className="text-red-700">10th unit shut down for wind</strong> per Owner.</>
            }
          </div>
        </div>

        {/* Activity timeline (3/5) */}
        <div className="col-span-3 rounded-lg bg-white/70 p-3" style={{ border: '1px solid #DDD6FE' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: PURPLE_DEEP, opacity: 0.85 }}>{periodLabel} site activity</div>
            <Badge tone="purple">all from voice</Badge>
          </div>
          <div className="space-y-1.5">
            {activity.map((a, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="rounded-md flex items-center justify-center flex-shrink-0" style={{ width: 24, height: 24, backgroundColor: tones[a.tone] }}>
                  <a.icon size={12} style={{ color: colors[a.tone] }} strokeWidth={2.2} />
                </div>
                <div className="text-[12px] font-semibold flex-1 min-w-0 truncate" style={{ color: PURPLE_DEEP }}>{a.text}</div>
                <span className="text-[10.5px] flex-shrink-0" style={{ color: PURPLE_DEEP, opacity: 0.7 }}>{a.when}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// DASHBOARD MODULE SUMMARY — compact AI commentary card per module.
// Shows the same voice-captured commentary that lives at top of the sub-tab.
// ============================================================================
const DashboardModuleSummary = ({ icon: Icon, title, entries = [], onView, updatedAt }) => {
  const total = entries.length;
  return (
    <Card icon={Icon} title={title}
      action={
        <div className="flex items-center gap-2">
          <Badge tone="purple">{total} {total === 1 ? 'note' : 'notes'}</Badge>
          {onView && <button onClick={onView} className="text-[11px] font-bold text-purple-700 hover:underline">View →</button>}
        </div>
      }
      updatedAt={updatedAt}
      updatedBy="Erik Odowd"
      source="VOICE">
      {total === 0 ? (
        <div className="text-[11px] text-slate-500 italic py-3 text-center">No voice commentary captured yet for this period.</div>
      ) : (
        <div className="space-y-2.5">
          {entries.slice(0, 3).map(e => (
            <div key={e.id} className="border-b border-slate-100 pb-2 last:border-0 last:pb-0">
              <div className="flex items-start gap-2">
                <Sparkles size={11} style={{ color: PURPLE }} className="mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold leading-snug text-slate-900">{e.summary}</div>
                  <div className="text-[10.5px] italic mt-0.5 text-slate-500 line-clamp-1">{e.quote}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{e.author} · {e.time}</div>
                </div>
              </div>
            </div>
          ))}
          {total > 3 && (
            <button onClick={onView} className="w-full text-[11px] font-bold text-purple-700 pt-1 hover:underline">+{total - 3} more →</button>
          )}
        </div>
      )}
    </Card>
  );
};

const AIWeeklyCard = ({ m, onAskAI }) => (
  <div className="rounded-2xl p-5" style={{ background: `linear-gradient(135deg, ${PURPLE_LIGHT} 0%, #F5F3FF 100%)`, border: `1px solid #DDD6FE` }}>
    <div className="flex items-start gap-3 mb-3">
      <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 36, height: 36, backgroundColor: PURPLE }}>
        <Sparkles size={18} className="text-white" strokeWidth={2.4} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-bold" style={{ color: PURPLE_DEEP }}>AI Weekly Summary</div>
        <div className="text-[11px]" style={{ color: PURPLE_DEEP, opacity: 0.7 }}>Apr 14 – Apr 18 · auto-generated from voice captures</div>
      </div>
      <button onClick={onAskAI} className="text-[11px] font-bold px-3 py-1.5 rounded-md hover:bg-purple-100" style={{ color: PURPLE_DEEP }}>
        Ask follow-up →
      </button>
    </div>
    <div className="text-[13px] leading-relaxed" style={{ color: PURPLE_DEEP }}>
      <strong>{m?.totalSet || 44} units installed this week</strong> ({m?.setToday || 9} today). On track for current building completion <strong>Friday April 18</strong>. <strong className="text-amber-700">Crane move mid-day cost ~1 hr</strong> due to field condition on a stairwell module. <strong className="text-red-700">10th unit shut down for wind</strong> per Owner — weather decision flagged for change-order review. New 4th boom lift received today.
    </div>
    <div className="grid grid-cols-4 gap-3 mt-4 pt-4" style={{ borderTop: '1px solid #DDD6FE' }}>
      {[
        { label: 'Units installed', value: m?.totalSet || 44, trend: '+44'   },
        { label: 'Crew hours',      value: '1.6K',             trend: '+248h' },
        { label: 'Labor cost',      value: fmt$(48400),        trend: '+$48k' },
        { label: 'Open flags',      value: '3 items',          trend: 'review'},
      ].map(x => (
        <div key={x.label}>
          <div className="text-[20px] font-bold" style={{ color: PURPLE_DEEP }}>{x.value}</div>
          <div className="text-[11px]" style={{ color: PURPLE_DEEP, opacity: 0.7 }}>{x.label} <span className="font-semibold ml-1">{x.trend}</span></div>
        </div>
      ))}
    </div>
  </div>
);


// ============================================================================
// DAILY LOG TAB — narrative sections with AI keyword highlighting
// All free-text fields are voice-captured. Edit-in-place.
// ============================================================================
const DailyLogTab = ({ project, personnel, equipment, deliveries, incidents, inspections, visitors, reportText, onAskAI }) => {
  const m = project.modularStats;
  const totalHrs = personnel.reduce((s,p) => s + p.hours, 0);
  return (
    <div>
      <AICapturedBanner count={5} manualCount={0} lastCaptureTime="4:30 PM" onReview={onAskAI} onAskAI={onAskAI} />

      {/* Day header strip — matches V2 visual */}
      <div className="rounded-xl bg-white border border-slate-200 p-4 mb-5 flex items-center gap-5">
        <div>
          <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Work date</div>
          <div className="text-[15px] font-bold text-slate-900 mt-0.5">Wed, April 16, 2025</div>
        </div>
        <div className="border-l border-slate-200 pl-5">
          <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Superintendent</div>
          <div className="text-[15px] font-bold text-slate-900 mt-0.5">{project.superintendent}</div>
        </div>
        <div className="border-l border-slate-200 pl-5">
          <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Weather AM / PM</div>
          <div className="text-[13px] font-semibold text-slate-900 mt-0.5">☀ {project.weather.condAM}</div>
          <div className="text-[13px] font-semibold text-slate-900">🌬 {project.weather.condPM}</div>
        </div>
        <div className="flex-1" />
        <button className="rounded-lg border-2 border-slate-200 px-4 py-2 text-[12px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5">
          <FileSignature size={13} /> Foreman sign-off
        </button>
      </div>

      {/* Modular metrics inline */}
      <div className="grid grid-cols-6 gap-3 mb-5">
        <KPI label="Mods Set Today"    value={m.setToday}   sub="Dorm 19"           icon={Box}        accent />
        <KPI label="Total Mods Set"    value={m.totalSet}   sub={`of ${m.totalSet + m.remaining}`} icon={Layers} />
        <KPI label="Mods Remaining"    value={m.remaining}                          icon={ClipboardList} />
        <KPI label="% of Set Complete" value={`${m.pctComplete}%`}                  icon={Activity}  trend={2} />
        <KPI label="Crew Hours"        value={`${totalHrs.toFixed(0)}h`} sub={`${personnel.length} workers`} icon={Clock} />
        <KPI label="Hours per Mod"     value={(totalHrs / m.setToday).toFixed(1)} sub="lower = better" icon={TrendingDown} />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          {/* Scopes Worked Today */}
          <Card icon={ClipboardCheck} title="Scopes Worked On Today" action={<Badge tone="purple">captured via voice</Badge>}>
            <div className="grid grid-cols-3 gap-2">
              {SCOPES_LIBRARY.map(s => {
                const checked = SCOPES_CHECKED.includes(s);
                return (
                  <button key={s} className={cls('flex items-center gap-2 rounded-lg border-2 p-2.5 text-left transition-colors',
                    checked ? 'border-purple-300 bg-purple-50/40' : 'border-slate-200 hover:bg-slate-50')}>
                    <div className="rounded flex items-center justify-center flex-shrink-0" style={{ width: 18, height: 18, backgroundColor: checked ? PURPLE : 'white', border: checked ? 'none' : `2px solid ${BORDER}` }}>
                      {checked && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className={cls('text-[12px]', checked ? 'font-bold text-purple-900' : 'font-semibold text-slate-700')}>{s}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Tasks worked on — narrative */}
          <NarrativeCard icon={ClipboardList} title="Details of Tasks Worked On" text={reportText.tasksWorkedOn} confidence={0.93} capturedAt="7:30 AM" />

          {/* Problems / Delays — with AI triggers */}
          <NarrativeCard icon={AlertTriangle} title="Problems Encountered / Delays Encountered" text={reportText.problemsDelays} confidence={0.88} capturedAt="11:30 AM"
            triggerNote="AI detected change-order trigger: 'removed the box and cut the wire' — possible scope change."
            triggerAction="Draft Change Order"
            triggerTone="amber" />

          {/* Inspections summary (cross-link to Inspections tab) */}
          <Card icon={Eye} title="Inspections" action={<button className="text-[11px] font-bold text-purple-700">View all in Inspections →</button>}>
            <div className="space-y-2">
              {inspections.map(i => (
                <div key={i.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                  <Badge tone={i.status === 'Pass' ? 'green' : 'amber'}>{i.status}</Badge>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-[12px] font-bold text-slate-900">{i.type}</div>
                      <SourcePill aiSource={i.aiSource} confidence={i.confidence} />
                    </div>
                    <div className="text-[11px] text-slate-700 mt-1">{i.notes}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Safety + Meetings */}
          <NarrativeCard icon={ShieldCheck} title="Safety and Meetings" text={reportText.safetyMeetings} confidence={0.94} capturedAt="2:30 PM" extraBadge={<Badge tone="green">PPE 95%</Badge>} />

          {/* Communications */}
          <NarrativeCard icon={MessageCircle} title="On-Site Communications / Other Notes" text={reportText.communications} confidence={0.91} capturedAt="4:30 PM"
            extraBadge={<Badge tone="red">1 PM Decision</Badge>} />

          {/* Lookahead */}
          <NarrativeCard icon={ArrowRight} title="Lookahead" text={reportText.lookahead} confidence={0.91} capturedAt="4:30 PM" />
        </div>

        {/* Right col 1/3 */}
        <div className="space-y-5">
          <Card icon={Clock} title="Crew Hours">
            <div className="grid grid-cols-2 gap-3">
              <div><div className="text-[10px] text-slate-500 font-semibold">Start</div><div className="text-[16px] font-bold text-slate-900">6:30 AM</div></div>
              <div><div className="text-[10px] text-slate-500 font-semibold">End</div><div className="text-[16px] font-bold text-slate-900">5:30 PM</div></div>
              <div className="col-span-2 border-t border-slate-100 pt-2">
                <div className="text-[10px] text-slate-500 font-semibold">Total · {personnel.length} workers</div>
                <div className="text-[20px] font-bold" style={{ color: PURPLE_DEEP }}>{totalHrs.toFixed(1)}h</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Labor hrs / Mod: <strong>{(totalHrs / m.setToday).toFixed(1)}</strong></div>
              </div>
            </div>
          </Card>

          <Card icon={Truck} title="Equipment Today">
            <div className="space-y-2">
              {equipment.slice(0, 4).map(e => (
                <div key={e.id} className="flex items-start gap-2 py-1.5 border-b border-slate-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <div className="text-[12px] font-bold text-slate-900">{e.name} <span className="text-slate-500 font-normal">× {e.qty}</span></div>
                      <SourcePill aiSource={e.aiSource} confidence={e.confidence} />
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{e.serials.join(', ')}</div>
                  </div>
                  {e.flag && <Badge tone="red">{e.flag}</Badge>}
                  {e.note && <Badge tone="green">New</Badge>}
                </div>
              ))}
            </div>
          </Card>

          <Card icon={IdCard} title="Visitors today">
            {visitors.map(v => (
              <div key={v.id} className="flex items-start gap-2">
                <Avatar initials={v.name.split(' ').map(n => n[0]).join('').slice(0,2)} size="sm" tone="amber" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <div className="text-[12px] font-bold text-slate-900">{v.name}</div>
                    <SourcePill aiSource={v.aiSource} confidence={v.confidence} />
                  </div>
                  <div className="text-[10px] text-slate-500">{v.org} · {v.timeIn}–{v.timeOut || 'on site'}</div>
                  <div className="text-[10px] text-slate-700 mt-1">{v.purpose}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
};

// Reusable narrative card with voice source + AI trigger note
const NarrativeCard = ({ icon: Icon, title, text, confidence, capturedAt, extraBadge, triggerNote, triggerAction, triggerTone = 'amber', attachments }) => {
  const [editing, setEditing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [items, setItems] = useState(attachments || []);
  return (
    <Card icon={Icon} title={title} action={
      <div className="flex items-center gap-2">
        {extraBadge}
        <SourcePill aiSource="VOICE" confidence={confidence} />
        <button onClick={() => setEditing(e => !e)} className="rounded p-1 hover:bg-slate-100 text-slate-400 hover:text-purple-700" title="Edit">
          <Pencil size={13} />
        </button>
      </div>
    }>
      {editing ? (
        <textarea defaultValue={text} className="w-full rounded-lg border border-slate-300 p-3 text-[12px] text-slate-700 leading-relaxed resize-none focus:outline-none focus:border-purple-400" rows={6} autoFocus />
      ) : (
        <div className="text-[12px] text-slate-700 leading-relaxed whitespace-pre-line">{highlightTriggers(text)}</div>
      )}
      <MediaAttachments items={items} onAdd={() => setAddOpen(true)} label="Photos / videos" />
      <div className="text-[10px] text-slate-400 mt-2 italic flex items-center gap-1">
        <Sparkles size={9} /> Captured via voice · {capturedAt}
      </div>
      {triggerNote && (
        <div className="mt-3 rounded-lg p-2.5 flex items-start gap-2" style={{ backgroundColor: triggerTone === 'red' ? DANGER_BG : WARN_BG }}>
          <Sparkles size={13} style={{ color: triggerTone === 'red' ? '#991B1B' : '#92400E' }} className="mt-0.5 flex-shrink-0" />
          <div className="text-[11px]" style={{ color: triggerTone === 'red' ? '#991B1B' : '#92400E' }}>
            <strong>{triggerNote.split(':')[0]}:</strong> {triggerNote.split(':').slice(1).join(':')}
            <button className="underline font-bold ml-1">{triggerAction} →</button>
          </div>
        </div>
      )}
      {addOpen && <AddMediaDialog target={title} onClose={() => setAddOpen(false)} onAdd={(src) => setItems(prev => [...prev, { id: `new-${Date.now()}`, kind: src === 'video' ? 'video' : 'photo', label: `New ${src} capture`, placeholder: 'crew', durationSec: src === 'video' ? 12 : undefined }])} />}
    </Card>
  );
};

// ============================================================================
// PERSONNEL TAB — voice-first table (captured + edit, not "create form")
// ============================================================================
const PersonnelTab = ({ personnel, commentary = [], onAskAI, onOpenModal }) => {
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState('all');
  const filtered = personnel.filter(p =>
    (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.empId.includes(search)) &&
    (scopeFilter === 'all' || p.scopeToday === scopeFilter)
  );
  const totalHrs   = personnel.reduce((s,p) => s + (p.hours || 0), 0);
  const totalCost  = personnel.reduce((s,p) => {
    const reg = Math.min(p.hours || 0, 8);
    const ot  = Math.max(0, (p.hours || 0) - 8);
    return s + reg * p.wageRate + ot * p.wageRate * 1.5;
  }, 0);
  const onSite     = personnel.filter(p => p.checkIn && !p.checkOut).length;
  const otCount    = personnel.filter(p => (p.hours || 0) > 8).length;
  const subs       = personnel.filter(p => p.designation === 'SUBCONTRACTOR').length;
  const aiCount    = personnel.filter(p => p.aiSource === 'VOICE').length;
  const manualCount = personnel.filter(p => p.aiSource === 'MANUAL').length;
  const scopes     = ['all', ...Array.from(new Set(personnel.map(p => p.scopeToday)))];

  return (
    <div>
      <VoiceCommentaryCard entries={commentary} moduleLabel="Personnel" onAskAI={onAskAI} />

      <div className="grid grid-cols-5 gap-3 mb-4">
        <KPI label="On site"      value={onSite}              icon={UserCheck} accent />
        <KPI label="Total hours"  value={fmtHrs(totalHrs)}     icon={Clock} />
        <KPI label="Labor cost"   value={fmt$(totalCost)}     sub="reg + OT × 1.5" icon={DollarSign} accent />
        <KPI label="In OT"        value={otCount}              sub="over 8h" icon={TrendingUp} alert={otCount > 0} />
        <KPI label="Subcontractors" value={subs}               sub="hourly under contract" icon={Briefcase} />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1 max-w-[300px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ID…"
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-purple-300" />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          {scopes.map(s => (
            <button key={s} onClick={() => setScopeFilter(s)}
              className={cls('text-[11px] font-bold px-3 py-1.5 rounded-lg flex-shrink-0', scopeFilter === s ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
              style={{ backgroundColor: scopeFilter === s ? PURPLE : undefined }}>
              {s === 'all' ? 'All scopes' : s}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button onClick={() => onOpenModal('logPersonnel')} className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5">
          <Plus size={12} /> Manual entry
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide px-4 py-3">EE ID</th>
              <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide px-4 py-3">Name</th>
              <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide px-4 py-3">Trade · Type</th>
              <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide px-4 py-3">Scope today</th>
              <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide px-4 py-3">In</th>
              <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide px-4 py-3">Out</th>
              <th className="text-right text-[11px] font-bold text-slate-500 uppercase tracking-wide px-4 py-3">Hours</th>
              <th className="text-right text-[11px] font-bold text-slate-500 uppercase tracking-wide px-4 py-3">Today $</th>
              <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide px-4 py-3">Source</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(p => {
              const reg  = Math.min(p.hours || 0, 8);
              const ot   = Math.max(0, (p.hours || 0) - 8);
              const cost = reg * p.wageRate + ot * p.wageRate * 1.5;
              return (
                <React.Fragment key={p.id}>
                  <tr className="hover:bg-slate-50 group">
                    <td className="px-4 py-2.5 text-[12px] font-mono text-slate-700">{p.empId}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Avatar initials={p.avatar} size="sm" />
                        <div>
                          <div className="text-[13px] font-bold text-slate-900">{p.name}</div>
                          <div className="text-[10px] text-slate-500">{p.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-[12px] text-slate-700">{p.trade}</div>
                      {p.designation === 'SUBCONTRACTOR' && <Badge tone="amber">Sub · hourly</Badge>}
                    </td>
                    <td className="px-4 py-2.5"><Badge tone="purple">{p.scopeToday}</Badge></td>
                    <td className="px-4 py-2.5 text-[12px] text-slate-700">{p.checkIn || '—'}</td>
                    <td className="px-4 py-2.5 text-[12px] text-slate-700">{p.checkOut || '—'}</td>
                    <td className="px-4 py-2.5 text-right text-[13px] font-bold text-slate-900">{p.hours.toFixed(2)}{ot > 0 && <Badge tone="amber">OT</Badge>}</td>
                    <td className="px-4 py-2.5 text-right text-[14px] font-bold" style={{ color: PURPLE_DEEP }}>{fmt$(cost)}</td>
                    <td className="px-4 py-2.5"><SourcePill aiSource={p.aiSource} confidence={p.confidence} /></td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity"><EditPencil /></span>
                    </td>
                  </tr>
                  {p.notes && (
                    <tr className="bg-purple-50/30">
                      <td colSpan={10} className="px-4 pb-2 pt-0">
                        <NotesExcerpt notes={p.notes} compact />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        <div className="bg-slate-50/50 border-t border-slate-200 px-4 py-3 flex items-center">
          <div className="text-[11px] text-slate-600">
            <strong>{filtered.length}</strong> workers · <strong>{filtered.reduce((s,p) => s + p.hours, 0).toFixed(1)}h</strong> total · <strong>{otCount}</strong> in OT
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// DELIVERIES / INCIDENTS / INSPECTIONS / EQUIPMENT — same voice-first pattern
// ============================================================================
const DeliveriesTab = ({ deliveries, commentary = [], matReconciliation = [], onAskAI, onOpenModal }) => {
  const aiCount = deliveries.filter(d => d.aiSource === 'VOICE').length;
  const manualCount = deliveries.filter(d => d.aiSource === 'MANUAL').length;
  return (
    <div>
      <VoiceCommentaryCard entries={commentary} moduleLabel="Deliveries" onAskAI={onAskAI} />
      <div className="grid grid-cols-3 gap-3 mb-4">
        <KPI label="Today"     value={deliveries.length} icon={Truck} />
        <KPI label="Received"  value={deliveries.filter(d => d.status === 'Received').length} sub={fmt$(deliveries.filter(d => d.status === 'Received').reduce((s,d) => s + d.value, 0))} success />
        <KPI label="Damaged"   value={deliveries.filter(d => d.status === 'Damaged').length} alert={deliveries.some(d => d.status === 'Damaged')} icon={AlertTriangle} />
      </div>

      <div className="flex justify-end mb-3">
        <button onClick={() => onOpenModal('logDelivery')} className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5">
          <Plus size={12} /> Manual entry
        </button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              {['Material','Supplier','Qty','PO','Value','Status','Time','Photos','Source',''].map(h => (
                <th key={h} className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {deliveries.map(d => <DeliveryRow key={d.id} d={d} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DeliveryRow = ({ d }) => {
  const [addOpen, setAddOpen] = useState(false);
  const [items, setItems] = useState(d.attachments || []);
  return (
    <>
      <tr className="hover:bg-slate-50 group">
        <td className="px-4 py-3 text-[13px] font-bold text-slate-900">{d.materials}</td>
        <td className="px-4 py-3 text-[12px] text-slate-700">{d.supplier}</td>
        <td className="px-4 py-3 text-[12px] font-bold text-slate-900">{d.quantity} {d.unit}</td>
        <td className="px-4 py-3 text-[12px] text-slate-700">{d.poNumber}</td>
        <td className="px-4 py-3 text-[13px] font-bold" style={{ color: PURPLE_DEEP }}>{fmt$(d.value)}</td>
        <td className="px-4 py-3"><Badge tone={d.status === 'Received' ? 'green' : d.status === 'Damaged' ? 'red' : 'amber'}>{d.status}</Badge></td>
        <td className="px-4 py-3 text-[12px] text-slate-700">{d.date}</td>
        <td className="px-4 py-3">
          <MediaAttachments items={items} onAdd={() => setAddOpen(true)} compact />
          {addOpen && <AddMediaDialog target={d.materials} onClose={() => setAddOpen(false)} onAdd={(src) => setItems(prev => [...prev, { id: `del-new-${Date.now()}`, kind: src === 'video' ? 'video' : 'photo', label: `New ${src}`, placeholder: 'truck', durationSec: src === 'video' ? 10 : undefined }])} />}
        </td>
        <td className="px-4 py-3"><SourcePill aiSource={d.aiSource} confidence={d.confidence} /></td>
        <td className="px-4 py-3 text-right">
          <span className="opacity-0 group-hover:opacity-100"><EditPencil /></span>
        </td>
      </tr>
      {d.notes && (
        <tr className="bg-purple-50/30">
          <td colSpan={10} className="px-4 pb-2 pt-0">
            <NotesExcerpt notes={d.notes} compact />
          </td>
        </tr>
      )}
    </>
  );
};

// Merged: Incidents + Problems & Delays. Each entry is `kind: 'INCIDENT'` (safety / OSHA-flavored)
// or `kind: 'DELAY'` (operational). UI surfaces both consistently with a filter pill row.
const IncidentsDelaysTab = ({ incidents = [], problems = [], reportText, commentary = [], onAskAI, onOpenModal }) => {
  const [filter, setFilter] = useState('all');
  // Normalize: incidents have severity (OSHA), problems have type. Stamp `kind` on each.
  const all = [
    ...incidents.map(i => ({
      ...i,
      kind: 'INCIDENT',
      title: i.name,
      time: i.date,
      changeOrderTrigger: i.flag === 'CHANGE_ORDER_TRIGGER',
      category: 'Safety',
    })),
    ...problems.map(p => ({
      ...p,
      kind: 'DELAY',
      severity: null,
      category: p.type,
    })),
  ];
  const filtered = all.filter(e => filter === 'all' || (filter === 'incidents' && e.kind === 'INCIDENT') || (filter === 'delays' && e.kind === 'DELAY'));
  const openCount = all.filter(e => e.status === 'OPEN').length;
  const totalImpact = all.reduce((s, e) => s + (e.impactHours || 0), 0);
  return (
    <div>
      <VoiceCommentaryCard entries={commentary} moduleLabel="Incidents & Delays" onAskAI={onAskAI} />

      <div className="grid grid-cols-2 gap-3 mb-4">
        <KPI label="Open"           value={openCount}            alert={openCount > 0}    icon={AlertOctagon} accent />
        <KPI label="Schedule impact" value={`${totalImpact.toFixed(1)}h`}                  icon={Clock} alert={totalImpact > 0} />
      </div>

      {/* Filter + Add buttons */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1">
          {[
            { id: 'all',       label: `All · ${all.length}` },
            { id: 'incidents', label: `Incidents · ${incidents.length}` },
            { id: 'delays',    label: `Delays · ${problems.length}` },
          ].map(opt => (
            <button key={opt.id} onClick={() => setFilter(opt.id)}
              className={cls('rounded-md px-2.5 py-1 text-[11px] font-bold', filter === opt.id ? 'text-white' : 'text-slate-600 hover:bg-slate-50')}
              style={{ backgroundColor: filter === opt.id ? PURPLE : undefined }}>
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button onClick={onAskAI} className="rounded-lg text-white px-3 py-2 text-[11px] font-bold flex items-center gap-1.5" style={{ backgroundColor: PURPLE }}>
          <Mic size={12} /> Capture via voice
        </button>
        <button onClick={() => onOpenModal('incident')} className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5">
          <Plus size={12} /> Log incident / delay
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map(e => <IncidentDelayRow key={`${e.kind}-${e.id}`} entry={e} />)}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// OSHA report — generate an OSHA 301 Injury & Illness Incident Report plus the
// matching OSHA 300 Log line from an incident. Recordability is auto-determined
// from severity (SEV_META.osha) and treatment outcome. In production this maps
// to /api/v1/incidents/:id/osha and produces the signed PDF forms.
// ---------------------------------------------------------------------------
const OSHA_ESTABLISHMENT = { company: 'ProSet Modular, LLC', site: `${PROJECTS[0].name} · ${PROJECTS[0].address}` };

// Which OSHA 300 Log classification column (G/H/I/J) a severity maps to.
const OSHA_CLASS_COLS = [
  { id: 'G', label: 'Death',                       sev: ['FATAL'] },
  { id: 'H', label: 'Days away from work',         sev: ['LOST_TIME'] },
  { id: 'I', label: 'Job transfer / restriction',  sev: [] },
  { id: 'J', label: 'Other recordable case',       sev: ['RECORDABLE'] },
];

const oshaCaseNo = (entry) => `PS-${String(entry.id).padStart(4, '0')}`;

const OSHAReportDialog = ({ entry, onClose }) => {
  const [filed, setFiled] = useState(!!entry.reportedToOsha);
  const sev = SEV_META[entry.severity] || {};
  // Recordable if severity is OSHA-flagged, or treatment outcome makes it recordable.
  const recordable = !!sev.osha || (entry.daysLost > 0) || (entry.restrictedDutyDays > 0) || !!entry.sentToMedical;
  const activeCol = entry.restrictedDutyDays > 0 && entry.severity !== 'LOST_TIME' && entry.severity !== 'FATAL'
    ? 'I'
    : (OSHA_CLASS_COLS.find(c => c.sev.includes(entry.severity))?.id || 'J');
  const v = (x, fb = '—') => (x === 0 ? '0' : (x || fb));
  const witnesses = Array.isArray(entry.witnessNames) ? entry.witnessNames.join(', ') : entry.witnessNames;

  const Field = ({ label, children, full }) => (
    <div className={full ? 'col-span-2' : ''}>
      <div className="text-[9.5px] font-bold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="text-[12px] text-slate-800 mt-0.5 leading-snug">{children}</div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col pointer-events-auto max-h-[88vh]" style={{ width: 640 }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg flex items-center justify-center" style={{ width: 34, height: 34, backgroundColor: PURPLE_LIGHT }}>
                <Shield size={17} style={{ color: PURPLE_DEEP }} />
              </div>
              <div>
                <div className="text-[15px] font-bold text-slate-900">OSHA Injury &amp; Illness Report</div>
                <div className="text-[11px] text-slate-500">Case <strong className="text-slate-700">{oshaCaseNo(entry)}</strong> · {entry.title}</div>
              </div>
            </div>
            <button onClick={onClose} className="rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center" style={{ width: 30, height: 30 }}>
              <X size={13} className="text-slate-700" />
            </button>
          </div>

          <div className="overflow-y-auto px-5 py-4 space-y-4">
            {/* Recordability determination */}
            <div className="rounded-xl p-3 flex items-start gap-2.5"
              style={{ backgroundColor: recordable ? WARN_BG : SUCCESS_BG }}>
              {recordable
                ? <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" style={{ color: WARN }} />
                : <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" style={{ color: SUCCESS }} />}
              <div>
                <div className="text-[12px] font-bold" style={{ color: recordable ? WARN : SUCCESS }}>
                  {recordable ? 'OSHA-recordable — must be logged on the OSHA 300 Log' : 'Not OSHA-recordable — internal record only'}
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  {recordable
                    ? `Classified “${sev.label || entry.severity}”. Enter within 7 calendar days on the OSHA 300 Log; complete Form 301 below.`
                    : `“${sev.label || entry.severity}” does not meet the recordable threshold (no medical treatment beyond first aid, no days away/restricted). Documented for internal safety tracking.`}
                </div>
              </div>
            </div>

            {/* OSHA Form 301 */}
            <div className="rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-200 bg-slate-50 rounded-t-xl">
                <FileText size={13} className="text-slate-500" />
                <span className="text-[11px] font-bold text-slate-700">OSHA Form 301 · Injury and Illness Incident Report</span>
              </div>
              <div className="p-3.5 grid grid-cols-2 gap-x-4 gap-y-3">
                <Field label="Establishment">{OSHA_ESTABLISHMENT.company}</Field>
                <Field label="Case number">{oshaCaseNo(entry)}</Field>
                <Field label="Site / location" full>{OSHA_ESTABLISHMENT.site}</Field>
                <Field label="Injured / ill employee">{v(entry.injuredEmployee || entry.firstAidByWhom)}</Field>
                <Field label="Date &amp; time of event">{v(entry.date || entry.time)}{entry.time && entry.date ? ` · ${entry.time}` : ''}</Field>
                <Field label="Where the event occurred" full>{v(entry.location)}</Field>
                <Field label="What was the employee doing before the incident" full>{v(entry.actionTaken)}</Field>
                <Field label="What happened" full>{v(entry.description)}</Field>
                <Field label="Injury / illness &amp; part of body">
                  {sev.label || entry.severity}{entry.bodyPart ? ` — ${entry.bodyPart}` : ''}
                </Field>
                <Field label="Object / substance that harmed">{v(entry.cause || entry.equipmentInvolved)}</Field>
                <Field label="Medical treatment">
                  {entry.sentToMedical ? `Sent to ${v(entry.medicalLocation, 'medical facility')}` : (entry.firstAidByWhom ? `First aid by ${entry.firstAidByWhom}` : 'None beyond first aid')}
                </Field>
                <Field label="Witness(es)">{v(witnesses)}</Field>
                <Field label="Days away from work">{v(entry.daysLost, '0')}</Field>
                <Field label="Restricted / transfer days">{v(entry.restrictedDutyDays, '0')}</Field>
                <Field label="Completed by">{v(entry.reportedBy)}</Field>
                <Field label="Change-order trigger">{entry.changeOrderTrigger ? 'Yes' : 'No'}</Field>
              </div>
            </div>

            {/* OSHA 300 Log line preview */}
            <div className={cls('rounded-xl border', recordable ? 'border-slate-200' : 'border-slate-200 opacity-60')}>
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-200 bg-slate-50 rounded-t-xl">
                <ClipboardList size={13} className="text-slate-500" />
                <span className="text-[11px] font-bold text-slate-700">OSHA Form 300 · Log line entry</span>
              </div>
              <div className="p-3.5">
                <div className="flex items-start gap-4 mb-3">
                  <div className="min-w-0">
                    <div className="text-[9.5px] font-bold uppercase tracking-wide text-slate-400">Case / Employee / Job title</div>
                    <div className="text-[12px] text-slate-800 mt-0.5">{oshaCaseNo(entry)} · {v(entry.injuredEmployee || entry.firstAidByWhom)} · {v(entry.jobTitle, 'Field crew')}</div>
                  </div>
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wide text-slate-400">Date</div>
                    <div className="text-[12px] text-slate-800 mt-0.5">{v(entry.date || entry.time)}</div>
                  </div>
                </div>
                {/* Classification columns G–J */}
                <div className="text-[9.5px] font-bold uppercase tracking-wide text-slate-400 mb-1.5">Classify the case (check the most serious outcome)</div>
                <div className="grid grid-cols-4 gap-2">
                  {OSHA_CLASS_COLS.map(c => {
                    const on = recordable && c.id === activeCol;
                    return (
                      <div key={c.id} className={cls('rounded-lg border p-2 text-center', on ? 'border-transparent' : 'border-slate-200')}
                        style={on ? { backgroundColor: PURPLE_LIGHT } : undefined}>
                        <div className="flex items-center justify-center mb-1">
                          <div className={cls('rounded flex items-center justify-center', on ? '' : 'border border-slate-300')} style={{ width: 16, height: 16, backgroundColor: on ? PURPLE : undefined }}>
                            {on && <Check size={11} className="text-white" />}
                          </div>
                        </div>
                        <div className="text-[9px] font-semibold text-slate-500">({c.id})</div>
                        <div className={cls('text-[10px] leading-tight', on ? 'font-bold text-slate-900' : 'text-slate-500')}>{c.label}</div>
                      </div>
                    );
                  })}
                </div>
                {!recordable && <div className="text-[10.5px] text-slate-500 mt-2.5">Not added to the 300 Log — case is below the recordable threshold.</div>}
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="px-5 py-3 border-t border-slate-200 flex items-center gap-2">
            <div className="text-[10.5px] text-slate-500 flex items-center gap-1.5 flex-1">
              <Info size={11} className="flex-shrink-0" />
              {filed ? <span className="font-bold" style={{ color: SUCCESS }}>Recorded to OSHA log · {oshaCaseNo(entry)}</span> : <span>Pre-filled from the captured incident. Review before filing.</span>}
            </div>
            <button className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5">
              <Download size={12} /> 301 PDF
            </button>
            <button
              disabled={!recordable || filed}
              onClick={() => setFiled(true)}
              className="rounded-lg text-white px-3 py-2 text-[11px] font-bold flex items-center gap-1.5 disabled:bg-slate-300 disabled:cursor-not-allowed"
              style={{ backgroundColor: (!recordable || filed) ? undefined : PURPLE }}>
              {filed ? <><Check size={12} /> Added to 300 Log</> : <><FileSignature size={12} /> Add to OSHA 300 Log</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const IncidentDelayRow = ({ entry }) => {
  const [addOpen, setAddOpen] = useState(false);
  const [oshaOpen, setOshaOpen] = useState(false);
  const [items, setItems] = useState(entry.attachments || []);
  const isIncident = entry.kind === 'INCIDENT';
  const oshaRecordable = isIncident && (SEV_META[entry.severity]?.osha || entry.daysLost > 0 || entry.restrictedDutyDays > 0 || entry.sentToMedical);
  return (
    <Card>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <Badge tone={isIncident ? 'red' : 'amber'}>{isIncident ? '⚠ Incident' : '⏱ Delay'}</Badge>
        {isIncident && entry.severity && <Badge tone="slate">{SEV_META[entry.severity]?.label || entry.severity}</Badge>}
        {!isIncident && entry.category && <Badge tone="slate">{entry.category}</Badge>}
        <Badge tone={entry.status === 'OPEN' ? 'amber' : 'green'}>{entry.status}</Badge>
        {oshaRecordable && <Badge tone="amber">🛡 OSHA recordable</Badge>}
        {entry.reportedToOsha && <Badge tone="green">✓ Reported to OSHA</Badge>}
        {entry.changeOrderTrigger && <Badge tone="amber">⚡ Change-order trigger</Badge>}
        <SourcePill aiSource={entry.aiSource} confidence={entry.confidence} />
        <span className="text-[11px] text-slate-500 ml-auto">{entry.time} · by {entry.reportedBy}</span>
        <EditPencil />
      </div>
      <div className="text-[14px] font-bold text-slate-900 mb-1">{entry.title}</div>
      <div className="text-[12px] text-slate-700 leading-relaxed">{highlightTriggers(entry.description)}</div>
      {entry.actionTaken && (
        <div className="mt-2 rounded-lg p-2 text-[11px]" style={{ backgroundColor: INFO_BG, color: '#1E40AF' }}>
          <strong>Action taken:</strong> {entry.actionTaken}
        </div>
      )}
      {(entry.impactHours > 0 || entry.costImpact > 0) && (
        <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-600">
          {entry.impactHours > 0 && <span className="flex items-center gap-1"><Clock size={10} /> Schedule impact: <strong className="text-slate-900">{entry.impactHours}h</strong></span>}
          {entry.costImpact > 0 && <span className="flex items-center gap-1"><DollarSign size={10} /> Cost impact: <strong className="text-slate-900">{fmt$(entry.costImpact)}</strong></span>}
        </div>
      )}
      <NotesExcerpt notes={entry.notes} />
      <MediaAttachments items={items} onAdd={() => setAddOpen(true)} label="Photo / video evidence" />
      {isIncident && (
        <div className="mt-2.5 flex items-center gap-2">
          <button onClick={() => setOshaOpen(true)}
            className="rounded-lg border px-3 py-1.5 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
            style={oshaRecordable
              ? { backgroundColor: WARN_BG, borderColor: 'transparent', color: WARN }
              : { borderColor: '#E2E8F0', color: '#475569' }}>
            <Shield size={12} /> Generate OSHA report
          </button>
          {oshaRecordable && <span className="text-[10.5px] text-slate-500">Recordable — 300 Log entry required</span>}
        </div>
      )}
      {addOpen && <AddMediaDialog target={entry.title} onClose={() => setAddOpen(false)} onAdd={(src) => setItems(prev => [...prev, { id: `id-new-${Date.now()}`, kind: src === 'video' ? 'video' : 'photo', label: `New ${src}`, placeholder: 'ebox-after', durationSec: src === 'video' ? 15 : undefined }])} />}
      {oshaOpen && <OSHAReportDialog entry={entry} onClose={() => setOshaOpen(false)} />}
    </Card>
  );
};

const InspectionsTab = ({ inspections, onAskAI, onOpenModal }) => {
  const aiCount = inspections.filter(i => i.aiSource === 'VOICE').length;
  const manualCount = inspections.filter(i => i.aiSource === 'MANUAL').length;
  return (
    <div>
      <AICapturedBanner count={aiCount} manualCount={manualCount} lastCaptureTime="10:15 AM" onReview={onAskAI} onAskAI={onAskAI} />
      <div className="grid grid-cols-4 gap-3 mb-4">
        <KPI label="Today"             value={inspections.length} icon={Eye} />
        <KPI label="Pass"              value={inspections.filter(i => i.status === 'Pass').length} success />
        <KPI label="Pass with notes"   value={inspections.filter(i => i.status === 'Pass with notes').length} icon={Info} />
        <KPI label="Fail / Re-inspect" value={inspections.filter(i => i.status === 'Fail' || i.status === 'Re-inspect').length} alert={inspections.some(i => i.status === 'Fail')} />
      </div>
      <div className="flex justify-end mb-3">
        <button onClick={() => onOpenModal('inspection')} className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5">
          <Plus size={12} /> Manual entry
        </button>
      </div>
      <div className="space-y-3">
        {inspections.map(i => <InspectionRow key={i.id} insp={i} />)}
      </div>
    </div>
  );
};

const InspectionRow = ({ insp }) => {
  const [addOpen, setAddOpen] = useState(false);
  const [items, setItems] = useState(insp.attachments || []);
  return (
    <Card>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <Badge tone={insp.status === 'Pass' ? 'green' : 'amber'}>{insp.status}</Badge>
        <SourcePill aiSource={insp.aiSource} confidence={insp.confidence} />
        <span className="text-[11px] text-slate-500 ml-auto">{insp.date} · by {insp.inspector}</span>
        <EditPencil />
      </div>
      <div className="text-[14px] font-bold text-slate-900 mb-1">{insp.type}</div>
      <NotesExcerpt notes={insp.notes} compact />
      <MediaAttachments items={items} onAdd={() => setAddOpen(true)} label="Inspection photos" />
      {addOpen && <AddMediaDialog target={insp.type} onClose={() => setAddOpen(false)} onAdd={(src) => setItems(prev => [...prev, { id: `ins-new-${Date.now()}`, kind: src === 'video' ? 'video' : 'photo', label: `New ${src}`, placeholder: 'check', durationSec: src === 'video' ? 12 : undefined }])} />}
    </Card>
  );
};

const EquipmentTab = ({ equipment, commentary = [], matReconciliation = [], onAskAI, onOpenModal }) => {
  const aiCount = equipment.filter(e => e.aiSource === 'VOICE').length;
  const manualCount = equipment.filter(e => e.aiSource === 'MANUAL').length;
  const equipRows = matReconciliation.filter(r => r.unit === 'units'); // equipment-classed rows
  return (
    <div>
      <VoiceCommentaryCard entries={commentary} moduleLabel="Equipment" onAskAI={onAskAI} />
      <div className="grid grid-cols-4 gap-3 mb-4">
        <KPI label="Active types"    value={equipment.filter(e => e.status === 'ACTIVE').length} icon={Wrench} accent />
        <KPI label="Total units"     value={equipment.reduce((s,e) => s + e.qty, 0)} icon={Layers} />
        <KPI label="Hours today"     value={fmtHrs(equipment.reduce((s,e) => s + e.hoursToday, 0))} icon={Clock} />
        <KPI label="In maintenance"  value={equipment.filter(e => e.status === 'IN_MAINTENANCE').length} alert={equipment.some(e => e.status === 'IN_MAINTENANCE')} icon={AlertTriangle} />
      </div>

      <div className="flex justify-end mb-3">
        <button onClick={() => onOpenModal('logEquipment')} className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5">
          <Plus size={12} /> Manual entry
        </button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              {['Equipment','Type','Qty','Serial Numbers','Hours today','Day rate','Status','Source','Note'].map(h => (
                <th key={h} className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {equipment.map(e => (
              <React.Fragment key={e.id}>
                <tr className="hover:bg-slate-50 group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-lg flex items-center justify-center" style={{ width: 32, height: 32, backgroundColor: PURPLE_LIGHT }}>
                        <Wrench size={14} style={{ color: PURPLE_DEEP }} />
                      </div>
                      <div className="text-[13px] font-bold text-slate-900">{e.name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-slate-700">{e.type}</td>
                  <td className="px-4 py-3 text-[13px] font-bold text-slate-900">{e.qty}</td>
                  <td className="px-4 py-3 text-[11px] font-mono text-slate-600">{e.serials.join(', ')}</td>
                  <td className="px-4 py-3 text-[12px] font-bold text-slate-900">{fmtHrs(e.hoursToday)}</td>
                  <td className="px-4 py-3 text-[12px] text-slate-700">{fmt$(e.dayRate)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={e.status === 'ACTIVE' ? 'green' : e.status === 'IN_MAINTENANCE' ? 'red' : 'slate'}>{e.status === 'IN_MAINTENANCE' ? 'Maintenance' : e.status === 'ACTIVE' ? 'Active' : 'Idle'}</Badge>
                  </td>
                  <td className="px-4 py-3"><SourcePill aiSource={e.aiSource} confidence={e.confidence} /></td>
                  <td className="px-4 py-3 text-[11px]">
                    {e.flag && <Badge tone="red">{e.flag}</Badge>}
                    {e.note && <span className="text-green-700 font-semibold">{e.note}</span>}
                  </td>
                </tr>
                {e.notes && (
                  <tr className="bg-purple-50/30">
                    <td colSpan={9} className="px-4 pb-2 pt-0">
                      <NotesExcerpt notes={e.notes} compact />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================================
// RECEIVED-VS-NEEDED RECONCILIATION — adjustable rows used inside Deliveries
// and Equipment tabs. Each row's "needed" count is editable inline.
// ============================================================================
const ReceivedVsNeededCard = ({ rows, title, hint }) => {
  const [needed, setNeeded] = useState(() => Object.fromEntries(rows.map(r => [r.id, r.needed])));
  const adjust = (id, delta) => setNeeded(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));
  const setVal = (id, val) => setNeeded(prev => ({ ...prev, [id]: Math.max(0, parseInt(val, 10) || 0) }));
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50/60">
        <Package size={15} className="text-slate-700" strokeWidth={2.2} />
        <span className="text-[13px] font-bold text-slate-900">{title}</span>
        <Badge tone="purple">live · adjust as scope changes</Badge>
      </div>
      <div className="p-4 space-y-3">
        {rows.map(r => {
          const need = needed[r.id] ?? r.needed;
          const pct = need > 0 ? Math.min(100, (r.received / need) * 100) : 100;
          const variance = r.received - need;
          const isShort = variance < 0;
          const isExcess = variance > 0;
          const barColor = isShort ? '#DC2626' : (r.status === 'damaged' ? '#F59E0B' : '#10B981');
          return (
            <div key={r.id}>
              <div className="flex items-center gap-3 mb-1.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold text-slate-900">{r.item}</span>
                    {isShort && <Badge tone="red">SHORT {variance}</Badge>}
                    {isExcess && <Badge tone="amber">EXCESS +{variance}</Badge>}
                    {!isShort && !isExcess && r.status !== 'damaged' && <Badge tone="green">OK</Badge>}
                    {r.status === 'damaged' && <Badge tone="amber">DMG</Badge>}
                  </div>
                  {r.note && <div className="text-[10.5px] text-slate-500 italic mt-0.5">{r.note}</div>}
                </div>
                <div className="text-[12px] font-bold text-slate-700 flex-shrink-0">{r.received} <span className="text-slate-400 font-normal">received</span></div>
                <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-1 flex-shrink-0">
                  <button onClick={() => adjust(r.id, -1)} className="rounded px-1.5 py-0.5 hover:bg-white text-slate-600">−</button>
                  <input
                    value={need}
                    onChange={(e) => setVal(r.id, e.target.value)}
                    className="w-12 text-center text-[12px] font-bold bg-transparent focus:outline-none"
                    aria-label={`needed ${r.item}`}
                  />
                  <button onClick={() => adjust(r.id, 1)} className="rounded px-1.5 py-0.5 hover:bg-white text-slate-600">+</button>
                </div>
                <div className="text-[10.5px] text-slate-500 flex-shrink-0">needed {r.unit}</div>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColor }} />
              </div>
            </div>
          );
        })}
      </div>
      {hint && (
        <div className="px-4 py-2 bg-slate-50/60 border-t border-slate-100 text-[10.5px] text-slate-500 flex items-center gap-1.5">
          <Sparkles size={11} style={{ color: PURPLE }} /> {hint}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// TOOLBOX TALKS TAB — proactive safety briefing log with attendance signatures
// (closes the gap from PROSET PDF)
// ============================================================================
// ============================================================================
// VOICE COMMENTARY CARD — captures free-form voice notes that didn't map to a
// structured entry. Lives at the top of each module sub-tab, mirroring the way
// Safety/Communications get a summary even without a formal incident.
// ============================================================================
const VoiceCommentaryCard = ({ entries = [], moduleLabel, onAskAI }) => {
  if (!entries || entries.length === 0) return null;
  return (
    <div className="rounded-xl mb-4 overflow-hidden" style={{ background: `linear-gradient(135deg, ${PURPLE_LIGHT} 0%, #F5F3FF 100%)`, border: `1px solid #DDD6FE` }}>
      <div className="px-4 py-3 flex items-center gap-2.5 border-b" style={{ borderColor: '#DDD6FE' }}>
        <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 28, height: 28, backgroundColor: PURPLE }}>
          <Sparkles size={13} className="text-white" strokeWidth={2.4} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold" style={{ color: PURPLE_DEEP }}>{moduleLabel} commentary · today</div>
          <div className="text-[10.5px]" style={{ color: PURPLE_DEEP, opacity: 0.75 }}>Voice captures that weren't logged as structured entries · AI summarized + routed here</div>
        </div>
        <Badge tone="purple">{entries.length} {entries.length === 1 ? 'note' : 'notes'}</Badge>
        <button onClick={onAskAI} className="rounded-md px-2.5 py-1.5 text-[11px] font-bold flex items-center gap-1.5" style={{ color: 'white', backgroundColor: PURPLE }}>
          <Mic size={11} /> Add commentary
        </button>
      </div>
      <div className="divide-y" style={{ borderColor: '#DDD6FE' }}>
        {entries.map(e => (
          <div key={e.id} className="px-4 py-2.5 flex items-start gap-3 hover:bg-white/40">
            <Avatar initials={e.avatar} size="xs" />
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold leading-snug" style={{ color: PURPLE_DEEP }}>{e.summary}</div>
              <div className="text-[11px] italic mt-0.5" style={{ color: PURPLE_DEEP, opacity: 0.7 }}>{e.quote}</div>
              <div className="text-[10px] mt-1" style={{ color: PURPLE_DEEP, opacity: 0.6 }}>{e.author} · {e.time}</div>
            </div>
            <SourcePill aiSource="VOICE" />
            <EditPencil />
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// MATERIALS TAB — counterpart to Equipment. Tracks materials by line item with
// received-vs-needed reconciliation, PO links, and voice commentary.
// ============================================================================
const MaterialsTab = ({ materials = [], commentary = [], matReconciliation = [], onAskAI, onOpenModal }) => {
  const aiCount = materials.filter(m => m.aiSource === 'VOICE').length;
  const manualCount = materials.filter(m => m.aiSource === 'MANUAL').length;
  const matRows = matReconciliation.filter(r => r.unit !== 'units');
  const totalValue = materials.reduce((s, m) => s + (m.value || 0), 0);
  const shortCount = materials.filter(m => m.status === 'short').length;
  const damagedCount = materials.filter(m => m.status === 'damaged').length;
  const pendingCount = materials.filter(m => m.status === 'pending').length;
  return (
    <div>
      <VoiceCommentaryCard entries={commentary} moduleLabel="Materials" onAskAI={onAskAI} />
      <div className="grid grid-cols-4 gap-3 mb-4">
        <KPI label="Line items"        value={materials.length}                            icon={Package} accent />
        <KPI label="Received value"    value={fmt$(totalValue)}                            icon={DollarSign} />
        <KPI label="Short / pending"   value={shortCount + pendingCount}  alert={shortCount > 0} icon={AlertTriangle} sub={`${shortCount} short · ${pendingCount} pending`} />
        <KPI label="Damaged"           value={damagedCount} alert={damagedCount > 0} icon={AlertCircle} />
      </div>

      <div className="flex justify-end mb-3 gap-2">
        <button onClick={onAskAI} className="rounded-lg text-white px-3 py-2 text-[11px] font-bold flex items-center gap-1.5" style={{ backgroundColor: PURPLE }}>
          <Mic size={12} /> Capture material via voice
        </button>
        <button onClick={() => onOpenModal('logMaterial')} className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5">
          <Plus size={12} /> Manual entry
        </button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              {['Material','Category','Received','Needed','Variance','Value','Status','PO','Source'].map(h => (
                <th key={h} className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {materials.map(m => {
              const variance = m.received - m.needed;
              return (
                <React.Fragment key={m.id}>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="text-[13px] font-bold text-slate-900">{m.name}</div>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-slate-700">{m.category}</td>
                    <td className="px-4 py-3 text-[13px] font-bold text-slate-900">{m.received} {m.unit}</td>
                    <td className="px-4 py-3 text-[12px] text-slate-700">{m.needed} {m.unit}</td>
                    <td className="px-4 py-3">
                      {variance < 0 ? <Badge tone="red">SHORT {variance}</Badge>
                        : variance > 0 ? <Badge tone="amber">EXCESS +{variance}</Badge>
                        : <Badge tone="green">OK</Badge>}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-bold" style={{ color: PURPLE_DEEP }}>{fmt$(m.value)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={m.status === 'ok' ? 'green' : m.status === 'damaged' ? 'amber' : m.status === 'pending' ? 'slate' : 'red'}>{m.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-slate-700 font-mono">{m.poNumber}</td>
                    <td className="px-4 py-3"><SourcePill aiSource={m.aiSource} /></td>
                  </tr>
                  {(m.notes || m.note) && (
                    <tr className="bg-purple-50/30">
                      <td colSpan={9} className="px-4 pb-2 pt-0">
                        <NotesExcerpt notes={m.notes || m.note} compact />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SafetyMeetingsTab = ({ toolboxTalks = [], reportText, onAskAI, onOpenModal }) => {
  const totalAttendees = toolboxTalks.reduce((s, t) => s + t.attendees, 0);
  const totalDuration = toolboxTalks.reduce((s, t) => s + t.durationMin, 0);
  return (
    <div>
      {/* Daily safety narrative — auto-summarized from voice; merges old "Safety and Meetings" */}
      {reportText?.safetyMeetings && (
        <div className="rounded-xl mb-4 overflow-hidden" style={{ background: `linear-gradient(135deg, ${PURPLE_LIGHT} 0%, #F5F3FF 100%)`, border: `1px solid #DDD6FE` }}>
          <div className="px-4 py-3 flex items-center gap-2.5 border-b" style={{ borderColor: '#DDD6FE' }}>
            <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 28, height: 28, backgroundColor: PURPLE }}>
              <Sparkles size={13} className="text-white" strokeWidth={2.4} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold" style={{ color: PURPLE_DEEP }}>Safety narrative · today</div>
              <div className="text-[10.5px]" style={{ color: PURPLE_DEEP, opacity: 0.75 }}>AI summary of safety observations + meeting takeaways</div>
            </div>
            <Badge tone="green">PPE 95%</Badge>
            <SourcePill aiSource="VOICE" />
          </div>
          <div className="px-4 py-3 text-[12px] leading-relaxed whitespace-pre-line" style={{ color: PURPLE_DEEP }}>
            {highlightTriggers(reportText.safetyMeetings)}
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3 mb-4">
        <KPI label="Talks today"        value={toolboxTalks.length}                                        icon={ShieldCheck} accent />
        <KPI label="Total attendees"     value={totalAttendees}                                              icon={Users} />
        <KPI label="Avg duration"        value={`${Math.round(totalDuration / Math.max(1, toolboxTalks.length))}m`} icon={Clock} />
        <KPI label="Total time"          value={`${totalDuration}m`}                                         icon={Activity} />
      </div>
      <div className="flex justify-end mb-3 gap-2">
        <button onClick={onAskAI} className="rounded-lg text-white px-3 py-2 text-[11px] font-bold flex items-center gap-1.5" style={{ backgroundColor: PURPLE }}>
          <Mic size={12} /> Capture via voice
        </button>
        <button onClick={() => onOpenModal('logSafetyMeeting')} className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5">
          <Plus size={12} /> Add meeting / talk
        </button>
      </div>
      <div className="space-y-3">
        {toolboxTalks.map(t => (
          <ToolboxTalkRow key={t.id} talk={t} />
        ))}
      </div>
    </div>
  );
};

const ToolboxTalkRow = ({ talk }) => {
  const [expanded, setExpanded] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [items, setItems] = useState(talk.attachments || []);
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-start gap-3 p-4 cursor-pointer hover:bg-slate-50" onClick={() => setExpanded(e => !e)}>
        <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ width: 36, height: 36, backgroundColor: PURPLE_LIGHT }}>
          <ShieldCheck size={16} style={{ color: PURPLE_DEEP }} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-[14px] font-bold text-slate-900">{talk.topic}</span>
            <Badge tone="purple">{talk.attendees} attendees</Badge>
            <Badge tone="slate">{talk.durationMin} min</Badge>
            <SourcePill aiSource={talk.aiSource} />
          </div>
          <div className="text-[11px] text-slate-500">Led by <strong className="text-slate-700">{talk.lead}</strong> · {talk.time}</div>
          <NotesExcerpt notes={talk.notes} compact />
        </div>
        {items.length > 0 && (
          <div className="flex -space-x-1 flex-shrink-0 mr-1" onClick={(e) => e.stopPropagation()}>
            {items.slice(0, 3).map((it, i) => (
              <MediaThumb key={it.id} att={it} size={28} onClick={() => setExpanded(true)} />
            ))}
            {items.length > 3 && <span className="text-[10px] font-bold text-slate-500 self-center pl-2">+{items.length - 3}</span>}
          </div>
        )}
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>
      {expanded && (
        <div className="border-t border-slate-100 p-4 bg-slate-50/40">
          <div className="text-[12px] font-bold text-slate-700 mb-2">Attendees · {talk.attendees}</div>
          <div className="grid grid-cols-4 gap-2">
            {(talk.attendeeNames || []).map((name, i) => (
              <div key={i} className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1.5">
                <Avatar initials={name.split(' ').map(p => p[0]).join('').slice(0,2)} size="xs" />
                <span className="text-[11px] font-semibold text-slate-700 truncate">{name}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-200">
            <MediaAttachments items={items} onAdd={() => setAddOpen(true)} label="Photos / videos" />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50">Edit attendees</button>
            <button className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50">Export PDF</button>
          </div>
        </div>
      )}
      {addOpen && <AddMediaDialog target={talk.topic} onClose={() => setAddOpen(false)} onAdd={(src) => setItems(prev => [...prev, { id: `tbt-new-${Date.now()}`, kind: src === 'video' ? 'video' : 'photo', label: `New ${src}`, placeholder: 'crew', durationSec: src === 'video' ? 12 : undefined }])} />}
    </div>
  );
};

// ============================================================================
// NOTES TAB — voice + manual notes, pinnable, taggable, media-attachable.
// ============================================================================
const NotesTab = ({ notes = [], onAskAI, onOpenModal }) => {
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags || [])));
  const filtered = notes.filter(n =>
    (!search || n.title.toLowerCase().includes(search.toLowerCase()) || n.body.toLowerCase().includes(search.toLowerCase())) &&
    (tagFilter === 'all' || (n.tags || []).includes(tagFilter))
  );
  const pinned = filtered.filter(n => n.pinned);
  const others = filtered.filter(n => !n.pinned);
  const aiCount = notes.filter(n => n.aiSource === 'VOICE').length;
  const manualCount = notes.filter(n => n.aiSource === 'MANUAL').length;
  return (
    <div>
      <AICapturedBanner count={aiCount} manualCount={manualCount} lastCaptureTime="2:50 PM" onReview={onAskAI} onAskAI={onAskAI} />
      <div className="grid grid-cols-4 gap-3 mb-4">
        <KPI label="Notes today"   value={notes.length}                          icon={StickyNote} accent />
        <KPI label="Pinned"        value={notes.filter(n => n.pinned).length}    icon={Pin} />
        <KPI label="With media"    value={notes.filter(n => (n.attachments?.length || 0) > 0).length} icon={Paperclip} />
        <KPI label="Tags"          value={allTags.length}                        icon={Hash} />
      </div>
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes by title, body, or tag…"
            className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-2 text-[12px] focus:outline-none focus:border-purple-400" />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
          <button onClick={() => setTagFilter('all')} className={cls('rounded-md px-2.5 py-1 text-[11px] font-bold', tagFilter === 'all' ? 'text-white' : 'text-slate-600 hover:bg-slate-50')} style={{ backgroundColor: tagFilter === 'all' ? PURPLE : undefined }}>All</button>
          {allTags.map(t => (
            <button key={t} onClick={() => setTagFilter(t)} className={cls('rounded-md px-2.5 py-1 text-[11px] font-bold flex items-center gap-0.5', tagFilter === t ? 'text-white' : 'text-slate-600 hover:bg-slate-50')} style={{ backgroundColor: tagFilter === t ? PURPLE : undefined }}>
              <Hash size={10} />{t}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button onClick={onAskAI} className="rounded-lg text-white px-3 py-2 text-[11px] font-bold flex items-center gap-1.5" style={{ backgroundColor: PURPLE }}>
          <Mic size={12} /> Capture note via voice
        </button>
        <button onClick={() => onOpenModal('logNote')} className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5">
          <Plus size={12} /> New note
        </button>
      </div>
      {pinned.length > 0 && (
        <div className="mb-5">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Pin size={11} style={{ color: PURPLE }} /> Pinned
          </div>
          <div className="grid grid-cols-2 gap-3">
            {pinned.map(n => <NoteCard key={n.id} note={n} />)}
          </div>
        </div>
      )}
      {others.length > 0 && (
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">All notes</div>
          <div className="grid grid-cols-2 gap-3">
            {others.map(n => <NoteCard key={n.id} note={n} />)}
          </div>
        </div>
      )}
      {filtered.length === 0 && (
        <div className="rounded-xl bg-white border border-slate-200 p-12 text-center">
          <StickyNote size={32} className="mx-auto text-slate-300 mb-3" />
          <div className="text-[14px] font-bold text-slate-900 mb-1">No notes match</div>
          <div className="text-[11px] text-slate-500">Try a different search or tag — or capture a new one via voice.</div>
        </div>
      )}
    </div>
  );
};

const NoteCard = ({ note }) => {
  const [pinned, setPinned] = useState(note.pinned);
  const [addOpen, setAddOpen] = useState(false);
  const [items, setItems] = useState(note.attachments || []);
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-2 mb-1.5">
        <Avatar initials={note.avatar} size="xs" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-slate-900 flex-1 min-w-0 truncate">{note.title}</span>
            <button onClick={() => setPinned(p => !p)} className="rounded p-1 hover:bg-slate-100" title={pinned ? 'Unpin' : 'Pin'}>
              <Pin size={12} style={{ color: pinned ? PURPLE : '#94A3B8', fill: pinned ? PURPLE : 'none' }} />
            </button>
            <SourcePill aiSource={note.aiSource} />
            <EditPencil />
          </div>
          <div className="text-[10.5px] text-slate-500">{note.author} · {note.date}</div>
        </div>
      </div>
      <div className="text-[12px] text-slate-700 leading-relaxed whitespace-pre-line">{note.body}</div>
      <MediaAttachments items={items} onAdd={() => setAddOpen(true)} compact label="" showAddByDefault={false} />
      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
        {(note.tags || []).map(t => (
          <span key={t} className="text-[10px] font-bold rounded px-1.5 py-0.5 bg-slate-100 text-slate-600 flex items-center gap-0.5">
            <Hash size={9} />{t}
          </span>
        ))}
        <div className="flex-1" />
        <button onClick={() => setAddOpen(true)} className="text-[10.5px] font-bold text-slate-500 hover:text-purple-700 flex items-center gap-0.5">
          <Camera size={10} /> Attach
        </button>
      </div>
      {addOpen && <AddMediaDialog target={note.title} onClose={() => setAddOpen(false)} onAdd={(src) => setItems(prev => [...prev, { id: `note-new-${Date.now()}`, kind: src === 'video' ? 'video' : 'photo', label: `New ${src}`, placeholder: 'layout', durationSec: src === 'video' ? 12 : undefined }])} />}
    </div>
  );
};

// ============================================================================
// PROSET REPORTS TAB — driven by OrgReportTemplate
// PROSET org gets THIS layout. Different orgs would get their own template.
// 100% read-aggregator — every section pulls from existing module data.
// ============================================================================
const PROSETReportTab = ({ project, personnel, equipment, deliveries, incidents, inspections, reportText, reportTemplate, dashboardConfig }) => {
  const m = project.modularStats;
  const totalHrs = personnel.reduce((s, p) => s + p.hours, 0);
  const isModular = project.type === 'modular';
  // Feature flags drive the e-sign / submit-to-client behaviors.
  // Phase 1 lock: both default off (no client e-sign workflow Phase 1/2).
  const flags = dashboardConfig?.featureFlags || {};
  const showSignatures = !!flags.requireDualSignature;
  const showSubmitToClient = !!flags.submitToClientFlow;
  const sectionsList = reportTemplate?.sections || [];
  const scopes = getScopes(dashboardConfig);

  const SourceLink = ({ module }) => (
    <button className="text-[10px] font-bold text-purple-700 hover:underline flex items-center gap-1 ml-auto">
      Edit in {module} <ArrowRight size={10} />
    </button>
  );
  const ReportSection = ({ icon: Icon, title, source, children, badge }) => (
    <div className="rounded-xl bg-white border border-slate-200 overflow-hidden mb-3">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50/40">
        {Icon && <Icon size={15} className="text-slate-700" strokeWidth={2.2} />}
        <span className="text-[13px] font-bold text-slate-900">{title}</span>
        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">· auto from {source}</span>
        <div className="ml-auto flex items-center gap-2">{badge}<SourceLink module={source} /></div>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );

  return (
    <div>
      {/* Top toolbar — Template name + actions */}
      <div className="rounded-xl p-4 mb-4 flex items-center gap-3" style={{ backgroundColor: PURPLE_LIGHT, border: `1px solid #DDD6FE` }}>
        <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40, backgroundColor: PURPLE }}>
          <FileText size={18} className="text-white" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="text-[14px] font-bold" style={{ color: PURPLE_DEEP }}>{reportTemplate.name}</div>
            <Badge tone="purple">org-specific template</Badge>
          </div>
          <div className="text-[11px]" style={{ color: PURPLE_DEEP, opacity: 0.85 }}>
            Auto-generated from voice-captured data across all modules · {reportTemplate.aiTriggerScanning && 'AI trigger scanning ON'}
          </div>
        </div>
        <button className="rounded-lg border-2 border-slate-200 bg-white px-4 py-2 text-[12px] font-bold text-slate-700 flex items-center gap-1.5 hover:bg-slate-50">
          <Eye size={13} /> Preview PDF
        </button>
        <button className="rounded-lg border-2 border-slate-200 bg-white px-4 py-2 text-[12px] font-bold text-slate-700 flex items-center gap-1.5 hover:bg-slate-50">
          <FileDown size={13} /> Export PDF
        </button>
        {showSubmitToClient && (
          <button className="rounded-lg text-white px-4 py-2 text-[12px] font-bold flex items-center gap-1.5" style={{ backgroundColor: PURPLE }}>
            <Send size={13} /> Submit to Client
          </button>
        )}
      </div>

      {/* Data flow legend (matches PROSET PDF annotations) */}
      <div className="rounded-lg p-3 mb-4 bg-slate-50 border border-slate-200 flex items-center gap-4 text-[11px] flex-wrap">
        <span className="font-bold text-slate-600 uppercase tracking-wide">Data flow</span>
        <span className="flex items-center gap-1 text-slate-700">⚡ <strong>Feeds TO:</strong> Project Mgmt · Accounting (% complete invoicing)</span>
        <span className="text-slate-300">·</span>
        <span className="flex items-center gap-1 text-slate-700">📥 <strong>Fed FROM:</strong> Voice captures · Hot Sheet · Database</span>
      </div>

      {/* All sections render based on reportTemplate.sections array */}
      {reportTemplate.sections.includes('header') && (
        <ReportSection icon={Briefcase} title="Header" source="Project · Auth context">
          <div className="grid grid-cols-4 gap-4">
            <div><div className="text-[10px] text-slate-500 font-semibold">Superintendent</div><div className="text-[13px] font-bold text-slate-900">{project.superintendent}</div></div>
            <div><div className="text-[10px] text-slate-500 font-semibold">Project</div><div className="text-[13px] font-bold text-slate-900">{project.name}</div></div>
            <div><div className="text-[10px] text-slate-500 font-semibold">Work date</div><div className="text-[13px] font-bold text-slate-900">Wed, Apr 16, 2025</div></div>
            <div><div className="text-[10px] text-slate-500 font-semibold">Weather AM / PM</div><div className="text-[12px] font-semibold text-slate-900">☀ {project.weather.condAM} / 🌬 {project.weather.condPM}</div></div>
          </div>
        </ReportSection>
      )}

      {reportTemplate.sections.includes('modularSummary') && isModular && (
        <ReportSection icon={Box} title="Summary · Modular production" source="Modular tracking">
          <div className="grid grid-cols-6 gap-3">
            <div><div className="text-[10px] text-slate-500 font-semibold">Mods Set Today</div><div className="text-[18px] font-bold text-slate-900">{m.setToday}</div></div>
            <div><div className="text-[10px] text-slate-500 font-semibold">Total Mods Set</div><div className="text-[18px] font-bold text-slate-900">{m.totalSet}</div></div>
            <div><div className="text-[10px] text-slate-500 font-semibold">Mods Remaining</div><div className="text-[18px] font-bold text-slate-900">{m.remaining}</div></div>
            <div><div className="text-[10px] text-slate-500 font-semibold">% Set Complete</div><div className="text-[18px] font-bold" style={{ color: PURPLE_DEEP }}>{m.pctComplete}%</div></div>
            <div><div className="text-[10px] text-slate-500 font-semibold">Panels Today</div><div className="text-[18px] font-bold text-slate-900">{m.panelsSetToday}</div></div>
            <div><div className="text-[10px] text-slate-500 font-semibold">Total Panels</div><div className="text-[18px] font-bold text-slate-900">{m.totalPanelsSet}</div></div>
          </div>
        </ReportSection>
      )}

      {sectionsList.includes('scopes') && (
        <ReportSection icon={ClipboardCheck} title="Scopes Worked On Today" source="Daily Log dashboard">
          <div className="grid grid-cols-3 gap-2">
            {scopes.map(s => {
              const checked = SCOPES_CHECKED.includes(s);
              return (
                <div key={s} className="flex items-center gap-2 px-2 py-1.5 rounded">
                  <div className="rounded flex items-center justify-center flex-shrink-0" style={{ width: 16, height: 16, backgroundColor: checked ? PURPLE : 'white', border: checked ? 'none' : `2px solid ${BORDER}` }}>
                    {checked && <Check size={11} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className={cls('text-[12px]', checked ? 'font-bold text-slate-900' : 'text-slate-500')}>{s}</span>
                </div>
              );
            })}
          </div>
        </ReportSection>
      )}

      {reportTemplate.sections.includes('employees') && (
        <ReportSection icon={Users} title="Employees On Site and General Scope Worked On" source="Personnel/Timesheets">
          <div className="grid grid-cols-3 gap-x-6 gap-y-1 text-[12px]">
            {personnel.map(p => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="font-mono text-slate-500 w-12">{p.empId}</span>
                <span className="font-semibold text-slate-900 flex-1 truncate">{p.name}</span>
                <span className="text-slate-600 w-14">{p.scopeToday}</span>
                <span className="text-slate-700 font-bold w-12 text-right">{p.hours.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-100 text-[11px]">
            <div><span className="text-slate-500">Start Time</span> <strong className="text-slate-900 ml-2">6:30 AM</strong></div>
            <div><span className="text-slate-500">End Time</span> <strong className="text-slate-900 ml-2">5:30 PM</strong></div>
            <div><span className="text-slate-500">Crew Hours Worked</span> <strong className="text-slate-900 ml-2">{totalHrs.toFixed(1)}h</strong></div>
            <div><span className="text-slate-500">Labor hrs / Mod</span> <strong className="text-slate-900 ml-2">{(totalHrs / (m?.setToday || 1)).toFixed(1)}</strong></div>
          </div>
        </ReportSection>
      )}

      {reportTemplate.sections.includes('tasksWorkedOn') && (
        <ReportSection icon={ClipboardList} title="Details of Tasks Worked On" source="Daily Log">
          <div className="text-[12px] text-slate-700 leading-relaxed whitespace-pre-line">{reportText.tasksWorkedOn}</div>
        </ReportSection>
      )}

      {reportTemplate.sections.includes('elevatedNotification') && (
        <ReportSection icon={AlertOctagon} title="Elevated Notification" source="Notifications module" badge={<Badge tone="amber">1 elevated</Badge>}>
          <div className="rounded-lg p-2.5 flex items-start gap-2" style={{ backgroundColor: WARN_BG }}>
            <AlertOctagon size={14} style={{ color: '#92400E' }} className="mt-0.5 flex-shrink-0" />
            <div className="text-[12px]" style={{ color: '#92400E' }}>
              <strong>Wind shut-down on 10th mod</strong> — Target Management invoked safety call. Schedule impact logged. PM Decision recorded.
            </div>
          </div>
        </ReportSection>
      )}

      {reportTemplate.sections.includes('problemsDelays') && (
        <ReportSection icon={AlertTriangle} title="Problems Encountered / Delays Encountered" source="Daily Log" badge={<Badge tone="amber">2 AI triggers</Badge>}>
          <div className="text-[12px] text-slate-700 leading-relaxed">{highlightTriggers(reportText.problemsDelays)}</div>
        </ReportSection>
      )}

      {reportTemplate.sections.includes('inspections') && (
        <ReportSection icon={Eye} title="Inspections" source="Inspections module">
          {inspections.map(i => (
            <div key={i.id} className="flex items-start gap-2 mb-2 last:mb-0">
              <Badge tone={i.status === 'Pass' ? 'green' : 'amber'}>{i.status}</Badge>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-slate-900">{i.type}</div>
                <div className="text-[11px] text-slate-700">{i.notes}</div>
              </div>
            </div>
          ))}
        </ReportSection>
      )}

      {reportTemplate.sections.includes('safetyMeetings') && (
        <ReportSection icon={ShieldCheck} title="Safety and Meetings" source="Safety + Daily Log">
          <div className="text-[12px] text-slate-700 leading-relaxed whitespace-pre-line">{reportText.safetyMeetings}</div>
        </ReportSection>
      )}

      {reportTemplate.sections.includes('communications') && (
        <ReportSection icon={MessageCircle} title="On-Site Communications / Other Notes and Comments" source="Daily Log" badge={<Badge tone="red">1 PM Decision</Badge>}>
          <div className="text-[12px] text-slate-700 leading-relaxed whitespace-pre-line">{highlightTriggers(reportText.communications)}</div>
        </ReportSection>
      )}

      {reportTemplate.sections.includes('lookahead') && (
        <ReportSection icon={ArrowRight} title="Lookahead" source="Daily Log">
          <div className="text-[12px] text-slate-700 leading-relaxed">{reportText.lookahead}</div>
        </ReportSection>
      )}

      {reportTemplate.sections.includes('equipment') && (
        <ReportSection icon={Wrench} title="Equipment on Site" source="Equipment module">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[12px]">
            {equipment.map(e => (
              <div key={e.id} className="flex items-center gap-2">
                <span className="font-bold text-slate-900 w-32 truncate">{e.name}</span>
                <span className="text-slate-700 w-8">× {e.qty}</span>
                <span className="text-slate-500 font-mono text-[11px] flex-1 truncate">{e.serials.join(', ')}</span>
              </div>
            ))}
          </div>
          {equipment.find(e => e.note) && (
            <div className="mt-2 text-[11px] text-green-700 font-semibold">↳ {equipment.find(e => e.note)?.note}</div>
          )}
        </ReportSection>
      )}

      {sectionsList.includes('subcontractorsOnSite') && (
        <ReportSection icon={HardHat} title="Subcontractors On Site" source="Personnel">
          <div className="text-[12px] text-slate-700">
            {personnel.filter(p => p.designation === 'SUBCONTRACTOR').length} sub crew on site · trades: {[...new Set(personnel.filter(p => p.designation === 'SUBCONTRACTOR').map(p => p.trade))].join(', ') || '—'}
          </div>
        </ReportSection>
      )}

      {sectionsList.includes('quantitiesInstalled') && (
        <ReportSection icon={BarChart3} title="Quantities Installed" source="Production">
          <div className="text-[12px] text-slate-700">
            {isModular ? <>Mods set today: <strong>{m?.setToday || 0}</strong> · to-date <strong>{m?.totalSet || 0}</strong> of <strong>{(m?.totalSet || 0) + (m?.remaining || 0)}</strong> ({m?.pctComplete || 0}%)</> : 'No quantities logged for today.'}
          </div>
        </ReportSection>
      )}

      {sectionsList.includes('delaysSummary') && (
        <ReportSection icon={Clock} title="Delays Summary" source="Incidents · Weather Delay">
          <div className="text-[12px] text-slate-700">
            {incidents.length} incident{incidents.length === 1 ? '' : 's'} logged · total schedule impact: <strong>{incidents.reduce((s, i) => s + (i.impactHours || 0), 0).toFixed(1)} hrs</strong>
          </div>
        </ReportSection>
      )}

      {sectionsList.includes('visitorsSummary') && (
        <ReportSection icon={IdCard} title="Visitors Summary" source="Visitors module">
          <div className="text-[12px] text-slate-700">
            (visitor list pulled from Visitors module — count, type, time on site)
          </div>
        </ReportSection>
      )}

      {sectionsList.includes('storedMaterials') && (
        <ReportSection icon={Package} title="Stored Materials (this period)" source="Materials module">
          <div className="text-[12px] text-slate-700">
            (material list with stored qty, location, value — for Pay App stored-materials column)
          </div>
        </ReportSection>
      )}

      {sectionsList.includes('photos') && (
        <ReportSection icon={ImageIcon} title="Photos" source="Voice capture · phone via Merlin">
          <div className="grid grid-cols-6 gap-2">
            {[1,2,3].map(i => (
              <div key={i} className="aspect-square rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FCD34D 0%, #A8A29E 100%)', opacity: 0.6 }}>
                <ImageIcon size={20} className="text-white" />
              </div>
            ))}
            <button className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:bg-slate-50">
              <Plus size={18} />
            </button>
          </div>
        </ReportSection>
      )}

      {sectionsList.includes('acknowledgements') && showSignatures && (
        <div className="rounded-xl bg-white border border-slate-200 p-4 mb-3">
          <div className="text-[13px] font-bold text-slate-900 mb-2">Acknowledgements</div>
          <div className="text-[11px] text-slate-600 mb-3">This report has been completed and detailed to the best of my knowledge and has been delivered and received by the client.</div>
          <div className="grid grid-cols-2 gap-3">
            {reportTemplate.dualSignerRoles.map(r => (
              <div key={r} className="rounded-lg border border-slate-200 p-3">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">{r}</div>
                <input className="w-full bg-transparent border-b border-slate-300 mt-1 pb-1 text-[12px] font-bold focus:outline-none focus:border-purple-400" placeholder="Print name" />
                <button className="mt-2 w-full rounded border border-dashed border-slate-300 py-2 text-[11px] text-slate-500 font-bold hover:bg-slate-50 flex items-center justify-center gap-1">
                  <FileSignature size={12} /> Capture signature
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg p-2.5 flex items-start gap-2" style={{ backgroundColor: INFO_BG }}>
            <Sparkles size={13} style={{ color: '#1E40AF' }} className="mt-0.5 flex-shrink-0" />
            <div className="text-[11px]" style={{ color: '#1E40AF' }}>
              On submit: Report sent to Client for approval · Auto-feeds to Project Management dashboard · Auto-feeds to Accounting (% complete for invoicing).
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// VOICE PANEL — slide-in from right (5+ multi-module preview cards)
// ============================================================================
const VoicePanel = ({ open, onClose }) => {
  const [phase, setPhase] = useState('recording');
  const [confirmed, setConfirmed] = useState({});
  useEffect(() => { if (open) { setPhase('recording'); setConfirmed({}); } }, [open]);
  if (!open) return null;
  const cards = [
    { id: 1, type: 'Personnel',     tone: 'purple', icon: Users,         label: '15 setters/panel/prep crew · check-in 6:30 AM', confidence: 0.94 },
    { id: 2, type: 'Modular',       tone: 'green',  icon: Box,           label: 'Mods Set Today +9 (D19/786-2 → 786-21)',         confidence: 0.96 },
    { id: 3, type: 'Equipment',     tone: 'amber',  icon: Wrench,        label: 'JLG boom lift received (4th unit)',              confidence: 0.94 },
    { id: 4, type: 'Problems',      tone: 'amber',  icon: AlertTriangle, label: '786-A2 e-box mod · CO trigger flagged',          confidence: 0.88, needsConfirm: true },
    { id: 5, type: 'Communications',tone: 'red',    icon: MessageCircle, label: 'Wind shut-down on 10th · PM Decision',           confidence: 0.91 },
  ];
  const tones = { purple: { bg: PURPLE_LIGHT, fg: PURPLE_DEEP }, amber: { bg: WARN_BG, fg: '#92400E' }, green: { bg: SUCCESS_BG, fg: '#166534' }, red: { bg: DANGER_BG, fg: '#991B1B' } };
  const confirmedCount = Object.values(confirmed).filter(Boolean).length;
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 bg-white shadow-2xl z-50 flex flex-col" style={{ width: 460 }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Ask AI · voice capture</div>
            <div className="text-[16px] font-bold text-slate-900 mt-0.5">{phase === 'recording' ? 'Listening…' : 'Review captures'}</div>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 hover:bg-slate-200" style={{ width: 32, height: 32 }}>
            <X size={14} className="mx-auto text-slate-700" />
          </button>
        </div>
        {phase === 'recording' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="text-[36px] font-bold mb-6" style={{ color: PURPLE }}>0:23</div>
            <div className="flex items-end gap-1 h-20 mb-6">
              {[18, 28, 42, 60, 50, 72, 45, 36, 68, 38, 28, 52].map((h, i) => (
                <div key={i} className="w-2 rounded-full" style={{ height: `${h}px`, backgroundColor: PURPLE, opacity: 0.4 + (h / 120), animation: `pulseProsetV2 1.${i % 5}s ease-in-out infinite alternate` }} />
              ))}
            </div>
            <button onClick={() => setPhase('review')} className="rounded-full text-white shadow-lg" style={{ width: 64, height: 64, backgroundColor: DANGER }}>
              <Square size={22} fill="white" className="mx-auto" />
            </button>
            <div className="text-[10px] text-slate-500 mt-3">Auto-stops after 5s of silence</div>
          </div>
        )}
        {phase === 'review' && (
          <>
            <div className="px-5 py-3 border-b border-slate-100">
              <div className="text-[12px] text-slate-500">AI captured {cards.length} mentions · routed to {cards.length} modules</div>
              <div className="text-[14px] font-bold text-slate-900">{confirmedCount} of {cards.length} confirmed</div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {cards.map(c => {
                const t = tones[c.tone];
                const isConfirmed = !!confirmed[c.id];
                return (
                  <div key={c.id} className={cls('rounded-xl border-2 p-3', isConfirmed ? 'border-green-300 bg-green-50/30' : 'border-slate-200 bg-white')}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="rounded-lg flex items-center justify-center" style={{ width: 28, height: 28, backgroundColor: t.bg }}>
                        <c.icon size={14} style={{ color: t.fg }} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: t.fg }}>{c.type}</span>
                    </div>
                    <div className="text-[12px] text-slate-900 mb-2">{c.label}</div>
                    {c.needsConfirm && !isConfirmed && (
                      <div className="rounded p-1.5 mb-2 text-[10px]" style={{ backgroundColor: WARN_BG, color: '#92400E' }}>
                        ⚠ Lower confidence — verify before saving
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button className="flex-1 text-[11px] font-bold border border-slate-200 rounded py-1.5 hover:bg-slate-50">Edit</button>
                      {isConfirmed
                        ? <span className="flex-1 text-[11px] font-bold rounded py-1.5 bg-green-100 text-green-700 text-center">✓ Confirmed</span>
                        : <button onClick={() => setConfirmed(p => ({ ...p, [c.id]: true }))} className="flex-1 text-[11px] font-bold rounded py-1.5 text-white" style={{ backgroundColor: PURPLE }}>Confirm</button>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-slate-200 px-5 py-3 flex gap-2">
              <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-[12px] font-bold text-slate-600">Discard</button>
              <button disabled={confirmedCount === 0} onClick={onClose} className="flex-1 rounded-lg text-white py-2 font-bold text-[13px] disabled:bg-slate-300" style={{ backgroundColor: confirmedCount === 0 ? undefined : (confirmedCount === cards.length ? SUCCESS : PURPLE) }}>
                {confirmedCount === 0 ? 'Confirm to save' : confirmedCount === cards.length ? `Save all ${cards.length}` : `Save ${confirmedCount} of ${cards.length}`}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

// ============================================================================
// ORG DASHBOARD CONFIG PANEL — admin UI for widget toggles
// (Slide-in from right, opened from Settings or Dashboard footer link)
// ============================================================================
// Org config panel — tabbed editor: Widgets | Catalogs | Report | Feature Flags.
// Catalogs editor lets admins add / remove dropdown values per Law 14
// (every dropdown / catalog is org-level config).
const OrgConfigPanel = ({ open, onClose, dashboardConfig, onUpdate, onUpdateCatalog, onUpdateFlag, onUpdateReportSection, onReorderReportSection, onUpdateVoiceHint }) => {
  const [tab, setTab] = useState('widgets');
  if (!open) return null;
  const grouped = Object.entries(dashboardConfig.widgetCatalog).reduce((acc, [id, w]) => {
    const g = w.group || 'Other';
    (acc[g] ||= []).push([id, w]);
    return acc;
  }, {});
  const groupOrder = ['Summary', 'Production', 'Personnel', 'Deliveries', 'Safety', 'Incidents', 'Equipment', 'Visitors', 'Notes', 'Daily Log', 'Other'];
  const orderedGroups = groupOrder.filter(g => grouped[g]).map(g => [g, grouped[g]]);
  const catalogs = dashboardConfig.catalogs || {};
  // flags / report template editor surfaces are V2 — admin-edited via support for First Go.
  // First Go scope: Widgets · Catalogs · AI capture hints.
  // Report template editor and Feature flags editor are V2.
  const tabs = [
    { id: 'widgets',  label: 'Dashboard widgets', icon: LayoutGrid },
    { id: 'catalogs', label: 'Catalogs',          icon: Hash },
    { id: 'aiHints',  label: 'AI capture hints',  icon: Sparkles },
  ];
  const voiceHints = dashboardConfig.voiceHints || {};
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 bg-white shadow-2xl z-50 flex flex-col" style={{ width: 620 }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Settings · Org Configuration</div>
            <div className="text-[16px] font-bold text-slate-900 mt-0.5">Org Feature Config</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Applies to all users in your organization · Law 14: Config not Code</div>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 hover:bg-slate-200" style={{ width: 32, height: 32 }}>
            <X size={14} className="mx-auto text-slate-700" />
          </button>
        </div>

        <div className="flex border-b border-slate-200 bg-slate-50/50 px-3">
          {tabs.map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cls('px-3 py-2.5 text-[12px] font-bold flex items-center gap-1.5 border-b-2 -mb-px',
                  active ? 'text-purple-700' : 'text-slate-600 hover:text-slate-900 border-transparent')}
                style={{ borderColor: active ? PURPLE : 'transparent' }}>
                <t.icon size={12} /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {tab === 'widgets' && (
            <>
              <div className="rounded-lg p-3 flex items-start gap-2" style={{ backgroundColor: INFO_BG }}>
                <Info size={13} style={{ color: '#1E40AF' }} className="mt-0.5 flex-shrink-0" />
                <div className="text-[11px]" style={{ color: '#1E40AF' }}>
                  Widget visibility is stored in <code className="px-1 rounded bg-white">OrgFeatureConfig.widgetCatalog</code>. Modular-only widgets show automatically when project type = modular.
                </div>
              </div>
              {orderedGroups.map(([groupName, widgets]) => {
                const togglable = widgets.filter(([_, w]) => !w.disabled);
                const enabledCount = togglable.filter(([_, w]) => w.enabled).length;
                return (
                  <div key={groupName}>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                      {groupName}
                      <span className="text-[10px] text-slate-400 font-normal normal-case">{enabledCount} of {togglable.length} enabled</span>
                    </div>
                    <div className="space-y-1.5">
                      {widgets.map(([id, w]) => (
                        <div key={id} className={cls('flex items-center gap-3 px-3 py-2.5 rounded-lg', w.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50')}
                          title={w.disabled ? 'Reserved for V2 / future enablement' : undefined}>
                          {w.disabled
                            ? <div className="rounded-full flex-shrink-0 bg-slate-200" style={{ width: 36, height: 22, position: 'relative' }}>
                                <div className="rounded-full bg-white shadow" style={{ width: 16, height: 16, position: 'absolute', top: 3, left: 3 }} />
                              </div>
                            : <Toggle on={w.enabled} onChange={() => onUpdate(id, !w.enabled)} />}
                          <div className="flex-1">
                            <div className="text-[13px] font-bold text-slate-900">{w.label}</div>
                            <div className="text-[10px] text-slate-500">id: <code className="font-mono">{id}</code></div>
                          </div>
                          {w.disabled && <Badge tone="slate">V2</Badge>}
                          {!w.disabled && w.projectTypes.includes('modular') && !w.projectTypes.includes('standard') && <Badge tone="purple">Modular only</Badge>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {tab === 'catalogs' && (
            <>
              <div className="rounded-lg p-3 flex items-start gap-2" style={{ backgroundColor: INFO_BG }}>
                <Info size={13} style={{ color: '#1E40AF' }} className="mt-0.5 flex-shrink-0" />
                <div className="text-[11px]" style={{ color: '#1E40AF' }}>
                  Every dropdown across capture forms, AI extraction, and reports reads from these catalogs. Add or remove values to fit your trades, scopes, and processes — no code change required.
                </div>
              </div>
              {Object.entries(catalogs).map(([key, values]) => (
                <CatalogEditor key={key} catalogKey={key} values={values || []}
                  onChange={(next) => onUpdateCatalog?.(key, next)} />
              ))}
            </>
          )}

          {tab === 'aiHints' && (
            <>
              <div className="rounded-lg p-3 flex items-start gap-2" style={{ backgroundColor: INFO_BG }}>
                <Info size={13} style={{ color: '#1E40AF' }} className="mt-0.5 flex-shrink-0" />
                <div className="text-[11px]" style={{ color: '#1E40AF' }}>
                  The AI extraction <em>contract</em> (which fields to fill, allowed values) is auto-generated from your schema + catalogs. What admins tune here is what the AI <strong>listens for</strong> per submodule:<br />
                  <strong>Examples</strong> — phrases your crew actually says. AI uses these as few-shot to recognize the same patterns.<br />
                  <strong>Triggers</strong> — words that should be FLAGGED on the daily log (change-order, PM Decision, near-miss, owner directive, lookahead, etc.) — AI calls these out for review.
                </div>
              </div>
              {Object.entries(voiceHints).map(([key, value]) => (
                <VoiceHintsEditor key={key} submoduleKey={key} value={value || {examples: [], triggers: []}}
                  onChange={(next) => onUpdateVoiceHint?.(key, next)} />
              ))}
            </>
          )}
        </div>

        <div className="border-t border-slate-200 px-5 py-3 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-[12px] font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={onClose} className="rounded-lg text-white px-4 py-2 text-[12px] font-bold" style={{ backgroundColor: PURPLE }}>Save org config</button>
        </div>
      </div>
    </>
  );
};

// Reusable toggle pill for the config panel
const Toggle = ({ on, onChange }) => (
  <button onClick={onChange} className="rounded-full transition-colors flex-shrink-0" style={{ width: 36, height: 22, backgroundColor: on ? PURPLE : '#CBD5E1', position: 'relative' }}>
    <div className="rounded-full bg-white shadow" style={{ width: 16, height: 16, position: 'absolute', top: 3, left: on ? 17 : 3, transition: 'left 0.2s' }} />
  </button>
);

// Inline catalog editor — add / remove pills for a single catalog key.
const CatalogEditor = ({ catalogKey, values, onChange }) => {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (!v || values.includes(v)) return;
    onChange?.([...values, v]);
    setDraft('');
  };
  const remove = (v) => onChange?.(values.filter(x => x !== v));
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Hash size={11} className="text-slate-500" />
        <code className="text-[11px] font-mono font-bold text-slate-700">{catalogKey}</code>
        <span className="text-[10px] text-slate-400">{values.length} value{values.length === 1 ? '' : 's'}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map(v => (
          <span key={v} className="inline-flex items-center gap-1 text-[11px] font-semibold rounded px-1.5 py-0.5" style={{ backgroundColor: PURPLE_LIGHT, color: PURPLE_DEEP }}>
            {v}
            <button onClick={() => remove(v)} className="hover:text-red-700"><X size={10} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-1.5">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Add value…" className="flex-1 rounded border border-slate-200 px-2 py-1 text-[11px] focus:outline-none focus:border-purple-400" />
        <button onClick={add} className="rounded text-white px-2 py-1 text-[11px] font-bold" style={{ backgroundColor: PURPLE }}>Add</button>
      </div>
    </div>
  );
};

// Rich AI-hints editor for one submodule.
//   value = { examples: [strings], triggers: [strings] }
//   onChange(nextValue) — replaces the whole value object for this submodule.
const VoiceHintsEditor = ({ submoduleKey, value, onChange }) => {
  const examples = Array.isArray(value?.examples) ? value.examples : [];
  const triggers = Array.isArray(value?.triggers) ? value.triggers : [];
  const [draftTrigger, setDraftTrigger] = useState('');
  const setExamples = (next) => onChange({ ...value, examples: next });
  const setTriggers = (next) => onChange({ ...value, triggers: next });
  const updateExample = (i, v) => setExamples(examples.map((e, idx) => idx === i ? v : e));
  const removeExample = (i) => setExamples(examples.filter((_, idx) => idx !== i));
  const addExample = () => setExamples([...examples, '""']);
  const addTrigger = () => {
    const v = draftTrigger.trim();
    if (!v || triggers.includes(v)) return;
    setTriggers([...triggers, v]);
    setDraftTrigger('');
  };
  const removeTrigger = (v) => setTriggers(triggers.filter(x => x !== v));

  return (
    <div className="rounded-lg border border-slate-200 p-3.5 mb-3">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
        <div className="rounded-md flex items-center justify-center" style={{ width: 24, height: 24, backgroundColor: PURPLE_LIGHT }}>
          <Mic size={11} style={{ color: PURPLE_DEEP }} />
        </div>
        <code className="text-[12px] font-mono font-bold text-slate-800">{submoduleKey}</code>
        <span className="text-[10px] text-slate-400 ml-auto">{examples.length} example{examples.length === 1 ? '' : 's'} · {triggers.length} trigger{triggers.length === 1 ? '' : 's'}</span>
      </div>

      {/* Examples */}
      <div className="mb-3">
        <div className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
          <Sparkles size={10} style={{ color: PURPLE }} /> Example phrases AI listens for
        </div>
        <div className="space-y-1.5">
          {examples.map((ex, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <textarea rows={2} value={ex} onChange={(e) => updateExample(i, e.target.value)}
                className="flex-1 rounded border border-slate-200 px-2 py-1.5 text-[11.5px] font-mono leading-relaxed focus:outline-none focus:border-purple-400 resize-none" />
              <button onClick={() => removeExample(i)} className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Remove example">
                <X size={11} />
              </button>
            </div>
          ))}
          <button onClick={addExample} className="text-[11px] font-bold text-purple-700 hover:bg-purple-50 rounded px-2 py-1 flex items-center gap-1">
            <Plus size={10} /> Add example phrase
          </button>
        </div>
      </div>

      {/* Triggers */}
      <div>
        <div className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
          <AlertTriangle size={10} style={{ color: WARN }} /> Trigger words to flag
        </div>
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {triggers.map(v => (
            <span key={v} className="inline-flex items-center gap-1 text-[11px] font-semibold rounded px-1.5 py-0.5" style={{ backgroundColor: WARN_BG, color: '#92400E' }}>
              {v}
              <button onClick={() => removeTrigger(v)} className="hover:text-red-700"><X size={9} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-1.5">
          <input value={draftTrigger} onChange={(e) => setDraftTrigger(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTrigger()}
            placeholder="Add trigger word…" className="flex-1 rounded border border-slate-200 px-2 py-1 text-[11px] focus:outline-none focus:border-purple-400" />
          <button onClick={addTrigger} className="rounded text-white px-2 py-1 text-[11px] font-bold" style={{ backgroundColor: WARN }}>Add</button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SIMPLE QUICK CREATE DROPDOWN — demoted, opened from small + icon
// ============================================================================
const QuickCreateMenu = ({ open, onClose, onPick, config }) => {
  if (!open) return null;
  const flags = config?.featureFlags || {};
  const items = [
    { id: 'logPersonnel',     icon: UserCheck,     label: 'Personnel check-in' },
    { id: 'logDelivery',      icon: Truck,         label: 'Delivery' },
    { id: 'logSafetyMeeting', icon: ShieldCheck,   label: 'Safety meeting / Toolbox talk' },
    { id: 'incident',         icon: AlertOctagon,  label: 'Incident or Delay' },
    flags.enableWeatherDelaySubmodule !== false && { id: 'logWeatherDelay', icon: AlertTriangle, label: 'Weather delay' },
    { id: 'inspection',       icon: Eye,           label: 'Inspection' },
    { id: 'logEquipment',     icon: Wrench,        label: 'Equipment usage' },
    { id: 'logMaterial',      icon: Package,       label: 'Material',           disabled: true },
    flags.enableQuantitiesInstalled && { id: 'logQuantities', icon: BarChart3, label: 'Quantities installed' },
    flags.enableSubcontractorDailyReport && { id: 'logSubOnSite', icon: HardHat, label: 'Subcontractor daily' },
    { id: 'logVisitor',       icon: IdCard,        label: 'Visitor sign-in',    disabled: true },
    { id: 'logNote',          icon: StickyNote,    label: 'Note' },
  ].filter(Boolean);
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute top-12 right-32 z-50 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden" style={{ width: 280 }}>
        <div className="px-4 py-2.5 border-b border-slate-100">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Manual entry · fallback</div>
          <div className="text-[10px] text-slate-400">Most data flows from voice capture</div>
        </div>
        <div className="py-1">
          {items.map(it => (
            <button key={it.id} onClick={() => !it.disabled && onPick(it.id)} disabled={it.disabled}
              title={it.disabled ? 'Coming in V2' : undefined}
              className={cls('w-full flex items-center gap-3 px-4 py-2 text-left', it.disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-slate-50')}>
              <it.icon size={14} className="text-slate-500" />
              <div className="text-[13px] font-semibold text-slate-700 flex-1">{it.label}</div>
              {it.disabled && <span className="text-[9px] font-bold rounded-full px-1.5 py-0.5 bg-slate-200 text-slate-600">V2</span>}
              {!it.disabled && <ChevronRight size={11} className="text-slate-300" />}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

// ============================================================================
// PDF PREVIEW DIALOG — paper-sheet preview of the Daily Field Report
// ============================================================================
const PdfPreviewDialog = ({ onClose, project, reportTemplate, dashboardConfig }) => {
  const showSig = !!(dashboardConfig?.featureFlags?.requireDualSignature);
  const fileName = `${(reportTemplate?.name || 'DailyFieldReport').replace(/\s/g,'')}_${project.name.replace(/\s/g,'_')}_2026-05-05.pdf`;
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col pointer-events-auto" style={{ width: 880, height: 'calc(100vh - 60px)' }}>
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="rounded-md flex items-center justify-center" style={{ width: 32, height: 32, backgroundColor: PURPLE_LIGHT }}>
                <FileText size={16} style={{ color: PURPLE_DEEP }} />
              </div>
              <div>
                <div className="text-[14px] font-bold text-slate-900">{reportTemplate?.name || 'Daily Field Report'} · Preview</div>
                <div className="text-[11px] text-slate-500">{fileName}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 flex items-center gap-1.5 hover:bg-slate-100">
                <Download size={12} /> Download
              </button>
              <button className="rounded-md text-white px-3 py-1.5 text-[11px] font-bold flex items-center gap-1.5" style={{ backgroundColor: PURPLE }}>
                <Share2 size={12} /> Share
              </button>
              <button onClick={onClose} className="rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center" style={{ width: 28, height: 28 }}>
                <X size={13} className="text-slate-700" />
              </button>
            </div>
          </div>
          {/* Paper canvas */}
          <div className="flex-1 overflow-y-auto bg-slate-200 px-8 py-6">
            <div className="bg-white shadow-md mx-auto" style={{ width: 720, minHeight: 1020, padding: '36px 44px', fontFamily: 'system-ui, sans-serif' }}>
              {/* Header */}
              <div className="border-b-2 pb-3 mb-4" style={{ borderColor: PURPLE }}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[18px] font-bold" style={{ color: PURPLE_DEEP }}>{reportTemplate?.name || 'Daily Field Report'}</div>
                    <div className="text-[12px] text-slate-700 mt-0.5">{project.name} · {project.client}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{project.address}</div>
                  </div>
                  <div className="text-right text-[11px] text-slate-700">
                    <div><strong>Date:</strong> Mon, May 5 2026</div>
                    <div><strong>Sup:</strong> {project.superintendent}</div>
                    <div><strong>Day:</strong> {project.daysIn} of {project.daysTotal}</div>
                  </div>
                </div>
              </div>
              {/* Production summary */}
              <div className="mb-4">
                <div className="text-[12px] font-bold uppercase tracking-wide mb-1.5" style={{ color: PURPLE_DEEP }}>1. Production Summary</div>
                <div className="text-[12px] text-slate-700 leading-relaxed">
                  9 units installed today (D19/786-2 → 786-21). Total set to date: 44 of 696 (6.35% complete).
                  Crew of 15 logged 159h labor. Foundation pour east wing started.
                </div>
              </div>
              {/* Employees on site */}
              <div className="mb-4">
                <div className="text-[12px] font-bold uppercase tracking-wide mb-1.5" style={{ color: PURPLE_DEEP }}>2. Employees On Site</div>
                <table className="w-full text-[11px] border border-slate-300">
                  <thead><tr className="bg-slate-100"><th className="text-left p-1.5 border border-slate-300">Name</th><th className="text-left p-1.5 border border-slate-300">Role</th><th className="text-right p-1.5 border border-slate-300">Hrs</th></tr></thead>
                  <tbody>
                    {['Juan Alencastro · Setter · 10.75h','Eric Cortez · Setter · 10.78h','Carlos Cruz · Setter · 10.77h','Mayolo Hernandez · Setter · 10.77h','Miguel Ortiz · Setter · 10.77h','Maciel Santos · Setter · 10.77h','+ 9 more workers'].map((row, i) => (
                      <tr key={i}><td colSpan={3} className="p-1.5 border border-slate-300">{row}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Toolbox talks */}
              <div className="mb-4">
                <div className="text-[12px] font-bold uppercase tracking-wide mb-1.5" style={{ color: PURPLE_DEEP }}>3. Toolbox Talks · Safety Briefings</div>
                <div className="text-[11px] text-slate-700 leading-relaxed">
                  · 6:35 AM · Boom lift fall protection — 14 attendees (12 min, led by E. Odowd)<br />
                  · 12:30 PM · High-wind crane operation — 13 attendees (8 min, led by E. Odowd)
                </div>
              </div>
              {/* Tasks */}
              <div className="mb-4">
                <div className="text-[12px] font-bold uppercase tracking-wide mb-1.5" style={{ color: PURPLE_DEEP }}>4. Tasks Worked On</div>
                <div className="text-[11px] text-slate-700 leading-relaxed">Began setting Dorm 19, starting with the stairwell box. Crane set mods D19/786-2, 786-3, 786-11, 786-4, 786-10, 786-12, 786-13, 786-21.</div>
              </div>
              {/* Problems */}
              <div className="mb-4">
                <div className="text-[12px] font-bold uppercase tracking-wide mb-1.5" style={{ color: PURPLE_DEEP }}>5. Problems / Delays Encountered</div>
                <div className="text-[11px] text-slate-700 leading-relaxed">Unexpected crane move mid-day. 786-A2 stairwell box too wide; removed and cut wire per Dave Ault. Logged to Target HSI with photo.</div>
              </div>
              {/* Communications */}
              <div className="mb-4">
                <div className="text-[12px] font-bold uppercase tracking-wide mb-1.5" style={{ color: PURPLE_DEEP }}>6. On-Site Communications</div>
                <div className="text-[11px] text-slate-700 leading-relaxed">10th unit shut-down for wind per Owner. PM Decision logged.</div>
              </div>
              {/* Lookahead */}
              <div className="mb-4">
                <div className="text-[12px] font-bold uppercase tracking-wide mb-1.5" style={{ color: PURPLE_DEEP }}>7. Lookahead</div>
                <div className="text-[11px] text-slate-700 leading-relaxed">Set of Dorm 19 expected complete Friday April 18 at current pace.</div>
              </div>
              {/* Signatures */}
              {showSig && (
                <div className="mt-6 grid grid-cols-2 gap-6 pt-4 border-t border-slate-300">
                  {(reportTemplate?.dualSignerRoles || ['Contractor Rep','Owner Rep']).map(role => (
                    <div key={role}>
                      <div className="text-[11px] font-bold text-slate-700 mb-6">{role}</div>
                      <div className="border-b border-slate-400 mb-1" />
                      <div className="text-[10px] text-slate-500">Signature · Date</div>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-[9px] text-slate-400 mt-6 text-right italic">Generated by Merlin AI · auto-compiled from voice captures · 2026-05-05 5:30 PM</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ============================================================================
// QUICK SHARE DIALOG — channel + recipient + message
// ============================================================================
const QuickShareDialog = ({ onClose, project, reportTemplate }) => {
  const [channel, setChannel] = useState('email');
  const [recipients, setRecipients] = useState('');
  const [message, setMessage] = useState(`Today's ${reportTemplate?.name || 'Daily Field Report'} for ${project.name} is attached. 9 units installed, on schedule for Friday completion. One change-order trigger flagged for review.`);
  const [sent, setSent] = useState(false);
  const channels = [
    { id: 'email',  label: 'Email',     icon: Mail,  hint: 'Sends a PDF + summary to the recipient' },
    { id: 'slack',  label: 'Slack',     icon: Send,  hint: 'Posts a summary card to the channel' },
    { id: 'sms',    label: 'SMS',       icon: Phone, hint: 'Sends a 1-line summary + PDF link' },
    { id: 'link',   label: 'Share link', icon: Share2, hint: 'Generate a view-only link to the PDF' },
  ];
  const channelObj = channels.find(c => c.id === channel);
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col pointer-events-auto" style={{ width: 560, maxHeight: 'calc(100vh - 80px)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="rounded-md flex items-center justify-center" style={{ width: 32, height: 32, backgroundColor: PURPLE_LIGHT }}>
                <Share2 size={15} style={{ color: PURPLE_DEEP }} />
              </div>
              <div>
                <div className="text-[15px] font-bold text-slate-900">Quick Share · {reportTemplate?.name || 'Daily Field Report'}</div>
                <div className="text-[11px] text-slate-500">{project.name} · Mon, May 5 2026</div>
              </div>
            </div>
            <button onClick={onClose} className="rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center" style={{ width: 32, height: 32 }}>
              <X size={14} className="text-slate-700" />
            </button>
          </div>
          {sent ? (
            <div className="px-5 py-10 flex flex-col items-center text-center">
              <div className="rounded-full flex items-center justify-center mb-3" style={{ width: 56, height: 56, backgroundColor: SUCCESS_BG }}>
                <CheckCircle2 size={28} style={{ color: '#166534' }} />
              </div>
              <div className="text-[15px] font-bold text-slate-900">Shared via {channelObj.label}</div>
              <div className="text-[12px] text-slate-500 mt-1">Recipients will get the report shortly.</div>
              <button onClick={onClose} className="mt-5 rounded-lg text-white px-5 py-2 font-bold text-[13px]" style={{ backgroundColor: PURPLE }}>Done</button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                <div>
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-2">Channel</div>
                  <div className="grid grid-cols-2 gap-2">
                    {channels.map(c => {
                      const isActive = channel === c.id;
                      return (
                        <button key={c.id} onClick={() => setChannel(c.id)}
                          className={cls('rounded-lg border-2 p-3 flex items-center gap-2.5 text-left transition-all', isActive ? 'shadow-sm' : 'hover:border-slate-300')}
                          style={{ borderColor: isActive ? PURPLE : BORDER, backgroundColor: isActive ? PURPLE_LIGHT : 'white' }}>
                          <div className="rounded-md flex items-center justify-center flex-shrink-0" style={{ width: 28, height: 28, backgroundColor: isActive ? 'white' : '#F1F5F9' }}>
                            <c.icon size={14} style={{ color: isActive ? PURPLE_DEEP : '#64748B' }} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[12px] font-bold text-slate-900">{c.label}</div>
                            <div className="text-[10px] text-slate-500 truncate">{c.hint}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">{channel === 'slack' ? 'Channel(s)' : channel === 'sms' ? 'Phone number(s)' : channel === 'email' ? 'Recipient email(s)' : 'Link expiry'}</div>
                  <input value={recipients} onChange={(e) => setRecipients(e.target.value)} placeholder={channel === 'slack' ? '#site-pm, #safety-leads' : channel === 'sms' ? '+1 555 123 4567' : channel === 'email' ? 'owner@target.com, sup@erikodowd.com' : '7 days · view-only'}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[12px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-400" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">Message <span className="text-slate-400 font-normal">· auto-generated from AI summary, edit if needed</span></div>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[12px] text-slate-700 leading-relaxed resize-none focus:outline-none focus:border-purple-400" />
                </div>
                <div className="rounded-lg p-2.5 flex items-start gap-2" style={{ backgroundColor: PURPLE_LIGHT }}>
                  <FileText size={13} style={{ color: PURPLE_DEEP }} className="mt-0.5 flex-shrink-0" />
                  <div className="text-[11px]" style={{ color: PURPLE_DEEP }}>
                    <strong>Attached:</strong> DailyFieldReport_{project.name.replace(/\s/g,'_')}_2026-05-05.pdf · 6 sections · auto-compiled
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-200 px-5 py-3 flex gap-2 justify-end">
                <button onClick={onClose} className="rounded-lg text-white px-5 py-2 font-bold text-[13px]" style={{ backgroundColor: TEXT }}>Cancel</button>
                <button onClick={() => setSent(true)} className="rounded-lg text-white px-5 py-2 font-bold text-[13px] flex items-center gap-1.5" style={{ backgroundColor: PURPLE }}>
                  <Share2 size={13} /> Send via {channelObj.label}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

// ============================================================================
// CREATE ITEM DIALOG — voice-first form for any module item.
// Mic at top → AI fills the form below. Or fill manually. Photo/video attach.
// Each type has a field schema rendered here.
// ============================================================================
// ============================================================================
// ITEM SCHEMAS — config-driven. All select options pull from
// ORG_DASHBOARD_CONFIG.catalogs so admins can add/remove values without code.
// Field set covers Phase 1 + industry-standard fields commonly asked by GC /
// owner reps. Use buildItemSchemas(cfg) at render time so dropdowns reflect
// the current catalog.
// ============================================================================
const buildItemSchemas = (cfg) => {
  const c = cfg?.catalogs || {};
  const enums = (k, fb = []) => c[k] ?? fb;
  // Voice hint resolver — accepts either a string (legacy) or the rich shape
  // {examples: [], triggers: []}. Picks the first example as the placeholder
  // hint shown in the capture dialog. The full examples + triggers list flows
  // into the AI extraction prompt server-side.
  const hints = cfg?.voiceHints || {};
  const hint = (id, fb) => {
    const v = hints[id];
    if (!v) return fb;
    if (typeof v === 'string') return v;
    return v.examples?.[0] ?? fb;
  };
  // Optional-field gating — fields marked {advanced: true} stay in the schema
  // definition (so future enablement is one config change away) but only
  // render in the capture dialog when the org opts them in via
  // cfg.enabledOptionalFields[submoduleId] = ['fieldId1', ...].
  const enabledOpt = cfg?.enabledOptionalFields || {};
  const filterFields = (id, fields) => {
    const opted = new Set(enabledOpt[id] || []);
    return (fields || []).filter(f => !f.advanced || opted.has(f.id));
  };
  const raw = {
    personnel: {
      title: 'Add Personnel',
      iconName: 'UserCheck',
      danger: false,
      voiceHint: hint('personnel', '"Juan Alencastro, employee 101, GC setter, scope set crew, in at 6:30 AM out 5:15, $38 wage, no overtime, OSHA 10 cert, PPE good."'),
      // Essentials = the daily timesheet shape. Compliance / HR / per-diem fields fold into "advanced".
      fields: [
        { id: 'worker',       label: 'Worker name',          type: 'text',   placeholder: 'e.g. Juan Alencastro' },
        { id: 'empId',        label: 'Employee ID',          type: 'text',   placeholder: 'e.g. 101' },
        { id: 'trade',        label: 'Trade',                type: 'select', options: enums('trades') },
        { id: 'role',         label: 'Role',                 type: 'select', options: enums('roles') },
        { id: 'scopeToday',   label: 'Scope today',          type: 'select', options: enums('scopes') },
        { id: 'checkIn',      label: 'Check-in',             type: 'time' },
        { id: 'checkOut',     label: 'Check-out',            type: 'time' },
        { id: 'wageRate',     label: 'Wage rate ($/h)',      type: 'number' },
        { id: 'overtimeFlag', label: 'Overtime?',            type: 'toggle' },
        { id: 'ppeVerified',  label: 'PPE verified',         type: 'toggle' },
        // ---- Advanced ----------------------------------------------------
        { id: 'phone',        label: 'Phone',                type: 'text',                                                       advanced: true },
        { id: 'emergencyContact', label: 'Emergency contact', type: 'text', placeholder: 'Name + phone',                          advanced: true },
        { id: 'designation',  label: 'Designation',          type: 'select', options: enums('designations'),                     advanced: true },
        { id: 'crewLeadFlag', label: 'Crew lead / Foreman?', type: 'toggle',                                                     advanced: true },
        { id: 'crewName',     label: 'Crew',                 type: 'text',   placeholder: 'e.g. D19 Setter Crew',                advanced: true },
        { id: 'description',  label: 'Description of work',  type: 'textarea', placeholder: 'What did they actually do today?',  advanced: true },
        { id: 'breakMin',     label: 'Break / lunch (min)',  type: 'number',                                                     advanced: true },
        { id: 'costCode',     label: 'Cost code',            type: 'select', options: enums('costCodes'),                       advanced: true },
        { id: 'workersCompClass', label: "Worker's comp class", type: 'text',                                                    advanced: true },
        { id: 'visaWorkAuthVerified', label: 'Work auth verified', type: 'toggle',                                               advanced: true },
        { id: 'onsiteOrientationDate', label: 'Site orientation date', type: 'date',                                             advanced: true },
        { id: 'certs',        label: 'Certifications',       type: 'tags',   placeholder: 'OSHA 10, Crane Sig…', suggestions: enums('certifications'), advanced: true },
      ],
    },
    delivery: {
      title: 'Add Delivery',
      voiceHint: hint('delivery', '"Westervelt dropped 2 mods D19/786-2 and 786-3, PO 3042, BOL 88421, truck plate ABC-1234, received 7:15 AM unloaded 7:45, full set, staged Yard 3."'),
      fields: [
        { id: 'supplier',         label: 'Supplier',           type: 'text' },
        { id: 'material',         label: 'Material',           type: 'text' },
        { id: 'qty',              label: 'Quantity',           type: 'number' },
        { id: 'unit',             label: 'Unit',               type: 'select', options: enums('units') },
        { id: 'poNumber',         label: 'PO number',          type: 'text' },
        { id: 'status',           label: 'Status',             type: 'select', options: enums('deliveryStatuses') },
        { id: 'storageLocation',  label: 'Storage location',   type: 'text', placeholder: 'Yard 2, Yard 3, Lay-down…' },
        { id: 'notes',            label: 'Notes',              type: 'textarea' },
        // ---- Advanced ----------------------------------------------------
        { id: 'carrier',          label: 'Carrier',            type: 'text', placeholder: 'Trucking co. / UPS / FedEx',           advanced: true },
        { id: 'billOfLading',     label: 'BOL number',         type: 'text',                                                      advanced: true },
        { id: 'packingSlip',      label: 'Packing slip #',     type: 'text',                                                      advanced: true },
        { id: 'ticketNumber',     label: 'Ticket # (weighmaster / ready-mix)', type: 'text',                                      advanced: true },
        { id: 'driverName',       label: 'Driver',             type: 'text',                                                      advanced: true },
        { id: 'driverPhone',      label: 'Driver phone',       type: 'text',                                                      advanced: true },
        { id: 'truckPlate',       label: 'Truck / plate #',    type: 'text',                                                      advanced: true },
        { id: 'arrivedAt',        label: 'Arrived',            type: 'time',                                                      advanced: true },
        { id: 'unloadedAt',       label: 'Unloaded',           type: 'time',                                                      advanced: true },
        { id: 'releasedAt',       label: 'Released',           type: 'time',                                                      advanced: true },
        { id: 'inspectedAtReceipt', label: 'Inspected at receipt?', type: 'toggle',                                               advanced: true },
        { id: 'costCode',         label: 'Cost code',          type: 'select', options: enums('costCodes'),                      advanced: true },
        { id: 'mfrLotHeat',       label: 'Mfr / Lot / Heat #', type: 'text', placeholder: 'For steel / concrete / structural',    advanced: true },
        { id: 'mixDesign',        label: 'Concrete mix design', type: 'text',                                                     advanced: true },
        { id: 'slump',            label: 'Slump (in)',         type: 'number',                                                    advanced: true },
        { id: 'airContent',       label: 'Air content (%)',    type: 'number',                                                    advanced: true },
        { id: 'concreteTemp',     label: 'Concrete temp (°F)', type: 'number',                                                    advanced: true },
        { id: 'discrepancyWithPo', label: 'Discrepancy w/ PO', type: 'textarea',                                                  advanced: true },
        { id: 'value',            label: 'Value ($)',          type: 'number',                                                    advanced: true },
      ],
    },
    safetyMeeting: {
      title: 'Add Safety Meeting / Toolbox Talk',
      voiceHint: hint('safetyMeeting', '"Boom lift fall protection talk, 6:35 AM, 12 minutes, 14 attendees, led by me, OSHA Quick Card source, English, no translator needed."'),
      fields: [
        { id: 'topic',          label: 'Topic',                type: 'text', placeholder: 'e.g. Boom lift fall protection' },
        { id: 'type',           label: 'Type',                 type: 'select', options: enums('meetingTypes') },
        { id: 'lead',           label: 'Lead by',              type: 'text' },
        { id: 'time',           label: 'Time',                 type: 'time' },
        { id: 'duration',       label: 'Duration (min)',       type: 'number' },
        { id: 'attendees',      label: 'Attendees (count)',    type: 'number' },
        { id: 'notes',          label: 'Notes / takeaways',    type: 'textarea' },
        // ---- Advanced ----------------------------------------------------
        { id: 'topicSource',    label: 'Topic source',         type: 'select', options: ['OSHA Quick Card','Company SOP','Vendor','Custom'], advanced: true },
        { id: 'attendeeNames',  label: 'Attendee names',       type: 'tags',  placeholder: 'Juan A., Eric C., Carlos C.…',                  advanced: true },
        { id: 'attendeeSignatures', label: 'Sign-in sheet / signatures', type: 'attachment',                                                advanced: true },
        { id: 'materialDiscussedRef', label: 'Hand-out / reference doc', type: 'attachment',                                                advanced: true },
        { id: 'languageConducted', label: 'Language',          type: 'select', options: ['English','Spanish','Portuguese','Other'],         advanced: true },
        { id: 'translatorPresent', label: 'Translator present?', type: 'toggle',                                                            advanced: true },
        { id: 'relatedIncidentRef', label: 'Related incident (for stand-downs)', type: 'text',                                              advanced: true },
      ],
    },
    incident: {
      title: 'Log Incident or Delay',
      danger: true,
      voiceHint: hint('incident', '"Crane mid-day move on Dorm 19, 11:30 AM, 786-A2 e-box too wide, cut wire per Dave Ault, 1 hour schedule slip, change-order trigger."'),
      // Simplified flow: 8 essentials always visible. Compliance / OSHA / cost
      // detail fields are marked advanced and folded behind "Show all details"
      // in the capture dialog — they come into play for recordable / lost-time
      // events but shouldn't gate a quick log.
      fields: [
        { id: 'kind',               label: 'Type',                  type: 'select', options: ['Safety incident','Operational delay'] },
        { id: 'title',              label: 'Title',                 type: 'text',   placeholder: 'e.g. Crane move mid-day' },
        { id: 'category',           label: 'Category',              type: 'select', options: enums('incidentCategories') },
        { id: 'severity',           label: 'Severity',              type: 'select', options: enums('severityScale') },
        { id: 'time',               label: 'Time',                  type: 'time' },
        { id: 'location',           label: 'Location',              type: 'text' },
        { id: 'description',        label: 'What happened',         type: 'textarea' },
        { id: 'actionTaken',        label: 'Action taken',          type: 'textarea' },
        { id: 'impactHours',        label: 'Schedule impact (hrs)', type: 'number' },
        { id: 'changeOrderTrigger', label: 'Change-order trigger?', type: 'toggle' },
        // ---- Advanced (folded) -----------------------------------------------
        { id: 'status',              label: 'Status',                type: 'select', options: enums('incidentStatuses'),  advanced: true },
        { id: 'witnessNames',        label: 'Witnesses',             type: 'tags',                                          advanced: true },
        { id: 'weatherAtTime',       label: 'Weather at time',       type: 'text',  placeholder: 'temp / wind / precip',     advanced: true },
        { id: 'equipmentInvolved',   label: 'Equipment involved',    type: 'tags',                                          advanced: true },
        { id: 'subAtFault',          label: 'Subcontractor at fault', type: 'text',                                         advanced: true },
        { id: 'propertyDamageEst',   label: 'Property damage est ($)', type: 'number',                                      advanced: true },
        { id: 'costImpact',          label: 'Cost impact ($)',       type: 'number',                                        advanced: true },
        { id: 'noticeOfDelaySent',   label: 'Notice of delay sent',  type: 'toggle',                                        advanced: true },
        { id: 'compensableExcusable', label: 'Compensable / Excusable', type: 'select', options: enums('compensableExcusable'), advanced: true },
        { id: 'floatConsumed',       label: 'Float consumed (hrs)',  type: 'number',                                        advanced: true },
        { id: 'correctiveActions',   label: 'Corrective actions',    type: 'textarea', placeholder: 'action / assignee / due', advanced: true },
        // ---- Compliance / OSHA (only for recordable+) -----------------------
        { id: 'firstAidByWhom',      label: 'First aid administered by', type: 'text',                                      advanced: true },
        { id: 'sentToMedical',       label: 'Sent to medical?',      type: 'toggle',                                        advanced: true },
        { id: 'medicalLocation',     label: 'Clinic / hospital',     type: 'text',                                          advanced: true },
        { id: 'postIncidentDrugTest', label: 'Post-incident drug test?', type: 'toggle',                                    advanced: true },
        { id: 'osha300Entry',        label: 'OSHA 300 entry?',       type: 'toggle',                                        advanced: true },
        { id: 'insuranceClaimNumber', label: 'Insurance claim #',    type: 'text',                                          advanced: true },
        { id: 'daysLost',            label: 'Days lost',             type: 'number',                                        advanced: true },
        { id: 'restrictedDutyDays',  label: 'Restricted duty days',  type: 'number',                                        advanced: true },
        { id: 'reportedToOwner',     label: 'Reported to Owner',     type: 'toggle',                                        advanced: true },
        { id: 'reportedToOsha',      label: 'Reported to OSHA',      type: 'toggle',                                        advanced: true },
        { id: 'reportedToInsurance', label: 'Reported to Insurance', type: 'toggle',                                        advanced: true },
        { id: 'bodyPart',            label: 'Body part affected',    type: 'text',                                          advanced: true },
        { id: 'cause',               label: 'Cause',                 type: 'text',                                          advanced: true },
      ],
    },
    inspection: {
      title: 'Add Inspection',
      voiceHint: hint('inspection', '"Module Prep inspection passed, AHJ inspector, permit BLDG-2025-0421, card #14, 9:30 AM, 2 minor deficiencies."'),
      fields: [
        { id: 'type',                  label: 'Inspection type',       type: 'select', options: enums('inspectionTypes') },
        { id: 'status',                label: 'Result',                type: 'select', options: enums('inspectionResults') },
        { id: 'inspector',             label: 'Inspector',             type: 'text' },
        { id: 'date',                  label: 'Date / time',           type: 'time' },
        { id: 'deficiencies',          label: 'Deficiencies / punch',  type: 'textarea', placeholder: 'desc / severity / due / assignee' },
        { id: 'notes',                 label: 'Notes',                 type: 'textarea' },
        // ---- Advanced ----------------------------------------------------
        { id: 'inspectorAffiliation',  label: 'Inspector affiliation', type: 'select', options: enums('inspectorAffiliations'),    advanced: true },
        { id: 'inspectorContact',      label: 'Inspector contact',     type: 'text',                                                advanced: true },
        { id: 'permitNumber',          label: 'Permit #',              type: 'text',                                                advanced: true },
        { id: 'inspectionCardNumber',  label: 'Inspection card #',     type: 'text',                                                advanced: true },
        { id: 'specCsiSection',        label: 'CSI spec section',      type: 'text', placeholder: 'e.g. 03 30 00 Concrete',          advanced: true },
        { id: 'referenceDrawings',     label: 'Reference drawing(s)',  type: 'text',                                                advanced: true },
        { id: 'itemsInspected',        label: 'Items inspected',       type: 'tags',                                                advanced: true },
        { id: 'reInspectionScheduled', label: 'Re-inspection date',    type: 'date',                                                advanced: true },
        { id: 'testResults',           label: 'Test results',          type: 'textarea', placeholder: 'slump, compaction%, weld UT…', advanced: true },
        { id: 'signOffName',           label: 'Sign-off name',         type: 'text',                                                advanced: true },
      ],
    },
    equipment: {
      title: 'Log Equipment Usage',
      voiceHint: hint('equipment', '"45 foot boom S45H-26609, asset EQ-1042, rented from JLG, 8 hours today 1.5 idle, $410 day rate, fuel 60% added 10 gal, pre-op signed."'),
      fields: [
        { id: 'name',                       label: 'Equipment name',        type: 'text' },
        { id: 'type',                       label: 'Type',                  type: 'select', options: enums('equipmentTypes') },
        { id: 'qty',                        label: 'Quantity on site',      type: 'number' },
        { id: 'status',                     label: 'Status',                type: 'select', options: enums('equipmentStatuses') },
        { id: 'assignedOperator',           label: 'Assigned operator',     type: 'text' },
        { id: 'hoursToday',                 label: 'Hours today',           type: 'number' },
        { id: 'dayRate',                    label: 'Day rate ($)',          type: 'number' },
        { id: 'preShiftInspectionCompleted', label: 'Pre-shift inspection completed', type: 'toggle' },
        { id: 'maintenanceNotes',           label: 'Maintenance notes',     type: 'textarea' },
        // ---- Advanced ----------------------------------------------------
        { id: 'assetTag',                   label: 'Asset tag',             type: 'text',                                            advanced: true },
        { id: 'serials',                    label: 'Serial numbers',        type: 'tags',                                            advanced: true },
        { id: 'ownership',                  label: 'Ownership',             type: 'select', options: enums('equipmentOwnership'),  advanced: true },
        { id: 'rentalVendor',               label: 'Rental vendor (if rented)', type: 'text',                                       advanced: true },
        { id: 'rentalStart',                label: 'Rental start',          type: 'date',                                            advanced: true },
        { id: 'rentalEnd',                  label: 'Rental return',         type: 'date',                                            advanced: true },
        { id: 'operatorCertVerified',       label: 'Operator cert verified', type: 'toggle',                                         advanced: true },
        { id: 'meterReading',               label: 'Hour meter reading',    type: 'number',                                          advanced: true },
        { id: 'idleHours',                  label: 'Idle hours',            type: 'number',                                          advanced: true },
        { id: 'fuelLevel',                  label: 'Fuel level (%)',        type: 'number',                                          advanced: true },
        { id: 'fuelAddedGal',               label: 'Fuel added (gal)',      type: 'number',                                          advanced: true },
        { id: 'costCode',                   label: 'Cost code',             type: 'select', options: enums('costCodes'),            advanced: true },
        { id: 'insuranceExpiry',            label: 'Insurance expiry',      type: 'date',                                            advanced: true },
        { id: 'dotCertExpiry',              label: 'DOT cert expiry',       type: 'date',                                            advanced: true },
      ],
    },
    material: {
      title: 'Add Material',
      voiceHint: hint('material', '"Anchor bolts 3/4 inch Grade 8, structural, 600 received of 600 needed, PO 2210, lot AB-2025-44, mfr Simpson Strong-Tie, all good, stored Yard 2."'),
      fields: [
        { id: 'name',            label: 'Material name',     type: 'text' },
        { id: 'category',        label: 'Category',          type: 'select', options: enums('materialCategories') },
        { id: 'received',        label: 'Received qty',      type: 'number' },
        { id: 'needed',          label: 'Needed qty',        type: 'number' },
        { id: 'unit',            label: 'Unit',              type: 'select', options: enums('units') },
        { id: 'status',          label: 'Status',            type: 'select', options: enums('materialStatuses') },
        { id: 'note',            label: 'Notes',             type: 'textarea' },
        // ---- Advanced ----------------------------------------------------
        { id: 'poNumber',        label: 'PO number',         type: 'text',                                                              advanced: true },
        { id: 'manufacturer',    label: 'Manufacturer',      type: 'text',                                                              advanced: true },
        { id: 'lotSerialHeat',   label: 'Lot / Serial / Heat #', type: 'text',                                                          advanced: true },
        { id: 'specCsiSection',  label: 'CSI spec section',  type: 'text',                                                              advanced: true },
        { id: 'submittalStatus', label: 'Submittal status',  type: 'select', options: ['approved','pending','rejected','n/a'],         advanced: true },
        { id: 'longLeadFlag',    label: 'Long-lead item?',   type: 'toggle',                                                            advanced: true },
        { id: 'storageLocation', label: 'Storage location',  type: 'text',                                                              advanced: true },
        { id: 'storedOffsite',   label: 'Stored offsite?',   type: 'toggle',                                                            advanced: true },
        { id: 'warrantyPeriod',  label: 'Warranty (months)', type: 'number',                                                            advanced: true },
        { id: 'value',           label: 'Value ($)',         type: 'number',                                                            advanced: true },
        { id: 'costCode',        label: 'Cost code',         type: 'select', options: enums('costCodes'),                              advanced: true },
      ],
    },
    note: {
      title: 'New Note',
      voiceHint: hint('note', '"Owner walkthrough Thursday 3 PM, bring D19 status board, pin to dashboard, tag client and meeting, urgent."'),
      // Notes are voice-first — placeholders below tell the user EXACTLY what
      // to mention so the AI can fill the form without follow-up questions.
      // If they cover the prompts, every relevant field gets populated.
      fields: [
        { id: 'title',         label: 'Title',                type: 'text',
          placeholder: 'What is this note about? e.g. "Owner walkthrough Thursday 3 PM"' },
        { id: 'body',          label: 'Body',                 type: 'textarea',
          placeholder: 'Mention: WHO is involved · WHEN (date / time) · CATEGORY (logistics, client, lookahead, safety, communications, PM Decision) · WHAT needs to happen / be brought · ANY follow-up date or owner.\nExample: "Owner walkthrough Thursday 3 PM with Target. Bring D19 status board and 786-A2 photo evidence. Tag client + meeting. Urgent."' },
        { id: 'tags',          label: 'Tags',                 type: 'tags', suggestions: enums('noteTags'),
          placeholder: 'Say one or more · logistics, client, safety, lookahead, communications, hot, PM Decision' },
        { id: 'reminderDate',  label: 'Reminder / follow-up', type: 'date' },
        { id: 'urgent',        label: 'Urgent?',              type: 'toggle' },
        { id: 'pinned',        label: 'Pin to dashboard',     type: 'toggle' },
        // ---- Advanced ----------------------------------------------------
        { id: 'visibility',    label: 'Visibility',           type: 'select', options: enums('visibility'),                                       advanced: true },
        { id: 'linkedModule',  label: 'Linked module',        type: 'select', options: ['none','delivery','equipment','incident','inspection','material'], advanced: true },
        { id: 'linkedRecordId', label: 'Linked record ID',    type: 'text',                                                                       advanced: true },
        { id: 'mentions',      label: 'Mentions (@user)',     type: 'tags',                                                                       advanced: true },
      ],
    },
    // visitor: V2 — Visitor capture submodule deferred (and a dedicated tab
    // hasn't been built yet). Keep visitorTypes / visitorPurposes catalogs and
    // the SEED_VISITORS data for reporting purposes only; capture flow comes
    // back in Phase 2 along with the Visitor sub-tab.
    // ---- NEW: Weather Delay (mobile parity) -------------------------------
    weatherDelay: {
      title: 'Log Weather Delay',
      voiceHint: hint('weatherDelay', '"Wind shut-down on 10th mod, 4:15 PM, lost 1.5 hours, affected slab pour and crane sets, notice sent to owner, 30 min float consumed."'),
      fields: [
        { id: 'delayReason',         label: 'Delay reason',          type: 'select', options: enums('delayReasons') },
        { id: 'weatherCondition',    label: 'Weather condition',     type: 'select', options: enums('weatherConditions') },
        { id: 'startTime',           label: 'Started at',            type: 'time' },
        { id: 'endTime',             label: 'Ended at',              type: 'time' },
        { id: 'hoursLost',           label: 'Hours lost',            type: 'number' },
        { id: 'activitiesAffected',  label: 'Activities affected',   type: 'multiSelect', options: enums('scopes') },
        { id: 'notes',               label: 'Notes',                 type: 'textarea' },
        // ---- Advanced ----------------------------------------------------
        { id: 'sustainedWind',       label: 'Sustained wind (mph)',  type: 'number',                                              advanced: true },
        { id: 'gustMph',             label: 'Gust (mph)',            type: 'number',                                              advanced: true },
        { id: 'precipitationIn',     label: 'Precipitation (in)',    type: 'number',                                              advanced: true },
        { id: 'temp',                label: 'Temp (°F)',             type: 'number',                                              advanced: true },
        { id: 'workforceImpactedCount', label: 'Workforce impacted (count)', type: 'number',                                       advanced: true },
        { id: 'noticeOfDelaySent',   label: 'Notice of delay sent?', type: 'toggle',                                              advanced: true },
        { id: 'floatConsumed',       label: 'Float consumed (hrs)',  type: 'number',                                              advanced: true },
        { id: 'compensableExcusable', label: 'Compensable / Excusable', type: 'select', options: enums('compensableExcusable'),  advanced: true },
      ],
    },
    // ---- NEW: Quantities Installed (Pay App) ------------------------------
    quantitiesInstalled: {
      title: 'Log Quantities Installed',
      voiceHint: hint('quantitiesInstalled', '"Modular set today, 9 mods, total to date 44, of 696 contract, location Dorm 19 floors 1-3, cost code 13-340."'),
      fields: [
        { id: 'scope',           label: 'Scope',              type: 'select', options: enums('scopes') },
        { id: 'unit',            label: 'Unit',               type: 'select', options: enums('units') },
        { id: 'quantityToday',   label: 'Qty today',          type: 'number' },
        { id: 'quantityToDate',  label: 'Qty to date',        type: 'number' },
        { id: 'quantityContract', label: 'Qty contracted',    type: 'number' },
        { id: 'location',        label: 'Location',           type: 'text', placeholder: 'Dorm 19 · Floor 1 · Stairwell' },
        { id: 'notes',           label: 'Notes',              type: 'textarea' },
        // ---- Advanced ----------------------------------------------------
        { id: 'pctComplete',     label: '% Complete (auto)',  type: 'number',                                                    advanced: true },
        { id: 'costCode',        label: 'Cost code',          type: 'select', options: enums('costCodes'),                       advanced: true },
      ],
    },
    // ---- NEW: Subcontractor Daily Report (Phase 2 — gated) ----------------
    subOnSite: {
      title: "Subcontractor Daily Report",
      voiceHint: hint('subOnSite', '"Westervelt sub, 2 guys on site 7 AM to 5 PM, scope structural connections, no incidents, 18 mod stitches complete."'),
      fields: [
        { id: 'subName',         label: 'Subcontractor',      type: 'text' },
        { id: 'trade',           label: 'Trade',              type: 'select', options: enums('trades') },
        { id: 'crewCount',       label: 'Crew count',         type: 'number' },
        { id: 'crewHours',       label: 'Crew hours total',   type: 'number' },
        { id: 'scopeToday',      label: 'Scope today',        type: 'select', options: enums('scopes') },
        { id: 'startTime',       label: 'Start',              type: 'time' },
        { id: 'endTime',         label: 'End',                type: 'time' },
        { id: 'workCompleted',   label: 'Work completed',     type: 'textarea' },
        { id: 'foremanName',     label: 'Foreman on site',    type: 'text' },
        // ---- Advanced ------------------------------------------------------
        { id: 'incidentsToday',  label: 'Incidents today?',   type: 'toggle',     advanced: true },
        { id: 'coiOnFile',       label: 'COI current?',       type: 'toggle',     advanced: true },
      ],
    },
  };
  // Filter each schema's fields against cfg.enabledOptionalFields. Schemas that
  // don't have an entry in raw aren't surfaced.
  const out = {};
  for (const [id, schema] of Object.entries(raw)) {
    out[id] = { ...schema, fields: filterFields(id, schema.fields) };
  }
  return out;
};

// Static fallback (for any consumer that imports this directly).
const ITEM_SCHEMAS = buildItemSchemas(ORG_DASHBOARD_CONFIG);

// ============================================================================
// AI fill simulation — when voice recording stops, this populates a subset of
// fields per schema and sends the residual phrases into the entry's `notes`
// field. In production, an LLM does this; the prototype hard-codes per type.
// ============================================================================
const AI_FILL_SAMPLES = {
  personnel: {
    values: { worker: 'Juan Alencastro', empId: '101', trade: 'GC', role: 'Setter', scopeToday: 'Set', checkIn: '06:30', wageRate: 38, ppe: true },
    residual: 'Crew of 15 on at 6:30. Setters Juan, Eric, Carlos, Mayolo, Miguel, Maciel, Alexis. Panel Ricki, David. Stitch Jose. Prep Anthony, Tyler. Sub Westervelt 2 guys. Juan + Eric asked to learn stair set Friday.',
  },
  delivery: {
    values: { supplier: 'Westervelt Modular', material: 'Mod D19/786-2', qty: 1, unit: 'mod', poNumber: 'PO-3042', status: 'Received', value: 42000 },
    residual: 'Driver mentioned the trailer brake squeal again — second time this month. Recommend Westervelt walkaround at next drop. Mods set down 7:15 AM, all 3 boom lifts fired up.',
  },
  safetyMeeting: {
    values: { topic: 'Boom lift fall protection · 100% tie-off', type: 'Toolbox Talk', lead: 'Erik Odowd', time: '06:35', duration: 12, attendees: 14 },
    residual: 'Crew engaged. Re-emphasized owner cutoff thresholds (25 mph sustained / 35 mph gust). Ricki had a question about double-lanyard configuration on the new JLG.',
  },
  incident: {
    values: { kind: 'Operational delay', title: 'Crane move mid-day · 786-A2 e-box', category: 'Scope change', severity: 'N/A', status: 'OPEN', location: 'Dorm 19 corridor', time: '11:30', impactHours: 1.0, costImpact: 1850, changeOrderTrigger: true, description: '786-A2 stairwell e-box too wide for corridor dimension. Removed box and cut wire per Target Dave Ault.' },
    residual: 'Logged on Target HSI platform with photo evidence. RFI to Westervelt for corrected detail. Crane idle ~1 hr while we cleared. No injuries.',
  },
  inspection: {
    values: { type: 'Module Prep', status: 'Pass', inspector: 'Erik Odowd', date: '09:30' },
    residual: 'Mod 786-A13 had extra 2x6 down the center plus additional chases. Those got covered with OSB. Minor damage noted to corner post; superficial. Photo on file.',
  },
  equipment: {
    values: { name: '45ft Boom Lift', type: 'Boom lift', operator: 'Eric Cortez', hoursToday: 8, dayRate: 410, status: 'ACTIVE', preOpCheck: true },
    residual: 'All 3 boom lifts running. Crane operator noted CT-220 hydraulic pressure dipping mid-afternoon — booking maintenance for tomorrow before picks resume.',
  },
  material: {
    values: { name: 'Anchor bolts 3/4"', category: 'Structural', received: 600, needed: 600, unit: 'pcs', poNumber: 'PO-2210', value: 4200, status: 'ok' },
    residual: 'Grade 8 confirmed per RFI #42. BuildMart issuing credit on yesterday\'s damaged drywall — replacement ships Wednesday.',
  },
  note: {
    values: { title: 'Owner walkthrough · 3 PM Thursday', body: 'Target site visit confirmed. Bring D19 set status board, safety incident log, 786-A2 photo evidence. Chris from Bechtel will lead from their side.', tags: 'client, meeting, communications', pinned: true, urgent: false },
    residual: 'Coordinate w/ Keirsten on the deck content. Pull RFI 42 close-out for the anchor bolt thread.',
  },
  visitor: {
    values: { name: 'Chris (Target / Bechtel)', org: 'Target', purpose: 'Boom lift safety standards review', timeIn: '14:00', timeOut: '15:30', escort: 'Erik Odowd', type: 'Owner' },
    residual: 'Chris taking notes — will distribute to all later. Mentioned Bechtel scrutiny on perceived safety issues continues.',
  },
  weatherDelay: {
    values: { delayReason: 'Wind exceeded threshold', weatherCondition: 'Wind gusts', startTime: '16:15', endTime: '17:00', hoursLost: 0.5, sustainedWind: 22, gustMph: 38, workforceImpactedCount: 15, noticeOfDelaySent: true },
    residual: 'Owner directive (Target). Crew felt within acceptable level but Owner did not feel comfortable. PM Decision logged. 10th mod deferred to tomorrow.',
  },
  quantitiesInstalled: {
    values: { scope: 'Modular set', unit: 'mod', quantityToday: 9, quantityToDate: 44, quantityContract: 696, location: 'Dorm 19 · Floors 1-3' },
    residual: 'Set sequence: 786-2, 786-3, 786-11, 786-4, 786-10, 786-12, 786-13, 786-21. 10th deferred for wind.',
  },
  subOnSite: {
    values: { subName: 'Westervelt', trade: 'GC', crewCount: 2, crewHours: 20, scopeToday: 'Stitch', startTime: '07:00', endTime: '17:00', incidentsToday: false, coiOnFile: true, foremanName: 'Joe Westervelt' },
    residual: 'Joe arrived 7:10 — gate access slow. 18 mod stitches complete today. No incidents.',
  },
};

const CreateItemDialog = ({ type, onClose, onSubmit, config }) => {
  const schemas = config ? buildItemSchemas(config) : ITEM_SCHEMAS;
  const schema = schemas[type];
  const [phase, setPhase] = useState('capture');           // 'capture' | 'review'
  const [recording, setRecording] = useState(false);
  const [transcribed, setTranscribed] = useState(false);   // any voice fill happened?
  const [filledIds, setFilledIds] = useState(new Set());    // which fields AI filled (for purple highlight)
  const [values, setValues] = useState({});
  const [attachOpen, setAttachOpen] = useState(false);
  const [items, setItems] = useState([]);
  if (!schema) return null;
  const setVal = (id, v) => setValues(prev => ({ ...prev, [id]: v }));
  const wave = [4,7,11,15,9,6,4,3,5,8,12,16,13,10,7,5,9,13,15,11,8,5];

  // Determine residual field (per-schema): existing 'notes' / 'note' / 'description' / 'body' / 'workCompleted' fallback to 'notes' (added if missing)
  const residualFieldId = (() => {
    const ids = (schema.fields || []).map(f => f.id);
    if (ids.includes('notes')) return 'notes';
    if (ids.includes('note')) return 'note';
    if (type === 'note' && ids.includes('body')) return 'body';
    if (type === 'incident' && ids.includes('description')) return 'description';
    if (type === 'subOnSite' && ids.includes('workCompleted')) return 'workCompleted';
    return 'notes';
  })();

  // Ensure a notes field exists at the bottom for capture
  const fieldsForRender = (() => {
    const ids = (schema.fields || []).map(f => f.id);
    if (ids.includes(residualFieldId)) return schema.fields;
    return [...(schema.fields || []), { id: residualFieldId, label: 'Notes · voice residual + extra context', type: 'textarea' }];
  })();

  const handleRecord = () => {
    if (recording) {
      // Stop recording → simulate AI fill.
      setRecording(false);
      setTranscribed(true);
      const sample = AI_FILL_SAMPLES[type];
      if (sample) {
        const merged = { ...sample.values, ...values };
        // append residual to existing notes/body content if any
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
  const labelFor = (id) => (fieldsForRender.find(f => f.id === id)?.label) || id;

  const renderValuePreview = (id, v) => {
    if (v === undefined || v === '' || v === null) return null;
    if (typeof v === 'boolean') return v ? 'Yes' : 'No';
    if (Array.isArray(v)) return v.length > 0 ? v.join(', ') : null;
    return String(v);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/45 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col pointer-events-auto" style={{ width: 660, maxHeight: 'calc(100vh - 60px)' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg flex items-center justify-center" style={{ width: 32, height: 32, backgroundColor: schema.danger ? DANGER_BG : PURPLE_LIGHT }}>
                {schema.danger ? <AlertTriangle size={15} className="text-red-700" /> : <Plus size={15} style={{ color: PURPLE_DEEP }} />}
              </div>
              <div>
                <div className="text-[15px] font-bold text-slate-900">{phase === 'review' ? `Review · ${schema.title}` : schema.title}</div>
                <div className="text-[10.5px] text-slate-500">{phase === 'review' ? 'Confirm before saving · nothing\'s mandatory' : 'Tap mic to speak · or fill manually · everything saves'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {phase === 'capture' && transcribed && <Badge tone="green"><Sparkles size={9} /> AI-filled</Badge>}
              {phase === 'review' && <Badge tone="purple">{filledFieldsCount} fields · {items.length} media</Badge>}
              <button onClick={onClose} className="rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center" style={{ width: 30, height: 30 }}>
                <X size={13} className="text-slate-700" />
              </button>
            </div>
          </div>

          {phase === 'capture' && (
            <>
              {/* Voice capture region */}
              <div className="px-5 pt-4 pb-3" style={{ background: `linear-gradient(135deg, ${PURPLE_LIGHT} 0%, #F5F3FF 100%)`, borderBottom: '1px solid #DDD6FE' }}>
                <div className="flex items-start gap-3">
                  <button onClick={handleRecord}
                    className={cls('rounded-full flex items-center justify-center flex-shrink-0 transition-all', recording && 'animate-pulse')}
                    style={{ width: 56, height: 56, backgroundColor: recording ? '#DC2626' : PURPLE, boxShadow: recording ? '0 0 0 6px rgba(220,38,38,0.18)' : '0 0 0 4px rgba(83,74,183,0.18)' }}>
                    {recording ? <Square size={20} className="text-white" /> : <Mic size={22} className="text-white" />}
                  </button>
                  <button onClick={() => setAttachOpen(true)}
                    className="rounded-full flex items-center justify-center flex-shrink-0 bg-white hover:bg-slate-50 transition-colors"
                    style={{ width: 56, height: 56, border: `2px solid ${PURPLE}` }}
                    title="Add photo / video">
                    <Camera size={20} style={{ color: PURPLE }} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-bold mb-1" style={{ color: PURPLE_DEEP }}>
                      {recording ? 'Listening… tap mic to stop' : transcribed ? 'AI filled the form below · talk again to add more, or review →' : 'Tap mic to speak · or fill manually'}
                    </div>
                    {recording && (
                      <div className="flex items-end gap-[2px] h-6">
                        {wave.map((h, i) => (
                          <div key={i} className="rounded-sm" style={{
                            width: 3, height: `${h}px`, backgroundColor: PURPLE_DEEP,
                            animation: `pulseProsetV2 0.6s ${i * 0.04}s ease-in-out infinite alternate`,
                          }} />
                        ))}
                      </div>
                    )}
                    {!recording && (
                      <div className="text-[11px] italic leading-snug" style={{ color: PURPLE_DEEP, opacity: 0.78 }}>
                        Try: {schema.voiceHint}
                      </div>
                    )}
                    <div className="text-[10.5px] mt-1.5 flex items-center gap-1" style={{ color: PURPLE_DEEP, opacity: 0.7 }}>
                      <Info size={10} /> Anything we don't map to a field lands in <strong className="font-bold">Notes</strong> below — nothing gets lost.
                    </div>
                  </div>
                </div>
              </div>

              {/* Form fields — essentials only by default; advanced fields are
                   filtered out by buildItemSchemas() and only appear when the
                   org enables them in cfg.enabledOptionalFields. */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-[10.5px] font-bold uppercase tracking-wide text-slate-500">Form</div>
                  <span className="text-[10px] text-slate-400">no mandatory fields · whatever's filled saves</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {fieldsForRender.map(f => (
                    <FieldInput key={f.id} field={f} value={values[f.id]} setValue={(v) => setVal(f.id, v)} prefilled={filledIds.has(f.id)} isResidual={f.id === residualFieldId && transcribed} />
                  ))}
                </div>

                {/* Photos / videos */}
                {items.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="text-[10.5px] font-bold uppercase tracking-wide text-slate-500 mb-2 flex items-center gap-1.5">
                      <Paperclip size={11} /> Photos / videos · {items.length}
                    </div>
                    <MediaAttachments items={items} onAdd={() => setAttachOpen(true)} captureLabel="Add" />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 px-5 py-3 flex items-center gap-2">
                <div className="text-[10.5px] text-slate-500 flex items-center gap-1">
                  <Sparkles size={10} style={{ color: PURPLE }} /> Auto-routes to Daily Field Report
                </div>
                <div className="flex-1" />
                <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-[12px] font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button onClick={() => setPhase('review')}
                  className="rounded-lg text-white px-5 py-2 text-[12px] font-bold flex items-center gap-1.5"
                  style={{ backgroundColor: schema.danger ? '#DC2626' : PURPLE }}>
                  Review <ArrowRight size={13} />
                </button>
              </div>
            </>
          )}

          {phase === 'review' && (
            <>
              {/* Review summary */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                <div className="rounded-lg p-3 flex items-start gap-2" style={{ backgroundColor: PURPLE_LIGHT }}>
                  <Sparkles size={14} style={{ color: PURPLE_DEEP }} className="mt-0.5 flex-shrink-0" />
                  <div className="text-[11.5px] leading-snug" style={{ color: PURPLE_DEEP }}>
                    <strong>{filledFieldsCount} fields filled</strong>{transcribed && ' · AI filled most via voice, residual went to Notes'}{items.length > 0 && ` · ${items.length} media attached`}. Anything missing? Tap <strong>Edit</strong> to go back.
                  </div>
                </div>

                <div className="space-y-2.5">
                  {fieldsForRender.map(f => {
                    const preview = renderValuePreview(f.id, values[f.id]);
                    if (preview === null) return null;
                    const isResidual = f.id === residualFieldId;
                    return (
                      <div key={f.id} className={cls('rounded-lg border p-2.5', isResidual ? 'border-purple-200 bg-purple-50/30' : 'border-slate-200 bg-white')}>
                        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1 flex items-center gap-1">
                          {isResidual && <Sparkles size={9} style={{ color: PURPLE }} />}
                          {f.label}
                          {filledIds.has(f.id) && <Badge tone="purple"><Sparkles size={8} /> AI</Badge>}
                        </div>
                        <div className="text-[12.5px] text-slate-900 whitespace-pre-line leading-relaxed">{preview}</div>
                      </div>
                    );
                  })}
                  {filledFieldsCount === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center">
                      <div className="text-[12px] text-slate-500 italic">No fields filled yet — but that's fine. Save anyway, or edit to add detail.</div>
                    </div>
                  )}
                </div>

                {items.length > 0 && (
                  <div className="rounded-lg border border-slate-200 p-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-2 flex items-center gap-1">
                      <Paperclip size={9} /> Photos / videos · {items.length}
                    </div>
                    <MediaAttachments items={items} onAdd={() => setAttachOpen(true)} />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 px-5 py-3 flex items-center gap-2">
                <button onClick={() => setPhase('capture')} className="rounded-lg border border-slate-200 px-4 py-2 text-[12px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5">
                  <ArrowLeft size={13} /> Edit
                </button>
                <div className="flex-1" />
                <button onClick={() => { onSubmit?.({ ...values, _attachments: items }); onClose(); }}
                  className="rounded-lg text-white px-5 py-2 text-[12px] font-bold flex items-center gap-1.5"
                  style={{ backgroundColor: schema.danger ? '#DC2626' : PURPLE }}>
                  <Check size={13} /> Save
                </button>
              </div>
            </>
          )}

          {attachOpen && <AddMediaDialog target={schema.title} onClose={() => setAttachOpen(false)} onAdd={(src) => setItems(prev => [...prev, { id: `new-${Date.now()}`, kind: src === 'video' ? 'video' : 'photo', label: `New ${src}`, placeholder: 'crew', durationSec: src === 'video' ? 12 : undefined }])} />}
        </div>
      </div>
    </>
  );
};

const FieldInput = ({ field, value, setValue, prefilled, isResidual }) => {
  const inputClass = cls(
    'w-full rounded-lg border px-2.5 py-1.5 text-[12px] focus:outline-none focus:border-purple-400',
    isResidual ? 'border-purple-300 bg-purple-50/50' : prefilled ? 'border-purple-200 bg-purple-50/30' : 'border-slate-200'
  );
  const wide = ['textarea','tags','multiSelect','attachment'];
  const wrapClass = wide.includes(field.type) ? 'col-span-2' : 'col-span-1';
  const arrayValue = Array.isArray(value) ? value : [];
  const toggleMulti = (opt) => {
    const set = new Set(arrayValue);
    set.has(opt) ? set.delete(opt) : set.add(opt);
    setValue(Array.from(set));
  };
  return (
    <div className={wrapClass}>
      <label className="block text-[10.5px] font-bold text-slate-600 mb-1">
        {field.label}
        {prefilled && <Sparkles size={9} className="inline ml-1" style={{ color: PURPLE }} />}
        {isResidual && <span className="ml-1.5 inline-flex items-center gap-0.5 text-[9px] font-bold rounded px-1 py-0.5" style={{ backgroundColor: PURPLE_LIGHT, color: PURPLE_DEEP }}><Sparkles size={8} /> voice residual</span>}
      </label>
      {field.type === 'text' && <input type="text" placeholder={field.placeholder} value={value || ''} onChange={(e) => setValue(e.target.value)} className={inputClass} />}
      {field.type === 'number' && <input type="number" placeholder={field.placeholder} value={value || ''} onChange={(e) => setValue(e.target.value)} className={inputClass} />}
      {field.type === 'time' && <input type="time" value={value || ''} onChange={(e) => setValue(e.target.value)} className={inputClass} />}
      {field.type === 'date' && <input type="date" value={value || ''} onChange={(e) => setValue(e.target.value)} className={inputClass} />}
      {field.type === 'textarea' && <textarea rows={3} placeholder={field.placeholder} value={value || ''} onChange={(e) => setValue(e.target.value)} className={cls(inputClass, 'resize-none')} />}
      {field.type === 'select' && (
        <select value={value || ''} onChange={(e) => setValue(e.target.value)} className={inputClass}>
          <option value="">Select…</option>
          {(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      )}
      {field.type === 'multiSelect' && (
        <div className="flex flex-wrap gap-1.5">
          {(field.options || []).map(opt => {
            const active = arrayValue.includes(opt);
            return (
              <button key={opt} type="button" onClick={() => toggleMulti(opt)}
                className={cls('rounded-md px-2 py-1 text-[11px] font-semibold border', active ? 'text-white' : 'bg-white text-slate-700 hover:bg-slate-50')}
                style={{ borderColor: active ? PURPLE : BORDER, backgroundColor: active ? PURPLE : undefined }}>
                {active && <Check size={10} className="inline mr-1" />}{opt}
              </button>
            );
          })}
        </div>
      )}
      {field.type === 'tags' && (
        <>
          <input type="text" placeholder={field.placeholder || 'comma-separated'} value={value || ''} onChange={(e) => setValue(e.target.value)} className={inputClass} />
          {field.suggestions && field.suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {field.suggestions.slice(0, 8).map(s => (
                <button key={s} type="button" onClick={() => setValue(((value || '') + (value ? ', ' : '') + s))}
                  className="text-[10px] font-semibold rounded px-1.5 py-0.5 bg-slate-100 text-slate-600 hover:bg-slate-200">+ {s}</button>
              ))}
            </div>
          )}
        </>
      )}
      {field.type === 'attachment' && (
        <button type="button" className="w-full rounded-lg border-2 border-dashed border-slate-300 px-3 py-2 text-[11px] font-bold text-slate-500 hover:bg-slate-50 flex items-center justify-center gap-1.5">
          <Paperclip size={12} /> Attach photo / file
        </button>
      )}
      {field.type === 'toggle' && (
        <button onClick={() => setValue(!value)} type="button" className={cls('rounded-lg px-3 py-1.5 text-[11.5px] font-bold flex items-center gap-1.5', value ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')} style={{ backgroundColor: value ? PURPLE : undefined }}>
          {value ? <Check size={12} /> : <X size={12} />}
          {value ? 'Yes' : 'No'}
        </button>
      )}
    </div>
  );
};

const SimpleDialog = ({ title, onClose, children, onSubmit, submitLabel = 'Save', danger }) => (
  <>
    <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col pointer-events-auto" style={{ width: 560, maxHeight: 'calc(100vh - 80px)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="text-[16px] font-bold text-slate-900">{title}</div>
          <button onClick={onClose} className="rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center" style={{ width: 32, height: 32 }}>
            <X size={14} className="text-slate-700" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <FormFallbackBanner />
          {children}
        </div>
        <div className="border-t border-slate-200 px-5 py-3 flex gap-2 justify-end">
          <button onClick={onClose} className="rounded-lg text-white px-5 py-2 font-bold text-[13px]" style={{ backgroundColor: TEXT }}>Cancel</button>
          <button onClick={() => { onSubmit?.(); onClose(); }} className="rounded-lg text-white px-5 py-2 font-bold text-[13px]" style={{ backgroundColor: danger ? '#EF4444' : PURPLE }}>{submitLabel}</button>
        </div>
      </div>
    </div>
  </>
);

// ============================================================================
// APP ROOT
// ============================================================================
export default function MerlinSiteProsetWebV2() {
  const [project]        = useState(PROJECTS[0]);
  const [role, setRole]  = useState('foreman');
  const [dark, setDark]  = useState(false);
  const [sidebarActive, setSidebarActive] = useState('projects');
  const [topTab, setTopTab]               = useState('onsite');
  const [voiceOpen, setVoiceOpen]         = useState(false);
  const [createOpen, setCreateOpen]       = useState(false);
  const [configOpen, setConfigOpen]       = useState(false);
  const [dialog, setDialog]               = useState(null);
  const [dashboardConfig, setDashboardConfig] = useState(ORG_DASHBOARD_CONFIG);

  const personnel  = SEED_PERSONNEL;
  const equipment  = SEED_EQUIPMENT;
  const deliveries = SEED_DELIVERIES;
  const incidents  = SEED_INCIDENTS;
  const inspections= SEED_INSPECTIONS;
  const visitors   = SEED_VISITORS;
  const reportText = SEED_REPORT_TEXT;

  const updateWidget = (id, enabled) => {
    setDashboardConfig(prev => ({ ...prev, widgetCatalog: { ...prev.widgetCatalog, [id]: { ...prev.widgetCatalog[id], enabled } } }));
  };
  const updateCatalog = (key, nextValues) => {
    setDashboardConfig(prev => ({ ...prev, catalogs: { ...prev.catalogs, [key]: nextValues } }));
  };
  const updateFlag = (key, value) => {
    setDashboardConfig(prev => ({ ...prev, featureFlags: { ...prev.featureFlags, [key]: value } }));
  };
  const updateReportSection = (id, op) => {
    setDashboardConfig(prev => {
      const cur = prev.reportTemplate?.sections || [];
      const next = op === 'add' ? (cur.includes(id) ? cur : [...cur, id])
                : op === 'remove' ? cur.filter(x => x !== id)
                : cur;
      return { ...prev, reportTemplate: { ...prev.reportTemplate, sections: next } };
    });
  };
  const reorderReportSection = (id, dir) => {
    setDashboardConfig(prev => {
      const cur = [...(prev.reportTemplate?.sections || [])];
      const i = cur.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= cur.length) return prev;
      [cur[i], cur[j]] = [cur[j], cur[i]];
      return { ...prev, reportTemplate: { ...prev.reportTemplate, sections: cur } };
    });
  };
  const updateVoiceHint = (key, value) => {
    setDashboardConfig(prev => ({ ...prev, voiceHints: { ...prev.voiceHints, [key]: value } }));
  };

  return (
    <div className="flex h-screen bg-slate-50 font-[system-ui,-apple-system,Roboto,sans-serif] overflow-hidden" style={{ color: TEXT }}>
      <style>{`@keyframes pulseProsetV2 { from { transform: scaleY(0.4); opacity: 0.6; } to { transform: scaleY(1); opacity: 1; } }`}</style>

      <MerlinSidebar active={sidebarActive} onNavigate={setSidebarActive} role={role} setRole={setRole} dark={dark} setDark={setDark} />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <ProjectTopNav activeTab={topTab} onTab={setTopTab} onAskAI={() => setVoiceOpen(true)} onCreate={() => setCreateOpen(true)} notifications={9} />

        <main className="flex-1 overflow-y-auto">
          {topTab === 'onsite' && <OnSitePage project={project} personnel={personnel} equipment={equipment} deliveries={deliveries} incidents={incidents} inspections={inspections} visitors={visitors} toolboxTalks={SEED_TOOLBOX_TALKS} notes={SEED_NOTES} materials={SEED_MATERIALS} voiceCommentary={SEED_VOICE_COMMENTARY} matReconciliation={SEED_MAT_RECONCILIATION} audioSummary={AI_DAILY_SUMMARY_AUDIO} summaryEntries={SUMMARY_ENTRIES} reportText={reportText} dashboardConfig={dashboardConfig} reportTemplate={dashboardConfig.reportTemplate} onOpenModal={(m) => setDialog(m)} onAskAI={() => setVoiceOpen(true)} onOpenSettings={() => setConfigOpen(true)} />}
          {topTab !== 'onsite' && (
            <div className="px-6 py-12 max-w-[1480px] mx-auto">
              <Card>
                <div className="flex flex-col items-center text-center py-16">
                  <div className="rounded-full flex items-center justify-center mb-3" style={{ width: 72, height: 72, backgroundColor: PURPLE_LIGHT }}>
                    <Layers size={32} style={{ color: PURPLE_DEEP }} strokeWidth={1.6} />
                  </div>
                  <div className="text-[18px] font-bold text-slate-900 mb-1 capitalize">{topTab}</div>
                  <div className="text-[12px] text-slate-500 max-w-[400px]">Existing Merlin tab — out of PLAT-104 scope. The On-Site tab holds the daily-log capture flow.</div>
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>

      <QuickCreateMenu open={createOpen} onClose={() => setCreateOpen(false)} onPick={(id) => { setCreateOpen(false); setDialog(id); }} config={dashboardConfig} />
      <VoicePanel open={voiceOpen} onClose={() => setVoiceOpen(false)} />
      <OrgConfigPanel open={configOpen} onClose={() => setConfigOpen(false)} dashboardConfig={dashboardConfig}
        onUpdate={updateWidget}
        onUpdateCatalog={updateCatalog}
        onUpdateFlag={updateFlag}
        onUpdateReportSection={updateReportSection}
        onReorderReportSection={reorderReportSection}
        onUpdateVoiceHint={updateVoiceHint} />

      {dialog === 'logPersonnel'    && <CreateItemDialog type="personnel"           config={dashboardConfig} onClose={() => setDialog(null)} />}
      {dialog === 'logDelivery'     && <CreateItemDialog type="delivery"            config={dashboardConfig} onClose={() => setDialog(null)} />}
      {dialog === 'logEquipment'    && <CreateItemDialog type="equipment"           config={dashboardConfig} onClose={() => setDialog(null)} />}
      {dialog === 'incident'        && <CreateItemDialog type="incident"            config={dashboardConfig} onClose={() => setDialog(null)} />}
      {dialog === 'inspection'      && <CreateItemDialog type="inspection"          config={dashboardConfig} onClose={() => setDialog(null)} />}
      {dialog === 'logToolboxTalk'  && <CreateItemDialog type="safetyMeeting"       config={dashboardConfig} onClose={() => setDialog(null)} />}
      {dialog === 'logSafetyMeeting'&& <CreateItemDialog type="safetyMeeting"       config={dashboardConfig} onClose={() => setDialog(null)} />}
      {dialog === 'logMaterial'     && <CreateItemDialog type="material"            config={dashboardConfig} onClose={() => setDialog(null)} />}
      {dialog === 'logNote'         && <CreateItemDialog type="note"                config={dashboardConfig} onClose={() => setDialog(null)} />}
      {/* logVisitor: V2 — capture dialog deferred */}
      {dialog === 'logProblemDelay' && <CreateItemDialog type="incident"            config={dashboardConfig} onClose={() => setDialog(null)} />}
      {dialog === 'logWeatherDelay' && <CreateItemDialog type="weatherDelay"        config={dashboardConfig} onClose={() => setDialog(null)} />}
      {dialog === 'logQuantities'   && <CreateItemDialog type="quantitiesInstalled" config={dashboardConfig} onClose={() => setDialog(null)} />}
      {dialog === 'logSubOnSite'    && <CreateItemDialog type="subOnSite"           config={dashboardConfig} onClose={() => setDialog(null)} />}
      {dialog === 'previewPDF'      && <PdfPreviewDialog onClose={() => setDialog(null)} project={project} reportTemplate={dashboardConfig.reportTemplate} dashboardConfig={dashboardConfig} />}
      {dialog === 'quickShare'      && <QuickShareDialog onClose={() => setDialog(null)} project={project} reportTemplate={dashboardConfig.reportTemplate} />}
      {dialog === 'logTask'         && <SimpleDialog title="New Task / Work Order" onClose={() => setDialog(null)} submitLabel="Create"><div className="text-[12px] text-slate-500">Form fields: Title · Assignee · Priority · Due date · Location · Tag (#punchlist)</div></SimpleDialog>}
    </div>
  );
}
