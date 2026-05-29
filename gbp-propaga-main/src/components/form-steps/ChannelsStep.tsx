import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import type { DirectoryChannel, BusinessType } from '@/types/business-profile';
import { Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ChannelsStepProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

const businessTypeOptions = [
  { value: 'general', label: 'Geral (qualquer negócio)', icon: '🏢' },
  { value: 'restaurants', label: 'Restaurante/Food', icon: '🍔' },
  { value: 'healthcare', label: 'Saúde', icon: '⚕️' },
  { value: 'real_estate', label: 'Imóveis', icon: '🏠' },
  { value: 'services', label: 'Serviços', icon: '🔧' },
  { value: 'hotels', label: 'Hospedagem', icon: '🏨' },
];

const ChannelsStep = ({ formData, updateFormData }: ChannelsStepProps) => {
  const [businessType, setBusinessType] = useState<BusinessType>('general');
  const [directories, setDirectories] = useState<DirectoryChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllDirectories, setShowAllDirectories] = useState(false);

  const selectedChannels = formData.channels || [];

  useEffect(() => {
    fetchDirectories();
  }, []);

  useEffect(() => {
    // Auto-select relevant directories when business type changes
    if (directories.length > 0 && selectedChannels.length === 0) {
      preselectChannels();
    }
  }, [businessType, directories]);

  const fetchDirectories = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('directory_channels')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (fetchError) throw fetchError;
      
      setDirectories(data || []);
    } catch (err) {
      console.error('Error fetching directories:', err);
      setError('Erro ao carregar diretórios. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const preselectChannels = () => {
    const relevantDirectories = directories.filter(dir =>
      dir.categories.includes(businessType) || dir.categories.includes('general')
    );
    
    // Pre-select all relevant non-approval directories
    const preselected = relevantDirectories
      .filter(dir => !dir.requires_approval)
      .map(dir => dir.code);
    
    updateFormData('channels', preselected);
  };

  const getRelevantDirectories = () => {
    return directories.filter(dir =>
      dir.categories.includes(businessType) || dir.categories.includes('general')
    );
  };

  const getOtherDirectories = () => {
    const relevant = new Set(getRelevantDirectories().map(d => d.code));
    return directories.filter(dir => !relevant.has(dir.code));
  };

  const handleChannelToggle = (code: string, checked: boolean) => {
    if (checked) {
      updateFormData('channels', [...selectedChannels, code]);
    } else {
      updateFormData('channels', selectedChannels.filter((c: string) => c !== code));
    }
  };

  const handleSelectAll = () => {
    const allCodes = getRelevantDirectories().map(d => d.code);
    updateFormData('channels', allCodes);
  };

  const handleDeselectAll = () => {
    updateFormData('channels', []);
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const relevantDirs = getRelevantDirectories();
  const otherDirs = getOtherDirectories();

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Tipo do Negócio</CardTitle>
          <CardDescription>
            Selecione o tipo do seu negócio para pré-selecionar os diretórios mais relevantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={businessType} onValueChange={(value) => setBusinessType(value as BusinessType)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {businessTypeOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex items-center gap-2 cursor-pointer text-foreground">
                    <span className="text-2xl">{option.icon}</span>
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Diretórios Recomendados</CardTitle>
              <CardDescription>
                Selecionados automaticamente para {businessTypeOptions.find(o => o.value === businessType)?.label}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                Selecionar Todos
              </Button>
              <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                Limpar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relevantDirs.map((dir) => (
              <div
                key={dir.code}
                className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all ${
                  selectedChannels.includes(dir.code)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <Checkbox
                  id={dir.code}
                  checked={selectedChannels.includes(dir.code)}
                  onCheckedChange={(checked) => handleChannelToggle(dir.code, checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor={dir.code} className="flex items-center gap-2 cursor-pointer font-medium text-foreground">
                    <span className="text-xl">{dir.icon || '📍'}</span>
                    {dir.name}
                    {dir.requires_approval && (
                      <Badge variant="outline" className="text-xs">
                        Envia Email
                      </Badge>
                    )}
                  </Label>
                  {dir.description && <p className="text-sm text-muted-foreground mt-1">{dir.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {otherDirs.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between p-0 hover:bg-transparent"
              onClick={() => setShowAllDirectories(!showAllDirectories)}
            >
              <div className="text-left">
                <CardTitle className="text-foreground">Outros Diretórios Disponíveis</CardTitle>
                <CardDescription>
                  {otherDirs.length} diretórios adicionais
                </CardDescription>
              </div>
              {showAllDirectories ? <ChevronUp className="text-foreground" /> : <ChevronDown className="text-foreground" />}
            </Button>
          </CardHeader>
          
          {showAllDirectories && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {otherDirs.map((dir) => (
                  <div
                    key={dir.code}
                    className={`flex items-start space-x-3 p-4 rounded-lg border transition-all ${
                      selectedChannels.includes(dir.code)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <Checkbox
                      id={`other-${dir.code}`}
                      checked={selectedChannels.includes(dir.code)}
                      onCheckedChange={(checked) => handleChannelToggle(dir.code, checked as boolean)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={`other-${dir.code}`} className="flex items-center gap-2 cursor-pointer font-medium text-foreground">
                        <span className="text-xl">{dir.icon || '📍'}</span>
                        {dir.name}
                        {dir.requires_approval && (
                          <Badge variant="outline" className="text-xs">
                            Envia Email
                          </Badge>
                        )}
                      </Label>
                      {dir.description && <p className="text-sm text-muted-foreground mt-1">{dir.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {selectedChannels.length > 0 && (
        <Alert>
          <AlertDescription className="flex items-center gap-2">
            <Badge variant="default">{selectedChannels.length}</Badge>
            {selectedChannels.length === 1 ? 'diretório selecionado' : 'diretórios selecionados'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ChannelsStep;
