/**
 * 介面文字（繁中）。這份是基準：`en.ts` 的型別從這裡推出，少一個 key 就 typecheck 失敗。
 * vue-i18n 的語法：`{name}` 代入參數，`|` 分隔單複數，`@`、`{`、`}`、`|` 不能直接當文字用
 */
const zhTW = {
  app: {
    title: '桌遊機制圖譜',
    dev: '開發版',
    changelog: '更新紀錄',
    logout: '登出',
  },
  nav: {
    games: '遊戲',
    mechanisms: '機制',
    themes: '主題',
    board: '留言板',
  },
  locale: {
    /** 按鈕上顯示「切過去」的語言 */
    switchTo: 'EN',
    switchLabel: 'Switch to English',
  },
  appearance: {
    label: '外觀',
    light: '淺色',
    dark: '深色',
    system: '跟系統',
  },
  common: {
    loading: '載入中…',
    loadFailed: '載入失敗',
    loadFailedReload: '載入失敗，請重新整理。',
    save: '儲存',
    saving: '儲存中…',
    cancel: '取消',
    edit: '編輯',
    close: '關閉',
    gameCount: '{n} 款遊戲',
    playBga: '在 BGA 上玩 ↗',
    bggPage: 'BGG 頁面 ↗',
    listSep: '、',
    /** 好幾句話接在一起 */
    sentenceSep: '。',
  },
  format: {
    players: '{n} 人',
    playersRange: '{min}–{max} 人',
    playersMax: '最多 {max} 人',
    aboutMinutes: '約 {n} 分鐘',
    minutes: '{n} 分鐘',
  },
  errors: {
    saveFailed: '儲存失敗，請稍後再試',
    invalidFields: '這些欄位格式不對：{fields}',
    invalid: '欄位格式不對',
  },
  login: {
    title: '登入',
    intro: '桌遊機制圖譜只給成員使用，請用 Discord 登入。',
    button: '用 Discord 登入',
    denied: '你取消了 Discord 授權。',
    expired: '登入逾時，請再試一次。',
    failed: '登入失敗，請稍後再試。',
  },
  notFound: {
    title: '找不到這個頁面',
    home: '回首頁',
  },
  home: {
    title: '遊戲與機制',
    legend: '圖例',
    legendGame: '遊戲（右半圈）',
    legendMechanism: '機制（左半圈）',
    hint: '移到節點上點亮相關的連線，點一下在旁邊看詳情。',
    empty: '還沒有任何遊戲。',
    browse: '也可以用列表瀏覽：',
  },
  graph: {
    label: '桌遊與機制的關係圖：右半圈是遊戲，左半圈是機制',
    game: '遊戲：{name}',
    mechanism: '機制：{name}',
  },
  marks: {
    wish: '想玩',
    played: '玩過',
    playedTimes: '玩過 {n} 次',
    cannotUnplay: '有遊玩紀錄，不能取消',
  },
  weight: {
    title: '重度（複雜度）',
    short: '重度',
    everyone: '大家：',
    ratings: '（{n} 人評分）',
    ratingsWithMine: '（{n} 人評分，我 {mine}）',
    noRatings: '還沒有人評',
    light: '1.0 輕',
    heavy: '9.9 重',
    mine: '我的評分 {value}',
    unrated: '還沒評分',
    clear: '取消我的評分',
    hint: '拖動來評分，放開就會儲存',
  },
  review: {
    badge: '需要 admin review',
    badgeTitle: '成員用 BGA 代號新增的遊戲，等 admin 確認名稱與機制',
    hint: '成員新增的遊戲：看過名稱、機制與主題後確認。',
    confirm: '確認',
  },
  topWishes: {
    title: '大家想玩',
    empty: '還沒有人標想玩。',
    count: '{n} 人',
  },
  gamePanel: {
    recentPlays: '最近的遊玩紀錄',
    toGame: '遊戲頁：機制、誰玩過、誰想玩 →',
    allPlays: '全部遊玩紀錄（{n} 筆）→',
  },
  mechanismPanel: {
    games: '使用此機制的遊戲（{n}）',
    toPage: '機制頁 →',
  },
  game: {
    notFound: '找不到這款遊戲。',
    lastPlayed: '上次遊玩 {date}',
    mechanisms: '用到的機制',
    noMechanisms: '還沒有對應任何機制。',
    themes: '主題',
    noThemes: '還沒有主題。',
    players: '誰玩過',
    wishers: '誰想玩',
    nobody: '還沒有人。',
    playerWithCount: '{name}（{n} 次）',
    plays: '遊玩紀錄',
    noPlays: '還沒有紀錄。',
  },
  games: {
    title: '全部遊戲',
    add: '＋ 新增遊戲',
    mechanismCount: '{n} 個機制',
    sync: '從 BGA 同步機制與主題',
    syncing: '同步中…',
    syncConfirm: '所有有 BGA 代號的遊戲，機制與主題都會換成 BGA 上的（手動改過的會被蓋掉）。繼續？',
    synced: '已同步 {n} 款',
    syncMissing: 'BGA 找不到：{slugs}',
  },
  imageVariant: {
    legend: '列表的遊戲圖',
    label: '列表圖片（試用）：',
    icon: '圖示',
    bannerTitle: '橫幅＋標題',
  },
  mechanisms: {
    title: '全部機制',
    source: '機制名單與各遊戲的機制取自 BGA。',
    notFound: '找不到這個機制。',
    games: '使用此機制的遊戲',
    noGames: '還沒有遊戲使用。',
  },
  themes: {
    title: '全部主題',
    source: '主題名單與各遊戲的主題取自 BGA。',
    notFound: '找不到這個主題。',
    games: '這個主題的遊戲',
    noGames: '還沒有遊戲。',
  },
  addGame: {
    title: '新增遊戲',
    intro:
      '填 BGA 的遊戲代號就能新增，名稱、人數、機制與主題會從 BGA 帶入。新增後會標記「需要 admin review」，等 admin 確認。',
    slug: 'BGA 代號',
    placeholder: '例如 hanabi',
    lookup: '查詢',
    looking: '查詢中…',
    slugHelp: 'BGA 遊戲頁網址 {param} 後面那段，例如 {example}',
    unknownPlayers: '人數不明',
    viewOnBga: '在 BGA 上看 ↗',
    add: '新增',
    adding: '新增中…',
    seeExisting: '去看這款 →',
    adminHint: 'admin：也可以{link}（不需要 review）。',
    adminLink: '用完整表單新增',
  },
  board: {
    title: '留言板',
    replyTo: '回覆 #{n}',
    cancelReply: '取消回覆',
    placeholder: '寫點什麼…',
    contentLabel: '留言內容',
    submit: '送出',
    submitting: '送出中…',
    empty: '還沒有留言，來寫第一則吧。',
    loadMore: '載入更多',
    earliest: '已經是最早的留言',
  },
  post: {
    edited: '（已編輯 {n} 次，看紀錄）',
    editedOpen: '（已編輯 {n} 次，收起紀錄）',
    editLabel: '編輯內容',
    history: '編輯紀錄',
    current: '（目前）',
    original: '（原文）',
    reply: '回覆',
  },
  changelog: {
    title: '更新紀錄',
    /** 更新紀錄的內容只有中文；只在英文介面顯示這句 */
    languageNote: '更新紀錄只有中文。',
    backlog: '待辦',
    backlogIntro: '還沒做、打算接下來做的功能。',
    current: '目前版本',
    kind: { added: '新增', improved: '改進', fixed: '修正' },
  },
  settings: {
    title: '我的設定',
    link: '我的設定',
    displayName: '暱稱',
    displayNameHelp: '大家在遊玩紀錄、留言板等地方看到的名字，最多 {max} 個字。',
    saved: '已儲存',
    /** 按了就直接重設並儲存 */
    resetToDiscord: '重設為 {name}？',
  },
  help: {
    link: '說明',
    title: '使用說明',
    toc: '目錄',
    pending: '準備中',
    pendingHello: '嗨！這篇還在寫',
    pendingBody: '這個功能已經可以用了，只是說明還沒寫好。先看看其他篇，或直接到網站上試試看。',
    notFound: '找不到這篇說明。',
    prev: '上一篇',
    next: '下一篇',
    tips: '小提醒',
    /** 登入頁上給還沒加入的人 */
    fromLogin: '還沒加入？先看看這個網站能做什麼 →',
    demo: {
      steps: '操作步驟',
      play: '播放示意',
      pause: '暫停示意',
      paused: '已暫停',
    },
    modules: {
      start: '開始使用',
      graph: '關係圖',
      games: '遊戲',
      tags: '機制與主題',
      board: '留言板',
      account: '帳號',
      admin: '管理（admin）',
    },
    pages: {
      start: {
        welcome: {
          title: '這個網站是什麼',
          intro:
            '桌遊機制圖譜把我們玩過、想玩的桌遊，和它們用到的「機制」連在一起：看一款遊戲用了哪些機制，也能從一個機制找到其他用到它的遊戲。',
          more: '每個人可以標記想玩、玩過，替遊戲評重度；列表裡沒有的遊戲，也能用 BGA 代號自己新增。',
          membersOnly: '網站內容只給成員看，要先用 Discord 登入；這份說明不用登入也能看。',
          sections: '說明目錄',
        },
        login: {
          title: '用 Discord 登入',
          intro: '網站只給成員使用，用 Discord 帳號登入就好，不用另外註冊。',
          steps: {
            button: '在登入頁按「用 Discord 登入」',
            authorize: '跳到 Discord 的授權頁，按「授權」',
            done: '回到網站，右上角出現你的頭像和暱稱，就登入好了',
          },
          discordTitle: '授權存取你的帳號',
          discordBody: '桌遊機制圖譜想讀取你的 Discord 名稱與頭像。',
          discordAuthorize: '授權',
          tips: {
            returnTo: '登入後會回到你原本要看的頁面。',
            nickname: '暱稱預設是 Discord 上的名稱，之後可以在「我的設定」改。',
            logout: '要登出，按右上角的「登出」。',
          },
        },
        display: {
          title: '切換語言與外觀',
          intro: '右上角可以切換中文／英文，以及淺色／深色外觀，不用登入也能切。',
          steps: {
            locale: '按語言按鈕：上面寫的是「切過去」的語言，按了介面就換過去',
            dark: '按 ☾：換成深色',
            system: '按 ◐：跟著系統（手機、電腦）的淺色／深色設定',
          },
          tips: {
            names:
              '遊戲、機制、主題的名稱也會跟著換：英文介面顯示英文名稱（取自 BGA），沒有的就顯示中文。',
            default: '還沒選過語言時，瀏覽器偏好有中文就用中文，否則用英文。',
            browser: '兩種設定都存在這台瀏覽器，換一台裝置要重新選。',
            notThemes: '這裡的「外觀」是介面的淺色／深色，跟遊戲的「主題」標籤是兩回事。',
          },
        },
      },
      graph: {
        read: {
          title: '看懂關係圖',
          intro: '首頁的圓形圖把遊戲和機制畫在同一個圈上：遊戲用到某個機制，兩點之間就有一條線。',
          steps: {
            game: '把滑鼠移到一款遊戲上：它用到的機制和連線會亮起來',
            mechanism: '移到一個機制上：用到它的遊戲會亮起來',
            select: '點一下節點：旁邊出現詳情，網址也會記住選了哪一個',
            clear: '點圖的空白處，取消選取',
          },
          tips: {
            share: '選取後的網址可以直接貼給別人，打開就是同一個畫面。',
            icons: '螢幕夠寬時，圖的左邊有遊戲圖示，移上去圖也會跟著亮。',
            keyboard: '也可以用鍵盤：Tab 移到節點，Enter 選取。',
          },
        },
        wishes: {
          title: '大家想玩',
          intro:
            '首頁右邊的「大家想玩」是成員想玩清單的排行：一款遊戲有越多人標「想玩」，排得越前面。',
          others: '在任何一款遊戲按「想玩」',
          steps: {
            list: '首頁沒選任何節點時，右邊就是「大家想玩」',
            wish: '有人把一款遊戲標成想玩，人數加一，排名跟著變',
            open: '點遊戲名稱，到遊戲頁看是誰想玩',
          },
          tips: {
            who: '人數相同時依名稱排序，最多列 10 款。',
            names: '排行只顯示人數；想知道是誰，到遊戲頁看「誰想玩」。',
            selected: '在圖上選了節點後，這一區會換成那個節點的詳情；點圖的空白處就回來。',
          },
        },
      },
      games: {
        browse: {
          title: '瀏覽遊戲列表',
          intro: '上方的「遊戲」是全部遊戲的列表，依名稱排序；點一列就進到那款遊戲的頁面。',
          meta: '{players} 人',
          gamePage:
            '遊戲頁集合了這款遊戲的一切：想玩／玩過、重度、用到的機制與主題、誰玩過、誰想玩、遊玩紀錄，還有連到 BGA、BGG 的連結。',
          steps: {
            list: '每一列有名稱、人數、時長與機制數',
            image: '「列表圖片」可以切換成小圖示或橫幅',
            open: '點一列，進到遊戲頁',
          },
          tips: {
            sort: '英文介面依英文名稱排序。',
            image: '列表圖片還在試用，選擇存在這台瀏覽器。',
            links: '螢幕夠寬時，首頁左邊也有全部遊戲的圖示，點了直接在旁邊看詳情。',
          },
        },
        marks: {
          title: '標記想玩、玩過',
          intro:
            '遊戲頁（或在首頁點一款遊戲後的詳情）有「想玩」和「玩過」兩個按鈕，按一下就切換，馬上儲存。',
          steps: {
            wish: '按「☆ 想玩」：星星變實心，這款加進你的想玩清單',
            played: '按「玩過」：標記你玩過這款',
            undo: '再按一次就取消',
          },
          tips: {
            wishes: '首頁的「大家想玩」會統計有多少人想玩，可以拿來決定下次開什麼。',
            records: '有遊玩紀錄的遊戲，「玩過」會顯示次數而且不能取消，因為紀錄才是依據。',
            visible: '遊戲頁會列出誰玩過、誰想玩，其他成員看得到你的標記。',
          },
        },
        weight: {
          title: '評重度',
          intro:
            '重度是遊戲有多複雜，1.0 最輕、9.9 最重。在遊戲頁拖動滑桿評分，大家的平均顯示在旁邊。',
          steps: {
            start: '還沒評過時，滑桿停在大家的平均，數字是「—」',
            drag: '拖動滑桿，左邊的數字跟著變',
            save: '放開就自動儲存，大家的平均也跟著更新',
            clear: '想收回，按「取消我的評分」',
          },
          tips: {
            keyboard: '也可以用鍵盤：focus 在滑桿上按方向鍵，每次 0.1，停下來約半秒後儲存。',
            scale: '刻度上的 5.0 不在正中間，因為範圍是 1.0 到 9.9。',
            average: '平均取小數一位，旁邊括號是評分人數。',
          },
        },
        add: {
          title: '用 BGA 代號新增遊戲',
          intro:
            '列表裡沒有的遊戲，每個成員都能新增：只要填 Board Game Arena（BGA）上的遊戲代號，名稱、人數、機制與主題都會從 BGA 帶入。',
          steps: {
            open: '到「遊戲」頁，按「＋ 新增遊戲」',
            slug: '輸入 BGA 代號，例如 hanabi',
            lookup: '按「查詢」，確認預覽的名稱和人數對不對',
            add: '按「新增」：遊戲建好了，先標著「需要 admin review」',
          },
          whereTitle: '代號在哪裡找',
          where: '到 BGA 打開那款遊戲的介紹頁，網址最後一段就是代號，只有小寫英文字母和數字。',
          tips: {
            review:
              'admin 確認過名稱、機制與主題後，「需要 admin review」標籤就會拿掉；在那之前遊戲一樣可以標記、評分。',
            exists: '如果已經有這款遊戲，會提示你並附上連結，直接過去看就好。',
            login: '新增遊戲要先登入。',
          },
        },
      },
      tags: {
        mechanisms: {
          title: '機制列表與機制頁',
          intro:
            '「機制」是遊戲的玩法，例如合作、輪抽、手牌管理。從機制出發，可以找到玩法相近的其他遊戲。',
          steps: {
            list: '在上方的「機制」頁點一個機制',
            game: '機制頁列出用到它的遊戲，點一款進遊戲頁',
            next: '遊戲頁的機制也能點，就這樣一路逛下去',
          },
          tips: {
            source: '機制名單和每款遊戲的機制都取自 BGA。',
            description: '有些機制附了說明，由 admin 補充。',
            graph: '首頁的圓形圖是同一份資料的圖像版，適合一次看整體。',
          },
        },
        themes: {
          title: '主題列表與主題頁',
          intro:
            '「主題」是遊戲的背景題材，例如動物、歷史、奇幻。想找某種氛圍的遊戲時，從主題找最快。',
          steps: {
            list: '在上方的「主題」頁點一個主題',
            game: '主題頁列出這個主題的遊戲，點一款進遊戲頁',
            back: '遊戲頁的主題標籤也能點，回到主題頁',
          },
          tips: {
            notAppearance: '這裡的主題是遊戲的題材，跟右上角切換的淺色／深色「外觀」是兩回事。',
            source: '主題名單和每款遊戲的主題都取自 BGA。',
            many: '一款遊戲可以有好幾個主題。',
          },
        },
      },
      board: {
        post: {
          title: '留言與回覆',
          intro: '「留言板」是大家聊天、約團的地方。可以寫新留言，也可以回覆某一則。',
          sample: {
            first: '週五有人要開卡卡頌嗎？',
            mine: '今晚有人要開花火嗎？',
            reply: '週五我可以！',
          },
          steps: {
            write: '在上面的框裡寫留言',
            submit: '按「送出」，新留言出現在最上面',
            reply: '想回某一則，按它的「回覆」，框上會出現「回覆 #1」',
            submitReply: '寫好送出，留言會標著回覆哪一則',
            jump: '點「回覆 #1」，會捲到那一則並短暫標示出來',
          },
          tips: {
            length: '一則最多 2000 字，可以換行。',
            order: '新的在最上面；往下捲按「載入更多」看更早的。',
            jump: '要回覆的那則太早、還沒載入的話，點「回覆 #N」會自動往下載到那一則。',
          },
        },
        edit: {
          title: '編輯留言與紀錄',
          intro: '寫錯字或想補充，可以編輯自己的留言；改過的地方大家都看得到紀錄。',
          sample: {
            before: '今晚有人要開花火嗎？',
            added: '8 點開始',
          },
          steps: {
            open: '在自己的留言按「編輯」',
            type: '修改內容',
            save: '按「儲存」，留言旁邊會標「已編輯」',
            history: '點「已編輯 N 次」，展開每一版的內容',
          },
          tips: {
            own: '只能編輯自己的留言，別人的留言只有「回覆」。',
            history: '編輯紀錄每個人都看得到，最上面是目前的版本，最下面是原文。',
            delete: '目前不能刪除留言；寫錯了就編輯修正。',
          },
        },
      },
      account: {
        nickname: {
          title: '改暱稱',
          intro:
            '暱稱是大家在遊玩紀錄、留言板這些地方看到的名字。第一次登入時用 Discord 上的名稱，之後可以自己改。',
          steps: {
            open: '點右上角的頭像，進到「我的設定」',
            type: '輸入新的暱稱',
            save: '按「儲存」，整個網站馬上換成新暱稱',
            reset: '想改回來，按「重設為…」換回 Discord 上的名稱',
          },
          tips: {
            where: '暱稱最多 50 個字。',
            unique: '暱稱不用跟別人不一樣，不過取個大家認得出來的比較好。',
            login: '之後再用 Discord 登入，不會蓋掉你改好的暱稱。',
          },
        },
      },
      admin: {
        review: {
          title: '審核成員新增的遊戲',
          intro:
            '成員用 BGA 代號新增的遊戲會標著「需要 admin review」。admin 看過資料沒問題後確認，標籤就會拿掉。',
          steps: {
            find: '遊戲列表上標著「需要 admin review」的，就是等確認的遊戲',
            check: '進遊戲頁看名稱、機制與主題；不對就按「編輯」修正',
            confirm: '沒問題就按「確認」，標籤拿掉',
          },
          tips: {
            adminOnly: '確認的提示框只有 admin 看得到；其他成員只看到標籤。',
            noChange: '「確認」只會拿掉標籤，不會改遊戲的任何資料。',
            fullForm: 'admin 用完整表單新增的遊戲不需要 review。',
          },
        },
        sync: {
          title: '從 BGA 同步機制與主題',
          intro:
            'BGA 會調整遊戲的機制與主題標籤。admin 可以一鍵把所有遊戲的機制與主題更新成 BGA 上的。',
          ok: '確定',
          steps: {
            open: '在「遊戲」頁按「從 BGA 同步機制與主題」',
            confirm: '確認提示：手動改過的機制與主題會被蓋掉',
            result: '完成後顯示更新了幾款；BGA 上找不到的代號也會列出來',
          },
          tips: {
            scope: '只處理有 BGA 代號的遊戲；BGA 上找不到的不會變動。',
            newTags: 'BGA 上新的機制與主題會自動加進名單。',
            nameEn: '還沒有英文名稱的遊戲會順便補上。',
            single: '只想更新一款的話，到那款的編輯頁按「從 BGA 帶入」。',
          },
        },
      },
    },
  },
  adminGame: {
    titleNew: '新增遊戲',
    titleEdit: '編輯：{name}',
    name: '名稱',
    nameEn: '英文名稱（選填）',
    minPlayers: '最少人數',
    maxPlayers: '最多人數',
    minutes: '時長（分鐘）',
    bgaSlug: 'BGA 代號',
    fillFromBga: '從 BGA 帶入',
    slugHelp: 'BGA 遊戲頁網址 {param} 後面那段',
    openToCheck: '（開啟確認 ↗）',
    bggId: 'BGG id',
    imageUrl: '自訂圖片網址（選填）',
    imageHelp: '沒填就用 BGA 的圖。',
    mechanisms: '機制',
    themes: '主題',
    delete: '刪除這款遊戲',
    confirmDelete: '確定刪除「{name}」？想玩清單裡的這款遊戲也會一起移除。',
    bgaFound: 'BGA：{name}',
    filled: '已帶入{fields}',
    nothingToFill: '沒有空的欄位可以帶入',
    kept: '{fields}已經有值，沒有覆蓋',
    tagsReplaced: '機制與主題換成 BGA 上的（{mechanisms} 個機制、{themes} 個主題）',
    unknownTags: '有 {n} 個 BGA 標籤這邊還沒有，到遊戲列表按「從 BGA 同步」補上',
  },
  adminMechanism: {
    title: '編輯：{name}',
    name: '名稱',
    nameEn: '英文名稱（選填）',
    description: '說明',
    gamesNote: '使用的遊戲從 BGA 同步，也可以在各遊戲的編輯頁勾選（目前 {n} 款）。',
    delete: '刪除這個機制',
    confirmDelete: '確定刪除「{name}」？',
  },
}

export default zhTW
