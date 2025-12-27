import { PackageOpen, XCircle, Search, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
    title: string
    description: string
    icon?: 'package' | 'error' | 'search' | 'key'
    action?: {
        label: string
        onClick: () => void
    }
}

export function EmptyState({ title, description, icon = 'package', action }: EmptyStateProps) {
    const Icon = icon === 'package' ? PackageOpen : icon === 'error' ? XCircle : icon === 'key' ? Key : Search

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg bg-muted/20 animate-fade-in-up">
            <div className="p-4 rounded-full bg-background border shadow-sm mb-4">
                <Icon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
                {description}
            </p>
            {action && (
                <Button onClick={action.onClick} variant="outline">
                    {action.label}
                </Button>
            )}
        </div>
    )
}
