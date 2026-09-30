'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SupplierDialog } from '@/components/suppliers/supplier-dialog';
import { deleteSupplierAction } from '@/actions/suppliers';
import { toast } from 'sonner';
import {
  Truck,
  PlusCircle,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Phone,
  Mail,
  User,
  Package,
} from 'lucide-react';

interface SupplierItem {
  id: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  items?: { count: number }[];
}

interface SuppliersViewProps {
  suppliers: SupplierItem[];
}

export function SuppliersView({ suppliers }: SuppliersViewProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingSupplier, setEditingSupplier] = React.useState<SupplierItem | null>(null);

  const filteredSuppliers = suppliers.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      (s.contact_name && s.contact_name.toLowerCase().includes(term)) ||
      (s.email && s.email.toLowerCase().includes(term))
    );
  });

  const handleDelete = async (supplier: SupplierItem) => {
    const itemCount = supplier.items?.[0]?.count || 0;
    if (itemCount > 0) {
      if (
        !confirm(
          `"${supplier.name}" is currently associated with ${itemCount} inventory item(s). Deleting will remove this association. Continue?`
        )
      ) {
        return;
      }
    } else {
      if (!confirm(`Are you sure you want to delete supplier "${supplier.name}"?`)) {
        return;
      }
    }

    const res = await deleteSupplierAction({ id: supplier.id });
    if (!res.ok) {
      toast.error(res.error.message);
    } else {
      toast.success(`Deleted supplier "${supplier.name}"`);
      router.refresh();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Suppliers Directory
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your vendors, wholesale distributors, and reorder contacts.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingSupplier(null);
            setDialogOpen(true);
          }}
          className="gap-1.5 font-semibold shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Supplier</span>
        </Button>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Desktop Table (>640px) */}
      <div className="hidden sm:block rounded-lg border bg-card shadow-xs overflow-hidden">
        {filteredSuppliers.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-muted-foreground space-y-2 p-6 text-center">
            <Truck className="w-8 h-8 opacity-30" />
            <p className="text-base font-medium">No suppliers found</p>
            <p className="text-xs">
              {searchTerm ? 'Try a different search query.' : 'Add your first supplier to link with inventory items.'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[30%]">Supplier / Company</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Linked Items</TableHead>
                <TableHead>Notes & Terms</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => {
                const itemCount = supplier.items?.[0]?.count || 0;
                return (
                  <TableRow key={supplier.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div className="font-semibold text-foreground text-sm">{supplier.name}</div>
                    </TableCell>
                    <TableCell>
                      {supplier.contact_name ? (
                        <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{supplier.contact_name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs">
                        {supplier.email && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
                            <a href={`mailto:${supplier.email}`} className="hover:underline truncate max-w-[180px]">
                              {supplier.email}
                            </a>
                          </div>
                        )}
                        {supplier.phone && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span>{supplier.phone}</span>
                          </div>
                        )}
                        {!supplier.email && !supplier.phone && (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1 font-mono text-xs">
                        <Package className="w-3 h-3" />
                        {itemCount}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground line-clamp-2 max-w-[200px]">
                        {supplier.notes || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Supplier Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingSupplier(supplier);
                              setDialogOpen(true);
                            }}
                            className="cursor-pointer"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            <span>Edit Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(supplier)}
                            className="text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            <span>Delete Supplier</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Mobile Cards (<640px) */}
      <div className="sm:hidden space-y-3">
        {filteredSuppliers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground text-sm">
              No suppliers found.
            </CardContent>
          </Card>
        ) : (
          filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-base text-foreground">{supplier.name}</h4>
                  {supplier.contact_name && (
                    <p className="text-xs text-muted-foreground mt-0.5">{supplier.contact_name}</p>
                  )}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {supplier.items?.[0]?.count || 0} items
                </Badge>
              </div>

              <div className="text-xs space-y-1 text-muted-foreground border-y py-2">
                {supplier.email && <p>Email: {supplier.email}</p>}
                {supplier.phone && <p>Phone: {supplier.phone}</p>}
                {supplier.notes && <p className="italic">{supplier.notes}</p>}
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => {
                    setEditingSupplier(supplier);
                    setDialogOpen(true);
                  }}
                >
                  <Edit className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs text-destructive hover:text-destructive"
                  onClick={() => handleDelete(supplier)}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create / Edit Dialog */}
      <SupplierDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        supplier={editingSupplier}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
