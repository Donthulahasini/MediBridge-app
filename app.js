/* ==========================================================================
   MEDIBRIDGE SMART HEALTH RECORD - MAIN APPLICATION ENGINE (app.js)
   Features: Multi-role Portal Switching, Multilingual i18n, Health Graphs (Chart.js),
   Dosage Reminders, Health Timeline 2024-2026, Doctor Health ID Lookup,
   Hospital Discharge Builder & Bed/ICU Matrix, AI Emergency Response, MediBot AI
   ========================================================================== */

// Global App State
const state = {
  currentRole: 'landing', // 'landing', 'patient', 'doctor', 'hospital'
  currentLang: 'en',
  vitalsGraphTab: 'bp',
  chartInstance: null,
  qrcodeInstance: null,

  // Patient Profile Data
  patient: {
    name: 'Rahul Sharma',
    healthId: 'MB-9482-1049',
    age: 34,
    gender: 'Male',
    bloodGroup: 'O+',
    allergies: 'Penicillin, Peanuts',
    emergencyContact: '+91 98765 43210',
    chronicConditions: 'Mild Hypertension',
    vitalsHistory: {
      bp: [
        { date: 'Jan 2025', sys: 128, dia: 84 },
        { date: 'Jun 2025', sys: 124, dia: 82 },
        { date: 'Jan 2026', sys: 122, dia: 80 },
        { date: 'Jul 2026', sys: 119, dia: 79 }
      ],
      sugar: [
        { date: 'Jan 2025', val: 108 },
        { date: 'Jun 2025', val: 102 },
        { date: 'Jan 2026', val: 99 },
        { date: 'Jul 2026', val: 98 }
      ],
      weight: [
        { date: 'Jan 2025', val: 76.0 },
        { date: 'Jun 2025', val: 74.5 },
        { date: 'Jan 2026', val: 73.0 },
        { date: 'Jul 2026', val: 72.5 }
      ]
    },
    timeline: [
      { year: '2024', event: 'Complete Blood Count & Lipid Profile', facility: 'City Diagnostic Center', doc: 'Dr. S. K. Gupta', type: 'Lab Test', status: 'Normal' },
      { year: '2025', event: 'Annual Executive Health Checkup & ECG', facility: 'Apollo Speciality Hospital', doc: 'Dr. Ananya Rao', type: 'Checkup', status: 'Completed' },
      { year: '2026', event: 'Comprehensive Cardiac Screening & Echo', facility: 'MediBridge Heart Care Institute', doc: 'Dr. Ananya Rao', type: 'Cardiology', status: 'Verified' }
    ],
    reports: [
      { id: 'REP-849', title: 'Lipid Profile & Liver Function Report', date: '2024-11-12', category: 'Blood Test', facility: 'City Diagnostic Center', file: 'lipid_profile_2024.pdf' },
      { id: 'REP-912', title: 'ECG & Stress Test Report', date: '2025-05-18', category: 'Cardiology', facility: 'Apollo Hospital', file: 'ecg_report_2025.pdf' },
      { id: 'REP-104', title: 'Discharge Summary - Acute Gastritis', date: '2026-07-28', category: 'Discharge Summary', facility: 'City Central General Hospital', file: 'discharge_summary_2026.pdf' }
    ],
    medicines: [
      { id: 1, name: 'Amoxicillin 500mg', dosage: '1 Capsule - Morning after food (8:00 AM)', time: '08:00 AM', taken: true },
      { id: 2, name: 'Metformin 500mg', dosage: '1 Tablet - Afternoon (2:00 PM)', time: '02:00 PM', taken: false },
      { id: 3, name: 'Atorvastatin 10mg', dosage: '1 Tablet - Night before bed (9:00 PM)', time: '09:00 PM', taken: false }
    ],
    appointments: [
      { id: 'APT-101', docName: 'Dr. Ananya Rao', specialty: 'Senior Consultant Cardiologist', date: 'Aug 10, 2026', time: '10:30 AM', status: 'Confirmed' },
      { id: 'APT-102', docName: 'Dr. Vikram Patel', specialty: 'Gastroenterologist', date: 'Aug 24, 2026', time: '04:00 PM', status: 'Scheduled' }
    ],
    authorizedDoctors: [
      { docId: 'DOC-ANANYA-84', name: 'Dr. Ananya Rao', specialty: 'Cardiology', grantedDate: '2026-07-20', status: 'Active (24h left)' }
    ]
  },

  // Hospital Bed Matrix Dataset
  hospitalBeds: [
    { hospital: 'City Central General Hospital', location: 'Banjara Hills', wardBeds: { total: 120, avail: 18 }, icuBeds: { total: 30, avail: 4 }, oxyBeds: { total: 45, avail: 9 }, phone: '040-1463381' },
    { hospital: 'Apollo Speciality Center', location: 'Jubilee Hills', wardBeds: { total: 200, avail: 34 }, icuBeds: { total: 50, avail: 7 }, oxyBeds: { total: 80, avail: 15 }, phone: '040-23607777' },
    { hospital: 'Yashoda Heart Institute', location: 'Secunderabad', wardBeds: { total: 150, avail: 22 }, icuBeds: { total: 40, avail: 2 }, oxyBeds: { total: 60, avail: 11 }, phone: '040-45674567' },
    { hospital: 'CARE Super Speciality Hospital', location: 'Gachibowli', wardBeds: { total: 180, avail: 40 }, icuBeds: { total: 35, avail: 8 }, oxyBeds: { total: 70, avail: 21 }, phone: '040-30418000' }
  ],

  // Hospital Upload History
  uploadHistory: [
    { date: '2026-07-28', patientId: 'MB-9482-1049', type: 'Discharge Summary', status: 'Synced', docName: 'discharge_summary_rahul.pdf' },
    { date: '2026-07-24', patientId: 'MB-8812-4011', type: 'Diagnostic Lab Report', status: 'Synced', docName: 'cbc_blood_test.pdf' },
    { date: '2026-07-21', patientId: 'MB-7734-9021', type: 'Radiology MRI Scan', status: 'Synced', docName: 'brain_mri_scan.pdf' }
  ],

  // Notifications List
  notifications: [
    { id: 1, title: 'New Discharge Summary Uploaded', desc: 'City Central General Hospital attached your July 28 summary.', time: '10 mins ago', unread: true },
    { id: 2, title: 'Medicine Reminder: Amoxicillin', desc: 'Dosage 500mg due at 8:00 AM.', time: '1 hour ago', unread: true },
    { id: 3, title: 'Appointment Reminder', desc: 'Upcoming checkup with Dr. Ananya Rao on Aug 10.', time: '1 day ago', unread: true },
    { id: 4, title: 'Doctor Access Request', desc: 'Dr. Vikram Patel requested view permission for Health ID MB-9482-1049.', time: '2 days ago', unread: true }
  ],

  // Multilingual i18n Dictionary
  i18n: {
    en: {
      navHome: 'Home',
      navBeds: 'Bed & ICU Matrix',
      navEmergency: 'AI Emergency Triage',
      navAbout: 'About',
      navContact: 'Contact',
      sosBtn: 'SOS Emergency',
      getStarted: 'Get Started',
      tryEmergencyAI: 'Try AI Emergency Triage',
      liveBedStatus: 'Live Bed Availability',
      patientLoginTitle: 'Patient Portal',
      doctorLoginTitle: 'Doctor Portal',
      hospitalLoginTitle: 'Hospital & Lab Portal',
      loginAsPatient: 'Login as Patient',
      loginAsDoctor: 'Login as Doctor',
      loginAsHospital: 'Login as Hospital / Lab',
      aboutTag: 'ABOUT MEDIBRIDGE',
      aboutTitle: 'Connecting Patients, Doctors & Hospitals Seamlessly',
      contactTag: '24/7 SUPPORT & HELP',
      contactTitle: 'Get in Touch with MediBridge',
      emergencyQR: 'Emergency QR Pass',
      shareRecords: 'Share Records with Doctor',
      vitalsTitle: 'Health Vitals & Trends',
      notifTitle: 'Notifications'
    },
    te: {
      navHome: 'హోమ్',
      navBeds: 'బెడ్ & ఐసియు మ్యాట్రిక్స్',
      navEmergency: 'ఎఐ అత్యవసర చికిత్స',
      navAbout: 'మా గురించి',
      navContact: 'సంప్రదించండి',
      sosBtn: 'అత్యవసర సహాయం (SOS)',
      getStarted: 'ప్రారంభించండి',
      tryEmergencyAI: 'ఎఐ ఎమర్జెన్సీ ట్రయాజ్',
      liveBedStatus: 'లైవ్ బెడ్ లభ్యత',
      patientLoginTitle: 'రోగి పోర్టల్ (Patient)',
      doctorLoginTitle: 'వైద్యుల పోర్టల్ (Doctor)',
      hospitalLoginTitle: 'ఆసుపత్రి & ల్యాబ్ పోర్టల్',
      loginAsPatient: 'పేషెంట్‌గా లాగిన్ అవ్వండి',
      loginAsDoctor: 'డాక్టర్‌గా లాగిన్ అవ్వండి',
      loginAsHospital: 'హాస్పిటల్‌గా లాగిన్ అవ్వండి',
      aboutTag: 'మెడిబ్రిడ్జ్ గురించి',
      aboutTitle: 'రోగులు, వైద్యులు మరియు ఆసుపత్రులను అనుసంధానించడం',
      contactTag: '24/7 మద్దతు మరియు సహాయం',
      contactTitle: 'మెడిబ్రిడ్జ్‌ని సంప్రదించండి',
      emergencyQR: 'ఎమర్జెన్సీ క్యూఆర్ పాస్',
      shareRecords: 'వైద్యునితో రికార్డులను పంచుకోండి',
      vitalsTitle: 'ఆరోగ్య సంకేతాలు & రికార్డులు',
      notifTitle: 'నోటిఫికేషన్లు'
    },
    hi: {
      navHome: 'होम',
      navBeds: 'बेड और आईसीयू उपलब्धता',
      navEmergency: 'एआई आपातकालीन ट्राइएज',
      navAbout: 'हमारे बारे में',
      navContact: 'संपर्क करें',
      sosBtn: 'एसओएस आपातकाल',
      getStarted: 'शुरू करें',
      tryEmergencyAI: 'एआई आपातकालीन ट्राइएज आजमाएं',
      liveBedStatus: 'लाइव बेड उपलब्धता',
      patientLoginTitle: 'मरीज़ पोर्टल (Patient)',
      doctorLoginTitle: 'डॉक्टर पोर्टल (Doctor)',
      hospitalLoginTitle: 'अस्पताल एवं लैब पोर्टल',
      loginAsPatient: 'मरीज़ के रूप में लॉगिन करें',
      loginAsDoctor: 'डॉक्टर के रूप में लॉगिन करें',
      loginAsHospital: 'अस्पताल के रूप में लॉगिन करें',
      aboutTag: 'मेडीब्रिज के बारे में',
      aboutTitle: 'मरीज़ों, डॉक्टरों और अस्पतालों को सहजता से जोड़ना',
      contactTag: '24/7 सहायता और हेल्पलाइन',
      contactTitle: 'मेडीब्रिज से संपर्क करें',
      emergencyQR: 'इमरजेंसी क्यूआर पास',
      shareRecords: 'डॉक्टर के साथ रिकॉर्ड साझा करें',
      vitalsTitle: 'स्वास्थ्य वाइटल्स एवं रुझान',
      notifTitle: 'अधिसूचनाएं'
    },
    es: {
      navHome: 'Inicio',
      navBeds: 'Camas e UCI',
      navEmergency: 'Triaje de Emergencia AI',
      navAbout: 'Acerca de',
      navContact: 'Contacto',
      sosBtn: 'Emergencia SOS',
      getStarted: 'Empezar',
      tryEmergencyAI: 'Probar Triaje AI',
      liveBedStatus: 'Disponibilidad de Camas',
      patientLoginTitle: 'Portal del Paciente',
      doctorLoginTitle: 'Portal del Médico',
      hospitalLoginTitle: 'Portal del Hospital y Lab',
      loginAsPatient: 'Iniciar como Paciente',
      loginAsDoctor: 'Iniciar como Médico',
      loginAsHospital: 'Iniciar como Hospital',
      aboutTag: 'SOBRE MEDIBRIDGE',
      aboutTitle: 'Conectando Pacientes, Médicos u Hospitales',
      contactTag: 'SOPORTE 24/7',
      contactTitle: 'Póngase en contacto',
      emergencyQR: 'Pase QR de Emergencia',
      shareRecords: 'Compartir Historial con Médico',
      vitalsTitle: 'Signos Vitales y Tendencias',
      notifTitle: 'Notificaciones'
    }
  }
};

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  renderNotifications();
  renderPatientTimeline();
  renderPatientReports();
  renderMedicineReminders();
  renderAppointments();
  renderDoctorAccessList();
  renderHospitalUploadHistory();
  initVitalsChart();
  renderBedMatrix();
});

