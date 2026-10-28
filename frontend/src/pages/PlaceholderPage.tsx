const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="space-y-2">
    <h1 className="text-2xl font-extrabold">{title}</h1>
    <p className="text-muted-foreground">Esta tela chega nos próximos passos.</p>
  </div>
)

export { PlaceholderPage }
