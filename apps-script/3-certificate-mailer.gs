/**
 * ============================================================
 * AI OFFICE AUTOMATION — CERTIFICATE GENERATOR & MAILER
 * ============================================================
 *
 * អានលទ្ធផលតេស្ត → បង្កើតវិញ្ញាបនបត្រ PDF → ផ្ញើតាមអ៊ីមែល។
 * Reads the quiz results sheet, generates a PDF certificate for
 * everyone who passed, saves it to Drive, and emails it out.
 *
 * ── របៀបប្រើ · HOW TO RUN ──────────────────────────────────
 *  1. បើកតារាងលទ្ធផលរបស់តេស្ត (Quiz responses spreadsheet)
 *  2. Extensions → Apps Script
 *  3. បិទភ្ជាប់ឯកសារនេះ · កែ CERT_CONFIG
 *  4. Run → setupCertificateSheet()   (បង្កើតសន្លឹកតាមដាន)
 *  5. Run → issueAllPending()          (បង្កើត និងផ្ញើទាំងអស់)
 *
 * របៀបសាកល្បងមុន៖ Run → previewOneCertificate()
 * វាបង្កើត PDF ១ ដាក់ក្នុង Drive ដោយមិនផ្ញើអ៊ីមែល។
 * ============================================================
 */

var CERT_CONFIG = {
  courseName:     'AI for Office Automation',
  courseNameKm:   'ការងារ ៨ ម៉ោង — សល់ត្រឹម ២ ម៉ោង',
  organiser:      'Department of Small and Medium Taxation',
  organiserKm:    'នាយកដ្ឋានគ្រប់គ្រងអ្នកជាប់ពន្ធតូចនិងមធ្យម',
  signer:         'Khut Sopheak',
  signerRole:     'អ្នកបណ្តុះបណ្តាល · Trainer',
  duration:       '60 minutes',
  issueDate:      '14 August 2026',

  certType:       'attendance',   // 'attendance' | 'completion' | 'excellence'
  idPrefix:       'DSMT-AIOA-2026-',

  // ថតក្នុង Drive · leave blank to create one automatically
  driveFolderId:  '',

  replyTo:        'hello@example.com',
  passPercent:    70,

  // សុវត្ថិភាព៖ ដាក់ true ដើម្បីសាកល្បងដោយមិនផ្ញើអ៊ីមែលពិត
  dryRun:         false
};

var RESULTS_SHEET = 'លទ្ធផល · Results';
var CERTS_SHEET   = 'វិញ្ញាបនបត្រ · Certificates';


/* ============================================================
   ១ · រៀបចំសន្លឹកតាមដាន
   ============================================================ */
function setupCertificateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CERTS_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(CERTS_SHEET);
    sheet.getRange('A1:H1').setValues([[
      'លេខវិញ្ញាបនបត្រ', 'ឈ្មោះ', 'អ៊ីមែល', 'ពិន្ទុ',
      'ថ្ងៃចេញ', 'ស្ថានភាព', 'តំណ PDF', 'កំណត់ចំណាំ'
    ]]);
    sheet.getRange('A1:H1')
         .setFontWeight('bold')
         .setBackground('#1a3325')
         .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 170);
    sheet.setColumnWidth(2, 190);
    sheet.setColumnWidth(3, 230);
    sheet.setColumnWidth(7, 260);
  }

  Logger.log('✅ សន្លឹក «' + CERTS_SHEET + '» រួចរាល់។');
  return sheet;
}


/* ============================================================
   ២ · ចេញវិញ្ញាបនបត្រទាំងអស់ដែលនៅសល់
   ============================================================ */
