# Table Grab

> **ID:** `table-grab`
> **Tier:** 2
> **Token Cost:** 6000
> **MCP Connections:** context7

## 🎯 What This Skill Does

Extracts data table designs from screenshots and converts them to fully-featured TanStack Table (React Table) components with sorting, filtering, pagination, and responsive layouts.

- Data table screenshot to TanStack Table implementation
- Column type inference with proper formatters and renderers
- Sorting and filtering generation with multiple filter types
- Pagination setup with server-side and client-side options

## 📚 When to Use

This skill is automatically loaded when:

- **Keywords:** table, data grid, grab table, spreadsheet, datagrid
- **File Types:** N/A
- **Directories:** components/tables, components/data

## 🚀 Core Capabilities

### 1. Data Table to TanStack Table

Transform table designs into feature-rich TanStack Table implementations.

**Best Practices:**
- Use TanStack Table v8 for modern React
- Define column definitions with proper typing
- Implement proper table accessibility (ARIA)
- Use memoization for large datasets
- Support both controlled and uncontrolled modes
- Handle loading and empty states

**Common Patterns:**

```typescript
// Complete TanStack Table setup
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search...',
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      {searchKey && (
        <div className="flex items-center">
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
            onChange={(e) =>
              table.getColumn(searchKey)?.setFilterValue(e.target.value)
            }
            className="max-w-sm"
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

**UI Table Components (shadcn/ui):**

```typescript
// components/ui/table.tsx
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

export const Table = forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn('w-full caption-bottom text-sm', className)}
      {...props}
    />
  </div>
));
Table.displayName = 'Table';

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

export const TableRow = forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
      className
    )}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

export const TableHead = forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

export const TableCell = forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}
    {...props}
  />
));
TableCell.displayName = 'TableCell';
```

**Gotchas:**
- Memoize columns array to prevent unnecessary re-renders
- Use column sizing for proper responsive behavior
- Handle undefined/null data gracefully
- Test with large datasets (1000+ rows)

### 2. Column Type Inference

Create properly typed columns with appropriate renderers and formatters.

**Best Practices:**
- Define explicit column types
- Use accessorKey or accessorFn consistently
- Implement custom cell renderers for complex data
- Add proper sorting functions for custom types
- Format dates, currency, and numbers consistently
- Support column visibility toggling

**Common Patterns:**

```typescript
// Column definitions with various types
import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'pending';
  role: string;
  createdAt: Date;
  balance: number;
}

export const userColumns: ColumnDef<User>[] = [
  // Selection column
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // User with avatar
  {
    accessorKey: 'name',
    header: 'User',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      );
    },
  },

  // Status badge
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as User['status'];
      const variants: Record<User['status'], 'default' | 'secondary' | 'destructive'> = {
        active: 'default',
        inactive: 'secondary',
        pending: 'destructive',
      };
      return (
        <Badge variant={variants[status]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },

  // Currency column
  {
    accessorKey: 'balance',
    header: () => <div className="text-right">Balance</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('balance'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
    sortingFn: 'alphanumeric',
  },

  // Date column
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date;
      return format(date, 'MMM d, yyyy');
    },
    sortingFn: 'datetime',
  },

  // Sortable header helper
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Role
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
];
```

**Column Visibility Toggle:**

```typescript
// Column visibility dropdown
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings2 } from 'lucide-react';

