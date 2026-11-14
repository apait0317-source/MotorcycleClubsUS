const issueFields = new URLSearchParams({
  title: 'Directory listing update',
  body: 'Club name and city\n\nDirectory page, if listed\n\nWhat should the directory add or change?\n\nOfficial club website or public source\n',
});

export default function PublicListingReport() {
  return (
    <section aria-label="Public listing reports" className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
      <h2 className="text-lg font-semibold text-gray-900">Report a listing on GitHub</h2>
      <p className="my-2 text-gray-700">
        Suggest a new club or correct a public listing. Include the club name, city and a link to an official source.
      </p>
      <a href={`https://github.com/apait0317-source/MotorcycleClubsUS/issues/new?${issueFields}`}
        className="font-medium text-amber-800 underline underline-offset-2">
        Open a public listing report
      </a>
      <p className="mt-2 text-sm text-gray-600">
        GitHub requires sign-in. Anyone can read the report and see your GitHub username. Leave personal contact details out.
      </p>
    </section>
  );
}
