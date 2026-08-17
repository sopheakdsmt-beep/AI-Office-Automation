/**
 * ============================================================
 * AI OFFICE AUTOMATION — POST-WORKSHOP FEEDBACK FORM
 * ============================================================
 *
 * បង្កើតទម្រង់ប្រមូលមតិយោបល់ក្រោយវគ្គ រួមទាំង NPS។
 * Builds the post-workshop feedback form and a summary dashboard
 * that recalculates NPS and averages as responses arrive.
 *
 * ── របៀបប្រើ · HOW TO RUN ──────────────────────────────────
 *  1. https://script.google.com → New project
 *  2. បិទភ្ជាប់ឯកសារនេះ · កែ FB_CONFIG
 *  3. Run → buildFeedbackForm()
 *  4. ចែកតំណភ្លាមក្រោយវគ្គ ខណៈអ្នករៀននៅចាំបទពិសោធន៍
 *  5. ក្រោយ ២៤ ម៉ោង៖ បើកតារាង → ម៉ឺនុយ «📊 មតិយោបល់» → «គណនាសង្ខេប»
 * ============================================================
 */

var FB_CONFIG = {
  workshopTitle: 'AI Office Automation',
  organiser:     'Skill Next',
  courseLink:    'https://example.com/full-course',
  quizLink:      'https://example.com/quiz'
};


