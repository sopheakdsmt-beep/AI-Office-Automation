/**
 * ============================================================
 * AI OFFICE AUTOMATION — ASSESSMENT QUIZ BUILDER
 * ============================================================
 *
 * បង្កើតតេស្តវាយតម្លៃ ១៥ សំណួរ ដែលដាក់ពិន្ទុដោយស្វ័យប្រវត្តិ។
 * Builds the 15-question graded Google Form quiz, auto-marks it,
 * and records pass/fail so the certificate script can pick it up.
 *
 * ── របៀបប្រើ · HOW TO RUN ──────────────────────────────────
 *  1. https://script.google.com → New project
 *  2. បិទភ្ជាប់ឯកសារនេះ (paste this file)
 *  3. កែ QUIZ_CONFIG ខាងក្រោម
 *  4. Run → buildAssessmentQuiz()
 *  5. Run → installQuizTrigger()
 *
 * ពិន្ទុជាប់ · Pass mark: 70% (១១ / ១៥)
 * ============================================================
 */

var QUIZ_CONFIG = {
  title:        'AI Office Automation · តេស្តវាយតម្លៃ',
  passPercent:  70,
  pointsPerQ:   1,
  replyTo:      'hello@example.com',
  organiser:    'Skill Next',
  certContact:  'hello@example.com',
  // Send an automatic result email after each submission
  emailResults: true
};


/**
 * សំណួរទាំងអស់ · The question bank.
 *
 * type: 'radio'  = ចម្លើយត្រឹមត្រូវតែមួយ
 *       'check'  = ចម្លើយត្រឹមត្រូវច្រើន (ត្រូវជ្រើសឲ្យគ្រប់ទើបបានពិន្ទុ)
 * correct: index (radio) ឬ array of indexes (check)
 */