export function ColumnVisibilityToggle({ table }: { table: Table<any> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="mr-2 h-4 w-4" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {column.id}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**Gotchas:**
- Use accessorFn for computed/nested values
- Define sortingFn for custom data types
- Handle null/undefined in cell renderers
- Test column widths with various content lengths

### 3. Sorting and Filtering Generation

Implement comprehensive sorting and filtering with multiple filter types.

**Best Practices:**
- Support multi-column sorting
- Implement faceted filters for categories
- Add debounced text search
- Use filter functions for complex logic
- Show active filter indicators
- Provide filter reset functionality

**Common Patterns:**

```typescript
// Faceted filter component
import { Column } from '@tanstack/react-table';
import { CheckIcon, PlusCircle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface FacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: { label: string; value: string; icon?: React.ComponentType }[];
}

export function FacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: FacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues();
  const selectedValues = new Set(column?.getFilterValue() as string[]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="mr-2 h-4 w-4" />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge key={option.value} variant="secondary" className="rounded-sm px-1 font-normal">
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option.value);
                      } else {
                        selectedValues.add(option.value);
                      }
                      const filterValues = Array.from(selectedValues);
                      column?.setFilterValue(
                        filterValues.length ? filterValues : undefined
                      );
                    }}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </div>
                    {option.icon && <option.icon className="mr-2 h-4 w-4" />}
                    <span>{option.label}</span>
                    {facets?.get(option.value) && (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                        {facets.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

**Global Filter with Debounce:**

```typescript
// Debounced global filter
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

interface GlobalFilterProps {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
}

export function GlobalFilter({ globalFilter, setGlobalFilter }: GlobalFilterProps) {
  const [value, setValue] = useState(globalFilter);
  const debouncedValue = useDebounce(value, 300);

  useEffect(() => {
    setGlobalFilter(debouncedValue);
  }, [debouncedValue, setGlobalFilter]);

  return (
    <Input
      placeholder="Search all columns..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="max-w-sm"
    />
  );
}

// useDebounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

**Gotchas:**
- Enable faceted filters only when needed (performance)
- Debounce text filters for better UX
- Clear filters when data changes
- Test filter combinations for edge cases

### 4. Pagination Setup

Implement flexible pagination for both client-side and server-side scenarios.

**Best Practices:**
- Support page size selection
- Show current page and total count
- Implement server-side pagination for large datasets
- Add keyboard navigation support
- Handle edge cases (empty data, single page)
- Consider infinite scroll alternative

**Common Patterns:**

```typescript
// Pagination component with page size selector
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Table } from '@tanstack/react-table';

interface PaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
}

export function Pagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 50, 100],
}: PaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{' '}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

**Server-Side Pagination:**

```typescript
// Server-side pagination with TanStack Table
interface ServerPaginatedTableProps<TData> {
  columns: ColumnDef<TData>[];
  fetchData: (options: { pageIndex: number; pageSize: number }) => Promise<{
    data: TData[];
    pageCount: number;
  }>;
}

export function ServerPaginatedTable<TData>({
  columns,
  fetchData,
}: ServerPaginatedTableProps<TData>) {
  const [data, setData] = useState<TData[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const pagination = useMemo(
    () => ({ pageIndex, pageSize }),
    [pageIndex, pageSize]
  );

  useEffect(() => {
    setIsLoading(true);
    fetchData({ pageIndex, pageSize })
      .then(({ data, pageCount }) => {
        setData(data);
        setPageCount(pageCount);
      })
      .finally(() => setIsLoading(false));
  }, [pageIndex, pageSize, fetchData]);

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div>
      {isLoading && <LoadingOverlay />}
      {/* Table and pagination */}
    </div>
  );
}
```

**Gotchas:**
- Reset to first page when filters change
- Handle loading states during page changes
- Consider prefetching next page
- Test with edge cases (0 results, 1 page)

## 💡 Real-World Examples

### Example 1: User Management Table

```typescript
// Complete user management table
const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Pending', value: 'pending' },
];

export function UserManagementTable({ users }: { users: User[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Users</h2>
        <Button>Add User</Button>
      </div>

      <DataTable
        columns={userColumns}
        data={users}
        searchKey="name"
        searchPlaceholder="Search users..."
        toolbar={({ table }) => (
          <div className="flex items-center gap-2">
            <FacetedFilter
              column={table.getColumn('status')}
              title="Status"
              options={statusOptions}
            />
            <ColumnVisibilityToggle table={table} />
          </div>
        )}
      />
    </div>
  );
}
```

### Example 2: Orders Table with Actions

```typescript
// Orders table with row actions
const orderColumns: ColumnDef<Order>[] = [
  // ... other columns
  {
    id: 'actions',
    cell: ({ row }) => {
      const order = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(order.id)}>
              Copy order ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit order</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Cancel order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
```

## 🔗 Related Skills

- `react-grab` - Base React component patterns
- `form-grab` - Form components for editing
- `modal-grab` - Modals for row details/editing
- `pagination-patterns` - Advanced pagination

## 📖 Further Reading

- [TanStack Table Docs](https://tanstack.com/table/latest)
- [shadcn/ui Data Table](https://ui.shadcn.com/docs/components/data-table)
- [React Table Examples](https://tanstack.com/table/latest/docs/framework/react/examples/basic)
- [Accessible Tables (WAI)](https://www.w3.org/WAI/tutorials/tables/)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
