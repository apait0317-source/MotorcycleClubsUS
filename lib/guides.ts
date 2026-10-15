export interface GuideSection {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  updated: string; // ISO date
  readingMinutes: number;
  sections: GuideSection[];
}

export const guides: Guide[] = [
  {
    slug: 'how-to-join-a-motorcycle-club',
    title: 'How to Join a Motorcycle Club: A Practical Guide for New Riders',
    shortTitle: 'How to Join a Club',
    description:
      'What to expect when you approach a motorcycle club, from the first ride to prospecting, dues, bylaws, and the questions to ask before you commit.',
    updated: '2026-10-15',
    readingMinutes: 7,
    sections: [
      {
        paragraphs: [
          'Most riders who want to join a club make the same mistake. They pick a club by its name or its patch and then try to fit themselves to it. The better order is the reverse: decide what you want from riding with a group, learn how the different kinds of clubs operate, and then approach the ones that match. This guide walks through that process and the unwritten rules that apply along the way.',
        ],
      },
      {
        heading: 'Start with what you want from a club',
        paragraphs: [
          'Clubs differ far more in their demands than in their logos. Some meet once a month and ride when the weather is good. Others expect attendance at weekly meetings, mandatory rides, fundraisers, and events several weekends a year. Before you contact anyone, answer four questions honestly.',
        ],
        list: [
          'How many days a month can you ride and attend meetings without strain on work or family?',
          'Do you want long-distance touring, local weekend rides, off-road days, or track time?',
          'Does a cause matter to you, such as veteran support, charity rides, faith, or sobriety?',
          'Do you want a social riding group, or the structure and brotherhood of a traditional MC?',
        ],
      },
      {
        heading: 'Know the kinds of clubs before you knock',
        paragraphs: [
          'A traditional motorcycle club (MC) has a formal membership process, officers, bylaws, and a patch that members earn over months or years. A riding club (RC) or brand owners group usually has open membership, annual dues, and few obligations beyond showing up. Veteran clubs, women\'s clubs, law enforcement clubs, ministries, and recovery clubs each add their own eligibility rules. Our guide to the types of motorcycle clubs explains the differences in detail. Read it first, because approaching an MC as if it were a riding club is the fastest way to be ignored.',
        ],
      },
      {
        heading: 'Find clubs that are active near you',
        paragraphs: [
          'Use the state and city pages on this site to build a short list, then confirm each club is active. A website that has not changed in years, or a social media page with no posts this season, is a sign the chapter may have folded or merged. Local independent motorcycle shops, charity rides, bike nights, and American Motorcyclist Association events are the places where active clubs show up in public. Veteran riders can also ask at the local VFW or American Legion post, which often host chapter meetings.',
        ],
      },
      {
        heading: 'Make first contact the right way',
        paragraphs: [
          'Go to a public event the club hosts or supports, such as a poker run, a toy drive, or a memorial ride. Introduce yourself to a member, say you are interested in learning about the club, and ask how they prefer people get to know them. Do not ask to join on the first meeting, do not wear another club\'s gear or any patch that could be read as a club affiliation, and do not touch anyone\'s vest. Ride your own motorcycle to the event. Most clubs expect members to own and ride a bike that fits the club\'s style, and some have a minimum engine size or a brand requirement.',
          'If a club has a public email or contact form, a short message works too. State who you are, where you ride, what draws you to the club, and ask whether they have open rides or meetings a guest can attend.',
        ],
      },
      {
        heading: 'Hang-around, prospect, patch',
        paragraphs: [
          'Traditional MCs use a staged process. As a hang-around you attend open events and rides by invitation so the club and you can learn about each other. If a member sponsors you, you become a prospect (some clubs say probate or probationary member). Prospecting can last from a few months to more than a year. Prospects attend everything, help with setup and cleanup, and prove reliability. At the end, full members vote. Riding clubs and brand groups skip most of this. You fill out a form, pay dues, and receive your membership materials.',
          'The length and intensity of prospecting is one of the clearest signals of what membership will demand later. A club that wants a year of your weekends before you join will want them afterward too.',
        ],
      },
      {
        heading: 'Questions to ask before you commit',
        list: [
          'What are the annual dues, and what do they cover?',
          'How many meetings and rides per month are mandatory?',
          'Are there bike requirements for brand, engine size, or age?',
          'Does the club have written bylaws, and may a prospect read them?',
          'How are chapter funds handled, and who signs on the account?',
          'What is the policy on family members riding along or attending events?',
          'How does a member leave in good standing, and what happens to the patch?',
          'Does the club carry event insurance for the rides it organizes?',
        ],
      },
      {
        heading: 'Warning signs',
        paragraphs: [
          'Walk away from any club that pressures you to decide quickly, will not explain where dues go, discourages questions about bylaws, or expects you to break the law to prove loyalty. Be careful with clubs whose members speak about rival clubs in terms of territory and confrontation. The overwhelming majority of clubs in this directory are charitable, social, or veteran organizations, and a legitimate club will respect a careful rider.',
        ],
      },
      {
        heading: 'What it costs',
        paragraphs: [
          'Expect annual dues anywhere from under one hundred dollars for a riding club to several hundred for an MC with a clubhouse. Add the cost of a vest, patches, and the fuel and lodging for mandatory runs. Time is the larger cost. A realistic estimate for an active MC member is two to four commitments a month in riding season. Match that against the answers you gave in the first section before you accept a sponsor.',
        ],
      },
    ],
  },
  {
    slug: 'types-of-motorcycle-clubs',
    title: 'Types of Motorcycle Clubs Explained: MC, RC, Veteran, Brand, and More',
    shortTitle: 'Types of Clubs',
    description:
      'The difference between a motorcycle club and a riding club, what veteran, women\'s, brand, ministry, off-road, and rights organizations do, and what the 1% patch means.',
    updated: '2026-10-15',
    readingMinutes: 8,
    sections: [
      {
        paragraphs: [
          'The word "club" covers organizations that have almost nothing in common beyond motorcycles. A Harley Owners Group chapter that meets for breakfast rides and a traditional three-piece-patch MC with a prospecting process are both clubs, but joining one tells you nothing about the other. This guide sorts the clubs you will find in this directory into the categories riders use, with the markers that let you tell them apart.',
        ],
      },
      {
        heading: 'Traditional motorcycle clubs (MC)',
        paragraphs: [
          'An MC is a membership organization with officers (typically president, vice president, secretary, treasurer, sergeant at arms, and road captain), bylaws, a prospecting process, and a patch that members earn and the club owns. Many wear a three-piece patch: a top rocker with the club name, a center emblem, and a bottom rocker with a territory. Others wear a one-piece or two-piece patch by choice or by regional custom. MCs vary from family-oriented clubs that run charity events to clubs that are strictly closed to outsiders. The letters "MC" on a vest or in a name are the simplest marker.',
        ],
      },
      {
        heading: 'Riding clubs (RC) and riding associations',
        paragraphs: [
          'Riding clubs exist to ride together. Membership is usually open to anyone with a motorcycle and the dues, there is little or no prospecting, and members can leave freely. Many RCs wear a one-piece patch or no patch at all, and most avoid the territorial bottom rocker out of respect for local MC custom. Riding associations and social riding groups are the same idea at larger scale, sometimes with regional chapters under a national charter.',
        ],
      },
      {
        heading: 'Brand and owners groups',
        paragraphs: [
          'Manufacturer-sponsored groups are the largest riding organizations in the country. The Harley Owners Group (H.O.G.) runs dealer-sponsored chapters. The Gold Wing Road Riders Association, the BMW Motorcycle Owners of America, the Indian Motorcycle Riders Group, and marque clubs for Ducati, Triumph, and others serve owners of those brands. Membership typically requires owning the brand, and activities center on group rides, rallies, and technical help. These are the easiest clubs to join and a good first step for a new rider.',
        ],
      },
      {
        heading: 'Veteran and military clubs',
        paragraphs: [
          'Veteran clubs make up a large share of this directory. The Combat Veterans Motorcycle Association requires proof of combat service and has chapters in nearly every state. Leathernecks MC and similar clubs serve Marines. American Legion Riders and VFW Riders operate as programs of their posts and are open to post members. Rolling Thunder chapters advocate for prisoners of war and missing in action accountability. Many veteran clubs admit supporters or auxiliary members without service records, but full membership is usually restricted. Expect strong involvement in escorts, funerals, and fundraising for veteran causes.',
        ],
      },
      {
        heading: "Women's clubs",
        paragraphs: [
          'Women\'s clubs range from national organizations such as Women On Wheels and the Motor Maids, founded in 1940, to local riding groups and women-only MCs. Some admit only riders, not passengers. Some welcome male associate members for events. The common thread is leadership by women and rides organized around women riders\' interests, from skills clinics to long-distance touring.',
        ],
      },
      {
        heading: 'Law enforcement and first responder clubs',
        paragraphs: [
          'The Blue Knights accept active and retired law enforcement officers. The Red Knights serve firefighters, and similar clubs exist for emergency medical personnel and corrections officers. These clubs are structured like MCs, often with three-piece patches, and they fundraise heavily for the families of fallen officers and firefighters.',
        ],
      },
      {
        heading: 'Ministries and recovery clubs',
        paragraphs: [
          'Motorcycle ministries, such as chapters of the Christian Motorcyclists Association and independent church-based clubs, ride to serve rather than to compete for territory. Many wear patches with crosses and avoid MC symbols. Recovery clubs, including Sober Riders MC and local clean-and-sober groups, require members to maintain sobriety and provide a riding community for people who no longer go to bars. Both kinds of clubs tend to be welcoming to new riders and to families.',
        ],
      },
      {
        heading: 'Off-road, trail, and competition clubs',
        paragraphs: [
          'Enduro, trail riding, motocross, trials, and vintage racing clubs organize events, maintain riding areas, and work with land managers to keep trails open. Many are chartered by the American Motorcyclist Association, which lets them sanction competitions and carry event insurance. If you ride dirt, these clubs are where the organized riding happens, and most hold work days that new members are expected to attend.',
        ],
      },
      {
        heading: 'Rider rights organizations',
        paragraphs: [
          'ABATE chapters, the Motorcycle Riders Foundation, and the American Motorcyclist Association lobby on helmet laws, lane filtering, insurance, and land access. They are membership organizations rather than riding clubs, though most chapters hold rides and rallies. Membership is open to anyone, and these groups are a practical way to meet riders from every other kind of club in your area.',
        ],
      },
      {
        heading: 'What the 1% patch means',
        paragraphs: [
          'The "1%" diamond traces to a mid-century claim that 99 percent of motorcyclists are law-abiding. Clubs that wear it identify as outlaw clubs, meaning they operate outside the American Motorcyclist Association rather than any statement about criminality. Some 1% clubs appear in public business listings and therefore in this directory. A listing is a record of a public presence, not a recommendation. New riders looking for a club to join should start with the categories above and treat 1% clubs as closed organizations that do not recruit from the public.',
        ],
      },
    ],
  },
  {
    slug: 'motorcycle-club-etiquette-and-patches',
    title: 'Motorcycle Club Etiquette: Patches, Clubhouses, and Group Rides',
    shortTitle: 'Club Etiquette and Patches',
    description:
      'How to read a cut, what not to do around club members, how to behave at a clubhouse or club event, and the rules of riding in a pack.',
    updated: '2026-10-15',
    readingMinutes: 7,
    sections: [
      {
        paragraphs: [
          'Club culture runs on customs that nobody writes down for outsiders. Most of them exist to prevent misunderstandings between clubs, and most are easy to follow once you know them. This guide covers the three situations a new rider is most likely to face: reading and respecting patches, visiting a clubhouse or club event, and riding in a group.',
        ],
      },
      {
        heading: 'Reading a cut',
        paragraphs: [
          'A cut (also called colors or a vest) carries a club\'s identity. A three-piece patch has a top rocker with the club name, a center emblem, and a bottom rocker that names a territory, usually a state or city. The small "MC" cube near the center confirms the wearer belongs to a traditional club. A one-piece patch is common among riding clubs, brand groups, and ministries. Side patches and tabs may show an office (President, Road Captain), a nickname, years of membership, a chapter, or a memorial. Support patches, often reading "Support" followed by a club\'s initials or numbers, are worn by people who are not members but back a particular MC.',
        ],
      },
      {
        heading: 'Patch rules that keep you out of trouble',
        list: [
          'Never touch another rider\'s cut, not even to point at a patch.',
          'Do not wear patches, rockers, or the letters MC unless a club has given them to you.',
          'Do not put a territory rocker on a vest for a riding club or an informal group.',
          'Do not wear a support patch for one club to an event hosted by a different club.',
          'Do not buy or wear a "replica" patch of a real club, however old or decorative it looks.',
          'If you leave a club, return the patch unless your bylaws say otherwise.',
        ],
      },
      {
        heading: 'Visiting a clubhouse or club event',
        paragraphs: [
          'Clubhouses are private. Go only when invited or when the club advertises a public event, and arrive on your motorcycle if you ride. Park where you are directed and never in a spot marked for members or officers. Introduce yourself to the person at the door or the first member who approaches, and say who invited you. Buy a raffle ticket or a drink, because the event is almost always a fundraiser.',
          'Ask before taking photos, and never photograph members without permission. Do not wander into back rooms or sit at a table that appears reserved. Do not discuss other clubs, politics between clubs, or anything you have read online about the club you are visiting. Leave when the public portion ends unless a member asks you to stay.',
        ],
      },
      {
        heading: 'Riding in a group',
        paragraphs: [
          'Organized rides follow a structure. The road captain leads, sets the pace, and signals turns and hazards. The sweep or tail gunner rides last and handles breakdowns. Riders hold a staggered formation on straight roads, about one second behind the bike directly ahead and two seconds behind the bike in the same track. On curves and in heavy traffic the group moves to single file on the leader\'s signal.',
          'Learn the hand signals before the ride: left arm straight out for a left turn, bent up for a right, pointing down at the road for a hazard, tapping the helmet for police ahead, and a raised hand for a stop. Do not pass inside the formation, do not fill a gap unless the rider ahead waves you up, and do not leave the group without telling the sweep. Arrive with a full tank, because the group stops when the smallest tank needs fuel, and fuel stops are not the time to run errands.',
        ],
      },
      {
        heading: 'Escorts and memorial rides',
        paragraphs: [
          'Veteran clubs frequently escort funerals and welcome-home ceremonies. If you join one as a guest, follow the ride briefing exactly, keep your engine quiet near the service, and remove your helmet and stand when flags pass or taps is played. Flag lines are organized by the hosting club. Ask where they want you before you take a flag.',
        ],
      },
      {
        heading: 'Online conduct',
        paragraphs: [
          'Club business stays inside the club. Do not post photos of members, clubhouse interiors, or ride routes without permission, and do not tag a club in posts about events you attended as a guest. The same rule covers messaging a club on social media to argue, ask for a patch, or report rumors. Public contact details listed in this directory are for genuine questions about riding and membership.',
        ],
      },
      {
        heading: 'The short version',
        paragraphs: [
          'Ride your own bike, keep your hands to yourself, wear nothing you did not earn, ask before you photograph, and do what the road captain says. Riders who follow those five rules are welcome at nearly every club event in the country.',
        ],
      },
    ],
  },

  {
    slug: 'how-motorcycle-clubs-work',
    title: 'How Motorcycle Clubs Work: Structure, Officers, Meetings, and Money',
    shortTitle: 'How Clubs Work',
    description:
      'The internal mechanics of a motorcycle club: officer roles, chapters and national boards, meetings, voting, dues, and the bylaws that hold it together.',
    updated: '2026-10-15',
    readingMinutes: 7,
    sections: [
      {
        paragraphs: [
          'From the outside a motorcycle club looks like a group of friends who ride together. From the inside it runs more like a small nonprofit with a uniform. Understanding that structure helps you judge a club before you join it, and it explains why clubs behave the way they do toward prospects, visitors, and each other.',
        ],
      },
      {
        heading: 'The officer slate',
        paragraphs: [
          'Nearly every chartered club elects the same core officers. The president runs meetings, represents the club to other clubs, and has the final word on day-to-day questions. The vice president steps in when the president is absent and often handles prospects. The secretary keeps minutes, membership rolls, and correspondence. The treasurer collects dues, pays bills, and reports the balance at each meeting. The sergeant at arms keeps order at meetings and events and holds the club\'s property, including patches that are returned when a member leaves. The road captain plans routes, leads rides, and sets the rules for the pack.',
          'Larger clubs add an enforcer, a tail gunner, a chaplain, a historian, and committee chairs for events and charity work. Riding clubs and brand chapters use the same titles with lighter responsibilities, and dealer-sponsored chapters often have a dealer liaison who sits with the officers.',
        ],
      },
      {
        heading: 'Chapters, mother chapters, and national boards',
        paragraphs: [
          'A single-location club is one chapter that answers to itself. Multi-chapter clubs add a layer. The founding chapter, often called the mother chapter, or a national board of elected officers sets the bylaws, approves new chapters, controls the patch, and settles disputes between chapters. Local chapters keep their own treasury and elect their own officers but cannot change the colors, the name, or the territory on the bottom rocker without national approval. When you talk to a chapter, ask whether it is independent or part of a national club. The answer changes who makes decisions about you.',
        ],
      },
      {
        heading: 'Meetings',
        paragraphs: [
          'Most clubs meet once or twice a month. Traditional MCs call the meeting "church" and treat attendance as mandatory for members, with fines or demerits for absence without notice. Meetings follow a simple order: roll call, treasurer\'s report, old business, new business, prospect reports, upcoming rides and events, and open floor. Prospects are usually excused for the portion where members are discussed. Riding clubs hold shorter, more informal meetings, often at a restaurant or dealership, and treat attendance as encouraged rather than required.',
        ],
      },
      {
        heading: 'Voting and bylaws',
        paragraphs: [
          'Bylaws are the club\'s constitution. They cover eligibility, the prospecting process, dues, officer terms, quorum, voting thresholds, discipline, and how a member leaves. In most traditional MCs, admitting a new member requires a unanimous or near-unanimous vote of the full members present. Officers are elected annually or every two years. Expulsion usually requires a supermajority. A club that cannot show a prospect its bylaws, or that does not have written ones, is telling you something about how disputes will be handled later.',
        ],
      },
      {
        heading: 'Where the money goes',
        paragraphs: [
          'Dues fund the treasury. Typical expenses include clubhouse rent or mortgage, utilities, insurance, event costs, support for members in a crisis, flowers and travel for funerals, and donations to the causes the club supports. Fundraisers such as poker runs, bike shows, and parties bring in more than dues at many clubs. Well-run clubs keep a bank account in the club\'s name with two signatures required on checks, report the balance at every meeting, and keep receipts. Many incorporate as a nonprofit in their state, and charity-focused clubs often hold federal tax-exempt status so donors can deduct gifts.',
        ],
      },
      {
        heading: 'Discipline and leaving',
        paragraphs: [
          'Clubs enforce their rules internally. Minor violations draw fines or extra duties. Serious ones go to a vote. A member who leaves voluntarily and in good standing returns the club\'s property, keeps the friendships, and is often welcome at events. A member voted out, or who leaves owing money or over a dispute, is said to leave in bad standing and is usually barred from the clubhouse and from wearing anything associated with the club. Ask about this process before you prospect. The exit rules tell you how much freedom you are giving up.',
        ],
      },
      {
        heading: 'Why this matters to a new rider',
        paragraphs: [
          'A club with clear officers, written bylaws, open books, and a known exit process is a club that will treat you predictably. The friendliest group at a bike night can still be a poorly run organization. Use the directory to find candidates, then use these questions to sort them.',
        ],
      },
    ],
  },
  {
    slug: 'mc-vs-riding-club',
    title: 'MC vs. Riding Club: Which One Fits You',
    shortTitle: 'MC vs. Riding Club',
    description:
      'A side-by-side comparison of traditional motorcycle clubs and riding clubs on commitment, cost, patches, politics, family involvement, and how easy it is to leave.',
    updated: '2026-10-15',
    readingMinutes: 6,
    sections: [
      {
        paragraphs: [
          'The two most common kinds of clubs in this directory ask very different things of their members. Riders who pick the wrong one usually leave within a year, sometimes with hard feelings. This guide puts the differences side by side so you can decide before you invest the time.',
        ],
      },
      {
        heading: 'Commitment',
        paragraphs: [
          'A traditional motorcycle club (MC) expects the club to come near the top of your priorities. Mandatory meetings, mandatory runs, event support, and prospect duties add up to several commitments a month in riding season and a standing expectation that you will show up when called. A riding club (RC) expects you to ride when you can. Missing a ride costs you nothing beyond the ride.',
        ],
      },
      {
        heading: 'Getting in',
        paragraphs: [
          'MCs run a hang-around and prospect process that can last months to more than a year and ends in a vote. RCs typically have an application, dues, and sometimes a short probationary period. Brand owners groups and rider associations are the simplest: proof of ownership or a paid membership and you are in.',
        ],
      },
      {
        heading: 'The patch',
        paragraphs: [
          'MC patches belong to the club, are earned, and are returned when you leave. Many MCs wear a three-piece patch with a territory rocker and take that territory seriously. RCs wear a one-piece patch or no patch at all and generally avoid territory rockers so they do not appear to claim turf. If wearing a three-piece patch matters to you, that alone points you toward an MC. If you do not want to think about patch politics, an RC is the easier road.',
        ],
      },
      {
        heading: 'Club politics',
        paragraphs: [
          'MCs exist inside a web of relationships with other MCs in their region. Some areas have a confederation of clubs or a council that coordinates events and settles protocol questions, and new MCs are expected to introduce themselves to established clubs before flying colors. Members are expected to know and follow that protocol. RCs sit outside most of it, though a polite RC still shows respect at events hosted by MCs.',
        ],
      },
      {
        heading: 'Cost',
        paragraphs: [
          'MC dues tend to be higher because they support a clubhouse, insurance, and events, and the time cost is far higher. RC dues are modest and often cover little more than a patch, a website, and an annual party. Both may expect you to buy your own vest, patches, and event tickets.',
        ],
      },
      {
        heading: 'Family',
        paragraphs: [
          'Many MCs are family-oriented and welcome spouses and children at most events, but club meetings and some runs remain members-only, and the time commitment lands on the family too. RCs usually include partners as full or associate members and build their calendars around family-friendly rides.',
        ],
      },
      {
        heading: 'Leaving',
        paragraphs: [
          'Leaving an RC means not renewing. Leaving an MC means returning your patch and property, settling any debts, and going through whatever exit process the bylaws describe. Done properly, you leave in good standing. Done badly, you lose the relationships and may be unwelcome at events for years.',
        ],
      },
      {
        heading: 'A simple test',
        list: [
          'You want brotherhood, structure, and a patch you earned, and you have the time: look at MCs.',
          'You want to ride with people on weekends and keep your schedule your own: look at RCs and brand groups.',
          'You want a cause first and riding second: look at veteran, charity, and ministry clubs, which exist in both forms.',
          'You are new to motorcycling: start with an RC or brand chapter. You can always prospect for an MC later with experience and references.',
        ],
      },
    ],
  },
  {
    slug: 'prospecting-for-a-motorcycle-club',
    title: 'Prospecting: What the Process Looks Like and How to Get Through It',
    shortTitle: 'Prospecting',
    description:
      'The stages of joining a traditional motorcycle club, what prospects are asked to do, what they are not allowed to do, and how the final vote works.',
    updated: '2026-10-15',
    readingMinutes: 7,
    sections: [
      {
        paragraphs: [
          'Prospecting is the probationary period between being a friend of a motorcycle club and being a member of it. It exists so the club can learn whether you are reliable, honest, and compatible, and so you can learn whether the club is what you want. Every club runs it differently, but the stages and the expectations are consistent enough to describe.',
        ],
      },
      {
        heading: 'Stage one: hang-around',
        paragraphs: [
          'A hang-around has been invited to attend open events and some rides. You are not a member, you wear no club insignia, and you have no obligations beyond showing up when invited and behaving well. The club is watching how you ride, how you treat people, how you handle alcohol, and whether you talk about club business outside the club. Use this time to watch them too. Hang-around periods run from a few weeks to several months.',
        ],
      },
      {
        heading: 'Stage two: sponsorship',
        paragraphs: [
          'A full member must agree to sponsor you before you can prospect. Your sponsor answers for you to the club and guides you through the process. Choose carefully if you have a choice. A respected sponsor who takes the role seriously shortens the road. A sponsor who is new or on thin ice with the club lengthens it.',
        ],
      },
      {
        heading: 'Stage three: prospect',
        paragraphs: [
          'Prospects receive a prospect patch or rocker, attend every meeting and event, and take on the work of the club: setting up and tearing down events, security at parties, running errands, riding at the back of the pack, and standing by the bikes at stops. Prospects are usually excluded from the part of meetings where members vote and from some club discussions. The point is not humiliation, though clubs vary in how they handle it. The point is to see whether you do unglamorous work without complaint and keep showing up when it is inconvenient.',
          'Prospecting commonly runs six months to a year. Some clubs set a minimum, some do not. Clubs with a national structure often require a minimum number of events attended and a certain number of miles ridden with the club.',
        ],
      },
      {
        heading: 'What prospects may not do',
        list: [
          'Wear the club\'s full colors or center patch.',
          'Speak for the club or represent it to other clubs.',
          'Bring guests to club events without permission.',
          'Discuss club business, membership votes, or internal disputes with anyone outside the club.',
          'Ride in the pack ahead of full members unless directed.',
        ],
      },
      {
        heading: 'The vote',
        paragraphs: [
          'When the sponsor and the officers believe you are ready, the full members vote. In most traditional MCs the vote must be unanimous or close to it, and a single member with a serious objection can delay or end your prospecting. If you pass, you receive your patch at a ceremony that varies by club. If you do not, your sponsor will usually tell you why, and some clubs allow a second attempt after a waiting period.',
        ],
      },
      {
        heading: 'Keeping your life intact',
        paragraphs: [
          'Prospecting strains jobs and relationships. Be honest with your sponsor about work shifts and family obligations before you start, and be honest with your family about what the next year will look like. A good club will work around a legitimate schedule conflict. A club that treats your job or your family as a sign of disloyalty is giving you useful information.',
        ],
      },
      {
        heading: 'Lines you should not cross',
        paragraphs: [
          'No legitimate club requires a prospect to commit a crime, surrender a vehicle title, hand over bank details, or cut off outside friends. If any of these come up, stop prospecting and walk away. The clubs in this directory are overwhelmingly charitable, veteran, and social organizations, and a bad experience with one club says nothing about the rest.',
        ],
      },
    ],
  },
  {
    slug: 'how-to-start-a-motorcycle-club',
    title: 'How to Start a Motorcycle Club or Riding Club',
    shortTitle: 'Starting a Club',
    description:
      'The practical steps to found a club: deciding what kind, writing bylaws, choosing a name and patch without stepping on an existing club, incorporating, insurance, and growing membership.',
    updated: '2026-10-15',
    readingMinutes: 8,
    sections: [
      {
        paragraphs: [
          'Riders start clubs for good reasons: there is no club nearby that fits, the local clubs are closed to new members, or a group of friends has ridden together long enough that a name and a patch feel natural. The steps below are the ones that keep a new club out of trouble with the law, the bank, and the established clubs in your area.',
        ],
      },
      {
        heading: 'Decide what you are building',
        paragraphs: [
          'The first decision is whether you are forming a riding club, a traditional MC, a veteran or charity organization, or a brand chapter. Each has a different expected structure, patch convention, and level of protocol with other clubs. A riding club with a one-piece patch is the simplest to start and the least likely to create friction. A new three-piece-patch MC in an area with established clubs requires introductions and, in many regions, acceptance by a local council or confederation of clubs before it flies colors. Decide this before you design anything.',
        ],
      },
      {
        heading: 'Write the bylaws first',
        paragraphs: [
          'Bylaws come before patches. Cover membership eligibility, the process for admitting members, dues and what they fund, officer positions and terms, meeting schedule and quorum, voting thresholds, discipline, how a member leaves, and what happens to club property and money if the club dissolves. Keep them short enough that every member will read them. Many state nonprofit associations and the American Motorcyclist Association publish sample bylaws for chartered clubs.',
        ],
      },
      {
        heading: 'Name and patch clearance',
        paragraphs: [
          'Search this directory, state business registries, and social media for your proposed name before you commit. Then check the patch. Do not use a bottom rocker with a state or city name unless you have done the introductions that custom requires in your region, and do not borrow colors, symbols, or layouts from existing clubs. Many areas have a confederation of clubs, often called a COC or a council, whose meetings are the right place to introduce a new club and avoid an avoidable conflict. Dealership-sponsored chapters and brand groups follow the manufacturer\'s rules instead.',
        ],
      },
      {
        heading: 'Make it legal',
        paragraphs: [
          'Incorporate as a nonprofit corporation in your state. It is inexpensive, it separates the club\'s liabilities from the members\' personal assets, and banks require it to open an account in the club\'s name. Obtain a federal employer identification number, open the account with two-signature authority, and keep records from the first dollar. If the club will fundraise for charity, talk to an accountant about federal tax-exempt status, which lets donors deduct gifts and lets you accept grants.',
        ],
      },
      {
        heading: 'Insurance',
        paragraphs: [
          'A club that organizes rides and events needs general liability insurance. Event organizers are routinely named in lawsuits after crashes. Chartered clubs can often buy coverage through their national organization, and several insurers write policies for independent clubs. Venues for poker runs and parties will ask for a certificate of insurance before they confirm.',
        ],
      },
      {
        heading: 'Dues, officers, and the first year',
        paragraphs: [
          'Set dues at a level that covers insurance, a website, patches at cost, and a small reserve. Elect officers from the founding group, hold meetings on a fixed schedule, and ride together before you recruit. A club that has run a season of rides and one well-organized event has something to show a prospective member. A club that recruits first and figures out the rest later usually does not survive its first disagreement.',
        ],
      },
      {
        heading: 'Growing without losing the plot',
        paragraphs: [
          'Admit members slowly. Every new member changes the character of a small club, and a bad fit admitted quickly costs more than a good fit admitted late. Keep the bylaws current, keep the money transparent, keep the website and social media pages updated so riders can tell you are active, and submit the club to this directory so riders in your area can find you.',
        ],
      },
    ],
  },
  {
    slug: 'motorcycle-rallies-and-events',
    title: 'Motorcycle Rallies and Events: The Annual Calendar and How Clubs Use It',
    shortTitle: 'Rallies and Events',
    description:
      'The major American motorcycle rallies month by month, what each one is like, how clubs participate, and how to plan a first rally trip.',
    updated: '2026-10-15',
    readingMinutes: 7,
    sections: [
      {
        paragraphs: [
          'Rallies are where clubs meet other clubs. They are also where many riders first talk to a club they later join. The national calendar has a rhythm that repeats every year, and most regional and club events are scheduled around it. Dates shift by a few days each year, so confirm with the organizer before you book.',
        ],
      },
      {
        heading: 'March: Daytona Bike Week, Florida',
        paragraphs: [
          'Daytona Beach has hosted Bike Week since the 1930s, and it opens the national season. Ten days of Main Street, beach riding, vendor villages, and racing at the speedway. Clubs from the Southeast and the Midwest ride down, and many northern clubs use it as their first long run of the year. Lodging books months ahead.',
        ],
      },
      {
        heading: 'May: Myrtle Beach and Memorial Day rides',
        paragraphs: [
          'Myrtle Beach Bike Week in South Carolina fills the Grand Strand in mid-May, and Atlantic Beach Bikefest follows over Memorial Day weekend. The same weekend, veteran clubs converge on Washington for the memorial demonstration ride, and the Red River rally brings clubs to the New Mexico mountains. Memorial Day is the busiest weekend of the year for veteran clubs, with escorts, flag lines, and ceremonies in nearly every state.',
        ],
      },
      {
        heading: 'June: Laconia, Americade, and the Republic of Texas',
        paragraphs: [
          'Laconia Motorcycle Week in New Hampshire is the oldest rally in the country, built around Weirs Beach and the roads of the White Mountains. Americade at Lake George, New York, is a touring rally with organized rides, seminars, and a calmer atmosphere than the big street parties. The Republic of Texas Rally in Austin anchors the southern calendar with a downtown parade that draws tens of thousands of bikes.',
        ],
      },
      {
        heading: 'August: Sturgis',
        paragraphs: [
          'The Sturgis Motorcycle Rally in the Black Hills of South Dakota is the largest in the world, and the first full week of August is when a large share of the clubs in this directory are somewhere between home and the Black Hills. The roads, Needles Highway, Iron Mountain Road, Spearfish Canyon, and the Badlands, are the reason to go. The town is the reason people stay. Camping and lodging sell out a year out, and the surrounding towns absorb the overflow.',
        ],
      },
      {
        heading: 'September and October: the fall rallies',
        paragraphs: [
          'Fall brings Ocean City Bikefest in Maryland, Street Vibrations in Reno, the Lake of the Ozarks Bikefest in Missouri, and Bikes, Blues and BBQ in Arkansas. Biketoberfest returns to Daytona in October, and Las Vegas BikeFest closes the western season. Fall rallies are cooler, less crowded, and often the best choice for a first trip.',
        ],
      },
      {
        heading: 'November: Lone Star Rally',
        paragraphs: [
          'The Lone Star Rally in Galveston, Texas, is the last large rally of the year and draws clubs from across the Gulf Coast while the rest of the country has parked for winter.',
        ],
      },
      {
        heading: 'How clubs participate',
        paragraphs: [
          'Clubs ride to rallies as a pack, camp or rent houses together, run a booth or a hospitality tent, host a party, or support a charity event inside the larger rally. For a prospect, a rally run is often the longest test of the prospecting period. For a visitor, a rally is the easiest place to see dozens of clubs in one weekend and to notice which ones you would want to ride with.',
        ],
      },
      {
        heading: 'Planning a first rally',
        list: [
          'Book lodging or camping the day registration opens, and expect to pay rally rates.',
          'Service the bike before you leave. Rally-week shops are overwhelmed.',
          'Ride the famous roads early in the morning, before the traffic and the heat.',
          'Carry rain gear even in the desert. August storms in the Black Hills are routine.',
          'Keep the etiquette rules in mind around clubs. Rallies are where most patch mistakes happen.',
        ],
      },
    ],
  },
  {
    slug: 'group-riding-safety',
    title: 'Group Riding Safety: The Pre-Ride Briefing, Formation, and Pace',
    shortTitle: 'Group Riding Safety',
    description:
      'How well-run clubs keep a pack safe: the briefing, the roles, staggered formation, following distance, intersections, passing, fuel stops, and what to do when something goes wrong.',
    updated: '2026-10-15',
    readingMinutes: 7,
    sections: [
      {
        paragraphs: [
          'Most of a club\'s riding is done in a group, and most group crashes come from the same handful of mistakes: riding too close, riding above someone\'s skill, and improvising at intersections. The clubs in this directory that ride thousands of miles a year without incident follow a routine. This is that routine.',
        ],
      },
      {
        heading: 'The pre-ride briefing',
        paragraphs: [
          'Every organized ride starts with the road captain gathering the group. The briefing covers the route and the stops, the expected pace, the formation, the hand signals, who leads and who sweeps, what to do if the group splits at a light, and the plan for breakdowns. New riders and guests are placed near the front where the pace is steadiest and the road captain can watch them. Riders are expected to arrive with a full tank, a working bike, and no alcohol.',
        ],
      },
      {
        heading: 'Roles',
        paragraphs: [
          'The road captain leads, sets the pace, and makes every decision about the route. The sweep, sometimes called the tail gunner, rides last, carries tools and a first-aid kit, and stops with anyone who has a problem so the group is never split without a member at the back. Larger groups add a mid-pack rider to relay signals and block intersections when the law permits. Nobody passes the road captain, and nobody rides behind the sweep.',
        ],
      },
      {
        heading: 'Formation and spacing',
        paragraphs: [
          'On open roads the group rides staggered: the leader in the left third of the lane, the second rider in the right third about one second back, the third in the left third one second behind the second, and so on. That gives each rider two seconds to the bike directly ahead and a full lane width to maneuver. On curves, in rain, on gravel, and in heavy traffic the leader signals single file and the group spreads out further. Side by side riding is for parades and is unsafe at speed.',
        ],
      },
      {
        heading: 'Pace',
        paragraphs: [
          'The pace is set for the least experienced rider in the group, not the most. Riders who want to go faster leave the group and ride ahead on their own, by arrangement with the road captain. Riders who fall behind are not chased down and are not left; the sweep stays with them and the group waits at the next stop. The accordion effect at the back of a long pack is real: riders in the rear have to accelerate and brake harder than the leader, which is why experienced clubs keep groups to eight or ten bikes and run multiple groups a few minutes apart.',
        ],
      },
      {
        heading: 'Intersections, lights, and highways',
        paragraphs: [
          'A group never runs a red light to stay together. When the pack splits at a signal, the front group slows or pulls over at the next safe spot, and the rear group catches up on its own. At stop signs the group tightens to two abreast only if stopped, then re-forms staggered. On highway entrances the group merges one at a time and re-forms in the travel lane. Blocking intersections is illegal for civilian riders in most places and gets clubs cited and sued.',
        ],
      },
      {
        heading: 'Passing',
        paragraphs: [
          'Passing a slower vehicle on a two-lane road is done one bike at a time, each rider making an independent decision about oncoming traffic. The group re-forms after the pass. On multi-lane roads the leader signals a lane change, the sweep secures the new lane, and the group moves over from the back forward so no rider is ever boxed in.',
        ],
      },
      {
        heading: 'Stops',
        paragraphs: [
          'The group stops for fuel when the smallest tank needs it, typically every ninety minutes to two hours. Riders pull in, fuel up in order, and move away from the pumps before taking a break. Stops are kept short, because a group that lingers arrives late and rides tired.',
        ],
      },
      {
        heading: 'When something goes wrong',
        paragraphs: [
          'If a rider goes down, the first bikes past the scene keep going to a safe pull-off rather than stopping in the lane, the sweep and one or two riders stop, someone calls for help with a location, and someone controls traffic from a safe distance. Carry a first-aid kit, a tire plug kit, and the group contact list. Clubs that run a lot of miles rehearse this once a season, because the first time it happens is not the time to work it out.',
        ],
      },
    ],
  },

  {
    slug: 'veteran-motorcycle-clubs',
    title: 'Veteran Motorcycle Clubs: Who They Are and How to Join',
    shortTitle: 'Veteran Clubs',
    description:
      'The major veteran and military motorcycle organizations, their eligibility rules, what they do, and how to find a chapter near you.',
    updated: '2026-10-15',
    readingMinutes: 7,
    sections: [
      {
        paragraphs: [
          'Veteran clubs are the largest single category of clubs in this directory after general motorcycle clubs, and they are the easiest category for a qualifying rider to join. They combine the structure of a traditional club with a mission that most members already share: taking care of other veterans. This guide covers the main organizations and how they differ.',
        ],
      },
      {
        heading: 'Combat Veterans Motorcycle Association',
        paragraphs: [
          'The CVMA has chapters in nearly every state, identified by a state number and a chapter number such as 15-1. Full membership requires documented service in a combat zone, verified from discharge paperwork. Veterans without combat service can join as supporters in many chapters, and spouses join an auxiliary. Chapters raise money for veteran causes, visit hospitals, escort funerals, and ride together. The CVMA wears a three-piece patch but describes itself as an association rather than an MC and keeps a cooperative relationship with local clubs.',
        ],
      },
      {
        heading: 'American Legion Riders and VFW Riders',
        paragraphs: [
          'These are programs of their parent posts, not independent clubs. To join the American Legion Riders you must belong to the American Legion, the Auxiliary, or the Sons of the American Legion, which means eligibility follows the Legion\'s rules on service. VFW Riders groups follow the Veterans of Foreign Wars eligibility. Both run the Legacy Run and local charity rides, and both are the right first stop for a veteran who wants structure without a prospecting period.',
        ],
      },
      {
        heading: 'Service-specific MCs',
        paragraphs: [
          'Leathernecks MC and similar clubs serve Marines and Navy corpsmen who served with them. Other clubs restrict membership to a single branch, a single conflict, or a single career field. These are traditional MCs with prospecting, bylaws, and earned patches. Eligibility is verified from service records, and the culture closely resembles the units members came from.',
        ],
      },
      {
        heading: 'Rolling Thunder and the Patriot Guard Riders',
        paragraphs: [
          'Rolling Thunder chapters advocate for accountability for prisoners of war and the missing in action and organize the Memorial Day presence in Washington and in state capitals. Membership is open to anyone who supports the mission, veteran or not. The Patriot Guard Riders are not a club at all but a volunteer network that attends funerals at the invitation of the family to stand flag lines and shield mourners from protesters. Anyone can ride with them. Many club members do.',
        ],
      },
      {
        heading: 'Law enforcement and first responder clubs',
        paragraphs: [
          'The Blue Knights accept active and retired law enforcement officers. The Red Knights accept firefighters. Related clubs exist for emergency medical personnel and corrections. Many veterans who went into public safety after service belong to both a veteran club and one of these.',
        ],
      },
      {
        heading: 'What veteran clubs do',
        list: [
          'Escort funerals, dignified transfers, and welcome-home ceremonies.',
          'Raise money for veteran service organizations, hospitals, and individual veterans in crisis.',
          'Visit hospitalized veterans and nursing homes.',
          'Support families of the fallen and deployed service members.',
          'Ride together, which for many members is the point.',
        ],
      },
      {
        heading: 'Finding a chapter',
        paragraphs: [
          'Use the state pages in this directory and filter by eye for veteran clubs, which are labeled by category. Check the national organization\'s chapter locator to confirm the chapter is current. Veterans service offices, VFW and Legion posts, and base morale and recreation offices usually know which chapters are active. Chapters near large installations tend to be the biggest and the most active.',
        ],
      },
      {
        heading: 'Before you join',
        paragraphs: [
          'Bring your discharge paperwork to the first meeting; every veteran club will ask for it. Ask whether supporter or auxiliary membership exists for family. Ask how often the chapter rides and how often it escorts, because escort duty is time-consuming and emotionally heavy. For many members it is also the most meaningful thing they do on a motorcycle.',
        ],
      },
    ],
  },
  {
    slug: 'womens-motorcycle-clubs',
    title: "Women's Motorcycle Clubs: Options, Eligibility, and How to Connect",
    shortTitle: "Women's Clubs",
    description:
      "National women's riding organizations, women-only MCs, mixed clubs with strong women's membership, and how to find the right fit as a woman who rides.",
    updated: '2026-10-15',
    readingMinutes: 6,
    sections: [
      {
        paragraphs: [
          'Women have ridden in organized clubs since the 1940s, and the number of women-led clubs in this directory keeps growing. The choices range from century-old national organizations to small local riding groups and women-only MCs with full prospecting. This guide lays out the options and what each expects.',
        ],
      },
      {
        heading: 'National organizations',
        paragraphs: [
          'The Motor Maids, founded in 1940, are the oldest women\'s motorcycle organization in North America. Members must own and ride their own motorcycles, and the organization is known for its annual convention and its uniform of grey slacks, white gloves, and blue overblouses at events. Women On Wheels welcomes all women who ride or ride as passengers and runs chapters across the country with a family-friendly style. Both are open-membership organizations with dues rather than prospecting.',
        ],
      },
      {
        heading: 'Women-only motorcycle clubs',
        paragraphs: [
          'Women-only MCs run the same way other traditional clubs do, with hang-around and prospect periods, elected officers, bylaws, and earned patches. Some wear three-piece patches and participate in the local council of clubs. Membership usually requires owning and riding your own motorcycle. These clubs offer the brotherhood structure of an MC without the gender dynamics of a mixed club, and several have decades of history.',
        ],
      },
      {
        heading: 'Mixed clubs and brand chapters',
        paragraphs: [
          'Most riding clubs, brand chapters, veteran clubs, and ministries admit women as full members and many are led by women. The Harley Owners Group runs a Ladies of Harley program inside its chapters. A woman who wants to ride with a mixed group should ask the same questions any prospect asks, plus one more: how many women are full members, as opposed to associate members or passengers, and do they hold office.',
        ],
      },
      {
        heading: 'Local riding groups',
        paragraphs: [
          'Informal women\'s riding groups organized on social media are common in larger cities and are often the easiest entry point for a new rider. They tend to run skills days, group rides at a relaxed pace, and gear swaps. Many women ride with one of these groups for a season and then move to a chartered club with more structure.',
        ],
      },
      {
        heading: 'What a first ride looks like',
        paragraphs: [
          'Most women\'s clubs and riding groups post open rides for guests. Expect a short briefing, a pace set for the newest rider, and a stop for coffee or lunch where the talking happens. Nobody will ask you to prospect on a first ride. Come on your own bike if you have one, bring rain gear, and plan to stay for the meal, because that is where you learn whether the group is a fit. Women-only MCs handle first contact more formally and usually ask a guest to come to a public event before any ride.',
        ],
      },
      {
        heading: 'Why women-led clubs matter',
        paragraphs: [
          'Women are the fastest-growing group of new riders in the country, and many learned to ride as adults without a family tradition behind them. A women-led club supplies what a parent or older sibling supplies elsewhere: a mentor who has made the same mistakes, honest gear advice, slow-speed practice without an audience, and a group that rides a pace that builds skill instead of punishing it. Riders who start in one of these clubs often move into mixed clubs and brand chapters later with far more confidence than riders who started alone.',
        ],
      },
      {
        heading: 'Eligibility questions to ask',
        list: [
          'Do I need to ride my own motorcycle, or are passengers eligible?',
          'Is there a minimum engine size or a brand requirement?',
          'Are men allowed as associate members, supporters, or guests at events?',
          'What is the time commitment, and is there a prospecting period?',
          'Does the club participate in the local council of clubs, and what does that involve?',
        ],
      },
      {
        heading: 'Finding clubs near you',
        paragraphs: [
          'The state and city pages on this site label women\'s clubs by category. National organizations publish chapter locators. Women\'s riding events, skills clinics, and the women\'s sections of the big rallies are where the local clubs show up in person, and an independent motorcycle shop in your area will usually know which women\'s groups are active.',
        ],
      },
    ],
  },
  {
    slug: 'charity-rides-and-poker-runs',
    title: 'Charity Rides and Poker Runs: How They Work and How Clubs Run Them',
    shortTitle: 'Charity Rides and Poker Runs',
    description:
      'How a poker run is scored, what to expect as a rider, how clubs organize and insure events, and how to tell a well-run fundraiser from a bad one.',
    updated: '2026-10-15',
    readingMinutes: 6,
    sections: [
      {
        paragraphs: [
          'Charity rides are the public face of most clubs in this directory, and the poker run is the most common format. If you want to meet a club, ride in its charity event. If you want to understand a club, look at how it runs one.',
        ],
      },
      {
        heading: 'How a poker run works',
        paragraphs: [
          'Riders pay an entry fee and receive a scorecard. The route includes five stops, usually bars, dealerships, or sponsor businesses, spaced twenty to forty minutes apart. At each stop the rider draws a playing card, which is recorded on the card or stamped by a volunteer. At the final stop the hands are scored like poker, and the best hand wins a cash prize or a share of the pot, with a smaller prize for the worst hand. Riders can buy extra cards at the end to improve a hand, which raises more money. The riding is not timed and is not a race.',
        ],
      },
      {
        heading: 'What a rider should expect',
        paragraphs: [
          'Registration opens in the morning at the first stop, with a window of an hour or two so groups can leave at their own pace. Entry fees typically run twenty to thirty dollars per rider and less per passenger, and often include a meal and a pin or patch. Expect a safety briefing, a map or a route card, and a final stop with food, raffles, music, and the drawing. Ride your own pace between stops. Groups form informally, and the sweep from the host club usually runs the route last to pick up stragglers.',
        ],
      },
      {
        heading: 'Other formats',
        paragraphs: [
          'Dice runs replace cards with dice rolls at each stop. Scavenger runs send riders to find and photograph locations. Memorial rides and escorted rides follow a single route as one large group, often with police escort, and end at a ceremony. Bike shows, bike blessings at the start of the season, toy runs before the holidays, and benefit parties round out most clubs\' calendars.',
        ],
      },
      {
        heading: 'How clubs organize one',
        paragraphs: [
          'A good poker run takes two to three months to plan. The club chooses a beneficiary, lines up five stops willing to host and often to sponsor, recruits business sponsors for prizes and printing, secures general liability insurance and a certificate for each venue, sets registration and scoring volunteers, promotes the event through social media, shops, and other clubs, and designs the route for safety rather than for scenery. On the day, volunteers staff each stop, the treasurer handles cash with two people present, and the club announces the total raised and presents it to the beneficiary publicly.',
        ],
      },
      {
        heading: 'Insurance and the law',
        paragraphs: [
          'Event organizers are liable when something goes wrong, which is why established clubs carry event insurance and require riders to sign a waiver at registration. Some states regulate raffles and games of chance, and a poker run can fall under those rules. Clubs with federal tax-exempt status can offer donors a deduction. Clubs without it should say plainly that the entry fee is not tax-deductible.',
        ],
      },
      {
        heading: 'Signs of a well-run event',
        list: [
          'A named beneficiary and a public announcement of the amount raised.',
          'Waivers, insurance, and a safety briefing.',
          'Stops spaced for safe riding, with the last stop reachable before dark.',
          'Volunteers who know the route and the scoring rules.',
          'No pressure to drink at the stops. Many clubs now favor coffee shops and dealerships over bars for daytime stops.',
        ],
      },
    ],
  },
  {
    slug: 'best-motorcycle-roads-in-the-us',
    title: 'Great American Motorcycle Roads, Region by Region',
    shortTitle: 'Great Motorcycle Roads',
    description:
      'The roads clubs plan their seasons around, grouped by region, with what makes each one worth the trip and when to ride it.',
    updated: '2026-10-15',
    readingMinutes: 8,
    sections: [
      {
        paragraphs: [
          'Club calendars are built around roads. A chapter in Ohio plans a weekend around the Tail of the Dragon; a chapter in Arizona plans one around Jerome and Oak Creek Canyon. This list collects the roads that come up again and again in club ride schedules across the country. Each state page on this site adds the local favorites.',
        ],
      },
      {
        heading: 'Southeast',
        paragraphs: [
          'The Tail of the Dragon on US 129 at the North Carolina and Tennessee line packs 318 curves into eleven miles and is the most famous motorcycle road in the country. It is also crowded and heavily patrolled, so experienced clubs ride it early on a weekday and spend the rest of the weekend on the Cherohala Skyway, the Moonshiner 28, and the Foothills Parkway, which are nearly as good and far quieter. The Blue Ridge Parkway runs 469 miles from the Smokies to Shenandoah with no commercial traffic and a 45 mile-per-hour limit, and Skyline Drive continues another 105 miles north. In Georgia, GA 60 through Suches and the Richard B. Russell Scenic Highway are the local equivalent. The Natchez Trace Parkway, 444 miles from Natchez to Nashville, is the gentlest long ride in the South.',
        ],
      },
      {
        heading: 'Northeast',
        paragraphs: [
          'The Kancamagus Highway through New Hampshire\'s White Mountains, Vermont\'s Route 100 and the gap roads that cross it, the Mohawk Trail in Massachusetts, and Route 97 along the Delaware River in New York are the classic New England and Mid-Atlantic rides. The Catskills and Adirondacks add hundreds of miles of two-lane. Pennsylvania\'s Route 6 and the Laurel Highlands, West Virginia\'s US 33 and Highland Scenic Highway, and Virginia\'s Back of the Dragon on VA 16 are the choices south of New York. Foliage season, late September into October, is the time to go.',
        ],
      },
      {
        heading: 'Midwest',
        paragraphs: [
          'The Midwest hides its curves in river valleys and glacial leftovers. The Driftless Area where Wisconsin, Minnesota, Iowa, and Illinois meet has the best of them, along with the Great River Road on both banks of the Mississippi. Ohio\'s Hocking Hills and Triple Nickel, Indiana\'s Brown County, Michigan\'s Tunnel of Trees and the Keweenaw, Missouri\'s Ozark highways, and Arkansas\'s Pig Trail and Push Mountain Road are the destinations. Kansas\'s Flint Hills Scenic Byway and Nebraska\'s Sandhills Journey on NE 2 are long, empty, and better than their reputations.',
        ],
      },
      {
        heading: 'Mountain West',
        paragraphs: [
          'The Beartooth Highway on US 212 between Montana and Wyoming is the road most riders name first, climbing to nearly 11,000 feet past glacial lakes, and it pairs with the Chief Joseph Scenic Byway and the Yellowstone loops. Going-to-the-Sun Road in Glacier, Colorado\'s Million Dollar Highway, Independence Pass, and Trail Ridge Road, Utah\'s UT 12 and UT 128, Idaho\'s Lolo Pass on US 12, and the Black Hills roads around Sturgis complete the list. All are seasonal. Most open in late May or June and close with the first heavy snow.',
        ],
      },
      {
        heading: 'Southwest',
        paragraphs: [
          'Arizona\'s 89A from Prescott through Jerome and Oak Creek Canyon, the Coronado Trail on US 191, and Mount Lemmon above Tucson ride year-round at one elevation or another. New Mexico\'s Enchanted Circle and Turquoise Trail, Nevada\'s US 50 and the Red Rock loop, and the Texas Hill Country\'s Twisted Sisters on Ranch Roads 335, 336, and 337 are the other staples. Big Bend\'s River Road on FM 170 is remote enough to require fuel planning.',
        ],
      },
      {
        heading: 'West Coast and Pacific Northwest',
        paragraphs: [
          'The Pacific Coast Highway through Big Sur is the signature California ride, with the Angeles Crest Highway, the Ortega Highway, and the Sierra passes on CA 4, 108, and 120 close behind. Oregon\'s Historic Columbia River Highway, McKenzie Pass, and the coast on US 101, and Washington\'s North Cascades Highway, Chuckanut Drive, and the Mount Rainier passes carry the list north. Coastal roads ride year-round with fog; the passes open in summer.',
        ],
      },
      {
        heading: 'Alaska and Hawaii',
        paragraphs: [
          'Alaska\'s Seward Highway along Turnagain Arm and the long runs on the Glenn and Parks Highways are paved and spectacular in a four-month season. Hawaii\'s Road to Hana on Maui and the Saddle Road and volcano roads on the Big Island are the island rides worth renting a bike for.',
        ],
      },
      {
        heading: 'Riding them with a club',
        paragraphs: [
          'Clubs ride these roads in smaller groups than they use on the highway, often four to six bikes, with the pace set for the least experienced rider and the fast riders released to run ahead. Famous roads attract enforcement and crowds. Weekday mornings, shoulder seasons, and a willingness to ride the lesser-known road next door are what separate a good club weekend from a frustrating one.',
        ],
      },
    ],
  },
  {
    slug: 'motorcycle-club-glossary',
    title: 'Motorcycle Club Glossary: Terms You Will Hear',
    shortTitle: 'Club Glossary',
    description:
      'Plain definitions of the words used in and around motorcycle clubs, from cut and colors to church, run, sweep, nomad, and COC.',
    updated: '2026-10-15',
    readingMinutes: 6,
    sections: [
      {
        paragraphs: [
          'Club culture has its own vocabulary, and using it wrong marks you as an outsider faster than anything you wear. These are the terms that come up in meetings, at events, and in the listings on this site.',
        ],
      },
      {
        heading: 'People and membership',
        list: [
          'Member, full patch, or patch holder: a rider who has completed prospecting and been voted in, entitled to wear the full colors.',
          'Prospect, probate, or probationary: a rider in the probationary period before the vote.',
          'Hang-around: a rider invited to attend open events before prospecting.',
          'Sponsor: the full member who vouches for a prospect and guides them through the process.',
          'Support or supporter: a non-member who backs a club, often wearing a support patch or shirt.',
          'Associate or auxiliary member: a non-riding or partial member, common in riding clubs, veteran clubs, and brand chapters.',
          'Nomad: a member not attached to a specific chapter, usually by seniority or role.',
          'Independent: a rider who belongs to no club. Not an insult.',
          'Citizen: a non-rider, in the usage of some traditional clubs.',
        ],
      },
      {
        heading: 'Officers',
        list: [
          'President, vice president, secretary, treasurer: the executive officers of a chapter.',
          'Sergeant at arms: keeps order and holds club property.',
          'Road captain: plans and leads rides.',
          'Enforcer: enforces club rules, in clubs that use the position.',
          'Tail gunner or sweep: rides last in the pack.',
          'Chaplain: leads prayers and handles funerals and crises, common in veteran and ministry clubs.',
        ],
      },
      {
        heading: 'Insignia',
        list: [
          'Cut, colors, or vest: the sleeveless vest or jacket that carries the patches.',
          'Patch: any sewn insignia; "the patch" means the club\'s main emblem.',
          'Rocker: a curved patch above or below the center patch carrying the club name or territory.',
          'Three-piece patch: top rocker, center patch, bottom rocker. One-piece and two-piece patches are the alternatives.',
          'MC cube: the small square patch reading MC that identifies a traditional club.',
          'Side rocker or tab: a small patch denoting office, chapter, years, or honors.',
          'Memorial patch: worn for a deceased member.',
          'Support patch: worn by non-members in support of a club.',
          '1% or 1%er: the diamond patch worn by clubs that identify as outlaw clubs, meaning outside the American Motorcyclist Association.',
          'Property patch: a patch some traditional clubs issue to partners of members. Many clubs do not use it.',
        ],
      },
      {
        heading: 'Organizations',
        list: [
          'MC: motorcycle club, a traditional club with prospecting and earned colors.',
          'RC: riding club, open-membership and oriented toward rides rather than brotherhood structure.',
          'MM: motorcycle ministry, a faith-based club.',
          'LEMC: law enforcement motorcycle club.',
          'Mother chapter: the founding or governing chapter of a multi-chapter club.',
          'National: the governing body of a multi-chapter club.',
          'COC or confederation of clubs: a regional council where clubs coordinate and settle protocol.',
          'AMA: the American Motorcyclist Association, which charters clubs and sanctions events.',
          'ABATE: a state-level motorcyclists\' rights organization; the letters stand for different phrases in different states.',
          'H.O.G.: the Harley Owners Group, the manufacturer-sponsored brand club.',
        ],
      },
      {
        heading: 'Activities',
        list: [
          'Church: the regular members\' meeting of a traditional MC.',
          'Run: an organized ride, especially a multi-day one. A mandatory run is one all members must attend.',
          'Poker run: a charity ride scored by playing cards drawn at stops.',
          'Pack: the group riding in formation.',
          'Staggered: the standard pack formation, alternating left and right thirds of the lane.',
          'Blessing of the bikes: a season-opening event, usually in spring, often at a church.',
          'Toy run: a holiday charity ride collecting toys for children.',
          'Bike night: a weekly public gathering at a bar, restaurant, or dealership.',
          'Rally: a large multi-day event drawing riders from many clubs.',
          'Flag line: a row of riders holding flags at a funeral or ceremony.',
        ],
      },
      {
        heading: 'Standing',
        list: [
          'Good standing: a current member in compliance with the bylaws, or a former member who left properly.',
          'Bad standing: a member expelled or who left owing money or in a dispute.',
          'Out: no longer a member. "Out in good standing" and "out bad" are the two common forms.',
          'Pulled patch: colors taken back by the club as discipline or on expulsion.',
        ],
      },
    ],
  },
  {
    slug: 'how-to-verify-a-motorcycle-club',
    title: 'How to Verify a Club Is Legitimate and Active Before You Reach Out',
    shortTitle: 'Verifying a Club',
    description:
      'A short research routine for checking that a club still exists, is what it says it is, and is one you want to contact, using public records and a little observation.',
    updated: '2026-10-15',
    readingMinutes: 6,
    sections: [
      {
        paragraphs: [
          'Directories, this one included, carry listings for clubs that have merged, gone dormant, or changed character since the listing was created. Before you ride across the state to a meeting, spend thirty minutes confirming that the club is active and is what you expect. The routine below uses only public information.',
        ],
      },
      {
        heading: 'Check for recent activity',
        paragraphs: [
          'Open the club\'s website and social media pages. An active club has posted about a ride, an event, or a meeting in the current season. A page whose last post is two or three years old is a club that may no longer meet. Event listings on this site, on rally calendars, and on local shop pages are another sign of life. If the only trace of the club is its directory listing, treat it as unverified.',
        ],
      },
      {
        heading: 'Look it up in public registries',
        paragraphs: [
          'Most established clubs are registered as nonprofit corporations with their state, and the state\'s business entity search will show the registration date, whether it is current, and the registered agent. The American Motorcyclist Association publishes a charter search for its chartered clubs. Federal tax-exempt organizations appear in the Internal Revenue Service\'s exempt organization search, which also shows whether they file annual returns. None of this proves a club is good, but a club that has kept its paperwork current for years is a club that functions.',
        ],
      },
      {
        heading: 'Understand which kind of club it is',
        paragraphs: [
          'The category shown on each listing in this directory is a starting point, not a verdict. Read the club\'s own description of itself. Look at photos of members\' vests: a three-piece patch with a territory rocker and an MC cube tells you it is a traditional MC; a one-piece patch suggests a riding club; a support patch for another club tells you where it sits in the local order. Clubs that wear a 1% diamond are closed to the public and do not recruit through directories.',
        ],
      },
      {
        heading: 'Ask around',
        paragraphs: [
          'Independent motorcycle shops, dealership event coordinators, and the organizers of local charity rides know which clubs are active, which are welcoming, and which have a reputation. Ask open questions. "What can you tell me about this club?" gets a better answer than "Is this club any good?" Members of other clubs will also talk about neighboring clubs if you ask respectfully at a public event.',
        ],
      },
      {
        heading: 'Go see for yourself',
        paragraphs: [
          'Attend a public event the club hosts or supports before you contact them about membership. Watch how members treat guests, how they treat each other, how they handle alcohol, and how they handle their bikes. Notice whether the officers are visible and whether the event runs on time. This one visit will tell you more than the rest of the research combined.',
        ],
      },
      {
        heading: 'Signs to stop',
        list: [
          'No public footprint at all beyond a directory listing.',
          'A registry status of dissolved, revoked, or delinquent with no explanation.',
          'Members who will not say what the club does or what membership involves.',
          'Pressure to pay money before you have attended anything.',
          'Public posts that threaten other clubs or boast about confrontations.',
        ],
      },
      {
        heading: 'Help us keep the directory accurate',
        paragraphs: [
          'If you find that a listing on this site is out of date, use the contact page to tell us. Listings are compiled from public sources and club submissions, and corrections from riders and club officers are how it improves.',
        ],
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}

export function guideWordCount(guide: Guide): number {
  return guide.sections.reduce((n, s) => {
    const text = [...(s.paragraphs || []), ...(s.list || [])].join(' ');
    return n + text.split(/\s+/).filter(Boolean).length;
  }, 0);
}
