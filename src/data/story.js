/**
 * src/data/story.js
 * ---------------------------------------------------------------
 * GrimPass — Narrative and cutscenes (English).
 *
 * Premise: The player is a "Soul Wanderer", a spirit trapped
 * between life and the afterlife. To find peace, they must
 * cross GrimPass — a haunted realm of shadows, wraiths, and
 * lost souls.
 *
 * 9 cutscenes play after levels 10, 20, ..., 90, and one
 * ending after level 100.
 * ---------------------------------------------------------------
 */

export const story = {
  intro: 'On the threshold of life and death, a soul wanders lost.\nNameless, purposeless — only a fading lantern remains.\n\nFace the darkness. Find the path. Cross GrimPass.',

  ending: {
    title: 'PEACE',
    text: 'The lantern fades. The shadows recede. After passing\nthrough ten worlds of darkness, the Soul Wanderer has\nfinally found the peace they sought.\n\nYet GrimPass endures...\nawaiting the next lost soul.'
  }
};

// 9 cutscenes — played after level 10, 20, 30, ..., 90
const CUTSCENES = {
  10: {
    title: 'Edge of the World',
    text: 'The first step has been taken. The shadows whisper\nyour name — they recognize your presence.\n\nDo not trust the voices that call from behind.'
  },
  20: {
    title: 'Forgotten Trail',
    text: 'Here, memories wither like leaves in autumn.\nYou are not the first to walk this path.\n\nOthers have fallen. Do not be the next.'
  },
  30: {
    title: 'The Abyss',
    text: 'A depthless void stares back. Do not look down —\nthe Abyss savors fear.\n\nKeep moving. Forward, never down.'
  },
  40: {
    title: 'Garden of Bones',
    text: 'Rest here, if you dare.\n\nThe dead do not rise. Yet they hear\nevery breath you take.'
  },
  50: {
    title: 'Cursed Ruins',
    text: 'These ancient stones remember everything.\n\nAn old power pulses behind the cracked\nwalls. Touch nothing that glows.'
  },
  60: {
    title: 'Shadowlands',
    text: 'Light is but a memory here.\nOnly your small lantern can be trusted.\n\nThe shadows are not enemies — they are\nfriends who have forgotten their shape.'
  },
  70: {
    title: 'Cursed Peak',
    text: 'The peak tests all who climb.\n\nThe wind carries voices from the past.\nFew reach the summit. Fewer still descend\nwith their mind intact.'
  },
  80: {
    title: 'Sea of Souls',
    text: 'The Sea of Souls calls. Millions of lost spirits\ndrift aimless beneath its surface.\n\nWill you answer their call?\nOr remain above, at the edge?'
  },
  90: {
    title: 'The Void',
    text: 'The Void awaits. There is no return\nfrom nothingness.\n\nOne step more. Only one.\nAnd GrimPass will open.'
  }
};

export function getCutsceneStory(levelNumber) {
  return CUTSCENES[levelNumber] || null;
}
