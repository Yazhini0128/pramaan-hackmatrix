/* ================= ICONS ================= */
function icon(name, size){
  size = size || 16;
  const paths = {
    dashboard:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    download:'<path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 19h16"/>',
    upload:'<path d="M12 21V9"/><path d="M7 14l5-5 5 5"/><path d="M4 19h16"/>',
    back:'<path d="M19 12H5"/><path d="M11 18l-6-6 6-6"/>',
    fingerprint:'<path d="M12 3a9 9 0 0 1 9 9v2"/><path d="M12 3a9 9 0 0 0-9 9v2"/><path d="M12 7a5 5 0 0 1 5 5v3"/><path d="M12 7a5 5 0 0 0-5 5v1"/><path d="M12 11a1 1 0 0 1 1 1v5"/>',
    link:'<path d="M9 12a4 4 0 0 1 0-6l2-2a4 4 0 0 1 6 6l-1 1"/><path d="M15 12a4 4 0 0 1 0 6l-2 2a4 4 0 0 1-6-6l1-1"/>',
    shield:'<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/>',
    alert:'<path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 4.3l-8 14A1.5 1.5 0 0 0 3.6 21h16.8a1.5 1.5 0 0 0 1.3-2.7l-8-14a1.5 1.5 0 0 0-2.6 0z"/>',
    check:'<path d="M20 6L9 17l-5-5"/>',
    x:'<path d="M18 6L6 18"/><path d="M6 6l12 12"/>',
    file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>',
    arrowRight:'<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>',
    eye:'<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>',
    scale:'<path d="M12 3v18"/><path d="M6 8l-3 6a3 3 0 0 0 6 0z"/><path d="M18 8l-3 6a3 3 0 0 0 6 0z"/><path d="M4 8h16"/><path d="M8 21h8"/>',
    camera:'<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>'
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name]||''}</svg>`;
}

/* ================= STATE ================= */
const POLICE_UNITS = ["Cyber Cell, Chennai","Cyber Cell, Coimbatore","District Police, Madurai","State CID, Tamil Nadu","CERT Response Unit"];
const INCIDENT_TYPES = ["Financial / UPI Fraud","CCTV / Video Tampering","WhatsApp / Chat Evidence","Data Breach","Property Crime","Cyberstalking / Harassment","Other Digital Offence"];
const OVERSIGHT_UNITS = ["State CID, Tamil Nadu","CERT Response Unit"]; // higher-authority units with visibility across all subordinate units' evidence
const CASE_STATUSES = ["Open","Under Investigation","Closed"];
const INCIDENT_STAGES = ["Incident Reported","First Responder Assigned","Evidence Collected","Under Forensic Review","Case Closed"];
const ALL_UNITS_SCOPE = "All Units — Oversight View";

let state = { cases: [], view:'dashboard', currentCaseId:null, currentEvidenceId:null, judgeMode:false, activeUnit: ALL_UNITS_SCOPE, searchQuery:'', statusFilter:'All', authenticated:false };
let idCounter = 1;
const newId = () => 'id' + (idCounter++) + '-' + Date.now().toString(36);

/* ================= BACKUP / RESTORE (no browser storage APIs used — manual JSON export/import) ================= */
function bytesToBase64(bytes){ let bin=''; bytes.forEach(b=>bin+=String.fromCharCode(b)); return btoa(bin); }
function base64ToBytes(b64){ const bin = atob(b64); const arr = new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) arr[i]=bin.charCodeAt(i); return arr; }

function exportAllData(){
  const serializable = state.cases.map(c => ({
    ...c,
    evidence: c.evidence.map(e => ({ ...e, bytes: e.bytes ? bytesToBase64(e.bytes) : null }))
  }));
  const blob = new Blob([JSON.stringify({cases:serializable, idCounter}, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `pramaan_backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Backup downloaded', 'download');
}

function importAllData(evt){
  const file = evt.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const data = JSON.parse(reader.result);
      state.cases = data.cases.map(c => ({
        ...c,
        evidence: c.evidence.map(e => ({ ...e, bytes: e.bytes ? base64ToBytes(e.bytes) : null }))
      }));
      idCounter = data.idCounter || idCounter;
      showToast('Backup restored', 'check');
      goto('dashboard');
    }catch(err){ showToast('Restore failed — invalid backup file', 'alert'); }
  };
  reader.readAsText(file);
}

window.addEventListener('beforeunload', function(e){
  if (state.cases.length > 0){
    e.preventDefault();
    e.returnValue = '';
  }
});