// Role Switcher Engine
function switchRole(role) {
  state.currentRole = role;

  // Hide all view sections
  document.getElementById('landingView').classList.add('hidden');
  document.getElementById('patientView').classList.add('hidden');
  document.getElementById('doctorView').classList.add('hidden');
  document.getElementById('hospitalView').classList.add('hidden');

  // Nav highlight reset
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

  // Update dropdown label & section visibility
  const roleLabel = document.getElementById('currentRoleLabel');

  if (role === 'landing') {
    document.getElementById('landingView').classList.remove('hidden');
    document.getElementById('navHome').classList.add('active');
    roleLabel.innerText = 'Home View';
  } else if (role === 'patient') {
    document.getElementById('patientView').classList.remove('hidden');
    roleLabel.innerText = 'Patient Portal';
    // Re-render chart to ensure size fits canvas
    setTimeout(initVitalsChart, 100);
  } else if (role === 'doctor') {
    document.getElementById('doctorView').classList.remove('hidden');
    roleLabel.innerText = 'Doctor Portal';
    searchPatientByHealthId();
  } else if (role === 'hospital') {
    document.getElementById('hospitalView').classList.remove('hidden');
    roleLabel.innerText = 'Hospital / Lab Portal';
  }

  // Close portal dropdown
  document.getElementById('portalMenu').classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleRoleMenu() {
  document.getElementById('portalMenu').classList.toggle('hidden');
}

// Multilingual Switcher
function changeLanguage(langKey) {
  state.currentLang = langKey;
  const dict = state.i18n[langKey] || state.i18n['en'];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.innerText = dict[key];
    }
  });
}

