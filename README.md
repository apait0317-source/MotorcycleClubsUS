# Motorcycle Clubs US Directory

A comprehensive directory of motorcycle clubs across the United States, built with Next.js 14 and optimized for SEO.

**Live Site:** [https://motorcycle-clubs-us.vercel.app](https://motorcycle-clubs-us.vercel.app)

## Features

- **975+ Motorcycle Clubs** - Comprehensive database of motorcycle clubs across all 50 states
- **Programmatic SEO** - Auto-generated pages for states, cities, and individual clubs
- **JSON-LD Schema Markup** - Rich structured data for better search engine visibility
- **Mobile-First Design** - Responsive, clean UI built with Tailwind CSS
- **Static Site Generation** - Fast page loads with pre-rendered content
- **Search Functionality** - Find clubs by name, city, or state
- **Monetization Ready** - Ad placeholders and affiliate sections included

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Data:** Local JSON files (converted from CSV)
- **Deployment:** Vercel

## Project Structure

```
/app
  /page.tsx                      # Homepage
  /states/page.tsx               # All states listing
  /state/[code]/page.tsx         # Individual state pages
  /cities/page.tsx               # All cities listing
  /city/[state]/[city]/page.tsx  # Individual city pages
  /clubs/[slug]/page.tsx         # Individual club pages
  /search/page.tsx               # Search results
  /sitemap.ts                    # Dynamic sitemap
  /robots.ts                     # Robots.txt

/components
  /Header.tsx                    # Site header with navigation
  /Footer.tsx                    # Site footer
  /ClubCard.tsx                  # Club preview card
  /Rating.tsx                    # Star rating display
  /Breadcrumbs.tsx               # Navigation breadcrumbs
  /SchemaMarkup.tsx              # JSON-LD schema components
  /AdPlaceholder.tsx             # Advertisement placeholders
  /AffiliateSection.tsx          # Affiliate product section

/data
  /clubs.json                    # All club data
  /states.json                   # State summary data
  /cities.json                   # City summary data

/lib
  /types.ts                      # TypeScript interfaces
  /data.ts                       # Data loading utilities
  /utils.ts                      # Helper functions

/scripts
  /convert-csv-to-json.js        # CSV to JSON converter
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/apait0317-source/MotorcycleClubsUS.git
cd MotorcycleClubsUS

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Build for Production

```bash
npm run build
npm start
```

## Adding New Data

### Update Club Data

1. Edit the CSV file: `usa_motorcycle_clubs_comprehensive_chapters - Dataset.csv`
2. Run the conversion script:
   ```bash
   node scripts/convert-csv-to-json.js
   ```
3. Rebuild the site:
   ```bash
   npm run build
   ```

### CSV Format

The CSV must include these columns:
- `place_id` - Unique identifier
- `name` - Club name
- `description` - Club description
- `reviews` - Number of reviews
- `rating` - Rating (0-5)
- `website` - Club website URL
- `phone` - Contact phone
- `featured_image` - Image URL
- `main_category` - Primary category
- `categories` - All categories (comma-separated)
- `closed_on` - Operating hours
- `address` - Full address
- `link` - Google Maps link
- `City` - City name
- `State` - State code (e.g., "ny", "ca")

## Monetization

### Ad Placeholders

Ad placeholders are included at strategic locations:
- Header banner (728x90)
- Sidebar ads on listing pages
- Between club listings
- Footer banner

To implement ads, edit `components/AdPlaceholder.tsx` and add your ad network code.

### Affiliate Sections

Affiliate product sections are included on city and club pages. Edit `components/AffiliateSection.tsx` to add your affiliate links.

## SEO Features

- **Dynamic Meta Tags** - Title and description for every page
- **Open Graph** - Social sharing optimization
- **JSON-LD Schema** - LocalBusiness, BreadcrumbList, ItemList, Organization
- **Sitemap.xml** - Auto-generated with all pages
- **Robots.txt** - Search engine crawling rules
- **Semantic HTML** - Proper heading hierarchy

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/apait0317-source/MotorcycleClubsUS)

Or deploy manually:

```bash
npm install -g vercel
vercel
```

## License

This project is licensed under the Unlicense - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
