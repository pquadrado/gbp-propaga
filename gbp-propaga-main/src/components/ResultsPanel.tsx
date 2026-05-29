import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, CheckCheck } from 'lucide-react';
import { ChannelProgress } from './ChannelProgress';
import { useToast } from '@/hooks/use-toast';
import type { SyncResponse } from '@/types/business-profile';

interface ResultsPanelProps {
  response: SyncResponse;
  onReset: () => void;
}

export function ResultsPanel({ response, onReset }: ResultsPanelProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopySyncId = async () => {
    try {
      await navigator.clipboard.writeText(response.sync_id);
      setCopied(true);
      toast({
        title: '✅ Copiado!',
        description: 'ID de sincronização copiado para área de transferência'
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: '❌ Erro ao copiar',
        description: 'Não foi possível copiar o ID',
        variant: 'destructive'
      });
    }
  };

  const successCount = Object.values(response.results).filter(
    r => r.status === 'success' || r.status === 'sent'
  ).length;

  const totalChannels = Object.keys(response.results).length;

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8 bg-card border-border shadow-purple">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2 text-foreground">
              {response.success ? '✅' : '⚠️'}
              {response.success ? 'Sincronização Concluída!' : 'Sincronização Parcial'}
            </CardTitle>
            <CardDescription className="mt-2">
              {successCount} de {totalChannels} canais sincronizados com sucesso
            </CardDescription>
          </div>
          <Badge variant={response.success ? 'default' : 'destructive'}>
            {successCount}/{totalChannels}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">ID de Sincronização</p>
            <p className="font-mono text-sm truncate text-foreground">{response.sync_id}</p>
          </div>
          <Button size="sm" variant="ghost" onClick={handleCopySyncId} className="shrink-0">
            {copied ? <CheckCheck className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase">Resultados por Canal</h3>
          {Object.entries(response.results).map(([channel, result]) => (
            <ChannelProgress key={channel} name={channel} status={result.status} result={result} />
          ))}
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={onReset} className="flex-1 bg-accent hover:bg-accent/90">
            Nova Sincronização
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Sincronizado em {new Date(response.timestamp).toLocaleString('pt-BR')}
        </p>
      </CardContent>
    </Card>
  );
}

export default ResultsPanel;
