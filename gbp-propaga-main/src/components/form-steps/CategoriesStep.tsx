import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface CategoriesStepProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

const suggestedCategories = [
  "Marketing agency",
  "Advertising agency",
  "Internet marketing service",
  "SEO agency",
  "Digital marketing agency",
  "Consultant",
  "Professional services",
];

const CategoriesStep = ({ formData, updateFormData }: CategoriesStepProps) => {
  const addCategory = (category: string) => {
    const current = formData.categories?.gbpAdditional || [];
    if (!current.includes(category) && current.length < 10) {
      updateFormData("categories.gbpAdditional", [...current, category]);
    }
  };

  const removeCategory = (category: string) => {
    const current = formData.categories?.gbpAdditional || [];
    updateFormData(
      "categories.gbpAdditional",
      current.filter((c: string) => c !== category)
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-2">Categorias</h3>
        <p className="text-muted-foreground">Selecione as categorias que descrevem seu negócio</p>
      </div>

      <div className="p-4 rounded-lg bg-brand-purple/10 border border-brand-purple/20">
        <p className="text-sm text-muted-foreground">
          As categorias variam por plataforma. Preencha as principais e o sistema mapeará automaticamente para cada canal.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="gbpPrimary">Categoria Principal (Google)</Label>
          <Input
            id="gbpPrimary"
            placeholder="ex: Marketing agency"
            value={formData.categories?.gbpPrimary || ""}
            onChange={(e) => updateFormData("categories.gbpPrimary", e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label>Categorias Adicionais (Google)</Label>
          <p className="text-xs text-muted-foreground mb-3">
            Até 10 categorias. Clique nas sugestões ou digite suas próprias.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestedCategories.map((category) => (
              <Badge
                key={category}
                variant="outline"
                className="cursor-pointer hover:bg-brand-purple/20 transition-colors"
                onClick={() => addCategory(category)}
              >
                + {category}
              </Badge>
            ))}
          </div>

          {formData.categories?.gbpAdditional?.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/50 border border-border">
              {formData.categories.gbpAdditional.map((category: string) => (
                <Badge
                  key={category}
                  className="bg-accent text-accent-foreground gap-1"
                >
                  {category}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => removeCategory(category)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="fbCategory">Categoria (Facebook)</Label>
          <Input
            id="fbCategory"
            placeholder="ex: Local Business, Service Business"
            value={formData.categories?.fbCategory || ""}
            onChange={(e) => updateFormData("categories.fbCategory", e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>
    </div>
  );
};

export default CategoriesStep;
