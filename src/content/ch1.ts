/* ---------------------------------------------------------------------------
   Chapter 1 — Signal.

   From a memory of a convention to a region. You know a sona name and a face
   that was made of foam. By the end of this chapter you know who Vale is in
   the fandom, and roughly where in the country they wake up.
--------------------------------------------------------------------------- */

import type { Chapter, Clue, SourceDoc } from "../engine/types.ts";
import { CAST, VALE } from "./people.ts";
import { bskyProfile, bskyThread } from "../platforms/bluesky.ts";
import { faJournalPage, faUser } from "../platforms/furaffinity.ts";
import { redditThread } from "../platforms/reddit.ts";
import { telegramGroup } from "../platforms/chat.ts";
import { fandomArticle, wayback } from "../platforms/wikis.ts";
import { toyhouseCharacter } from "../platforms/creator.ts";

export const CH1: Chapter = {
  id: 1,
  name: "Signal",
  goal: "Work out who Vale is in the fandom, and what part of the country they're in.",
  startTerms: ["vale maned wolf", "midwest furfest"],
  keyClues: [
    "vale_sona",
    "vale_species",
    "vale_handle",
    "vale_art",
    "vale_con",
    "vale_tell",
    "vale_hours",
    "vale_region_midwest",
  ],
  opening: `
Midwest FurFest, December. You were in the headless lounge with your head in your lap and a bottle of water you'd been nursing for an hour, and someone sat down next to you and said "oh thank god, another person who's dying."

Four hours. You talked about everything. They showed you the badge they'd made — laminated, hand-cut, a little wolf-head glyph in the corner instead of a signature. You told them your sona name and they told you theirs.

Vale. A maned wolf, sunset markings, and the best listener you have met in your life.

Then your phone died, and the parade was lining up, and you said "I'll find you, you're not exactly hard to find," and you were wrong about that.

It has been eight months. Their accounts keep going quiet one at a time, and you have started to think that is not an accident.
`,
  closing: `
You have a shape now. Not a name — a shape. Vale draws badges, signs them with a wolf's head, and lives somewhere the sun sets an hour later than they'd like you to believe.

The Pacific Northwest thing was a lie. A small, careful, deliberate lie, kept up for two years across three accounts, and the only reason you caught it is that nobody can fake what time they're tired.

Central time. The Midwest. That is still eleven million people.

But it's a smaller internet than it was this morning.
`,
};

/* --- clues ---------------------------------------------------------------- */

