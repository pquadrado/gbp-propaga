import { useEffect, useState } from 'react';
import type React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, CheckCircle2, Mail, XCircle, Clock, RefreshCw } from 'lucide-react';
import type { ChannelResult } from '@/types/business-profile';
import { getDirectoryStatusByGoogleLocationId } from '@/services/database-service';

interface DirectoryStatus {
  updatedAt: string;
  results: Record<string, ChannelResult>;
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
};

const statusConfig: Record<string, { label: string; color: string; Icon: React.ComponentType<{ className?: string }> }> = {
  success: { label: 'Sincronizado', color: 'text-accent', Icon: CheckCircle2 },
  sent: { label: 'Email enviado', color: 'text-secondary', Icon: Mail },
  error: { label: 'Erro', color: 'text-destructive', Icon: XCircle },
  pending: { label: 'Pendente', color: 'text-muted-foreground', Icon: Clock },
  syncing: { label: 'Sincronizando', color: 'text-primary', Icon: RefreshCw },
};

const DirectoryPanel = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<DirectoryStatus | null>(null);
  const [locationName, setLocationName] = useState<string>('');

  useEffect(() => {
    if (!locationId) return;

    const decodedLocationId = decodeURIComponent(locationId);

    getDirectoryStatusByGoogleLocationId(decodedLocationId)
      .then((data) => {
        if (!data) return;
        setStatus({ updatedAt: data.updatedAt, results: data.results });
        setLocationName(data.locationName);
      })
      .catch((error) => {
        console.warn('Falha ao carregar status do Supabase, tentando cache local', error);
        try {
          const raw = localStorage.getItem('gbp_directory_status_v1');
          if (raw) {
            const parsed = JSON.parse(raw);
            const data = parsed[decodedLocationId] || parsed[locationId];
            if (data) setStatus(data);
          }
        } catch {
          // ignore
        }
      });
  }, [locationId]);

  const successCount = status
    ? Object.values(status.results).filter((r) => r.status === 'success' || r.status === 'sent').length
    : 0;
  const totalCount = status ? Object.keys(status.results).length : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-purple to-brand-magenta rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">pquadrado</h1>
              <p className="text-xs text-muted-foreground">Painel de Diretórios</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground">
              {locationName || 'Empresa'}
            </h2>
            <p className="text-muted-foreground mt-1 font-mono text-sm break-all">
              {decodeURIComponent(locationId || '')}
            </p>
          </div>

          {!status ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center shadow-purple">
              <Clock className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Nenhuma sincronização encontrada</p>
              <p className="text-muted-foreground text-sm mt-2">
                Faça uma sincronização primeiro para ver os resultados aqui
              </p>
              <button
                onClick={() => navigate('/form')}
                className="mt-6 px-6 py-2.5 bg-accent hover:bg-accent/90 text-accent-foreground font-medium rounded-md transition-colors"
              >
                Sincronizar agora
              </button>
            </div>
          ) : (
            <>
              <div className="bg-card border border-border rounded-xl p-6 mb-6 shadow-purple">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Última sincronização</p>
                    <p className="text-foreground font-medium">
                      {new Date(status.updatedAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">{successCount}/{totalCount}</p>
                    <p className="text-sm text-muted-foreground">canais OK</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Status por Canal
                </h3>
                {Object.entries(status.results).map(([channel, result]) => {
                  const cfg = statusConfig[result.status] || statusConfig.pending;
                  const Icon = cfg.Icon;
                  return (
                    <div
                      key={channel}
                      className="bg-card border border-border rounded-xl p-4 flex items-center gap-4"
                    >
                      <span className="text-2xl">{channelIcons[channel] || '📍'}</span>
                      <div className="flex-1">
                        <p className="font-medium capitalize text-foreground">{channel}</p>
                        {result.message && (
                          <p className="text-sm text-muted-foreground">{result.message}</p>
                        )}
                      </div>
                      <div className={`flex items-center gap-1.5 ${cfg.color}`}>
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{cfg.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => navigate('/form')}
                  className="px-6 py-2.5 bg-accent hover:bg-accent/90 text-accent-foreground font-medium rounded-md transition-colors"
                >
                  Nova sincronização
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-2.5 border border-border text-foreground font-medium rounded-md hover:bg-muted transition-colors"
                >
                  Ver outras empresas
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default DirectoryPanel;
