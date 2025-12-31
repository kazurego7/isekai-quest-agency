import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>異</span>
          <div>
            <p className={styles.brandKicker}>Guild Ops Platform</p>
            <h2>異世界クエスト斡旋局</h2>
          </div>
        </div>
        <nav className={styles.nav}>
          <a href="#features">機能</a>
          <a href="#flows">フロー</a>
          <a href="#board">ボード</a>
          <a href="#reports">レポート</a>
        </nav>
        <button className={styles.navButton}>デモを予約</button>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.kicker}>Quest Operation Suite</p>
            <h1>依頼から報酬まで、ギルド運営を一画面で。</h1>
            <p className={styles.lead}>
              依頼者・受付嬢・冒険者・会計係の動きを同期し、
              クエストの進行・納品・支払いを見える化します。
            </p>
            <div className={styles.heroActions}>
              <button className={styles.primary}>体験フローを見る</button>
              <button className={styles.secondary}>機能一覧</button>
            </div>
            <div className={styles.heroStats}>
              <div>
                <span>稼働中クエスト</span>
                <strong>128</strong>
                <small>3日以内の完了見込み</small>
              </div>
              <div>
                <span>未処理依頼</span>
                <strong>24</strong>
                <small>受付嬢の確認待ち</small>
              </div>
              <div>
                <span>支払い待ち</span>
                <strong>9</strong>
                <small>素材査定完了済み</small>
              </div>
            </div>
          </div>
          <div className={styles.heroPanel}>
            <div className={styles.panelHeader}>
              <div>
                <p>今日のギルド状況</p>
                <span>第3支部 / 夜勤帯</span>
              </div>
              <span className={styles.status}>稼働中</span>
            </div>
            <ul className={styles.panelList}>
              <li>
                <span className={styles.tag}>緊急</span>
                魔獣討伐の補給申請が到着
              </li>
              <li>
                <span className={styles.tag}>新規</span>
                依頼票 5件が受理待ち
              </li>
              <li>
                <span className={styles.tag}>完了</span>
                納品3件の報酬承認済み
              </li>
            </ul>
            <div className={styles.panelFooter}>
              <div>
                <p>次の受付シフト</p>
                <strong>22:00 - 02:00</strong>
              </div>
              <button className={styles.ghost}>引き継ぎを書く</button>
            </div>
          </div>
        </section>

        <section id="features" className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Roles</p>
            <h2>役割ごとのワークスペース</h2>
            <p>
              依頼者の入力から会計係の支払いまで、担当ごとに必要な情報だけを整理。
            </p>
          </div>
          <div className={styles.roleGrid}>
            {[
              {
                title: "依頼者",
                text: "依頼票の作成と進行状況の確認を一元化。",
              },
              {
                title: "受付嬢",
                text: "依頼内容を精査し、クエスト票へ変換。",
              },
              {
                title: "冒険者",
                text: "公開クエストの受注と進捗報告。",
              },
              {
                title: "会計係",
                text: "素材評価と報酬支払いを管理。",
              },
            ].map((role) => (
              <article key={role.title} className={styles.roleCard}>
                <h3>{role.title}</h3>
                <p>{role.text}</p>
                <span className={styles.roleFoot}>専用ダッシュボード</span>
              </article>
            ))}
          </div>
        </section>

        <section id="flows" className={styles.sectionAlt}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Flows</p>
            <h2>依頼から完了までの流れを一本化</h2>
          </div>
          <div className={styles.flowGrid}>
            <div className={styles.flowCard}>
              <h3>クエストフロー</h3>
              <ol>
                <li>依頼登録 → 依頼一覧</li>
                <li>受付確認 → クエスト票作成</li>
                <li>冒険者受注 → 進捗更新</li>
                <li>完了報告 → 報告記録</li>
              </ol>
            </div>
            <div className={styles.flowCard}>
              <h3>素材納品フロー</h3>
              <ol>
                <li>納品申請 → 受付確認</li>
                <li>素材評価 → 報酬設定</li>
                <li>支払い記録 → 履歴保存</li>
              </ol>
            </div>
            <div className={styles.flowCard}>
              <h3>通知と履歴</h3>
              <ol>
                <li>進捗アラート通知</li>
                <li>差分ログの自動保存</li>
                <li>ロール別の閲覧制御</li>
              </ol>
            </div>
          </div>
        </section>

        <section id="board" className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Live Board</p>
            <h2>クエストボードのモック</h2>
          </div>
          <div className={styles.board}>
            {[
              {
                title: "受付待ち",
                items: [
                  "US-01 依頼票の作成",
                  "US-02 依頼詳細の確認",
                ],
              },
              {
                title: "進行中",
                items: [
                  "US-04 クエスト受注",
                  "US-05 進捗コメント更新",
                  "US-06 素材納品申請",
                ],
              },
              {
                title: "完了",
                items: ["US-07 素材評価", "US-08 報酬支払い記録"],
              },
            ].map((column) => (
              <div key={column.title} className={styles.boardColumn}>
                <div className={styles.boardHeader}>
                  <h3>{column.title}</h3>
                  <span>{column.items.length}</span>
                </div>
                <div className={styles.boardCards}>
                  {column.items.map((item) => (
                    <div key={item} className={styles.boardCard}>
                      <p>{item}</p>
                      <span>担当: 自動割当</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="reports" className={styles.sectionAlt}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Reports</p>
            <h2>レポートと支払い状況</h2>
          </div>
          <div className={styles.reportGrid}>
            <div className={styles.reportCard}>
              <h3>今月の報酬支払い</h3>
              <p className={styles.reportValue}>1,284,000G</p>
              <p className={styles.reportNote}>支払い済み 86%</p>
            </div>
            <div className={styles.reportCard}>
              <h3>クエスト成功率</h3>
              <p className={styles.reportValue}>92%</p>
              <p className={styles.reportNote}>前月比 +4pt</p>
            </div>
            <div className={styles.reportCard}>
              <h3>受付処理時間</h3>
              <p className={styles.reportValue}>14分</p>
              <p className={styles.reportNote}>平均/依頼</p>
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div>
            <h2>ギルド運営をすぐにデジタル化</h2>
            <p>
              モックアップはそのまま Next.js で拡張できます。UI を使って仕様を
              詰めていきましょう。
            </p>
          </div>
          <button className={styles.primary}>モックを共有</button>
        </section>
      </main>
    </div>
  );
}
