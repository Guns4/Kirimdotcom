'use client';

import { useState, useEffect } from 'react';
import { getJobs } from '@/app/actions/jobs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, DollarSign, Crown } from 'lucide-react';

export default function JobBoardPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJobs().then((data) => {
      setJobs(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 container-custom py-8">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 rounded-2xl">
        <div>
          <h1 className="text-3xl font-bold">Cari Tim Impianmu</h1>
          <p className="opacity-90 mt-2">
            Platform lowongan kerja khusus Seller & UMKM.
          </p>
        </div>
        <Button variant="secondary" size="lg">
          Pasang Lowongan (Gratis)
        </Button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className={`p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-indigo-200 transition-all ${job.is_premium ? 'border-l-4 border-l-yellow-400 bg-yellow-50/30' : ''}`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    {job.title}
                    {job.is_premium && (
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-none">
                        <Crown className="w-3 h-3 mr-1" /> Featured
                      </Badge>
                    )}
                  </h3>
                  <Badge variant="outline">{job.type}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" /> {job.salary_range}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />{' '}
                    {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Button>Lamar</Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
