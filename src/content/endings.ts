/* ---------------------------------------------------------------------------
   The finale: what you choose to say, and the four ways it lands.

   Composer options carry an `alarm` weight. Negative options give them room;
   positive options take it away. The provenance of everything you filed is
   already on the scale before you pick a single line.
--------------------------------------------------------------------------- */

import type { ComposerStep, Ending, EndingId } from "../engine/types.ts";

export const COMPOSER: readonly ComposerStep[] = [
  {
    id: "open",
    prompt: "Open it.",
    options: [
      {
        id: "lounge",
        text: "Hi. Headless lounge, MFF, last December. Four hours, and I never got your handle. I'm the one who said 'you're not exactly hard to find,' which turned out to be one of the stupider things I've ever said.",
        alarm: -4,
      },
      {
        id: "plain",
        text: "Hi Vale. We met at MFF. I've been trying to find you since and I finally did.",
        alarm: 0,
      },
      {
        id: "name",
        text: "Hi. I know who you are. I know where you work, and I know why you stopped posting.",
        alarm: 14,
      },
    ],
  },
  {
    id: "how",
    prompt: "Tell them how you found them.",
    options: [
      {
        id: "honest",
        text: "I found you the boring way. A parade photo, a badge with your glyph on it, and a group chat where you complained about the weather two hours before anyone else did. Everything I used, you put there yourself.",
        alarm: -3,
      },
      {
        id: "vague",
        text: "It took a while. I'd rather not lay out every step of it, honestly — writing it down made me feel like something I don't want to be.",
        alarm: 2,
      },
      {
        id: "june",
        text: "Mostly? June wouldn't tell me anything, and the way she wouldn't tell me anything told me I was in the right town. Blame the foam.",
        alarm: -1,
        requiresFiled: ["vale_link_june"],
      },
      {
        id: "proud",
        text: "Honestly? It was easier than it should have been. You left more lying around than you think — I can send you the list, if you want to close some of it off.",
        alarm: 10,
      },
    ],
  },
  {
    id: "ask",
    prompt: "Ask for something.",
    options: [
      {
        id: "nothing",
        text: "I'm not asking for anything. If you'd rather I hadn't done this, say so and I'll go, and I won't tell anyone I found you.",
        alarm: -5,
      },
      {
        id: "badge",
        text: "If you ever open the queue again, I'd like a badge. If you never do, I'd still like to know how you're doing sometimes.",
        alarm: -2,
      },
      {
        id: "meet",
        text: "The spring meet is on the 12th. Bowling, then the Denny's. Come. I'll be the one panicking about whether you showed up.",
        alarm: 1,
      },
      {
        id: "answers",
        text: "I want to know what happened at your work. You wrote about it once and then deleted it, and I read it anyway, and I'd like to hear it from you.",
        alarm: 12,
        requiresSeen: ["vale_wayback"],
      },
      {
        id: "breakroom",
        text: "I know about the break room. I know it's still going. If you ever want someone to be angry about it with you, I've been angry about it all week for free.",
        alarm: 8,
        requiresFiled: ["m_reason"],
      },
    ],
  },
];