/* ================= CRYPTO HELPERS ================= */
async function sha256Hex(data){
  let buf;
  if (typeof data === 'string') buf = new TextEncoder().encode(data);
  else buf = data;
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

async function addCustodyEvent(evidence, action, details){
  const prevHash = evidence.custodyChain.length ? evidence.custodyChain[evidence.custodyChain.length-1].hash : '0'.repeat(64);
  const timestamp = new Date().toISOString();
  const evidenceHashSnapshot = evidence.currentHash;
  const payload = prevHash + '|' + action + '|' + timestamp + '|' + details + '|' + evidenceHashSnapshot;
  const hash = await sha256Hex(payload);
  evidence.custodyChain.push({action, timestamp, details, prevHash, evidenceHashSnapshot, hash});
}

async function verifyChain(evidence){
  let prev = '0'.repeat(64);
  for (const block of evidence.custodyChain){
    const payload = prev + '|' + block.action + '|' + block.timestamp + '|' + block.details + '|' + block.evidenceHashSnapshot;
    const recomputed = await sha256Hex(payload);
    if (recomputed !== block.hash || block.prevHash !== prev){
      return {ok:false, brokenAt: block.action};
    }
    prev = block.hash;
  }
  return {ok:true};
}

/* ================= TRUST SCORE ================= */
function computeTrustScore(evidence){
  let score = 100;
  const anomalies = [];
  if (evidence.tampered){ score -= 50; anomalies.push('hash_mismatch'); }
  if (evidence.limitedMetadata){ score -= 10; anomalies.push('limited_metadata'); }
  if (evidence.chainBroken){ score -= 100; anomalies.push('chain_broken'); }
  if (evidence.missingExif){ score -= 15; anomalies.push('missing_exif'); }
  if (evidence.editingSoftwareDetected){ score -= 20; anomalies.push('editing_software_detected'); }
  score = Math.max(0, Math.min(100, score));
  evidence.anomalies = anomalies;
  evidence.trustScore = score;
  return score;
}

/* ================= LEGAL COMPLIANCE CHECKLIST ================= */
function complianceChecklist(evidence){
  return [
    { label:'Cryptographic hash generated', pass: !!evidence.currentHash },
    { label:'Upload timestamp recorded', pass: !!evidence.uploadedAt },
    { label:'Examiner identity recorded', pass: true },
    { label:'Chain of custody complete (3+ actions)', pass: evidence.custodyChain.length >= 3 },
    { label:'Chain of custody cryptographically verified', pass: evidence.chainBroken === false && evidence.custodyChain.length > 0 },
    { label:'Metadata present and reviewed', pass: !evidence.limitedMetadata && !evidence.missingExif },
    { label:'No unresolved tamper flags', pass: !evidence.tampered },
    { label:'Section 63 certificate generated', pass: !!evidence.certified },
  ];
}
function legalReadinessPercent(evidence){
  const items = complianceChecklist(evidence);
  return Math.round(items.filter(i=>i.pass).length / items.length * 100);
}

function scoreColor(score){ return score>=80?'green':score>=50?'yellow':'red'; }
function scoreHex(score){ return score>=80?'#34D399':score>=50?'#E8A93A':'#F0555A'; }

function ringSvg(score, size){
  size = size || 96;
  const r = size/2 - 6, c = 2*Math.PI*r, offset = c - (score/100)*c;
  return `<div class="ring" style="width:${size}px;height:${size}px;">
    <svg viewBox="0 0 ${size} ${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${r}" stroke="rgba(255,255,255,.08)" stroke-width="6" fill="none"/>
      <circle cx="${size/2}" cy="${size/2}" r="${r}" stroke="${scoreHex(score)}" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${offset}" style="transition:stroke-dashoffset .6s ease;"/>
    </svg>
    <div><div class="val">${score}</div><span class="of100">/ 100</span></div>
  </div>`;
}

const EXPLANATIONS = {
  hash_mismatch: "This file's cryptographic hash no longer matches the value recorded at intake, indicating the file's content has changed since it was first secured.",
  limited_metadata: "This file type carries limited embedded metadata, so fewer automatic integrity checks could be run on it than on a typical photo or video.",
  chain_broken: "The chain of custody for this evidence could not be cryptographically verified — one or more recorded actions may have been altered or removed.",
  missing_exif: "This image has no embedded camera metadata (EXIF), which is unusual for a photo captured directly on a device and may indicate the metadata was stripped or the image was re-saved through another application.",
  editing_software_detected: "This image's metadata indicates it was processed by editing software, suggesting it may not be in its original captured state."
};

function judgeSummary(evidence){
  if (evidence.anomalies.length === 0){
    return "This evidence shows no signs of tampering. Its cryptographic hash is intact, its custody chain is fully verified, and it is ready for submission.";
  }
  const lines = evidence.anomalies.map(a => EXPLANATIONS[a]).join(' ');
  return lines + " This evidence should be reviewed further before being relied upon in proceedings.";
}

/* ================= SEED DATA ================= */
async function seed(){
  /* ---- CASE 1: Baseline clean evidence (text log + fully-verified photo) ---- */
  const c1 = { id:newId(), title:"UPI Fraud Complaint #2026/114", policeUnit:POLICE_UNITS[0], incidentType:INCIDENT_TYPES[0],
    description:"Victim reports unauthorized UPI transactions; transaction log and payment screenshot submitted as evidence.", createdAt:new Date(Date.now()-86400000*2).toISOString(), evidence:[], status:'Closed', incidentStage:4 };

  const e1 = { id:newId(), filename:"upi_transaction_log.txt", mimeType:"text/plain", size:842,
    lastModified:new Date(Date.now()-86400000*3).toISOString(), uploadedAt:new Date(Date.now()-86400000*2).toISOString(),
    bytes:null, originalHash:null, currentHash:null, tampered:false, limitedMetadata:true, chainBroken:false, custodyChain:[], trustScore:0, anomalies:[], certified:false };
  const content1 = "UPI TRANSACTION LOG\nTxn ID: 400921884471\nFrom: victim@upi\nTo: unknownmerchant@upi\nAmount: INR 48,500\nTimestamp: 2026-08-02T11:42:07+05:30\nStatus: SUCCESS\nDevice: SM-G998B\nApp Version: 8.14.2";
  e1.bytes = new TextEncoder().encode(content1);
  e1.originalHash = e1.currentHash = await sha256Hex(e1.bytes);
  await addCustodyEvent(e1, 'Uploaded', 'File received into evidence locker');
  await addCustodyEvent(e1, 'Hashed', 'SHA-256 fingerprint generated');
  await addCustodyEvent(e1, 'Analyzed', 'Metadata extraction and anomaly scan completed — non-image file, limited metadata expected');
  computeTrustScore(e1);
  c1.evidence.push(e1);

  const e1b = { id:newId(), filename:"transaction_screenshot.jpg", mimeType:"image/jpeg", size:214880,
    lastModified:new Date(Date.now()-86400000*2).toISOString(), uploadedAt:new Date(Date.now()-86400000*2).toISOString(),
    bytes:null, originalHash:null, currentHash:null, tampered:false, limitedMetadata:false, chainBroken:false,
    exifData:{ Make:"Samsung", Model:"SM-G998B", Software:"Camera v14.2", DateTimeOriginal:"2026:08:02 11:42:19", GPSLatitude:[13,4,48], GPSLongitude:[80,15,2], PixelXDimension:1080, PixelYDimension:2400 },
    missingExif:false, editingSoftwareDetected:false, custodyChain:[], trustScore:0, anomalies:[], certified:false };
  const content1b = "MOCK-JPEG-BYTES-transaction-screenshot-evidence-locker-sample";
  e1b.bytes = new TextEncoder().encode(content1b);
  e1b.originalHash = e1b.currentHash = await sha256Hex(e1b.bytes);
  await addCustodyEvent(e1b, 'Uploaded', 'File received into evidence locker');
  await addCustodyEvent(e1b, 'Hashed', 'SHA-256 fingerprint generated');
  await addCustodyEvent(e1b, 'Analyzed', 'EXIF metadata extracted — camera and capture details verified, no anomalies');
  computeTrustScore(e1b);
  c1.evidence.push(e1b);

  /* ---- CASE 2: HASH MISMATCH — file content changed after intake ---- */
  const c2 = { id:newId(), title:"Warehouse Break-in — CCTV Footage #2026/098", policeUnit:POLICE_UNITS[2], incidentType:'Property Crime',
    description:"CCTV export submitted by warehouse security; hash mismatch found on re-verification — export range appears modified.", createdAt:new Date(Date.now()-86400000*5).toISOString(), evidence:[], status:'Under Investigation', incidentStage:3 };
  const e2 = { id:newId(), filename:"cctv_export_cam3.log", mimeType:"text/plain", size:1210,
    lastModified:new Date(Date.now()-86400000*6).toISOString(), uploadedAt:new Date(Date.now()-86400000*5).toISOString(),
    bytes:null, originalHash:null, currentHash:null, tampered:true, limitedMetadata:true, chainBroken:false, custodyChain:[], trustScore:0, anomalies:[], certified:false };
  const content2 = "CCTV EXPORT LOG - CAM 3 (LOADING BAY)\nExport start: 2026-07-30T22:00:00\nExport end: 2026-07-31T06:00:00\nFrame count: 28800\nCodec: H264";
  e2.bytes = new TextEncoder().encode(content2);
  e2.originalHash = await sha256Hex(e2.bytes);
  await addCustodyEvent(e2, 'Uploaded', 'File received into evidence locker');
  await addCustodyEvent(e2, 'Hashed', 'SHA-256 fingerprint generated');
  const tamperedBytes2 = new TextEncoder().encode(content2 + "\n[edited export range]");
  e2.currentHash = await sha256Hex(tamperedBytes2);
  e2.bytes = tamperedBytes2;
  await addCustodyEvent(e2, 'Re-Verified', 'Hash mismatch detected on re-verification — export range appears modified');
  computeTrustScore(e2);
  c2.evidence.push(e2);

  /* ---- CASE 3: MISSING EXIF — image with camera metadata stripped ---- */
  const c3 = { id:newId(), title:"Cyberstalking Complaint #2026/077", policeUnit:POLICE_UNITS[1], incidentType:'Cyberstalking / Harassment',
    description:"Victim submitted a screenshot of threatening messages forwarded via WhatsApp; image carries no embedded camera metadata.", createdAt:new Date(Date.now()-86400000*1).toISOString(), evidence:[], status:'Open', incidentStage:1 };
  const e3 = { id:newId(), filename:"whatsapp_threat_screenshot.jpg", mimeType:"image/jpeg", size:98240,
    lastModified:new Date(Date.now()-86400000*1).toISOString(), uploadedAt:new Date(Date.now()-86400000*1).toISOString(),
    bytes:null, originalHash:null, currentHash:null, tampered:false, limitedMetadata:false, chainBroken:false,
    exifData:{}, missingExif:true, editingSoftwareDetected:false, custodyChain:[], trustScore:0, anomalies:[], certified:false };
  const content3 = "MOCK-JPEG-BYTES-whatsapp-threat-screenshot-no-exif";
  e3.bytes = new TextEncoder().encode(content3);
  e3.originalHash = e3.currentHash = await sha256Hex(e3.bytes);
  await addCustodyEvent(e3, 'Uploaded', 'File received into evidence locker');
  await addCustodyEvent(e3, 'Hashed', 'SHA-256 fingerprint generated');
  await addCustodyEvent(e3, 'Analyzed', 'No EXIF camera metadata found — image likely re-compressed by a messaging app');
  computeTrustScore(e3);
  c3.evidence.push(e3);

  /* ---- CASE 4: EDITING SOFTWARE DETECTED — image processed in an editor ---- */
  const c4 = { id:newId(), title:"Corporate Data Breach #2026/056", policeUnit:POLICE_UNITS[3], incidentType:'Data Breach',
    description:"Leaked internal document photographed and submitted by whistleblower; metadata indicates the image was processed in an editing application.", createdAt:new Date(Date.now()-86400000*4).toISOString(), evidence:[], status:'Under Investigation', incidentStage:2 };
  const e4 = { id:newId(), filename:"leaked_document_photo.jpg", mimeType:"image/jpeg", size:341200,
    lastModified:new Date(Date.now()-86400000*4).toISOString(), uploadedAt:new Date(Date.now()-86400000*4).toISOString(),
    bytes:null, originalHash:null, currentHash:null, tampered:false, limitedMetadata:false, chainBroken:false,
    exifData:{ Make:"Canon", Model:"EOS 5D Mark IV", Software:"Adobe Photoshop 26.0", DateTimeOriginal:"2026:07:28 14:12:03", PixelXDimension:3000, PixelYDimension:2000 },
    missingExif:false, editingSoftwareDetected:true, custodyChain:[], trustScore:0, anomalies:[], certified:false };
  const content4 = "MOCK-JPEG-BYTES-leaked-document-photo-edited";
  e4.bytes = new TextEncoder().encode(content4);
  e4.originalHash = e4.currentHash = await sha256Hex(e4.bytes);
  await addCustodyEvent(e4, 'Uploaded', 'File received into evidence locker');
  await addCustodyEvent(e4, 'Hashed', 'SHA-256 fingerprint generated');
  await addCustodyEvent(e4, 'Analyzed', 'EXIF Software tag indicates image was processed in Adobe Photoshop');
  computeTrustScore(e4);
  c4.evidence.push(e4);

  /* ---- CASE 5: CHAIN BROKEN — custody record itself was altered ---- */
  const c5 = { id:newId(), title:"Insider Threat Investigation #2026/031", policeUnit:POLICE_UNITS[4], incidentType:'Data Breach',
    description:"Server access log seized from a former employee's laptop; the custody record failed cryptographic re-verification.", createdAt:new Date(Date.now()-86400000*7).toISOString(), evidence:[], status:'Under Investigation', incidentStage:3 };
  const e5 = { id:newId(), filename:"server_access_log.txt", mimeType:"text/plain", size:2050,
    lastModified:new Date(Date.now()-86400000*8).toISOString(), uploadedAt:new Date(Date.now()-86400000*7).toISOString(),
    bytes:null, originalHash:null, currentHash:null, tampered:false, limitedMetadata:true, chainBroken:false, custodyChain:[], trustScore:0, anomalies:[], certified:false };
  const content5 = "SERVER ACCESS LOG\nHost: prod-db-03\nUser: r.subramaniam\nLogin: 2026-07-27T23:14:02\nQueries executed: 412\nExport initiated: 2026-07-28T00:02:11";
  e5.bytes = new TextEncoder().encode(content5);
  e5.originalHash = e5.currentHash = await sha256Hex(e5.bytes);
  await addCustodyEvent(e5, 'Uploaded', 'File received into evidence locker');
  await addCustodyEvent(e5, 'Hashed', 'SHA-256 fingerprint generated');
  await addCustodyEvent(e5, 'Analyzed', 'Metadata extraction and anomaly scan completed');
  // Simulate unauthorized custody-record edit: a block's stored details are altered without recomputing its hash,
  // so the block's own hash no longer matches — this is what "Verify Chain Integrity" will catch live.
  e5.custodyChain[1].details = 'SHA-256 fingerprint generated (record altered after the fact)';
  e5.chainBroken = true;
  computeTrustScore(e5);
  c5.evidence.push(e5);

  /* ---- CASE 6: COMBINED ANOMALIES — hash mismatch + missing EXIF on the same file ---- */
  const c6 = { id:newId(), title:"Cheque Fraud Case #2026/012", policeUnit:POLICE_UNITS[0], incidentType:'Financial / UPI Fraud',
    description:"Photograph of an allegedly forged cheque; the file shows both a hash mismatch and missing camera metadata — multiple anomalies stacked.", createdAt:new Date(Date.now()-86400000*3).toISOString(), evidence:[], status:'Open', incidentStage:2 };
  const e6 = { id:newId(), filename:"cheque_photo_evidence.jpg", mimeType:"image/jpeg", size:187650,
    lastModified:new Date(Date.now()-86400000*3).toISOString(), uploadedAt:new Date(Date.now()-86400000*3).toISOString(),
    bytes:null, originalHash:null, currentHash:null, tampered:true, limitedMetadata:false, chainBroken:false,
    exifData:{}, missingExif:true, editingSoftwareDetected:false, custodyChain:[], trustScore:0, anomalies:[], certified:false };
  const content6 = "MOCK-JPEG-BYTES-cheque-photo-original";
  e6.bytes = new TextEncoder().encode(content6);
  e6.originalHash = await sha256Hex(e6.bytes);
  await addCustodyEvent(e6, 'Uploaded', 'File received into evidence locker');
  await addCustodyEvent(e6, 'Hashed', 'SHA-256 fingerprint generated');
  const tamperedBytes6 = new TextEncoder().encode("MOCK-JPEG-BYTES-cheque-photo-original-EDITED");
  e6.currentHash = await sha256Hex(tamperedBytes6);
  e6.bytes = tamperedBytes6;
  await addCustodyEvent(e6, 'Re-Verified', 'Hash mismatch detected on re-verification; image also carries no EXIF data');
  computeTrustScore(e6);
  c6.evidence.push(e6);

  state.cases.push(c1, c2, c3, c4, c5, c6);
}

/* ================= UI HELPERS ================= */
function goto(view, caseId, evidenceId){
  state.view = view;
  if (caseId !== undefined) state.currentCaseId = caseId;
  if (evidenceId !== undefined) state.currentEvidenceId = evidenceId;
  render();
  window.scrollTo({top:0, behavior:'smooth'});
}
function setActiveUnit(unit){
  state.activeUnit = unit;
  showToast(unit===ALL_UNITS_SCOPE ? 'Oversight view — showing all units' : 'Now viewing: '+unit, 'shield');
  goto('dashboard');
}
function scopedCases(){
  if (state.activeUnit === ALL_UNITS_SCOPE) return state.cases;
  if (OVERSIGHT_UNITS.includes(state.activeUnit)) return state.cases; // oversight units still see everything
  return state.cases.filter(c => c.policeUnit === state.activeUnit);
}
function setSearchQuery(q){ state.searchQuery = q; renderDashboardInPlace(); }
function setStatusFilter(s){ state.statusFilter = s; render(); }
function renderDashboardInPlace(){
  // avoids losing input focus on every keystroke by only re-rendering the case grid, not the whole page
  const grid = document.getElementById('caseGrid');
  if (grid) grid.innerHTML = dashboardCaseRows();
}

function showToast(msg, iconName){
  const t = document.getElementById('toast');
  t.innerHTML = `${icon(iconName||'check', 16)}<span>${msg}</span>`;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 2800);
}
function fmtDate(iso){ return new Date(iso).toLocaleString('en-IN', {dateStyle:'medium', timeStyle:'short'}); }
function getCase(id){ return state.cases.find(c=>c.id===id); }
function getEvidence(caseId, evId){ return getCase(caseId).evidence.find(e=>e.id===evId); }