var QUESTIONS = [
  {
    section: 'ផ្នែក ក · គោលគំនិតគ្រឹះ',
    type: 'radio',
    q: 'តើអ្វីជាភាពខុសគ្នាចម្បងរវាង «AI» និង «AI Automation»?',
    options: [
      'AI ថ្លៃជាង AI Automation',
      'AI ត្រូវការអ្នកចាប់ផ្តើមរាល់ដង តែ Automation មាន Trigger ដែលចាប់ផ្តើមដោយខ្លួនឯង',
      'AI ធ្វើការតែលើអត្ថបទ ចំណែក Automation ធ្វើការតែលើលេខ',
      'គ្មានភាពខុសគ្នាទេ — ជាពាក្យដូចគ្នា'
    ],
    correct: 1,
    why: 'Trigger គឺជាចំណុចកំណត់។ បើគ្មាន Trigger អ្នកនៅតែត្រូវអង្គុយចុចរាល់ដង — ដូច្នេះវានៅតែស៊ីម៉ោងអ្នក។'
  },
  {
    type: 'radio',
    q: 'ក្នុងរូបមន្ត R·T·C·F តើអក្សរ F តំណាងឲ្យអ្វី?',
    options: ['Fast', 'Format — ទម្រង់លទ្ធផលដែលអ្នកចង់បាន', 'Feedback', 'Function'],
    correct: 1,
    why: 'Format ជាចំណុចដែលមនុស្សភ្លេចច្រើនបំផុត ហើយវាជាចំណុចដែលធ្វើឲ្យលទ្ធផលដោតចូល Automation បាន។'
  },
  {
    type: 'radio',
    q: 'ហេតុអ្វីបានជាយើងបង្ខំឲ្យ AI ចេញលទ្ធផលជា JSON នៅពេលសង់ Automation?',
    options: [
      'ព្រោះ JSON ធ្វើឲ្យ AI ឆ្លាតជាងមុន',
      'ព្រោះលទ្ធផលមានរចនាសម្ព័ន្ធថេរ ដែលកម្មវិធីផ្សេងអានបានដោយស្វ័យប្រវត្តិ',
      'ព្រោះ JSON សន្សំថ្លៃប្រើប្រាស់',
      'ព្រោះវាជាតម្រូវការរបស់ Google'
    ],
    correct: 1,
    why: 'ទម្រង់ថេរ = ជំហានបន្ទាប់ក្នុង Workflow អានបានដោយមិនខូច។ អត្ថបទសេរីប្រែប្រួលរាល់ដង។'
  },
  {
    type: 'check',
    q: 'ក្នុងចំណោមខាងក្រោម មួយណាជាកិច្ចការដែល AI ធ្វើបានល្អ? (ជ្រើសចម្លើយត្រឹមត្រូវទាំងអស់)',
    options: [
      'សង្ខេប និងរៀបរចនាសម្ព័ន្ធអត្ថបទ',
      'ដកទិន្នន័យចេញពីឯកសារមិនរៀបរយ',
      'ធានាភាពត្រឹមត្រូវ ១០០% នៃលេខគណនេយ្យ',
      'ចាត់ថ្នាក់អ៊ីមែលតាមកម្រិតបន្ទាន់'
    ],
    correct: [0, 1, 3],
    why: 'លេខគណនេយ្យត្រូវការច្បាប់ត្រួតពិនិត្យ ឬមនុស្សអនុម័ត — AI អាចប្រាកដក្នុងចម្លើយខុស។'
  },
  {
    type: 'radio',
    q: 'តើ «AI Agent» ខុសពី AI ធម្មតាត្រង់ណា?',
    options: [
      'វាមានទំហំធំជាង',
      'វាមានឧបករណ៍ និងអាចសម្រេចជំហានបន្ទាប់ដោយខ្លួនឯង',
      'វាដំណើរការតែលើទូរស័ព្ទ',
      'វាមិនត្រូវការ Prompt ទេ'
    ],
    correct: 1,
    why: 'Agent = ខួរក្បាល + ឧបករណ៍ + សិទ្ធិសម្រេចជំហានបន្ទាប់ — តែអ្នកនៅតែជាអ្នកចាប់ផ្តើម។'
  },

  {
    section: 'ផ្នែក ខ · ការជ្រើសរើសការងារ',
    type: 'check',
    q: 'តេស្ត ៤ សំណួរមុននឹងសង់ Automation រួមមានអ្វីខ្លះ? (ជ្រើសទាំងអស់)',
    options: [
      'តើវាកើតឡើងដដែលៗទេ?',
      'តើមានច្បាប់ច្បាស់លាស់ទេ?',
      'តើវាមើលទៅទំនើបទេ?',
      'តើទិន្នន័យស្ថិតក្នុងកន្លែងឌីជីថលទេ?'
    ],
    correct: [0, 1, 3],
    why: 'ភាពទំនើបមិនមែនជាលក្ខណៈវិនិច្ឆ័យទេ។ សំណួរទី៤ ពិតគឺ «បើវាធ្វើខុស ប៉ះពាល់ធ្ងន់ធ្ងរប៉ុណ្ណា?»។'
  },
  {
    type: 'radio',
    q: 'ការងារមួយកើតឡើងម្តងក្នុងមួយឆ្នាំ ហើយត្រូវការពេល ២ ម៉ោង។ តើគួរ Automate ទេ?',
    options: [
      'គួរ — ព្រោះវាស៊ីពេល ២ ម៉ោង',
      'មិនគួរ — ពេលវេលាសង់ប្រព័ន្ធច្រើនជាងពេលដែលសន្សំបាន',
      'គួរ — ព្រោះការងារទាំងអស់គួរ Automate',
      'មិនអាចសម្រេចបានទេ'
    ],
    correct: 1,
    why: 'ចាប់ផ្តើមពីការងារដែលកើតឡើងយ៉ាងតិច ១ ដងក្នុងមួយសប្តាហ៍ — ទើបមានផលចំណេញច្បាស់។'
  },
  {
    type: 'radio',
    q: 'ការងារណាដែលសមនឹង Automate មុនគេបំផុតសម្រាប់អ្នកចាប់ផ្តើម?',
    options: [
      'ការសម្រេចចិត្តតម្លើងប្រាក់ខែបុគ្គលិក',
      'ការចម្លងទិន្នន័យពី Form ចូល Sheet រាល់ថ្ងៃ',
      'ការចរចាកិច្ចសន្យាជាមួយអតិថិជនធំ',
      'ការវាយតម្លៃការងារបុគ្គលិក'
    ],
    correct: 1,
    why: 'ដដែលៗ · ច្បាប់ច្បាស់ · ហានិភ័យទាប — នេះជារូបមន្តសម្រាប់ប្រព័ន្ធដំបូង។'
  },

  {
    section: 'ផ្នែក គ · Prompting ជាក់ស្តែង',
    type: 'radio',
    q: 'Prompt មួយណាដែលរឹងមាំជាងគេ?',
    options: [
      '«សង្ខេប email នេះ»',
      '«សង្ខេប email នេះឲ្យខ្លី»',
      '«Role: ជំនួយការការិយាល័យ។ Task: សង្ខេបជា ៣ ចំណុច។ Context: អតិថិជនចាស់។ Format: JSON មាន key urgency, summary, deadline។»',
      '«សូមជួយសង្ខេប email នេះឲ្យខ្ញុំផង អរគុណ»'
    ],
    correct: 2,
    why: 'ភាពគួរសមមិនធ្វើឲ្យលទ្ធផលប្រសើរទេ — រចនាសម្ព័ន្ធទើបធ្វើ។'
  },
  {
    type: 'radio',
    q: 'ហេតុអ្វីយើងដាក់អត្ថបទ Email ក្នុងសញ្ញា """ នៅពេលសរសេរ Prompt?',
    options: [
      'ដើម្បីឲ្យស្អាត',
      'ដើម្បីបំបែកទិន្នន័យចេញពីបញ្ជា ការពារកុំឲ្យ AI យល់ច្រឡំអត្ថបទជាការណែនាំ',
      'ដើម្បីសន្សំ Token',
      'ព្រោះ Google តម្រូវឲ្យធ្វើ'
    ],
    correct: 1,
    why: 'នេះជាការការពារជាមូលដ្ឋាន — អត្ថបទពីខាងក្រៅអាចមានឃ្លាដែលមើលទៅដូចជាបញ្ជា។'
  },
  {
    type: 'radio',
    q: 'ក្នុង Prompt ដកទិន្នន័យ ហេតុអ្វីយើងបន្ថែមវាល "confidence" និង "needs_human_review"?',
    options: [
      'ដើម្បីធ្វើឲ្យ JSON វែងជាងមុន',
      'ដើម្បីឲ្យប្រព័ន្ធដឹងថាករណីណាត្រូវបញ្ជូនទៅមនុស្សពិនិត្យ',
      'ដើម្បីវាស់ល្បឿន AI',
      'ដើម្បីកាត់បន្ថយថ្លៃដើម'
    ],
    correct: 1,
    why: 'នេះជាបេះដូងនៃ Automation សុវត្ថិភាព — ប្រព័ន្ធដឹងខ្លួនថាពេលណាត្រូវសុំជំនួយ។'
  },
  {
    type: 'radio',
    q: 'ឃ្លាណាដែលកាត់បន្ថយការប្រឌិតលេខ (hallucination) បានល្អបំផុត?',
    options: [
      '«សូមធ្វើឲ្យបានល្អ»',
      '«បើទិន្នន័យមិនគ្រប់គ្រាន់ដើម្បីសន្និដ្ឋាន សូមសរសេរថា ទិន្នន័យមិនគ្រប់គ្រាន់ — ហាមទាយ»',
      '«សូមឆ្លើយឲ្យលឿន»',
      '«សូមឆ្លើយឲ្យវែង»'
    ],
    correct: 1,
    why: 'ការផ្តល់ «ផ្លូវចេញដោយស្មោះ» ធ្វើឲ្យ AI លែងចាំបាច់ប្រឌិត ដើម្បីបំពេញចម្លើយ។'
  },

  {
    section: 'ផ្នែក ឃ · សុវត្ថិភាព និងការអនុវត្ត',
    type: 'check',
    q: 'ទិន្នន័យណាដែល «មិនគួរ» ដាក់ចូល AI សាធារណៈ? (ជ្រើសទាំងអស់)',
    options: [
      'លេខអត្តសញ្ញាណប័ណ្ណបុគ្គលិក',
      'លេខគណនីធនាគារ',
      'ប្រធានបទកិច្ចប្រជុំទូទៅ',
      'កិច្ចសន្យាសម្ងាត់របស់អតិថិជន'
    ],
    correct: [0, 1, 3],
    why: 'ព័ត៌មានសម្គាល់អត្តសញ្ញាណ ហិរញ្ញវត្ថុ និងឯកសារសម្ងាត់ត្រូវរក្សាទុកខាងក្រៅ AI សាធារណៈ។'
  },
  {
    type: 'radio',
    q: 'នៅ ២ សប្តាហ៍ដំបូងនៃការដាក់ប្រព័ន្ធឲ្យដំណើរការ តើវិធីសាស្ត្រណាដែលសុវត្ថិភាពជាងគេ?',
    options: [
      'ឲ្យ AI ផ្ញើអ៊ីមែលដោយស្វ័យប្រវត្តិភ្លាម ដើម្បីសន្សំពេល',
      'AI សរសេរសេចក្តីព្រាង ហើយមនុស្សពិនិត្យ និងចុចផ្ញើ',
      'បិទប្រព័ន្ធរាល់យប់',
      'កុំប្រាប់ក្រុមការងារថាមានប្រព័ន្ធនេះ'
    ],
    correct: 1,
    why: 'ចាប់ផ្តើមក្នុងរបៀបព្រាងជានិច្ច — បន្ធូរបន្ទាប់ពីអ្នកឃើញវាដំណើរការត្រឹមត្រូវជាប់លាប់។'
  },
  {
    type: 'radio',
    q: 'តើ «ការខូចស្ងាត់ៗ» (silent failure) ក្នុង Automation មានន័យដូចម្តេច?',
    options: [
      'ប្រព័ន្ធបញ្ឈប់ដោយបង្ហាញសារកំហុសច្បាស់',
      'ប្រព័ន្ធនៅតែរត់ធម្មតា តែផលិតលទ្ធផលខុសដោយគ្មាននរណាដឹង',
      'ប្រព័ន្ធដំណើរការយឺត',
      'ប្រព័ន្ធផ្ញើអ៊ីមែលច្រើនពេក'
    ],
    correct: 1,
    why: 'នេះជាហានិភ័យធំបំផុត។ ដូច្នេះត្រូវមានកំណត់ហេតុ និងការត្រួតពិនិត្យតាមកាលកំណត់។'
  }
];