function buildFeedbackForm() {
  var form = FormApp.create(FB_CONFIG.workshopTitle + ' · មតិយោបល់');

  form.setTitle(FB_CONFIG.workshopTitle + ' · មតិយោបល់របស់អ្នក')
      .setDescription([
        'អរគុណដែលបានចូលរួម! សំណួរទាំង ១០ នេះប្រើពេលតែ ២ នាទី។',
        '',
        'មតិយោបល់របស់អ្នកកំណត់ថាតើវគ្គបន្ទាប់នឹងប្រសើរឡើងយ៉ាងណា —',
        'សូមឆ្លើយដោយត្រង់ៗ។ ការរិះគន់មានប្រយោជន៍ជាងការសរសើរ។'
      ].join('\n'))
      .setCollectEmail(false)         // អនាមិក ដើម្បីទទួលចម្លើយត្រង់
      .setProgressBar(true)
      .setConfirmationMessage([
        'អរគុណច្រើនសម្រាប់មតិយោបល់!',
        '',
        'កុំភ្លេចធ្វើតេស្តវាយតម្លៃ ដើម្បីទទួលវិញ្ញាបនបត្រ៖',
        FB_CONFIG.quizLink
      ].join('\n'));

  /* ── ផ្នែក ១ · ការវាយតម្លៃទូទៅ ── */
  form.addSectionHeaderItem().setTitle('ផ្នែកទី ១ · ការវាយតម្លៃទូទៅ');

  form.addScaleItem()
      .setTitle('តើវគ្គនេះមានតម្លៃប៉ុណ្ណាសម្រាប់អ្នក?')
      .setBounds(1, 5)
      .setLabels('គ្មានតម្លៃ', 'មានតម្លៃខ្លាំង')
      .setRequired(true);

  form.addScaleItem()
      .setTitle('តើអ្នកនឹងណែនាំវគ្គនេះទៅមិត្តរួមការងារកម្រិតណា?')
      .setHelpText('0 = មិនណែនាំសោះ · 10 = ណែនាំយ៉ាងខ្លាំង')
      .setBounds(0, 10)
      .setLabels('មិនណែនាំ', 'ណែនាំខ្លាំង')
      .setRequired(true);

  form.addMultipleChoiceItem()
      .setTitle('តើល្បឿននៃវគ្គយ៉ាងណាដែរ?')
      .setChoiceValues([
        'យឺតពេក',
        'យឺតបន្តិច',
        'ល្មម',
        'លឿនបន្តិច',
        'លឿនពេក'
      ])
      .setRequired(true);

  form.addMultipleChoiceItem()
      .setTitle('តើរយៈពេល ៦០ នាទីយ៉ាងណាដែរ?')
      .setChoiceValues(['ខ្លីពេក', 'ល្មម', 'វែងពេក'])
      .setRequired(true);

  /* ── ផ្នែក ២ · មាតិកា ── */
  form.addPageBreakItem().setTitle('ផ្នែកទី ២ · មាតិកា');

  form.addCheckboxItem()
      .setTitle('ផ្នែកណាដែលមានប្រយោជន៍បំផុតសម្រាប់អ្នក? (ជ្រើសបាន ២)')
      .setChoiceValues([
        'បញ្ហាការងារការិយាល័យ',
        'ភាពខុសគ្នា AI · Agent · Automation',
        'រូបមន្ត Prompt R·T·C·F',
        'តេស្ត ៤ សំណួរ មុននឹងសង់',
        'ការបង្ហាញប្រព័ន្ធពិត ៣',
        'ការសង់ជាមួយគ្នា ៥ ជំហាន',
        'ផ្នែកសុវត្ថិភាពទិន្នន័យ'
      ])
      .setRequired(true);

  form.addCheckboxItem()
      .setTitle('ផ្នែកណាដែលពិបាកតាមទាន់ ឬមិនច្បាស់?')
      .setChoiceValues([
        'គ្មាន — តាមទាន់ទាំងអស់',
        'ភាពខុសគ្នា AI · Agent · Automation',
        'ការសរសេរ Prompt',
        'ការបង្ខំលទ្ធផលចេញជា JSON',
        'ការសង់ Workflow ផ្ទាល់',
        'ជំហានតភ្ជាប់ឧបករណ៍',
        'ផ្នែកសុវត្ថិភាព'
      ])
      .showOtherOption(true)
      .setRequired(true);

  form.addMultipleChoiceItem()
      .setTitle('តើអ្នកមានទំនុកចិត្តសង់ប្រព័ន្ធដោយខ្លួនឯងកម្រិតណា?')
      .setChoiceValues([
        'ខ្ញុំសង់បានដោយខ្លួនឯងភ្លាម',
        'ខ្ញុំសង់បាន បើមានឯកសារជំហានៗ',
        'ខ្ញុំត្រូវការមើលឡើងវិញម្តងទៀត',
        'ខ្ញុំនៅតែមិនច្បាស់ថាចាប់ផ្តើមពីណា'
      ])
      .setRequired(true);

  /* ── ផ្នែក ៣ · សំណួរបើកចំហ ── */
  form.addPageBreakItem().setTitle('ផ្នែកទី ៣ · ចម្លើយសេរី');

  form.addParagraphTextItem()
      .setTitle('អ្វីមួយដែលអ្នកនឹងយកទៅអនុវត្តនៅសប្តាហ៍នេះ?')
      .setRequired(true);

  form.addParagraphTextItem()
      .setTitle('អ្វីមួយដែលយើងគួរកែលម្អសម្រាប់វគ្គបន្ទាប់?')
      .setHelpText('សូមត្រង់ៗ — នេះជាចម្លើយដែលមានតម្លៃបំផុតសម្រាប់យើង។')
      .setRequired(true);

  form.addCheckboxItem()
      .setTitle('អ្នកចាប់អារម្មណ៍លើអ្វីបន្ថែម?')
      .setChoiceValues([
        'វគ្គពេញលេញ ៦ ម៉ូឌុល',
        'ការបណ្តុះបណ្តាលក្នុងក្រុមហ៊ុនរបស់ខ្ញុំ',
        'សេវាកម្មសង់ប្រព័ន្ធជូន',
        'ឯកសារ និងវីដេអូបន្ថែម (ឥតគិតថ្លៃ)',
        'មិនទាន់ចាប់អារម្មណ៍'
      ])
      .setRequired(false);

  var ss = SpreadsheetApp.create(FB_CONFIG.workshopTitle + ' · មតិយោបល់');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  Logger.log('════════════════════════════════════════');
  Logger.log('✅ ទម្រង់មតិយោបល់ត្រូវបានបង្កើត');
  Logger.log('📝 ចែកតំណនេះ:  ' + form.getPublishedUrl());
  Logger.log('📊 តារាងចម្លើយ: ' + ss.getUrl());
  Logger.log('════════════════════════════════════════');
  Logger.log('គន្លឹះ៖ ចែកតំណនេះក្នុង Chat មុនបញ្ចប់វគ្គ ៣ នាទី —');
  Logger.log('អត្រាឆ្លើយតបខ្ពស់ជាងការផ្ញើតាមអ៊ីមែលក្រោយវគ្គច្រើន។');

  return form;
}


/* ============================================================
   ផ្ទាំងសង្ខេប · Summary dashboard
   ============================================================ */

