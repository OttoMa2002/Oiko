type Params = { params: { id: string } };

export default function WorkspacePage({ params }: Params) {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="border-b p-4 text-sm opacity-70">
        Workspace · project: <span className="font-mono">{params.id}</span> · agent
        progress bar goes here (research → architecture → code → done)
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2">
        <section className="border-r p-4 space-y-2">
          <h2 className="text-sm uppercase opacity-50 tracking-wide">Chat</h2>
          <p className="text-sm opacity-70">
            Agent chat panel. Not yet wired to /api/chat.
          </p>
        </section>
        <section className="p-4 space-y-2">
          <h2 className="text-sm uppercase opacity-50 tracking-wide">Preview</h2>
          <p className="text-sm opacity-70">
            Sandboxed iframe of generated HTML will render here.
          </p>
        </section>
      </div>
    </main>
  );
}