/**
 * ស្នូល · Builds the quiz form.
 */
function buildAssessmentQuiz() {
  var form = FormApp.create(QUIZ_CONFIG.title);

  form.setIsQuiz(true)
      .setTitle(QUIZ_CONFIG.title)
      .setDescription(buildQuizDescription_())
      .setCollectEmail(true)
      .setProgressBar(true)
      .setShuffleQuestions(false)
      .setAllowResponseEdits(false)
      .setShowLinkToRespondAgain(true)
      .setConfirmationMessage(
        'អរគុណ! តេស្តរបស់អ្នកត្រូវបានបញ្ជូនរួចរាល់។\n\n' +
        'យើងនឹងផ្ញើលទ្ធផល និងវិញ្ញាបនបត្រ (បើជាប់) ទៅអ៊ីមែលរបស់អ្នក ' +
        'ក្នុងរយៈពេល ៤៨ ម៉ោង។'
      );

  // ឈ្មោះសម្រាប់វិញ្ញាបនបត្រ
  form.addSectionHeaderItem()
      .setTitle('មុននឹងចាប់ផ្តើម')
      .setHelpText('សូមសរសេរឈ្មោះឲ្យត្រូវនឹងឈ្មោះដែលអ្នកបានចុះឈ្មោះ។');

  form.addTextItem()
      .setTitle('ឈ្មោះពេញ (ជាអក្សរឡាតាំង) · សម្រាប់វិញ្ញាបនបត្រ')
      .setHelpText('ឈ្មោះនេះនឹងបោះពុម្ពលើវិញ្ញាបនបត្ររបស់អ្នកយ៉ាងពិតប្រាកដ។')
      .setRequired(true);

  QUESTIONS.forEach(function (item, i) {
    if (item.section) {
      form.addSectionHeaderItem().setTitle(item.section);
    }
    addQuestion_(form, item, i + 1);
  });

  form.addSectionHeaderItem()
      .setTitle('រួចរាល់!')
      .setHelpText('ចុច «Submit» ដើម្បីបញ្ជូន។ ពិន្ទុជាប់គឺ ' +
        QUIZ_CONFIG.passPercent + '% (' + passMark_() + '/' + QUESTIONS.length + ')។');

  var ss = SpreadsheetApp.create(QUIZ_CONFIG.title + ' · ចម្លើយ');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  Logger.log('════════════════════════════════════════');
  Logger.log('✅ តេស្តវាយតម្លៃត្រូវបានបង្កើត');
  Logger.log('📝 ចែកតំណនេះ:  ' + form.getPublishedUrl());
  Logger.log('✏️  កែតេស្ត:     ' + form.getEditUrl());
  Logger.log('📊 តារាងចម្លើយ: ' + ss.getUrl());
  Logger.log('🎯 ពិន្ទុជាប់:   ' + passMark_() + '/' + QUESTIONS.length +
             ' (' + QUIZ_CONFIG.passPercent + '%)');
  Logger.log('════════════════════════════════════════');

  return form;
}


