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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { importProductsAction } from '@/actions/items';
import { toast } from 'sonner';
import ExcelJS from 'exceljs';
import {
  FileSpreadsheet,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  X,
  FileCheck,
} from 'lucide-react';

interface ParsedItem {
  name: string;
  sku?: string | null;
  category: string;
  unit: string;
  quantity: number;
  lowStockThreshold: number;
  price: number;
  costPrice?: number | null;
  expiryDate?: string | null;
  notes?: string | null;
  isValid: boolean;
  error?: string;
}

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function parseCSVText(text: string): Record<string, string>[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  // Determine delimiter: comma, semicolon, or tab
  const headerLine = lines[0];
  let delimiter = ',';
  if (headerLine.includes(';') && !headerLine.includes(',')) delimiter = ';';
  else if (headerLine.includes('\t')) delimiter = '\t';

  // Split headers
  const headers = headerLine.split(delimiter).map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase());

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const rawCols = lines[i].split(delimiter);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (rawCols[idx] || '').replace(/^["']|["']$/g, '').trim();
    });
    rows.push(row);
  }
  return rows;
}

function normalizeRow(row: Record<string, any>): ParsedItem {
  // Key alias lookups
  const findVal = (keys: string[]) => {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
        return String(row[k]).trim();
      }
    }
    return '';
  };

  const name = findVal(['name', 'product name', 'product_name', 'item', 'item name', 'product']);
  const sku = findVal(['sku', 'barcode', 'code', 'product_code']) || null;
  const category = findVal(['category', 'type', 'group']) || 'Uncategorized';
  const unit = findVal(['unit', 'uom']) || 'pcs';

  const rawQty = findVal(['quantity', 'qty', 'stock', 'starting quantity', 'count']);
  const quantity = rawQty ? Math.max(0, parseInt(rawQty, 10) || 0) : 0;

  const rawThreshold = findVal(['low stock threshold', 'threshold', 'low_stock_threshold', 'min stock', 'alert']);
  const lowStockThreshold = rawThreshold ? Math.max(0, parseInt(rawThreshold, 10) || 5) : 5;

  const rawPrice = findVal(['price', 'retail price', 'selling price', 'selling_price']);
  const price = rawPrice ? Math.max(0, parseFloat(rawPrice) || 0) : 0;

  const rawCost = findVal(['cost price', 'cost_price', 'cost', 'buy price']);
  const costPrice = rawCost ? Math.max(0, parseFloat(rawCost) || 0) : null;

  let expiryDate = findVal(['expiry date', 'expiry_date', 'expiration', 'expiry', 'exp date']) || null;
  // If Excel serial date or Date string, sanitize to YYYY-MM-DD
  if (expiryDate) {
    const parsedDate = new Date(expiryDate);
    if (!isNaN(parsedDate.getTime())) {
      expiryDate = parsedDate.toISOString().split('T')[0];
    } else {
      expiryDate = null;
    }
  }

  const notes = findVal(['notes', 'note', 'description']) || null;

  let isValid = true;
  let error = '';

  if (!name) {
    isValid = false;
    error = 'Missing product name';
  } else if (isNaN(quantity) || quantity < 0) {
    isValid = false;
    error = 'Quantity cannot be negative';
  }

  return {
    name,
    sku,
    category,
    unit,
    quantity,
    lowStockThreshold,
    price,
    costPrice,
    expiryDate,
    notes,
    isValid,
    error,
  };
}

