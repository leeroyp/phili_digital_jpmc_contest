export default function SuccessPage({ searchParams }: { searchParams: { entryId?: string } }) {
  return (
    <main style={{ maxWidth: 680, margin: "40px auto", padding: 16 }}>
      <h1>Success 🎉</h1>
      <p>Your entry has been received.</p>
      {searchParams.entryId && (
        <p>
          Entry ID: <code>{searchParams.entryId}</code>
        </p>
      )}
    </main>
  );
}
