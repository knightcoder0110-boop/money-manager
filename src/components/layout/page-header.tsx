export default function PageHeader({ title }: { title: string }) {
  return (
    <div className="px-4 py-4 border-b border-zinc-800">
      <h1 className="text-xl font-semibold text-zinc-50">{title}</h1>
    </div>
  );
}