function addQuestion_(form, item, number) {
  var title = 'សំណួរទី ' + number + '. ' + item.q;

  var feedbackCorrect = FormApp.createFeedback()
    .setText('✅ ត្រឹមត្រូវ! ' + (item.why || ''))
    .build();

  var feedbackWrong = FormApp.createFeedback()
    .setText('❌ មិនទាន់ត្រូវ។ ' + (item.why || ''))
    .build();

  if (item.type === 'check') {
    var cb = form.addCheckboxItem();
    cb.setTitle(title)
      .setHelpText('ជ្រើសរើសចម្លើយត្រឹមត្រូវទាំងអស់ ដើម្បីទទួលបានពិន្ទុ។')
      .setPoints(QUIZ_CONFIG.pointsPerQ)
      .setRequired(true)
      .setChoices(item.options.map(function (opt, idx) {
        return cb.createChoice(opt, item.correct.indexOf(idx) !== -1);
      }))
      .setFeedbackForCorrect(feedbackCorrect)
      .setFeedbackForIncorrect(feedbackWrong);
    return;
  }

  var mc = form.addMultipleChoiceItem();
  mc.setTitle(title)
    .setPoints(QUIZ_CONFIG.pointsPerQ)
    .setRequired(true)
    .setChoices(item.options.map(function (opt, idx) {
      return mc.createChoice(opt, idx === item.correct);
    }))
    .setFeedbackForCorrect(feedbackCorrect)
    .setFeedbackForIncorrect(feedbackWrong);
}


