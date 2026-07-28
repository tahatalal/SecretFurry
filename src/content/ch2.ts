/* ---------------------------------------------------------------------------
   Chapter 2 — Circle.

   Central time is eleven million people. This chapter turns it into one city
   and about twenty regulars, and then into nine names — because the local
   scene has a foam supplier, and the foam supplier has an address.
--------------------------------------------------------------------------- */

import type { Chapter, Clue, SourceDoc } from "../engine/types.ts";
import { CAST, VALE } from "./people.ts";
import { bskyThread } from "../platforms/bluesky.ts";
import { redditThread } from "../platforms/reddit.ts";
import { discordChannel } from "../platforms/chat.ts";
import { etsyShop, kofiPage } from "../platforms/creator.ts";
import { facebookPost, mapsPlace, newsArticle } from "../platforms/civilian.ts";

export const CH2: Chapter = {
  id: 2,
  name: "Circle",
  goal: "Find the city, find the local group, and find out who in it could actually be Vale.",
  startTerms: ["rockford furmeet", "rock river furs", "midwest furs telegram"],
  keyClues: ["vale_city", "vale_circle", "vale_pet", "vale_work"],
  opening: `
There is a thing about regional furry scenes that outsiders never guess: they are tiny, and they are held together by supply chains.

Somebody has to sell the foam. Somebody has to own the serger. Somebody books the same room at the same bowling alley every spring, and somebody argues about which Denny's, and that argument has been running long enough to have factions.

Vale is in one of these. They said so — "the meet," "the 12th," "can't do anything before four." A person who guards their name that carefully still has to show up somewhere on a Saturday.

So stop looking for Vale. Look for the group Vale has to be standing in.
`,
  closing: `
Rockford, Illinois. Population a hundred and forty-seven thousand, of whom roughly twenty go bowling in fursuits every spring.

You have the group. You have the foam supplier, the Denny's, the mural on 7th Street with a four-stroke wolf's head hidden in the corner of it. You have a cat with one eye called Mackerel and a calendar that empties out every weekday between eight and three.

And you have nine people who could be standing behind all of it.

The next part is the part that can't be undone. Everything from here crosses over — from the half of the internet where Vale is a maned wolf, to the half where somebody has a last name and a payroll number.
`,
};