// Scroll Helper
function scrollToSection(sectionId) {
  switchRole('landing');
  setTimeout(() => {
    const target = document.getElementById(sectionId);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

// Notification Hub
function toggleNotifications() {
  document.getElementById('notifDropdown').classList.toggle('hidden');
}

function renderNotifications() {
  const container = document.getElementById('notifList');
  const badge = document.getElementById('notifBadge');
  const unreadCount = state.notifications.filter(n => n.unread).length;

  badge.innerText = unreadCount;
  if (unreadCount === 0) badge.classList.add('hidden');
  else badge.classList.remove('hidden');

  container.innerHTML = state.notifications.map(n => `
    <div class="notif-item ${n.unread ? 'unread' : ''}">
      <i class="fa-solid fa-bell-ring text-purple"></i>
      <div>
        <strong>${n.title}</strong>
        <p>${n.desc}</p>
        <small class="text-dim">${n.time}</small>
      </div>
    </div>
  `).join('');
}

function markAllNotificationsRead() {
  state.notifications.forEach(n => n.unread = false);
  renderNotifications();
}

// Health Vitals Chart (Chart.js)
function initVitalsChart() {
  const ctx = document.getElementById('healthVitalsChart');
  if (!ctx) return;

  if (state.chartInstance) {
    state.chartInstance.destroy();
  }

  const tab = state.vitalsGraphTab;
  let labels = [];
  let datasets = [];

  if (tab === 'bp') {
    labels = state.patient.vitalsHistory.bp.map(d => d.date);
    datasets = [
      {
        label: 'Systolic BP (mmHg)',
        data: state.patient.vitalsHistory.bp.map(d => d.sys),
        borderColor: '#9333EA',
        backgroundColor: 'rgba(147, 51, 234, 0.15)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Diastolic BP (mmHg)',
        data: state.patient.vitalsHistory.bp.map(d => d.dia),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        fill: true,
        tension: 0.4
      }
    ];
  } else if (tab === 'sugar') {
    labels = state.patient.vitalsHistory.sugar.map(d => d.date);
    datasets = [{
      label: 'Fasting Blood Sugar (mg/dL)',
      data: state.patient.vitalsHistory.sugar.map(d => d.val),
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      fill: true,
      tension: 0.4
    }];
  } else if (tab === 'weight') {
    labels = state.patient.vitalsHistory.weight.map(d => d.date);
    datasets = [{
      label: 'Body Weight (kg)',
      data: state.patient.vitalsHistory.weight.map(d => d.val),
      borderColor: '#F59E0B',
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
      fill: true,
      tension: 0.4
    }];
  }

  state.chartInstance = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94A3B8', font: { family: 'Plus Jakarta Sans' } } }
      },
      scales: {
        x: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
        y: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
      }
    }
  });
}

