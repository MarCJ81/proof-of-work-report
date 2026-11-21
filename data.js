/* ============================================================
   작업 증빙 리포트 스튜디오 · data.js  v1.0.0
   ------------------------------------------------------------
   업종 프리셋 3종, 거친 메모 예시, 새 창 열기 주소.
   모든 이름·회사·주소는 데모용 가명이다(김민수 / 주식회사 온빛 / example.com).
   실제 인물·회사·연락처를 넣지 않는다.
   ============================================================ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(root);
  else root.POWData = factory(root);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  var GITHUB = 'https://github.com/example/onbit-reservation/pull/';
  var FIGMA = 'https://www.figma.com/file/example-onbit-brand';
  var NOTION = 'https://www.notion.so/example-onbit-weekly';
  var SHEET = 'https://docs.google.com/spreadsheets/d/example-onbit-rank/edit';
  var DOCS = 'https://docs.google.com/document/d/example-onbit-report/edit';
  var DRIVE = 'https://drive.google.com/file/d/example-onbit-guide/view';

  var PRESETS = [
    {
      id: 'marketing',
      label: '마케팅·블로그 대행',
      short: '마케팅',
      desc: '원고 12편 · 카드뉴스 · 순위 모니터링',
      icon: 'pen',
      state: {
        project: '온빛 브랜드 블로그 월간 운영',
        client: '주식회사 온빛',
        days: 'lastWeek',
        summary: '이번 주는 블로그 원고 12편을 마감하고 카드뉴스 4종을 발행했습니다. 신규 상위 노출 키워드 3개가 잡혔고, 다음 주는 12월 캘린더 확정과 제품 사진 반영이 남았습니다.',
        compare: { prevHours: 42 },
        items: [
          {
            title: '11월 콘텐츠 캘린더·키워드 리서치 확정',
            hours: 5, category: 'content', status: 'done', evidence: NOTION,
            memo: '경쟁사 6곳의 상위 글을 키워드별로 나눠 보고, 11월 4주 캘린더를 확정했습니다. 새로 잡은 키워드는 “겨울 가습 관리”, “사무실 공기청정”, “반려동물 환기” 3개입니다.'
          },
          {
            title: '블로그 원고 12편 작성·교정',
            hours: 26, category: 'content', status: 'done', evidence: SHEET,
            memo: '12편 중 9편은 내부 검수까지 끝났고 3편은 클라이언트 확인만 남았습니다. 원고 목록과 교정 이력은 시트에 정리해 두었습니다.'
          },
          {
            title: '네이버 상위 노출 모니터링·순위표 갱신',
            hours: 4, category: 'ops', status: 'done', evidence: SHEET,
            memo: '주요 10개 키워드를 3회 측정해 순위표를 갱신했습니다. 3개 키워드가 1페이지에 새로 들어왔습니다.'
          },
          {
            title: '인스타그램 카드뉴스 4종 제작·발행',
            hours: 9, category: 'design', status: 'done', evidence: FIGMA,
            memo: '가습기 사용 팁을 4장 카드로 만들었습니다. 템플릿을 재사용할 수 있게 피그마 컴포넌트로 정리했습니다.'
          },
          {
            title: '주간 성과 리포트 작성·공유',
            hours: 3, category: 'ops', status: 'done', evidence: DOCS,
            memo: '방문자·체류시간·유입 키워드를 지난주와 비교해 한 장으로 정리했습니다.'
          },
          {
            title: '12월 콘텐츠 캘린더 초안',
            hours: 4, category: 'content', status: 'doing', evidence: NOTION,
            memo: '12월 1~2주차 12편의 제목과 키워드를 잡았습니다. 3~4주차는 신제품 출시일에 맞춰 조정 중입니다.'
          },
          {
            title: '신제품 사진 반영한 상세 페이지 카피 3종',
            hours: 0, category: 'content', status: 'next', evidence: '',
            memo: '화요일까지 초안, 목요일까지 클라이언트 확인을 목표로 합니다.'
          },
          {
            title: '블로그 원고 12편 (12월 1주차)',
            hours: 0, category: 'content', status: 'next', evidence: '',
            memo: '캘린더 확정 후 바로 착수합니다.'
          },
          {
            title: '제품 사진 3종 미수령',
            hours: 0, category: 'etc', status: 'block', evidence: '',
            memo: '12월 1주차 원고 3편에 들어갈 제품 촬영본이 아직 없습니다.',
            ask: '온빛 담당자님이 촬영본 3종을 12월 2일까지 전달해 주시면 일정에 영향이 없습니다.'
          }
        ]
      }
    },
    {
      id: 'dev',
      label: '웹·앱 개발',
      short: '개발',
      desc: 'API · 관리자 화면 · QA · 배포',
      icon: 'code',
      state: {
        project: '온빛 예약 시스템 1차 개발',
        client: '주식회사 온빛',
        days: 'lastWeek',
        summary: '예약 API와 관리자 화면 5개를 완료했고, QA 이슈 12건을 정리했습니다. 결제 연동은 테스트 계정 승인 대기로 다음 주로 넘겼습니다.',
        compare: { prevHours: 38 },
        items: [
          {
            title: '예약 API 설계·구현 (생성·변경·취소)',
            hours: 18, category: 'dev', status: 'done', evidence: GITHUB + '12',
            memo: '예약 생성·변경·취소 3개 엔드포인트와 중복 예약 방지 로직을 넣었습니다. 리뷰에서 지적된 동시성 처리도 반영했습니다.'
          },
          {
            title: '관리자 화면 5개 퍼블리싱·연동',
            hours: 22, category: 'dev', status: 'done', evidence: FIGMA,
            memo: '예약 목록·상세·일정표·회원·설정 화면을 붙였습니다. 모바일 390px에서 표가 넘치던 문제도 수정했습니다.'
          },
          {
            title: 'QA 이슈 12건 수정',
            hours: 9, category: 'dev', status: 'done', evidence: GITHUB + '18',
            memo: '치명 2건, 보통 7건, 경미 3건을 모두 닫았습니다. 재현 조건과 수정 커밋은 이슈에 남겼습니다.'
          },
          {
            title: '스테이징 배포 자동화',
            hours: 5, category: 'ops', status: 'done', evidence: GITHUB + '20',
            memo: 'PR 머지 시 스테이징에 자동 배포되도록 워크플로를 만들었습니다. 배포 로그는 액션 화면에서 볼 수 있습니다.'
          },
          {
            title: '코드 리뷰·개발 문서 정리',
            hours: 4, category: 'ops', status: 'done', evidence: NOTION,
            memo: 'API 명세와 환경 변수 목록을 노션에 정리했습니다. 다음 작업자가 같은 자리에서 시작할 수 있습니다.'
          },
          {
            title: '알림톡 발송 연동',
            hours: 6, category: 'dev', status: 'doing', evidence: GITHUB + '24',
            memo: '예약 확정·하루 전 안내 두 가지 템플릿을 붙였습니다. 발송 실패 재시도는 아직 테스트 중입니다.'
          },
          {
            title: '결제 PG 테스트 결제 검증',
            hours: 0, category: 'dev', status: 'next', evidence: '',
            memo: '테스트 계정이 승인되면 바로 진행합니다.'
          },
          {
            title: '예약 변경·취소 플로우 점검',
            hours: 0, category: 'dev', status: 'next', evidence: '',
            memo: '관리자·사용자 양쪽 화면을 함께 확인합니다.'
          },
          {
            title: 'PG 사업자 심사 결과 대기',
            hours: 0, category: 'etc', status: 'block', evidence: '',
            memo: '심사가 끝나야 실제 결제 검증이 가능합니다.',
            ask: '심사 결과를 받는 대로 알려 주시면 그날 바로 테스트 결제를 진행하겠습니다.'
          }
        ]
      }
    },
    {
      id: 'design',
      label: '디자인·브랜딩',
      short: '디자인',
      desc: '로고 · 가이드 · 인쇄물 적용',
      icon: 'palette',
      state: {
        project: '온빛커피 리브랜딩 패키지',
        client: '온빛커피',
        days: 'lastWeek',
        summary: '로고 시안 5종과 컬러·타이포 가이드, 브랜드 가이드 PDF 24쪽을 마무리했습니다. 이번 주는 매장 사인물 3종 시안을 진행 중이고, 로고 최종안 선택이 남아 있습니다.',
        compare: { prevHours: 30 },
        items: [
          {
            title: '브랜드 무드보드 3안',
            hours: 6, category: 'design', status: 'done', evidence: FIGMA,
            memo: '매장 사진과 경쟁 브랜드 8곳을 모아 세 가지 방향으로 정리했습니다. 2안(따뜻한 종이 질감)이 채택되었습니다.'
          },
          {
            title: '로고 시안 5종·2차 수정',
            hours: 16, category: 'design', status: 'done', evidence: FIGMA,
            memo: '5종 중 2종을 2차까지 수정했습니다. 심볼 축소 시 형태가 뭉개지던 부분을 다시 그렸습니다.'
          },
          {
            title: '컬러·타이포 가이드',
            hours: 8, category: 'design', status: 'done', evidence: NOTION,
            memo: '주색 1개, 보조색 3개와 본문·제목 서체 조합을 정했습니다. 인쇄용 CMYK 값을 함께 적었습니다.'
          },
          {
            title: '명함·현수막 적용 시안',
            hours: 7, category: 'design', status: 'done', evidence: FIGMA,
            memo: '명함 앞뒤와 매장 현수막 2종에 로고를 적용해 실제 크기로 확인했습니다.'
          },
          {
            title: '브랜드 가이드 PDF 24쪽',
            hours: 10, category: 'design', status: 'done', evidence: DRIVE,
            memo: '로고 사용 규칙, 컬러, 서체, 사진 톤, 적용 예시를 24쪽으로 정리했습니다. 납품 파일과 같은 폴더에 있습니다.'
          },
          {
            title: '매장 사인물 3종 시안',
            hours: 5, category: 'design', status: 'doing', evidence: FIGMA,
            memo: '간판·메뉴판·출입문 스티커를 같은 규칙으로 잡고 있습니다. 시공 업체 도면을 받은 뒤 치수를 맞춥니다.'
          },
          {
            title: '패키지(컵·봉투) 적용',
            hours: 0, category: 'design', status: 'next', evidence: '',
            memo: '로고 최종안이 정해지면 바로 적용합니다.'
          },
          {
            title: '브랜드 가이드 최종 검수·납품 정리',
            hours: 0, category: 'design', status: 'next', evidence: '',
            memo: '인쇄용·웹용 파일을 나눠 전달합니다.'
          },
          {
            title: '로고 최종안 선택 미완',
            hours: 0, category: 'etc', status: 'block', evidence: '',
            memo: '2차 수정안 2종 중 선택이 필요합니다. 12월 인쇄 일정에 영향이 있습니다.',
            ask: '이번 주 금요일까지 최종안을 골라 주시면 12월 인쇄 일정을 지킬 수 있습니다.'
          }
        ]
      }
    }
  ];

  /* AI 브리지에 붙여 볼 거친 메모 예시 */
  var DEMO_MEMOS = [
    {
      id: 'memo-marketing',
      label: '마케팅 (블로그·카드뉴스)',
      text: '이번주 블로그 12개 썼고 카드뉴스 4개 올림. 키워드 3개 새로 잡힘. 12월 캘린더 만드는 중인데 제품사진이 없어서 3개는 못씀. 방문자는 지난주보다 조금 올랐음.'
    },
    {
      id: 'memo-dev',
      label: '개발 (API·화면)',
      text: '예약 API 3개 만듦. 관리자 화면 5개 붙임. QA 12건 다 고침. 스테이징 자동배포 됨. 알림톡 하는 중. 결제는 PG 심사 대기라 못함.'
    },
    {
      id: 'memo-design',
      label: '디자인 (로고·가이드)',
      text: '로고 5안 중 2안 2차 수정. 컬러 타이포 가이드 만듦. 명함 현수막 시안 함. 가이드 PDF 24장. 사인물 하는 중. 로고 최종 선택이 안됨. 12월 인쇄 걸림.'
    }
  ];

  /* 새 창 열기: 프롬프트를 주소로 넘길 수 있는 곳은 넘기고, 아니면 복사 후 열기 */
  var OPENERS = [
    { id: 'chatgpt', label: 'ChatGPT', url: 'https://chatgpt.com/?q=', prefill: true },
    { id: 'claude', label: 'Claude', url: 'https://claude.ai/new?q=', prefill: true },
    { id: 'gemini', label: 'Gemini', url: 'https://gemini.google.com/app', prefill: false }
  ];

  var TONES = [
    { id: 'plain', label: '담백하게', desc: '과장 없이 사실만' },
    { id: 'result', label: '성과 앞세우기', desc: '숫자는 입력에 있는 것만' },
    { id: 'short', label: '한 문장씩', desc: '바쁜 클라이언트용' }
  ];

  var BRAND_COLORS = ['#2f5bff', '#0c0d0f', '#1f3d7a', '#0e7a55', '#7a2e2e', '#6b4a1f'];

  function coreModule() {
    if (root && root.POWCore) return root.POWCore;
    if (typeof require === 'function') {
      try { return require('./core.js'); } catch (e) { return null; }
    }
    return null;
  }

  function expandPreset(preset, now) {
    if (!preset || !preset.state) return null;
    var C = coreModule();
    var src = JSON.parse(JSON.stringify(preset.state));
    var range = { start: '', end: '' };
    if (src.days === 'lastWeek' && C) range = C.previousWeekRange(now || new Date());
    delete src.days;
    var items = (src.items || []).map(function (it, i) {
      return {
        id: 'it_' + preset.id + '_' + i,
        title: it.title || '',
        hours: it.hours || 0,
        evidence: it.evidence || '',
        memo: it.memo || '',
        ask: it.ask || '',
        category: it.category || 'etc',
        status: it.status || 'done'
      };
    });
    return {
      id: 'rep_' + preset.id + '_' + Date.now().toString(36),
      project: src.project,
      client: src.client,
      start: range.start,
      end: range.end,
      summary: src.summary,
      compare: src.compare || { prevHours: null },
      items: items,
      brand: null,           /* 앱이 현재 브랜드 설정을 유지한다 */
      signature: null,
      updatedAt: ''
    };
  }

  return {
    PRESETS: PRESETS,
    DEMO_MEMOS: DEMO_MEMOS,
    OPENERS: OPENERS,
    TONES: TONES,
    BRAND_COLORS: BRAND_COLORS,
    expandPreset: expandPreset
  };
});