function buildQuizDescription_() {
  return [
    'តេស្តនេះមាន ' + QUESTIONS.length + ' សំណួរ ហើយប្រើពេលប្រហែល ១០ នាទី។',
    '',
    '📌 ពិន្ទុជាប់៖ ' + QUIZ_CONFIG.passPercent + '% (' + passMark_() + ' សំណួរត្រឹមត្រូវ)',
    '📌 អ្នកអាចធ្វើតេស្តឡើងវិញបាន បើមិនទាន់ជាប់',
    '📌 អ្នកដែលជាប់នឹងទទួលបានវិញ្ញាបនបត្រតាមអ៊ីមែលក្នុងរយៈពេល ៤៨ ម៉ោង',
    '',
    'តេស្តនេះមិនមែនដើម្បីវាយតម្លៃអ្នកទេ — វាដើម្បីឲ្យអ្នកប្រាកដថា',
    'អ្នកយកចំណេះដឹងត្រឹមត្រូវទៅប្រើនៅការិយាល័យ។'
  ].join('\n');
}

function passMark_() {
  return Math.ceil(QUESTIONS.length * QUIZ_CONFIG.passPercent / 100);
}


/* ============================================================
   ការដាក់ពិន្ទុ និងអ៊ីមែលលទ្ធផល · Grading + result email
   ============================================================ */

