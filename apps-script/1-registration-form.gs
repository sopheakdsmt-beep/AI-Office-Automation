/**
 * ============================================================
 * AI OFFICE AUTOMATION — REGISTRATION FORM BUILDER
 * ============================================================
 *
 * បង្កើតទម្រង់ចុះឈ្មោះ Google Form ដោយស្វ័យប្រវត្តិ
 * Builds the workshop registration Google Form, wires it to a
 * response spreadsheet, and sends a bilingual confirmation
 * email to every registrant.
 *
 * ── របៀបប្រើ · HOW TO RUN ──────────────────────────────────
 *  1. បើក  https://script.google.com  →  New project
 *  2. បិទភ្ជាប់ឯកសារនេះទាំងមូល (Paste this whole file)
 *  3. កែតម្លៃក្នុង CONFIG ខាងក្រោម
 *  4. Run → buildRegistrationForm()   (អនុញ្ញាតសិទ្ធិពេលវាសួរ)
 *  5. Run → installConfirmationTrigger()
 *  6. Logs នឹងបង្ហាញ URL សម្រាប់ចែក និង URL សម្រាប់កែ
 *
 * Nothing here needs editing except CONFIG.
 * ============================================================
 */

var CONFIG = {
  // ── ព័ត៌មានវគ្គ · Workshop details ──
  workshopTitle:  'AI Office Automation',
  workshopTagline: 'ការងារ ៨ ម៉ោង — សល់ត្រឹម ២ ម៉ោង',
  workshopDate:   '១៤ សីហា ២០២៦',        // display only
  workshopTime:   '១៩:០០ – ២០:០០ (ម៉ោងកម្ពុជា)',
  workshopPlace:  'Online · Zoom',
  organiser:      'Department of Small and Medium Taxation',
  organiserKm:    'នាយកដ្ឋានគ្រប់គ្រងអ្នកជាប់ពន្ធតូចនិងមធ្យម',
  presenter:      'អ៊ាត់ សួរ (Eath Suo)',

  // ── តំណភ្ជាប់ · Links (fill these in before running) ──
  joinLink:       'https://example.com/zoom-link',
  telegramGroup:  'https://t.me/your_group',
  promptLibrary:  'https://example.com/prompt-library',

  // ── អ៊ីមែល · Email ──
  replyTo:        'hello@example.com',
  sendConfirmation: true,

  // ── ចំណុះ · Capacity (0 = គ្មានកំណត់) ──
  seatLimit:      0
};


/**
 * ស្នូល · Main entry point. Creates the form end to end.
 */
function buildRegistrationForm() {
  var form = FormApp.create(CONFIG.workshopTitle + ' · ចុះឈ្មោះចូលរួម');

  form.setTitle(CONFIG.workshopTitle + ' · ចុះឈ្មោះចូលរួម')
      .setDescription(buildFormDescription())
      .setCollectEmail(true)
      .setProgressBar(true)
      .setAllowResponseEdits(true)
      .setShowLinkToRespondAgain(false)
      .setConfirmationMessage(buildConfirmationMessage());

  addIdentitySection_(form);
  addContextSection_(form);
  addNeedsSection_(form);
  addLogisticsSection_(form);

  var ss = createResponseSpreadsheet_(form);

  Logger.log('════════════════════════════════════════');
  Logger.log('✅ ទម្រង់ចុះឈ្មោះត្រូវបានបង្កើត');
  Logger.log('📝 ចែកតំណនេះ (Share this): ' + form.getPublishedUrl());
  Logger.log('🔗 តំណខ្លី (Short URL):     ' + form.shortenFormUrl(form.getPublishedUrl()));
  Logger.log('✏️  កែទម្រង់ (Edit):        ' + form.getEditUrl());
  Logger.log('📊 តារាងចម្លើយ (Responses): ' + ss.getUrl());
  Logger.log('════════════════════════════════════════');
  Logger.log('ជំហានបន្ទាប់៖ Run → installConfirmationTrigger()');

  return form;
}


/* ============================================================
   ផ្នែកទី ១ · អត្តសញ្ញាណ — Who are you
   ============================================================ */
