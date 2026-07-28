/* ---------------------------------------------------------------------------
   Chapter 3 — Person.

   Nine names down to one. Everything in this chapter crosses the line between
   the half of the internet where Vale is a maned wolf and the half where
   somebody has a payroll number — which is exactly why almost every clue here
   is tagged "crossed" and costs you at the end.
--------------------------------------------------------------------------- */

import type { Chapter, Clue, SourceDoc } from "../engine/types.ts";
import { blogPost, facebookPost, instagramProfile, linkedinProfile, mapsPlace, youtubeVideo } from "../platforms/civilian.ts";

export const CH3: Chapter = {
  id: 3,
  name: "Person",
  goal: "Nine people. One of them signs things with a wolf's head. Work out which.",
  startTerms: [
    "kishwaukee middle school staff",
    "rockford school district calendar",
    "rockford veterinary reviews",
  ],
  keyClues: ["m_work", "m_art", "m_pet", "m_hand", "m_schedule"],
  opening: `
Here is the part nobody warns you about.

Up to now you have been reading things furries wrote for other furries. Public, tagged, meant to be found. Vale put every one of those words somewhere on purpose.

From here you are reading things a person wrote under their legal name — a staff directory, a district calendar, a review of a vet clinic — and holding them up against things a maned wolf said in a group chat, looking for the seam.

Every single one of these is a fact Vale spent two years making sure could not be held up against the other half. You are about to do it anyway.

The game will remember that you did.
`,
  closing: `
A splinted right hand, the week of November the twelfth, in a corridor full of people going the wrong way.

A cat with one eye called Mackerel, in a five-star review of a vet clinic on North Main, signed with two initials.

An art teacher who builds shapes out of colour with no outline and puts the light behind everything, who ran a mural on 7th Street and would not stand in front of it for a photograph, whose contract hours are 7:40 to 3:20 and whose institute days line up, to the day, with the only weekday afternoons Vale has ever been free.

That's not a guess anymore. That's a person, and you have their name, and you have it because you went and got it.

Now you have to decide what kind of person that makes you — and you have to do it in one message, because that's all you're going to get.
`,
};