export const CH2_CLUES: readonly Clue[] = [
  {
    id: "vale_city",
    person: "vale",
    slot: "city",
    label: "Rockford, Illinois",
    detail:
      "Local pickup on an order from a fabric shop on Kishwaukee Street. You don't drive ninety miles for foam.",
    provenance: "crossed",
    source: "ferraro_maps",
    unlocks: ["rockford mural 7th street", "kishwaukee middle school"],
  },
  {
    id: "vale_circle",
    person: "vale",
    slot: "circle",
    label: "Rock River Furs — about twenty regulars",
    detail:
      "A Discord server for the Rockford area. Vale has been in it for four years and has never once posted a selfie.",
    provenance: "open",
    source: "local_discord",
    overturns: "vale_city_chicago",
    unlocks: ["ferraro fabric and foam"],
  },
  {
    id: "vale_pet",
    person: "vale",
    slot: "pet",
    label: "A one-eyed cat called Mackerel",
    detail:
      "Lost the left eye to something before they adopted her. Vale mentions her constantly and has never posted her face.",
    provenance: "open",
    source: "local_discord",
  },
  {
    id: "vale_work",
    person: "vale",
    slot: "work",
    label: "Works a school calendar",
    detail:
      "Free on institute days, dead through August prep week, and audibly falling apart in the third week of May.",
    provenance: "crossed",
    source: "local_discord",
    unlocks: ["kishwaukee middle school", "rockford school district calendar"],
  },
  /* --- relationships ------------------------------------------------------
     June Ferraro is the seam. She is not a furry and she is not hiding
     anything, and she is the only person in this town who is standing on both
     sides of the wall Vale spent two years building. --------------------- */
  {
    id: "vale_link_june",
    person: "vale",
    link: { to: "june", label: "June sold them foam, knows exactly who they are, and won't say it." },
    label: "June knows and won't say",
    detail:
      "She sold them six weeks of drop cloths and then told a public forum to ask itself why it wanted to know.",
    provenance: "open",
    source: "mural_reddit",
  },
  {
    id: "june_link_casey",
    person: "june",
    link: { to: "casey", label: "Casey buys his foam from June and lends the group his serger." },
    label: "Supplies Casey's builds",
    detail: "Half-inch foam, every build, for years. He credits her by name in the group.",
    provenance: "open",
    source: "makers_group",
  },
  {
    id: "june_link_marisol",
    person: "june",
    link: {
      to: "marisol",
      label: "Six weeks of drop cloths for a school mural. Marisol refused the discount.",
    },
    label: "Sold Marisol the mural supplies",
    detail:
      "Every Saturday for six weeks, full retail, out of her own pocket. June has opinions about that.",
    provenance: "open",
    source: "makers_group",
  },
  {
    id: "casey_link_vale",
    person: "casey",
    link: {
      to: "vale",
      label: "The group assumes the person who builds the suits is the person who draws them.",
      weak: true,
    },
    label: "Assumed to be the local artist",
    detail:
      "He owns the serger and makes the heads, so everyone rounds him off to 'the one who makes things'.",
    provenance: "open",
    source: "makers_group",
    untrue: true,
  },
  {
    id: "vale_city_chicago",
    person: "vale",
    slot: "city",
    label: "Chicago",
    detail: "Everyone assumes it. MFF is in Rosemont, Rosemont is Chicago, therefore.",
    provenance: "open",
    source: "meet_thread",
    untrue: true,
  },
  {
    id: "vale_contact",
    person: "vale",
    slot: "contact",
    label: "ko-fi.com/valemaned",
    detail:
      "Still live, still taking money, still the only door they left unlocked. Payouts route through a US bank in the 611 ZIP range.",
    provenance: "crossed",
    source: "vale_kofi",
    unlocks: ["rockford mural 7th street"],
  },
];