function addIdentitySection_(form) {
  form.addSectionHeaderItem()
      .setTitle('ផ្នែកទី ១ · ព័ត៌មានផ្ទាល់ខ្លួន')
      .setHelpText('យើងប្រើព័ត៌មាននេះសម្រាប់ផ្ញើតំណចូលរួម និងវិញ្ញាបនបត្រ។');

  form.addTextItem()
      .setTitle('ឈ្មោះពេញ (ជាភាសាខ្មែរ)')
      .setHelpText('ឧ. អ៊ាត់ សួរ')
      .setRequired(true);

  form.addTextItem()
      .setTitle('ឈ្មោះពេញ (ជាអក្សរឡាតាំង) · Full name in Latin script')
      .setHelpText('ឈ្មោះនេះនឹងបង្ហាញលើវិញ្ញាបនបត្ររបស់អ្នក — សូមសរសេរឲ្យត្រឹមត្រូវ។')
      .setRequired(true);

  var phone = form.addTextItem()
      .setTitle('លេខទូរស័ព្ទ / Telegram')
      .setHelpText('ឧ. 012 345 678 — យើងផ្ញើការរំលឹកមុនវគ្គ ១ ម៉ោង។')
      .setRequired(true);

  // ត្រួតពិនិត្យថាមានលេខយ៉ាងតិច ៨ ខ្ទង់
  phone.setValidation(
    FormApp.createTextValidation()
      .setHelpText('សូមបញ្ចូលលេខទូរស័ព្ទត្រឹមត្រូវ (យ៉ាងតិច ៨ ខ្ទង់)។')
      .requireTextMatchesPattern('[0-9+\\-\\s()]{8,}')
      .build()
  );
}


/* ============================================================
   ផ្នែកទី ២ · បរិបទការងារ — Work context
   ============================================================ */
function addContextSection_(form) {
  form.addPageBreakItem()
      .setTitle('ផ្នែកទី ២ · ការងាររបស់អ្នក')
      .setHelpText('ចម្លើយទាំងនេះជួយយើងរៀបចំឧទាហរណ៍ឲ្យត្រូវនឹងការងាររបស់អ្នក។');

  form.addTextItem()
      .setTitle('ក្រុមហ៊ុន / អង្គភាព')
      .setRequired(false);

  form.addListItem()
      .setTitle('តួនាទីរបស់អ្នក')
      .setChoiceValues([
        'រដ្ឋបាល / ធុរកិច្ចទូទៅ (Admin)',
        'គណនេយ្យ / ហិរញ្ញវត្ថុ',
        'ធនធានមនុស្ស (HR)',
        'លក់ / ទីផ្សារ',
        'សេវាអតិថិជន',
        'ប្រតិបត្តិការ / ភស្តុភារ',
        'ម្ចាស់អាជីវកម្ម / នាយក',
        'គ្រូបង្រៀន / អប់រំ',
        'និស្សិត',
        'ផ្សេងៗ'
      ])
      .setRequired(true);

  form.addMultipleChoiceItem()
      .setTitle('បទពិសោធន៍ការងារ')
      .setChoiceValues([
        'ក្រោម ១ ឆ្នាំ',
        '១ – ៣ ឆ្នាំ',
        '៤ – ៧ ឆ្នាំ',
        'លើសពី ៧ ឆ្នាំ'
      ])
      .setRequired(true);

  form.addCheckboxItem()
      .setTitle('ឧបករណ៍ដែលអ្នកប្រើជាប្រចាំ (ជ្រើសបានច្រើន)')
      .setChoiceValues([
        'Gmail / Outlook',
        'Google Sheets / Excel',
        'Google Docs / Word',
        'Telegram',
        'Google Forms',
        'ChatGPT ឬ Claude',
        'Zapier / Make / n8n',
        'កម្មវិធីគណនេយ្យ (QuickBooks, ជាដើម)'
      ])
      .showOtherOption(true)
      .setRequired(true);

  form.addMultipleChoiceItem()
      .setTitle('កម្រិតបទពិសោធន៍ជាមួយ AI របស់អ្នក')
      .setHelpText('គ្មានចម្លើយខុសទេ — យើងគ្រាន់តែចង់ដឹងចំណុចចាប់ផ្តើម។')
      .setChoiceValues([
        '១ · មិនធ្លាប់ប្រើសោះ',
        '២ · ធ្លាប់សាកល្បង តែមិនប្រើជាប្រចាំ',
        '៣ · ប្រើរាល់សប្តាហ៍សម្រាប់ការងារ',
        '៤ · ប្រើរាល់ថ្ងៃ ហើយចេះសរសេរ Prompt',
        '៥ · ធ្លាប់សង់ Automation រួចហើយ'
      ])
      .setRequired(true);
}


