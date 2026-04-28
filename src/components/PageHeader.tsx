interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-8 animate-fade-in">
      <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{title}</h1>
      {subtitle && (
        <p className="text-sm text-muted-foreground mt-1.5">{subtitle}</p>
      )}
      <div className="glow-line mt-5" />
    </div>
  );
}
