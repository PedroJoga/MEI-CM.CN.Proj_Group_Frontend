"use client"

import * as React from "react"
import { useState } from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { z } from "zod"
import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { api } from "@/services/api"

export const schema = z.object({
  id: z.number(),
  name: z.string(),
  subDomain: z.string(),
  dockerImage: z.string(),
  exposedPort: z.number(),
  status: z.string(),
})

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

const columns = (handleDelete: (id: number) => void, updateDataItem: (item: z.infer<typeof schema>) => void): ColumnDef<z.infer<typeof schema>>[] => [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} updateDataItem={updateDataItem} />
    },
    enableHiding: false,
  },
  {
    accessorKey: "subDomain",
    header: "Sub Domain",
    cell: ({ row }) => (
      <Label>
        {row.original.subDomain}
      </Label>
    ),
  },
  {
    accessorKey: "dockerImage",
    header: "Docker Image",
    cell: ({ row }) => (
      <Label>
        {row.original.dockerImage}
      </Label>
    ),
  },
  {
    accessorKey: "exposedPort",
    header: "Exposed Port",
    cell: ({ row }) => (
      <Label>
        {row.original.exposedPort}
      </Label>
    ),
  }, 
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.status === "Done" ? (
          <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
        ) : (
          <IconLoader />
        )}
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>Start</DropdownMenuItem>
          <DropdownMenuItem>Shutdown</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleDelete(row.original.id)} variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable({
  data: initialData
}: {
  data: z.infer<typeof schema>[]
}) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/containers/${id}`);
      // Update local state to remove the deleted item
      setData(data.filter(item => item.id !== id));
      // Optionally show a success message
    } catch (error) {
      console.error('Failed to delete item:', error);
      // Optionally show an error message
    }
  }

  const updateDataItem = (updatedItem: z.infer<typeof schema>) => {
    setData(currentData => 
      currentData.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      )
    );
  }

  const createNewContainer = async (newContainer: Omit<z.infer<typeof schema>, 'id'>) => {
    try {
      const response = await api.post('/containers', newContainer);
      const createdContainer = response.data;
      
      // Add the new container to your local state
      setData(currentData => [...currentData, createdContainer]);
      
      return createdContainer;
    } catch (error) {
      console.error('Failed to create container:', error);
      throw error;
    }
  };

  const table = useReactTable({
    data,
    columns: columns(handleDelete, updateDataItem),
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <Tabs
      defaultValue="applications"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Select defaultValue="applications">
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="applications">Applications</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <CreateContainerDrawer onCreate={createNewContainer} />
        </div>
      </div>
      <TabsContent
        value="applications"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
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
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}

function TableCellViewer({ item, updateDataItem }: { item: z.infer<typeof schema>, updateDataItem?: (item: z.infer<typeof schema>) => void}) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);
  const [formData, setFormData] = React.useState(item);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Environment variables state
  const [envVars, setEnvVars] = useState<{id: string, key: string, value: string}[]>([]);
  const [newEnvVar, setNewEnvVar] = useState({key: '', value: ''});
  const [editingEnvVar, setEditingEnvVar] = useState<string | null>(null);

  // Fetch environment variables when drawer opens
  React.useEffect(() => {
    if (isOpen) {
      fetchEnvVars();
    }
  }, [isOpen]);

  const fetchEnvVars = async () => {
    try {
      const response = await api.get(`/environmentvariables/container/${item.id}`);
      setEnvVars(response.data);
    } catch (err) {
      setError("Failed to load environment variables. " + err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: id === "exposedPort" ? Number(value) : value
    }));
  };

  const handleEnvVarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEnvVar(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEnvVar = async () => {
    if (!newEnvVar.key || !newEnvVar.value) return;
    
    try {
      setLoading(true);
      await api.post(`/environmentvariables/container/${item.id}`, newEnvVar);
      await fetchEnvVars();
      setNewEnvVar({key: '', value: ''});
    } catch (err) {
      setError("Failed to add environment variable. " + err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEnvVar = async (id: string, updatedVar: {key: string, value: string}) => {
    try {
      setLoading(true);
      await api.put(`/environmentvariables/${id}`, updatedVar);
      await fetchEnvVars();
      setEditingEnvVar(null);
    } catch (err) {
      setError("Failed to update environment variable. " + err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEnvVar = async (id: string) => {
    try {
      setLoading(true);
      await api.delete(`/environmentvariables/${id}`);
      await fetchEnvVars();
    } catch (err) {
      setError("Failed to delete environment variable. " + err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await api.put(`/containers/${item.id}`, formData);
      const updatedItem = response.data;

      if (updateDataItem) {
        updateDataItem(updatedItem);
      }

      setSuccess(true);
      setIsOpen(false);
    } catch (err) {
      setError("Erro ao salvar container." + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.name}</DrawerTitle>
          <DrawerDescription>
            Container configuration and environment variables
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <Tabs defaultValue="configuration">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="environment">Environment Variables</TabsTrigger>
            </TabsList>
            
            <TabsContent value="configuration">
              <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={formData.name} onChange={handleChange} />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="subDomain">Sub domain</Label>
                  <Input id="subDomain" value={formData.subDomain} onChange={handleChange} />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="dockerImage">Docker image</Label>
                  <Input id="dockerImage" value={formData.dockerImage} onChange={handleChange} />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="exposedPort">Exposed port</Label>
                  <Input 
                    id="exposedPort" 
                    type="number"
                    value={formData.exposedPort} 
                    onChange={handleChange} 
                  />
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="environment">
              <div className="space-y-4">
                <div className="flex flex-col gap-3">
                  <Label>Add New Environment Variable</Label>
                  <div className="flex gap-2">
                    <Input
                      name="key"
                      placeholder="Key"
                      value={newEnvVar.key}
                      onChange={handleEnvVarChange}
                    />
                    <Input
                      name="value"
                      placeholder="Value"
                      value={newEnvVar.value}
                      onChange={handleEnvVarChange}
                    />
                    <Button 
                      onClick={handleAddEnvVar} 
                      disabled={!newEnvVar.key || !newEnvVar.value || loading}
                    >
                      Add
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Environment Variables</Label>
                  {envVars.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No environment variables</p>
                  ) : (
                    <div className="rounded-lg border">
                      {envVars.map((envVar) => (
                        <div key={envVar.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                          {editingEnvVar === envVar.id ? (
                            <div className="flex flex-1 gap-2">
                              <Input
                                name="key"
                                value={newEnvVar.key}
                                onChange={handleEnvVarChange}
                              />
                              <Input
                                name="value"
                                value={newEnvVar.value}
                                onChange={handleEnvVarChange}
                              />
                              <Button 
                                size="sm" 
                                onClick={() => handleEditEnvVar(envVar.id, newEnvVar)}
                              >
                                Save
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setEditingEnvVar(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1">
                                <span className="font-medium">{envVar.key}</span>=<span>{envVar.value}</span>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setEditingEnvVar(envVar.id);
                                    setNewEnvVar({key: envVar.key, value: envVar.value});
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDeleteEnvVar(envVar.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-500">Salvo com sucesso!</p>}
        </div>
        <DrawerFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Configuration"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function CreateContainerDrawer({ onCreate }: { onCreate: (container: Omit<z.infer<typeof schema>, 'id'>) => Promise<z.infer<typeof schema>>  }) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<Omit<z.infer<typeof schema>, 'id'>>({
    name: '',
    subDomain: '',
    dockerImage: '',
    exposedPort: 0,
    status: 'Pending' // Default status
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: id === "exposedPort" ? Number(value) : value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      await onCreate(formData);
      setIsOpen(false);
      // Reset form
      setFormData({
        name: '',
        subDomain: '',
        dockerImage: '',
        exposedPort: 0,
        status: 'Pending'
      });
    } catch (err) {
      setError("Failed to create container. Please try again." + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <IconPlus />
          <span className="hidden lg:inline">New Application</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Create New Container</DrawerTitle>
          <DrawerDescription>
            Fill in the details for your new application container
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col gap-3">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="My Application" 
                required 
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="subDomain">Sub domain</Label>
              <Input 
                id="subDomain" 
                value={formData.subDomain} 
                onChange={handleChange} 
                placeholder="myapp" 
                required 
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="dockerImage">Docker image</Label>
              <Input 
                id="dockerImage" 
                value={formData.dockerImage} 
                onChange={handleChange} 
                placeholder="nginx:latest" 
                required 
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="exposedPort">Exposed port</Label>
              <Input 
                id="exposedPort" 
                type="number"
                value={formData.exposedPort} 
                onChange={handleChange} 
                placeholder="8080" 
                required 
              />
            </div>
          </form>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <DrawerFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Container"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