/* ============================================================
   ផ្នែកទី ៣ · តម្រូវការ — What they need
   ============================================================ */
function addNeedsSection_(form) {
  form.addPageBreakItem()
      .setTitle('ផ្នែកទី ៣ · អ្វីដែលអ្នកចង់បាន')
      .setHelpText('សំណួរសំខាន់បំផុត — ចម្លើយរបស់អ្នកនឹងក្លាយជាឧទាហរណ៍ក្នុងវគ្គ។');

  form.addCheckboxItem()
      .setTitle('ការងារណាដែលស៊ីពេលអ្នកច្រើនបំផុត? (ជ្រើសបាន ៣)')
      .setChoiceValues([
        'ធ្វើរបាយការណ៍ប្រចាំសប្តាហ៍ / ខែ',
        'វាយបញ្ចូលទិន្នន័យពី Invoice ឬបង្កាន់ដៃ',
        'ឆ្លើយ Email ដដែលៗ',
        'រៀបចំកំណត់ហេតុប្រជុំ',
        'តាមដានស្ថានភាពការងារពីក្រុម',
        'ធ្វើឯកសារ / កិច្ចសន្យា ដដែលៗ',
        'ឆ្លើយសំណួរអតិថិជនដដែលៗ',
        'ផ្ទៀងផ្ទាត់តួលេខរវាងឯកសារច្រើន',
        'បកប្រែឯកសារ ខ្មែរ ↔ អង់គ្លេស'
      ])
      .showOtherOption(true)
      .setRequired(true);

  form.addParagraphTextItem()
      .setTitle('រៀបរាប់ការងារ ១ ដែលអ្នកចង់ឲ្យ AI ធ្វើជំនួស')
      .setHelpText('សរសេរជាភាសាធម្មតា ២–៣ ប្រយោគ។ ឧ. «រាល់ថ្ងៃសុក្រ ខ្ញុំចម្លងលេខលក់ពី ៣ សន្លឹក មករៀបជារបាយការណ៍ផ្ញើទៅចៅហ្វាយ។»')
      .setRequired(true);

  form.addParagraphTextItem()
      .setTitle('បើវគ្គនេះជោគជ័យសម្រាប់អ្នក — អ្នកនឹងចេញទៅដោយមានអ្វី?')
      .setRequired(false);
}


/* ============================================================
   ផ្នែកទី ៤ · ចូលរួម — Logistics & consent
   ============================================================ */
function addLogisticsSection_(form) {
  form.addPageBreakItem()
      .setTitle('ផ្នែកទី ៤ · ការចូលរួម')
      .setHelpText(CONFIG.workshopDate + ' · ' + CONFIG.workshopTime + ' · ' + CONFIG.workshopPlace);

  form.addMultipleChoiceItem()
      .setTitle('អ្នកនឹងចូលរួមបែបណា?')
      .setChoiceValues([
        'ចូលរួមផ្ទាល់ (Live)',
        'មើលវីដេអូថតទុកក្រោយ',
        'មិនទាន់ច្បាស់'
      ])
      .setRequired(true);

  form.addListItem()
      .setTitle('អ្នកដឹងអំពីវគ្គនេះតាមរយៈអ្វី?')
      .setChoiceValues([
        'Facebook',
        'Telegram',
        'TikTok',
        'មិត្តភក្តិណែនាំ',
        'ក្រុមហ៊ុន / ថ្នាក់លើ',
        'ធ្លាប់ចូលរួមវគ្គបណ្តុះបណ្តាលរបស់នាយកដ្ឋានរួចហើយ',
        'ផ្សេងៗ'
      ])
      .setRequired(true);

  form.addCheckboxItem()
      .setTitle('ការយល់ព្រម')
      .setHelpText('យើងប្រើអ៊ីមែលរបស់អ្នកសម្រាប់ផ្ញើតំណចូលរួម សម្ភារៈ និងវិញ្ញាបនបត្រតែប៉ុណ្ណោះ។ អ្នកអាចឈប់តាមដានបានគ្រប់ពេល។')
      .setChoiceValues([
        'ខ្ញុំយល់ព្រមទទួលអ៊ីមែលអំពីវគ្គនេះ និងសម្ភារៈពាក់ព័ន្ធ'
      ])
      .setRequired(true);
}


