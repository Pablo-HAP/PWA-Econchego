export function Separator({ className }: { className?: string }) {
  return <div className={"flex items-center gap-3 my-4 " + (className ?? '')}>
    <div className="flex-1 h-px bg-slate-200/30" />
    <span className="text-xs text-slate-500">Or continue with</span>
    <div className="flex-1 h-px bg-slate-200/30" />
  </div>
}
