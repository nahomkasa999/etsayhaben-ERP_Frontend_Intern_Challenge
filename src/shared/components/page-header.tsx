import Link from "next/link"

import { Button } from "@/shared/components/ui/button"

interface PageHeaderProps {
  title: string
  actionHref?: string
  actionLabel?: string
  onAction?: () => void
}

export function PageHeader({
  title,
  actionHref,
  actionLabel,
  onAction,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h1 className="page-title">{title}</h1>
      {actionLabel && onAction ? (
        <Button type="button" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : actionHref && actionLabel ? (
        <Button nativeButton={false} render={<Link href={actionHref} />}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