/**
 * គណនា NPS និងមធ្យមភាគ រួចសរសេរចូលសន្លឹក «សង្ខេប»។
 * NPS = % អ្នកផ្សព្វផ្សាយ (9–10) − %អ្នករិះគន់ (0–6)
 */
function buildSummary() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var responses = ss.getSheets()[0];
  var data = responses.getDataRange().getValues();

  if (data.length < 2) {
    SpreadsheetApp.getUi().alert('មិនទាន់មានចម្លើយទេ។');
    return;
  }

  var header = data[0];
  var rows = data.slice(1);

  var iValue = findColumn_(header, 'មានតម្លៃប៉ុណ្ណា');
  var iNps   = findColumn_(header, 'ណែនាំវគ្គនេះ');
  var iPace  = findColumn_(header, 'ល្បឿននៃវគ្គ');
  var iConf  = findColumn_(header, 'ទំនុកចិត្តសង់ប្រព័ន្ធ');

  var values = [], nps = [], pace = {}, conf = {};

  rows.forEach(function (r) {
    if (iValue !== -1 && isFinite(r[iValue])) values.push(Number(r[iValue]));
    if (iNps   !== -1 && isFinite(r[iNps]))   nps.push(Number(r[iNps]));
    if (iPace  !== -1 && r[iPace]) pace[r[iPace]] = (pace[r[iPace]] || 0) + 1;
    if (iConf  !== -1 && r[iConf]) conf[r[iConf]] = (conf[r[iConf]] || 0) + 1;
  });

  var promoters  = nps.filter(function (n) { return n >= 9; }).length;
  var detractors = nps.filter(function (n) { return n <= 6; }).length;
  var npsScore = nps.length
    ? Math.round(((promoters - detractors) / nps.length) * 100)
    : 0;

  var sheet = ss.getSheetByName('សង្ខេប · Summary');
  if (sheet) sheet.clear();
  else sheet = ss.insertSheet('សង្ខេប · Summary');

  var out = [
    ['សូចនាករ', 'តម្លៃ', 'កំណត់ចំណាំ'],
    ['ចំនួនចម្លើយសរុប', rows.length, ''],
    ['តម្លៃវគ្គ (មធ្យម /5)', avg_(values).toFixed(2),
      avg_(values) >= 4.2 ? '✅ ល្អ' : '⚠️ ត្រូវកែលម្អ'],
    ['NPS', npsScore,
      npsScore >= 50 ? '✅ ល្អណាស់' : npsScore >= 30 ? '🙂 ល្អ' : '⚠️ ត្រូវកែលម្អ'],
    ['អ្នកផ្សព្វផ្សាយ (9–10)', promoters, pct_(promoters, nps.length)],
    ['អព្យាក្រឹត (7–8)', nps.length - promoters - detractors,
      pct_(nps.length - promoters - detractors, nps.length)],
    ['អ្នករិះគន់ (0–6)', detractors, pct_(detractors, nps.length)],
    ['', '', ''],
    ['ល្បឿននៃវគ្គ', '', '']
  ];

  Object.keys(pace).forEach(function (k) {
    out.push(['  ' + k, pace[k], pct_(pace[k], rows.length)]);
  });

  out.push(['', '', '']);
  out.push(['ទំនុកចិត្តសង់ប្រព័ន្ធ', '', '']);
  Object.keys(conf).forEach(function (k) {
    out.push(['  ' + k, conf[k], pct_(conf[k], rows.length)]);
  });

  sheet.getRange(1, 1, out.length, 3).setValues(out);
  sheet.getRange('A1:C1')
       .setFontWeight('bold')
       .setBackground('#1a3325')
       .setFontColor('#ffffff');
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, 3);

  SpreadsheetApp.getUi().alert(
    'សង្ខេបរួចរាល់!\n\nចម្លើយសរុប: ' + rows.length +
    '\nNPS: ' + npsScore +
    '\nតម្លៃវគ្គ: ' + avg_(values).toFixed(2) + '/5'
  );
}

function findColumn_(header, needle) {
  for (var i = 0; i < header.length; i++) {
    if (String(header[i]).indexOf(needle) !== -1) return i;
  }
  return -1;
}

function avg_(arr) {
  if (!arr.length) return 0;
  return arr.reduce(function (a, b) { return a + b; }, 0) / arr.length;
}

function pct_(n, total) {
  return total ? Math.round((n / total) * 100) + '%' : '—';
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📊 មតិយោបល់')
    .addItem('គណនាសង្ខេប', 'buildSummary')
    .addToUi();
}