function issueAllPending() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var results = ss.getSheetByName(RESULTS_SHEET);

  if (!results) {
    throw new Error('រកសន្លឹក «' + RESULTS_SHEET + '» មិនឃើញ។ ' +
      'សូមរត់ស្គ្រីបតេស្តជាមុនសិន ឬប្តូរតម្លៃ RESULTS_SHEET។');
  }

  var certSheet = setupCertificateSheet();
  var alreadyIssued = readIssuedEmails_(certSheet);
  var folder = getOrCreateFolder_();

  var rows = results.getDataRange().getValues();
  var header = rows.shift();

  var idxName    = header.indexOf('ឈ្មោះ');
  var idxEmail   = header.indexOf('អ៊ីមែល');
  var idxPercent = header.indexOf('ភាគរយ');
  var idxScore   = header.indexOf('ពិន្ទុ');
  var idxTotal   = header.indexOf('ពិន្ទុសរុប');

  if (idxEmail === -1) {
    throw new Error('រកជួរឈរ «អ៊ីមែល» មិនឃើញក្នុងសន្លឹកលទ្ធផល។');
  }

  var issued = 0, skipped = 0, failed = 0;
  var counter = certSheet.getLastRow(); // continues numbering across runs

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var email = String(row[idxEmail] || '').trim();
    var name  = String(row[idxName] || '').trim();
    if (!email) continue;

    var percent = parsePercent_(row[idxPercent]);
    if (percent < CERT_CONFIG.passPercent) { skipped++; continue; }
    if (alreadyIssued[email.toLowerCase()]) { skipped++; continue; }

    counter++;
    var certId = CERT_CONFIG.idPrefix + padNumber_(counter, 4);
    var scoreText = idxScore !== -1 && idxTotal !== -1
      ? row[idxScore] + '/' + row[idxTotal] + ' · ' + percent + '%'
      : percent + '%';

    try {
      var pdf = makeCertificatePdf_(name, certId, scoreText);
      var file = folder.createFile(pdf);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      if (!CERT_CONFIG.dryRun) {
        sendCertificateEmail_(email, name, certId, scoreText, pdf);
      }

      certSheet.appendRow([
        certId, name, email, scoreText, new Date(),
        CERT_CONFIG.dryRun ? 'បង្កើត (មិនផ្ញើ)' : 'ផ្ញើរួច',
        file.getUrl(), ''
      ]);

      alreadyIssued[email.toLowerCase()] = true;
      issued++;

      Utilities.sleep(700); // ថ្នមកូតាអ៊ីមែល

    } catch (err) {
      failed++;
      certSheet.appendRow([
        certId, name, email, scoreText, new Date(),
        'បរាជ័យ', '', String(err)
      ]);
      Logger.log('⚠️ បរាជ័យសម្រាប់ ' + email + ': ' + err);
    }
  }

  Logger.log('════════════════════════════════════════');
  Logger.log('✅ ចេញថ្មី:  ' + issued);
  Logger.log('⏭  រំលង:     ' + skipped + ' (មិនជាប់ ឬចេញរួចហើយ)');
  Logger.log('❌ បរាជ័យ:   ' + failed);
  if (CERT_CONFIG.dryRun) Logger.log('⚠️ DRY RUN — គ្មានអ៊ីមែលត្រូវបានផ្ញើទេ។');
  Logger.log('════════════════════════════════════════');
}


/* ============================================================
   ៣ · សាកល្បង ១ សន្លឹក ដោយមិនផ្ញើអ៊ីមែល
   ============================================================ */
function previewOneCertificate() {
  var folder = getOrCreateFolder_();
  var pdf = makeCertificatePdf_('Sok Dara', CERT_CONFIG.idPrefix + '0000', '14/15 · 93%');
  var file = folder.createFile(pdf);
  Logger.log('👀 សាកល្បងរួចរាល់ — បើកមើលនៅទីនេះ: ' + file.getUrl());
}


/* ============================================================
   បង្កើត PDF · PDF rendering
   ============================================================ */

var CERT_TYPES = {
  attendance: {
    en: 'Certificate of Attendance',
    km: 'វិញ្ញាបនបត្រចូលរួម',
    line: 'បានចូលរួមពេញលេញក្នុងសិក្ខាសាលា'
  },
  completion: {
    en: 'Certificate of Completion',
    km: 'វិញ្ញាបនបត្របញ្ចប់វគ្គសិក្សា',
    line: 'បានបញ្ចប់ដោយជោគជ័យនូវវគ្គបណ្តុះបណ្តាល'
  },
  excellence: {
    en: 'Certificate of Excellence',
    km: 'វិញ្ញាបនបត្រស័ក្តិសមឧត្តមភាព',
    line: 'បានបញ្ចប់ដោយលទ្ធផលឆ្នើមនូវវគ្គបណ្តុះបណ្តាល'
  }
};

/**
 * បង្កើត PDF ពី HTML។ Google បំប្លែង HTML → PDF ដោយផ្ទាល់។
 * Note: the HTML→PDF converter supports only basic CSS, so this
 * layout deliberately avoids flexbox/grid and uses tables.
 */
function makeCertificatePdf_(name, certId, scoreText) {
  var html = buildCertificateHtml_(name, certId, scoreText);
  var blob = Utilities.newBlob(html, MimeType.HTML, certId + '.html');
  return blob.getAs(MimeType.PDF).setName(
    certId + ' · ' + (name || 'certificate') + '.pdf'
  );
}