function installQuizTrigger() {
  var form = FormApp.getActiveForm();
  if (!form) throw new Error('សូមរត់ស្គ្រីបនេះពីក្នុង Form (Extensions → Apps Script)។');

  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'onQuizSubmit') ScriptApp.deleteTrigger(t);
  });

  ScriptApp.newTrigger('onQuizSubmit').forForm(form).onFormSubmit().create();
  Logger.log('✅ Trigger ដំឡើងរួចរាល់។');
}


function onQuizSubmit(e) {
  if (!QUIZ_CONFIG.emailResults) return;

  try {
    var resp = e.response;
    var email = resp.getRespondentEmail();
    if (!email) return;

    var score = 0;
    var name = '';

    // ពិន្ទុសរុប = ចំនួនសំណួរ × ពិន្ទុក្នុងមួយសំណួរ
    var total = QUESTIONS.length * QUIZ_CONFIG.pointsPerQ;

    resp.getGradableItemResponses().forEach(function (ir) {
      score += ir.getScore() || 0;
    });

    resp.getItemResponses().forEach(function (ir) {
      if (ir.getItem().getTitle().indexOf('ឈ្មោះពេញ') !== -1) {
        name = ir.getResponse();
      }
    });

    var percent = Math.round((score / total) * 100);
    var passed = percent >= QUIZ_CONFIG.passPercent;

    recordResult_(name, email, score, total, percent, passed);

    MailApp.sendEmail({
      to: email,
      replyTo: QUIZ_CONFIG.replyTo,
      name: QUIZ_CONFIG.organiser,
      subject: (passed ? '🎉 អបអរសាទរ — អ្នកជាប់តេស្ត' : '📘 លទ្ធផលតេស្តរបស់អ្នក') +
               ' · AI Office Automation',
      htmlBody: buildResultEmail_(name, score, total, percent, passed)
    });

  } catch (err) {
    Logger.log('⚠️ កំហុសពេលដាក់ពិន្ទុ: ' + err);
  }
}


/**
 * កត់ត្រាលទ្ធផលចូលសន្លឹក «លទ្ធផល» ដើម្បីឲ្យស្គ្រីបវិញ្ញាបនបត្រយកទៅប្រើ។
 */
function recordResult_(name, email, score, total, percent, passed) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return;

  var sheet = ss.getSheetByName('លទ្ធផល · Results');
  if (!sheet) {
    sheet = ss.insertSheet('លទ្ធផល · Results');
    sheet.getRange('A1:G1').setValues([[
      'ថ្ងៃធ្វើតេស្ត', 'ឈ្មោះ', 'អ៊ីមែល', 'ពិន្ទុ', 'ពិន្ទុសរុប', 'ភាគរយ', 'ស្ថានភាព'
    ]]);
    sheet.getRange('A1:G1')
         .setFontWeight('bold')
         .setBackground('#1a3325')
         .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    new Date(), name, email, score, total, percent + '%',
    passed ? 'ជាប់ · PASS' : 'ធ្លាក់ · RETAKE'
  ]);
}


