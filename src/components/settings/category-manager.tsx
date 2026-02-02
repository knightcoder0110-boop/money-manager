"use client";

import { useState } from "react";
import type { CategoryWithSubs } from "@/types";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  deleteSubcategory,
} from "@/actions/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CategoryManagerProps {
  categories: CategoryWithSubs[];
}

export default function CategoryManager({ categories }: CategoryManagerProps) {
  const router = useRouter();
  const [editCategory, setEditCategory] = useState<CategoryWithSubs | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CategoryWithSubs | null>(null);
  const [loading, setLoading] = useState(false);

  // Create form state
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");
  const [newColor, setNewColor] = useState("#3B82F6");
  const [newEssential, setNewEssential] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editEssential, setEditEssential] = useState(false);

  // Subcategory form
  const [newSubName, setNewSubName] = useState("");
  const [addSubForCategory, setAddSubForCategory] = useState<string | null>(null);

  function openEdit(cat: CategoryWithSubs) {
    setEditCategory(cat);
    setEditName(cat.name);
    setEditIcon(cat.icon);
    setEditColor(cat.color);
    setEditEssential(cat.is_essential);
  }

  async function handleCreate() {
    if (!newName.trim()) {
      toast.error("Name is required");
      return;
    }
    setLoading(true);
    try {
      const result = await createCategory({
        name: newName.trim(),
        icon: newIcon || undefined,
        color: newColor || undefined,
        is_essential: newEssential,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Category created");
        setShowCreate(false);
        setNewName("");
        setNewIcon("");
        setNewColor("#3B82F6");
        setNewEssential(false);
        router.refresh();
      }
    } catch {
      toast.error("Failed to create category");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate() {
    if (!editCategory || !editName.trim()) return;
    setLoading(true);
    try {
      const result = await updateCategory(editCategory.id, {
        name: editName.trim(),
        icon: editIcon,
        color: editColor,
        is_essential: editEssential,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Category updated");
        setEditCategory(null);
        router.refresh();
      }
    } catch {
      toast.error("Failed to update category");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const result = await deleteCategory(deleteTarget.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Category deleted");
        setDeleteTarget(null);
        router.refresh();
      }
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddSubcategory(categoryId: string) {
    if (!newSubName.trim()) return;
    setLoading(true);
    try {
      const result = await createSubcategory({
        category_id: categoryId,
        name: newSubName.trim(),
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Subcategory added");
        setNewSubName("");
        setAddSubForCategory(null);
        router.refresh();
      }
    } catch {
      toast.error("Failed to add subcategory");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteSubcategory(subId: string) {
    try {
      const result = await deleteSubcategory(subId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Subcategory removed");
        router.refresh();
      }
    } catch {
      toast.error("Failed to delete subcategory");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Categories</h2>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Category List */}
      <div className="space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="border border-border rounded-xl p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-lg">{cat.icon}</span>
                <span className="font-medium">{cat.name}</span>
                {cat.is_essential && (
                  <Badge variant="secondary" className="text-xs">Essential</Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(cat)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>

            {/* Subcategories */}
            {cat.subcategories.length > 0 && (
              <div className="flex flex-wrap gap-1 pl-6">
                {cat.subcategories.map((sub) => (
                  <Badge key={sub.id} variant="outline" className="text-xs gap-1">
                    {sub.name}
                    <button
                      onClick={() => handleDeleteSubcategory(sub.id)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Add subcategory */}
            {addSubForCategory === cat.id ? (
              <div className="flex items-center gap-2 pl-6">
                <Input
                  placeholder="Subcategory name"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="h-8 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddSubcategory(cat.id);
                  }}
                />
                <Button size="sm" className="h-8" onClick={() => handleAddSubcategory(cat.id)} disabled={loading}>
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8"
                  onClick={() => {
                    setAddSubForCategory(null);
                    setNewSubName("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <button
                className="text-xs text-muted-foreground hover:text-foreground pl-6"
                onClick={() => setAddSubForCategory(cat.id)}
              >
                + Add subcategory
              </button>
            )}
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">
          No categories yet. Create your first one!
        </p>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Food" />
            </div>
            <div className="space-y-2">
              <Label>Icon (emoji)</Label>
              <Input value={newIcon} onChange={(e) => setNewIcon(e.target.value)} placeholder="e.g. 🍔" />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-10 h-10 rounded border-0 cursor-pointer"
                />
                <Input value={newColor} onChange={(e) => setNewColor(e.target.value)} className="flex-1" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="new-essential"
                checked={newEssential}
                onChange={(e) => setNewEssential(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="new-essential">Essential category</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editCategory} onOpenChange={(open) => !open && setEditCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Icon (emoji)</Label>
              <Input value={editIcon} onChange={(e) => setEditIcon(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="w-10 h-10 rounded border-0 cursor-pointer"
                />
                <Input value={editColor} onChange={(e) => setEditColor(e.target.value)} className="flex-1" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-essential"
                checked={editEssential}
                onChange={(e) => setEditEssential(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="edit-essential">Essential category</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditCategory(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              This will remove the category and all subcategories. Transactions will not be deleted but will lose their category. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