function switchGraphTab(tab) {
  state.vitalsGraphTab = tab;
  document.querySelectorAll('.graph-tab-buttons .tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  initVitalsChart();
}

// Render Patient Timeline
function renderPatientTimeline() {
  const container = document.getElementById('patientTimeline');
  container.innerHTML = state.patient.timeline.map(item => `
    <div class="timeline-item">
      <span class="timeline-year-tag">${item.year}</span>
      <div class="timeline-title">${item.event}</div>
      <div class="timeline-facility"><i class="fa-solid fa-hospital-user"></i> ${item.facility} | ${item.doc}</div>
      <span class="badge-small bg-green mt-1">${item.status}</span>
    </div>
  `).join('');
}

// Render Patient Reports List
function renderPatientReports() {
  const container = document.getElementById('patientReportsList');
  document.getElementById('reportCount').innerText = `${state.patient.reports.length} Files`;

  container.innerHTML = state.patient.reports.map(rep => `
    <div class="med-item">
      <div class="med-info">
        <h4><i class="fa-solid fa-file-pdf text-purple"></i> ${rep.title}</h4>
        <p>${rep.facility} • ${rep.date} • Category: ${rep.category}</p>
      </div>
      <button class="btn btn-sm btn-outline" onclick="previewReportModal('${rep.title}', '${rep.date}', '${rep.facility}')">
        <i class="fa-solid fa-eye"></i> View PDF
      </button>
    </div>
  `).join('');
}

function previewReportModal(title, date, facility) {
  alert(`[MediBridge Report Viewer]\n\nDocument: ${title}\nDate: ${date}\nIssuing Facility: ${facility}\n\nStatus: Cryptographically Verified on MediBridge Protocol.`);
}

// Medicine Dosage Reminders
function renderMedicineReminders() {
  const container = document.getElementById('medRemindersList');
  container.innerHTML = state.patient.medicines.map(med => `
    <div class="med-item">
      <div class="med-info">
        <h4>${med.name} <span class="med-dose-tag">${med.time}</span></h4>
        <p><i class="fa-solid fa-clock text-purple"></i> ${med.dosage}</p>
      </div>
      <button class="btn btn-sm ${med.taken ? 'btn-emerald' : 'btn-outline'}" onclick="toggleMedTaken(${med.id})">
        <i class="fa-solid ${med.taken ? 'fa-circle-check' : 'fa-circle'}"></i> ${med.taken ? 'Taken' : 'Mark Taken'}
      </button>
    </div>
  `).join('');
}

function toggleMedTaken(id) {
  const med = state.patient.medicines.find(m => m.id === id);
  if (med) {
    med.taken = !med.taken;
    renderMedicineReminders();
  }
}

// Appointments List
function renderAppointments() {
  const container = document.getElementById('appointmentsList');
  container.innerHTML = state.patient.appointments.map(apt => `
    <div class="med-item">
      <div class="med-info">
        <h4><i class="fa-solid fa-user-doctor text-blue"></i> ${apt.docName}</h4>
        <p>${apt.specialty} • ${apt.date} at ${apt.time}</p>
      </div>
      <span class="badge-small bg-green">${apt.status}</span>
    </div>
  `).join('');
}

function renderDoctorAccessList() {
  const container = document.getElementById('doctorAccessList');
  container.innerHTML = state.patient.authorizedDoctors.map(doc => `
    <div class="med-item">
      <div class="med-info">
        <h4>${doc.name} (${doc.specialty})</h4>
        <p>Permission Status: ${doc.status}</p>
      </div>
      <button class="btn btn-sm btn-outline text-red" onclick="revokeDoctorAccess('${doc.docId}')">Revoke</button>
    </div>
  `).join('');
}

function revokeDoctorAccess(docId) {
  state.patient.authorizedDoctors = state.patient.authorizedDoctors.filter(d => d.docId !== docId);
  renderDoctorAccessList();
  alert('Doctor access permission revoked successfully.');
}

// DOCTOR DASHBOARD LOOKUP ENGINE
function searchPatientByHealthId() {
  const healthId = document.getElementById('searchHealthId').value.trim();
  const container = document.getElementById('doctorPatientResult');

  if (healthId.toUpperCase() === 'MB-9482-1049' || healthId === '') {
    container.innerHTML = `
      <div class="glass-card dash-card mt-3">
        <div class="profile-main mb-3">
          <div class="avatar-circle"><i class="fa-solid fa-user"></i></div>
          <div>
            <h3>Rahul Sharma <span class="health-id-badge">Health ID: MB-9482-1049</span></h3>
            <p class="text-muted">Age: 34 Yrs | Blood Group: O+ | Allergies: Penicillin, Peanuts</p>
          </div>
          <div class="ml-auto">
            <span class="badge-small bg-green"><i class="fa-solid fa-lock-open"></i> Record Access Authorized</span>
          </div>
        </div>

        <hr>

        <h4 class="mt-3 mb-2"><i class="fa-solid fa-notes-medical text-blue"></i> Add New Clinical Diagnosis & Prescription</h4>
        <form onsubmit="handleDoctorAddDiagnosis(event)" class="upload-form">
          <div class="form-row">
            <div class="form-group">
              <label>Diagnosis / Clinical Condition</label>
              <input type="text" id="docDiagnosisTitle" class="form-control" placeholder="e.g. Mild Hypertension Follow-up" required>
            </div>
            <div class="form-group">
              <label>ICD-10 Severity</label>
              <select id="docSeverity" class="form-control">
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Prescription Medicines & Dosage Instructions</label>
            <textarea id="docRxText" class="form-control" rows="2" placeholder="e.g. Tab Telmisartan 40mg - 1 tablet daily morning after breakfast for 30 days" required></textarea>
          </div>

          <div class="form-group">
            <label>Clinical & Treatment Notes</label>
            <textarea id="docTreatmentNotes" class="form-control" rows="2" placeholder="Patient advised low-salt diet and 30 mins brisk walk daily. Recheck BP in 4 weeks."></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Schedule Follow-up Date</label>
              <input type="date" id="docFollowupDate" class="form-control" value="2026-08-28">
            </div>
            <div class="form-group align-end">
              <button type="submit" class="btn btn-blue btn-full mt-auto">
                <i class="fa-solid fa-floppy-disk"></i> Submit Clinical Entry & Sync Record
              </button>
            </div>
          </div>
        </form>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="glass-card dash-card text-center p-4">
        <i class="fa-solid fa-user-slash text-amber" style="font-size: 3rem; margin-bottom: 1rem;"></i>
        <h3>Record Restricted for ID: ${healthId}</h3>
        <p class="text-muted">Patient permission required. Click below to send an access request prompt to patient device.</p>
        <button class="btn btn-blue mt-3" onclick="requestDoctorPermission('${healthId}')">
          <i class="fa-solid fa-paper-plane"></i> Request Permission to Access Record
        </button>
      </div>
    `;
  }
}

function requestDoctorPermission(healthId) {
  state.notifications.unshift({
    id: Date.now(),
    title: 'Doctor Access Request',
    desc: `Dr. Ananya Rao requested access to Health ID ${healthId}`,
    time: 'Just now',
    unread: true
  });
  renderNotifications();
  alert(`Access request sent to patient device associated with Health ID ${healthId}.`);
}

function handleDoctorAddDiagnosis(e) {
  e.preventDefault();
  const title = document.getElementById('docDiagnosisTitle').value;
  state.patient.timeline.unshift({
    year: '2026',
    event: title,
    facility: 'City Heart Care Institute',
    doc: 'Dr. Ananya Rao',
    type: 'Cardiology',
    status: 'Verified'
  });
  renderPatientTimeline();
  alert('Clinical diagnosis and prescription synced successfully to patient MediBridge record!');
}

// HOSPITAL & LAB DASHBOARD UPLOADER
function handleHospitalUploadSubmit(e) {
  e.preventDefault();
  const cat = document.getElementById('uploadCategory').value;
  const hId = document.getElementById('uploadHealthId').value;
  const summary = document.getElementById('uploadSummary').value;

  state.uploadHistory.unshift({
    date: new Date().toISOString().split('T')[0],
    patientId: hId,
    type: cat,
    status: 'Synced',
    docName: `${cat.toLowerCase().replace(/ /g, '_')}_summary.pdf`
  });

  state.patient.reports.unshift({
    id: `REP-${Math.floor(Math.random()*900+100)}`,
    title: `${cat} - ${summary.substring(0, 30)}...`,
    date: new Date().toISOString().split('T')[0],
    category: cat,
    facility: 'City Central General Hospital',
    file: 'summary.pdf'
  });

  renderHospitalUploadHistory();
  renderPatientReports();
  alert(`Document (${cat}) uploaded and synced to Health ID ${hId} successfully!`);
}

function renderHospitalUploadHistory() {
  const container = document.getElementById('hospitalUploadHistoryTable');
  const countBadge = document.getElementById('uploadCountBadge');
  countBadge.innerText = `${state.uploadHistory.length} Records`;

  container.innerHTML = state.uploadHistory.map(item => `
    <tr>
      <td>${item.date}</td>
      <td><strong>${item.patientId}</strong></td>
      <td>${item.type}</td>
      <td><span class="badge-small bg-green">${item.status}</span></td>
      <td><button class="btn btn-sm btn-outline" onclick="alert('Viewing file: ${item.docName}')"><i class="fa-solid fa-file"></i> View</button></td>
    </tr>
  `).join('');
}

// LIVE HOSPITAL BED & ICU AVAILABILITY MATRIX
function showBedPlatformModal() {
  document.getElementById('bedPlatformModal').classList.remove('hidden');
  renderBedMatrix();
}
function closeBedPlatformModal() {
  document.getElementById('bedPlatformModal').classList.add('hidden');
}

function renderBedMatrix() {
  const container = document.getElementById('bedMatrixGrid');
  const loc = document.getElementById('bedLocFilter') ? document.getElementById('bedLocFilter').value : 'all';
  const type = document.getElementById('bedTypeFilter') ? document.getElementById('bedTypeFilter').value : 'all';

  let filtered = state.hospitalBeds;
  if (loc !== 'all') {
    filtered = filtered.filter(b => b.location === loc);
  }

  container.innerHTML = filtered.map(h => `
    <div class="hospital-bed-card">
      <h4><i class="fa-solid fa-hospital text-purple"></i> ${h.hospital}</h4>
      <small class="text-muted"><i class="fa-solid fa-location-dot"></i> ${h.location} | Phone: ${h.phone}</small>

      <div class="bed-stats-row">
        <div class="bed-stat-pill">
          <small>ICU Beds (Ventilator)</small>
          <strong class="${h.icuBeds.avail > 3 ? 'text-emerald' : 'text-red'}">${h.icuBeds.avail} / ${h.icuBeds.total}</strong>
        </div>
        <div class="bed-stat-pill">
          <small>Oxygen Beds</small>
          <strong class="text-blue">${h.oxyBeds.avail} / ${h.oxyBeds.total}</strong>
        </div>
        <div class="bed-stat-pill">
          <small>General Ward</small>
          <strong class="text-purple">${h.wardBeds.avail} / ${h.wardBeds.total}</strong>
        </div>
      </div>

      <button class="btn btn-purple btn-full btn-sm" onclick="reserveBedModal('${h.hospital}')">
        <i class="fa-solid fa-bookmark"></i> Instant Bed Reservation Request
      </button>
    </div>
  `).join('');
}

function filterBedMatrix() {
  renderBedMatrix();
}

function reserveBedModal(hospitalName) {
  alert(`[MediBridge Bed Allocation System]\n\nReservation Request Sent to ${hospitalName}.\n\nAn emergency bed block confirmation SMS has been dispatched to your registered mobile number.`);
}

// AI EMERGENCY DECISION & SMART RESPONSE ENGINE
function openAIEmergencyModal() {
  document.getElementById('aiEmergencyModal').classList.remove('hidden');
}
function closeAIEmergencyModal() {
  document.getElementById('aiEmergencyModal').classList.add('hidden');
}

function calculateAIEmergencyTriage(e) {
  e.preventDefault();
  const sys = parseInt(document.getElementById('aiSysBP').value);
  const dia = parseInt(document.getElementById('aiDiaBP').value);
  const hr = parseInt(document.getElementById('aiHeartRate').value);
  const spo2 = parseInt(document.getElementById('aiSpO2').value);

  const selectedSymptoms = Array.from(document.querySelectorAll('input[name="symptom"]:checked')).map(c => c.value);

  let triageLevel = 'GREEN';
  let triageClass = 'triage-green';
  let title = 'STABLE - STANDARD CARE';
  let actionText = 'Vitals within tolerable limits. Maintain regular medication schedule.';

  if (sys > 160 || dia > 100 || spo2 < 90 || selectedSymptoms.includes('Chest Pain') || selectedSymptoms.includes('Loss of Consciousness')) {
    triageLevel = 'RED';
    triageClass = 'triage-red';
    title = 'CRITICAL EMERGENCY (RED ALBERT TRIAGE)';
    actionText = 'IMMEDIATE INTERVENTION REQUIRED. Severe cardiovascular/respiratory stress detected. Automated 108 Emergency Ambulance alert triggered. Nearest available ICU bed allocated at City Central Hospital.';
  } else if (sys > 140 || dia > 90 || spo2 < 94 || selectedSymptoms.length > 0) {
    triageLevel = 'YELLOW';
    triageClass = 'triage-yellow';
    title = 'URGENT MEDICAL ATTENTION (YELLOW TRIAGE)';
    actionText = 'Elevated vital markers. Recommended emergency visit to urgent care clinic within 1 hour.';
  }

  const resultBox = document.getElementById('aiTriageResult');
  resultBox.className = `ai-triage-output ${triageClass}`;
  resultBox.classList.remove('hidden');

  resultBox.innerHTML = `
    <h3><i class="fa-solid fa-shield-cat"></i> AI Triage Result: <span class="highlight">${triageLevel}</span></h3>
    <h4>${title}</h4>
    <p class="mt-2">${actionText}</p>
    <div class="mt-3">
      <strong>Computed Telemetry:</strong> BP: ${sys}/${dia} mmHg | HR: ${hr} BPM | SpO2: ${spo2}%
    </div>
    <div class="mt-3 flex gap-2">
      <button class="btn btn-danger btn-sm" onclick="alert('108 Emergency Ambulance Dispatched to your GPS Location!')"><i class="fa-solid fa-truck-medical"></i> Dispatch Ambulance Now</button>
      <button class="btn btn-outline btn-sm" onclick="showBedPlatformModal()"><i class="fa-solid fa-bed"></i> Reserve ICU Bed</button>
    </div>
  `;
}

// EMERGENCY QR CODE GENERATOR
function openEmergencyQRModal() {
  document.getElementById('emergencyQRModal').classList.remove('hidden');
  const qrContainer = document.getElementById('qrcodeCanvas');
  qrContainer.innerHTML = '';

  const emergencyPayload = JSON.stringify({
    app: 'MediBridge Smart Health Pass',
    id: state.patient.healthId,
    name: state.patient.name,
    blood: state.patient.bloodGroup,
    allergies: state.patient.allergies,
    contact: state.patient.emergencyContact,
    chronic: state.patient.chronicConditions
  });

  if (window.QRCode) {
    new QRCode(qrContainer, {
      text: emergencyPayload,
      width: 160,
      height: 160,
      colorDark : "#7E22CE",
      colorLight : "#ffffff"
    });
  }
}
function closeEmergencyQRModal() {
  document.getElementById('emergencyQRModal').classList.add('hidden');
}

// SHARE RECORDS WITH DOCTOR MODAL
function openShareRecordModal() {
  document.getElementById('shareRecordModal').classList.remove('hidden');
}
function closeShareRecordModal() {
  document.getElementById('shareRecordModal').classList.add('hidden');
}
function generateNewPin() {
  const pin = Math.floor(100000 + Math.random() * 900000).toString().replace(/(\d{3})(\d{3})/, '$1-$2');
  document.getElementById('tempAccessPin').innerText = pin;
}
function grantDirectDoctorAccess() {
  const docId = document.getElementById('docDirectId').value.trim();
  if (!docId) return;
  state.patient.authorizedDoctors.push({
    docId: docId,
    name: `Doctor (${docId})`,
    specialty: 'General Practice',
    grantedDate: new Date().toISOString().split('T')[0],
    status: 'Active (24h left)'
  });
  renderDoctorAccessList();
  closeShareRecordModal();
  alert(`Access permission granted to ${docId} for 24 hours.`);
}

// SETTINGS MODAL
function openSettingsModal() {
  document.getElementById('settingsModal').classList.remove('hidden');
}
function closeSettingsModal() {
  document.getElementById('settingsModal').classList.add('hidden');
}
function switchSettingsTab(tabId) {
  document.querySelectorAll('.settings-tabs .tab-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  document.querySelectorAll('.settings-pane').forEach(p => p.classList.add('hidden'));
  document.getElementById(tabId).classList.remove('hidden');
}
function handleSaveProfile(e) {
  e.preventDefault();
  state.patient.name = document.getElementById('setFullName').value;
  state.patient.age = document.getElementById('setAge').value;
  state.patient.bloodGroup = document.getElementById('setBlood').value;
  state.patient.allergies = document.getElementById('setAllergies').value;

  document.getElementById('pName').innerText = state.patient.name;
  document.getElementById('pAge').innerText = `${state.patient.age} Yrs`;
  document.getElementById('pBlood').innerText = state.patient.bloodGroup;
  document.getElementById('pAllergies').innerText = state.patient.allergies;

  closeSettingsModal();
  alert('Profile settings saved successfully.');
}
function handleChangePassword(e) {
  e.preventDefault();
  closeSettingsModal();
  alert('Password updated successfully.');
}

// FLOATING MEDIBOT AI CHATBOT
function toggleMediBot() {
  document.getElementById('medibotWindow').classList.toggle('hidden');
}

function handleChatKeyPress(e) {
  if (e.key === 'Enter') sendChatMessage();
}

function sendQuickChat(text) {
  document.getElementById('chatInput').value = text;
  sendChatMessage();
}

function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const query = input.value.trim();
  if (!query) return;

  const chatContainer = document.getElementById('chatMessageContainer');

  // Append user message
  chatContainer.innerHTML += `
    <div class="chat-msg user-msg">
      <div class="msg-bubble">${query}</div>
    </div>
  `;
  input.value = '';

  // Scroll to bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Bot response simulation
  setTimeout(() => {
    let reply = "I can assist you with understanding your health records, finding ICU beds, or sharing records with your doctor. Contact helpline 040-1463381 for direct medical assistance.";

    const qLower = query.toLowerCase();
    if (qLower.includes('bp') || qLower.includes('blood pressure')) {
      reply = "Your latest Blood Pressure is **119/79 mmHg**, which is within the optimal healthy range (SYS < 120, DIA < 80). Keep up your exercise routine!";
    } else if (qLower.includes('share') || qLower.includes('doctor')) {
      reply = "To share records, click **'Share Records with Doctor'** in your patient dashboard to generate a 24-hour access PIN (e.g. 749-201).";
    } else if (qLower.includes('bed') || qLower.includes('icu')) {
      reply = "City Central Hospital currently has **4 ICU beds** available and 18 General Ward beds. Click 'Live Bed Availability' on top to reserve.";
    }

    chatContainer.innerHTML += `
      <div class="chat-msg bot-msg">
        <div class="msg-bubble">${reply}</div>
      </div>
    `;
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, 600);
}

function handleContactSubmit(e) {
  e.preventDefault();
  alert('Thank you for contacting MediBridge! Our support representative will call you back at 040-1463381 shortly.');
}