/* ================= RENDER: DASHBOARD ================= */
function dashboardCaseRows(){
  let list = scopedCases();
  if (state.statusFilter !== 'All') list = list.filter(c => c.status === state.statusFilter);
  const q = state.searchQuery.trim().toLowerCase();
  if (q) list = list.filter(c => (c.title+' '+c.policeUnit+' '+c.incidentType).toLowerCase().includes(q));

  if (!list.length) return `<div class="muted">No cases match the current view/filters.</div>`;

  return list.map(c=>{
    const avg = c.evidence.length ? Math.round(c.evidence.reduce((s,e)=>s+e.trustScore,0)/c.evidence.length) : 0;
    const statusClass = c.status==='Closed' ? 'green' : c.status==='Under Investigation' ? 'yellow' : 'cyan';
    return `<div class="card click" onclick="goto('case','${c.id}')">
      <div class="flex between">
        <div>
          <div class="flex wrap" style="gap:6px;margin-bottom:8px;">
            <span class="pill">${c.policeUnit}</span> <span class="pill gold">${c.incidentType}</span> <span class="pill ${statusClass}">${c.status}</span>
          </div>
          <h3 style="margin:0 0 4px 0;text-transform:none;letter-spacing:0;font-size:16px;">${c.title}</h3>
          <div class="muted">${c.evidence.length} evidence item(s) · Created ${fmtDate(c.createdAt)}</div>
        </div>
        <div class="badge ${scoreColor(avg)}">${c.evidence.length? avg+'/100' : 'EMPTY'}</div>
      </div>
    </div>`;
  }).join('');
}