export const CH3_CLUES: readonly Clue[] = [
  /* --- the answer --------------------------------------------------------- */
  {
    id: "m_work",
    person: "marisol",
    slot: "work",
    label: "Art teacher, Kishwaukee Middle School — six years",
    detail:
      "The teacher from the mural article. Six years at the same building, which matches how long Vale has been describing the same job in riddles.",
    provenance: "crossed",
    source: "marisol_linkedin",
    unlocks: ["kishwaukee art department blog"],
  },
  {
    id: "m_art",
    person: "marisol",
    slot: "art",
    label: "Teaches lineless colour and backlighting",
    detail:
      "An entire unit built on it: no outlines, light from behind. It is not a common thing to teach thirteen-year-olds. It is Vale's whole style.",
    provenance: "crossed",
    source: "school_artblog",
  },
  {
    id: "m_schedule",
    person: "marisol",
    slot: "schedule",
    label: "Contract 7:40–3:20; institute days match exactly",
    detail:
      "Every weekday Vale has ever been unreachable, and every single afternoon they were mysteriously free, is on this calendar.",
    provenance: "crossed",
    source: "district_calendar",
  },
  {
    id: "m_pet",
    person: "marisol",
    slot: "pet",
    label: "A one-eyed cat called Mackerel",
    detail:
      "A five-star review of a vet clinic on North Main, signed M. E., thanking them for how they handled a cat with one eye.",
    provenance: "crossed",
    source: "vet_reviews",
  },
  {
    id: "m_hand",
    person: "marisol",
    slot: "tell",
    label: "Splinted right hand, week of November 12",
    detail:
      "A staff note about a teacher on modified duties. The same week Vale posted that they'd jammed their drawing hand in a doorframe in a crowded corridor.",
    provenance: "private",
    source: "school_artblog",
  },
  {
    id: "m_reason",
    person: "marisol",
    slot: "reason",
    label: "It got around the staff group chat",
    detail:
      "Nobody was cruel. Nobody had a meeting. Somebody still does the howl when she walks into the break room, two years on.",
    provenance: "private",
    source: "school_artblog",
  },

  /* --- eliminations ------------------------------------------------------- */
  {
    id: "dev_out",
    person: "dev",
    slot: "con",
    label: "Was in Lagos for all of December",
    detail: "Three weeks of it, posted daily. He was not in a corridor in Rosemont.",
    provenance: "open",
    source: "dev_instagram",
  },
  {
    id: "dev_art",
    person: "dev",
    slot: "art",
    label: "Heavy black linework, no colour",
    detail: "Everything he makes is outline. It is the exact opposite of the thing you're looking for.",
    provenance: "open",
    source: "dev_instagram",
  },
  {
    id: "theo_out",
    person: "theo",
    slot: "schedule",
    label: "Streams 2–6pm on weekdays",
    detail: "Live on camera during the exact window Vale is always silent. It cannot be him.",
    provenance: "open",
    source: "theo_youtube",
  },
  {
    id: "casey_out",
    person: "casey",
    slot: "art",
    label: "Builds, doesn't draw — commissions everything",
    detail:
      "Owns the serger, makes the heads, and has paid four different artists for reference sheets because he cannot draw and says so cheerfully.",
    provenance: "open",
    source: "casey_facebook",
    overturns: "casey_link_vale",
  },
  {
    id: "marisol_link_students",
    person: "marisol",
    link: {
      to: "vale",
      label: "Teaches the exact technique Vale is known for, to twenty-eight thirteen-year-olds.",
    },
    label: "Teaches Vale's technique as a unit",
    detail:
      "Not a similar style. The same rule, stated the same way: no outlines, light from behind, six weeks.",
    provenance: "crossed",
    source: "school_artblog",
  },
  {
    id: "amos_out",
    person: "amos",
    slot: "reason",
    label: "Already out, publicly, on his own terms",
    detail:
      "He wrote about it himself, on the church blog, two years ago. The person with the most to lose is the one who already decided not to hide.",
    provenance: "open",
    source: "amos_blog",
  },
  {
    id: "nadia_out",
    person: "nadia",
    slot: "schedule",
    label: "Nights — asleep 8am to 4pm",
    detail:
      "Her silent window looks identical to Vale's until you notice she's also awake at three in the morning, every night, and Vale never is.",
    provenance: "open",
    source: "nadia_facebook",
  },
];

