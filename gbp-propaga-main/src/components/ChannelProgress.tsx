import { CheckCircle2, Loader2, XCircle, Mail, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChannelResult } from '@/types/business-profile';

interface ChannelProgressProps {
  name: string;
  status: ChannelResult['status'];
  result?: ChannelResult;
}

const channelIcons: Record<string, string> = {
  google: '🔍',
  facebook: '📘',
  apple: '🍎',
  instagram: '📷',
  bing: '🅱️',
  apontador: '📍',
  guiamais: '🗺️',
  telelistas: '📞',
  default: '📍'
};

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/30',
    label: 'Aguardando',
    animate: undefined
  },
  syncing: {
    icon: Loader2,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    label: 'Sincronizando',
    animate: 'animate-spin' as const
  },
  success: {
    icon: CheckCircle2,
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    label: 'Sucesso',
    animate: undefined
  },
  sent: {
    icon: Mail,
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
    label: 'Email enviado',
    animate: undefined
  },
  error: {
    icon: XCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    label: 'Erro',
    animate: undefined
  }
};

export function ChannelProgress({ name, status, result }: ChannelProgressProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const channelIcon = channelIcons[name] || channelIcons.default;

  return (
    <div className={cn('flex items-center gap-3 p-4 rounded-lg border transition-all', config.bgColor, 'border-border')}>
      <div className="text-2xl">{channelIcon}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium capitalize text-foreground">{name}</h4>
          <span className={cn('text-xs', config.color)}>{config.label}</span>
        </div>

        {result && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">{result.message}</p>
        )}

        {result && result.durationMs && (
          <p className="text-xs text-muted-foreground mt-1">⏱️ {result.durationMs}ms</p>
        )}
      </div>

      <div className={config.color}>
        <Icon className={cn('w-5 h-5', config.animate)} />
      </div>
    </div>
  );
}