/* ============================================================
   អត្ថបទ · Copy blocks
   ============================================================ */
function buildFormDescription() {
  return [
    CONFIG.workshopTagline,
    '',
    '📅 ' + CONFIG.workshopDate,
    '🕖 ' + CONFIG.workshopTime,
    '📍 ' + CONFIG.workshopPlace,
    '🎤 ' + CONFIG.presenter + ' · ' + CONFIG.organiser,
    '',
    'វគ្គ ៦០ នាទីនេះបង្រៀនអ្នកឲ្យប្រើ AI ធ្វើការងារការិយាល័យដដែលៗជំនួស —',
    'ចាប់ពីការសរសេរ Prompt រហូតដល់ការសង់ប្រព័ន្ធស្វ័យប្រវត្តិដំបូងរបស់អ្នក។',
    '',
    '✓ មិនចាំបាច់ចេះសរសេរកូដ',
    '✓ ឧបករណ៍ទាំងអស់មានកម្រិតឥតគិតថ្លៃ',
    '✓ មានវិញ្ញាបនបត្រចូលរួម',
    '',
    'ការចុះឈ្មោះប្រើពេលប្រហែល ២ នាទី។'
  ].join('\n');
}

function buildConfirmationMessage() {
  return [
    '🎉 ចុះឈ្មោះបានសម្រេច!',
    '',
    'យើងបានផ្ញើអ៊ីមែលបញ្ជាក់ទៅកាន់អ្នករួចហើយ។',
    'សូមពិនិត្យប្រអប់ Spam បើមិនឃើញក្នុងរយៈពេល ៥ នាទី។',
    '',
    '📌 ជួបគ្នា ' + CONFIG.workshopDate + ' វេលាម៉ោង ' + CONFIG.workshopTime,
    '',
    'ត្រៀមខ្លួន៖ សរសេរការងារដដែលៗ ១ របស់អ្នកមកជាមួយ — យើងនឹងសង់វាផ្ទាល់ក្នុងវគ្គ។'
  ].join('\n');
}


/* ============================================================
   តារាងចម្លើយ · Response spreadsheet
   ============================================================ */
function createResponseSpreadsheet_(form) {
  var ss = SpreadsheetApp.create(CONFIG.workshopTitle + ' · អ្នកចុះឈ្មោះ');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // សន្លឹកបន្ថែមសម្រាប់តាមដានវត្តមាន និងវិញ្ញាបនបត្រ
  var tracker = ss.insertSheet('តាមដាន · Tracking');
  tracker.getRange('A1:H1').setValues([[
    'ឈ្មោះឡាតាំង', 'អ៊ីមែល', 'បានចូលរួម?', 'ពិន្ទុតេស្ត',
    'ជាប់/ធ្លាក់', 'លេខវិញ្ញាបនបត្រ', 'ថ្ងៃផ្ញើ', 'កំណត់ចំណាំ'
  ]]);
  tracker.getRange('A1:H1')
         .setFontWeight('bold')
         .setBackground('#1a3325')
         .setFontColor('#ffffff');
  tracker.setFrozenRows(1);
  tracker.autoResizeColumns(1, 8);

  return ss;
}


/* ============================================================
   អ៊ីមែលបញ្ជាក់ · Confirmation email on submit
   ============================================================ */

/**
 * ដំឡើង Trigger — រត់ម្តងគត់។
 * Installs the on-submit trigger. Run once after building the form.
 */
function installConfirmationTrigger() {
  var form = FormApp.getActiveForm() || getFormFromRecent_();
  if (!form) {
    throw new Error('រកទម្រង់មិនឃើញ។ សូមបើក Script ពីក្នុង Form ឬកំណត់ FORM_ID។');
  }

  // លុប Trigger ចាស់ ដើម្បីកុំឲ្យផ្ញើអ៊ីមែលស្ទួន
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'onRegistrationSubmit') {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger('onRegistrationSubmit')
           .forForm(form)
           .onFormSubmit()
           .create();

  Logger.log('✅ Trigger ដំឡើងរួចរាល់ — អ៊ីមែលបញ្ជាក់នឹងផ្ញើដោយស្វ័យប្រវត្តិ។');
}

