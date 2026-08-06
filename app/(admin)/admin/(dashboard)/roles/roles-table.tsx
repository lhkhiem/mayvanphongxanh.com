"use client"

import { useState } from "react"
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog"
import { Search, Plus, Edit2, Trash2, ShieldCheck, Users, CheckSquare, Square } from "lucide-react"
import { createRole, updateRole, deleteRole } from "./actions"
import { toast } from "sonner"
import { PERMISSIONS_BY_MODULE } from "@/lib/permissions"

export function RolesTable({ data, permissions }: { data: any[], permissions: any[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<any>(null)
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const filteredData = data.filter(r => 
    r.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openAdd = () => {
    // Default select non-system permissions
    const defaultIds = permissions.filter(p => p.module !== "SYSTEM").map(p => p.id)
    setSelectedPermIds(defaultIds)
    setIsAddOpen(true)
  }

  const openEdit = (role: any) => {
    setSelectedRole(role)
    if (role.name === "Admin") {
      setSelectedPermIds(permissions.map(p => p.id))
    } else {
      const assignedIds = role.permissions?.map((rp: any) => rp.permissionId) || []
      setSelectedPermIds(assignedIds)
    }
    setIsEditOpen(true)
  }

  const togglePerm = (id: string) => {
    setSelectedPermIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const toggleModule = (moduleKey: string) => {
    const modulePermIds = permissions
      .filter(p => p.module === moduleKey)
      .map(p => p.id)
    
    const allSelected = modulePermIds.every(id => selectedPermIds.includes(id))
    
    if (allSelected) {
      setSelectedPermIds(prev => prev.filter(id => !modulePermIds.includes(id)))
    } else {
      setSelectedPermIds(prev => Array.from(new Set([...prev, ...modulePermIds])))
    }
  }

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    selectedPermIds.forEach(id => formData.append("permissionIds", id))

    const res = await createRole(formData)
    
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Thêm nhóm quyền thành công!")
      setIsAddOpen(false)
    }
    setIsLoading(false)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedRole) return
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    selectedPermIds.forEach(id => formData.append("permissionIds", id))

    const res = await updateRole(selectedRole.id, formData)
    
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Cập nhật ma trận phân quyền thành công!")
      setIsEditOpen(false)
    }
    setIsLoading(false)
  }

  const handleDeleteSubmit = async () => {
    if (!selectedRole) return
    setIsLoading(true)
    const res = await deleteRole(selectedRole.id)
    
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Đã xóa nhóm quyền!")
      setIsDeleteOpen(false)
    }
    setIsLoading(false)
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Tìm nhóm quyền..." 
            className="pl-9"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button onClick={openAdd} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700" />}>
            <Plus className="mr-2 h-4 w-4" /> Thêm nhóm quyền mới
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Thêm Nhóm Quyền mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-6 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tên nhóm quyền</label>
                  <Input name="name" placeholder="Vd: Quản lý Kho" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mô tả chi tiết</label>
                  <Input name="description" placeholder="Vd: Quyền xem & điều chỉnh hàng hóa kho" />
                </div>
              </div>

              {/* Permission Matrix */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Ma Trận Tùy Chỉnh Quyền Hạn (Permissions)</h3>
                  <span className="text-xs text-indigo-600 font-medium">Đã chọn: {selectedPermIds.length}/{permissions.length} quyền</span>
                </div>

                <div className="space-y-6">
                  {Object.entries(PERMISSIONS_BY_MODULE).map(([moduleKey, moduleGroup]) => {
                    const modulePerms = permissions.filter(p => p.module === moduleKey)
                    const isAllModuleSelected = modulePerms.length > 0 && modulePerms.every(p => selectedPermIds.includes(p.id))

                    return (
                      <div key={moduleKey} className="border rounded-lg p-3 bg-gray-50/50 dark:bg-card">
                        <div className="flex items-center justify-between mb-3 border-b border-gray-200/60 pb-2">
                          <span className="font-semibold text-xs text-indigo-700 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldCheck className="h-4 w-4" /> {moduleGroup.moduleName}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleModule(moduleKey)}
                            className="text-xs text-gray-500 hover:text-indigo-600 font-medium flex items-center gap-1"
                          >
                            {isAllModuleSelected ? <CheckSquare className="h-3.5 w-3.5 text-indigo-600" /> : <Square className="h-3.5 w-3.5" />}
                            {isAllModuleSelected ? "Bỏ chọn tất cả" : "Chọn tất cả mô-đun"}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {modulePerms.map((perm) => {
                            const isChecked = selectedPermIds.includes(perm.id)
                            return (
                              <label
                                key={perm.id}
                                className={`flex items-start gap-2.5 p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                                  isChecked 
                                    ? "bg-indigo-50/80 border-indigo-200 text-indigo-950 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-100" 
                                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-card dark:border-border dark:text-gray-300"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => togglePerm(perm.id)}
                                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div>
                                  <div className="font-medium">{perm.name}</div>
                                  <div className="text-[11px] text-gray-500 dark:text-gray-400">{perm.code}</div>
                                </div>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Hủy</Button>
                <Button type="submit" disabled={isLoading} className="bg-indigo-600">{isLoading ? 'Đang lưu...' : 'Thêm nhóm mới'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead>Tên nhóm quyền</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="text-center">Số lượng quyền</TableHead>
              <TableHead className="text-center">Số lượng tài khoản</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Không tìm thấy nhóm quyền nào.
                </TableCell>
              </TableRow>
            ) : filteredData.map((role) => {
              const permCount = role.name === "Admin" ? permissions.length : (role.permissions?.length || 0)

              return (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className={`h-4 w-4 ${role.isSystem ? 'text-indigo-600' : 'text-gray-400'}`} />
                      <span className="font-medium text-gray-900 dark:text-gray-100">{role.name}</span>
                      {role.isSystem && (
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-sm font-semibold ml-1">SYSTEM</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500 max-w-[250px] truncate">
                    {role.description || "Không có mô tả"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {permCount}/{permissions.length} quyền
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      <Users className="h-3.5 w-3.5" />
                      {role._count?.users || 0}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(role)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {!role.isSystem && (
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedRole(role); setIsDeleteOpen(true) }} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cập nhật Phân Quyền — {selectedRole?.name}</DialogTitle>
          </DialogHeader>
          {selectedRole && (
            <form onSubmit={handleEditSubmit} className="space-y-6 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tên nhóm</label>
                  <Input name="name" defaultValue={selectedRole.name} disabled={selectedRole.isSystem} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mô tả</label>
                  <Input name="description" defaultValue={selectedRole.description || ""} />
                </div>
              </div>

              {/* Permission Matrix */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Ma Trận Quyền Hạn (Permission Matrix)</h3>
                  <span className="text-xs text-indigo-600 font-medium">Đã chọn: {selectedPermIds.length}/{permissions.length} quyền</span>
                </div>

                {selectedRole.name === "Admin" ? (
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900 text-sm">
                    <strong>Admin System Root:</strong> Nhóm quyền Admin có toàn quyền truy cập tất cả chức năng và cấu hình của hệ thống.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(PERMISSIONS_BY_MODULE).map(([moduleKey, moduleGroup]) => {
                      const modulePerms = permissions.filter(p => p.module === moduleKey)
                      const isAllModuleSelected = modulePerms.length > 0 && modulePerms.every(p => selectedPermIds.includes(p.id))

                      return (
                        <div key={moduleKey} className="border rounded-lg p-3 bg-gray-50/50 dark:bg-card">
                          <div className="flex items-center justify-between mb-3 border-b border-gray-200/60 pb-2">
                            <span className="font-semibold text-xs text-indigo-700 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                              <ShieldCheck className="h-4 w-4" /> {moduleGroup.moduleName}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleModule(moduleKey)}
                              className="text-xs text-gray-500 hover:text-indigo-600 font-medium flex items-center gap-1"
                            >
                              {isAllModuleSelected ? <CheckSquare className="h-3.5 w-3.5 text-indigo-600" /> : <Square className="h-3.5 w-3.5" />}
                              {isAllModuleSelected ? "Bỏ chọn tất cả" : "Chọn tất cả mô-đun"}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {modulePerms.map((perm) => {
                              const isChecked = selectedPermIds.includes(perm.id)
                              return (
                                <label
                                  key={perm.id}
                                  className={`flex items-start gap-2.5 p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                                    isChecked 
                                      ? "bg-indigo-50/80 border-indigo-200 text-indigo-950 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-100" 
                                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-card dark:border-border dark:text-gray-300"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => togglePerm(perm.id)}
                                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <div>
                                    <div className="font-medium">{perm.name}</div>
                                    <div className="text-[11px] text-gray-500 dark:text-gray-400">{perm.code}</div>
                                  </div>
                                </label>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Hủy</Button>
                <Button type="submit" disabled={isLoading} className="bg-indigo-600">{isLoading ? 'Đang lưu...' : 'Lưu ma trận phân quyền'}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa nhóm quyền</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Bạn có chắc chắn muốn xóa nhóm quyền <strong>{selectedRole?.name}</strong>?</p>
            {selectedRole?._count?.users > 0 && (
              <p className="text-red-600 text-sm mt-2 font-medium">
                Cảnh báo: Đang có {selectedRole._count.users} tài khoản thuộc nhóm này. Hãy chuyển quyền cho họ trước khi xóa.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>Hủy</Button>
            <Button type="button" variant="destructive" onClick={handleDeleteSubmit} disabled={isLoading || selectedRole?._count?.users > 0}>
              {isLoading ? 'Đang xử lý...' : 'Xóa nhóm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