export const CH1_CLUES: readonly Clue[] = [
  {
    id: "vale_sona",
    person: "vale",
    slot: "sona",
    label: "Vale",
    detail: "The name they gave you in the headless lounge. It's the same name they use everywhere.",
    provenance: "open",
    source: "vale_bsky",
    unlocks: ["vale toyhouse ref"],
  },
  {
    id: "vale_species",
    person: "vale",
    slot: "species",
    label: "Maned wolf",
    detail: "Not a fox, not a wolf, and they will correct you about it politely and completely.",
    provenance: "open",
    source: "vale_bsky",
  },
  {
    id: "vale_handle",
    person: "vale",
    slot: "handle",
    label: "@valemaned",
    detail: "One handle, reused across every site. Consistent to the point of being a liability.",
    provenance: "open",
    source: "vale_bsky",
    unlocks: ["valethemaned fur affinity"],
  },
  {
    id: "vale_region_pnw",
    person: "vale",
    slot: "region",
    label: "Pacific Northwest",
    detail: "It's right there in the bio, and it has been for two years.",
    provenance: "open",
    source: "vale_bsky",
    untrue: true,
  },
  {
    id: "vale_art",
    person: "vale",
    slot: "art",
    label: "Con badges — lineless, hard backlight",
    detail:
      "Laminated hand-cut badges, no linework, one strong rim light from behind. It's a whole look and it's theirs.",
    provenance: "open",
    source: "vale_fa",
  },
  {
    id: "vale_con",
    person: "vale",
    slot: "con",
    label: "MFF 2024, parade block 14",
    detail: "Photographed in the fursuit parade lineup. Same suit, same badge, same afternoon you met them.",
    provenance: "open",
    source: "parade_thread",
  },
  {
    id: "vale_tell",
    person: "vale",
    slot: "tell",
    label: "Signs with a wolf-head glyph",
    detail:
      "Never initials, never a watermark. A four-stroke wolf head in the bottom corner of everything they've ever finished.",
    provenance: "open",
    source: "vale_toyhouse",
    unlocks: ["valethemaned deleted journal"],
  },
  {
    id: "vale_hours",
    person: "vale",
    slot: "schedule",
    label: "Online 6–10pm Central, silent 8–3 on weekdays",
    detail:
      "Eight months of group chat timestamps. They vanish for the exact length of a school day and come back tired.",
    provenance: "open",
    source: "midwest_telegram",
    overturns: "vale_region_pnw",
  },
  {
    id: "vale_region_midwest",
    person: "vale",
    slot: "region",
    label: "Midwest — Central time",
    detail:
      "They complained about a storm two hours before it reached anyone on the coast, and nobody noticed but you.",
    provenance: "open",
    source: "midwest_telegram",
  },
  /* --- the body in the suit ------------------------------------------------
     What Vale looks like when they're being Vale, and the numbers that follow
     them around. Both are the kind of detail you only get by looking hard.
  ------------------------------------------------------------------------ */
  {
    id: "vale_suit",
    person: "vale",
    slot: "suit",
    label: "Partial — head, handpaws, tail. Sunset gradient, cream chest",
    detail:
      "Not a full suit. Head, handpaws and tail over their own clothes, with a hand-cut badge clipped to the harness.",
    provenance: "open",
    source: "parade_thread",
  },
  {
    id: "vale_build",
    person: "vale",
    slot: "build",
    label: "About 5'6\", left-handed",
    detail:
      "Waves with the left in every parade frame, and stands a full head under Sprocket, who lists himself at six foot.",
    provenance: "open",
    source: "parade_thread",
  },
  {
    id: "vale_ident",
    person: "vale",
    slot: "ident",
    label: "FA member since Mar 2016 · Toyhouse since Jan 2017",
    detail:
      "Two registration dates eleven months apart, both under the same handle, neither ever changed.",
    provenance: "open",
    source: "vale_toyhouse",
  },

  /* --- relationships ------------------------------------------------------ */
  {
    id: "vale_link_bramble",
    person: "vale",
    link: { to: "bramble", label: "Four years in Bramble's chat. Bramble has never seen their face." },
    label: "In Bramble's regional chat",
    detail:
      "Bramble runs Midwest Furs and once checked the logs because he thought Vale had blocked him.",
    provenance: "open",
    source: "midwest_telegram",
  },
  {
    id: "vale_link_poplar",
    person: "vale",
    link: {
      to: "poplar",
      label: "Vale told Poplar they'd go quiet rather than explain. Poplar didn't ask what that meant.",
    },
    label: "Told Poplar they'd just go quiet",
    detail:
      "The only person Vale ever gave a warning to, and it was oblique enough that Poplar let it pass.",
    provenance: "open",
    source: "midwest_telegram",
  },
  {
    id: "vale_link_sprocket",
    person: "vale",
    link: { to: "sprocket", label: "Sprocket wears one of Vale's badges and tags them in everything." },
    label: "Made Sprocket's badge",
    detail:
      "He's the one who identified Vale in the parade gallery, unprompted, in public, with a tag.",
    provenance: "open",
    source: "parade_thread",
  },
  {
    id: "vale_link_quillon",
    person: "vale",
    link: { to: "quillon", label: "Quillon offered help with something. Neither of them names it." },
    label: "Quillon knows what happened",
    detail:
      "\"The offer stands, whatever it was.\" Two months ago, on a public page, from someone being careful.",
    provenance: "open",
    source: "vale_fa",
  },
  {
    id: "vale_reason",
    person: "vale",
    slot: "reason",
    label: "Someone at work found their gallery",
    detail:
      "A journal they deleted eleven minutes after posting. It survived because a crawler was faster than they were.",
    provenance: "private",
    source: "vale_wayback",
  },
];

/* --- sources -------------------------------------------------------------- */

