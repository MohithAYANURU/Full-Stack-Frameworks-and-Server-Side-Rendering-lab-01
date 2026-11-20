// Shown at once while a page of /movies waits for its data
export default function MoviesLoading() {
  return (
    <p role="status" className="mx-auto w-full max-w-2xl p-8">
      Loading the movies...
    </p>
  );
}
