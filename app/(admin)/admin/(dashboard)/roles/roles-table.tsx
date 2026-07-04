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
import { Search, Plus, Edit2, Trash2, ShieldCheck, Users } from "lucide-react"
import { createRole, updateRole, deleteRole } from "./actions"
import { toast } from "sonner"

export function RolesTable({ data }: { data: any[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const filteredData = data.filter(r => 
    r.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
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
    const res = await updateRole(selectedRole.id, formData)
    
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Cập nhật thành công!")
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
          <DialogTrigger render={<Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700" />}>
            <Plus className="mr-2 h-4 w-4" /> Thêm nhóm
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm Nhóm Quyền mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên nhóm</label>
                <Input name="name" placeholder="Vd: Quản lý Kho" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mô tả chi tiết</label>
                <Textarea name="description" placeholder="Vd: Được phép thêm sửa xóa sản phẩm" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Hủy</Button>
                <Button type="submit" disabled={isLoading} className="bg-indigo-600">{isLoading ? 'Đang lưu...' : 'Thêm mới'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead>Tên nhóm quyền</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="text-center">Số lượng tài khoản</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  Không tìm thấy nhóm quyền nào.
                </TableCell>
              </TableRow>
            ) : filteredData.map((role) => (
              <TableRow key={role.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={`h-4 w-4 ${role.isSystem ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <span className="font-medium text-gray-900 dark:text-gray-100">{role.name}</span>
                    {role.isSystem && (
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-sm font-semibold ml-2">SYSTEM</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-gray-500 max-w-[300px] truncate">
                  {role.description || "Không có mô tả"}
                </TableCell>
                <TableCell className="text-center">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    <Users className="h-3.5 w-3.5" />
                    {role._count?.users || 0}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedRole(role); setIsEditOpen(true) }} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
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
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật Nhóm Quyền</DialogTitle>
          </DialogHeader>
          {selectedRole && (
            <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên nhóm</label>
                <Input name="name" defaultValue={selectedRole.name} disabled={selectedRole.isSystem} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mô tả</label>
                <Textarea name="description" defaultValue={selectedRole.description || ""} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Hủy</Button>
                <Button type="submit" disabled={isLoading} className="bg-indigo-600">{isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
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
