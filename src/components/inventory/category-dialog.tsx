'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { createCategoryAction, deleteCategoryAction } from '@/actions/categories';
import { toast } from 'sonner';
import {
  Tag,
  Plus,
  Trash2,
  Loader2,
  FolderPlus,
  Sparkles,
} from 'lucide-react';

const SUGGESTED_CATEGORIES = [
  'Bakery',
  'Beverages',
  'Dairy & Eggs',
  'Fresh Produce',
  'Meat & Seafood',
  'Snacks & Candy',
  'Canned Goods',
  'Household Supplies',
  'Personal Care',
  'Frozen Foods',
];

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  onCategoriesChange?: (updatedCategories: string[]) => void;
}

export function CategoryDialog({
  open,
  onOpenChange,
  categories: initialCategories,
  onCategoriesChange,
}: CategoryDialogProps) {
  const [categories, setCategories] = React.useState<string[]>(initialCategories);
  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [isPending, startTransition] = React.useTransition();
  const [deletingName, setDeletingName] = React.useState<string | null>(null);

  React.useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const handleAddCategory = (nameToAdd?: string) => {
    const targetName = (nameToAdd || newCategoryName).trim();
    if (!targetName) {
      toast.error('Category name cannot be empty');
      return;
    }

    if (categories.some((c) => c.toLowerCase() === targetName.toLowerCase())) {
      toast.info(`Category "${targetName}" already exists`);
      setNewCategoryName('');
      return;
    }

    startTransition(async () => {
      const res = await createCategoryAction({ name: targetName });
      if (res.ok) {
        const updated = [...categories, targetName].sort((a, b) => a.localeCompare(b));
        setCategories(updated);
        setNewCategoryName('');
        if (onCategoriesChange) onCategoriesChange(updated);
        toast.success(`Created category "${targetName}"`);
      } else {
        toast.error(res.error.message || 'Failed to create category');
      }
    });
  };

  const handleDeleteCategory = (catName: string) => {
    setDeletingName(catName);
    startTransition(async () => {
      const res = await deleteCategoryAction({ name: catName });
      if (res.ok) {
        const updated = categories.filter((c) => c !== catName);
        setCategories(updated);
        if (onCategoriesChange) onCategoriesChange(updated);
        toast.success(`Removed category "${catName}"`);
      } else {
        toast.error(res.error.message || 'Failed to remove category');
      }
      setDeletingName(null);
    });
  };

  const unusedSuggestions = SUGGESTED_CATEGORIES.filter(
    (s) => !categories.some((c) => c.toLowerCase() === s.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            <span>Manage Product Categories</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Create and organize categories for easier product filtering and restock management.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Create New Category Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddCategory();
            }}
            className="flex gap-2"
          >
            <div className="flex-1 space-y-1">
              <Label htmlFor="new-cat-input" className="sr-only">
                Category Name
              </Label>
              <Input
                id="new-cat-input"
                placeholder="e.g. Organic Produce, Cold Drinks"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                disabled={isPending}
                className="h-9 text-xs sm:text-sm rounded-lg"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || !newCategoryName.trim()}
              className="h-9 text-xs gap-1.5 shrink-0"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              <span>Add</span>
            </Button>
          </form>

          {/* Quick Add Suggestions */}
          {unusedSuggestions.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Quick Add Common Categories:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {unusedSuggestions.slice(0, 6).map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => handleAddCategory(sug)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border border-border/80 bg-muted/40 hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-colors cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>{sug}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Existing Categories List */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Existing Store Categories ({categories.length})
            </Label>

            {categories.length === 0 ? (
              <div className="p-6 text-center rounded-lg border border-dashed border-border/60 bg-muted/10 text-muted-foreground text-xs space-y-1">
                <FolderPlus className="w-6 h-6 mx-auto text-muted-foreground/60" />
                <p>No categories created yet.</p>
                <p className="text-[11px]">Type a name above or click any suggested category.</p>
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 divide-y divide-border/30 rounded-lg border border-border/60 bg-card p-2">
                {categories.map((cat) => (
                  <div
                    key={cat}
                    className="flex items-center justify-between py-1.5 px-2 hover:bg-muted/40 rounded transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary/60 shrink-0" />
                      <span className="text-xs font-medium text-foreground">{cat}</span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCategory(cat)}
                      disabled={isPending && deletingName === cat}
                      className="w-6 h-6 text-muted-foreground hover:text-destructive opacity-80 group-hover:opacity-100 transition-opacity"
                      title={`Delete "${cat}"`}
                    >
                      {isPending && deletingName === cat ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-border/40">
          <Button
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
