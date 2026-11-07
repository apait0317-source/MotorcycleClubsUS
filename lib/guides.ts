import { getMarketClubs, getMarketGuideGate } from './markets';
export interface GuideSection {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
}

export interface Guide {
  marketId?: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  published: string; // Original publication date, preserved on revision.
  updated: string; // ISO date
  readingMinutes: number;
  sources?: { title: string; url: string }[];
  sections: GuideSection[];
}

const standardGuides: Guide[] = [
  {
    slug: 'how-to-join-a-motorcycle-club',
    title: 'How to Join a Motorcycle Club: A Practical Guide for New Riders',
    shortTitle: 'How to Join a Club',
    description:
      'What to expect when you approach a motorcycle club, from the first ride to prospecting, dues, bylaws, and the questions to ask before you commit.',
    published: '2026-10-15',
    updated: '2026-11-01',
    readingMinutes: 6,
    sources: [
      { title: 'CVMA: Mission and membership categories', url: 'https://www.combatvet.us/' },
      { title: 'Harley-Davidson: H.O.G. membership benefits and requirements', url: 'https://www.harley-davidson.com/us/en/content/hog/membership-benefits.html' },
      { title: 'AMA: Start a Motorcycle Club and bylaw templates', url: 'https://americanmotorcyclist.com/organizers/charter-your-organization-getting-started/start-a-motorcycle-club/' },
    ],
    sections: [
      {
        paragraphs: [
          'Finding a club starts with deciding what kind of riding and commitment fits your life. A name or patch does not tell you whether a group welcomes guests, requires a particular motorcycle, or expects attendance every week. This guide offers questions to use while comparing clubs. Each organization sets its own rules, so confirm its current membership process directly before making a commitment.',
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
        heading: 'A club comparison worksheet',
        paragraphs: [
          'Copy these prompts once for each club on your shortlist. Record the answer, the official page or person who supplied it, and the date. Write "not confirmed" in empty fields instead of assuming that a missing rule means there is no rule. This is a personal comparison aid, not a membership application.',
        ],
        list: [
          'Identity and fit: What is the exact club and chapter name? Which location and riding activities match what you want?',
          'Eligibility and guests: What published membership requirements apply? Has the chapter confirmed whether a specific activity is open to you?',
          'Time: Which meetings, rides, travel, and volunteer duties are required? Can you meet them during a typical month and a busy month?',
          'Money: What dues, application charges, event costs, and travel expenses should you budget for? Which amounts are confirmed, and what remains to ask?',
          'Ride expectations: What route length, pace, fuel stops, and briefing practices does the group describe? How can a rider decline or leave a ride?',
          'Decision: What fits, what conflicts with your limits, and which unanswered question must be resolved before you commit?',
        ],
      },
      {
        heading: 'Know the kinds of clubs before you knock',
        paragraphs: [
          'A traditional MC may use sponsorship and a prospecting period, while a riding association or brand chapter may use an application and dues. The labels are not a complete set of rules. For example, the Combat Veterans Motorcycle Association distinguishes full, supporter, and auxiliary membership, and Harley-Davidson publishes its own H.O.G. membership requirements. Read the organization\'s rules and ask the local chapter which guest activities are open before assuming that one club works like another.',
        ],
      },
      {
        heading: 'Find clubs that are active near you',
        paragraphs: [
          'Use the state and city pages to build a shortlist, then check the club\'s own website, public calendar, and official social pages. Recent notices can help you find a current contact, but an old post or failed website does not prove that a club has closed. Look for matching addresses and chapter names, and ask for confirmation before traveling. Local motorcycle shops and publicly advertised rides can also help you find the right organization.',
        ],
      },
      {
        heading: 'Make first contact the right way',
        paragraphs: [
          'Follow the club\'s published contact or application process. If an event is open to guests, confirm the venue and guest requirements before visiting. Introduce yourself and ask how the group prefers people to get involved. Motorcycle ownership, brand, engine size, experience, and passenger participation rules can differ. A public event is an opportunity to learn about the organization, not proof that membership is available or that a guest should attend every activity.',
          'If a club has a public email or contact form, a short message works too. State who you are, where you ride, what draws you to the club, and ask whether they have open rides or meetings a guest can attend.',
        ],
      },
      {
        heading: 'A first-contact message you can adapt',
        paragraphs: [
          'Use the published contact channel and replace the brackets. Keep personal details brief. A directory listing or public email address is not an invitation to visit a clubhouse.',
          'Hello [club or chapter contact], my name is [name] and I ride in [area]. I am interested in [specific activity or purpose described on your website]. Could you point me to your current membership requirements and explain the appropriate first step? If you offer an activity open to prospective members or guests, could you confirm who may attend, any registration or bike requirements, and the location and time? Thank you.',
          'Wait for a clear answer about the particular activity. If the response gives only a general calendar link, ask which event, if any, is appropriate for a first visit. Do not treat silence as permission.',
        ],
      },
      {
        heading: 'Prepare for an invited guest ride',
        paragraphs: [
          'Once the organizer confirms an invitation, ask about the briefing, route, experience level, and required riding gear. Check what you already own for fit and condition before deciding whether anything needs replacing. Buying equipment does not establish membership eligibility or replace training. If you compare helmet or glove options, check the actual item and its manufacturer information rather than relying on a shopping-result label.',
        ],
      },
      {
        heading: 'Hang-around, prospect, patch',
        paragraphs: [
          'Some traditional MCs use a staged process with guest participation, sponsorship, prospecting, and a membership vote. The stages, duration, responsibilities, and decision rules belong to that club. Ask which activities are open to applicants and which obligations apply before accepting a role. Other organizations use different application and eligibility systems; an owners group or rider association should not be assumed to admit everyone who pays dues.',
          'Compare the applicant requirements with the expectations for full members. Ask about attendance, travel, volunteering, and what happens if work, health, or family commitments interrupt participation. A demanding application process is a reason to ask further questions, not a reliable measure of every later obligation.',
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
          'Decline any request to break the law, hand over sensitive financial information, or pay unexplained fees. Ask how dues are used and whether the club can explain its membership and exit rules. Pressure to decide immediately or hostility toward reasonable questions is a reason to step back. A directory listing does not establish that a club is safe, active, or suitable for a particular rider.',
        ],
      },
      {
        heading: 'What it costs',
        paragraphs: [
          'Ask for the current dues, application fees, required gear, event costs, and travel expectations in writing. National membership and local chapter dues may be separate. Add fuel, lodging, and the time needed for meetings and rides to the comparison. There is no single reliable cost or attendance requirement for every MC or riding club. Check the full commitment before accepting sponsorship or paying a fee.',
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
    published: '2026-10-15',
    updated: '2026-11-01',
    readingMinutes: 4,
    sources: [
      { title: 'CVMA: Mission and membership categories', url: 'https://www.combatvet.us/' },
      { title: 'Harley-Davidson: H.O.G. membership benefits and requirements', url: 'https://www.harley-davidson.com/us/en/content/hog/membership-benefits.html' },
      { title: 'AMA: Charter types and event insurance access', url: 'https://americanmotorcyclist.com/organizers/charter-your-organization-getting-started/which-charter-is-right-for-me/' },
      { title: 'Women On Wheels: About the organization and its members', url: 'https://womenonwheels.org/about/' },
    ],
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
          'Brand owners groups connect riders around a manufacturer or type of motorcycle. Harley Owners Group is Harley-Davidson\'s official riding club; its published membership terms distinguish motorcycle owners from passenger arrangements. Other organizations have their own eligibility rules and may welcome several makes. Check national requirements and local chapter requirements separately instead of assuming that every owners group requires the same bike or offers the same benefits.',
        ],
      },
      {
        heading: 'Veteran and military clubs',
        paragraphs: [
          'Veteran organizations differ in mission and eligibility. CVMA identifies full members with verified combat service, supporters with non-combat military service, and auxiliary members who are spouses of full or supporter members. It calls itself an association rather than an MC. American Legion Riders is a separate program with its own membership rules. Some organizations focus on a branch of service or a specific cause; confirm which category applies rather than treating all veteran clubs as interchangeable.',
        ],
      },
      {
        heading: 'Women\'s clubs',
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
          'Off-road clubs may organize trail rides, competition, riding-area maintenance, and work with land managers. An AMA charter can be relevant to these activities, but the charter type matters. AMA distinguishes event-sanctioning charters from social and other non-sanctioning charters. Eligible sanctioning organizers can obtain event insurance through the available program; a charter by itself does not establish that a particular ride is insured.',
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
          'Some clubs use a 1% diamond as part of an outlaw-club identity. A patch, a search result, or inclusion in this directory is not enough to establish an organization\'s conduct, legal status, membership rules, or relationship with other clubs. Do not infer criminality or an invitation to visit from clothing. Use the club\'s own public information and respect whether an event is private or open to guests.',
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
    published: '2026-10-15',
    updated: '2026-11-01',
    readingMinutes: 4,
    sources: [
      { title: 'Motorcycle Safety Foundation: Guide to Group Riding', url: 'https://msf-usa.org/documents/library/group-riding/' },
    ],
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
          'Use an advertised public event or an invitation as the starting point for a visit. Confirm the venue, guest rules, parking, and schedule with the organizer. Introduce yourself, follow directions about private areas, and ask before taking photographs. Do not assume that every event is a fundraiser or that buying a drink is expected. Participation and donations should remain voluntary.',
          'Ask before taking photos, and never photograph members without permission. Do not wander into back rooms or sit at a table that appears reserved. Do not discuss other clubs, politics between clubs, or anything you have read online about the club you are visiting. Leave when the public portion ends unless a member asks you to stay.',
        ],
      },
      {
        heading: 'Riding in a group',
        paragraphs: [
          'Agree on the route, stops, lead and sweep riders, regrouping plan, and signals before departure. The Motorcycle Safety Foundation recommends a manageable group, ideally five to seven riders, and smaller subgroups when needed. Ride within your ability and leave enough room for braking and maneuvering. Membership or a patch does not give anyone authority to override traffic rules.',
          'Use the signals explained at the briefing rather than assuming that every club uses the same informal gestures. MSF recommends staggered spacing where appropriate and single file when road conditions need more maneuvering room. Do not pass another rider within the lane. If separated, follow the agreed regrouping procedure instead of speeding or running a signal to catch up.',
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
    published: '2026-10-15',
    updated: '2026-11-01',
    readingMinutes: 3,
    sources: [
      { title: 'AMA: Start a Motorcycle Club and bylaw templates', url: 'https://americanmotorcyclist.com/organizers/charter-your-organization-getting-started/start-a-motorcycle-club/' },
      { title: 'IRS: Tax-exempt social clubs', url: 'https://www.irs.gov/charities-non-profits/other-non-profits/social-clubs' },
      { title: 'IRS: Charitable contributions and benefits received', url: 'https://www.irs.gov/taxtopics/tc506' },
    ],
    sections: [
      {
        paragraphs: [
          'From the outside a motorcycle club looks like a group of friends who ride together. From the inside it runs more like a small nonprofit with a uniform. Understanding that structure helps you judge a club before you join it, and it explains why clubs behave the way they do toward prospects, visitors, and each other.',
        ],
      },
      {
        heading: 'The officer slate',
        paragraphs: [
          'Officer titles and authority come from the organization\'s bylaws. Common roles include a president, secretary, treasurer, and a ride leader or road captain, but a small riding group may use a simpler structure. Ask who handles membership, money, safety planning, and complaints rather than inferring authority from a title. The AMA publishes constitution and bylaws templates that show how a club can document its own responsibilities.',
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
          'Ask how often the club meets, whether attendance is required, and how members can give notice when unavailable. A meeting may include financial reports, ride planning, membership matters, and votes, but the actual order and access rules belong in that club\'s procedures. Some groups use the informal term church for a meeting. Neither the term nor the type of patch establishes a universal schedule or attendance penalty.',
        ],
      },
      {
        heading: 'Voting and bylaws',
        paragraphs: [
          'Bylaws describe how a club makes decisions, including membership, dues, officer terms, voting, discipline, and dissolution. There is no universal voting threshold or prospecting period for every motorcycle organization. Ask which decisions require a member vote, how a quorum is counted, and what information an applicant may review. A written process helps people understand their obligations before a disagreement arises.',
        ],
      },
      {
        heading: 'Where the money goes',
        paragraphs: [
          'Ask what dues fund and how spending is approved. Possible costs include insurance, event expenses, a meeting venue, communications, and charitable activity. A transparent budget, retained receipts, and regular financial reporting help members understand those choices. State nonprofit incorporation and federal tax exemption are separate matters. A social club may qualify under section 501(c)(7), which does not by itself make payments to the club deductible charitable gifts.',
        ],
      },
      {
        heading: 'Discipline and leaving',
        paragraphs: [
          'Read the written rules for complaints, discipline, resignation, dues, and returning club property before joining. Ask who makes decisions, whether a member can respond to a complaint, and which obligations continue after resignation. These arrangements vary by organization. A friendly introduction is useful, but it does not substitute for understanding a commitment or make coercive conduct acceptable.',
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
    published: '2026-10-15',
    updated: '2026-11-01',
    readingMinutes: 3,
    sources: [
      { title: 'AMA: Start a Motorcycle Club and bylaw templates', url: 'https://americanmotorcyclist.com/organizers/charter-your-organization-getting-started/start-a-motorcycle-club/' },
      { title: 'Harley-Davidson: H.O.G. membership benefits and requirements', url: 'https://www.harley-davidson.com/us/en/content/hog/membership-benefits.html' },
      { title: 'CVMA: Mission and membership categories', url: 'https://www.combatvet.us/' },
    ],
    sections: [
      {
        paragraphs: [
          'The labels MC and riding club can suggest different traditions, but they do not establish a fixed price, time commitment, or membership process. Compare the actual organizations you are considering. Written rules, a current calendar, and clear answers from the local group are more useful than assuming that every club in a category behaves alike.',
        ],
      },
      {
        heading: 'Commitment',
        paragraphs: [
          'A club may require attendance at meetings, rides, or events, while another group may organize activities with voluntary participation. The MC or RC label does not establish those requirements or the consequences of an absence. Ask the local organization for its current calendar, attendance rules, applicant responsibilities, and procedure for taking time away. National membership and local chapter participation can involve different commitments.',
        ],
      },
      {
        heading: 'Getting in',
        paragraphs: [
          'An MC may use sponsorship and prospecting; another organization may use an application and eligibility review. Ownership or payment does not guarantee admission. Harley-Davidson publishes motorcycle-owner and passenger arrangements for H.O.G., while CVMA distinguishes combat-service, non-combat-service, and spouse membership categories. Check the specific category and local chapter rules rather than assuming that every owners group or rider association follows one process.',
        ],
      },
      {
        heading: 'The patch',
        paragraphs: [
          'Ask whether the organization uses insignia, who owns or licenses it, when an applicant may wear it, and what must be returned on resignation. Patch layouts and traditions vary. CVMA explicitly describes itself as an association with a one-piece back patch and no territorial claim. Appearance alone does not establish an organization\'s membership process, conduct, or property rules.',
        ],
      },
      {
        heading: 'Club politics',
        paragraphs: [
          'Some groups cooperate with regional councils, associations, event organizers, or other clubs. Ask whether that involvement creates attendance, volunteering, or conduct requirements for members. Do not infer a territorial arrangement or an obligation to another club from a name or patch. Use the specific organization\'s published rules and public contact for clarification.',
        ],
      },
      {
        heading: 'Cost',
        paragraphs: [
          'Compare the actual national and local dues, required purchases, event fees, and travel expectations. A club with a meeting venue may have different costs from a group that meets only for rides, but neither label guarantees a higher or lower total. Ask what the fees cover and whether they can change during the membership year.',
        ],
      },
      {
        heading: 'Family',
        paragraphs: [
          'Confirm whether partners, passengers, and children can join particular rides, meetings, or social events, and whether a separate membership category applies. H.O.G. and CVMA publish different arrangements for passengers or spouses. A family-oriented description is not an invitation to every activity. Ask about each event and compare the travel and time commitments with family responsibilities.',
        ],
      },
      {
        heading: 'Leaving',
        paragraphs: [
          'Read the actual resignation, renewal, outstanding-dues, and club-property rules before joining. Nonrenewal may not settle every obligation, and neither the MC nor RC label establishes a single exit process. Ask how to give notice, end any recurring payment, return borrowed property, and confirm that the organization has recorded the resignation. Keep a copy of the relevant terms.',
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
    published: '2026-10-15',
    updated: '2026-11-01',
    readingMinutes: 3,
    sources: [
      { title: 'AMA: Start a Motorcycle Club and bylaw templates', url: 'https://americanmotorcyclist.com/organizers/charter-your-organization-getting-started/start-a-motorcycle-club/' },
      { title: 'CVMA: Mission and membership categories', url: 'https://www.combatvet.us/' },
    ],
    sections: [
      {
        paragraphs: [
          'Prospecting is the probationary period between being a friend of a motorcycle club and being a member of it. It exists so the club can learn whether you are reliable, honest, and compatible, and so you can learn whether the club is what you want. Every club runs it differently, but the stages and the expectations are consistent enough to describe.',
        ],
      },
      {
        heading: 'Stage one: hang-around',
        paragraphs: [
          'Some clubs use hang-around for a guest who is getting to know the members before applying. Ask which invitations, activities, conduct rules, and insignia restrictions apply. There is no universal duration or list of duties for this stage. Use the visits to assess how the organization treats guests and explains its expectations, rather than assuming that attendance commits either side to membership.',
        ],
      },
      {
        heading: 'Stage two: sponsorship',
        paragraphs: [
          'Some traditional clubs require an existing member to sponsor an applicant. Ask the specific club whether sponsorship applies, what the sponsor is responsible for, and whom an applicant can approach with concerns. Do not assume a sponsor can guarantee admission, shorten a fixed waiting period, or override the membership rules.',
        ],
      },
      {
        heading: 'Stage three: prospect',
        paragraphs: [
          'A club that uses prospecting should explain the expected events, responsibilities, insignia, voting rules, and any parts of meetings reserved for full members. Ask for those expectations before accepting. Helping with lawful event setup is different from accepting an unsafe or coercive demand. The club\'s own rules should establish the scope of the commitment.',
          'The length of a prospecting period varies. Some clubs specify a minimum period or attendance requirements; others do not use prospecting at all. Obtain the local requirements and ask what happens if work, family, health, or riding conditions interrupt participation. This guide does not establish a standard number of months for membership.',
        ],
      },
      {
        heading: 'Restrictions to ask about before accepting',
        list: [
          'Which insignia may an applicant wear, and who owns it?',
          'Who may speak for the organization or represent it at another club\'s event?',
          'Which events are open to guests, and is an invitation or registration required?',
          'Which information is confidential, and where can an applicant raise a concern?',
          'What ride-briefing and formation rules apply to applicants and guests?',
        ],
      },
      {
        heading: 'The vote',
        paragraphs: [
          'If membership is decided by a vote, ask who votes, what threshold applies, how an applicant is informed, and whether an unsuccessful applicant can reapply. Do not assume a unanimous vote or a particular ceremony is required by every club. Clear procedures help both the applicant and the members understand the decision.',
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
          'Decline demands to commit a crime, surrender a vehicle title, share bank credentials, or abandon outside support. Leave a situation that feels coercive or unsafe and seek appropriate help if threatened. A club name, patch, charitable claim, or directory listing does not establish that an organization deserves trust.',
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
    published: '2026-10-15',
    updated: '2026-11-01',
    readingMinutes: 3,
    sources: [
      { title: 'AMA: Start a Motorcycle Club and bylaw templates', url: 'https://americanmotorcyclist.com/organizers/charter-your-organization-getting-started/start-a-motorcycle-club/' },
      { title: 'AMA: Charter types and event insurance access', url: 'https://americanmotorcyclist.com/organizers/charter-your-organization-getting-started/which-charter-is-right-for-me/' },
      { title: 'IRS: Tax Exempt Organization Search', url: 'https://www.irs.gov/charities-non-profits/tax-exempt-organization-search' },
      { title: 'IRS: Charitable contributions and benefits received', url: 'https://www.irs.gov/taxtopics/tc506' },
    ],
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
          'Consider the appropriate legal structure with a qualified adviser and the relevant state agency. The AMA recommends considering both the benefits and disadvantages of incorporation; it is not a universal guarantee against personal liability. State nonprofit status, federal tax exemption, banking requirements, and charitable fundraising rules are separate questions. Do not promise donors a deduction simply because the group is incorporated or tax-exempt. Check the receiving organization\'s eligibility and the nature of the payment.',
        ],
      },
      {
        heading: 'Insurance',
        paragraphs: [
          'Discuss planned rides and events with an insurer before advertising them. The activities, participants, venues, exclusions, and required certificates matter. AMA-chartered sanctioning organizers have access to event liability insurance options, while non-sanctioning charters have different limits. A charter, waiver, or nonprofit registration does not mean that every activity is covered. Obtain and read the actual policy and any venue requirements.',
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
    published: '2026-10-15',
    updated: '2026-11-01',
    readingMinutes: 3,
    sources: [
      { title: 'Daytona Bike Week: Official calendar', url: 'https://officialbikeweek.com/' },
      { title: 'Laconia Motorcycle Week: Official schedule', url: 'https://laconiamcweek.com/' },
      { title: 'Sturgis Motorcycle Rally: Official rally information and rides', url: 'https://sturgismotorcyclerally.com/' },
      { title: 'Lone Star Rally: Official dates and event information', url: 'https://lonestarrally.com/' },
    ],
    sections: [
      {
        paragraphs: [
          'Rallies can help riders meet organizations, explore unfamiliar roads, and attend public events. This seasonal overview is a starting point for planning rather than a current event calendar. Dates, venues, admission rules, and individual activities can change. Use the linked organizers\' schedules and confirm accommodation and cancellation terms before booking.',
        ],
      },
      {
        heading: 'March: Daytona Bike Week, Florida',
        paragraphs: [
          'Daytona Bike Week publishes an official event calendar and travel information for visitors to the Daytona Beach area. The calendar can help distinguish the main festival from independently organized rides and activities. Confirm the edition, venue, tickets, and admission conditions for each event rather than treating the festival name as one itinerary. Plan rest days and local riding around the conditions and distances involved.',
        ],
      },
      {
        heading: 'Spring: benefit rides and Memorial Day events',
        paragraphs: [
          'Spring benefit rides and Memorial Day events can be opportunities to meet local organizations at public activities. Look for the host\'s current announcement, beneficiary, registration arrangements, and guest requirements. A previous event or a familiar holiday does not establish that a particular ride will run again. Confirm any route, escort, or ceremony instructions with the actual organizer.',
        ],
      },
      {
        heading: 'June: Laconia and regional touring events',
        paragraphs: [
          'Laconia Motorcycle Week is based in New Hampshire and publishes its event schedule and rally history on its official site. Its location gives visitors access to the Lakes Region and White Mountains. Other touring rallies and regional gatherings have separate organizers and calendars. Confirm the current edition of any event rather than assuming that a previous year\'s dates or venue will be repeated.',
        ],
      },
      {
        heading: 'August: Sturgis',
        paragraphs: [
          'Sturgis takes place in South Dakota and combines scheduled events with riding around the Black Hills. The organizer publishes mapped rides and links to an event schedule. Distances between venues, traffic, weather, and accommodation can affect a trip as much as the rally itself. Choose a route and daily mileage that fit the riders involved, and confirm the current schedule instead of relying on a fixed annual date.',
        ],
      },
      {
        heading: 'Autumn: confirm seasonal schedules',
        paragraphs: [
          'Autumn events have their own schedules and weather risks. Check the organizer\'s current site for dates, venue changes, cancellation terms, and public access. Daylight can be limited on the ride home, and a warm destination does not mean the mountain or overnight portions of the route will be comfortable. Build a plan that allows a rider to leave early or change routes safely.',
        ],
      },
      {
        heading: 'November: Lone Star Rally',
        paragraphs: [
          'The Lone Star Rally is held in Galveston, Texas. Its official site publishes the current dates, entertainment, maps, accommodation information, and event schedule. Check which activities need a ticket or pass and which streets or parking areas are affected. An autumn date does not guarantee comfortable riding weather, so plan for the conditions along the whole route.',
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
    published: '2026-10-15',
    updated: '2026-11-01',
    readingMinutes: 5,
    sources: [
      { title: 'Motorcycle Safety Foundation: Guide to Group Riding', url: 'https://msf-usa.org/documents/library/group-riding/' },
    ],
    sections: [
      {
        paragraphs: [
          'A group ride needs a shared plan and enough space for each rider to make independent decisions. This guide draws on the Motorcycle Safety Foundation\'s group-riding guidance and highlights questions to resolve before departure. It supplements rider training and the traffic rules for the roads being used. It does not establish that a listed club has safe practices or that a formation is suitable in every situation.',
        ],
      },
      {
        heading: 'The pre-ride briefing',
        paragraphs: [
          'Before leaving, agree on the route, fuel and rest stops, hand signals, lead and sweep riders, and what to do if someone becomes separated. Tell the leader about experience levels and any concerns about the planned ride. Arrive with a prepared motorcycle and enough fuel. MSF recommends that lead and sweep riders be experienced and familiar with group-riding procedures.',
        ],
      },
      {
        heading: 'A reusable pre-ride briefing template',
        paragraphs: [
          'Fill this in before departure and review it with every subgroup. These prompts turn the MSF guidance below into a discussion; they are not a substitute for rider training or a guarantee that a ride is safe. Leave time for riders to raise concerns and change or decline the plan.',
        ],
        list: [
          'Ride and route: Date, destination, route version, expected conditions, and an alternative if weather or road access changes: ____.',
          'People: Lead and sweep for each manageable subgroup, rider experience concerns, and how subgroup assignments will be explained: ____.',
          'Stops: First fuel stop, later fuel and rest stops suited to the shortest range, and places large enough to stop safely: ____.',
          'Spacing and pace: When conditions allow staggered formation, when to use single file, and how to keep safe gaps without pressure to catch up: ____.',
          'Signals: Demonstrate the agreed hand signals and explain how a rider can request a stop or leave the ride: ____.',
          'Separation: Safe regrouping locations, route information each rider carries, and the contact plan if a rider gets lost: ____. Nobody should run a light or speed to catch up.',
          'Problems: Who carries a phone, first-aid supplies, and tools? How will the group share an emergency location and reach emergency services without creating another traffic hazard? ____.',
          'Final check: Does every rider understand the next stop, have enough fuel, and feel able to ride the planned route at a safe pace? Changes to make before departure: ____.',
        ],
      },
      {
        heading: 'Communication and a backup plan',
        paragraphs: [
          'An intercom can support a group that chooses to use one, but the ride plan must still work for riders without a headset and when a connection fails. Review hand signals, the route, and regrouping points together. If comparing intercoms, check compatibility with the helmets and systems already used in your group, then learn the controls before departure. A voice instruction does not make a maneuver safe or override a rider\'s own judgment.',
        ],
      },
      {
        heading: 'Roles',
        paragraphs: [
          'The lead rider helps the group follow the route, while the sweep rides at the rear and helps notice problems. Agree on how a rider can leave the ride or ask for help. Carry a phone and arrange for a first-aid kit and tools in each subgroup. These roles do not give riders authority to block traffic or direct other road users.',
        ],
      },
      {
        heading: 'Formation and spacing',
        paragraphs: [
          'MSF recommends staggered formation where conditions allow: alternate between the left and right thirds of the lane, keeping at least one second to the offset rider ahead. That arrangement leaves at least two seconds to the motorcycle directly ahead in the same track. Use single file with a minimum two-second following distance on curves, poor surfaces, in poor visibility, when entering or leaving highways, and whenever more maneuvering room is needed. Increase the space when conditions require it, and avoid side-by-side formation.',
        ],
      },
      {
        heading: 'Pace',
        paragraphs: [
          'MSF recommends a manageable group, ideally five to seven riders, with separate lead and sweep riders for additional subgroups. Monitor following riders in the mirrors and use a pace that avoids pressuring anyone to exceed their ability. If someone falls behind, follow the agreed plan. Do not treat staying with the group as more important than a safe speed, an adequate gap, or the traffic rules.',
        ],
      },
      {
        heading: 'Intersections, lights, and highways',
        paragraphs: [
          'Each rider must respond to signals, signs, and the traffic around them. Do not run a red light, stop in an unsafe place, or exceed your ability to keep the group together. Agree before departure on safe regrouping points and use them when separated. MSF recommends single file when entering or leaving a highway. Do not assume that a civilian ride leader can close an intersection to other traffic.',
        ],
      },
      {
        heading: 'Passing',
        paragraphs: [
          'Each rider must make an independent decision about whether a pass or lane change is safe and lawful. A leader\'s signal does not establish that the road is clear for everyone behind. Do not pass another rider within the same lane or rely on a sweep rider to reserve a traffic lane. Discuss the regrouping plan beforehand so nobody feels pressured to follow a maneuver they cannot safely complete.',
        ],
      },
      {
        heading: 'Stops',
        paragraphs: [
          'Plan fuel and rest stops around the motorcycles and riders in the group rather than a universal mileage or time interval. Choose places where the whole group can stop safely, and agree on the next destination before leaving. If fatigue, weather, or a mechanical problem changes the plan, allow time to adjust it instead of rushing to keep a schedule.',
        ],
      },
      {
        heading: 'When something goes wrong',
        paragraphs: [
          'Move out of immediate danger if it is safe to do so and call emergency services for a medical emergency. Give a clear location and follow dispatcher instructions. Do not create another hazard by stopping in a traffic lane or attempting to control traffic without authority. MSF recommends a phone, first-aid supplies, and tools within the group. Riders should use only the assistance and training they can safely provide.',
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
    published: '2026-10-15',
    updated: '2026-11-01',
    readingMinutes: 3,
    sources: [
      { title: 'CVMA: Mission and membership categories', url: 'https://www.combatvet.us/' },
      { title: 'American Legion Riders: Official program information', url: 'https://www.legion.org/get-involved/community-programs/american-legion-riders' },
    ],
    sections: [
      {
        paragraphs: [
          'Veteran motorcycle organizations offer different combinations of riding, service, advocacy, and community. Some restrict a membership category to documented military or combat service; others have supporter or family categories. This guide introduces examples, not a guarantee of eligibility or a recommendation of every chapter. Use the organization\'s current rules and local contact to confirm a fit.',
        ],
      },
      {
        heading: 'Combat Veterans Motorcycle Association',
        paragraphs: [
          'CVMA describes itself as an association of veterans who ride motorcycles and support veterans, care facilities, and related organizations. Its national site identifies full membership for verified combat veterans, supporter membership for veterans with non-combat service, and auxiliary membership for spouses of full and supporter members. CVMA explicitly states that its back patch is one piece, that it does not claim territory, and that it is not an MC. Read its current application requirements before contacting a chapter.',
        ],
      },
      {
        heading: 'American Legion Riders and VFW Riders',
        paragraphs: [
          'American Legion Riders and VFW Riders are distinct programs associated with their respective veteran organizations. Their membership and local participation requirements should be checked separately. The Legacy Run is an American Legion Riders event; it should not be attributed to VFW Riders. A local post can explain eligibility, guest participation, motorcycle requirements, and the activities of its rider program.',
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
          'Use the state pages in this directory and filter by eye for veteran clubs, which are labeled by category. Check the national organization\'s chapter locator to confirm the chapter is current. Veterans service offices, VFW and Legion posts, and base morale and recreation offices usually know which chapters are active.',
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
      'National women\'s riding organizations, women-only MCs, mixed clubs with strong women\'s membership, and how to find the right fit as a woman who rides.',
    published: '2026-10-15',
    updated: '2026-11-01',
    readingMinutes: 3,
    sources: [
      { title: 'Motor Maids: History and membership principle', url: 'https://www.motormaidsinc.org/about/' },
      { title: 'Women On Wheels: About the organization and its members', url: 'https://womenonwheels.org/about/' },
    ],
    sections: [
      {
        paragraphs: [
          'Women have ridden in organized clubs since the 1940s. The choices range from national organizations founded decades ago to small local riding groups and women-only MCs with full prospecting. This guide lays out the options and what each expects.',
        ],
      },
      {
        heading: 'National organizations',
        paragraphs: [
          'Motor Maids traces its founding to 1940 and its AMA charter to 1941. Its published membership principle covers women who legally own and operate their own motorcycle or one belonging to a family member. Women On Wheels, founded in 1982, welcomes riders and passengers across experience levels and motorcycle or scooter types, and offers support membership for families. These are distinct organizations with their own current rules; use the official membership information rather than assuming all women\'s groups share one model.',
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
          'Ask whether a particular ride is open to guests and whether riders or passengers need to register beforehand. Confirm the route, distance, pace, stops, equipment expectations, and who to contact if plans change. A guest ride should be a chance to assess the group, not a reason to accept an unexplained commitment. Follow the briefing and ride within your own ability regardless of the group\'s name or membership model.',
        ],
      },
      {
        heading: 'Why women-led clubs matter',
        paragraphs: [
          'A women-led group can offer a setting to ask questions, compare equipment, and find riding companions or mentors. The useful test is what a specific group actually provides: a manageable first ride, clear communication, appropriate training referrals, and respect for each rider\'s experience. Ask about those opportunities rather than assuming a particular kind of support is guaranteed by the group\'s name.',
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
    published: '2026-10-15',
    updated: '2026-11-01',
    readingMinutes: 3,
    sources: [
      { title: 'AMA: Charter types and event insurance access', url: 'https://americanmotorcyclist.com/organizers/charter-your-organization-getting-started/which-charter-is-right-for-me/' },
      { title: 'IRS: Charitable contributions and benefits received', url: 'https://www.irs.gov/taxtopics/tc506' },
      { title: 'IRS: Tax Exempt Organization Search', url: 'https://www.irs.gov/charities-non-profits/tax-exempt-organization-search' },
    ],
    sections: [
      {
        paragraphs: [
          'Charity rides are the public side of many clubs, and the poker run is a familiar format. If you want to meet a club, ride in its charity event. If you want to understand a club, look at how it runs one.',
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
          'Before organizing an event, check insurance, venue requirements, permits, and any applicable rules for prizes, raffles, or games of chance with the relevant agencies and qualified advisers. A waiver does not establish that a ride is insured or remove every possible liability. Federal tax-exempt status alone does not make an entry fee deductible. The IRS says only qualified organizations can receive deductible charitable contributions, and any benefit received can limit the deductible amount. Verify the beneficiary and the payment rather than promising a deduction.',
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
    published: '2026-10-15',
    updated: '2026-11-01',
    readingMinutes: 4,
    sources: [
      { title: 'National Park Service: Blue Ridge Parkway planning and closures', url: 'https://www.nps.gov/blri/planyourvisit/basicinfo.htm' },
      { title: 'National Park Service: Going-to-the-Sun Road seasonal access', url: 'https://www.nps.gov/glac/planyourvisit/gtsrinfo.htm' },
    ],
    sections: [
      {
        paragraphs: [
          'This regional list offers starting points for planning a club ride, from mountain passes to river roads. It is not a live road-condition report or a ranking based on measured club use. Check the responsible park or transportation agency for closures, weather, access restrictions, fuel availability, and the route\'s suitability for the riders involved. A familiar scenic road can still be closed or hazardous on the day of a trip.',
        ],
      },
      {
        heading: 'Southeast',
        paragraphs: [
          'The Tail of the Dragon, Cherohala Skyway, Foothills Parkway, Blue Ridge Parkway, and Skyline Drive are starting points for a mountain-road itinerary. The National Park Service describes the Blue Ridge Parkway as a 469-mile route between Shenandoah and Great Smoky Mountains national parks. Weather, maintenance, and other closures can interrupt a through trip. Check the current road status and posted limits, and choose sections and daily distances that fit the riders involved.',
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
          'The Beartooth Highway, Chief Joseph Scenic Byway, Going-to-the-Sun Road, Colorado\'s mountain passes, Utah\'s UT 12 and UT 128, Lolo Pass, and the Black Hills offer very different riding conditions. Do not apply one opening season to all of them. Glacier National Park notes that lower Going-to-the-Sun Road sections can remain open year-round while the alpine opening depends on snowfall and plowing, with no fixed date. Check each road before departure and have a route that avoids a closed pass.',
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
          'California\'s coastal highways, Angeles Crest Highway, and Sierra passes offer different conditions from Oregon\'s Columbia River roads or Washington\'s North Cascades routes. A scenic name does not establish that a road is open, free of construction, or suitable for a particular motorcycle. Coastal fog, storms, wildfire impacts, and seasonal pass closures can all change an itinerary. Consult the responsible transportation agency before setting out.',
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
          'Discuss experience levels, fuel range, likely weather, and alternatives before selecting a scenic route. Use smaller subgroups when that makes communication and safe spacing easier, and agree on regrouping points. Each rider must be able to choose a safe pace and decline a maneuver. Check current road conditions independently rather than assuming that a club\'s past ride report still applies.',
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
    published: '2026-10-15',
    updated: '2026-11-01',
    readingMinutes: 4,
    sources: [
      { title: 'AMA: Start a Motorcycle Club and bylaw templates', url: 'https://americanmotorcyclist.com/organizers/charter-your-organization-getting-started/start-a-motorcycle-club/' },
      { title: 'CVMA: Mission and membership categories', url: 'https://www.combatvet.us/' },
      { title: 'Motorcycle Safety Foundation: Guide to Group Riding', url: 'https://msf-usa.org/documents/library/group-riding/' },
    ],
    sections: [
      {
        paragraphs: [
          'These terms appear in motorcycle-club conversations, bylaws, ride briefings, and public listings. Meanings and practices vary by organization. Use this glossary as a starting point for questions rather than proof of a club\'s membership rules, conduct, or legal status. The references below explain specific charter, association, and group-riding practices; they are not a universal code of club culture.',
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
          '1% or 1%er: a diamond symbol used by some clubs as part of an outlaw-club identity. It does not by itself establish conduct, legal status, or whether visitors are welcome.',
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
    published: '2026-10-15',
    updated: '2026-11-01',
    readingMinutes: 4,
    sources: [
      { title: 'IRS: Tax Exempt Organization Search', url: 'https://www.irs.gov/charities-non-profits/tax-exempt-organization-search' },
      { title: 'AMA: Charter types and event insurance access', url: 'https://americanmotorcyclist.com/organizers/charter-your-organization-getting-started/which-charter-is-right-for-me/' },
      { title: 'CVMA: Mission and membership categories', url: 'https://www.combatvet.us/' },
    ],
    sections: [
      {
        paragraphs: [
          'Directories, this one included, carry listings for clubs that have merged, gone dormant, or changed character since the listing was created. Before you ride across the state to a meeting, spend thirty minutes confirming that the club is active and is what you expect. The routine below uses only public information.',
        ],
      },
      {
        heading: 'Check for recent activity',
        paragraphs: [
          'Read the club\'s official website, calendar, and public social pages for recent notices and a current contact. An old post or unavailable website is a reason to investigate, not proof that the group has closed. Compare the name, chapter, address, and contact details across official sources. If the only information available is a directory listing, treat activity and membership availability as unverified.',
        ],
      },
      {
        heading: 'Look it up in public registries',
        paragraphs: [
          'If a club says it is incorporated, check the relevant state business registry using its legal name. If it claims federal tax exemption or accepts deductible charitable gifts, use the IRS Tax Exempt Organization Search and examine the applicable status and filings. Informal groups may not appear in those records, and a registration is not an endorsement or proof of recent riding activity. The AMA also provides information about its chartered organizations and different charter types.',
        ],
      },
      {
        heading: 'Understand which kind of club it is',
        paragraphs: [
          'Treat the directory category, name, and photographs as starting points. Read the organization\'s own description and membership rules. A patch layout does not reliably establish eligibility, safety, conduct, or an invitation to visit. For example, CVMA explicitly calls itself an association, uses a one-piece patch, and distinguishes several membership categories. Confirm the specific chapter rather than inferring its rules from appearance.',
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
          'If the organizer confirms that an event is open to you, a visit can add context to the public record. Observe how guests are treated and ask about the activities and expectations that matter to you. One event is a limited observation, not proof of the club\'s overall conduct or a guarantee about later rides. Confirm a meeting or guest invitation before traveling.',
        ],
      },
      {
        heading: 'Reasons to pause and ask for clarification',
        list: [
          'Only a directory listing is available, so identity, activity, and a suitable contact remain unconfirmed.',
          'A registry result conflicts with the organization\'s current claim. Confirm the legal entity and ask about the discrepancy before relying on that claim.',
          'Members who will not say what the club does or what membership involves.',
          'Pressure to pay money before you have attended anything.',
          'Public posts that threaten other clubs or boast about confrontations.',
        ],
      },
      {
        heading: 'Keep a verification record, not a legitimacy score',
        paragraphs: [
          'Copy the fields below for each listing you investigate. Separate what a source actually establishes from what remains unknown. Multiple matching pages may repeat the same old information; a registry entry, patch, or recent event photo alone cannot establish safety, character, current activity, or an invitation to join.',
        ],
        list: [
          'Identity checked: Exact name, chapter, city, official URL, and how you distinguished it from similarly named groups: ____.',
          'Claim checked: The specific question, such as a meeting date, current contact, or a claimed tax status: ____.',
          'Evidence: Source URL or public contact channel, date checked, and the limited fact it supports: ____. Record what was said without treating it as an endorsement.',
          'Gaps and conflicts: Details that disagree, pages that could not be reached, and facts still not confirmed: ____. A failed page fetch is not proof of closure.',
          'Next step: Who can clarify the unresolved question? What confirmation is needed before traveling, applying, or paying? ____.',
          'Decision for now: Ready to ask a specific question, waiting for confirmation, or choosing not to proceed: ____. This records your next action, not a certified status for the organization.',
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

const bayAreaGuide: Guide = {
  slug: 'motorcycle-clubs-san-francisco-bay-area',
  marketId: 'sf-bay-area',
  title: 'Motorcycle Clubs in the San Francisco Bay Area',
  shortTitle: 'Bay Area Club Guide',
  description: 'Compare published riding activities, membership requirements and visiting arrangements for selected Bay Area motorcycle clubs, with official sources.',
  published: '2026-11-01', updated: '2026-11-02', readingMinutes: 3,
  sources: [
    { title: 'San Francisco Motorcycle Club: Membership and visiting FAQ', url: 'https://www.sf-mc.org/faq' },
    { title: 'Oakland Motorcycle Club: About the club', url: 'https://oaklandmc.org/about' },
    { title: 'Oakland Motorcycle Club: Schedule a visit', url: 'https://oaklandmc.org/schedule-a-visit' },
    { title: 'San Jose Dons: Membership and guest FAQ', url: 'https://www.sanjosedonsmc.com/about-1' },
    { title: 'Ghostriders MC: Club and meeting information', url: 'https://www.ghostridersmc.net/' },
    { title: 'Ghostriders MC: Membership', url: 'https://www.ghostridersmc.net/membership' },
    { title: 'Timekeepers MC: Club and meeting information', url: 'https://timekeepersmc.com/' },
    { title: 'Timekeepers MC: Contact', url: 'https://timekeepersmc.com/contact/' },
    { title: 'Rip City Riders California: Club and mission', url: 'https://ripcityriders.org/rcr/' },
    { title: 'Rip City Riders California: Contact and clubhouse', url: 'https://ripcityriders.org/contact/' },
    { title: 'North Bay Motorcycle Club: Clubhouse and contact', url: 'https://northbaymc.org/the-clubhouse/' },
    { title: 'Marin County Motorcycle Association: Membership and waitlist', url: 'https://mcmadirt.com/become-a-member' },
  ],
  sections: [
    { paragraphs: [
      'Finding a Bay Area motorcycle club starts with the riding you want and the commitment you can make. The reviewed selection below includes street-oriented clubs, dirt-bike and enduro groups, and a charitable motorcycle club. Compare what each organization actually publishes, then use its official contact or membership page to clarify the gaps. This is a selected local comparison, not a complete list of Bay Area clubs or an endorsement.',
    ] },
    { heading: 'Start with the riding you want', paragraphs: [
      'San Francisco Motorcycle Club publishes club rides and describes a membership that spans motorcycle brands. San Jose Dons describes itself as primarily a street-riding club and requires a freeway-worthy motorcycle for membership. Oakland Motorcycle Club describes members riding street, adventure, dual-sport and dirt motorcycles, as well as scooters. Those published interests help you narrow the field before asking about pace, ride length and the current calendar.',
      'Ghostriders MC identifies as a San Jose dirt-bike riding and racing club. Timekeepers MC describes a Bay Area enduro club whose members enjoy riding dirt. Both publish a meeting venue in Campbell. That meeting address is useful for making contact; it does not mean their riding is confined to Campbell or that the venue is a private clubhouse.',
    ] },
    { heading: 'Compare membership commitments before applying', paragraphs: [
      'San Francisco Motorcycle Club and San Jose Dons publish sponsorship and prospecting steps. The Dons FAQ also names a motorcycle license, insurance and AMA membership among its requirements. Ghostriders describes meeting attendance and working its annual race as part of full membership. These are different commitments, so ask which current rules apply to you rather than treating a club name or patch as an application checklist.',
      'Marin County Motorcycle Association describes a waitlist application at a general meeting with sponsorship from a current member in good standing. Its five-to-six-year wait estimate is explicitly dated April 2025. Ask the club about the current wait rather than assuming that older estimate describes a new application.',
      'A missing requirement in the comparison means it was not published in the sources reviewed. It does not mean membership is open to everyone, dues are zero, or the club is accepting applications. Use the official joining or contact route on each profile to ask a specific question.',
    ] },
    { heading: 'Distinguish an invitation from a public address', paragraphs: [
      'Oakland Motorcycle Club offers a visitor-signup calendar for meetings. San Francisco Motorcycle Club publishes visiting information in its FAQ. San Jose Dons generally welcomes guests to its calendar rides and meetings, with current arrangements best checked against club notices. Follow the particular invitation instead of assuming that a published address is permission to arrive at any time.',
      'Rip City Riders California describes both public and private fundraising events and publishes a Petaluma clubhouse contact. Check the event notice or ask the club which activities are open to guests. An event invitation and eligibility for membership answer different questions.',
      'North Bay Motorcycle Club publishes a Fulton clubhouse address and visiting times on its contact page. Confirm the arrangements before going. Marin County Motorcycle Association publishes a Petaluma clubhouse address but states that all events are private; its membership page describes occasional riding events for people on the waitlist. A published address alone is not a drop-in invitation.',
    ] },
    { heading: 'Make a useful first-contact shortlist', paragraphs: [
      'Open the profiles that fit your interests and keep the unanswered questions together. Ask about your preferred riding, guest arrangements, bike eligibility, dues and attendance expectations. If a meeting date matters to your plans, confirm it directly before traveling. The comparison records what sources said when checked; it cannot promise that a schedule or membership policy remains unchanged.',
    ], list: [
      'Which upcoming activity is appropriate for a first-time guest, and what should you do before attending?',
      'What riding experience, motorcycle and documents does that specific activity require?',
      'What recurring time and financial commitments would membership involve?',
    ] },
  ],
};
bayAreaGuide.readingMinutes = Math.max(1, Math.ceil(guideWordCount(bayAreaGuide) / 200));

export function selectPublishedGuides(standard: Guide[], candidates: Guide[], isEligible: (marketId: string) => boolean): Guide[] {
  return [...standard, ...candidates.filter(guide => guide.marketId && isEligible(guide.marketId))];
}

export const guides: Guide[] = selectPublishedGuides(standardGuides, [bayAreaGuide], id => getMarketGuideGate(getMarketClubs(id)).eligible);

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}

export function guideWordCount(guide: Guide): number {
  return guide.sections.reduce((n, s) => {
    const text = [...(s.paragraphs || []), ...(s.list || [])].join(' ');
    return n + text.split(/\s+/).filter(Boolean).length;
  }, 0);
}