export const CH1_SOURCES: readonly SourceDoc[] = [
  {
    id: "mff_wiki",
    platform: "fandom",
    url: "wikifur.fandom.com/wiki/Midwest_FurFest",
    title: "Midwest FurFest | WikiFur | Fandom",
    blurb:
      "Midwest FurFest (MFF) is an annual furry convention held in Rosemont, Illinois, near Chicago. It is one of the largest furry conventions in the world.",
    chapter: 1,
    terms: ["midwest furfest", "mff", "mff 2024", "furry convention illinois"],
    unlocks: ["fursuit parade 2024 photos", "headless lounge mff"],
    body: fandomArticle({
      wiki: "WikiFur",
      title: "Midwest FurFest",
      lede: `*Midwest FurFest* (commonly *MFF*) is an annual furry convention held each December in Rosemont, Illinois, immediately outside Chicago. It is among the largest furry conventions in the world by attendance and is known for its fursuit parade, its dealers' den, and its charity auction.`,
      infobox: {
        title: "Midwest FurFest",
        rows: [
          { key: "Status", value: "Active" },
          { key: "Location", value: "Rosemont, Illinois" },
          { key: "Venue", value: "Donald E. Stephens Convention Center" },
          { key: "First held", value: "2000" },
          { key: "Dates", value: "Early December" },
          { key: "Attendance", value: "14,000+" },
        ],
      },
      sections: [
        {
          heading: "Fursuit parade",
          body: `The fursuit parade is the convention's most photographed event. Suiters queue in numbered blocks in the second-floor corridor, and the line regularly stretches the length of the building. Blocks are assigned on the morning of the parade and are not published in advance.

Attendees who are not in suit line the route. It is common for photographers to post full sorted galleries within a week, tagged by block, which is the only reason anyone can find themselves afterwards.`,
        },
        {
          heading: "Headless lounge",
          body: `A quiet, air-conditioned room where suiters can remove their heads, drink water, and cool down out of public view. Photography is prohibited. It is, by long tradition, where most of the convention's actual conversations happen.`,
        },
        {
          heading: "Regional communities",
          body: `Attendance draws heavily from the surrounding states, and most of that turnout is organised through year-round regional groups rather than by the convention itself. These are not run by MFF and are not listed in convention materials.

The largest for the immediate region is the Midwest Furs group chat, at {{go:midwest_telegram|t.me/midwestfurs}}, covering Illinois, Wisconsin, Iowa and Indiana, and handling meets, carpools and room shares. Smaller city-level servers sit beneath it and are generally invite-only; the usual way in is to ask in the regional chat and wait for somebody to post a link.`,
        },
        {
          heading: "Culture",
          bullets: [
            `The convention runs a charity auction each year benefiting a local animal-welfare organization; totals are announced at closing ceremonies.`,
            `"Con crud" — the respiratory infection that reliably follows fourteen thousand people sharing air for four days — is discussed with the resignation of an annual weather event.`,
            `Badge trading is common. Many attendees make and sell hand-cut laminated badges in the dealers' den or informally in hallways.`,
          ],
        },
      ],
    }).body,
  },

  {
    id: "vale_bsky",
    platform: "bluesky",
    url: "bsky.app/profile/valemaned.bsky.social",
    title: "Vale (@valemaned.bsky.social) — Bluesky",
    blurb:
      "maned wolf. badges + refs. comms closed indefinitely, sorry. PNW. be nice to each other.",
    chapter: 1,
    terms: ["vale maned wolf", "valemaned", "vale bluesky", "vale badges"],
    unlocks: ["valethemaned fur affinity"],
    body: bskyProfile({
      sona: VALE,
      handle: "valemaned.bsky.social",
      followers: 2140,
      following: 311,
      joined: "November 2023",
      bio: `{{c:vale_sona|Vale}}. {{c:vale_species|maned wolf}}, she/they on good days, they/them on the rest. badges + refs. comms closed indefinitely, sorry. {{c:vale_region_pnw|PNW}} 🌲 be nice to each other.`,
      pinned: `comms are closed and I'm not going to say for how long, because every time I've given a date I've been wrong. thank you for being patient with me.`,
      posts: [
        {
          author: VALE,
          handle: "valemaned",
          time: "3mo",
          text: `going to be off here for a bit. nothing's wrong, I'm just tired in a way that scrolling isn't fixing.

if you have a badge in the queue you will get it. that has never been the thing I drop.`,
          replies: 41,
          reposts: 6,
          likes: 380,
        },
        {
          author: CAST.cobble,
          handle: "cobbleotter",
          time: "3mo",
          replyTo: "valemaned",
          text: `take all the time you need. you've earned about nine years of it`,
          likes: 22,
        },
        {
          author: VALE,
          handle: "valemaned",
          time: "5mo",
          text: `unpopular opinion but the reason people keep asking me to draw their sona "like mine" is not the palette, it's that I put the light *behind* them. it costs nothing. put a rim light on your guy. give him a spine.`,
          replies: 18,
          reposts: 74,
          likes: 910,
        },
        {
          author: VALE,
          handle: "valemaned",
          time: "6mo",
          text: `someone at the meet asked what my "real" name is and I said Vale and they said no like your real one and I said Vale again and they laughed like I was doing a bit.

I was not doing a bit.`,
          replies: 63,
          reposts: 210,
          likes: 2400,
        },
        {
          author: VALE,
          handle: "valemaned",
          time: "8mo",
          text: `every single year I say I'm not suiting in July and every single year I suit in July and every single year I am proven correct that suiting in July is a war crime`,
          replies: 12,
          reposts: 31,
          likes: 640,
        },
        {
          author: VALE,
          handle: "valemaned",
          time: "8mo",
          text: `handle check, because someone asked: I'm {{c:vale_handle|@valemaned}} everywhere. bsky, FA, telegram, all of it. I made that decision when I was twenty two and I think about undoing it roughly once a week.`,
          replies: 9,
          reposts: 4,
          likes: 188,
        },
        {
          author: VALE,
          handle: "valemaned",
          time: "11mo",
          text: `MFF recovery day 3. still coughing. worth it. the headless lounge is the only real place at that convention and I will not be taking questions`,
          replies: 27,
          reposts: 44,
          likes: 1100,
        },
      ],
    }).body,
  },

  {
    id: "vale_fa",
    platform: "furaffinity",
    url: "furaffinity.net/user/valemaned/",
    title: "Userpage of valemaned — Fur Affinity [dot] net",
    blurb:
      "Artist profile. Badges and reference sheets. Commissions: CLOSED. Registered since 2016.",
    chapter: 1,
    terms: ["valethemaned fur affinity", "valemaned fa", "vale fur affinity", "vale badges"],
    unlocks: ["vale kofi"],
    body: faUser({
      sona: VALE,
      handle: "valemaned",
      status: "commissions CLOSED — please read the journal before noting me",
      registered: "Mar 4, 2016",
      profile: `Hi. I'm Vale.

I make {{c:vale_art|hand-cut laminated con badges, lineless, with a hard backlight}}. That's the whole shop. I don't do NSFW, I don't do mecha, and I am not going to draw your character holding a gun, sorry, it's a badge, they're supposed to look happy.

*TOS in full below. Please actually read it.*

— half up front, half on approval of the sketch
— you get one round of changes on the sketch and one on the flats
— I will not draw someone else's character without a screenshot of them saying yes
— turnaround is four to six weeks and if it's going to be longer you will hear it from me first

I do this in the evenings. I have a day job that eats the daylight, so if you note me at 2pm and I answer at 9pm, that's why, and it is not a reflection of how much I like you.

Ko-fi is in my links if the queue is closed and you still want to throw three dollars at a scanner fund. It is a very old scanner.`,
      stats: { views: 184_302, submissions: 214, favs: 1_988, watchers: 3_104 },
      gallery: [
        {
          title: "MFF badge batch — thank you all",
          alt: "Nine laminated badges fanned out on a hotel bedspread. Every one is lineless with a strong orange rim light. A small dark glyph sits in the bottom right corner of each.",
        },
        {
          title: "Sundog ref — commission",
          alt: "A full reference sheet for a coyote sona named Sundog. Front, back, headshot, palette swatches with hex codes.",
        },
        {
          title: "badge YCH — 3 slots — CLOSED",
          alt: "A your-character-here template: a generic canid leaning on a railing, lit from behind, with the face left blank.",
        },
        {
          title: "practice — hands, again, forever",
          alt: "Two pages of hand studies in the same lineless style, unsigned.",
        },
      ],
      journals: [
        {
          title: "comms closed",
          posted: "3 months ago",
          body: `Closing the queue after the current batch. Everyone who has paid will be finished — that is not in question, please don't note me about it, you will get your badge.

I'm not going to explain this one. I'd rather be vague and still be here than be honest and not.

Thank you for eight really good years of this.`,
        },
        {
          title: "TOS update — please read even if you've commissioned me before",
          posted: "1 year ago",
          body: `Two changes.

One: I'm no longer taking commissions through Instagram DMs. Note me here or email. I need everything in one place.

Two: I'm not doing name reveals in credit lines anymore. If you post something I made for you, credit "Vale" or "@valemaned" and nothing else. I know that's a strange ask. Please just do it.`,
        },
        {
          title: "MFF post-mortem",
          posted: "1 year ago",
          body: `Badge batch sold out by Saturday afternoon which has never happened before. Thank you.

Best part of the con was not the table. It was sitting in the headless lounge on Saturday with someone I had never met, for four hours, about nothing. I did not get their handle. I have thought about that every day since, in an annoyed way.

If that was you: hello. I'm bad at this.`,
        },
      ],
      shouts: [
        {
          author: CAST.quill,
          handle: "quillonmakes",
          time: "2 months ago",
          text: `{{c:vale_link_quillon|hope you're doing okay. the offer stands, whatever it was.}} you know where I am.`,
        },
        {
          author: CAST.sprocket,
          handle: "sprocketproto",
          time: "4 months ago",
          text: `BADGE ARRIVED. it's so shiny. my whole personality now. thank you thank you`,
        },
      ],
    }).body,
  },

  {
    id: "parade_thread",
    platform: "bluesky",
    url: "bsky.app/profile/shutterbugfox.bsky.social/post/3kq2parade",
    title: "MFF fursuit parade 2024 — full gallery, sorted by block",
    blurb:
      "900 photos, sorted by parade block, alt text on everything. If you were in the parade you are in here somewhere.",
    chapter: 1,
    terms: ["fursuit parade 2024 photos", "mff parade gallery", "mff 2024 parade"],
    body: bskyThread({
      root: {
        author: CAST.shutter,
        handle: "shutterbugfox",
        time: "Dec 2024",
        text: `MFF 2024 FURSUIT PARADE — full gallery is up. 900 photos, sorted by block, alt text on every single one because I am not a coward.

Blocks 1–8 in this thread. 9–20 in the reply below. Find yourself, tag yourself, please don't repost without credit.`,
        replies: 88,
        reposts: 640,
        likes: 3200,
      },
      replies: [
        {
          author: CAST.shutter,
          handle: "shutterbugfox",
          time: "Dec 2024",
          text: `BLOCK 14 — this was the good one. Best light of the whole parade, the corridor windows were doing something incredible around 2pm.`,
          image: {
            alt: `Wide shot of a numbered parade block in a convention corridor. Front row centre is {{c:vale_suit|a maned wolf partial — head, handpaws and tail over ordinary clothes, sunset gradient down the muzzle fading to a cream chest}}, one arm up mid-wave. Clipped to the harness is a hand-cut laminated badge with a small dark glyph in the corner.`,
            caption: `{{c:vale_con|Block 14, MFF 2024}} — maned wolf front row, if that's you please say hi, this is my favourite frame of the entire weekend`,
          },
          replies: 14,
          likes: 420,
        },
        {
          author: CAST.sprocket,
          handle: "sprocketproto",
          time: "Dec 2024",
          replyTo: "shutterbugfox",
          text: `{{c:vale_link_sprocket|THAT'S VALE!! that's @valemaned, they made my badge. tagging them so they see this}}`,
          likes: 61,
        },
        {
          author: CAST.shutter,
          handle: "shutterbugfox",
          time: "Dec 2024",
          replyTo: "sprocketproto",
          text: `oh perfect, thank you. Vale if you want the raw of this one it's yours, just note me`,
          likes: 30,
        },
        {
          author: CAST.shutter,
          handle: "shutterbugfox",
          time: "Dec 2024",
          text: `photographer note for anyone doing composites off these: {{c:vale_build|the maned wolf in block 14 waves with the left hand in all eleven frames I have of them, and stands a clear head shorter than Sprocket, who lists six foot on everything}}. Scale accordingly.`,
          likes: 18,
        },
        {
          author: CAST.marrow,
          handle: "marrowsergal",
          time: "Nov 2025",
          replyTo: "shutterbugfox",
          text: `coming back to this thread a year later because someone asked me who did lineless badges with the backlight thing. it's this person. it's always been this person.`,
          likes: 12,
        },
      ],
    }).body,
  },

  {
    id: "midwest_telegram",
    platform: "telegram",
    url: "t.me/midwestfurs",
    title: "Midwest Furs — Telegram group chat",
    blurb:
      "Regional chat for furs in IL / WI / IA / IN. Meet planning, con carpools, and a great deal of nonsense.",
    chapter: 1,
    // Not indexed anywhere. You get in by following the invite off WikiFur.
    terms: [],
    unlocks: ["rockford furmeet"],
    body: telegramGroup({
      group: "Midwest Furs",
      members: "1,204 members, 87 online",
      pinned:
        "MEET RULES: no drama, no politics on main, tag NSFW, and if you're new say hi with your sona name and roughly where you are. City servers are invite only — ask in here and someone will link you. Rockford is at {{go:local_discord|discord.gg/rockriverfurs}}. — Bramble",
      days: [
        {
          date: "March 14",
          lines: [
            {
              who: "Bramble",
              sona: CAST.bramble,
              time: "18:02",
              text: `reminder that the spring meet is the 12th, bowling then Denny's, same as every year, do not suggest a different Denny's`,
            },
            {
              who: "Sprocket",
              sona: CAST.sprocket,
              time: "18:04",
              text: `the Denny's is load-bearing`,
            },
            {
              who: "Vale",
              sona: VALE,
              time: "18:41",
              text: `I can do the 12th. can't do anything before 4 though, {{c:vale_hours|I'm never free before four on a weekday and I'm useless until about six}}`,
            },
            {
              who: "Poplar",
              sona: CAST.poplar,
              time: "18:43",
              text: `vale never free before 4, tale as old as time`,
            },
            {
              who: "Vale",
              sona: VALE,
              time: "18:44",
              text: `it's a job. it's a normal job. stop`,
            },
          ],
        },
        {
          date: "April 2",
          lines: [
            {
              who: "Vale",
              sona: VALE,
              time: "19:55",
              text: `{{c:vale_region_midwest|there is a wall of green coming at us on the radar right now and I'm supposed to drive in forty minutes}}`,
            },
            {
              who: "Tessellate",
              sona: CAST.tessellate,
              time: "19:57",
              text: `nothing here yet? sky's completely clear`,
            },
            {
              who: "Vale",
              sona: VALE,
              time: "19:57",
              text: `give it two hours`,
            },
            {
              who: "Tessellate",
              sona: CAST.tessellate,
              time: "22:10",
              text: `okay it's here. how did you know that`,
            },
            {
              who: "Vale",
              sona: VALE,
              time: "22:11",
              text: `because weather moves east, tess`,
            },
            {
              who: "Bramble",
              sona: CAST.bramble,
              time: "22:14",
              text: `vale is west of tess confirmed. the group chat has become a barometer`,
            },
            {
              who: "Vale",
              sona: VALE,
              time: "22:15",
              text: `please don't`,
              note: "this message was edited",
            },
          ],
        },
        {
          date: "June 20",
          lines: [
            {
              who: "Poplar",
              sona: CAST.poplar,
              time: "12:30",
              text: `anyone around? bored at lunch`,
            },
            {
              who: "Sprocket",
              sona: CAST.sprocket,
              time: "12:31",
              text: `here! wfh gang`,
            },
            {
              who: "Poplar",
              sona: CAST.poplar,
              time: "12:31",
              text: `vale?`,
            },
            {
              who: "Bramble",
              sona: CAST.bramble,
              time: "12:34",
              text: `{{c:vale_link_bramble|vale has never once answered between eight in the morning and three in the afternoon on a weekday. in four years. I checked once because I thought they'd blocked me}}`,
            },
            {
              who: "Vale",
              sona: VALE,
              time: "16:12",
              text: `I have not blocked you Bramble. I was at work. I am always at work`,
            },
            {
              who: "Vale",
              sona: VALE,
              time: "16:12",
              text: `and now I am going to lie on the floor`,
            },
          ],
        },
        {
          date: "September 8",
          lines: [
            {
              who: "Bramble",
              sona: CAST.bramble,
              time: "20:15",
              text: `has anyone heard from vale`,
            },
            {
              who: "Quillon",
              sona: CAST.quill,
              time: "20:22",
              text: `not since july. their FA's still up but the journals stopped`,
            },
            {
              who: "Poplar",
              sona: CAST.poplar,
              time: "20:40",
              text: `{{c:vale_link_poplar|they told me once that if anything ever happened they'd just go quiet rather than explain. I didn't ask what "anything" meant. I wish I had}}`,
            },
            {
              who: "Bramble",
              sona: CAST.bramble,
              time: "20:44",
              text: `leave it. if someone wants to be gone, they're allowed to be gone`,
            },
          ],
        },
      ],
    }).body,
  },

  {
    id: "vale_toyhouse",
    platform: "toyhouse",
    url: "toyhou.se/valemaned/characters/vale",
    title: "Vale — Toyhouse",
    blurb:
      "Character profile and reference sheet. Owner: valemaned. Not for trade, not for sale, do not ask.",
    chapter: 1,
    terms: ["vale toyhouse ref", "vale toyhouse", "vale ref sheet"],
    requires: ["vale_sona"],
    body: toyhouseCharacter({
      sona: VALE,
      owner: "valemaned",
      created: "12 Jan 2017",
      designer: "self — {{c:vale_tell|signed with a four-stroke wolf head instead of initials}}",
      tags: ["maned wolf", "canine", "SFW only", "not for trade", "personal sona"],
      refAlt: `Reference sheet, three views. A maned wolf with a sunset gradient running from the muzzle down the chest — deep orange at the nose fading to cream. Palette swatches along the bottom with hex codes. In the bottom right corner, small and dark, a four-stroke wolf head.`,
      profile: `Vale. Maned wolf. Eight years old as a character and I have redesigned them exactly twice, both times badly, both times reverted within a month.

*The markings are not optional.* If you're drawing Vale for a trade: the gradient goes muzzle-to-chest, warm to cream, and it is a gradient, not three stripes. I have received three stripes eleven times. I am not angry. I am simply going to keep saying it.

Not for trade. Not for sale. Not available for adoption, redesign, or "inspired by". This is not me being precious about a drawing — this is the only thing on the internet that is entirely mine, and I would like to keep it that way.

If you see this design somewhere I didn't put it, please tell me.`,
      log: [
        { when: "Jan 2017", what: "{{c:vale_ident|Created by valemaned — account registered Jan 2017, eleven months after their Fur Affinity registration in March 2016}}" },
        { when: "Mar 2019", what: "Design refresh — gradient extended to chest" },
        {
          when: "Aug 2023",
          what: "Profile set to *hidden from search* — reverted 4 days later",
        },
        { when: "Jul 2025", what: "Last edited by owner" },
      ],
    }).body,
  },

  {
    id: "reddit_lost",
    platform: "reddit",
    url: "reddit.com/r/furry/comments/1cq8x2/did_anyone_else_lose_someone_at_mff",
    title: "Did anyone else lose someone at MFF? : r/furry",
    blurb:
      "I talked to somebody for four hours in the headless lounge and never got their handle. Tell me I'm not the only one.",
    chapter: 1,
    terms: ["headless lounge mff", "lost contact mff", "lost someone at a con"],
    unlocks: ["fursuit parade 2024 photos"],
    body: redditThread({
      sub: "r/furry",
      title: "Did anyone else lose someone at MFF?",
      user: "quietpawsteps",
      time: "11 months ago",
      score: 4820,
      flair: "Discussion",
      body: `Not a missed connection post, I promise. Or — okay. It's exactly a missed connection post.

Headless lounge, Saturday afternoon. Sat next to somebody for four hours. Talked about literally everything: how you get into this, how you tell your family, whether you ever do. They were kind about it in a way I wasn't expecting.

Traded sona names. Meant to trade handles. The parade started lining up and I said "I'll find you" like an absolute clown.

Anyway. Does this happen to everyone or is it just me`,
      comments: [
        {
          user: "brambleward",
          score: 1204,
          time: "11 months ago",
          body: `Every single con. Every one. The headless lounge is a liminal space where you have the best conversation of your life with someone whose name you will never learn.

Practical advice for next time: the parade photographers post sorted galleries within about a week, tagged by block. If you know roughly when they lined up you can usually find the suit. From the suit you can usually find the handle, because somebody in the replies always tags them.`,
          replies: [
            {
              user: "quietpawsteps",
              score: 340,
              time: "11 months ago",
              op: true,
              body: `That is a genuinely good idea and I feel stupid for not thinking of it. Thank you.`,
            },
          ],
        },
        {
          user: "sundog_yote",
          score: 890,
          time: "11 months ago",
          body: `the headless lounge is where the actual convention happens and the rest of it is scenery`,
        },
        {
          user: "throwaway_suiter",
          score: 611,
          time: "11 months ago",
          body: `Gentle counterpoint from the other side of this.

Sometimes the person doesn't give you their handle on purpose. Not because the conversation was bad — because for four hours they got to be a person with no last name, and handing you a handle is handing you a thread you can pull.

Some of us have jobs where that thread ends somewhere expensive. Just — if you do find them, let them decide how much of it they want back.`,
          replies: [
            {
              user: "brambleward",
              score: 402,
              time: "11 months ago",
              body: `This is the correct take and I should have led with it.`,
            },
            {
              user: "quietpawsteps",
              score: 188,
              time: "11 months ago",
              op: true,
              body: `...yeah. Okay. That's fair.`,
            },
          ],
        },
      ],
    }).body,
  },

  {
    id: "vale_wayback",
    platform: "wayback",
    url: "web.archive.org/web/2025/furaffinity.net/journal/10442817/",
    title: "Wayback Machine — valemaned journal (deleted)",
    blurb:
      "Archived capture of a Fur Affinity journal. The live page returns 404. Captured 11 minutes after posting.",
    chapter: 1,
    terms: ["valethemaned deleted journal", "vale deleted journal", "vale archive"],
    requires: ["vale_tell"],
    body: wayback({
      original: "furaffinity.net/journal/10442817/",
      captured: "2 Aug 2025",
      snapshots: 1,
      inner: faJournalPage({
        author: VALE,
        handle: "valemaned",
        journal: {
          title: "I need to say this once and then never again",
          posted: "Aug 2, 2025 — 11:48pm",
          body: `I'm going to delete this. I know I am. I'm writing it anyway because I have not slept.

{{c:vale_reason|Somebody I work with found this page. Two years ago now. It went around the staff group chat in about an hour.}}

Nobody did anything. That's the part I can't explain to people who ask why I'm like this. I didn't lose my job. There was no meeting. Nobody was cruel to my face, not once.

It just never stopped being a joke. Two years. Someone still does the howl thing when I walk into the break room. Two years of a small, friendly, completely unmalicious joke, and it turns out that is worse than being shouted at, because there is nothing to push back against. You cannot report a joke. You can only be the person it's about, forever, in a building you have to keep going back to.

So: I keep the two halves apart now. All of it. Different name, different everything, nothing that touches. If that has made me a worse friend to some of you — and I know it has — that's why.

I'm not sad. I want to be clear that I'm not sad. I have this, and this is good, and I got to sit in a room at a convention last December and talk to a stranger for four hours about being a person, and nobody in that room needed my last name for it to count.

I just wish I hadn't had to build a wall to get it.`,
        },
      }).body,
    }).body,
  },
];