export const CH2_SOURCES: readonly SourceDoc[] = [
  {
    id: "local_discord",
    platform: "discord",
    url: "discord.com/channels/rockriverfurs/general",
    title: "Rock River Furs — #general",
    blurb:
      "Regional server for furs in the Rockford / Rock River valley area. Meets, rides, and an unresolvable argument about Denny's.",
    chapter: 2,
    terms: ["rock river furs", "rockford furmeet", "rockford furry discord"],
    unlocks: ["ferraro fabric and foam", "rockford mural 7th street"],
    body: discordChannel({
      server: "Rock River Furs",
      channel: "general",
      topic: "Rockford + Rock River valley · meets on the 12th · be normal",
      channels: ["welcome", "general", "meets", "makers", "art-share", "vent"],
      days: [
        {
          date: "March 3",
          lines: [
            {
              who: "Bramble",
              sona: CAST.bramble,
              time: "7:14 PM",
              text: `{{c:vale_circle|twenty-two people in here and about nine who actually come to things}}, which is the correct ratio for a city this size`,
            },
            {
              who: "Poplar",
              sona: CAST.poplar,
              time: "7:15 PM",
              text: `nine is a good number! nine fits in a Denny's booth section`,
            },
            {
              who: "Vale",
              sona: VALE,
              time: "7:41 PM",
              text: `nine does not fit in a booth section. nine has never fit in a booth section. we have tried this`,
            },
          ],
        },
        {
          date: "March 19",
          lines: [
            {
              who: "Vale",
              sona: VALE,
              time: "4:20 PM",
              text: `{{c:vale_work|institute day, so I am free at four o'clock on a Wednesday like a normal human being}}. someone appreciate this with me`,
            },
            {
              who: "Sprocket",
              sona: CAST.sprocket,
              time: "4:22 PM",
              text: `what's an institute day`,
            },
            {
              who: "Vale",
              sona: VALE,
              time: "4:23 PM",
              text: `a day where the building is full of adults and no children. it is the closest thing to a religious experience I have`,
            },
            {
              who: "Poplar",
              sona: CAST.poplar,
              time: "4:25 PM",
              text: `vale you have got to stop describing your job in riddles`,
            },
            {
              who: "Vale",
              sona: VALE,
              time: "4:26 PM",
              text: `no`,
            },
          ],
        },
        {
          date: "May 21",
          lines: [
            {
              who: "Vale",
              sona: VALE,
              time: "9:02 PM",
              text: `third week of May. if I seem short with anyone it is not about you, it is about the fact that I have eleven working days left and roughly four hundred things to hand back`,
            },
            {
              who: "Quillon",
              sona: CAST.quill,
              time: "9:11 PM",
              text: `solidarity. hang in there`,
            },
            {
              who: "Vale",
              sona: VALE,
              time: "9:30 PM",
              text: `{{c:vale_pet|Mackerel is sitting on the pile of things I have to hand back. she only has the one eye and she is using all of it to look at me}}`,
            },
            {
              who: "Poplar",
              sona: CAST.poplar,
              time: "9:32 PM",
              text: `POST HER`,
            },
            {
              who: "Vale",
              sona: VALE,
              time: "9:33 PM",
              text: `absolutely not. you get descriptions of Mackerel. that is the deal and it has always been the deal`,
            },
          ],
        },
        {
          date: "June 4",
          lines: [
            {
              who: "Bramble",
              sona: CAST.bramble,
              time: "6:40 PM",
              text: `foam run this weekend — usual place on Kishwaukee. anyone need anything`,
            },
            {
              who: "Quillon",
              sona: CAST.quill,
              time: "6:44 PM",
              text: `two yards of the 1/2 inch if they have it. June always has it`,
            },
            {
              who: "Vale",
              sona: VALE,
              time: "6:58 PM",
              text: `I'll go myself, I like going. it's four minutes from me`,
            },
            {
              who: "Bramble",
              sona: CAST.bramble,
              time: "6:59 PM",
              text: `it is four minutes from everyone, Vale, it's Rockford`,
            },
          ],
        },
        {
          date: "August 12",
          lines: [
            {
              who: "Poplar",
              sona: CAST.poplar,
              time: "1:12 PM",
              text: `vale you around?`,
            },
            {
              who: "Poplar",
              sona: CAST.poplar,
              time: "8:50 PM",
              text: `never mind, prep week, I forgot`,
            },
            {
              who: "Vale",
              sona: VALE,
              time: "9:15 PM",
              text: `prep week. I have been in a building with no air conditioning since seven in the morning putting names on things`,
            },
            {
              who: "Vale",
              sona: VALE,
              time: "9:16 PM",
              text: `ask me again in June`,
            },
          ],
        },
        {
          date: "September 9",
          lines: [
            {
              who: "Bramble",
              sona: CAST.bramble,
              time: "8:30 PM",
              text: `vale hasn't been in here in a month`,
              system: false,
            },
            {
              who: "System",
              time: "8:31 PM",
              text: `Vale left the server.`,
              system: true,
            },
            {
              who: "Poplar",
              sona: CAST.poplar,
              time: "8:44 PM",
              text: `oh`,
            },
          ],
        },
      ],
    }).body,
  },

  {
    id: "meet_thread",
    platform: "bluesky",
    url: "bsky.app/profile/poplardoe.bsky.social/post/3kspring",
    title: "spring meet was PERFECT — thread",
    blurb:
      "bowling, then Denny's, then standing in a parking lot for two hours because nobody wants to go home.",
    chapter: 2,
    terms: ["rockford furmeet", "spring meet bowling denny's", "rock river furs meet"],
    body: bskyThread({
      root: {
        author: CAST.poplar,
        handle: "poplardoe",
        time: "April",
        text: `spring meet was PERFECT. eleven of us. bowling, then Denny's, then standing in the parking lot for two hours because nobody wanted to go home.

photo thread, everyone said yes to being posted, nobody's face is in any of these because that is the rule`,
        replies: 21,
        reposts: 14,
        likes: 260,
      },
      replies: [
        {
          author: CAST.poplar,
          handle: "poplardoe",
          time: "April",
          text: `the lineup. from the left: Sprocket, Bramble, Quillon, me, Tessellate, and Vale being Vale about it`,
          image: {
            alt: `Six people photographed from behind in a bowling alley, all wearing sona-themed hoodies and none facing the camera. The one on the far right is holding a bowling ball with both hands and has clearly just turned away from the lens.`,
            caption: `Vale has been photographed at four consecutive meets and I do not have a single picture of their face. it's a bit now. it's committed to.`,
          },
          likes: 96,
        },
        {
          author: CAST.tessellate,
          handle: "tessdad",
          time: "April",
          replyTo: "poplardoe",
          text: `how far did people come for this? I did two hours`,
          likes: 5,
        },
        {
          author: CAST.sprocket,
          handle: "sprocketproto",
          time: "April",
          replyTo: "tessdad",
          text: `bramble did like 90 mins. vale's local though — {{c:vale_city_chicago|they're Chicago, aren't they? everyone in this scene is basically Chicago}}`,
          likes: 3,
        },
        {
          author: CAST.poplar,
          handle: "poplardoe",
          time: "April",
          replyTo: "sprocketproto",
          text: `sprocket you have lived in this state for six years`,
          likes: 44,
        },
      ],
    }).body,
  },

  {
    id: "ferraro_maps",
    platform: "maps",
    url: "google.com/maps/place/Ferraro+Fabric+%26+Foam/reviews",
    title: "Ferraro Fabric & Foam — Rockford, IL — Reviews",
    blurb:
      "Fabric store · 4.8 stars · 212 reviews · 1140 Kishwaukee St, Rockford, IL 61104 · Local pickup available",
    chapter: 2,
    terms: ["ferraro fabric and foam", "rockford foam supplier", "fabric store rockford"],
    unlocks: ["ferraro fabric etsy", "rockford mural 7th street", "rockford makers group"],
    body: mapsPlace({
      place: "Ferraro Fabric & Foam",
      category: "Fabric store · Upholstery supply",
      address: "1140 Kishwaukee St, Rockford, IL 61104",
      rating: 4.8,
      reviewCount: 212,
      reviews: [
        {
          by: "V.",
          stars: 5,
          when: "7 months ago",
          local: "Local Guide · 14 reviews",
          text: `{{c:vale_city|Local pickup, four minutes from my place, and June cut the half-inch to the exact size I asked for without making the face people usually make when you say what it's for.}}

If you make things out of foam in this town this is the only place. Bring the measurements written down. She will ask.`,
        },
        {
          by: "Quillon M.",
          stars: 5,
          when: "1 year ago",
          local: "9 reviews",
          text: `Been buying from June for six years. She knows exactly what a DTD is and has never once asked me to explain it, which if you know, you know.`,
        },
        {
          by: "Rachel T.",
          stars: 4,
          when: "1 year ago",
          local: "31 reviews",
          text: `Great selection, prices are fair, parking is a nightmare on Saturdays. Bring cash for the remnant bin.`,
        },
        {
          by: "D. Okonjo",
          stars: 5,
          when: "2 years ago",
          local: "Local Guide · 88 reviews",
          text: `Got canvas here for a shop project. June threw in offcuts. Rockford small business at its best.`,
        },
      ],
    }).body,
  },

  {
    id: "ferraro_etsy",
    platform: "etsy",
    url: "etsy.com/shop/FerraroFabricAndFoam",
    title: "FerraroFabricAndFoam — Etsy",
    blurb:
      "Upholstery foam, minky, and fursuit-maker supply bundles. Ships from Rockford, Illinois. 3,104 sales.",
    chapter: 2,
    terms: ["ferraro fabric etsy", "fursuit foam etsy", "rockford foam"],
    body: etsyShop({
      shop: "FerraroFabricAndFoam",
      tagline: "Foam, minky, and everything for the thing you're not telling your family about",
      location: "Rockford, Illinois",
      sales: 3104,
      since: "2016",
      announcement: `Local pickup is available and I would genuinely rather you did that — shipping foam is shipping air.

I know what most of you are making. I have known for nine years. You do not have to say "a costume." It's fine. Bring the measurements written down.`,
      items: [
        {
          title: "1/2\" upholstery foam — cut to size",
          price: "$14.00",
          alt: "A stack of pale grey foam sheets, cut square, on a shop counter.",
        },
        {
          title: "Minky bundle — 12 colors, fursuit maker pack",
          price: "$68.00",
          alt: "Twelve folded squares of short-pile fabric in bright colors, fanned out.",
        },
        {
          title: "Buckram + mesh — head vision pack",
          price: "$22.00",
          alt: "A roll of stiff black mesh beside a sheet of buckram.",
        },
      ],
      reviews: [
        {
          by: "quillonmakes",
          stars: 5,
          when: "Aug 2025",
          text: `Sixth order. Still perfect. Still the only place that cuts the half-inch properly.`,
        },
        {
          by: "V.",
          stars: 5,
          when: "Mar 2025",
          text: `Picked up in store. Thank you for not asking. (You did ask. It was fine that you asked.)`,
        },
      ],
    }).body,
  },

  {
    id: "vale_kofi",
    platform: "kofi",
    url: "ko-fi.com/valemaned",
    title: "Vale — Ko-fi",
    blurb:
      "Badges and reference sheets. Commissions closed. Tip jar still open because I forgot it existed.",
    chapter: 2,
    terms: ["vale kofi", "valemaned ko-fi", "vale commissions"],
    body: kofiPage({
      sona: VALE,
      handle: "valemaned",
      title: "Vale",
      about: `Badges. Reference sheets. Lineless, backlit, hand-cut, laminated.

Commissions are closed and I don't have a date. The tip jar is still here because I set it up in 2019 and forgot about it, and every so often somebody puts three dollars in it with a note that says "for the badge, it's still on my bag," and that is worth more than the three dollars.

{{c:vale_contact|If you need to reach me and the other places are gone, it's here. This is the last one I'll close.}}`,
      goal: { label: "New scanner — the old one leaves a line down every badge", percent: 74 },
      posts: [
        {
          title: "thank you",
          when: "2 months ago",
          body: `Someone tipped with the note "hope the year got easier." It didn't, particularly, but I read that on a bad Tuesday and it helped. Thank you, whoever you are.`,
        },
        {
          title: "queue update — everyone is finished",
          when: "3 months ago",
          body: `Every outstanding badge is cut, laminated and in the post. Nobody is owed anything.

That was the only thing keeping me here, and I want to be honest that that's what it was.`,
        },
        {
          title: "hand thing — short version",
          when: "8 months ago",
          body: `Jammed my drawing hand between a door and a doorframe in a corridor full of people moving in the wrong direction. It's splinted, it's fine, it's boring, and it is going to add about three weeks to everything.

Sorry. I'll post the queue again when I can hold a stylus for more than an hour.`,
        },
      ],
    }).body,
  },

  {
    id: "mural_reddit",
    platform: "reddit",
    url: "reddit.com/r/rockford/comments/1e4m/who_did_the_mural_on_7th",
    title: "Does anyone know who painted the mural on 7th? : r/rockford",
    blurb:
      "It's been there since spring and it's better than anything the city commissioned. There's no name on it.",
    chapter: 2,
    terms: ["rockford mural 7th street", "7th street mural", "rockford mural artist"],
    unlocks: ["rockford register mural", "kishwaukee middle school"],
    body: redditThread({
      sub: "r/rockford",
      title: "Does anyone know who painted the mural on 7th?",
      user: "beloit_transplant",
      time: "5 months ago",
      score: 418,
      body: `The one on the side of the old hardware building. Big animals, sunset colors, the light's coming from behind them so they're all rimmed in orange.

It's been up since spring and it's better than anything the city has actually paid for. There's no plaque and no signature that I can find.

Who did this and how do I give them money`,
      comments: [
        {
          user: "rkfd_lifer",
          score: 212,
          time: "5 months ago",
          body: `It was a school thing. Kids from one of the middle schools painted it, there was a whole write-up in the Register. The teacher did the design and the kids did the filling in.`,
          replies: [
            {
              user: "beloit_transplant",
              score: 66,
              time: "5 months ago",
              op: true,
              body: `That explains why it's good and also why nobody's name is on it, I guess. Teachers never sign anything.`,
            },
          ],
        },
        {
          user: "sundog_yote",
          score: 340,
          time: "5 months ago",
          body: `there IS a signature. bottom right corner, about knee height, you have to be looking for it. it's a little wolf head. four lines.

I noticed it because I have seen that exact mark on something else and it took me two days to remember where`,
          replies: [
            {
              user: "rkfd_lifer",
              score: 88,
              time: "5 months ago",
              body: `where?`,
            },
            {
              user: "sundog_yote",
              score: 24,
              time: "5 months ago",
              body: `nowhere. forget it. nice mural though`,
            },
          ],
        },
        {
          user: "ferraro_june",
          score: 130,
          time: "4 months ago",
          body: `{{c:vale_link_june|I sold them the drop cloths. Lovely person, would not accept a discount, insisted on paying full retail out of their own pocket for a school project.

That is all I am going to say about it, because it is not my business to say more, and if you have got this far you should probably ask yourself why you want to know.}}`,
        },
      ],
    }).body,
  },

  {
    id: "makers_group",
    platform: "facebook",
    url: "facebook.com/groups/rockfordmakers/about/members",
    title: "Rockford Makers & Menders — Members",
    blurb:
      "Public group, 640 members. Sewing, foam, 3D printing, upholstery, and whatever it is Casey is building this month.",
    chapter: 2,
    terms: ["rockford makers group", "rockford makers and menders", "rockford crafters"],
    unlocks: [
      "marisol enriquez",
      "dev okonjo",
      "wren halloway",
      "casey brandt rockford",
      "priya raman",
      "theo lindqvist stream",
      "june ferraro",
      "amos whitfield rockford",
      "nadia kelly rockford",
    ],
    body: facebookPost({
      group: "Rockford Makers & Menders · Public group · 640 members",
      author: "June Ferraro",
      when: "Pinned by admin",
      body: `MONTHLY THREAD — say what you're working on, and if you need a tool somebody here has it.

I'll start, since I'm the one who keeps asking: the shop has half-inch back in stock and I am not ordering minky again until people stop asking me for colours I already have.

Regulars, in no particular order, because somebody asked me to make a list and I regret agreeing:

— *Casey Brandt*, {{c:june_link_casey|HVAC by day, buys his half-inch off me for every build, owns the only industrial serger in the group and will let you use it if you ask nicely and bring your own thread}}.
— *Dev Okonjo*, tattoo apprentice on 7th, blackwork, will draw anything on paper for free and charge you properly for skin.
— *Wren Halloway*, runs the teen maker space at the library, knows every 3D printer in the county and which ones lie about their bed temperature.
— *Priya Raman*, vet tech, does the most patient hand-sewing I have ever watched a human being do.
— *Theo Lindqvist*, college, streams in the afternoons, showed up once with a 3D printed helmet and has been forgiven.
— *Amos Whitfield*, youth pastor at Riverside, brings the good snacks and does not judge a single thing anyone in here makes.
— *Nadia Kelly*, nights at the DC, only person who answers the group chat at 4am, quilts like it's a competitive sport.
— *Marisol Enriquez*, {{c:june_link_marisol|teaches art at Kishwaukee, bought six weeks of drop cloths off me for a school mural and would not take the discount}}.

That's eight and I know I'm forgetting people. Add yourselves.`,
      reactions: 112,
      comments: [
        {
          by: "Casey Brandt",
          when: "3 weeks ago",
          text: `the serger offer stands. bring your own thread. I mean it about the thread`,
        },
        {
          by: "Sprocket",
          when: "3 weeks ago",
          text: `{{c:casey_link_vale|for anyone from the con side who wandered in here — Casey is the guy. if it got made in this town, Casey made it. badges, heads, all of it}}`,
        },
        {
          by: "Wren Halloway",
          when: "3 weeks ago",
          text: `the library printers are free to use with a card, before anyone asks me again in the comments instead of reading the sign`,
        },
        {
          by: "Priya Raman",
          when: "2 weeks ago",
          text: `June you forgot yourself. June owns the shop. June is the group.`,
        },
        {
          by: "June Ferraro",
          when: "2 weeks ago",
          text: `I am the infrastructure, Priya. Infrastructure doesn't go on the list.`,
        },
      ],
    }).body,
  },

  {
    id: "mural_news",
    platform: "news",
    url: "rrstar.com/story/news/education/mural-7th-street-students",
    title: "Middle schoolers turn a blank wall into 'the best thing on 7th Street'",
    blurb:
      "Twenty-eight eighth graders, four hundred square feet, and one art teacher who declined to be photographed.",
    chapter: 2,
    terms: ["rockford register mural", "rockford mural school", "kishwaukee middle school"],
    unlocks: ["kishwaukee middle school staff", "rockford school district calendar"],
    body: newsArticle({
      outlet: "Rockford Register Star",
      section: "Education",
      headline: "Middle schoolers turn a blank wall into 'the best thing on 7th Street'",
      standfirst:
        "Twenty-eight eighth graders spent six Saturdays on a four-hundred-square-foot mural. Their art teacher declined to be photographed with it.",
      byline: "By Danielle Prescott",
      dateline: "May 14",
      photo: {
        alt: `A mural on the side of a brick building: a row of stylized animals in sunset colors, each one outlined in orange light from behind. Students in paint-spattered hoodies stand in front of it, arms up.`,
        caption: `Eighth graders from Kishwaukee Middle School with the completed mural. Their teacher, who organized the project, is not pictured at their own request.`,
      },
      body: `The wall had been blank for eleven years. It is not blank now.

Twenty-eight eighth graders from Kishwaukee Middle School spent six consecutive Saturdays this spring painting a four-hundred-square-foot mural on the south face of the former Aldritch Hardware building, and the result has become, in the words of one neighbor, "the best thing on 7th Street, and I include the restaurants."

The design is unusual for a school project. Rather than the block lettering and hand prints that typically characterize student murals, the piece is built entirely without outlines — shapes are defined by color alone, and every figure is lit from behind, so that the animals appear to be walking out of a sunset.

"That was the teacher's design," said principal Ellis Vaughn. "The kids did every square inch of the paint, but the drawing is theirs. They wouldn't take credit for it and I've decided to overrule them, at least in this newspaper."

The teacher, who has taught art at Kishwaukee for six years, declined to be interviewed or photographed, and asked that the article focus on the students. A district spokesperson confirmed the project was funded by a small arts grant and roughly two hundred dollars of the teacher's own money, which the district described as "not unusual, unfortunately."

Materials were donated in part by Ferraro Fabric & Foam on Kishwaukee Street.

"They came in every Saturday for six weeks," said owner June Ferraro. "They wouldn't take the discount. I have opinions about that."

The mural is expected to remain in place indefinitely. The building's owner has agreed not to paint over it.`,
    }).body,
  },
];
