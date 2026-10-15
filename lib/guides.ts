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
