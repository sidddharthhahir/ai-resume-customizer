import { Card } from '@/components/ui/card';
import { TrendingUp, Send, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Stats {
  total: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
  withdrawn: number;
  successRate: number;
}

interface TrackerStatsProps {
  stats: Stats;
}

export default function TrackerStats({ stats }: TrackerStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <Send className="w-4 h-4 text-blue-600" />
          <span className="text-xs text-gray-600 font-medium">Total Applied</span>
        </div>
        <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
      </Card>

      <Card className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-yellow-600" />
          <span className="text-xs text-gray-600 font-medium">Interviews</span>
        </div>
        <div className="text-2xl font-bold text-yellow-600">{stats.interview}</div>
      </Card>

      <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-xs text-gray-600 font-medium">Offers</span>
        </div>
        <div className="text-2xl font-bold text-green-600">{stats.offer}</div>
      </Card>

      <Card className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-purple-600" />
          <span className="text-xs text-gray-600 font-medium">Success Rate</span>
        </div>
        <div className="text-2xl font-bold text-purple-600">{stats.successRate}%</div>
      </Card>
    </div>
  );
}
