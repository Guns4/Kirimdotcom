import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function DocsPage() {
    return (
        <div className="container max-w-4xl py-10 space-y-8">
            <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-primary">CekKirim API Documentation</h1>
                <p className="text-xl text-muted-foreground">
                    Integrate reliable logistics tracking into your own applications.
                </p>
                <div className="flex gap-2">
                    <Badge variant="secondary">v1.0</Badge>
                    <Badge variant="outline" className="text-green-600 border-green-600">Stable</Badge>
                </div>
            </div>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Authentication</h2>
                <Card className="bg-slate-950 text-slate-50">
                    <CardContent className="pt-6 font-mono text-sm">
                        <p className="text-muted-foreground mb-2"># Pass your API Key in the header</p>
                        <p>x-api-key: ck_live_xxxxxxxxxxxxxxxxxxxxxxxx</p>
                    </CardContent>
                </Card>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Endpoint: Track Package</h2>
                <div className="flex items-center gap-2 font-mono bg-muted p-2 rounded-md">
                    <Badge>POST</Badge>
                    <span>https://cekkirim.com/api/v1/track</span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <h3 className="font-medium">Request Body (JSON)</h3>
                        <Card className="bg-slate-950 text-blue-300 border-none">
                            <CardContent className="pt-6 font-mono text-sm">
                                {`{
  "courier": "jne",
  "resi": "JP123456789"
}`}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-medium">Success Response (200)</h3>
                        <Card className="bg-slate-950 text-green-300 border-none">
                            <CardContent className="pt-6 font-mono text-sm">
                                {`{
  "meta": {
    "code": 200,
    "status": "success",
    "quota_remaining": 998
  },
  "data": {
    "courier": "JNE",
    "resiNumber": "JP123456789",
    "history": [...]
  }
}`}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Error Codes</h2>
                <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-muted-foreground">
                            <tr>
                                <th className="p-3">Code</th>
                                <th className="p-3">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            <tr>
                                <td className="p-3 font-mono text-red-500">401</td>
                                <td className="p-3">Unauthorized. Missing or invalid `x-api-key`.</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono text-yellow-600">402</td>
                                <td className="p-3">Payment Required. Monthly quota exceeded.</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono text-orange-500">429</td>
                                <td className="p-3">Too Many Requests. Slow down.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    )
}