function buildCertificateHtml_(name, certId, scoreText) {
  var t = CERT_TYPES[CERT_CONFIG.certType] || CERT_TYPES.attendance;

  return [
    '<!doctype html><html><head><meta charset="utf-8"><style>',
    '@page { size: A4 landscape; margin: 0; }',
    'body { margin:0; padding:0; font-family: Arial, "Khmer OS Battambang", sans-serif;',
    '       color:#0d1712; background:#ffffff; }',
    '.page { width:100%; padding:34px 44px; box-sizing:border-box; text-align:center; }',
    '.outer { border:1px solid #d9e2dc; padding:6px; }',
    '.inner { border:3px solid #16a34a; padding:36px 40px; }',
    '.kicker { font-size:10px; letter-spacing:5px; color:#0f7a44;',
    '          font-weight:bold; text-transform:uppercase; margin-bottom:12px; }',
    '.title { font-family:Georgia,serif; font-size:34px; margin:0 0 4px; }',
    '.title-km { font-size:15px; color:#3d4a43; margin-bottom:26px; }',
    '.presented { font-size:12px; color:#6b7873; margin-bottom:10px; }',
    '.name { font-family:Georgia,serif; font-size:38px; font-weight:bold;',
    '        margin:0 0 6px; color:#0d1712; }',
    '.rule { width:260px; height:4px; background:#16a34a; margin:14px auto 22px; }',
    '.citation { font-size:13px; color:#3d4a43; line-height:1.9; margin:0 auto 26px;',
    '            max-width:640px; }',
    '.course { font-weight:bold; color:#0d1712; }',
    '.meta { font-size:11px; color:#6b7873; margin-bottom:30px; }',
    '.meta b { color:#0f7a44; letter-spacing:2px; font-size:9px; }',
    '.sig-table { width:80%; margin:0 auto; border-collapse:collapse; }',
    '.sig-table td { width:50%; padding:0 24px; text-align:center;',
    '                vertical-align:bottom; }',
    '.sig-line { border-top:1px solid #d9e2dc; padding-top:7px; }',
    '.sig-name { font-size:13px; font-weight:bold; }',
    '.sig-name-km { font-size:11px; color:#3d4a43; }',
    '.sig-role { font-size:10px; color:#6b7873; }',
    '.footer { margin-top:28px; font-size:9px; color:#6b7873; letter-spacing:1px; }',
    '</style></head><body><div class="page"><div class="outer"><div class="inner">',

    '<div class="kicker">', esc3_(CERT_CONFIG.organiser), ' &middot; Cambodia</div>',
    '<div class="title">', esc3_(t.en), '</div>',
    '<div class="title-km">', esc3_(t.km), '</div>',

    '<div class="presented">សូមប្រកាសជូន &middot; This is presented to</div>',
    '<div class="name">', esc3_(name || '—'), '</div>',
    '<div class="rule"></div>',

    '<div class="citation">',
      esc3_(t.line), ' <span class="course">', esc3_(CERT_CONFIG.courseName),
      '</span> — ', esc3_(CERT_CONFIG.courseNameKm), '<br>',
      'covering prompting, workflow design, and building a first ',
      'human-approved automation.',
    '</div>',

    '<div class="meta">',
      '<b>DATE</b> &nbsp;', esc3_(CERT_CONFIG.issueDate),
      ' &nbsp;&nbsp;|&nbsp;&nbsp; <b>DURATION</b> &nbsp;', esc3_(CERT_CONFIG.duration),
      (scoreText ? ' &nbsp;&nbsp;|&nbsp;&nbsp; <b>ASSESSMENT</b> &nbsp;' + esc3_(scoreText) : ''),
    '</div>',

    '<table class="sig-table"><tr>',
      '<td><div class="sig-line">',
        '<div class="sig-name">', esc3_(CERT_CONFIG.signer), '</div>',
        '<div class="sig-role">', esc3_(CERT_CONFIG.signerRole), '</div>',
      '</div></td>',
      '<td><div class="sig-line">',
        '<div class="sig-name">', esc3_(CERT_CONFIG.organiser), '</div>',
        '<div class="sig-name-km">', esc3_(CERT_CONFIG.organiserKm), '</div>',
        '<div class="sig-role">Training Provider</div>',
      '</div></td>',
    '</tr></table>',

    '<div class="footer">CERTIFICATE ID &nbsp;', esc3_(certId), '</div>',

    '</div></div></div></body></html>'
  ].join('');
}


/* ============================================================
   អ៊ីមែលផ្ញើវិញ្ញាបនបត្រ
   ============================================================ */
