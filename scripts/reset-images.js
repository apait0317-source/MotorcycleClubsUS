const fs = require('fs');
const path = require('path');

const clubsPath = path.join(__dirname, '..', 'data', 'clubs.json');
const clubs = JSON.parse(fs.readFileSync(clubsPath, 'utf-8'));

// Reset local image paths to empty (will trigger placeholder)
const updated = clubs.map(club => {
  if (club.featured_image && club.featured_image.startsWith('/images/')) {
    return {
      ...club,
      featured_image: ''
    };
  }
  return club;
});

fs.writeFileSync(clubsPath, JSON.stringify(updated, null, 2));

const withImages = updated.filter(c => c.featured_image && c.featured_image.length > 0).length;
const withPlaceholder = updated.filter(c => c.featured_image === '' || !c.featured_image).length;

console.log('Clubs with external images:', withImages);
console.log('Clubs using placeholder:', withPlaceholder);
console.log('Updated clubs.json');
