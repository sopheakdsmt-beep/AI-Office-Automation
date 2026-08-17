# ពុម្ពអក្សរ · Bundled font

## `noto-sans-khmer.woff2`

**Noto Sans Khmer** — Khmer subset, variable weight (100–900).
Source: [Google Fonts](https://fonts.google.com/noto/specimen/Noto+Sans+Khmer) ·
[notofonts/khmer](https://github.com/notofonts/khmer)
License: SIL Open Font License 1.1 — see [`OFL.txt`](OFL.txt)

`unicode-range: U+1780-17FF, U+19E0-19FF, U+200C-200D, U+25CC` (58 KB)

### ហេតុអ្វីភ្ជាប់មកជាមួយ? · Why bundle it?

ម៉ាស៊ីនជាច្រើន — ជាពិសេស Linux និង Container — គ្មានពុម្ពអក្សរខ្មែរទេ។
ពេលនោះកម្មវិធីរុករកជ្រើសពុម្ពជំនួសដែលមិនចេះតម្រៀបជើងអក្សរ និងស្រៈ
ធ្វើឲ្យអក្សរខ្មែរបែកខ្ញែក និងអានមិនបាន។

ការភ្ជាប់ពុម្ពអក្សរមកជាមួយធានាថា៖

1. អក្សរខ្មែរបង្ហាញត្រឹមត្រូវលើគ្រប់ម៉ាស៊ីន (Windows · macOS · Linux · Android)
2. វគ្គដំណើរការ **ដោយគ្មានអ៊ីនធឺណិត** — សំខាន់ណាស់ពេលបង្ហាញផ្ទាល់
3. រូបរាងឯកសារដូចគ្នាគ្រប់កន្លែង រួមទាំងពេលបំប្លែងជា PDF

### របៀបប្រើក្នុង CSS

កំណត់រួចហើយក្នុង `assets/theme.css`។ ពុម្ពនេះមាន `unicode-range`
កំណត់តែអក្សរខ្មែរ ដូច្នេះវាដាក់បានទាំងក្នុង stack ខ្មែរ និង Latin —
អក្សរឡាតាំងយកពី Inter ចំណែកអក្សរខ្មែរយកពីពុម្ពនេះ។

```css
font-family: var(--font-khmer);  /* អត្ថបទខ្មែរជាចម្បង */
font-family: var(--font-latin);  /* ស្លាកឡាតាំង — អក្សរខ្មែរនៅតែត្រឹមត្រូវ */
```

សម្រាប់អក្សរខ្មែរនៅក្នុងស្លាកដែលមាន `letter-spacing` សូមប្រើ class `.km`
ដើម្បីបិទ tracking និង uppercase ដែលបំបែកជើងអក្សរខ្មែរ។

### ការជំនួសដោយពុម្ពផ្សេង

ប្តូរឯកសារ `.woff2` ហើយកែឈ្មោះក្នុង `@font-face` នៃ `assets/theme.css`
និង `certificate/index.html`។ បើប្រើពុម្ពដែលមានអាជ្ញាបណ្ណផ្សេង
សូមប្តូរ `OFL.txt` ឲ្យត្រូវតាមអាជ្ញាបណ្ណថ្មី។
