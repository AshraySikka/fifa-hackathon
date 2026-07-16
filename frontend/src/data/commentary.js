// Fake live commentary for demo purposes only -- Canada vs Mexico,
// BMO Field Toronto (matches fixtures/matches.json id 1). Not real match
// data. Swap for a real feed (see README note on ESPN's commentary
// endpoint) after the hackathon if you want to keep building this.
export const DEMO_MATCH = { team_a: "Canada", team_b: "Mexico", venue: "BMO Field, Toronto" };

export const DEMO_COMMENTARY = [
  { minute: "3'", text: "Canada win an early corner. Davies swings it in, headed clear by Araujo." },
  { minute: "12'", text: "Yellow card for Mexico's Gallardo -- late challenge on Buchanan just past the halfway line." },
  {
    minute: "34'",
    text: "GOAL DISALLOWED -- Canada thought they'd taken the lead through David, but the assistant's flag is up. Replay shows David's shoulder was level with the last defender when the ball was played -- razor tight.",
    tag: "offside",
    suggestedQuestion: "Why was Canada's goal in the 34th minute disallowed for offside?",
  },
  { minute: "41'", text: "Mexico string together their best move of the half, Jimenez curls just wide of the far post." },
  { minute: "45+2'", text: "Half-time: still 0-0 at BMO Field." },
  {
    minute: "58'",
    text: "Penalty shout for Mexico! Jimenez goes down under a challenge from Johnston inside the box. Referee waves play on -- no penalty given, and VAR is checking for a possible missed spot kick.",
    tag: "penalty",
    suggestedQuestion: "Why did the referee not award Mexico a penalty in the 58th minute after Jimenez went down in the box?",
  },
  {
    minute: "61'",
    text: "VAR review complete -- referee stays with the on-field decision, no penalty. Contact was there but the officials judged Jimenez initiated it, not Johnston.",
  },
  {
    minute: "73'",
    text: "RED CARD -- Mexico's Araujo is off! Second yellow for a professional foul, pulling back Larin as he broke clear on goal.",
    tag: "red-card",
    suggestedQuestion: "Why was Araujo sent off in the 73rd minute for pulling back Larin?",
  },
  {
    minute: "79'",
    text: "Canada make the man advantage count -- David finishes coolly after a driving run from Buchanan. 1-0 Canada!",
  },
  {
    minute: "85'",
    text: "HANDBALL shout in the Canada box as Mexico push for an equalizer -- referee says the arm was in a natural position, waves it away.",
    tag: "handball",
    suggestedQuestion: "Why wasn't that handball in the box given as a penalty in the 85th minute?",
  },
  { minute: "90+4'", text: "Full time: Canada 1-0 Mexico at a rocking BMO Field." },
];