export function ImportDialog({ open, onOpenChange, onSuccess }: ImportDialogProps) {
  const [items, setItems] = React.useState<ParsedItem[]>([]);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [parseError, setParseError] = React.useState<string | null>(null);
  const [isParsing, setIsParsing] = React.useState(false);
  const [isSubmitting, startTransition] = React.useTransition();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const resetState = () => {
    setItems([]);
    setFileName(null);
    setParseError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError(null);
    setIsParsing(true);
    setFileName(file.name);

    try {
      const isXlsx = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
      const isCsv = file.name.endsWith('.csv') || file.type.includes('csv');

      if (!isXlsx && !isCsv) {
        throw new Error('Please upload a valid .xlsx or .csv spreadsheet file.');
      }

      let parsedRows: Record<string, any>[] = [];

      if (isCsv) {
        const text = await file.text();
        parsedRows = parseCSVText(text);
      } else {
        // Parse XLSX via ExcelJS
        const buffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];

        if (!worksheet) {
          throw new Error('The uploaded Excel workbook contains no visible sheets.');
        }

        const headers: string[] = [];
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) {
            row.eachCell((cell) => {
              headers.push(String(cell.value || '').trim().toLowerCase());
            });
          } else {
            const rowData: Record<string, any> = {};
            row.eachCell((cell, colNumber) => {
              const headerKey = headers[colNumber - 1];
              if (headerKey) {
                // Check if date or object
                const val = cell.value;
                if (val instanceof Date) {
                  rowData[headerKey] = val.toISOString().split('T')[0];
                } else if (typeof val === 'object' && val !== null && 'result' in val) {
                  rowData[headerKey] = (val as any).result;
                } else {
                  rowData[headerKey] = val;
                }
              }
            });
            if (Object.keys(rowData).length > 0) {
              parsedRows.push(rowData);
            }
          }
        });
      }

      if (parsedRows.length === 0) {
        throw new Error('No product data rows found. Please check file structure and headers.');
      }

      const normalized = parsedRows.map(normalizeRow);
      setItems(normalized);
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Failed to parse file';
      setParseError(msg);
      toast.error(msg);
      setItems([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDownloadTemplate = async (format: 'csv' | 'xlsx') => {
    const headers = [
      'Product Name',
      'SKU',
      'Category',
      'Unit',
      'Starting Quantity',
      'Low Stock Threshold',
      'Selling Price',
      'Cost Price',
      'Expiry Date',
      'Notes',
    ];

    const sampleRows = [
      ['Organic Whole Milk 1L', 'MLK-001', 'Dairy & Eggs', 'bottles', 30, 5, 2.50, 1.80, '2026-11-15', 'Store in cold dairy shelf'],
      ['Sourdough Baguette 400g', 'BGD-002', 'Bakery', 'pcs', 15, 4, 1.95, 0.90, '2026-10-30', 'Fresh daily bake'],
      ['Arabica Coffee Beans 250g', 'COF-003', 'Beverages', 'bags', 50, 10, 8.50, 5.00, '2027-04-01', 'Medium roast Ethiopia'],
    ];

    if (format === 'csv') {
      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...sampleRows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'smart_inventory_products_template.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Downloaded CSV template');
    } else {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Products');
      sheet.addRow(headers);
      sampleRows.forEach((r) => sheet.addRow(r));

      // Style header row
      sheet.getRow(1).font = { bold: true };
      sheet.columns.forEach((col) => {
        col.width = 20;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'smart_inventory_products_template.xlsx';
      anchor.click();
      window.URL.revokeObjectURL(url);
      toast.success('Downloaded Excel template');
    }
  };

  const handleConfirmImport = () => {
    const validItems = items.filter((i) => i.isValid);
    if (validItems.length === 0) {
      toast.error('No valid products to import. Please review error highlights.');
      return;
    }

    startTransition(async () => {
      try {
        const payload = validItems.map((item) => ({
          name: item.name,
          sku: item.sku,
          category: item.category,
          unit: item.unit,
          quantity: item.quantity,
          lowStockThreshold: item.lowStockThreshold,
          price: item.price,
          costPrice: item.costPrice,
          expiryDate: item.expiryDate,
          notes: item.notes,
        }));

        const res = await importProductsAction({ items: payload });
        if (res.ok) {
          toast.success(`Successfully imported ${res.data.count} products into your inventory!`);
          onOpenChange(false);
          resetState();
          if (onSuccess) onSuccess();
        } else {
          toast.error(res.error.message || 'Failed to complete import');
        }
      } catch (err: unknown) {
        toast.error((err as Error)?.message || 'An error occurred during import');
      }
    });
  };

  const validCount = items.filter((i) => i.isValid).length;
  const invalidCount = items.length - validCount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Import Products (Excel & CSV)</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Bulk upload products from Microsoft Excel (.xlsx) or Comma Separated Values (.csv).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Download Templates Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20 gap-2.5">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground">Need a sample format?</span>
              <p className="text-[11px] text-muted-foreground">
                Download a pre-formatted template with all required columns.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDownloadTemplate('csv')}
                className="text-xs h-8 gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV Template</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDownloadTemplate('xlsx')}
                className="text-xs h-8 gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Excel Template</span>
              </Button>
            </div>
          </div>

          {/* Upload Drop Zone / Picker */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              items.length > 0
                ? 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500'
                : 'border-border/80 hover:border-primary/60 bg-muted/10'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv"
              onChange={handleFileChange}
              className="hidden"
            />

            {isParsing ? (
              <div className="space-y-2 py-4">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                <p className="text-xs font-medium text-muted-foreground">Parsing spreadsheet rows...</p>
              </div>
            ) : fileName ? (
              <div className="flex items-center justify-center gap-3">
                <FileCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                <div className="text-left">
                  <p className="text-xs font-semibold text-foreground truncate max-w-[320px]">{fileName}</p>
                  <p className="text-[11px] text-muted-foreground">Click to choose a different spreadsheet</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                <div>
                  <span className="text-xs font-semibold text-foreground">Click to browse spreadsheet file</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Supports Microsoft Excel (.xlsx) and standard .csv files
                  </p>
                </div>
              </div>
            )}
          </div>

          {parseError && (
            <Alert variant="destructive" className="py-2.5 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <AlertDescription className="text-xs">{parseError}</AlertDescription>
            </Alert>
          )}

          {/* Preview Table & Validation Breakdown */}
          {items.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Spreadsheet Preview
                  </span>
                  <Badge variant="outline" className="text-[11px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                    {validCount} ready to import
                  </Badge>
                  {invalidCount > 0 && (
                    <Badge variant="destructive" className="text-[11px]">
                      {invalidCount} invalid
                    </Badge>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="xs"
                  onClick={resetState}
                  className="text-xs text-muted-foreground hover:text-destructive h-7"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Clear
                </Button>
              </div>

              <div className="max-h-60 overflow-y-auto rounded-lg border border-border/60 bg-card divide-y divide-border/40 text-xs">
                {items.slice(0, 30).map((row, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 flex items-center justify-between gap-3 ${
                      !row.isValid ? 'bg-destructive/5' : 'hover:bg-muted/30'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground truncate">{row.name || 'Unnamed Product'}</span>
                        {row.sku && (
                          <span className="text-[10px] font-mono text-muted-foreground">({row.sku})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>Category: {row.category}</span>
                        <span>•</span>
                        <span>Qty: {row.quantity} {row.unit}</span>
                        <span>•</span>
                        <span>Price: ${row.price.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {row.isValid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Valid</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-destructive font-medium" title={row.error}>
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{row.error}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {items.length > 30 && (
                  <div className="p-2 text-center text-[11px] text-muted-foreground bg-muted/20">
                    Showing first 30 of {items.length} products
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              resetState();
            }}
            disabled={isSubmitting}
            className="text-xs h-9"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleConfirmImport}
            disabled={isSubmitting || validCount === 0}
            className="text-xs h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Importing Products...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Confirm Import ({validCount} Items)</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