function getFormFromRecent_() {
  var id = PropertiesService.getScriptProperties().getProperty('FORM_ID');
  return id ? FormApp.openById(id) : null;
}

/**
 * រត់រាល់ពេលមានអ្នកចុះឈ្មោះថ្មី។
 * Runs on every submission. Sends the bilingual confirmation.
 */
function onRegistrationSubmit(e) {
  if (!CONFIG.sendConfirmation) return;

  try {
    var answers = readResponse_(e);
    if (!answers.email) return;

    MailApp.sendEmail({
      to: answers.email,
      replyTo: CONFIG.replyTo,
      subject: '✅ បានចុះឈ្មោះ · ' + CONFIG.workshopTitle,
      htmlBody: buildConfirmationEmail_(answers),
      name: CONFIG.organiser
    });
  } catch (err) {
    // កុំឲ្យកំហុសអ៊ីមែលបំបាត់ការចុះឈ្មោះ
    Logger.log('⚠️ ផ្ញើអ៊ីមែលបរាជ័យ: ' + err);
  }
}

/**
 * អានចម្លើយចេញពី event object ទៅជា object ងាយប្រើ។
 */
function readResponse_(e) {
  var out = { email: '', nameKm: '', nameLatin: '', painPoint: '' };
  if (!e || !e.response) return out;

  out.email = e.response.getRespondentEmail() || '';

  e.response.getItemResponses().forEach(function (ir) {
    var q = ir.getItem().getTitle();
    var a = ir.getResponse();
    if (Array.isArray(a)) a = a.join(', ');

    if (q.indexOf('ជាភាសាខ្មែរ') !== -1)          out.nameKm = a;
    else if (q.indexOf('អក្សរឡាតាំង') !== -1)      out.nameLatin = a;
    else if (q.indexOf('ធ្វើជំនួស') !== -1)         out.painPoint = a;
    else if (q.indexOf('អ៊ីមែល') !== -1 && !out.email) out.email = a;
  });

  return out;
}

function buildConfirmationEmail_(a) {
  var name = a.nameKm || a.nameLatin || 'អ្នកចូលរួម';

  return [
    '<div style="font-family:Arial,\'Khmer OS Battambang\',sans-serif;',
    'max-width:600px;margin:0 auto;background:#0b100d;color:#e8efe9;',
    'padding:34px;border-radius:14px;line-height:1.7">',

    '<div style="color:#4ade80;font-size:12px;letter-spacing:2px;',
    'font-weight:bold;margin-bottom:10px">DSMT · FREE WORKSHOP</div>',

    '<h1 style="font-size:23px;margin:0 0 18px;color:#ffffff">',
    CONFIG.workshopTagline, '</h1>',

    '<p>ជំរាបសួរ <strong>', escapeHtml_(name), '</strong>,</p>',
    '<p>អរគុណដែលបានចុះឈ្មោះ! កន្លែងរបស់អ្នកត្រូវបានកក់ទុករួចរាល់។</p>',

    '<div style="background:#141b16;border:1px solid #22302a;border-radius:10px;',
    'padding:18px;margin:22px 0">',
      '<div style="margin-bottom:8px">📅 <strong>', CONFIG.workshopDate, '</strong></div>',
      '<div style="margin-bottom:8px">🕖 ', CONFIG.workshopTime, '</div>',
      '<div style="margin-bottom:8px">📍 ', CONFIG.workshopPlace, '</div>',
      '<div>🎤 ', CONFIG.presenter, '</div>',
    '</div>',

    '<div style="text-align:center;margin:26px 0">',
      '<a href="', CONFIG.joinLink, '" style="display:inline-block;',
      'background:#4ade80;color:#04140a;padding:14px 32px;border-radius:8px;',
      'text-decoration:none;font-weight:bold">ចូលរួមវគ្គនៅទីនេះ →</a>',
    '</div>',

    '<h3 style="color:#4ade80;font-size:15px;margin:26px 0 10px">',
    'ត្រៀមខ្លួន ៣ ចំណុច</h3>',
    '<ol style="padding-left:20px;margin:0">',
      '<li>ចូលរួមតាមកុំព្យូទ័រ បើអាច — យើងនឹងសង់ប្រព័ន្ធផ្ទាល់។</li>',
      '<li>ត្រៀមគណនី Google និងបើក ChatGPT ឬ Claude ទុក។</li>',
      '<li>សរសេរការងារដដែលៗ ១ របស់អ្នកមកជាមួយ។</li>',
    '</ol>',

    a.painPoint
      ? '<div style="background:#141b16;border-left:3px solid #4ade80;padding:14px 16px;margin:22px 0;border-radius:0 8px 8px 0"><div style="color:#8b968f;font-size:12px;margin-bottom:6px">ការងារដែលអ្នកបានសរសេរ៖</div>' + escapeHtml_(a.painPoint) + '</div>'
      : '',

    '<p style="margin-top:26px">មានសំណួរ? ឆ្លើយត្រឡប់មកអ៊ីមែលនេះបានតែម្តង។</p>',

    '<div style="border-top:1px solid #22302a;margin-top:28px;padding-top:18px;',
    'color:#7d8b83;font-size:12px">',
      CONFIG.organiserKm, '<br>', CONFIG.organiser, ' · ', CONFIG.presenter, '<br>',
      '<a href="', CONFIG.telegramGroup, '" style="color:#4ade80">ក្រុម Telegram</a> · ',
      '<a href="', CONFIG.promptLibrary, '" style="color:#4ade80">Prompt Library</a>',
    '</div>',
    '</div>'
  ].join('');
}

