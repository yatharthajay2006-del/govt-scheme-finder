import { useState } from "react";
import { 
  useListSchemes, 
  useGetStatsOverview, 
  useCreateScheme, 
  useUpdateScheme, 
  useDeleteScheme,
  getListSchemesQueryKey,
  getGetStatsOverviewQueryKey
} from "@workspace/api-client-react";
import { Scheme, SchemeInput, SchemeCategory } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, LayoutDashboard, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CategoryBadge } from "@/components/CategoryBadge";
import { Skeleton } from "@/components/ui/skeleton";

export function Admin() {
  const { data: stats, isLoading: statsLoading } = useGetStatsOverview();
  const { data: schemes, isLoading: schemesLoading } = useListSchemes();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createMutation = useCreateScheme();
  const updateMutation = useUpdateScheme();
  const deleteMutation = useDeleteScheme();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);
  const [formData, setFormData] = useState<Partial<SchemeInput>>({
    name: "", slug: "", category: SchemeCategory.other, shortDescription: "", description: "", 
    benefits: [], requiredDocuments: [], applySteps: [], officialLink: "", applicableStates: [], 
    tags: [], eligibilityRules: [], eligibilitySummary: "", popularity: 0
  });
  
  const [textAreas, setTextAreas] = useState({
    benefits: "", requiredDocuments: "", applySteps: "", applicableStates: "", tags: "", eligibilityRules: "[]"
  });

  const filteredSchemes = schemes?.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.ministry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEditDialog = (scheme: Scheme) => {
    setEditingScheme(scheme);
    setFormData({
      name: scheme.name, slug: scheme.slug, nameHindi: scheme.nameHindi, category: scheme.category,
      ministry: scheme.ministry, shortDescription: scheme.shortDescription, description: scheme.description,
      officialLink: scheme.officialLink, eligibilitySummary: scheme.eligibilitySummary, popularity: scheme.popularity
    });
    setTextAreas({
      benefits: scheme.benefits.join("\n"),
      requiredDocuments: scheme.requiredDocuments.join("\n"),
      applySteps: scheme.applySteps.join("\n"),
      applicableStates: scheme.applicableStates.join("\n"),
      tags: scheme.tags.join("\n"),
      eligibilityRules: JSON.stringify(scheme.eligibilityRules, null, 2)
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingScheme(null);
    setFormData({
      name: "", slug: "", category: SchemeCategory.other, ministry: "", shortDescription: "", description: "", 
      officialLink: "", eligibilitySummary: "", popularity: 0
    });
    setTextAreas({
      benefits: "", requiredDocuments: "", applySteps: "", applicableStates: "", tags: "", eligibilityRules: "[]"
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this scheme?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Scheme deleted successfully" });
          queryClient.invalidateQueries({ queryKey: getListSchemesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsOverviewQueryKey() });
        }
      });
    }
  };

  const handleSave = () => {
    try {
      const parsedRules = JSON.parse(textAreas.eligibilityRules);
      
      const finalData: SchemeInput = {
        name: formData.name || "",
        slug: formData.slug || formData.name?.toLowerCase().replace(/\s+/g, '-') || "",
        nameHindi: formData.nameHindi,
        category: formData.category as SchemeCategory || SchemeCategory.other,
        ministry: formData.ministry,
        shortDescription: formData.shortDescription || "",
        description: formData.description || "",
        officialLink: formData.officialLink || "",
        eligibilitySummary: formData.eligibilitySummary || "",
        popularity: formData.popularity || 0,
        benefits: textAreas.benefits.split('\n').filter(Boolean),
        requiredDocuments: textAreas.requiredDocuments.split('\n').filter(Boolean),
        applySteps: textAreas.applySteps.split('\n').filter(Boolean),
        applicableStates: textAreas.applicableStates.split('\n').filter(Boolean),
        tags: textAreas.tags.split('\n').filter(Boolean),
        eligibilityRules: parsedRules
      };

      if (editingScheme) {
        updateMutation.mutate({ id: editingScheme.id, data: finalData }, {
          onSuccess: () => {
            toast({ title: "Scheme updated successfully" });
            setIsDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: getListSchemesQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetStatsOverviewQueryKey() });
          }
        });
      } else {
        createMutation.mutate({ data: finalData }, {
          onSuccess: () => {
            toast({ title: "Scheme created successfully" });
            setIsDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: getListSchemesQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetStatsOverviewQueryKey() });
          }
        });
      }
    } catch (err) {
      toast({ title: "Error parsing JSON", description: "Check your eligibility rules JSON format.", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <LayoutDashboard className="text-primary" size={28} />
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-card p-6 rounded-xl border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Schemes</h3>
          <div className="text-3xl font-bold">{statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.totalSchemes}</div>
        </div>
        <div className="bg-card p-6 rounded-xl border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Eligibility Checks</h3>
          <div className="text-3xl font-bold text-secondary">{statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.totalChecks}</div>
        </div>
        <div className="bg-card p-6 rounded-xl border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">States Covered</h3>
          <div className="text-3xl font-bold text-primary">{statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.totalStatesCovered}</div>
        </div>
      </div>

      {/* Schemes Management */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/10">
          <h2 className="text-xl font-bold">Manage Schemes</h2>
          
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                placeholder="Search schemes..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog} className="shrink-0">
                  <Plus size={16} className="mr-2" /> Add Scheme
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingScheme ? 'Edit Scheme' : 'Add New Scheme'}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Name (English)</Label>
                      <Input value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                      <Label>Name (Hindi)</Label>
                      <Input value={formData.nameHindi || ''} onChange={e => setFormData({...formData, nameHindi: e.target.value})} />
                    </div>
                    <div>
                      <Label>Slug</Label>
                      <Input value={formData.slug || ''} onChange={e => setFormData({...formData, slug: e.target.value})} />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v as SchemeCategory})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.values(SchemeCategory).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Ministry</Label>
                      <Input value={formData.ministry || ''} onChange={e => setFormData({...formData, ministry: e.target.value})} />
                    </div>
                    <div>
                      <Label>Short Description</Label>
                      <Textarea value={formData.shortDescription || ''} onChange={e => setFormData({...formData, shortDescription: e.target.value})} rows={2} />
                    </div>
                    <div>
                      <Label>Full Description</Label>
                      <Textarea value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} />
                    </div>
                    <div>
                      <Label>Official Link</Label>
                      <Input value={formData.officialLink || ''} onChange={e => setFormData({...formData, officialLink: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Popularity Score</Label>
                        <Input type="number" value={formData.popularity || 0} onChange={e => setFormData({...formData, popularity: parseInt(e.target.value) || 0})} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Benefits (One per line)</Label>
                      <Textarea value={textAreas.benefits} onChange={e => setTextAreas({...textAreas, benefits: e.target.value})} rows={3} />
                    </div>
                    <div>
                      <Label>Required Documents (One per line)</Label>
                      <Textarea value={textAreas.requiredDocuments} onChange={e => setTextAreas({...textAreas, requiredDocuments: e.target.value})} rows={3} />
                    </div>
                    <div>
                      <Label>Application Steps (One per line)</Label>
                      <Textarea value={textAreas.applySteps} onChange={e => setTextAreas({...textAreas, applySteps: e.target.value})} rows={3} />
                    </div>
                    <div>
                      <Label>Applicable States (One per line, leave empty for all India)</Label>
                      <Textarea value={textAreas.applicableStates} onChange={e => setTextAreas({...textAreas, applicableStates: e.target.value})} rows={2} />
                    </div>
                    <div>
                      <Label>Tags (One per line)</Label>
                      <Textarea value={textAreas.tags} onChange={e => setTextAreas({...textAreas, tags: e.target.value})} rows={2} />
                    </div>
                    <div>
                      <Label>Eligibility Summary</Label>
                      <Textarea value={formData.eligibilitySummary || ''} onChange={e => setFormData({...formData, eligibilitySummary: e.target.value})} rows={2} />
                    </div>
                    <div>
                      <Label>Eligibility Rules (JSON Array)</Label>
                      <p className="text-xs text-muted-foreground mb-1">e.g. {`[{"field": "age", "operator": "gte", "value": 18, "label": "Adult"}]`}</p>
                      <Textarea className="font-mono text-xs" value={textAreas.eligibilityRules} onChange={e => setTextAreas({...textAreas, eligibilityRules: e.target.value})} rows={5} />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Scheme
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {schemesLoading ? (
          <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={32} /></div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Ministry</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchemes?.map((scheme) => (
                  <TableRow key={scheme.id}>
                    <TableCell className="font-medium">
                      {scheme.name}
                      {scheme.nameHindi && <span className="block text-xs text-muted-foreground">{scheme.nameHindi}</span>}
                    </TableCell>
                    <TableCell><CategoryBadge category={scheme.category} /></TableCell>
                    <TableCell className="text-muted-foreground text-sm">{scheme.ministry || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(scheme)}>
                          <Edit size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50" onClick={() => handleDelete(scheme.id)} disabled={deleteMutation.isPending}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSchemes?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No schemes found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}