export const ENDINGS: Readonly<Record<EndingId, Ending>> = {
  reunion: {
    id: "reunion",
    title: "Oh. It's you.",
    reply: `oh

OH. the water bottle person. you nursed one bottle of water for four hours like it was a job

I have thought about that afternoon an embarrassing number of times. I wrote a journal about it and then took it down because I decided it was too much. it was too much. I'm leaving it up now.

I'm sorry I was hard to find. it isn't about you. there's a whole thing and one day I'll tell you the whole thing.

for now: hi. hello. I'm really glad you didn't give up on it.`,
    epilogue: `They open the queue three weeks later — six slots, badges only, first come first served. You get one. The wolf-head glyph sits in the bottom right corner, four strokes, the same as it has been since 2017.

At the spring meet they arrive late, in a hoodie, without the suit, and stand in the doorway of a bowling alley in Rockford scanning the room until they find you. They still don't tell you their last name. You never ask.

Two years later you are the person they call when the joke in the break room finally stops being funny and they hand in their notice. You drive four hours to help them move. In the car they say, "you know I picked you because you found me and then didn't do anything with it," and then they change the subject, because they are terrible at this.`,
    variants: [
      {
        requiresFiled: "vale_reason",
        text: `You never tell them you read the journal. It sits somewhere behind your ribs, the one thing about all of this you can't ever hand back, and on the good days you almost forget it's there.`,
      },
      {
        missingSeen: "vale_wayback",
        text: `A year in, they tell you about the journal themselves — the one they posted and deleted in eleven minutes. You get to hear it out loud, the way they wanted it told, and when they finish you get to say "I didn't know," and mean it. You will never fully explain to them what that was worth.`,
      },
    ],
  },

  cautious: {
    id: "cautious",
    title: "How much of this do you have?",
    reply: `hi.

I remember you. genuinely, I do, and that afternoon was one of the better things that has happened to me at a convention.

but I need to ask a question before anything else, and I need you to answer it straight: how much of this do you have written down somewhere, and who else has seen it?

I'm not accusing you. you found me and you were nice about it and I know that isn't nothing. it's just that the last time somebody put the two halves of me together, it was not on purpose either, and I'm still living in the version of my life that came after.

give me a bit.`,
    epilogue: `It takes four months. They answer about one message in three, and never the ones about the con.

In February they send a link to a new Bluesky account — no bio, no location, eleven followers. The handle isn't Vale. You don't ask what it is short for.

By summer you are talking most weeks. By the following December you are in the headless lounge again, at the same convention, and they sit down next to you like it's a thing you always did, and they say "I checked the parade photos, by the way. I found the one you found." A pause. "You could have just asked me."

You could have. That's the thing you'll keep thinking about.`,
    variants: [
      {
        requiresFiled: "m_reason",
        text: `You never bring up the break room. Some nights you type it out — "I know what they did, and it wasn't nothing" — and delete it. It isn't yours to be angry about first. You wait, and you keep waiting, and one day it will be offered.`,
      },
    ],
  },

  blocked: {
    id: "blocked",
    title: "Message failed to send.",
    reply: `read 11:52pm

typing…

typing…

(no reply)`,
    epilogue: `The Bluesky account goes first, some time before two in the morning. Then the Fur Affinity gallery — two hundred and fourteen submissions, eight years, gone between refreshes. The Toyhouse page returns a 404 by the time you think to check it.

Bramble posts in the Midwest Furs chat the next evening: *has anyone heard from vale.* Nobody has. Poplar says leave it. Bramble says if someone wants to be gone, they're allowed to be gone, and this time nobody argues.

You still have all of it. The screenshots, the archived journal, the parade photo where the light through the corridor windows is doing something incredible at two in the afternoon. You have more of Vale than almost anyone alive.

You are the only person who knows what happened, and there is no one you can tell.`,
    variants: [
      {
        requiresFiled: "vale_reason",
        text: `The journal is still in the archive. You check, some nights. It's the last place they exist where you can reach, and it was never yours, and you keep the tab open anyway.`,
      },
    ],
  },

  wrong: {
    id: "wrong",
    title: "I think you have the wrong person.",
    reply: `Hi — I think you have me mixed up with someone else? I'm not a furry and I've never been to a convention in Illinois.

No hard feelings, this is a funny thing to receive on a Tuesday. Good luck finding whoever you're actually looking for.`,
    epilogue: `You did have the wrong person. What you also had was a message, sent to a stranger, laying out in detail the shape of somebody who is hiding — and Rockford is not a large town.

It reaches Vale eleven days later, the way things do. Not the message itself. The story about the message. Somebody at the craft store mentions that somebody got a weird DM about furries, and somebody at the meet hears it, and by the time it arrives it has been sanded into a joke.

Vale laughs at it, once, in a group chat, and then stops posting in that group chat.

They are still out there. They are just further away than they were this morning, and it was you who moved them.`,
    variants: [
      {
        requiresFiled: "priya_pet_trap",
        text: `It was the cat that did it. A one-eyed cat, a five-star review, and a person who works with animals standing close enough to the coincidence to catch it. You wanted it to be true more than you wanted to keep checking — and the checking was one page away.`,
      },
    ],
  },

  away: {
    id: "away",
    title: "You close the laptop.",
    reply: "",
    epilogue: `The draft sits there. You read it twice. Then you select all of it, and you delete it, and you close the laptop, and the apartment is very quiet.

You have a name you are almost sure of. You will stay almost sure of it for the rest of your life, because the only way to find out is the one thing you've decided not to do. It turns out you can just — not know something. Nobody tells you that. You can hold the whole shape of an answer in your hands and set it down.

They wanted to be unfindable. You found them anyway, probably. Those two things stopped being in conflict the moment you decided not to knock.

In the spring you go to the meet — bowling, then the Denny's. You don't scan the room. That's the deal you've made with yourself, and you keep it, and it costs you something every single time.

In December you are in the headless lounge again, with a bottle of water you have been nursing for an hour, sitting where you can see the door. Not waiting. Just sitting where you can see the door.`,
    variants: [
      {
        requiresFiled: "vale_reason",
        text: `You read the journal — the one they deleted in eleven minutes — and you closed the laptop anyway. Whatever kind of person you were afraid this search was turning you into, that isn't the person who did this.`,
      },
      {
        requiresFiled: "m_reason",
        text: `And you know about the break room. Somebody in that building is still doing the howl, two years on, and the person it lands on doesn't know that anyone is angry on their behalf. You are. Quietly, permanently, from a distance. It will have to be enough.`,
      },
    ],
  },
};
