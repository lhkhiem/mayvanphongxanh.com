"use client"

import { useState } from "react"
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose 
} from "@/components/ui/dialog"
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select"
import { Search, Plus, Edit2, Trash2, Mail, User, Shield } from "lucide-react"
import { createStaff, updateStaff, deleteStaff } from "./actions"
import { toast } from "sonner"

export function StaffTable({ data, roles }: { data: any[], roles: any[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const filteredData = data.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await createStaff(formData)
    
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Thêm quản trị viên thành công!")
      setIsAddOpen(false)
    }
    setIsLoading(false)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedStaff) return
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await updateStaff(selectedStaff.id, formData)
    
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Cập nhật thông tin thành công!")
      setIsEditOpen(false)
    }
    setIsLoading(false)
  }

  const handleDeleteSubmit = async () => {
    if (!selectedStaff) return
    setIsLoading(true)
    const res = await deleteStaff(selectedStaff.id)
    
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Đã xóa quản trị viên!")
      setIsDeleteOpen(false)
    }
    setIsLoading(false)
  }

  const openEdit = (staff: any) => {
    setSelectedStaff(staff)
    setIsEditOpen(true)
  }

  const openDelete = (staff: any) => {
    setSelectedStaff(staff)
    setIsDeleteOpen(true)
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Tìm kiếm tài khoản..." 
            className="pl-9"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-2 h-4 w-4" /> Thêm mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm Quản trị viên mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Họ và tên</label>
                <Input name="name" placeholder="Vd: Nguyễn Văn A" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" name="email" placeholder="email@example.com" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mật khẩu</label>
                <Input type="password" name="password" required minLength={6} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Vai trò (Phân quyền)</label>
                <Select name="roleId" required defaultValue={roles[0]?.id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Hủy</Button>
                <Button type="submit" disabled={isLoading} className="bg-indigo-600">{isLoading ? 'Đang lưu...' : 'Thêm mới'}</Button>
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
              <TableHead>Nhân viên</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  Không tìm thấy tài khoản nào.
                </TableCell>
              </TableRow>
            ) : filteredData.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                      {staff.name?.charAt(0) || <User className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{staff.name || 'Chưa cập nhật'}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3" /> {staff.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                    <Shield className="h-3.5 w-3.5" />
                    {staff.role?.name || 'Không xác định'}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {new Date(staff.createdAt).toLocaleDateString('vi-VN')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(staff)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDelete(staff)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật thông tin</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Họ và tên</label>
                <Input name="name" defaultValue={selectedStaff.name} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" name="email" defaultValue={selectedStaff.email} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mật khẩu mới (Để trống nếu không đổi)</label>
                <Input type="password" name="password" minLength={6} placeholder="********" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Vai trò (Phân quyền)</label>
                <Select name="roleId" required defaultValue={selectedStaff.roleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Hủy</Button>
                <Button type="submit" disabled={isLoading} className="bg-indigo-600">{isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa tài khoản</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Bạn có chắc chắn muốn xóa tài khoản <strong>{selectedStaff?.name}</strong>? Hành động này không thể hoàn tác.</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>Hủy</Button>
            <Button type="button" variant="destructive" onClick={handleDeleteSubmit} disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Xóa vĩnh viễn'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