function buildResultEmail_(name, score, total, percent, passed) {
  var colour = passed ? '#4ade80' : '#facc15';
  var heading = passed
    ? 'អបអរសាទរ! អ្នកបានប្រឡងជាប់'
    : 'អ្នកជិតដល់ហើយ — សាកល្បងម្តងទៀត';

  var body = passed
    ? '<p>អ្នកបានបំពេញលក្ខខណ្ឌទទួលវិញ្ញាបនបត្រចូលរួម។ ' +
      'យើងនឹងផ្ញើវិញ្ញាបនបត្រជា PDF ទៅអ៊ីមែលនេះក្នុងរយៈពេល ៤៨ ម៉ោង។</p>' +
      '<p>ជំហានបន្ទាប់៖ ជ្រើសរើសការងារដដែលៗ ១ របស់អ្នក ហើយសង់ជំហានទី១ ' +
      'នៅសប្តាហ៍នេះ។ កុំរង់ចាំឲ្យប្រព័ន្ធល្អឥតខ្ចោះ។</p>'
    : '<p>ពិន្ទុជាប់គឺ ' + QUIZ_CONFIG.passPercent + '%។ ' +
      'អ្នកអាចធ្វើតេស្តឡើងវិញបានភ្លាម — គ្មានកំណត់ចំនួនដងទេ។</p>' +
      '<p>គន្លឹះ៖ ពិនិត្យឡើងវិញនូវផ្នែក «AI · Agent · Automation» ' +
      'និង «តេស្ត ៤ សំណួរ» ក្នុងស្លាយវគ្គ។</p>';

  return [
    '<div style="font-family:Arial,\'Khmer OS Battambang\',sans-serif;',
    'max-width:600px;margin:0 auto;background:#0b100d;color:#e8efe9;',
    'padding:34px;border-radius:14px;line-height:1.7">',

    '<div style="color:#4ade80;font-size:12px;letter-spacing:2px;',
    'font-weight:bold;margin-bottom:10px">SKILL NEXT · ASSESSMENT RESULT</div>',

    '<h1 style="font-size:22px;margin:0 0 20px;color:#ffffff">', heading, '</h1>',

    '<p>ជំរាបសួរ <strong>', escapeHtml2_(name || 'អ្នកចូលរួម'), '</strong>,</p>',

    '<div style="background:#141b16;border:1px solid #22302a;border-radius:10px;',
    'padding:24px;margin:22px 0;text-align:center">',
      '<div style="font-size:44px;font-weight:bold;color:', colour, '">',
      percent, '%</div>',
      '<div style="color:#8b968f;margin-top:6px">',
      score, ' / ', total, ' ពិន្ទុ</div>',
    '</div>',

    body,

    '<div style="border-top:1px solid #22302a;margin-top:28px;padding-top:18px;',
    'color:#7d8b83;font-size:12px">',
      QUIZ_CONFIG.organiser, ' · សំណួរផ្សេងៗ សូមទាក់ទង ',
      QUIZ_CONFIG.certContact,
    '</div>',
    '</div>'
  ].join('');
}

function escapeHtml2_(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}


/**
 * ដាក់ពិន្ទុឡើងវិញសម្រាប់ចម្លើយទាំងអស់ (បើអ្នកកែសំណួរក្រោយពេលមានចម្លើយ)។
 * Re-grades every stored response — useful after editing answer keys.
 */
function regradeAll() {
  var form = FormApp.getActiveForm();
  if (!form) throw new Error('សូមរត់ពីក្នុង Form។');

  var responses = form.getResponses();
  responses.forEach(function (r) { r.submitGrades(); });
  Logger.log('✅ ដាក់ពិន្ទុឡើងវិញរួចរាល់សម្រាប់ ' + responses.length + ' ចម្លើយ។');
}
