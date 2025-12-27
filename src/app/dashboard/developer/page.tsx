import { createClient } from '@/utils/supabase/server'
import { generateApiKey, revokeApiKey } from '@/app/actions/api-key'
import { Button } from '@/components/ui/button' // Assuming you have this
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge' // Assuming you have this
import { redirect } from 'next/navigation'
import { Key, ShieldAlert, CheckCircle2, Copy } from 'lucide-react'

import { Database } from '@/types/database'

type ApiKey = Database['public']['Tables']['api_keys']['Row']

export default async function DeveloperDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const apiKeys = data as ApiKey[] | null

    // UI helper for Copy (Client Component would be better for interactivity, but we'll use a form/button for actions)
    // For simplicity in this Server Component structure, we'll render the list.

    return (
        <div className="container max-w-4xl py-10 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Developer Dashboard</h1>
                    <p className="text-muted-foreground">Manage your API Keys and monitor usage.</p>
                </div>
                <form action={generateApiKey}>
                    <Button>
                        <Key className="mr-2 h-4 w-4" />
                        Generate New Key
                    </Button>
                </form>
            </div>

            <div className="grid gap-6">
                {apiKeys?.map((key) => (
                    <Card key={key.id} className={key.status === 'revoked' ? 'opacity-60' : ''}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    {key.secret_key.substring(0, 12)}...
                                    {key.status === 'active' ? (
                                        <Badge variant="default" className="bg-green-500">Active</Badge>
                                    ) : (
                                        <Badge variant="destructive">Revoked</Badge>
                                    )}
                                </CardTitle>
                                <CardDescription> Created: {new Date(key.created_at).toLocaleDateString()}</CardDescription>
                            </div>
                            <form action={revokeApiKey.bind(null, key.id)}>
                                {key.status === 'active' && (
                                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
                                        Revoke
                                    </Button>
                                )}
                            </form>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Monthly Quota</span>
                                        <span className="font-bold">{key.current_usage} / {key.monthly_quota}</span>
                                    </div>
                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all"
                                            style={{ width: `${Math.min((key.current_usage / key.monthly_quota) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="p-3 bg-muted rounded-md font-mono text-xs break-all flex justify-between items-center">
                                    {key.secret_key}
                                    {/* Copy button would need client component wrapper or simple JS */}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {(!apiKeys || apiKeys.length === 0) && (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <ShieldAlert className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No API Keys Found</h3>
                        <p className="text-muted-foreground">Generate your first key to start using the API.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
