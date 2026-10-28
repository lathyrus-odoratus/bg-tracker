import type { MessageSchema } from './index.ts'

/** 介面文字（英文）；key 與 `zh-TW.ts` 一致 */
const en: MessageSchema = {
  app: {
    title: 'Board Game Mechanism Map',
    dev: 'Dev build',
    changelog: 'Changelog',
    logout: 'Log out',
  },
  nav: {
    games: 'Games',
    mechanisms: 'Mechanisms',
    themes: 'Themes',
    board: 'Board',
  },
  locale: {
    switchTo: '中文',
    switchLabel: '切換成中文',
  },
  appearance: {
    label: 'Appearance',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  },
  common: {
    loading: 'Loading…',
    loadFailed: 'Failed to load',
    loadFailedReload: 'Failed to load. Please reload the page.',
    save: 'Save',
    saving: 'Saving…',
    cancel: 'Cancel',
    edit: 'Edit',
    close: 'Close',
    gameCount: '{n} game | {n} games',
    playBga: 'Play on BGA ↗',
    bggPage: 'BGG page ↗',
    listSep: ', ',
    sentenceSep: '. ',
  },
  format: {
    players: '{n} player | {n} players',
    playersRange: '{min}–{max} players',
    playersMax: 'Up to {max} players',
    aboutMinutes: 'About {n} min',
    minutes: '{n} min',
  },
  errors: {
    saveFailed: 'Could not save. Please try again later.',
    invalidFields: 'These fields are invalid: {fields}',
    invalid: 'Some fields are invalid',
  },
  login: {
    title: 'Log in',
    intro: 'This site is for members only. Please log in with Discord.',
    button: 'Log in with Discord',
    denied: 'You cancelled the Discord authorization.',
    expired: 'The login timed out. Please try again.',
    failed: 'Login failed. Please try again later.',
  },
  notFound: {
    title: 'Page not found',
    home: 'Back to home',
  },
  home: {
    title: 'Games & mechanisms',
    legend: 'Legend',
    legendGame: 'Games (right half)',
    legendMechanism: 'Mechanisms (left half)',
    hint: 'Hover a node to highlight its links; click it to see details alongside.',
    empty: 'No games yet.',
    browse: 'Or browse the lists:',
  },
  graph: {
    label: 'Graph of games and mechanisms: games on the right half, mechanisms on the left',
    game: 'Game: {name}',
    mechanism: 'Mechanism: {name}',
  },
  marks: {
    wish: 'Want to play',
    played: 'Played',
    playedTimes: 'Played {n} time | Played {n} times',
    cannotUnplay: 'This game has play records, so it stays marked as played',
  },
  weight: {
    title: 'Weight (complexity)',
    short: 'Weight',
    everyone: 'Everyone: ',
    ratings: '({n} rating) | ({n} ratings)',
    ratingsWithMine: '({n} rating, mine {mine}) | ({n} ratings, mine {mine})',
    noRatings: 'No ratings yet',
    light: '1.0 light',
    heavy: '9.9 heavy',
    mine: 'My rating {value}',
    unrated: 'Not rated',
    clear: 'Clear my rating',
    hint: 'Drag to rate; it saves when you let go',
  },
  review: {
    badge: 'Needs admin review',
    badgeTitle:
      'Added by a member from a BGA slug; waiting for an admin to check the name and mechanisms',
    hint: 'Added by a member: check the name, mechanisms and themes, then confirm.',
    confirm: 'Confirm',
  },
  topWishes: {
    title: 'Most wanted',
    empty: 'Nobody has marked a game yet.',
    count: '{n} person | {n} people',
  },
  gamePanel: {
    recentPlays: 'Recent plays',
    toGame: 'Game page: mechanisms, who played, who wants to play →',
    allPlays: 'All plays ({n}) →',
  },
  mechanismPanel: {
    games: 'Games with this mechanism ({n})',
    toPage: 'Mechanism page →',
  },
  game: {
    notFound: 'Game not found.',
    lastPlayed: 'Last played {date}',
    mechanisms: 'Mechanisms',
    noMechanisms: 'No mechanisms yet.',
    themes: 'Themes',
    noThemes: 'No themes yet.',
    players: 'Who played',
    wishers: 'Who wants to play',
    nobody: 'Nobody yet.',
    playerWithCount: '{name} ({n} play) | {name} ({n} plays)',
    plays: 'Plays',
    noPlays: 'No plays yet.',
  },
  games: {
    title: 'All games',
    add: '+ Add game',
    mechanismCount: '{n} mechanism | {n} mechanisms',
    sync: 'Sync mechanisms & themes from BGA',
    syncing: 'Syncing…',
    syncConfirm:
      'Mechanisms and themes of every game with a BGA slug will be replaced with the ones on BGA (manual changes are overwritten). Continue?',
    synced: 'Synced {n} game | Synced {n} games',
    syncMissing: 'Not found on BGA: {slugs}',
  },
  imageVariant: {
    legend: 'Game image in lists',
    label: 'List images (trial): ',
    icon: 'Icon',
    bannerTitle: 'Banner + title',
  },
  mechanisms: {
    title: 'All mechanisms',
    source: 'The mechanism list and each game’s mechanisms come from BGA.',
    notFound: 'Mechanism not found.',
    games: 'Games with this mechanism',
    noGames: 'No games use it yet.',
  },
  themes: {
    title: 'All themes',
    source: 'The theme list and each game’s themes come from BGA.',
    notFound: 'Theme not found.',
    games: 'Games with this theme',
    noGames: 'No games yet.',
  },
  addGame: {
    title: 'Add a game',
    intro:
      'Enter a BGA game slug to add it; the name, player count, mechanisms and themes come from BGA. New games are marked “needs admin review” until an admin checks them.',
    slug: 'BGA slug',
    placeholder: 'e.g. hanabi',
    lookup: 'Look up',
    looking: 'Looking up…',
    slugHelp: 'The part after {param} in the BGA game page URL, e.g. {example}',
    unknownPlayers: 'Player count unknown',
    viewOnBga: 'View on BGA ↗',
    add: 'Add',
    adding: 'Adding…',
    seeExisting: 'Go to it →',
    adminHint: 'Admins can also {link} (no review needed).',
    adminLink: 'use the full form',
  },
  board: {
    title: 'Board',
    replyTo: 'Reply to #{n}',
    cancelReply: 'Cancel reply',
    placeholder: 'Write something…',
    contentLabel: 'Message',
    submit: 'Post',
    submitting: 'Posting…',
    empty: 'No posts yet. Be the first!',
    loadMore: 'Load more',
    earliest: 'That’s the earliest post',
  },
  post: {
    edited: '(edited {n} time, show history) | (edited {n} times, show history)',
    editedOpen: '(edited {n} time, hide history) | (edited {n} times, hide history)',
    editLabel: 'Edit message',
    history: 'Edit history',
    current: '(current)',
    original: '(original)',
    reply: 'Reply',
  },
  changelog: {
    title: 'Changelog',
    languageNote: 'Release notes are written in Chinese.',
    backlog: 'Backlog',
    backlogIntro: 'Features not built yet that we plan to do next.',
    current: 'Current version',
    kind: { added: 'New', improved: 'Improved', fixed: 'Fixed' },
  },
  settings: {
    title: 'My settings',
    link: 'My settings',
    displayName: 'Nickname',
    displayNameHelp:
      'The name others see in play records, the board and elsewhere. Up to {max} characters.',
    saved: 'Saved',
    resetToDiscord: 'Reset to {name}?',
  },
  help: {
    link: 'Help',
    title: 'Help',
    toc: 'Contents',
    pending: 'Coming soon',
    pendingHello: 'Hi! This page is still being written',
    pendingBody:
      'The feature already works; its guide just isn’t ready yet. Check out the other pages, or go try it on the site.',
    notFound: 'This help page doesn’t exist.',
    prev: 'Previous',
    next: 'Next',
    tips: 'Tips',
    fromLogin: 'Not a member yet? See what this site does →',
    demo: {
      steps: 'Steps',
      play: 'Play demo',
      pause: 'Pause demo',
      paused: 'Paused',
    },
    modules: {
      start: 'Getting started',
      graph: 'Graph',
      games: 'Games',
      tags: 'Mechanisms & themes',
      board: 'Board',
      account: 'Account',
      admin: 'Admin',
    },
    pages: {
      start: {
        welcome: {
          title: 'What is this site?',
          intro:
            'The Board Game Mechanism Map links the games we’ve played or want to play with the mechanisms they use: see which mechanisms a game has, or start from a mechanism and find other games that use it.',
          more: 'Everyone can mark games as wanted or played and rate their weight. If a game is missing, you can add it yourself with its BGA slug.',
          membersOnly:
            'The site is for members only, so you’ll need to log in with Discord. This help is open to everyone.',
          sections: 'Contents',
        },
        login: {
          title: 'Log in with Discord',
          intro:
            'The site is for members only. Log in with your Discord account—no separate sign-up.',
          steps: {
            button: 'On the login page, press “Log in with Discord”',
            authorize: 'On Discord’s authorization page, press “Authorize”',
            done: 'Back on the site, your avatar and nickname appear at the top right—you’re in',
          },
          discordTitle: 'Authorize access to your account',
          discordBody: 'Board Game Mechanism Map wants to read your Discord name and avatar.',
          discordAuthorize: 'Authorize',
          tips: {
            returnTo: 'After logging in you go back to the page you were trying to open.',
            nickname:
              'Your nickname starts as your Discord name; you can change it later in My settings.',
            logout: 'To log out, press “Log out” at the top right.',
          },
        },
        display: {
          title: 'Language and appearance',
          intro:
            'Switch between Chinese and English, and between light and dark, at the top right—no login needed.',
          steps: {
            locale: 'Press the language button: it shows the language you’ll switch to',
            dark: 'Press ☾ for dark mode',
            system: 'Press ◐ to follow your device’s light or dark setting',
          },
          tips: {
            names:
              'Game, mechanism and theme names switch too: the English UI shows English names (from BGA), falling back to Chinese.',
            default:
              'Until you pick a language, Chinese is used if your browser prefers it; otherwise English.',
            browser: 'Both settings are saved in this browser; pick again on another device.',
            notThemes: '“Appearance” here means light or dark UI—not the “themes” that tag games.',
          },
        },
      },
      graph: {
        read: {
          title: 'Reading the graph',
          intro:
            'The circle on the home page puts games and mechanisms on the same ring: when a game uses a mechanism, a line connects the two.',
          steps: {
            game: 'Hover over a game: the mechanisms it uses and their lines light up',
            mechanism: 'Hover over a mechanism: the games that use it light up',
            select:
              'Click a node: details appear beside the graph, and the URL remembers your pick',
            clear: 'Click an empty spot in the graph to clear the selection',
          },
          tips: {
            share: 'You can share the URL after selecting a node—it opens the same view.',
            icons:
              'On wide screens, game icons sit left of the graph; hovering them lights up the graph too.',
            keyboard: 'Keyboard works too: Tab to a node, Enter to select it.',
          },
        },
        wishes: {
          title: 'Most wanted',
          intro:
            '“Most wanted” on the right of the home page ranks members’ wishlists: the more people mark a game “Want to play”, the higher it goes.',
          others: 'Press “Want to play” on any game',
          steps: {
            list: 'With nothing selected on the graph, the right side shows “Most wanted”',
            wish: 'When someone marks a game, its count goes up and the ranking updates',
            open: 'Click a game name to see who wants to play it',
          },
          tips: {
            who: 'Ties are sorted by name; up to 10 games are listed.',
            names:
              'The ranking only shows counts; see “Who wants to play” on the game page for names.',
            selected:
              'Selecting a node on the graph replaces this with its details; click an empty spot to come back.',
          },
        },
      },
      games: {
        browse: {
          title: 'Browsing games',
          intro:
            '“Games” at the top lists every game, sorted by name. Click a row to open that game.',
          meta: '{players} players',
          gamePage:
            'A game page has everything about it: wanted/played, weight, mechanisms and themes, who played, who wants to play, play records, and links to BGA and BGG.',
          steps: {
            list: 'Each row shows the name, player count, length and number of mechanisms',
            image: '“List images” switches between small icons and banners',
            open: 'Click a row to open the game page',
          },
          tips: {
            sort: 'The English UI sorts by English names.',
            image: 'List images are a trial; your choice is saved in this browser.',
            links:
              'On wide screens, the home page also shows every game as an icon on the left; click one to see details beside the graph.',
          },
        },
        marks: {
          title: 'Marking wanted and played',
          intro:
            'A game page (or the details after clicking a game on the home page) has “Want to play” and “Played” buttons. Press to toggle; it saves right away.',
          steps: {
            wish: 'Press “☆ Want to play”: the star fills in and the game joins your wishlist',
            played: 'Press “Played” to mark that you’ve played it',
            undo: 'Press again to undo',
          },
          tips: {
            wishes:
              '“Most wanted” on the home page counts how many people want each game—handy for picking the next one.',
            records:
              'Games with play records show a play count on “Played” and can’t be unmarked; the records decide.',
            visible:
              'Game pages list who played and who wants to play, so other members can see your marks.',
          },
        },
        weight: {
          title: 'Rating weight',
          intro:
            'Weight is how complex a game is, from 1.0 (light) to 9.9 (heavy). Drag the slider on a game page to rate it; everyone’s average is shown next to it.',
          steps: {
            start: 'Before you rate, the slider rests on the average and the number shows “—”',
            drag: 'Drag the slider; the number on the left follows',
            save: 'Let go to save automatically; the average updates too',
            clear: 'Changed your mind? Press “Clear my rating”',
          },
          tips: {
            keyboard:
              'Keyboard works too: focus the slider and use the arrow keys (0.1 per press); it saves about half a second after you stop.',
            scale: 'The 5.0 tick isn’t in the middle because the range is 1.0 to 9.9.',
            average:
              'The average is rounded to one decimal; the number in brackets is how many people rated.',
          },
        },
        add: {
          title: 'Adding a game by BGA slug',
          intro:
            'Any member can add a missing game: just enter its slug on Board Game Arena (BGA), and the name, player count, mechanisms and themes come from BGA.',
          steps: {
            open: 'On the Games page, press “+ Add game”',
            slug: 'Enter the BGA slug, e.g. hanabi',
            lookup: 'Press “Look up” and check the previewed name and player count',
            add: 'Press “Add”: the game is created, marked “Needs admin review” for now',
          },
          whereTitle: 'Where to find the slug',
          where:
            'Open the game’s page on BGA; the last part of the URL is the slug—lowercase letters and digits only.',
          tips: {
            review:
              'Once an admin checks the name, mechanisms and themes, the “Needs admin review” label goes away. Until then the game can still be marked and rated.',
            exists: 'If the game already exists, you’ll get a link to it instead.',
            login: 'You need to log in to add games.',
          },
        },
      },
      tags: {
        mechanisms: {
          title: 'Mechanisms',
          intro:
            'Mechanisms are how a game plays—cooperative, card drafting, hand management and so on. Start from a mechanism to find games that play alike.',
          steps: {
            list: 'Open “Mechanisms” at the top and click one',
            game: 'The mechanism page lists the games that use it; click one to open it',
            next: 'Mechanisms on the game page are links too—keep exploring',
          },
          tips: {
            source: 'The mechanism list and each game’s mechanisms come from BGA.',
            description: 'Some mechanisms have a description added by an admin.',
            graph:
              'The circle graph on the home page shows the same data as a picture—good for the big picture.',
          },
        },
        themes: {
          title: 'Themes',
          intro:
            'Themes are what a game is about—animals, history, fantasy and so on. They’re the quickest way to find a game with a certain feel.',
          steps: {
            list: 'Open “Themes” at the top and click one',
            game: 'The theme page lists its games; click one to open it',
            back: 'Theme tags on the game page link back to the theme',
          },
          tips: {
            notAppearance:
              'These themes are what games are about—not the light/dark “appearance” at the top right.',
            source: 'The theme list and each game’s themes come from BGA.',
            many: 'A game can have several themes.',
          },
        },
      },
      board: {
        post: {
          title: 'Posting and replying',
          intro:
            'The Board is where everyone chats and plans game nights. Write a new post or reply to one.',
          sample: {
            first: 'Anyone up for Carcassonne on Friday?',
            mine: 'Anyone up for Hanabi tonight?',
            reply: 'Friday works for me!',
          },
          steps: {
            write: 'Write your message in the box at the top',
            submit: 'Press “Post”: it appears at the top',
            reply: 'To reply, press “Reply” on a post; the box shows “Reply to #1”',
            submitReply: 'Post it, and it shows which post it replies to',
            jump: 'Click “Reply to #1” to scroll to that post and briefly highlight it',
          },
          tips: {
            length: 'Posts can be up to 2000 characters, line breaks included.',
            order: 'Newest first; scroll down and press “Load more” for older posts.',
            jump: 'If the replied-to post hasn’t loaded yet, clicking “Reply to #N” loads older posts until it finds it.',
          },
        },
        edit: {
          title: 'Editing posts and history',
          intro:
            'Fix a typo or add something by editing your own post; everyone can see the edit history.',
          sample: {
            before: 'Anyone up for Hanabi tonight?',
            added: ' Starting at 8.',
          },
          steps: {
            open: 'Press “Edit” on your own post',
            type: 'Change the text',
            save: 'Press “Save”: the post is marked as edited',
            history: 'Click “edited N times” to see every version',
          },
          tips: {
            own: 'You can only edit your own posts; others’ posts only have “Reply”.',
            history:
              'Edit history is visible to everyone: the current version on top, the original at the bottom.',
            delete: 'Posts can’t be deleted for now—edit to fix mistakes.',
          },
        },
      },
      account: {
        nickname: {
          title: 'Changing your nickname',
          intro:
            'Your nickname is the name others see on play records, the board and elsewhere. It starts as your Discord name, and you can change it.',
          steps: {
            open: 'Click your avatar at the top right to open My settings',
            type: 'Type a new nickname',
            save: 'Press “Save”: the whole site switches to the new nickname',
            reset: 'To go back, press “Reset to …” to use your Discord name again',
          },
          tips: {
            where: 'Nicknames can be up to 50 characters.',
            unique: 'Nicknames don’t have to be unique, but pick one people will recognize.',
            login: 'Logging in with Discord again won’t overwrite the nickname you set.',
          },
        },
      },
      admin: {
        review: {
          title: 'Reviewing member-added games',
          intro:
            'Games members add by BGA slug are marked “Needs admin review”. Once an admin checks them and confirms, the label goes away.',
          steps: {
            find: 'Games marked “Needs admin review” in the list are waiting for a check',
            check:
              'Check the name, mechanisms and themes on the game page; press “Edit” to fix anything',
            confirm: 'If it all looks right, press “Confirm” to remove the label',
          },
          tips: {
            adminOnly: 'Only admins see the confirm box; other members just see the label.',
            noChange: '“Confirm” only removes the label; it doesn’t change any game data.',
            fullForm: 'Games admins add with the full form don’t need review.',
          },
        },
        sync: {
          title: 'Syncing mechanisms and themes from BGA',
          intro:
            'BGA adjusts the mechanism and theme tags of its games. Admins can update every game to BGA’s tags in one go.',
          ok: 'OK',
          steps: {
            open: 'On the Games page, press “Sync mechanisms & themes from BGA”',
            confirm: 'Confirm: manual changes to mechanisms and themes will be overwritten',
            result:
              'When done, it shows how many games were updated and any slugs BGA couldn’t find',
          },
          tips: {
            scope: 'Only games with a BGA slug are touched; ones BGA can’t find stay as they are.',
            newTags: 'New mechanisms and themes on BGA are added to the lists automatically.',
            nameEn: 'Games without an English name get one filled in.',
            single: 'To update just one game, press “Fill from BGA” on its edit page.',
          },
        },
      },
    },
  },
  adminGame: {
    titleNew: 'Add a game',
    titleEdit: 'Edit: {name}',
    name: 'Name',
    nameEn: 'English name (optional)',
    minPlayers: 'Min players',
    maxPlayers: 'Max players',
    minutes: 'Length (minutes)',
    bgaSlug: 'BGA slug',
    fillFromBga: 'Fill from BGA',
    slugHelp: 'The part after {param} in the BGA game page URL',
    openToCheck: ' (open to check ↗)',
    bggId: 'BGG id',
    imageUrl: 'Custom image URL (optional)',
    imageHelp: 'Leave empty to use the BGA images.',
    mechanisms: 'Mechanisms',
    themes: 'Themes',
    delete: 'Delete this game',
    confirmDelete: 'Delete “{name}”? It will also be removed from everyone’s wish lists.',
    bgaFound: 'BGA: {name}',
    filled: 'Filled in {fields}',
    nothingToFill: 'No empty fields to fill',
    kept: '{fields} already had values and were kept',
    tagsReplaced:
      'Mechanisms and themes replaced with the ones on BGA ({mechanisms} mechanisms, {themes} themes)',
    unknownTags: '{n} BGA tags are missing here; use “Sync from BGA” on the games list to add them',
  },
  adminMechanism: {
    title: 'Edit: {name}',
    name: 'Name',
    nameEn: 'English name (optional)',
    description: 'Description',
    gamesNote:
      'Games come from the BGA sync and can also be ticked on each game’s edit page (currently {n}).',
    delete: 'Delete this mechanism',
    confirmDelete: 'Delete “{name}”?',
  },
}

export default en
