/* ============================================================
   OneTap i18n · KO/EN runtime translation (v1)
   - ?lang=en|ko  >  localStorage 'onetap_lang'  >  navigator.language
   - DOM text and attributes are translated in place and restored on switch.
   - Elements added later by app.js are translated by a MutationObserver.
   - Missing keys are reported to console as "I18N_MISS: <korean>".
   ============================================================ */
(function (root, doc) {
  'use strict';

  var LANG_KEY = 'onetap_lang';
  var COMMON = /*__COMMON__*/ {"닫기":"Close","취소":"Cancel","저장":"Save","저장됨":"Saved","삭제":"Delete","복사":"Copy","복사됨":"Copied","다운로드":"Download","내려받기":"Download","공유":"Share","인쇄":"Print","초기화":"Reset","다시 시도":"Try again","불러오기":"Load","내보내기":"Export","적용":"Apply","추가":"Add","편집":"Edit","수정":"Edit","보기":"View","미리보기":"Preview","설정":"Settings","도움말":"Help","사용법":"Guide","예시":"Example","샘플":"Sample","무료":"Free","유료":"Paid","개인정보":"Privacy","개인정보 처리방침":"Privacy policy","개인정보 처리 안내":"Privacy notice","이용약관":"Terms","홈":"Home","뒤로":"Back","다음":"Next","이전":"Previous","확인":"OK","검색":"Search","필터":"Filter","전체":"All","없음":"None","준비 중":"Coming soon","준비 중입니다":"Coming soon","로딩 중":"Loading","불러오는 중":"Loading","처리 중":"Working","빈칸":"Blank","필수":"Required","선택":"Optional","이름":"Name","제목":"Title","날짜":"Date","시간":"Time","메모":"Note","상태":"Status","결과":"Result","요약":"Summary","상세":"Details","언어":"Language","한국어":"Korean","영어":"English","복사하기":"Copy","링크 복사":"Copy link","전체 복사":"Copy all","다크 모드로 전환":"Switch to dark mode","라이트 모드로 전환":"Switch to light mode","테마 전환":"Toggle theme","라이트/다크":"Light / dark","다크/라이트":"Dark / light","새 탭에서 보기":"Open in new tab","새 창":"New window","본문으로 건너뛰기":"Skip to content","본문으로 바로가기":"Skip to content","맨 위로":"Back to top","더 보기":"Show more","접기":"Collapse","펼치기":"Expand","자주 묻는 질문":"Frequently asked questions","이 브라우저에만 저장됩니다":"Saved only in this browser","이 브라우저에만 저장됩니다 · 서버 전송 0":"Saved only in this browser · zero uploads","서버 전송 없음":"No upload","서버 업로드 없음":"No server upload","100% 브라우저 처리":"100% in-browser","브라우저에서 처리":"Processed in your browser","파일은 서버로 전송되지 않습니다":"Files never leave your device","파일이 서버로 전송되지 않습니다":"Files never leave your device","붙여넣은 코드는 서버로 전송되지 않습니다":"Pasted code never leaves your device"};
  var APP = /*__DICT__*/ {"작업 증빙 리포트 — 클라이언트에게 보여 줄 1분 리포트":"Proof of Work Report — a one-minute report for your client","프리랜서·1인 대행사를 위한 작업 증빙 리포트 생성기. 완료 항목·소요시간·근거 링크·다음 주 계획을 공유 URL과 A4 PDF로 정리합니다. 서버 없이 브라우저에서만 동작합니다.":"A proof-of-work report builder for freelancers and one-person agencies. It turns completed items, hours, evidence links and next week's plan into a shareable URL and an A4 PDF, entirely in your browser with no server.","작업 증빙 리포트 스튜디오 홈":"Proof of Work Report home","주요 화면":"Main views","이 앱의 기준":"What this app promises","이 리포트의 증빙 요약":"Evidence summary of this report","작업 분류":"Work category","항목 그룹으로 이동":"Jump to an item group","예: 온빛 브랜드 블로그 월간 운영":"e.g. Onbit brand blog, monthly","예: 주식회사 온빛":"e.g. Onbit Inc.","이번 기간에 무엇을 끝냈고, 다음에 무엇이 남았는지 2~3문장으로.":"Two or three sentences on what you finished this period and what is left.","예: 42":"e.g. 42","공유 준비":"Ready to share","바로 가기":"Jump to","예: 이번주 블로그 12개 썼고 카드뉴스 4개 올림. 제품사진 없어서 3개는 못씀.":"e.g. Wrote 12 blog posts and published 4 card news sets. Three posts are waiting on product photos.","문장 톤":"Tone","복사할 프롬프트":"Prompt to copy","AI가 준 JSON(또는 문장)을 그대로 붙여 넣으세요. 제목이 맞는 항목에 메모가 들어갑니다.":"Paste the JSON (or plain text) your AI returned. Memos land on items with the same title.","예: 온빛기획":"e.g. Onbit Studio","예: 김민수":"e.g. Minsu Kim","예: 퍼포먼스 마케터":"e.g. Performance marketer","비워 두기":"Leave blank","브랜드 컬러 직접 선택":"Pick a brand colour","공유 링크":"Share link","본문으로 바로가기":"Skip to content","작업 증빙 리포트":"Proof of Work Report","내 리포트로 가져오기":"Import into my report","링크 복사":"Copy link","A4 PDF로 저장":"Save as A4 PDF","리포트를 열 수 없습니다":"This report can't be opened","주소가 잘렸거나 오래된 링크입니다.":"The address was cut off, or the link is old.","작업 증빙 리포트 만들기":"Build a proof-of-work report","이 리포트는 서버에 저장되지 않았습니다.":"This report was never stored on a server.","내용은 링크 안에만 담겨 있고, 브라우저가 직접 그립니다.":"The content lives inside the link itself, drawn by your browser.","링크를 아는 사람은 누구나 볼 수 있습니다. 민감한 정보는 빼고 공유하세요.":"Anyone with the link can read it. Leave sensitive details out.","작성":"Write","클라이언트 뷰":"Client view","이력":"History","AI 브리지":"AI bridge","브랜드":"Brand","저장됨":"Saved","무료 · 서버 0 · 가입 0":"Free · no server · no sign-up","“이번 달 뭐 했어요?”에":"For the “what did you do this month?”","스크린샷 대신":"answer, a report","증빙 리포트":"instead of screenshots","1분.":"in one minute.","완료한 일, 걸린 시간, 근거 링크, 다음 주 계획을 한 장으로 정리합니다. 클라이언트는 로그인 없이 링크로 읽고, 필요하면 A4 PDF로 저장합니다.":"One page that gathers what you finished, how long it took, the evidence links and next week's plan. Your client reads it from a link without logging in, and saves an A4 PDF if they want one.","예시 리포트 보기 →":"See a sample report →","공유 링크 만들기":"Create a share link","3단 증빙":"Three layers of proof","항목 · 소요시간 · 근거 링크":"Item, hours, evidence link","전주 대비":"Against last week","늘었는지 줄었는지 숫자로":"Up or down, in numbers","서버 전송 0건":"Zero uploads","링크 안에만 담깁니다":"It stays inside the link","이 리포트의 증빙":"Proof in this report","자동 집계":"Counted automatically","완료":"Done","소요시간":"Hours","근거 링크":"Evidence links","증빙률":"Proof rate","첫 리포트":"First report","숫자는 입력에서만 나옵니다. 링크를 붙이고 시간을 적을수록 증빙이 강해집니다.":"Every number comes from what you enter. The more links and hours you add, the stronger the proof.","업종 프리셋 3종":"Three industry presets","누르면 예시 리포트가 채워집니다. 그대로 공유 링크를 만들어 볼 수 있습니다.":"Press one to fill a sample report, then build a share link from it.","마케팅·블로그 대행":"Marketing & blog agency","원고 12편 · 카드뉴스 · 순위":"12 posts · card news · rankings","웹·앱 개발":"Web & app development","API · 화면 · QA · 배포":"API · UI · QA · deploy","디자인·브랜딩":"Design & branding","로고 · 가이드 · 인쇄물":"Logo · guide · print","리포트 작성":"Write the report","입력하는 대로 왼쪽 장부와 클라이언트 뷰가 바로 바뀝니다.":"As you type, the ledger and the client view update on the left.","전체":"All","진행":"In progress","다음 주":"Next week","확인 필요":"Needs input","기본 정보":"Basics","예시 리포트 불러오기":"Load a sample report","프로젝트명":"Project","필수":"required","클라이언트":"Client","보고 기간 시작":"Period start","보고 기간 끝":"Period end","한 줄 요약":"One-line summary","클라이언트가 제일 먼저 읽는 문장":"The first line your client reads","집계로 자동 작성":"Write from the totals","AI로 다듬기 →":"Polish with AI →","지난 기간 총 소요시간":"Last period's total hours","선택":"optional","넣으면 “전주 대비 +18%”처럼 변화를 같이 보여 줍니다.":"Add it and the report shows the change, e.g. “+18% on last week”.","기간 표시":"Period label","기간을 넣으면 일수까지 계산합니다":"Add the dates and the day count is calculated","증빙이 강해지는 순서":"How to make the proof stronger","4단계":"4 steps","항목은 결과로 씁니다.":"Write items as results.","“블로그 작업” 대신 “원고 12편 작성·교정”.":"“12 posts written and proofed” rather than “blog work”.","시간을 적습니다.":"Add the hours.","근거가 없을 때 소요시간이 유일한 증거가 됩니다.":"When there is no link, the hours are the only evidence.","링크를 붙입니다.":"Attach the link.","GitHub PR, Figma 파일, 노션 페이지, 구글 시트 — 클라이언트가 눌러 확인하는 한 번이 설득입니다.":"A GitHub PR, a Figma file, a Notion page, a Google Sheet — one click by the client is what persuades.","블로커는 요청 문장으로.":"Turn blockers into requests.","“사진이 없어서 못 했습니다”보다 “2일까지 사진 3종을 주시면 일정에 영향이 없습니다”.":"“If I have the three photos by the 2nd, the schedule holds” beats “I couldn't because there are no photos”.","공유 전 점검":"Check before sharing","A4 PDF로 인쇄":"Print to A4 PDF","텍스트로 복사":"Copy as text","링크에는 입력한 내용이 담깁니다. 서버에는 아무것도 저장되지 않습니다.":"The link carries what you typed. Nothing is stored on a server.","받는 사람이 보는 그대로":"Exactly what the recipient sees","거친 메모를 문장으로":"Rough notes into sentences","브랜드·서명":"Brand & signature","PDF 머리말과 서명란":"PDF header and signature block","개인정보가 보입니다":"Personal details show here","링크를 아는 사람은 누구나 열람합니다. 공유 전에 지우는 게 안전합니다.":"Anyone with the link can read it, so remove anything private before sharing.","받는 사람이 보는 화면":"What the recipient sees","공유 링크를 열면 이 화면이 그대로 나옵니다. 로그인도, 앱 설치도 필요 없습니다.":"Opening the share link shows this page as it is. No login, no install.","이 화면의 링크 복사":"Copy this view's link","이 브라우저에만 저장":"Saved in this browser only","프로젝트 이력":"Project history","작성하는 동안 자동으로 저장됩니다. 다음 달에는 지난 리포트를 불러와 기간만 바꾸면 됩니다.":"Everything autosaves as you write. Next month, load last month's report and change the dates.","새 리포트":"New report","JSON 내려받기":"Download JSON","JSON 불러오기":"Load JSON","아직 저장된 리포트가 없습니다. 작성 탭에서 프리셋을 눌러 시작해 보세요.":"No saved reports yet. Press a preset on the Write tab to start.","거친 메모 → 클라이언트용 문장":"Rough notes → client-ready sentences","작성 탭의 항목·시간·링크를 프롬프트로 묶어 줍니다. 내가 쓰는 AI(ChatGPT·Claude·Gemini)에 붙여 넣으면 클라이언트가 읽는 문장으로 돌아옵니다.":"It bundles the items, hours and links from the Write tab into a prompt. Paste it into your own AI — ChatGPT, Claude or Gemini — and the sentences come back client-ready.","Pro AI로 다듬기":"Polish with Pro AI","거친 메모":"Rough notes","지금 리포트 항목도 프롬프트에 함께 들어갑니다":"Your report items go into the prompt too","톤":"Tone","숫자는 리포트에 있는 것만 쓰도록 프롬프트에 못 박습니다.":"The prompt pins the AI to the numbers already in the report.","프롬프트 다시 만들기":"Rebuild prompt","프롬프트":"Prompt","프롬프트 복사":"Copy prompt","ChatGPT 열기":"Open ChatGPT","Claude 열기":"Open Claude","Gemini 열기":"Open Gemini","Gemini는 프롬프트를 주소로 넘기지 않습니다. 복사한 뒤 붙여 넣으세요.":"Gemini does not take a prompt in the URL. Copy it and paste it in.","돌아온 문장 붙여넣기":"Paste the returned text","대기":"Waiting","리포트에 반영":"Apply to report","지우기":"Clear","반영 전에 미리보기로 확인하세요. 제목이 같은 항목의 메모만 바꿉니다.":"Check the preview before applying. Only items with matching titles get new memos.","PDF · 공유 링크에 함께 나갑니다":"It goes out in the PDF and the share link","브랜드와 서명":"Brand and signature","로고 텍스트와 브랜드 컬러, 담당자 서명란을 정합니다. 리포트 상단과 하단에 그대로 들어갑니다.":"Set the logo text, brand colour and the signature block. They appear at the top and bottom of the report.","기본값으로":"Reset to defaults","가명으로 미리 채워져 있습니다":"Pre-filled with a placeholder name","로그오 텍스트":"Logo text","회사·활동명":"Company or practice name","담당자":"Owner","직함":"Title","연락 이메일":"Contact email","연락처":"Phone","선택 · 비워 두면 표시 안 함":"optional · left blank, hidden","브랜드 컬러":"Brand colour","리포트의 번호·구분선·요약 숫자에 쓰입니다. 인쇄에서도 같은 색으로 나옵니다.":"Used for numbers, rules and summary figures. Print keeps the same colour.","서명란":"Signature block","서명 이름":"Signature name","서명 직함":"Signature title","작성일":"Date","미리보기":"Preview","실제 리포트의 머리말·서명란과 같은 모양입니다.":"This is the header and signature block as they appear in the report.","전체 미리보기 →":"Full preview →","무료 · 회원가입 없음 · 빌드 없음. 입력한 내용은 이 브라우저에서만 처리되고, 공유 링크에는 내용이 압축되어 담깁니다.":"Free, no sign-up, no build. What you type is processed in this browser, and the share link carries it compressed.","개인정보 처리 안내":"Privacy notice","앱 처음으로":"Back to the app","공유 링크가 만들어졌습니다":"Your share link is ready","로그인 없이 열리는 클라이언트용 읽기 뷰입니다. 링크를 아는 사람은 누구나 볼 수 있습니다.":"A read-only client view that opens without logging in. Anyone with the link can read it.","복사":"Copy","링크가 깁니다. 항목을 줄이거나 메모를 짧게 해 주세요.":"The link is long. Remove a few items or shorten the memos.","새 탭에서 열기":"Open in a new tab","닫기":"Close","완료한 작업":"Completed","끝낸 일은 결과로 적습니다. 클라이언트가 돈을 낸 이유가 여기에 있습니다.":"Write finished work as results — this is what the client paid for.","진행 중":"In progress","이번 기간에 시작했고 다음 기간에 이어지는 일입니다.":"Started this period, carrying into the next.","다음 주 계획":"Next week","다음에 무엇을 언제까지 할지. 시간은 비워 두어도 됩니다.":"What you will do and by when. Hours are optional.","확인이 필요한 것":"Needs your input","혼자 풀 수 없는 일은 요청 문장으로 씁니다. 클라이언트가 할 일을 알려 줍니다.":"Anything you can't unblock alone goes in as a request, so the client knows what to do.","저장 중…":"Saving…","저장 실패(용량)":"Save failed (storage full)","저장 안 됨(브라우저 설정)":"Not saved (browser setting)","완료 항목이 있어야 요약을 만들 수 있습니다.":"Add a completed item before writing the summary.","집계로 요약을 채웠습니다. 문장은 자유롭게 고치세요.":"The summary is filled from the totals. Edit the wording as you like.","항목 추가":"Add item","아직 완료 항목이 없습니다. “항목 추가”로 첫 줄을 넣어 보세요.":"No completed items yet. Press “Add item” to start.","해당하는 항목이 없습니다.":"No items here.","작업 제목":"Item title","결과로 적기 (예: 블로그 원고 12편 작성·교정)":"Write it as a result (e.g. 12 blog posts written and proofed)","무엇을 할지 (예: 12월 콘텐츠 캘린더 초안)":"What you will do (e.g. December content calendar draft)","소요 시간(시간 단위)":"Hours spent","항목 삭제":"Delete item","근거 링크 주소":"Evidence link","근거 링크 (GitHub · Figma · Notion · 구글 시트)":"Evidence link (GitHub, Figma, Notion, Google Sheets)","클라이언트에게 보여 줄 메모":"Memo for the client","클라이언트에게 보여 줄 한두 문장 (선택)":"One or two sentences for the client (optional)","클라이언트에게 요청할 일":"What you need from the client","예: 촬영본 3종을 12월 2일까지 전달해 주세요":"e.g. Please send the three shots by 2 December","링크를 붙이면 증빙률이 올라갑니다.":"Adding a link raises the proof rate.","http:// 또는 https:// 주소만 들어갑니다.":"Only http:// or https:// addresses are accepted.","링크로 들어갑니다":"opens as a link","항목을 삭제했습니다.":"Item deleted.","되돌리기":"Undo","항목을 되돌렸습니다.":"Item restored.","첫 리포트 · 지난 기간 시간을 넣으면 비교합니다":"First report · add last period's hours to compare","전기간 대비":"vs last period","공유 준비가 끝났습니다. 링크를 만들어 보세요.":"Ready to share — build the link.","외":"and","리포트":"Report","발행":"Published","프로젝트명을 입력하세요":"Enter the project name","기간":"Period","담당":"Owner","총 소요시간":"Total hours","지난 기간 대비":"Against last period","이번 기간 요약":"This period in short","예정":"Planned","시간 미기록":"hours not recorded","요청":"Request","아직 내용이 없습니다. 작성 탭에서 항목을 넣으면 이 자리에 리포트가 만들어집니다.":"Nothing here yet. Add items on the Write tab and the report is built in this space.","이 리포트는 서버에 저장되지 않았습니다. 링크 안의 내용을 브라우저가 직접 그립니다.":"This report was never stored on a server; your browser draws what the link carries.","· 작업 증빙 리포트":"· Proof of Work Report","주간 작업 증빙 리포트":"Weekly proof-of-work report","월간 작업 증빙 리포트":"Monthly proof-of-work report","작업 증빙 리포트 ·":"Proof of Work Report ·","공유 링크를 만들지 못했습니다.":"Could not build the share link.","DEFLATE 압축":"DEFLATE compressed","비압축":"uncompressed","· 원본 JSON":"· original JSON","바이트 (키 생략":"bytes (keys omitted","% · 링크 길이":"% · link length","% 감소)":"% shorter)","링크가":"The link is","자를 넘었습니다. 메신저에서 잘릴 수 있으니 항목을 줄여 주세요.":"characters long. Messengers may cut it, so remove a few items.","자를 넘었습니다. 일부 메신저에서는 잘릴 수 있습니다.":"characters long. Some messengers may cut it.","공유 링크를 복사했습니다.":"Share link copied.","복사하지 못했습니다. 링크를 직접 선택해 주세요.":"Could not copy. Select the link yourself.","리포트를 텍스트로 복사했습니다.":"Report copied as text.","복사하지 못했습니다.":"Could not copy.","프로젝트명이 여기에 들어갑니다":"Your project name appears here","브랜드 정보를 기본값(가명)으로 되돌렸습니다.":"Brand details reset to the placeholder values.","예시 메모를 넣었습니다. 내 메모로 바꿔도 됩니다.":"Sample memos added. Replace them with your own.","프롬프트를 다시 만들었습니다.":"Prompt rebuilt.","프롬프트를 복사했습니다. AI 창에 붙여 넣으세요.":"Prompt copied. Paste it into your AI.","결과 칸을 비웠습니다.":"Cleared the result box.","문장":"text","를 열었습니다. 프롬프트가 함께 들어갔습니다.":" opened with the prompt loaded.","를 열었습니다. 프롬프트를 붙여 넣으세요(클립보드에 복사됨).":" opened. Paste the prompt — it's on your clipboard.","새 창이 막혔습니다. 팝업을 허용하고 다시 눌러 주세요.":"The new window was blocked. Allow pop-ups and press again.","붙여 넣은 문장이 없습니다.":"Nothing was pasted.","반영됨":"Applied","반영했습니다.":"applied.","곳을 반영했습니다.":"entries updated.","제목이 같은 항목의 메모만 바꿨습니다. 미리보기에서 확인하세요.":"Only memos on items with matching titles changed. Check the preview.","JSON이 아닙니다. 이 문장을 요약 칸에 넣을까요? (기존 요약은 바뀝니다)":"This is not JSON. Put the text into the summary instead? (The current summary will be replaced)","요약 반영":"Apply to summary","JSON이 아니어서 요약 칸에 넣었습니다.":"It was not JSON, so it went into the summary.","오류":"Error","응답을 읽지 못했습니다.":"Could not read the response.","Pro 연결 엔진을 불러오지 못했습니다. 새로고침해 주세요.":"The Pro connector failed to load. Refresh the page.","다듬는 중…":"Polishing…","Pro 응답을 받지 못했습니다.":"No response from Pro.","응답을 JSON으로 읽지 못했습니다.":"The response was not valid JSON.","Pro 반영":"Apply Pro","Pro가 요약과 메모":"Pro polished the summary and","곳을 다듬었습니다.":"memos.","Pro 응답 중 문제가 생겼습니다.":"Something went wrong with the Pro response.","제목 없는 리포트":"Untitled report","저장":"Saved","소요":"Hours","불러오기":"Load","복제":"Duplicate","(사본)":"(copy)","복제했습니다. 기간을 바꿔 다음 달 리포트로 쓰세요.":"Duplicated. Change the dates and use it for next month.","삭제":"Delete","이력을 삭제했습니다.":"History entry deleted.","리포트를 불러왔습니다.":"Report loaded.","불러왔습니다. 이어서 수정하세요.":"Loaded. Carry on editing.","새 리포트를 시작했습니다. 이전 리포트는 이력에 남아 있습니다.":"New report started. The previous one is still in History.","JSON 파일을 내려받았습니다.":"JSON file downloaded.","불러오지 못했습니다.":"Could not load it.","JSON을 불러왔습니다.":"JSON loaded.","파일을 읽지 못했습니다.":"Could not read the file.","예시를 채웠습니다. 그대로 공유 링크를 만들어 보세요.":"sample filled in. Build a share link from it as it is.","링크를 읽지 못했습니다.":"Could not read the link.","리포트를 열 수 없습니다 · 작업 증빙 리포트":"This report can't be opened · Proof of Work Report","이 리포트 링크를 복사했습니다.":"Report link copied.","이 브라우저에서는 저장이 막혀 있습니다.":"Saving is blocked in this browser.","자동 저장":"Autosave","다른 탭에서 초안이 지워졌습니다.":"The draft was cleared in another tab.","블로커":"Blockers","콘텐츠":"Content","개발":"Development","디자인":"Design","운영":"Operations","미팅":"Meetings","기타":"Other","직전 주":"last week","Google 문서":"Google Docs","Google 시트":"Google Sheets","Google 드라이브":"Google Drive","Google 슬라이드":"Google Slides","네이버 블로그":"Naver Blog","Google 설문":"Google Forms","공유 코드를 만들지 못했습니다.":"Could not build the share code.","공유 코드가 비어 있습니다.":"The share code is empty.","압축된 링크를 풀 라이브러리를 불러오지 못했습니다. 앱을 새로고침해 주세요.":"The decompression library failed to load. Refresh the app.","공유 링크가 손상되었습니다(주소가 잘렸을 수 있습니다).":"The share link is damaged — the address may have been cut.","공유 링크를 읽지 못했습니다.":"Could not read the share link.","공유 링크의 내용을 해석하지 못했습니다.":"Could not interpret the share link's content.","이 앱의 리포트 링크가 아닙니다.":"This is not a report link from this app.","더 새로운 버전에서 만든 링크입니다. 앱을 새로고침해 주세요.":"This link comes from a newer version. Refresh the app.","리포트 내용이 비어 있습니다.":"The report is empty.","이번 기간 완료한 작업은":"This period you completed","입니다.":".","작업이":"work accounted for","로 가장 많았습니다.":"of the time.","건은 이어서 진행 중입니다.":"items are still in progress.","확인이 필요한 항목이":"Items needing input:","건 있습니다.":".","개를 함께 정리했습니다.":"evidence links included.","0시간":"0 hours","시간":"hours","프로젝트명을 넣어 주세요.":"Add the project name.","클라이언트명이 비어 있습니다. 받는 사람이 누구인지 적어 두세요.":"The client is empty. Note who receives this.","보고 기간(시작·종료)을 넣어 주세요.":"Add the reporting period (start and end).","시작일이 종료일보다 늦습니다.":"The start date is after the end date.","완료한 작업이 0건입니다. 최소 1건이 있어야 증빙이 됩니다.":"No completed items. At least one is needed as proof.","번째 항목":"item","의 제목이 비어 리포트에서 빠집니다.":"has no title and is left out of the report.","의 근거 주소는 http/https 주소만 됩니다.":"has an evidence address that is not http/https.","의 소요시간이 0입니다.":"has zero hours.","근거 링크가 붙은 시간이":"Only this share of the hours has a link:","링크가 있는 항목이 클라이언트를 설득합니다.":"Items with links are what persuade a client.","한 줄 요약이 깁니다(400자 이내 권장).":"The summary is long (400 characters or fewer is better).","주민등록번호 형태":"resident registration number pattern","전화번호":"phone number","이메일 주소":"email address","계좌·카드 형태 숫자":"account or card number pattern","메모":"memo","제목":"title","제목 없음":"Untitled","클라이언트:":"Client:","기간:":"Period:","요약: 완료":"Summary: done","건 · 총":"items · total","· 근거":"· evidence","개 ·":"links ·","**클라이언트**":"**Client**","**기간**":"**Period**","**요약** 완료":"**Summary** done","근거":"Evidence","- 요청:":"- Request:","담백하게. 성과는 입력에 있는 숫자만, 과장 없이.":"Plain. Only the numbers already entered, no exaggeration.","성과를 문장 앞에 두되, 입력에 없는 숫자는 절대 만들지 않는다.":"Lead with the result, but never invent a number that is not in the input.","항목마다 딱 한 문장. 80자 이내.":"One sentence per item. Under 80 characters.","(없음)":"(none)","(제목 없음)":"(untitled)","분류":"Category","메모:":"Memo:","요청:":"Request:","(기간 없음)":"(no period)","작업 증빙 리포트 다듬기":"Polish a proof-of-work report","응답을 JSON으로 읽지 못했습니다. 다시 시도해 주세요.":"The response was not valid JSON. Try again.","응답 형식이 예상과 다릅니다.":"The response format is not what was expected.","응답에 반영할 문장이 없습니다.":"There is nothing to apply in the response.","JSON 파일을 읽지 못했습니다.":"Could not read the JSON file.","리포트 JSON 형식이 아닙니다.":"This is not a report JSON file.","담백하게":"Plain","과장 없이 사실만":"Facts only, no hype","성과 앞세우기":"Lead with results","숫자는 입력에 있는 것만":"Only the numbers entered","한 문장씩":"One sentence each","바쁜 클라이언트용":"For busy clients","마케팅":"Marketing","무료 모드":"Free mode","· API 연결":"· Connect API","무료 모드. Pro API 연결 설정 열기":"Free mode. Open Pro API settings","무료 모드 · 클릭해서 유료 API 연결":"Free mode · click to connect a paid API","무료 모드입니다. 누르면 Pro 연결 안내가 열립니다":"Free mode — press to see how to connect Pro","온":"On","온빛기획":"Onbit Studio","김민수":"Minsu Kim","퍼포먼스 마케터":"Performance marketer","온빛기획 · 김민수":"Onbit Studio · Minsu Kim","온빛기획 · 작업 증빙 리포트":"Onbit Studio · Proof of Work Report","김민수 · 퍼포먼스 마케터":"Minsu Kim · Performance marketer","담당 김민수 · 퍼포먼스 마케터":"Owner Minsu Kim · Performance marketer","마케팅 (블로그·카드뉴스)":"Marketing (blog & card news)","개발 (API·화면)":"Development (API & UI)","디자인 (로고·가이드)":"Design (logo & guide)","로고 텍스트":"Logo text","안내":"Guide","브랜드 컬러 #2f5bff":"Brand colour #2f5bff","브랜드 컬러 #0c0d0f":"Brand colour #0c0d0f","브랜드 컬러 #1f3d7a":"Brand colour #1f3d7a","브랜드 컬러 #0e7a55":"Brand colour #0e7a55","브랜드 컬러 #7a2e2e":"Brand colour #7a2e2e","브랜드 컬러 #6b4a1f":"Brand colour #6b4a1f","[이번 리포트]":"[This report]","[내가 쓴 초안 요약]":"[My draft summary]","[거친 작업 메모]":"[Rough work notes]","[완료한 작업]":"[Completed work]","[진행 중]":"[In progress]","[다음 주 계획]":"[Next week]","[확인이 필요한 것]":"[Needs input]","[다듬는 규칙]":"[Editing rules]","[출력 — JSON만, 코드펜스 없이]":"[Output — JSON only, no code fence]","너는 프리랜서·1인 대행사의 작업 증빙 리포트를 클라이언트가 읽기 좋게 다듬는 한국어 에디터다.":"You are an editor who turns a freelancer's proof-of-work report into something a client can read easily.","주어진 사실만 쓴다. 없는 숫자·성과·원인을 만들지 않는다.":"Use only the given facts. Never invent numbers, results or causes.","결과는 설명 없이 JSON 하나만 낸다.":"Return a single JSON object with no commentary.","1. 숫자·기간·링크는 위에 있는 것만 쓴다. 조회수·매출·순위·전환율을 새로 만들지 않는다.":"1. Use only the numbers, dates and links above. Never create views, revenue, rankings or conversion rates.","2. 확인되지 않은 원인이나 약속을 단정하지 않는다. 모르면 \"확인 중\"이라고 쓴다.":"2. Do not assert causes or promises that are not verified. Write \"checking\" when unsure.","3. 상투구 금지: \"최선을 다하겠습니다\", \"소중한\", \"함께 성장\", \"더 나은 내일\".":"3. No stock phrases: \"we will do our best\", \"valued\", \"grow together\", \"a better tomorrow\".","4. 클라이언트가 다음에 할 일(블로커)은 요청 문장으로 분명히 쓴다.":"4. State what the client must do (blockers) as a clear request.","5. 합니다체. 이모지·감탄 부호 없이. 메모는 1~2문장, 120자 이내.":"5. Formal register. No emoji or exclamation marks. Memos are one or two sentences, under 120 characters.","6. 제목은 원문 그대로 둔다(항목 매칭에 쓴다).":"6. Keep titles exactly as written (they are used to match items).","7. 톤: 담백하게. 성과는 입력에 있는 숫자만, 과장 없이.":"7. Tone: plain. Results only as the numbers show them, no exaggeration.","{\"summary\":\"이번 기간을 3문장 이내로\",":"{\"summary\":\"this period in three sentences or fewer\",","\"items\":[{\"title\":\"원래 제목 그대로\",\"memo\":\"클라이언트용 1~2문장\"}],":"\"items\":[{\"title\":\"the original title\",\"memo\":\"one or two sentences for the client\"}],","\"next\":[{\"title\":\"원래 제목 그대로\",\"memo\":\"무엇을 언제까지\"}],":"\"next\":[{\"title\":\"the original title\",\"memo\":\"what, by when\"}],","\"blockers\":[{\"title\":\"원래 제목 그대로\",\"memo\":\"상황\",\"ask\":\"클라이언트가 해줄 일\"}]}":"\"blockers\":[{\"title\":\"the original title\",\"memo\":\"the situation\",\"ask\":\"what the client should do\"}]}","온빛 브랜드 블로그 월간 운영":"Onbit brand blog, monthly","주식회사 온빛":"Onbit Inc.","이번 주는 블로그 원고 12편을 마감하고 카드뉴스 4종을 발행했습니다. 신규 상위 노출 키워드 3개가 잡혔고, 다음 주는 12월 캘린더 확정과 제품 사진 반영이 남았습니다.":"This week I closed 12 blog posts and published 4 card news sets. Three new keywords reached the top of search, and next week is about locking the December calendar and getting product photos in.","11월 콘텐츠 캘린더·키워드 리서치 확정":"November content calendar and keyword research locked","경쟁사 6곳의 상위 글을 키워드별로 나눠 보고, 11월 4주 캘린더를 확정했습니다. 새로 잡은 키워드는 “겨울 가습 관리”, “사무실 공기청정”, “반려동물 환기” 3개입니다.":"I split the top posts of six competitors by keyword and locked the four-week November calendar. The three new keywords are “winter humidity care”, “office air purifying” and “pet ventilation”.","블로그 원고 12편 작성·교정":"12 blog posts written and proofed","12편 중 9편은 내부 검수까지 끝났고 3편은 클라이언트 확인만 남았습니다. 원고 목록과 교정 이력은 시트에 정리해 두었습니다.":"Nine of the twelve are through internal review; the other three only need the client's sign-off. The post list and proofing history are in the sheet.","네이버 상위 노출 모니터링·순위표 갱신":"Naver ranking checks and table updated","주요 10개 키워드를 3회 측정해 순위표를 갱신했습니다. 3개 키워드가 1페이지에 새로 들어왔습니다.":"I measured the ten main keywords three times and updated the ranking table. Three keywords entered page one.","인스타그램 카드뉴스 4종 제작·발행":"4 Instagram card news sets made and published","가습기 사용 팁을 4장 카드로 만들었습니다. 템플릿을 재사용할 수 있게 피그마 컴포넌트로 정리했습니다.":"I turned humidifier tips into a four-card set and arranged the template as a reusable Figma component.","주간 성과 리포트 작성·공유":"Weekly performance report written and shared","방문자·체류시간·유입 키워드를 지난주와 비교해 한 장으로 정리했습니다.":"One page comparing visitors, time on page and incoming keywords against last week.","12월 콘텐츠 캘린더 초안":"December content calendar draft","12월 1~2주차 12편의 제목과 키워드를 잡았습니다. 3~4주차는 신제품 출시일에 맞춰 조정 중입니다.":"Titles and keywords for the twelve posts of weeks 1–2 are set. Weeks 3–4 are being adjusted to the product launch date.","신제품 사진 반영한 상세 페이지 카피 3종":"Three product page copy sets with the new photos","화요일까지 초안, 목요일까지 클라이언트 확인을 목표로 합니다.":"Drafts by Tuesday, client sign-off by Thursday.","블로그 원고 12편 (12월 1주차)":"12 blog posts (December, week 1)","캘린더 확정 후 바로 착수합니다.":"Starts as soon as the calendar is locked.","제품 사진 3종 미수령":"Three product photos not received","12월 1주차 원고 3편에 들어갈 제품 촬영본이 아직 없습니다.":"The product shots for three of the week-one posts haven't arrived.","온빛 담당자님이 촬영본 3종을 12월 2일까지 전달해 주시면 일정에 영향이 없습니다.":"If the Onbit contact sends the three shots by 2 December, the schedule holds.","저장 2026.11.27":"Saved 2026.11.27","요청 ·":"Request ·","Notion 링크로 들어갑니다":"Opens the Notion link","Google 시트 링크로 들어갑니다":"Opens the Google Sheets link","Figma 링크로 들어갑니다":"Opens the Figma link","Google 문서 링크로 들어갑니다":"Opens the Google Docs link"};
  var PATTERNS = /*__PATTERNS__*/ [[new RegExp("^(\\d+)\\) (.+) / 소요 ([^ /]+) / 분류 ([^ /]+) / 근거 (\\S+) / 메모: (.+)$", ""), "$1) $2 / hours $3 / category $4 / evidence $5 / memo: $6"],[new RegExp("^(\\d+)\\) (.+) / 분류 ([^ /]+) / 메모: (.+) / 요청: (.+)$", ""), "$1) $2 / category $3 / memo: $4 / request: $5"],[new RegExp("^(\\d+)\\) (.+) / 분류 ([^ /]+) / 메모: (.+)$", ""), "$1) $2 / category $3 / memo: $4"],[new RegExp("^(\\d+)\\) (.+) / 분류 ([^ /]+)$", ""), "$1) $2 / category $3"],[new RegExp("^(\\d{4})\\.(\\d{1,2})\\.(\\d{1,2}) – (\\d{1,2})\\.(\\d{1,2}) · (\\d+)일$", ""), "$1.$2.$3 – $4.$5 · $6 days"],[new RegExp("^(\\d{4})\\.(\\d{1,2})\\.(\\d{1,2}) – (\\d{4})\\.(\\d{1,2})\\.(\\d{1,2}) · (\\d+)일$", ""), "$1.$2.$3 – $4.$5.$6 · $7 days"],[new RegExp("^발행 (\\d{4})\\.(\\d{1,2})\\.(\\d{1,2})$", ""), "Published $1.$2.$3"],[new RegExp("^(\\d+)건$", ""), "$1 items"],[new RegExp("^(\\d+)개$", ""), "$1 links"],[new RegExp("^(\\d+)자$", ""), "$1 characters"],[new RegExp("^담당 (.+)$", ""), "Owner $1"],[new RegExp("^브랜드 컬러 (#[0-9a-fA-F]{3,8})$", ""), "Brand colour $1"],[new RegExp("^프로젝트: (.+)$", ""), "Project: $1"],[new RegExp("^클라이언트: (.+)$", ""), "Client: $1"],[new RegExp("^기간: (.+)$", ""), "Period: $1"],[new RegExp("^집계: 완료 (\\d+)건 · 총 ([^·]+) · 근거 링크 (\\d+)개 · 증빙률 (\\d+)%$", ""), "Totals: $1 done · $2 total · $3 evidence links · $4% proof rate"],[new RegExp("^· 총 ([^·]+) ·$", ""), "· total $1 ·"],[new RegExp("^저장됨 (\\d{1,2}:\\d{2})$", ""), "Saved $1"],[new RegExp("^저장 (\\d{4}\\.\\d{1,2}\\.\\d{1,2})$", ""), "Saved $1"],[new RegExp("^완료 (\\d+)건$", ""), "$1 done"],[new RegExp("^소요 ([\\d.]+h)$", ""), "Hours $1"],[new RegExp("^근거 (\\d+)개$", ""), "$1 links"],[new RegExp("^(\\d+)건 · ([\\d.]+h)$", ""), "$1 items · $2"],[new RegExp("^([\\d.]+h) 완료$", ""), "$1 done"],[new RegExp("^([\\d.]+h) 진행$", ""), "$1 in progress"],[new RegExp("^전기간 대비 ([+\\-][\\d.]+%) \\(지난 기간 ([\\d.]+h)\\)$", ""), "vs last period $1 (last period $2)"],[new RegExp("^(.+) 링크로 들어갑니다$", ""), "Opens the $1 link"],[new RegExp("^“(.+)” 항목 삭제$", ""), "Delete the item “$1”"],[new RegExp("^요청 · (.+)$", ""), "Request · $1"],[new RegExp("^저장 안 됨(.+)$", ""), "Not saved$1"]];

  /* ── V2: 로고 업로드 · 증빙 캡처 · 리포트 다이어그램 · API 연결 테스트 ── */
  var V2 = {
    "증빙 캡처": "Evidence captures",
    "캡처 추가": "Add capture",
    "캡처 삭제": "Delete capture",
    "작업 캡처": "Work capture",
    "사진을 끌어다 놓거나 눌러서 추가 · 최대 3장": "Drop a screenshot here or press to add · up to 3",
    "캡처를 압축하는 중…": "Compressing captures…",
    "이미지 파일만 붙일 수 있습니다.": "Only image files can be attached.",
    "항목당 캡처는 3장까지입니다.": "Up to 3 captures per item.",
    "이미지 저장 공간이 부족합니다. 오래된 캡처를 지우고 다시 해 보세요.": "Image storage is full. Delete older captures and try again.",
    "캡처를 삭제했습니다.": "Capture deleted.",
    "이 브라우저에서 읽을 수 없는 이미지입니다(PNG · JPG · WEBP · SVG).": "This browser cannot read that image (PNG · JPG · WEBP · SVG).",
    "이미지를 줄이지 못했습니다. 다른 파일을 써 보세요.": "Could not resize the image. Try another file.",
    "SVG 파일이 너무 큽니다(1.2MB 이하만 됩니다).": "That SVG is too big (1.2MB max).",
    "PNG · JPG · WEBP · SVG 이미지만 올릴 수 있습니다.": "Only PNG · JPG · WEBP · SVG images can be uploaded.",
    "파일이 너무 큽니다(8MB까지).": "That file is too big (8MB max).",
    "로고를 준비하는 중…": "Preparing the logo…",
    "로고를 넣었습니다. 리포트 · PDF · 공유 링크에 함께 나갑니다.": "Logo added. It goes out in the report, the PDF and the share link.",
    "로고 이미지를 지웠습니다. 로고 텍스트로 표시됩니다.": "Logo image removed. The logo text is shown instead.",
    "업로드한 로고 사용 중": "Using the uploaded logo",
    "삭제하면 로고 텍스트로 돌아갑니다. 브랜드를 바꾸면 새 로고로 다시 그립니다.": "Deleting it returns to the logo text. A new logo is drawn on the next brand change.",
    "로고 텍스트로 표시 중": "Showing the logo text",
    "이미지를 끌어다 놓거나 파일을 고르세요. 큰 파일은 자동으로 줄여 저장합니다.": "Drop an image or choose a file. Large files are scaled down automatically.",
    "회사 로고 이미지": "Company logo image",
    "이미지 선택": "Choose image",
    "로고는 리포트 머리말·A4 PDF·공유 링크에 그대로 들어갑니다. SVG 는 안전한 래스터(PNG/WEBP)로 바꿔 저장합니다.": "The logo appears in the report header, the A4 PDF and the share link. SVG is converted to a safe raster (PNG/WEBP).",
    "카테고리별 투입 시간": "Hours by category",
    "카테고리별 항목 수": "Items by category",
    "카테고리별 투입 시간 도넛 차트": "Donut chart of hours by category",
    "카테고리별 항목 수 도넛 차트": "Donut chart of items by category",
    "작업 상태 진행률": "Work status progress",
    "총 소요": "Total",
    "완료·진행": "Done + doing",
    "건": "items",
    "다음 계획": "Next",
    "API 연결 테스트": "API connection test",
    "검증됨": "Verified",
    "미검증": "Not verified",
    "확인 중": "Checking",
    "키 설정 열기": "Open key settings",
    "Pro 연결됨": "Pro connected",
    "· API 연결": "· API connection",
    "아직 연결을 확인하지 않았습니다. 테스트를 눌러 실제 응답을 확인하세요.": "Not tested yet. Press the test to check a real response.",
    "실제 제공자에게 짧은 요청 1회(약 1토큰)를 보내 200 응답이 올 때만 “검증됨”으로 표시합니다. 요금은 각 API 계정에 청구됩니다.": "Sends one tiny request (about 1 token) to the provider and marks “Verified” only on a 200 response. Your own API account is billed.",
    "API 키를 연결하면 여기에 모델이 표시됩니다": "Connect an API key and the model appears here",
    "아직 연결된 키가 없습니다. 무료 모드로도 리포트는 그대로 동작합니다.": "No key is connected. The report works the same in free mode.",
    "키는 저장됐지만 실제 응답을 아직 확인하지 않았습니다. 테스트를 눌러 주세요.": "The key is saved but no real response has been checked yet. Press the test.",
    "실제 요청을 보내 200 응답을 기다리는 중…": "Sending a real request and waiting for a 200…",
    "연결 엔진을 불러오지 못했습니다. 새로고침해 주세요.": "The connection engine did not load. Refresh the page.",
    "먼저 API 키를 저장하세요. 설정 창을 엽니다.": "Save an API key first. Opening the settings.",
    "연결 확인 중 오류가 났습니다.": "Something went wrong while checking the connection.",
    "정상 작동 확인됨": "Connection verified",
    "마지막 확인": "Last checked",
    "연결에 실패했습니다.": "Connection failed.",
    "마지막 확인에서 실패했습니다.": "The last check failed.",
    "무료 모드입니다. 키를 저장한 뒤 [연결 테스트]를 누르면 실제 응답으로 확인합니다.": "Free mode. Save a key and press Connection test to check a real response.",
    "키는 저장됐지만 실제 응답을 아직 확인하지 않았습니다. [연결 테스트]를 눌러 주세요.": "The key is saved but no real response has been checked yet. Press Connection test.",
    "키는 저장됐지만 아직 실제 응답을 확인하지 않았습니다. [연결 테스트]를 눌러 주세요.": "The key is saved but no real response has been checked yet. Press Connection test.",
    "연결을 확인하는 중…": "Checking the connection…",
    "연결된 키가 없습니다. 먼저 API 키를 저장하세요.": "No key is connected. Save an API key first.",
    "키가 비어 있거나 너무 짧습니다.": "The key is empty or too short.",
    "네트워크에서 막혔습니다. 인터넷·방화벽·CORS를 확인하세요.": "Blocked at the network. Check the internet, firewall and CORS.",
    "응답을 해석하지 못했습니다. 모델·서버 응답 형식을 확인하세요.": "Could not read the response. Check the model and the server response format.",
    "키를 삭제했습니다. 무료 모드로 돌아갑니다.": "Key deleted. Back to free mode.",
    "🔌 API 연결 테스트": "🔌 API connection test",
    "연결 테스트": "Connection test",
    "OpenAI는 브라우저에서 직접 호출하면 CORS로 막힙니다. 키가 맞아도 이 화면에서는 실패할 수 있으니 Google Gemini 키를 쓰거나 자체 API 서버(프록시)를 연결하세요.": "OpenAI blocks direct browser calls with CORS. A correct key can still fail here — use a Google Gemini key or connect your own API server (proxy)."
  };

  PATTERNS.push(
    [new RegExp("^정상 작동 확인됨 \\((.+)\\)$", ""), "Connection verified ($1)"],
    [new RegExp("^요청이 거부되었습니다 \\(HTTP (\\d+)\\)\\. 키 형식이나 모델 이름을 확인해 주세요\\.$", ""), "Request rejected (HTTP $1). Check the key format or the model name."],
    [new RegExp("^키가 거부되었습니다 \\(HTTP (\\d+)\\)\\. 키를 다시 확인하거나 새로 발급해 주세요\\.$", ""), "Key rejected (HTTP $1). Re-check the key or issue a new one."],
    [new RegExp("^모델을 찾을 수 없습니다 \\(HTTP (\\d+)\\)\\. 모델 이름을 확인해 주세요\\.$", ""), "Model not found (HTTP $1). Check the model name."],
    [new RegExp("^한도를 초과했습니다 \\(HTTP (\\d+)\\)\\. 잠시 후 다시 시도하거나 결제·쿼터를 확인하세요\\.$", ""), "Rate limit reached (HTTP $1). Try again shortly or check billing and quota."],
    [new RegExp("^제공자 서버 오류입니다 \\(HTTP (\\d+)\\)\\. 잠시 후 다시 시도해 주세요\\.$", ""), "Provider server error (HTTP $1). Try again shortly."],
    [new RegExp("^응답이 없습니다\\(\\d+초 초과\\)\\. 네트워크를 확인하고 다시 시도하세요\\.$", ""), "No response (timed out). Check the network and try again."],
    [new RegExp("^연결에 실패했습니다 \\(HTTP (\\d+)\\)\\.$", ""), "Connection failed (HTTP $1)."],
    [new RegExp("^저장했습니다\\. (.+) 로 연결됐습니다\\. \\[연결 테스트\\]로 실제 응답을 확인하세요\\.$", ""), "Saved. Connected to $1. Press Connection test to verify a real response."],
    [new RegExp("^마지막 확인 (\\d{1,2}:\\d{2})$", ""), "Last checked $1"],
    [new RegExp("^(.+) 연결됨 · (검증됨|미검증|오류) · 클릭해서 테스트/관리$", ""), "$1 connected · $2 · click to test or manage"],
    [new RegExp("^Pro 연결됨: (.+) · (검증됨|미검증|오류)\\. 설정과 연결 테스트 열기$", ""), "Pro connected: $1 · $2. Open settings and the connection test"],
    [new RegExp("^“(.+)” 예시를 채웠습니다\\. 그대로 공유 링크를 만들어 보세요\\.$", ""), "“$1” sample filled. Build a share link from it as it is."],
    [new RegExp("^캡처 (\\d+)장을 추가했습니다 \\((.+)\\)$", ""), "$1 captures added ($2)"],
    [new RegExp("^증빙 캡처 (\\d+)장이 이 미리보기와 A4 PDF에 나옵니다\\. 공유 링크는 길이 제한 때문에 캡처가 빠질 수 있으니, 이미지는 PDF로 보내는 게 확실합니다\\.$", ""), "$1 evidence captures appear in this preview and the A4 PDF. A share link may drop them for length, so the PDF is the safe way to send images."]
  );

  var DICT = {};
  var k;
  for (k in COMMON) if (Object.prototype.hasOwnProperty.call(COMMON, k)) DICT[k] = COMMON[k];
  for (k in APP) if (Object.prototype.hasOwnProperty.call(APP, k)) DICT[k] = APP[k];
  for (k in V2) if (Object.prototype.hasOwnProperty.call(V2, k)) DICT[k] = V2[k];

  var HANGUL = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7A3]/;
  var SKIP_TAG = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, CODE: 1, SVG: 1 };
  var ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];
  var state = { lang: 'ko' };
  var records = [];
  var missing = {};
  var missingList = [];
  var observer = null;

  /* ---------- language ---------- */
  function detect() {
    try {
      var q = new URLSearchParams(root.location.search).get('lang');
      if (q === 'ko' || q === 'en') return q;
    } catch (e) { /* very old browser */ }
    try {
      var saved = root.localStorage.getItem(LANG_KEY);
      if (saved === 'ko' || saved === 'en') return saved;
    } catch (e) { /* private mode */ }
    var nav = root.navigator.language || root.navigator.userLanguage || 'ko';
    return /^ko/i.test(nav) ? 'ko' : 'en';
  }

  /* ---------- lookup ---------- */
  function report(text) {
    if (missing[text]) return;
    missing[text] = 1;
    missingList.push(text);
    if (root.console && console.warn) console.warn('I18N_MISS: ' + text);
  }

  /* Pattern with capture translation: captures that still hold Korean are looked up too. */
  function applyPattern(core, p) {
    if (!p[0].test(core)) return null;
    var m = p[0].exec(core);
    var caps = [], i, ok = true;
    for (i = 1; i < m.length; i++) {
      var c = m[i];
      if (c == null) { caps[i] = ''; continue; }
      if (HANGUL.test(c)) {
        var t = lookupSmall(c.trim());
        if (t == null) { ok = false; caps[i] = c; } else { caps[i] = t; }
      } else { caps[i] = c; }
    }
    var out = p[1].replace(/\$(\d+)/g, function (all, n) { return caps[+n] != null ? caps[+n] : all; });
    if (!ok || HANGUL.test(out)) return null;
    return out;
  }

  function tr(raw) {
    if (typeof raw !== 'string' || !HANGUL.test(raw)) return raw;
    var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(raw);
    var lead = m[1], core = m[2], tail = m[3];
    if (!core) return raw;
    var hit = DICT[core];
    if (hit == null && /\s{2,}|\n/.test(core)) hit = DICT[core.replace(/\s+/g, ' ').trim()];
    if (hit != null) return lead + hit + tail;

    /* Korean date: 2026년 11월 27일 -> November 27, 2026 */
    var dt = /^(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일$/.exec(core);
    if (dt) {
      var MO = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      var mm = parseInt(dt[2], 10);
      if (mm >= 1 && mm <= 12) return lead + MO[mm - 1] + ' ' + parseInt(dt[3], 10) + ', ' + dt[1] + tail;
    }

    /* money in Korean format: 81만 원 / 2,980,750원  ->  {0} template */
    var money = takeMoney(core);
    if (money.map.length) {
      var tpl = money.text;
      var th = DICT[tpl];
      if (th == null && /\s{2,}|\n/.test(tpl)) th = DICT[tpl.replace(/\s+/g, ' ').trim()];
      if (th == null && /^\{0\}$/.test(tpl.trim())) th = '{0}';
      if (th != null) return lead + putMoney(th, money.map) + tail;
      for (var mi = 0; mi < PATTERNS.length; mi++) {
        var mo = applyPattern(tpl, PATTERNS[mi]);
        if (mo != null) return lead + putMoney(mo, money.map) + tail;
      }
    }
    for (var i = 0; i < PATTERNS.length; i++) {
      var pout = applyPattern(core, PATTERNS[i]);
      if (pout != null) return lead + pout + tail;
    }
    var seg = trSegments(core);
    if (seg != null) return lead + seg + tail;
    report(core);
    return raw;
  }


  /* Korean money -> token template; values are formatted as ₩1,234,567 */
  function won(n) { return '₩' + n.toLocaleString('en-US'); }
  function takeMoney(core) {
    var map = [];
    var out = core.replace(/([\d,]+)\s*만(?:\s*([\d,]+))?\s*원/g, function (all, a, b) {
      var n = parseInt(a.replace(/,/g, ''), 10) * 10000 + (b ? parseInt(b.replace(/,/g, ''), 10) : 0);
      map.push(won(n));
      return '{' + (map.length - 1) + '}';
    });
    out = out.replace(/([+\-]?[\d,]+)\s*원/g, function (all, a) {
      map.push('₩' + a);
      return '{' + (map.length - 1) + '}';
    });
    return { text: out, map: map };
  }
  function putMoney(s, map) {
    return s.replace(/\{(\d+)\}/g, function (all, i) { return map[+i] != null ? map[+i] : all; });
  }

  /* A small unit: dictionary hit or pattern hit, no whitespace trimming. */
  function lookupSmall(unit) {
    var hit = DICT[unit];
    if (hit != null) return hit;
    for (var i = 0; i < PATTERNS.length; i++) {
      var pout = applyPattern(unit, PATTERNS[i]);
      if (pout != null) return pout;
    }
    return null;
  }

  function trPipe(line) {
    var parts = line.split(/\s*\|\s*/);
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      var t = lookupSmall(parts[i].trim());
      if (t == null) return null;
      out.push(t);
    }
    return out.join(' | ');
  }

  function trSegments(core) {
    if (core.indexOf('\n') > -1) {
      var lines = core.split('\n');
      var out = [];
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (!line.trim()) { out.push(line); continue; }
        var t = line.indexOf('|') > -1 ? trPipe(line) : lookupSmall(line.trim());
        if (t == null) { if (root.__I18N_DEBUG) (root.__I18N_SEGFAIL = root.__I18N_SEGFAIL || []).push(line); return null; }
        out.push(t);
      }
      return out.join('\n');
    }
    if (core.indexOf('|') > -1) return trPipe(core);
    return null;
  }

  /* ---------- DOM walking ---------- */
  function skipped(el) {
    while (el) {
      if (el.nodeType === 1) {
        if (SKIP_TAG[el.tagName]) return true;
        if (el.getAttribute && (el.hasAttribute('data-i18n-skip') || el.getAttribute('contenteditable') === 'true')) return true;
        if (el.classList && el.classList.contains('onetap-lang')) return true;
      }
      el = el.parentNode;
    }
    return false;
  }

  function trText(node) {
    var v = node.nodeValue;
    if (!v || !HANGUL.test(v)) return;
    var out = tr(v);
    if (out !== v) {
      records.push({ n: node, v: v });
      node.nodeValue = out;
    }
  }

  function trAttrs(el) {
    var i, at, v, out;
    for (i = 0; i < ATTRS.length; i++) {
      at = ATTRS[i];
      if (!el.hasAttribute(at)) continue;
      v = el.getAttribute(at);
      if (!v || !HANGUL.test(v)) continue;
      out = tr(v);
      if (out !== v) {
        records.push({ e: el, a: at, v: v });
        el.setAttribute(at, out);
      }
    }
    if (el.tagName === 'INPUT' && el.hasAttribute('value') && el.type !== 'checkbox' && el.type !== 'radio' && el.type !== 'hidden') {
      v = el.getAttribute('value');
      if (v && HANGUL.test(v)) {
        out = tr(v);
        if (out !== v) {
          records.push({ e: el, a: 'value', v: v });
          el.setAttribute('value', out);
          if (el.value === v) el.value = out;
        }
      }
    }
    if (el.tagName === 'INPUT') {
      var ty = (el.type || '').toLowerCase();
      if (ty === 'button' || ty === 'submit' || ty === 'reset') {
        v = el.value;
        if (v && HANGUL.test(v)) {
          out = tr(v);
          if (out !== v) { records.push({ e: el, a: 'value', v: v }); el.value = out; }
        }
      }
    }
  }

  function walk(node) {
    if (node.nodeType === 3) { trText(node); return; }
    if (node.nodeType !== 1) return;
    if (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE' && node.tagName !== 'SVG' &&
        !(node.classList && node.classList.contains('onetap-lang'))) trAttrs(node);
    if (skipped(node)) return;
    if (node.tagName === 'META') return;
    for (var c = node.firstChild; c; c = c.nextSibling) walk(c);
  }

  function trMeta() {
    var list = doc.querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[name="twitter:title"], meta[name="twitter:description"]');
    for (var i = 0; i < list.length; i++) {
      var el = list[i], v = el.getAttribute('content');
      if (v && HANGUL.test(v)) {
        var out = tr(v);
        if (out !== v) { records.push({ e: el, a: 'content', v: v }); el.setAttribute('content', out); }
      }
    }
  }

  function trJsonLd() {
    var list = doc.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      try {
        var data = JSON.parse(el.textContent);
        var changed = fixJson(data);
        if (changed) el.textContent = JSON.stringify(data);
      } catch (e) { /* leave as is */ }
    }
  }

  function fixJson(o) {
    var changed = false, i;
    if (Array.isArray(o)) {
      for (i = 0; i < o.length; i++) if (fixJson(o[i])) changed = true;
      return changed;
    }
    if (!o || typeof o !== 'object') return false;
    for (var key in o) {
      if (!Object.prototype.hasOwnProperty.call(o, key)) continue;
      var v = o[key];
      if (typeof v === 'string' && HANGUL.test(v)) {
        var out = DICT[v.trim()];
        if (out != null) { o[key] = out; changed = true; }
      } else if (v && typeof v === 'object') {
        if (fixJson(v)) changed = true;
      }
    }
    return changed;
  }

  /* ---------- apply / restore ---------- */
  function trFieldValues() {
    var list = doc.querySelectorAll('input, textarea');
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      var ty = (el.type || 'text').toLowerCase();
      if (ty === 'checkbox' || ty === 'radio' || ty === 'hidden' || ty === 'file' || ty === 'date' || ty === 'number') continue;
      if (el === doc.activeElement) continue;
      var v = el.value;
      if (!v || !HANGUL.test(v)) continue;
      var out = tr(v);
      if (out !== v) { records.push({ e: el, a: 'prop:value', v: v }); el.value = out; }
    }
  }

  function applyEn() {
    var title = root.__onetapTitle || (root.__onetapTitle = doc.title);
    walk(doc.body);
    trFieldValues();
    trMeta();
    trJsonLd();
    doc.documentElement.lang = 'en';
    var t = DICT[title] || DICT[title.trim()];
    doc.title = t || title;
  }

  function restoreKo() {
    for (var i = records.length - 1; i >= 0; i--) {
      var r = records[i];
      if (r.n) { if (r.n.nodeValue !== r.v) r.n.nodeValue = r.v; }
      else if (r.e) {
        if (r.a === 'value' || r.a === 'prop:value') { if (r.e.value !== r.v) r.e.value = r.v; }
        else if (r.e.getAttribute(r.a) !== r.v) r.e.setAttribute(r.a, r.v);
      }
    }
    var title = root.__onetapTitle;
    if (title) doc.title = title;
    doc.documentElement.lang = 'ko';
  }

  /* ---------- language switch UI ---------- */
  function buildSwitch() {
    var wrap = doc.createElement('div');
    wrap.className = 'onetap-lang';
    wrap.setAttribute('role', 'group');
    wrap.innerHTML = '<button type="button" data-onetap-lang="ko" aria-pressed="true">KO</button>' +
      '<button type="button" data-onetap-lang="en" aria-pressed="false">EN</button>';
    var box = doc.querySelector('.top-actions') || doc.querySelector('.topbar__inner') ||
      doc.querySelector('.topbar-inner') || doc.querySelector('.topbar-in') ||
      doc.querySelector('.topbar') || doc.querySelector('header');
    if (box) {
      if (box.classList.contains('top-actions')) box.insertBefore(wrap, box.firstChild);
      else {
        var act = box.querySelector('.top-actions');
        if (act) box.insertBefore(wrap, act); else box.appendChild(wrap);
      }
    } else {
      wrap.style.cssText = 'position:fixed;top:10px;right:10px;z-index:99999;background:rgba(255,255,255,.9);color:#111';
      doc.body.appendChild(wrap);
    }
    wrap.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-onetap-lang]');
      if (!b) return;
      setLang(b.getAttribute('data-onetap-lang'));
    });
    return wrap;
  }

  var CSS = '.onetap-lang{display:inline-flex;flex:none;align-items:center;padding:2px;border:1px solid currentColor;border-radius:999px;opacity:.72;transition:opacity .15s;vertical-align:middle;align-self:center}' +
    '.onetap-lang:hover,.onetap-lang:focus-within{opacity:1}' +
    '.onetap-lang button{appearance:none;-webkit-appearance:none;border:0;background:transparent;color:inherit;font:inherit;font-size:10.5px;font-weight:700;letter-spacing:.04em;line-height:1;padding:5px 6px;border-radius:999px;cursor:pointer;min-width:26px;text-align:center}' +
    '.onetap-lang button[aria-pressed="true"]{background:rgba(128,128,128,.3)}' +
    '@media (max-width:520px){.onetap-lang button{padding:4px 4px;font-size:10px;min-width:22px}.onetap-lang{margin-left:2px}}';

  function injectCss() {
    var s = doc.createElement('style');
    s.id = 'onetap-lang-css';
    s.textContent = CSS;
    (doc.head || doc.documentElement).appendChild(s);
  }

  function paintSwitch() {
    var bs = doc.querySelectorAll('[data-onetap-lang]');
    for (var i = 0; i < bs.length; i++) {
      bs[i].setAttribute('aria-pressed', bs[i].getAttribute('data-onetap-lang') === state.lang ? 'true' : 'false');
    }
    var wrap = doc.querySelector('.onetap-lang');
    if (wrap) wrap.setAttribute('aria-label', state.lang === 'ko' ? '언어' : 'Language');
  }

  /* ---------- observe ---------- */
  function startObserver() {
    if (observer || !root.MutationObserver) return;
    observer = new MutationObserver(function (muts) {
      if (state.lang !== 'en') return;
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        if (m.type === 'characterData') { trText(m.target); continue; }
        if (m.type === 'attributes') { if (m.target.nodeType === 1 && !skipped(m.target)) trAttrs(m.target); continue; }
        for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]);
      }
    });
    observer.observe(doc.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'aria-label', 'title', 'alt'] });
  }

  function setLang(lang) {
    state.lang = lang === 'en' ? 'en' : 'ko';
    try { root.localStorage.setItem(LANG_KEY, state.lang); } catch (e) { /* private mode */ }
    if (state.lang === 'en') {
      applyEn();
      startObserver();
    } else {
      if (observer) { observer.disconnect(); observer = null; }
      restoreKo();
    }
    paintSwitch();
    try { doc.dispatchEvent(new CustomEvent('onetap:lang', { detail: { lang: state.lang } })); } catch (e) { /* old */ }
  }

  function boot() {
    injectCss();
    buildSwitch();
    state.lang = detect();
    if (state.lang === 'en') {
      applyEn();
      startObserver();
    } else {
      doc.documentElement.lang = 'ko';
    }
    paintSwitch();
    root.ONETAP_I18N = {
      lang: function () { return state.lang; },
      setLang: setLang,
      t: tr,
      missing: function () { return missingList.slice(); },
      dict: DICT
    };
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window, document);
