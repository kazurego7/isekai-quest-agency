const STORAGE_KEY = "isekai-quest-prototype";

const seedState = {
  requests: [
    {
      id: "req-seed-001",
      title: "討伐 / 湿地帯の魔蛇",
      status: "確認前",
      agreement: { requesterAgreed: true, receptionistAgreed: false },
      fields: {
        "依頼タイトル": "討伐 / 湿地帯の魔蛇",
        "目的・背景": "湿地帯に出現する魔蛇の討伐。周辺村の安全確保。",
        場所: "南方の湿地帯 / 沼地入口で合流",
        完了期限: "緊急: 3日以内に対応",
        "危険度・同行条件": "同行3名、毒耐性装備必須",
        "報酬上限額": "120,000G",
        備考: "受付が合意・整形後にクエスト化する。",
      },
      notes: "受付が確認中。クエスト化の準備を進める状態です。",
      createdAt: "seed",
    },
  ],
  quests: [],
};

const defaultQuestChecklist = [
  { label: "成果物の準備", note: "提出物を整理する", checked: false },
  { label: "現地記録のメモ", note: "座標や写真の確認", checked: false },
  { label: "依頼者への引き渡し準備", note: "報告内容の整備", checked: false },
];

function isBrowser() {
  return typeof window !== "undefined";
}

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

export function getPrototypeState() {
  if (!isBrowser()) return seedState;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return seedState;
  try {
    return JSON.parse(raw);
  } catch {
    return seedState;
  }
}

export function setPrototypeState(state) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function ensurePrototypeState() {
  if (!isBrowser()) return seedState;
  const current = getPrototypeState();
  if (!window.localStorage.getItem(STORAGE_KEY)) {
    setPrototypeState(current);
  }
  return current;
}

export function updatePrototypeState(updater) {
  const current = ensurePrototypeState();
  const next = updater(cloneState(current));
  setPrototypeState(next);
  return next;
}

function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createRequest(payload) {
  return updatePrototypeState((state) => {
    const id = createId("req");
    const request = {
      id,
      title: payload.title,
      status: "確認前",
      agreement: { requesterAgreed: true, receptionistAgreed: false },
      fields: payload.fields,
      notes: "受付が確認中。クエスト化の準備を進める状態です。",
      createdAt: new Date().toISOString(),
    };
    state.requests.unshift(request);
    return state;
  });
}

export function questifyRequest({ requestId, publishFields }) {
  return updatePrototypeState((state) => {
    const request = state.requests.find((item) => item.id === requestId);
    if (!request) return state;
    request.status = "クエスト化済み";
    request.notes = "クエスト化が完了し、冒険者の募集を開始しました。";
    const questId = createId("qst").toUpperCase();
    const quest = {
      id: questId,
      requestId,
      title: request.title,
      status: "募集中",
      reward: request.fields["報酬上限額"] ?? "未設定",
      slots: publishFields.slots ?? "未設定",
      rank: publishFields.rank ?? "未設定",
      detail: publishFields.detail ?? "詳細は受付で確認",
      deliverables: publishFields.deliverables ?? "成果物の記載なし",
      supplies: publishFields.supplies ?? "支給物なし",
      mapNotes: publishFields.mapNotes ?? "注意事項なし",
      risk: request.fields["危険度・同行条件"] ?? "不明",
      channel: publishFields.channel ?? "ギルドチャット",
      summary: "受付がクエスト票を作成済み。募集中。",
      checklist: defaultQuestChecklist,
      photos: [],
      reportComment: "",
    };
    state.quests.unshift(quest);
    return state;
  });
}

export function acceptQuest(questId) {
  return updatePrototypeState((state) => {
    const quest = state.quests.find((item) => item.id === questId);
    if (!quest) return state;
    quest.status = "受注済み";
    const request = state.requests.find((item) => item.id === quest.requestId);
    if (request) {
      request.status = "受注済み";
      request.notes = "冒険者が受注しました。進行状況の更新を待っています。";
    }
    return state;
  });
}

export function submitQuestReport(questId, reportComment) {
  return updatePrototypeState((state) => {
    const quest = state.quests.find((item) => item.id === questId);
    if (!quest) return state;
    quest.status = "完了報告済み";
    quest.reportComment = reportComment?.comment ?? reportComment ?? "成果報告が登録されました。";
    if (reportComment?.checklist) {
      quest.checklist = reportComment.checklist;
    }
    if (reportComment?.photos) {
      quest.photos = reportComment.photos;
    }
    quest.summary = "完了報告が提出済み。受付の確認待ち。";
    return state;
  });
}

export function updateRequestAdjustment(requestId, nextFields, note, actorRole) {
  return updatePrototypeState((state) => {
    const request = state.requests.find((item) => item.id === requestId);
    if (!request) return state;
    request.fields = { ...request.fields, ...nextFields };
    request.status = "合意待ち";
    request.notes = note ?? "調整案が届きました。相手の合意待ちです。";
    request.agreement = {
      requesterAgreed: actorRole === "requester",
      receptionistAgreed: actorRole === "reception",
    };
    return state;
  });
}

export function updateRequestAgreement(requestId, actorRole) {
  return updatePrototypeState((state) => {
    const request = state.requests.find((item) => item.id === requestId);
    if (!request) return state;
    const current = request.agreement ?? { requesterAgreed: false, receptionistAgreed: false };
    const nextAgreement = {
      requesterAgreed: actorRole === "requester" ? true : current.requesterAgreed,
      receptionistAgreed: actorRole === "reception" ? true : current.receptionistAgreed,
    };
    request.agreement = nextAgreement;
    if (nextAgreement.requesterAgreed && nextAgreement.receptionistAgreed) {
      request.status = "合意済み";
      request.notes = "依頼内容は合意済みです。受付のクエスト化を待っています。";
    } else {
      request.status = "合意待ち";
      request.notes = "相手の合意待ちです。";
    }
    return state;
  });
}

export function verifyQuestCompletion(questId) {
  return updatePrototypeState((state) => {
    const quest = state.quests.find((item) => item.id === questId);
    if (!quest) return state;
    quest.status = "達成確認済み";
    quest.summary = "受付の達成確認が完了。履歴に保存。";
    const request = state.requests.find((item) => item.id === quest.requestId);
    if (request) {
      request.status = "完了";
      request.notes = "完了済み。履歴として参照できます。";
    }
    return state;
  });
}