export const CH3_SOURCES: readonly SourceDoc[] = [
  {
    id: "marisol_linkedin",
    platform: "linkedin",
    url: "linkedin.com/in/marisol-enriquez-rkfd",
    title: "Marisol Enriquez — Art Teacher — Rockford Public Schools | LinkedIn",
    blurb:
      "Art Teacher at Kishwaukee Middle School · Rockford, Illinois · 6 years · 48 connections",
    chapter: 3,
    terms: ["kishwaukee middle school staff", "marisol enriquez", "rockford art teacher"],
    unlocks: ["kishwaukee art department blog", "rockford veterinary reviews"],
    body: linkedinProfile({
      name: "Marisol Enriquez",
      headline: "{{c:m_work|Art Teacher at Kishwaukee Middle School}}",
      location: "Rockford, Illinois, United States · 48 connections",
      about: `Art teacher. Six years at the same building, which in this profession is either a warning sign or a good sign and I've decided it's a good sign.

I am not on here for opportunities. I am on here because the district made a slide about professional presence in 2019 and I have never gotten around to deleting it.

If you are a former student: hello, I remember you, put your name in the message.`,
      roles: [
        {
          title: "Art Teacher (6–8)",
          org: "Kishwaukee Middle School · Rockford Public Schools",
          span: "Aug 2019 – Present · Rockford, IL",
          body: `Middle school visual arts, four sections. Ran the 7th Street mural project — six Saturdays, twenty-eight eighth graders, four hundred square feet, zero injuries, which I consider the achievement.`,
        },
        {
          title: "Long-term substitute, Visual Arts",
          org: "Rockford Public Schools",
          span: "Jan 2018 – Jun 2019",
        },
        {
          title: "Framing & print counter",
          org: "an art supply store that no longer exists",
          span: "2015 – 2018",
          body: `Cut a great deal of mat board. Learned what people actually want, which is almost never what they say they want.`,
        },
      ],
      education: [
        {
          school: "Northern Illinois University",
          span: "BFA, Studio Art · Art Education certification",
          detail: "Printmaking concentration. I have not made a print since 2016.",
        },
      ],
      activity: [
        {
          when: "5 months ago",
          body: `Extremely proud of these kids. The wall was blank for eleven years and now it isn't. (Please stop tagging me in the article, I asked them not to put my name in it and they did anyway.)`,
        },
        {
          when: "2 years ago",
          body: `Reminder that middle school art teachers are the only adults in a building who see every single child in it. Fund your arts programs.`,
        },
      ],
    }).body,
  },

  {
    id: "school_artblog",
    platform: "blog",
    url: "kishwaukeems.rps205.org/art/blog/unit-4-light-from-behind",
    title: "Unit 4: Light From Behind — Kishwaukee MS Art Department",
    blurb:
      "Department blog. Student work, unit plans, and a running note about who is currently on modified duties.",
    chapter: 3,
    terms: ["kishwaukee art department blog", "kishwaukee middle school art", "light from behind unit"],
    body: blogPost({
      blog: "Kishwaukee MS — Art Department",
      tagline: "Room 114. Four sections. One kiln that works.",
      title: "Unit 4: Light From Behind",
      when: "November 19",
      body: `Unit 4 started this week and it is my favourite one, so you are all going to hear about it.

The rule for the whole unit is: *no outlines.* None. Not one. {{c:m_art|If you want an edge, you make it with colour, and you put the light behind the thing instead of in front of it.}} That's the entire unit. Six weeks.

Thirteen-year-olds hate this for about four days. Then one of them draws a dog against a window and the light comes around the ears and they go completely silent, and then everybody wants to do it, and then I don't have to teach anything for two weeks.

{{c:marisol_link_students|It is not how art is usually taught at this level. Outlines are safe and outlines are gradeable. But an outline tells a kid that a thing is separate from the space around it, and I don't think that's true, and I'd rather teach the version I believe. So we do six weeks of it, every year, and I do not care that it's unusual.}}

---

*Department note.* {{c:m_hand|Ms. Enriquez is on modified duties this week — right hand splinted after an incident in the second-floor corridor on the 12th involving a door, a doorframe, and about four hundred people going the wrong direction.}} She is fine. She would like it on the record that she was going the correct direction.

Demonstrations this week will be verbal, which she says is "character building for everyone."

---

One more thing, and then I'll stop.

A parent asked at conferences why I teach the sunset thing, and I gave the answer above, and it was a true answer but it was not the whole answer.

{{c:m_reason|The whole answer is that a few years ago some people I work with found something I make outside of this building, and it went around the staff group chat, and nobody did anything about it — nobody was cruel, nobody had a meeting, somebody just started doing a joke in the break room and then never stopped.}} And for about a year after that I could not put anything I actually liked in front of anybody.

The way back was teaching it. If I put it in a unit plan then it's pedagogy, and nobody makes a joke about pedagogy.

So that's why. Please fund your arts programs.`,
      tags: ["unit4", "studentwork", "grade8", "room114"],
      comments: [
        {
          by: "E. Vaughn (Principal)",
          when: "November 19",
          text: `Leaving this up. — EV`,
        },
        {
          by: "parent",
          when: "November 21",
          text: `My daughter has not stopped talking about the light thing. She has drawn our dog eleven times.`,
        },
      ],
    }).body,
  },

  {
    id: "district_calendar",
    platform: "blog",
    url: "rps205.org/calendar/2025-26-instructional-calendar",
    title: "2025–26 Instructional Calendar — Rockford Public Schools",
    blurb:
      "Student attendance days, teacher institute days, and contract hours for all district buildings.",
    chapter: 3,
    terms: ["rockford school district calendar", "rps205 institute days", "school calendar rockford"],
    body: blogPost({
      blog: "Rockford Public Schools",
      tagline: "District 205 · Instructional Calendar",
      title: "2025–26 Instructional Calendar",
      when: "Board approved, February",
      body: `*Contract hours, middle schools:* {{c:m_schedule|Staff on site 7:40am to 3:20pm. Buildings open to students 8:05am. Dismissal 3:05pm.}}

*Teacher institute days* — no student attendance. Staff released at 3:20pm as normal, but no evening obligations:

— September 19
— October 17
— November 21
— January 16
— March 19
— April 24

*August preparation week:* August 11–15. All certified staff on site, buildings not air conditioned until the 18th. We are aware. It is on the capital plan.

*End of year:* Last student attendance day May 29. Certified staff report through June 3 for records and materials return.

---

A note from the calendar committee, since we get asked every year: institute days are not days off. They are days when the building is full of adults and empty of children, which staff have described to us, in survey responses, using language we are not going to reprint in a board document.`,
      tags: ["calendar", "district", "2025-26"],
    }).body,
  },

  {
    id: "vet_reviews",
    platform: "maps",
    url: "google.com/maps/place/North+Main+Animal+Hospital/reviews",
    title: "North Main Animal Hospital — Rockford, IL — Reviews",
    blurb:
      "Veterinarian · 4.7 stars · 388 reviews · 2210 N Main St, Rockford, IL 61103",
    chapter: 3,
    terms: ["rockford veterinary reviews", "north main animal hospital", "rockford vet"],
    body: mapsPlace({
      place: "North Main Animal Hospital",
      category: "Veterinarian · Emergency service",
      address: "2210 N Main St, Rockford, IL 61103",
      rating: 4.7,
      reviewCount: 388,
      reviews: [
        {
          by: "M. E.",
          stars: 5,
          when: "1 year ago",
          local: "4 reviews",
          text: `{{c:m_pet|I adopted a cat who had already lost her left eye before I got her, and every vet before this one talked to me like I had done it to her.}}

Dr. Amari spent ten minutes on the floor with her instead of on the table, and then explained exactly what she can and can't see and how to put her food down so she doesn't have to hunt for it.

Mackerel is seven now and rules a two-bedroom apartment with total authority. Thank you.`,
        },
        {
          by: "Priya R.",
          stars: 5,
          when: "8 months ago",
          local: "Local Guide · 52 reviews",
          text: `I work in this field and I still bring my own three here, which should tell you everything. Ask for Dr. Amari.`,
        },
        {
          by: "Tom Beaudry",
          stars: 4,
          when: "2 years ago",
          local: "17 reviews",
          text: `Good care, long waits on Saturdays. Bring a book.`,
        },
        {
          by: "K. Whitfield",
          stars: 5,
          when: "3 years ago",
          local: "6 reviews",
          text: `They stayed open late for us when our old dog was going. I won't forget it.`,
        },
      ],
    }).body,
  },

  {
    id: "dev_instagram",
    platform: "instagram",
    url: "instagram.com/dev.does.lines",
    title: "Dev Okonjo (@dev.does.lines) • Instagram",
    blurb: "tattoo apprentice, 7th st rockford. blackwork only. lagos ↔ rkfd.",
    chapter: 3,
    terms: ["dev okonjo", "rockford tattoo apprentice", "dev does lines"],
    body: instagramProfile({
      handle: "dev.does.lines",
      name: "Dev Okonjo",
      posts: 412,
      followers: 8900,
      following: 621,
      bio: `tattoo apprentice @ ironrose, 7th st, rockford
{{c:dev_art|blackwork only. if you want colour I will personally walk you to someone who does colour}}
lagos ↔ rkfd`,
      grid: [
        {
          alt: "A dense blackwork forearm piece: heavy solid outlines, no shading, no colour anywhere.",
          caption: `six hours. all line. {{c:dev_art|I do not shade and I do not colour and I have made peace with this}}`,
        },
        {
          alt: "A sketchbook page of botanical linework, every stem a single unbroken stroke.",
          caption: `warmup`,
        },
        {
          alt: "A photograph of a departures board at an airport, Lagos flights listed.",
          caption: `{{c:dev_out|three weeks. see you all in january}} — posted December 1`,
        },
        {
          alt: "A market street at dusk, phone photo, motion blur.",
          caption: `day 9. missing nothing about illinois in december`,
        },
        {
          alt: "A hand holding a bowl of jollof rice.",
          caption: `day 14`,
        },
        {
          alt: "Snow on a car windshield outside a tattoo shop.",
          caption: `back. it was 4 degrees when I landed. january 2`,
        },
      ],
    }).body,
  },

  {
    id: "theo_youtube",
    platform: "youtube",
    url: "youtube.com/watch?v=rkfd_theo_vod",
    title: "afternoon grind — 4 hours — VOD | TheoPlaysThings",
    blurb: "Live weekdays 2pm–6pm Central. VOD archive. 2.1K subscribers.",
    chapter: 3,
    terms: ["theo lindqvist stream", "theoplaysthings", "rockford streamer"],
    body: youtubeVideo({
      title: "afternoon grind — 4 hours — VOD",
      channel: "TheoPlaysThings",
      subs: "2.1K",
      views: "1,204",
      when: "Streamed 3 weeks ago",
      frameAlt: `A stream VOD thumbnail: a webcam box in the corner of a game capture, and a schedule overlay reading MON–FRI 2PM–6PM CT.`,
      description: `{{c:theo_out|live weekdays 2pm to 6pm central, every weekday, no exceptions, I have done this for two years and it is the only structure in my life}}

Community college in the morning, stream in the afternoon, asleep by eleven like a Victorian child. People keep telling me to move to evenings because that's when the viewers are. I know when the viewers are. I have a class at nine in the morning and if I stream at night I do not go to the class, and I have run that experiment already, twice, and both times it went badly enough that my mother got involved.

So: afternoons. Two to six. If you're at work, watch the VOD, it's the same content and I don't do anything special live except complain.

VOD archive goes back about eighteen months. Everything before that got eaten when I switched hosts and I have made my peace with it.

Discord's in the panel. Rules are: be nice, no backseating unless I ask, and if you say anything about my accent I will read it out loud in the voice.`,
      comments: [
        {
          by: "sprocketproto",
          when: "3 weeks ago",
          likes: 14,
          text: `the 2pm start is so unhinged and yet it works`,
        },
        {
          by: "poplardoe",
          when: "3 weeks ago",
          likes: 9,
          text: `theo has never missed a weekday afternoon in two years. I've tried to schedule things around it and it cannot be moved. the man is a fixed point`,
        },
        {
          by: "rkfd_lifer",
          when: "2 weeks ago",
          likes: 3,
          text: `came here from the makers group. did not expect four hours of someone losing to a farming game but here I am on episode six`,
        },
      ],
    }).body,
  },

  {
    id: "casey_facebook",
    platform: "facebook",
    url: "facebook.com/groups/rockfordmakers/posts/finished-the-head",
    title: "Finished the head! — Rockford Makers & Menders",
    blurb: "Casey Brandt posted in Rockford Makers & Menders · 88 reactions",
    chapter: 3,
    terms: ["casey brandt rockford", "rockford makers group", "fursuit head rockford"],
    body: facebookPost({
      group: "Rockford Makers & Menders",
      author: "Casey Brandt",
      when: "4 months ago",
      body: `FINISHED THE HEAD.

Eleven weeks. Foam from June's on Kishwaukee, minky ordered, buckram eyes, fans in the cheeks because I am not doing another summer like the last one.

{{c:casey_out|Full disclosure for anyone new: I don't draw. At all. Cannot do it, never could. I have paid four different artists for the ref sheet this is built from and I would pay a fifth.}} My skill is that I can look at somebody else's drawing and make it exist in three dimensions, and that is the entire trick.

If you build and you can't draw — it's fine. Commission it. Pay people. The drawing is a different job.`,
      image: {
        alt: `A completed fursuit head on a workbench beside an industrial serger, surrounded by foam offcuts and a printed reference sheet taped to the wall.`,
      },
      reactions: 88,
      comments: [
        {
          by: "June Ferraro",
          when: "4 months ago",
          text: `That's my half-inch! Looks fantastic Casey.`,
        },
        {
          by: "Quillon M.",
          when: "4 months ago",
          text: `the fans in the cheeks are the correct call and I will not be arguing about it`,
        },
      ],
    }).body,
  },

  {
    id: "amos_blog",
    platform: "blog",
    url: "riversidechurch-rkfd.org/blog/the-thing-you-think-i-dont-know-about-you",
    title: "The thing you think I don't know about you — Riverside Church",
    blurb: "Youth ministry blog. Posted two years ago and still the most-read thing on the site.",
    chapter: 3,
    terms: ["amos whitfield rockford", "riverside church youth", "rockford youth pastor blog"],
    body: blogPost({
      blog: "Riverside Church — Youth",
      tagline: "Amos Whitfield · Youth Ministry · Rockford, IL",
      title: "The thing you think I don't know about you",
      when: "Two years ago",
      body: `A kid in my group spent four months certain I was going to find out he's a furry and throw him out of the building.

{{c:amos_out|I want to say this in public, once, so that nobody in my youth group has to spend four months on it again: I know what a furry is. I have known since I was nineteen. I had a wolf character and a very bad website and I have never been anything but glad about it.}}

I'm not in the fandom now — not because anything went wrong, but because I got busy in the specific way that thirty-three does to a person, and I let it go, and that's allowed too.

I told the kid this, and he cried, and then he was extremely embarrassed about crying, and then he showed me his character, and it's a shark, and it's genuinely good.

Here is my whole position. A child in your care is going to have something they are certain will end them if you find out. Ninety-nine times in a hundred it is not going to be a thing that ends anybody. What ends people is the four months.

So say it out loud first. Whatever your version is. Say it before they have to ask.`,
      tags: ["youth", "pastoral"],
      comments: [
        {
          by: "Marcy L.",
          when: "2 years ago",
          text: `Sent this to my sister who teaches. Thank you Amos.`,
        },
        {
          by: "anonymous",
          when: "1 year ago",
          text: `I am not in your church or your state and I have read this eleven times.`,
        },
      ],
    }).body,
  },

  {
    id: "nadia_facebook",
    platform: "facebook",
    url: "facebook.com/groups/rockfordnightshift/posts/3am-club",
    title: "3am club, check in — Rockford Night Shift",
    blurb: "Nadia Kelly posted in Rockford Night Shift · 41 reactions",
    chapter: 3,
    terms: ["nadia kelly rockford", "rockford night shift", "distribution center route 20"],
    body: facebookPost({
      group: "Rockford Night Shift",
      author: "Nadia Kelly",
      when: "2 months ago",
      body: `3am club, check in. Who's up.

{{c:nadia_out|Four years on nights at the DC off Route 20. I'm asleep from about eight in the morning to four in the afternoon and I am wide awake at three every single night, and this group is the only place that makes sense.}}

The thing nobody tells you about nights is that you don't actually miss the daylight. You get used to the daylight being something that happens to other people. What you miss is being able to text somebody at three in the morning about nothing and have them answer.

Four years in, here's my list of things that helped, for anyone who just started:

Blackout curtains, obviously, but also a second set for the door, because the light under a door at noon will find you.

Eat at the same clock times every day even when the clock times are stupid. Your body does not care that it's 2am. Your body cares that it's four hours since the last one.

Do not try to "flip back" on days off to see people. You will be wrecked for three shifts and you will not have enjoyed the seeing.

And find the group of people who are up when you are. Which is this one. I have never met most of you and I would take a bullet for at least four of you.

Anyway. Six hours left on this shift. Who's up.`,
      image: {
        alt: `A photograph of a warehouse loading dock at night, floodlit, taken from inside a break room window.`,
      },
      reactions: 41,
      comments: [
        {
          by: "Ray D.",
          when: "2 months ago",
          text: `up. seven hours to go.`,
        },
        {
          by: "Nadia Kelly",
          when: "2 months ago",
          text: `solidarity ray`,
        },
      ],
    }).body,
  },
];