function sendCertificateEmail_(email, name, certId, scoreText, pdfBlob) {
  MailApp.sendEmail({
    to: email,
    replyTo: CERT_CONFIG.replyTo,
    name: CERT_CONFIG.organiser,
    subject: '🎓 វិញ្ញាបនបត្ររបស់អ្នក · ' + CERT_CONFIG.courseName,
    attachments: [pdfBlob],
    htmlBody: [
      '<div style="font-family:Arial,\'Khmer OS Battambang\',sans-serif;',
      'max-width:600px;margin:0 auto;background:#0b100d;color:#e8efe9;',
      'padding:34px;border-radius:14px;line-height:1.7">',

      '<div style="color:#4ade80;font-size:12px;letter-spacing:2px;',
      'font-weight:bold;margin-bottom:10px">DSMT · CERTIFICATE</div>',

      '<h1 style="font-size:22px;margin:0 0 18px;color:#fff">',
      'អបអរសាទរ ', esc3_(name || ''), '!</h1>',

      '<p>វិញ្ញាបនបត្ររបស់អ្នកសម្រាប់វគ្គ <strong>',
      esc3_(CERT_CONFIG.courseName), '</strong> ត្រូវបានភ្ជាប់មកជាមួយអ៊ីមែលនេះ ',
      'ជាទម្រង់ PDF។</p>',

      '<div style="background:#141b16;border:1px solid #22302a;border-radius:10px;',
      'padding:18px;margin:22px 0">',
        '<div style="margin-bottom:6px">🎓 <strong>លេខវិញ្ញាបនបត្រ៖</strong> ',
        esc3_(certId), '</div>',
        (scoreText ? '<div>📊 <strong>ពិន្ទុតេស្ត៖</strong> ' + esc3_(scoreText) + '</div>' : ''),
      '</div>',

      '<h3 style="color:#4ade80;font-size:15px;margin:26px 0 10px">',
      'ជំហានបន្ទាប់</h3>',
      '<ol style="padding-left:20px;margin:0">',
        '<li>ជ្រើសរើសការងារដដែលៗ ១ ហើយសង់ជំហានទី១ នៅសប្តាហ៍នេះ។</li>',
        '<li>ចាប់ផ្តើមក្នុងរបៀបព្រាង — AI ព្រាង អ្នកចុចអនុម័ត។</li>',
        '<li>ចែករំលែកលទ្ធផលរបស់អ្នកក្នុងក្រុម — យើងចង់ឃើញ។</li>',
      '</ol>',

      '<div style="border-top:1px solid #22302a;margin-top:28px;padding-top:18px;',
      'color:#7d8b83;font-size:12px">',
        esc3_(CERT_CONFIG.organiserKm), '<br>',
      esc3_(CERT_CONFIG.organiser), ' · ', esc3_(CERT_CONFIG.signer), '<br>',
        'សំណួរផ្សេងៗ សូមឆ្លើយត្រឡប់មកអ៊ីមែលនេះ។',
      '</div>',
      '</div>'
    ].join('')
  });
}


/* ============================================================
   ជំនួយ · Helpers
   ============================================================ */

function getOrCreateFolder_() {
  if (CERT_CONFIG.driveFolderId) {
    return DriveApp.getFolderById(CERT_CONFIG.driveFolderId);
  }
  var folderName = CERT_CONFIG.courseName + ' · Certificates';
  var it = DriveApp.getFoldersByName(folderName);
  return it.hasNext() ? it.next() : DriveApp.createFolder(folderName);
}

function readIssuedEmails_(sheet) {
  var map = {};
  if (sheet.getLastRow() < 2) return map;

  var values = sheet.getRange(2, 3, sheet.getLastRow() - 1, 4).getValues();
  values.forEach(function (r) {
    var email = String(r[0] || '').trim().toLowerCase();
    var status = String(r[3] || '');
    // Only treat successful issues as "already done" so failures can retry
    if (email && status.indexOf('បរាជ័យ') === -1) map[email] = true;
  });
  return map;
}

function parsePercent_(v) {
  if (typeof v === 'number') return v <= 1 ? Math.round(v * 100) : Math.round(v);
  var m = String(v || '').match(/(\d+(?:\.\d+)?)/);
  return m ? Math.round(parseFloat(m[1])) : 0;
}

function padNumber_(n, width) {
  var s = String(n);
  while (s.length < width) s = '0' + s;
  return s;
}

function esc3_(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}


/* ============================================================
   ម៉ឺនុយក្នុងតារាង · Spreadsheet menu
   ============================================================ */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🎓 វិញ្ញាបនបត្រ')
    .addItem('រៀបចំសន្លឹកតាមដាន', 'setupCertificateSheet')
    .addItem('សាកល្បង ១ សន្លឹក (មិនផ្ញើ)', 'previewOneCertificate')
    .addSeparator()
    .addItem('ចេញ និងផ្ញើទាំងអស់', 'issueAllPending')
    .addToUi();
}