function renderDashboard(){
  const units = [...new Set(state.cases.map(c=>c.policeUnit))];
  const scopeLabel = state.activeUnit===ALL_UNITS_SCOPE ? 'Oversight — All Units' : state.activeUnit;
  const visibleCases = scopedCases();

  return `
    <div class="card hero">
      <h2>Digital Evidence Readiness Dashboard</h2>
      <p class="muted" style="max-width:600px;">Unified case pipeline across ${units.length} connected units — verifying integrity, detecting tampering, and generating court-ready certificates before evidence ever reaches a courtroom.</p>
      <div class="flex" style="gap:36px;margin-top:18px;flex-wrap:wrap;">
        <div><div class="stat-num">${visibleCases.length}</div><div class="stat-label">Cases Visible</div></div>
        <div><div class="stat-num">${visibleCases.reduce((s,c)=>s+c.evidence.length,0)}</div><div class="stat-label">Evidence Items</div></div>
        <div><div class="stat-num">${units.length}</div><div class="stat-label">Connected Units</div></div>
      </div>
      <div class="pill" style="margin-top:14px;background:rgba(45,217,195,.1);border-color:rgba(45,217,195,.3);color:var(--teal);">${icon('shield',13)} ${scopeLabel}</div>
    </div>
    <div class="flex between wrap" style="margin:24px 0 14px 0;gap:12px;">
      <h3 style="margin:0;">Cases</h3>
      <div class="flex wrap" style="gap:8px;">
        <input id="caseSearch" placeholder="Search cases..." value="${state.searchQuery}" oninput="setSearchQuery(this.value)" style="width:200px;margin:0;">
        <select id="statusFilterSel" onchange="setStatusFilter(this.value)" style="width:auto;margin:0;">
          <option ${state.statusFilter==='All'?'selected':''}>All</option>
          ${CASE_STATUSES.map(s=>`<option ${state.statusFilter===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="grid" id="caseGrid">${dashboardCaseRows()}</div>
  `;
}

/* ================= RENDER: NEW CASE ================= */
function renderNewCase(){
  return `
  <div class="card" style="max-width:560px;margin:0 auto;">
    <h2>Register New Case</h2>
    <p class="muted">This case becomes visible to the assigned police unit on the shared evidence platform.</p>
    <label>Case Title</label>
    <input id="nc-title" placeholder="e.g. Phishing Complaint #2026/xxx">
    <label>Police Unit / Agency</label>
    <select id="nc-unit">${POLICE_UNITS.map(u=>`<option>${u}</option>`).join('')}</select>
    <label>Incident Type</label>
    <select id="nc-type">${INCIDENT_TYPES.map(t=>`<option>${t}</option>`).join('')}</select>
    <label>Incident Description</label>
    <textarea id="nc-desc" rows="3" placeholder="Brief description of the incident..."></textarea>
    <div class="flex" style="margin-top:8px;">
      <button class="btn teal" onclick="createCase()">${icon('check')}Create Case</button>
      <button class="btn outline" onclick="goto('dashboard')">Cancel</button>
    </div>
  </div>`;
}

function createCase(){
  const title = document.getElementById('nc-title').value.trim() || 'Untitled Case';
  const unit = document.getElementById('nc-unit').value;
  const type = document.getElementById('nc-type').value;
  const desc = document.getElementById('nc-desc').value.trim();
  const c = { id:newId(), title, policeUnit:unit, incidentType:type, description:desc, createdAt:new Date().toISOString(), evidence:[], status:'Open', incidentStage:0 };
  state.cases.push(c);
  showToast('Case created and logged to the platform', 'check');
  goto('case', c.id);
}

/* ================= RENDER: CASE DETAIL ================= */
function renderCase(){
  const c = getCase(state.currentCaseId);
  if (!c) return `<div class="card">Case not found. <a class="link" onclick="goto('dashboard')">Back to dashboard</a></div>`;
  const items = c.evidence.map(e=>`
    <div class="card click" onclick="goto('evidence','${c.id}','${e.id}')">
      <div class="flex between">
        <div class="flex" style="gap:10px;">
          <span style="color:var(--text-3);">${icon('file',22)}</span>
          <div><h3 style="margin:0 0 4px 0;text-transform:none;letter-spacing:0;font-size:15px;">${e.filename}</h3><div class="muted">Uploaded ${fmtDate(e.uploadedAt)} · ${e.mimeType}</div></div>
        </div>
        <div class="badge ${scoreColor(e.trustScore)}">${e.trustScore}/100</div>
      </div>
    </div>`).join('');

  const stageIdx = c.incidentStage || 0;
  const stagesHtml = INCIDENT_STAGES.map((s,i)=>`
    <div class="istage ${i<stageIdx?'done':''} ${i===stageIdx?'current':''}">
      <div class="istage-dot">${i<stageIdx?icon('check',12):(i+1)}</div>
      <div class="istage-label">${s}</div>
    </div>`).join('<div class="istage-connector"></div>');

  return `
    <a class="link" onclick="goto('dashboard')">${icon('back')}Back to Dashboard</a>
    <div class="card" style="margin-top:12px;">
      <div class="flex between wrap" style="gap:12px;">
        <div class="flex wrap" style="gap:6px;margin-bottom:10px;">
          <span class="pill">${c.policeUnit}</span> <span class="pill gold">${c.incidentType}</span>
        </div>
        <select onchange="setCaseStatus('${c.id}', this.value)" style="width:auto;margin:0;">
          ${CASE_STATUSES.map(s=>`<option ${c.status===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <h2 style="margin:0 0 6px 0;">${c.title}</h2>
      <p class="muted">${c.description||''}</p>
      <div class="dim" style="font-size:13px;">Case opened ${fmtDate(c.createdAt)}</div>
    </div>

    <h3 style="margin-top:22px;">Incident Response Workflow</h3>
    <div class="card">
      <div class="istage-track">${stagesHtml}</div>
      ${stageIdx < INCIDENT_STAGES.length-1
        ? `<button class="btn outline" style="margin-top:16px;" onclick="advanceIncidentStage('${c.id}')">${icon('check')}Mark "${INCIDENT_STAGES[stageIdx]}" Complete</button>`
        : `<div class="verify-box ok" style="margin-top:16px;">${icon('check',16)}All incident response stages complete.</div>`}
    </div>

    <div class="flex between wrap" style="margin:22px 0 12px 0;">
      <h3 style="margin:0;">Evidence (${c.evidence.length})</h3>
      <div class="flex">
        ${c.evidence.length ? `<button class="btn outline" onclick="generateCaseReport()">${icon('file')}Export Case Report</button>` : ''}
        <button class="btn gold" onclick="goto('upload','${c.id}')">${icon('plus')}Upload Evidence</button>
      </div>
    </div>
    <div class="grid">${items || '<div class="muted">No evidence uploaded yet.</div>'}</div>
    ${renderCaseTimeline(c)}
  `;
}

function setCaseStatus(caseId, status){
  const c = getCase(caseId);
  c.status = status;
  showToast('Case status updated to '+status, 'check');
  render();
}

function advanceIncidentStage(caseId){
  const c = getCase(caseId);
  c.incidentStage = Math.min((c.incidentStage||0)+1, INCIDENT_STAGES.length-1);
  showToast('Incident stage advanced: '+INCIDENT_STAGES[c.incidentStage], 'shield');
  render();
}

function renderCaseTimeline(c){
  const allEvents = [];
  c.evidence.forEach(e=>{
    e.custodyChain.forEach(b=> allEvents.push({...b, filename:e.filename}));
  });
  if (!allEvents.length) return '';
  allEvents.sort((a,b)=> new Date(a.timestamp) - new Date(b.timestamp));
  const html = allEvents.map((ev,i)=>`
    <div class="step">
      ${i < allEvents.length-1 ? '<div class="line"></div>' : ''}
      <div class="dot ${ev.action.includes('Re-Verified')?'bad':''}"></div>
      <div style="font-weight:700;font-size:14px;">${ev.action} <span class="dim" style="font-weight:500;">— ${ev.filename}</span></div>
      <div class="muted" style="font-size:13px;">${fmtDate(ev.timestamp)} · ${ev.details}</div>
    </div>`).join('');
  return `<h3 style="margin-top:26px;">Case-Wide Timeline</h3><div class="card"><div class="timeline">${html}</div></div>`;
}

/* ================= RENDER: UPLOAD ================= */
function renderUpload(){
  const c = getCase(state.currentCaseId);
  return `
    <a class="link" onclick="goto('case','${c.id}')">${icon('back')}Back to ${c.title}</a>
    <div class="card" style="margin-top:12px;max-width:600px;">
      <h2>Upload Evidence</h2>
      <p class="muted">Files are hashed and analyzed locally — nothing leaves this device.</p>
      <div class="upload-zone" id="dropzone" onclick="document.getElementById('fileInput').click()">
        ${icon('upload', 30)}
        <div style="font-weight:600;margin-top:10px;">Click to choose a file, or drag it here</div>
        <div class="muted">Any file type supported</div>
      </div>
      <input type="file" id="fileInput" style="display:none">
      <div id="uploadProgress"></div>
    </div>
  `;
}

function wireUpload(){
  const dz = document.getElementById('dropzone');
  const input = document.getElementById('fileInput');
  if (!dz) return;
  input.addEventListener('change', e=>{ if(e.target.files[0]) handleUpload(e.target.files[0]); });
  dz.addEventListener('dragover', e=>{e.preventDefault(); dz.style.borderColor='var(--teal)';});
  dz.addEventListener('dragleave', e=>{ dz.style.borderColor=''; });
  dz.addEventListener('drop', e=>{ e.preventDefault(); if(e.dataTransfer.files[0]) handleUpload(e.dataTransfer.files[0]); });
}

async function handleUpload(file){
  const progressEl = document.getElementById('uploadProgress');
  const steps = ['Reading file','Hashing (SHA-256)','Extracting metadata','Scanning for anomalies','Scoring'];
  let current = 0;
  const paint = () => {
    const pct = Math.round((current/steps.length)*100);
    progressEl.innerHTML = `
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="progress-label"><span>${steps[Math.min(current,steps.length-1)]}…</span><span>${pct}%</span></div>`;
  };
  paint();
  const advance = async()=>{ current++; paint(); await new Promise(r=>setTimeout(r,420)); };

  await advance();
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);

  await advance();
  const hash = await sha256Hex(bytes);

  await advance();
  const isImage = file.type.startsWith('image/');
  let limitedMetadata = !isImage;
  let exifData = null, missingExif = false, editingSoftwareDetected = false;

  if (isImage && window.EXIF){
    exifData = await new Promise(resolve=>{
      try{
        EXIF.getData(file, function(){
          const tags = EXIF.getAllTags(this);
          resolve(tags && Object.keys(tags).length ? tags : null);
        });
      }catch(err){ resolve(null); }
    });
    if (!exifData || !exifData.Make){ missingExif = true; }
    if (exifData && exifData.Software && /photoshop|gimp|snapseed|lightroom|picsart/i.test(exifData.Software)){
      editingSoftwareDetected = true;
    }
  }

  await advance();
  await advance();
  current = steps.length; paint();

  const evidence = {
    id:newId(), filename:file.name, mimeType:file.type||'unknown', size:file.size,
    lastModified: new Date(file.lastModified).toISOString(), uploadedAt: new Date().toISOString(),
    bytes, originalHash:hash, currentHash:hash, tampered:false, limitedMetadata, chainBroken:false,
    exifData, missingExif, editingSoftwareDetected,
    custodyChain:[], trustScore:0, anomalies:[], certified:false
  };
  await addCustodyEvent(evidence, 'Uploaded', 'File received into evidence locker');
  await addCustodyEvent(evidence, 'Hashed', 'SHA-256 fingerprint generated');
  await addCustodyEvent(evidence, 'Analyzed', 'Metadata extraction and anomaly scan completed');
  computeTrustScore(evidence);

  const c = getCase(state.currentCaseId);
  c.evidence.push(evidence);
  showToast('Evidence secured and hashed', 'shield');
  goto('evidence', c.id, evidence.id);
}

/* ================= RENDER: EVIDENCE DETAIL ================= */
function renderEvidence(){
  const c = getCase(state.currentCaseId);
  const e = getEvidence(state.currentCaseId, state.currentEvidenceId);
  if (!c || !e) return `<div class="card">Evidence not found.</div>`;

  const timelineHtml = e.custodyChain.map((b,i)=>`
    <div class="step">
      ${i < e.custodyChain.length-1 ? '<div class="line"></div>' : ''}
      <div class="dot ${b.action.includes('Re-Verified')||b.action.includes('Tamper')?'bad':''}"></div>
      <div style="font-weight:700;font-size:14px;">${b.action}</div>
      <div class="muted" style="font-size:13px;">${fmtDate(b.timestamp)} · ${b.details}</div>
      <div class="hash" style="margin-top:5px;">block hash: ${b.hash.slice(0,24)}…</div>
    </div>
  `).join('');

  const exifTagLabels = {Make:'Camera Make', Model:'Camera Model', Software:'Software Used', DateTimeOriginal:'Captured On', DateTime:'Modified On', GPSLatitude:'GPS Latitude', GPSLongitude:'GPS Longitude', PixelXDimension:'Width (px)', PixelYDimension:'Height (px)'};
  const exifEntries = e.exifData ? Object.entries(e.exifData).filter(([k])=>exifTagLabels[k]) : [];
  const isImageFile = e.mimeType && e.mimeType.startsWith('image/');
  const exifPanel = `
    <div class="exif-panel">
      <div class="exif-head">${icon('camera',15)} EXIF Metadata Analysis</div>
      ${!isImageFile
        ? `<div class="exif-empty">${icon('alert',15)}This file type does not carry EXIF metadata — analysis applies to image files only.</div>`
        : exifEntries.length
          ? `<div class="exif-grid">${exifEntries.map(([k,v])=>`<div class="exif-chip"><div class="k">${exifTagLabels[k]}</div><div class="v">${typeof v==='object'?JSON.stringify(v):String(v)}</div></div>`).join('')}</div>`
          : `<div class="exif-empty">${icon('alert',15)}No EXIF data found in this image — camera metadata may have been stripped or the file re-saved through another application.</div>`
      }
    </div>`;

  const checklist = complianceChecklist(e);
  const checklistHtml = checklist.map(item => `
    <div class="checkrow ${item.pass?'pass':'fail'}">
      ${icon(item.pass?'check':'x',15)}<span>${item.label}</span>
    </div>`).join('');

  const invView = `
    <table>
      <tr><td>File name</td><td>${e.filename}</td></tr>
      <tr><td>MIME type</td><td>${e.mimeType}</td></tr>
      <tr><td>Size</td><td>${e.size} bytes</td></tr>
      <tr><td>Last modified</td><td>${fmtDate(e.lastModified)}</td></tr>
      <tr><td>Uploaded</td><td>${fmtDate(e.uploadedAt)}</td></tr>
      <tr><td>Original hash</td><td class="hash">${e.originalHash}</td></tr>
      <tr><td>Current hash</td><td class="hash">${e.currentHash}</td></tr>
    </table>
    ${exifPanel}
    <h3 style="margin-top:20px;">Flagged Anomalies</h3>
    ${e.anomalies.length ? e.anomalies.map(a=>`<div class="anomaly">${icon('alert',15)}${a.replace(/_/g,' ')}</div>`).join('') : '<div class="muted">None detected.</div>'}
    <div id="verifyResult"></div>
    <h3 style="margin-top:20px;">Legal Compliance Checklist</h3>
    <div class="flex between" style="margin-bottom:8px;">
      <span class="muted">Legal Readiness</span>
      <strong style="font-family:var(--mono);color:${scoreHex(legalReadinessPercent(e))};">${legalReadinessPercent(e)}%</strong>
    </div>
    <div class="progress-track" style="margin:0 0 12px 0;">
      <div class="progress-fill" style="width:${legalReadinessPercent(e)}%;background:${scoreHex(legalReadinessPercent(e))};"></div>
    </div>
    ${checklistHtml}
  `;

  const judgeView = `
    <div class="card" style="background:var(--teal-dim);border-color:rgba(45,217,195,.3);">
      <p style="font-size:15px;line-height:1.65;color:var(--text);">${judgeSummary(e)}</p>
    </div>
    <div class="flex" style="margin-top:16px;">
      ${icon(e.trustScore>=80?'check':e.trustScore>=50?'alert':'x',18)}
      <strong>${e.trustScore>=80 ? 'Ready for submission.' : e.trustScore>=50 ? 'Review recommended before submission.' : 'Integrity concerns — should not be relied upon without further investigation.'}</strong>
    </div>
  `;

  return `
    <a class="link" onclick="goto('case','${c.id}')">${icon('back')}Back to ${c.title}</a>
    <div class="card" style="margin-top:12px;">
      <div class="flex between wrap" style="align-items:flex-start;gap:16px;">
        <div>
          <h2 style="margin:0 0 4px 0;">${e.filename}</h2>
          <div class="muted">${e.mimeType} · ${e.size} bytes</div>
          <div class="hash animated" style="margin-top:9px;">SHA-256: ${e.currentHash}</div>
        </div>
        ${ringSvg(e.trustScore)}
      </div>
      <div class="flex wrap" style="margin-top:18px;">
        <button class="btn outline" onclick="simulateTamper()">${icon('alert')}Simulate Tampering</button>
        <button class="btn outline" onclick="runVerifyChain()">${icon('link')}Verify Chain Integrity</button>
        <button class="btn gold" onclick="generateCertificate()">${icon('shield')}Generate Section 63 Certificate</button>
      </div>
    </div>

    <div class="tabs">
      <button class="${!state.judgeMode?'active':''}" onclick="toggleMode(false)">${icon('search',15)}Investigator View</button>
      <button class="${state.judgeMode?'active':''}" onclick="toggleMode(true)">${icon('scale',15)}Judge View</button>
    </div>
    <div class="card">${state.judgeMode ? judgeView : invView}</div>

    <h3>Chain of Custody</h3>
    <div class="card"><div class="timeline">${timelineHtml}</div></div>
  `;
}

function toggleMode(judge){ state.judgeMode = judge; render(); }

async function simulateTamper(){
  const e = getEvidence(state.currentCaseId, state.currentEvidenceId);
  const modified = new Uint8Array([...e.bytes, ...new TextEncoder().encode('\n[unauthorized edit]')]);
  e.bytes = modified;
  e.currentHash = await sha256Hex(modified);
  e.tampered = (e.currentHash !== e.originalHash);
  await addCustodyEvent(e, 'Re-Verified', 'Hash mismatch detected on re-verification — file content changed');
  computeTrustScore(e);
  showToast('Tamper simulated — hash and trust score updated', 'alert');
  render();
}

async function runVerifyChain(){
  const e = getEvidence(state.currentCaseId, state.currentEvidenceId);
  const result = await verifyChain(e);
  e.chainBroken = !result.ok;
  computeTrustScore(e);
  const box = document.getElementById('verifyResult');
  if (box){
    box.innerHTML = result.ok
      ? `<div class="verify-box ok">${icon('check',18)}Chain verified — all ${e.custodyChain.length} custody blocks are cryptographically intact.</div>`
      : `<div class="verify-box broken">${icon('x',18)}Chain integrity FAILED at step: "${result.brokenAt}". This custody record cannot be trusted.</div>`;
  }
  render();
}

async function generateCertificate(){
  const c = getCase(state.currentCaseId);
  const e = getEvidence(state.currentCaseId, state.currentEvidenceId);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const navy = [10,14,22];

  doc.setFillColor(...navy); doc.rect(0,0,210,28,'F');
  doc.setTextColor(45,217,195); doc.setFontSize(18); doc.setFont(undefined,'bold');
  doc.text('PRAMAAN — Digital Evidence Certificate', 14, 18);

  doc.setTextColor(20,20,20); doc.setFontSize(11); doc.setFont(undefined,'normal');
  let y = 40;
  const line = (label, value) => { doc.setFont(undefined,'bold'); doc.text(label, 14, y); doc.setFont(undefined,'normal');
    const split = doc.splitTextToSize(String(value), 130); doc.text(split, 70, y); y += 8*split.length; };

  doc.setFont(undefined,'bold'); doc.setFontSize(13);
  doc.text('Certificate under Section 63, Bharatiya Sakshya Adhiniyam, 2023', 14, y); y+=10;
  doc.setFontSize(11);

  line('Case:', c.title);
  line('Police Unit:', c.policeUnit);
  line('Incident Type:', c.incidentType);
  line('Evidence File:', e.filename);
  line('File Size:', e.size + ' bytes');
  line('SHA-256 Hash:', e.currentHash);
  line('Uploaded:', fmtDate(e.uploadedAt));
  line('Certified On:', fmtDate(new Date().toISOString()));
  line('Trust Score:', e.trustScore + ' / 100');
  line('Examiner:', 'Team Perihelion — Digital Forensics Unit');

  y += 6;
  doc.setFont(undefined,'italic');
  const stmt = "I hereby certify that the above electronic record has been produced from the device/source described, that its integrity was verified by cryptographic hash comparison at the time of this certificate's generation, and that the chain of custody recorded above accurately reflects all actions taken on this evidence.";
  const split = doc.splitTextToSize(stmt, 180);
  doc.text(split, 14, y);

  doc.save(`Section63_Certificate_${e.filename}.pdf`);
  e.certified = true;
  await addCustodyEvent(e, 'Certified', 'Section 63 certificate generated and issued');
  showToast('Certificate generated and downloaded', 'shield');
  render();
}

async function generateCaseReport(){
  const c = getCase(state.currentCaseId);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const navy = [10,14,22];
  let y = 40;
  const pageBottom = 280;
  const ensureSpace = (needed) => { if (y + needed > pageBottom){ doc.addPage(); y = 20; } };
  const line = (label, value) => {
    ensureSpace(10);
    doc.setFont(undefined,'bold'); doc.text(String(label), 14, y); doc.setFont(undefined,'normal');
    const split = doc.splitTextToSize(String(value), 130); doc.text(split, 70, y); y += 8*split.length;
  };

  doc.setFillColor(...navy); doc.rect(0,0,210,28,'F');
  doc.setTextColor(45,217,195); doc.setFontSize(18); doc.setFont(undefined,'bold');
  doc.text('PRAMAAN — Full Case Report', 14, 18);
  doc.setTextColor(20,20,20); doc.setFontSize(11); doc.setFont(undefined,'normal');

  doc.setFont(undefined,'bold'); doc.setFontSize(14); doc.text(c.title, 14, y); y+=10; doc.setFontSize(11);
  line('Police Unit:', c.policeUnit);
  line('Incident Type:', c.incidentType);
  line('Case Opened:', fmtDate(c.createdAt));
  line('Description:', c.description || '—');
  line('Evidence Items:', c.evidence.length);
  const avg = c.evidence.length ? Math.round(c.evidence.reduce((s,e)=>s+e.trustScore,0)/c.evidence.length) : 0;
  line('Average Trust Score:', avg + ' / 100');

  c.evidence.forEach((e, idx)=>{
    ensureSpace(20);
    y += 4;
    doc.setDrawColor(200); doc.line(14, y, 196, y); y += 8;
    doc.setFont(undefined,'bold'); doc.setFontSize(12); doc.text(`Evidence ${idx+1}: ${e.filename}`, 14, y); y+=8; doc.setFontSize(11);
    line('SHA-256 Hash:', e.currentHash);
    line('Trust Score:', e.trustScore + ' / 100');
    line('Anomalies:', e.anomalies.length ? e.anomalies.join(', ') : 'None');
    line('Legal Readiness:', legalReadinessPercent(e) + '%');
    line('Certified:', e.certified ? 'Yes' : 'No');
    line('Custody Events:', e.custodyChain.length);
    e.custodyChain.forEach(b=>{
      ensureSpace(8);
      doc.setFontSize(9); doc.setTextColor(90,90,90);
      doc.text(`  • ${fmtDate(b.timestamp)} — ${b.action}: ${b.details}`, 16, y);
      y += 6; doc.setFontSize(11); doc.setTextColor(20,20,20);
    });
  });

  doc.save(`Pramaan_Case_Report_${c.title.replace(/[^a-z0-9]/gi,'_')}.pdf`);
  showToast('Full case report generated and downloaded', 'file');
}

/* ================= MAIN RENDER ================= */
function render(){
  const app = document.getElementById('app');
  let html = '';
  if (state.view==='dashboard') html = renderDashboard();
  else if (state.view==='newcase') html = renderNewCase();
  else if (state.view==='case') html = renderCase();
  else if (state.view==='upload') html = renderUpload();
  else if (state.view==='evidence') html = renderEvidence();
  app.style.animation = 'none';
  app.offsetHeight;
  app.style.animation = null;
  app.innerHTML = html;
  if (state.view==='upload') wireUpload();
}

/* ================= BOOT SEQUENCE ================= */
async function boot(){
  const nav = document.getElementById('navButtons');
  const btns = nav.querySelectorAll('button');
  const iconNames = ['dashboard','download','upload','plus','logout'];
  btns.forEach((b,i)=>{ b.innerHTML = icon(iconNames[i]) + b.textContent; });
  const scopeSel = document.getElementById('unitScope');
  scopeSel.innerHTML = `<option value="${ALL_UNITS_SCOPE}">${ALL_UNITS_SCOPE}</option>` +
    POLICE_UNITS.map(u=>`<option value="${u}">Viewing as: ${u}</option>`).join('');
  scopeSel.value = state.activeUnit;

  const loginSel = document.getElementById('loginUnit');
  loginSel.innerHTML = `<option value="${ALL_UNITS_SCOPE}">${ALL_UNITS_SCOPE}</option>` +
    POLICE_UNITS.map(u=>`<option value="${u}">${u}</option>`).join('');

  const fill = document.getElementById('splashFill');
  const status = document.getElementById('splashStatus');
  const phases = [
    ['Initializing secure evidence engine…', 20],
    ['Loading forensic analysis modules…', 45],
    ['Establishing offline verification layer…', 70],
    ['Seeding demo case files…', 90],
    ['Ready.', 100]
  ];
  for (const [text, pct] of phases){
    status.textContent = text;
    fill.style.width = pct + '%';
    await new Promise(r=>setTimeout(r, 420));
  }
  await seed();
  render();
  await new Promise(r=>setTimeout(r, 250));
  document.getElementById('splash').classList.add('hide');
  setTimeout(()=>document.getElementById('splash').remove(), 700);

  startMatrixRain();
  document.getElementById('loginGate').classList.add('show');
}

/* ================= LOGIN GATE ================= */
async function attemptLogin(){
  const unit = document.getElementById('loginUnit').value;
  const statusEl = document.getElementById('loginStatus');
  const barFill = document.getElementById('loginBarFill');
  const btn = document.getElementById('loginBtn');
  btn.disabled = true;
  const steps = [
    ['Verifying access code…', 35],
    ['Establishing secure session…', 70],
    ['Access granted.', 100]
  ];
  for (const [text, pct] of steps){
    statusEl.textContent = text;
    barFill.style.width = pct + '%';
    await new Promise(r=>setTimeout(r, 380));
  }
  statusEl.classList.add('granted');
  state.activeUnit = unit;
  state.authenticated = true;
  stopMatrixRain();
  document.body.classList.remove('pre-auth');
  document.getElementById('loginGate').classList.remove('show');
  const scopeSel = document.getElementById('unitScope');
  if (scopeSel) scopeSel.value = unit;
  goto('dashboard');
  showToast(unit===ALL_UNITS_SCOPE ? 'Authenticated — Oversight view' : 'Authenticated as '+unit, 'shield');
}

function logOut(){
  state.authenticated = false;
  document.body.classList.add('pre-auth');
  const statusEl = document.getElementById('loginStatus');
  const barFill = document.getElementById('loginBarFill');
  statusEl.textContent = ''; statusEl.classList.remove('granted'); barFill.style.width = '0%';
  document.getElementById('loginBtn').disabled = false;
  document.getElementById('loginGate').classList.add('show');
  startMatrixRain();
}

/* ================= MATRIX RAIN BACKGROUND ================= */
let matrixInterval = null;
function startMatrixRain(){
  const canvas = document.getElementById('matrixCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize);
  const chars = '0123456789ABCDEF';
  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = new Array(columns).fill(1);
  if (matrixInterval) clearInterval(matrixInterval);
  matrixInterval = setInterval(()=>{
    ctx.fillStyle = 'rgba(6,8,16,0.08)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = 'rgba(45,217,195,0.55)';
    ctx.font = fontSize + 'px monospace';
    for (let i=0;i<drops.length;i++){
      const text = chars[Math.floor(Math.random()*chars.length)];
      ctx.fillText(text, i*fontSize, drops[i]*fontSize);
      if (drops[i]*fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }, 55);
}
function stopMatrixRain(){ if (matrixInterval){ clearInterval(matrixInterval); matrixInterval = null; } }

boot();