function escapeHtml_(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}


/* ============================================================
   ឧបករណ៍បន្ថែម · Extras
   ============================================================ */

/**
 * បិទការចុះឈ្មោះ នៅពេលពេញចំណុះ។
 * Closes the form when the seat limit is reached. Attach to a
 * time-based trigger (hourly) if you set CONFIG.seatLimit > 0.
 */
function closeWhenFull() {
  if (!CONFIG.seatLimit) return;

  var form = FormApp.getActiveForm();
  if (!form) return;

  var count = form.getResponses().length;
  if (count >= CONFIG.seatLimit && form.isAcceptingResponses()) {
    form.setAcceptingResponses(false);
    form.setCustomClosedFormMessage(
      'ការចុះឈ្មោះបានបិទហើយ — កន្លែងពេញ (' + CONFIG.seatLimit + ' នាក់)។\n' +
      'សូមតាមដានយើងសម្រាប់វគ្គបន្ទាប់។'
    );
    Logger.log('🔒 ទម្រង់បិទ — មានអ្នកចុះឈ្មោះ ' + count + ' នាក់។');
  }
}

/**
 * ផ្ញើការរំលឹកទៅអ្នកចុះឈ្មោះទាំងអស់។
 * Run manually the day before, or on a time-based trigger.
 */
function sendReminderToAll() {
  var form = FormApp.getActiveForm();
  if (!form) throw new Error('សូមរត់ស្គ្រីបនេះពីក្នុង Form។');

  var sent = 0;
  form.getResponses().forEach(function (r) {
    var email = r.getRespondentEmail();
    if (!email) return;

    MailApp.sendEmail({
      to: email,
      replyTo: CONFIG.replyTo,
      name: CONFIG.organiser,
      subject: '⏰ ថ្ងៃស្អែក · ' + CONFIG.workshopTitle,
      htmlBody:
        '<div style="font-family:Arial,sans-serif;max-width:560px;line-height:1.7">' +
        '<h2>ជួបគ្នាថ្ងៃស្អែក!</h2>' +
        '<p>' + CONFIG.workshopTagline + '</p>' +
        '<p>🕖 ' + CONFIG.workshopTime + '<br>📍 ' + CONFIG.workshopPlace + '</p>' +
        '<p><a href="' + CONFIG.joinLink + '">តំណចូលរួម →</a></p>' +
        '<p style="color:#666;font-size:13px">កុំភ្លេចត្រៀមការងារដដែលៗ ១ របស់អ្នក។</p>' +
        '</div>'
    });
    sent++;
  });

  Logger.log('📨 ផ្ញើការរំលឹកទៅ ' + sent + ' នាក់។');
}
