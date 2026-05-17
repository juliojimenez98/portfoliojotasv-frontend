export default function GastosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-app="gastos" className="animate-fade-in">
      {children}
    </div>
  );
}
