"use client"

import { useState } from "react"
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog"
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select"
import { Search, Plus, Edit2, Trash2, Mail, User, Shield, ShieldAlert, ShieldCheck, KeyRound, AlertCircle, CheckCircle2, Crown } from "lucide-react"
import { createStaff, updateStaff, deleteStaff, checkRootEmail, sendRootOtp, confirmAndSetRoot } from "./actions"
import { toast } from "sonner"

export function StaffTable({ data, roles }: { data: any[], roles: any[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [addRoleId, setAddRoleId] = useState<string>(roles[0]?.id || "")
  const [editRoleId, setEditRoleId] = useState<string>("")

  // Root Setup States
  const [isRootModalOpen, setIsRootModalOpen] = useState(false)
  const [rootStep, setRootStep] = useState<1 | 2>(1)
  const [rootEmail, setRootEmail] = useState("")
  const [rootOtp, setRootOtp] = useState("")
  const [rootName, setRootName] = useState("")
  const [rootPassword, setRootPassword] = useState("")
  const [existingUserCheck, setExistingUserCheck] = useState<any>(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isConfirmingRoot, setIsConfirmingRoot] = useState(false)

  const roleItems = roles.map(r => ({ value: r.id, label: r.name }))

  // Check if system has a Root User
  const rootUser = data.find(s => s.isRoot)
  const hasRoot = !!rootUser

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

  const openAdd = () => {
    setAddRoleId(roles[0]?.id || "")
    setIsAddOpen(true)
  }

  const openEdit = (staff: any) => {
    setSelectedStaff(staff)
    setEditRoleId(staff.roleId || roles[0]?.id || "")
    setIsEditOpen(true)
  }

  const openDelete = (staff: any) => {
    if (staff.isRoot) {
      toast.error("Không thể xóa Tài khoản Root Tối Cao của hệ thống!")
      return
    }
    setSelectedStaff(staff)
    setIsDeleteOpen(true)
  }

  const handleEmailCheck = async (emailVal: string) => {
    setRootEmail(emailVal)
    if (!emailVal || !emailVal.includes("@")) {
      setExistingUserCheck(null)
      return
    }
    setIsCheckingEmail(true)
    const res = await checkRootEmail(emailVal)
    setExistingUserCheck(res)
    setIsCheckingEmail(false)
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rootEmail || !rootEmail.includes("@")) {
      toast.error("Vui lòng nhập địa chỉ Email hợp lệ.")
      return
    }
    setIsSendingOtp(true)
    const res = await sendRootOtp(rootEmail)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(`Đã gửi mã OTP xác thực tới ${rootEmail}. Vui lòng kiểm tra hộp thư!`)
      setRootStep(2)
    }
    setIsSendingOtp(false)
  }

  const handleConfirmRoot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rootOtp || rootOtp.length < 6) {
      toast.error("Vui lòng nhập mã OTP 6 chữ số.")
      return
    }

    setIsConfirmingRoot(true)
    const res = await confirmAndSetRoot({
      email: rootEmail,
      code: rootOtp,
      name: rootName,
      password: rootPassword
    })

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Kích hoạt Tài khoản Root Tối Cao thành công! Email Root đã được khóa an toàn.")
      setIsRootModalOpen(false)
      // Reset form
      setRootStep(1)
      setRootEmail("")
      setRootOtp("")
      setRootName("")
      setRootPassword("")
      setExistingUserCheck(null)
    }
    setIsConfirmingRoot(false)
  }

  return (
    <div>
      {/* Root Protection Warning Banner */}
      {!hasRoot && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4 rounded-r-xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900 text-sm">Cảnh báo An Toàn Hệ Thống</h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Hệ thống chưa khởi tạo <strong>Tài khoản Root Tối Cao</strong>. Vui lòng thiết lập ngay để bảo vệ hệ thống và kích hoạt tính năng khôi phục mật khẩu qua email.
              </p>
            </div>
          </div>
          <Button onClick={() => setIsRootModalOpen(true)} className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 text-xs font-semibold shadow-sm">
            <ShieldCheck className="mr-1.5 h-4 w-4" /> Thiết Lập Root User Ngay
          </Button>
        </div>
      )}

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

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {hasRoot && (
            <Button variant="outline" onClick={() => setIsRootModalOpen(true)} className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs">
              <Crown className="mr-1.5 h-4 w-4 text-amber-500" /> Đổi Root User
            </Button>
          )}

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger render={<Button onClick={openAdd} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700" />}>
              <Plus className="mr-2 h-4 w-4" /> Thêm mới
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
                  <Input type="email" name="email" placeholder="admin@mvpx.vn" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mật khẩu</label>
                  <Input type="password" name="password" placeholder="••••••••" required minLength={6} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vai trò (Phân quyền)</label>
                  <Select 
                    name="roleId" 
                    items={roleItems}
                    value={addRoleId} 
                    onValueChange={(val) => val && setAddRoleId(val as string)}
                    required
                  >
                    <SelectTrigger className="w-full">
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
              <TableRow key={staff.id} className={staff.isRoot ? "bg-amber-50/40 dark:bg-amber-950/10" : ""}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center font-semibold ${
                      staff.isRoot ? "bg-amber-500 text-white shadow-sm" : "bg-indigo-100 text-indigo-700"
                    }`}>
                      {staff.isRoot ? <Crown className="h-4 w-4" /> : (staff.name?.charAt(0) || <User className="h-4 w-4" />)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{staff.name || 'Chưa cập nhật'}</span>
                        {staff.isRoot && (
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                            <ShieldCheck className="h-3 w-3" /> ROOT SUPER ADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3" /> {staff.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    staff.isRoot ? "bg-amber-100 text-amber-900 border border-amber-200 font-semibold" : "bg-purple-50 text-purple-700 border border-purple-100"
                  }`}>
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDelete(staff)}
                      disabled={staff.isRoot}
                      title={staff.isRoot ? "Tài khoản Root không thể bị xóa" : "Xóa tài khoản"}
                      className={staff.isRoot ? "text-gray-300 cursor-not-allowed" : "text-red-600 hover:text-red-700 hover:bg-red-50"}
                    >
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
            <DialogTitle>Cập nhật thông tin Quản trị viên</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
              {selectedStaff.isRoot && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
                  <span><strong>Tài khoản Root Tối Cao:</strong> Địa chỉ Email và Nhóm quyền Admin được khóa cố định để bảo mật hệ thống.</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Họ và tên</label>
                <Input name="name" defaultValue={selectedStaff.name} required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email {selectedStaff.isRoot && "(Đã khóa)"}</label>
                <Input 
                  type="email" 
                  name="email" 
                  defaultValue={selectedStaff.email} 
                  disabled={selectedStaff.isRoot}
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mật khẩu mới (Để trống nếu không đổi)</label>
                <Input type="password" name="password" minLength={6} placeholder="••••••••" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Vai trò (Phân quyền)</label>
                <Select 
                  name="roleId" 
                  items={roleItems}
                  value={editRoleId} 
                  onValueChange={(val) => val && setEditRoleId(val as string)}
                  disabled={selectedStaff.isRoot}
                  required
                >
                  <SelectTrigger className="w-full">
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

      {/* Root Setup OTP Modal */}
      <Dialog open={isRootModalOpen} onOpenChange={setIsRootModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
              <ShieldCheck className="h-5 w-5 text-indigo-600" /> Thiết Lập Tài Khoản Root Tối Cao
            </DialogTitle>
          </DialogHeader>

          {rootStep === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4 py-2">
              <p className="text-xs text-gray-500">
                Tài khoản Root có quyền hành cao nhất hệ thống và không thể bị xóa. Để kích hoạt, hệ thống sẽ gửi một mã <strong>OTP 6 chữ số</strong> xác thực tới email của bạn.
              </p>

              <div className="space-y-2">
                <label className="text-sm font-medium">Địa chỉ Email Root</label>
                <Input 
                  type="email" 
                  placeholder="admin@mvpx.vn" 
                  value={rootEmail}
                  onChange={(e) => handleEmailCheck(e.target.value)}
                  required 
                />
              </div>

              {isCheckingEmail && <p className="text-xs text-gray-400">Đang kiểm tra địa chỉ email...</p>}

              {existingUserCheck && existingUserCheck.exists && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-1">
                  <div className="font-semibold flex items-center gap-1 text-blue-700">
                    <AlertCircle className="h-4 w-4" /> Phát hiện tài khoản sẵn có trong hệ thống:
                  </div>
                  <div>- Tên: <strong>{existingUserCheck.user.name || "Chưa đặt tên"}</strong></div>
                  <div>- Vai trò hiện tại: <strong>{existingUserCheck.user.roleName || "Chưa phân quyền"}</strong></div>
                  <div className="text-[11px] text-blue-600 font-medium mt-1">
                    * Sau khi xác thực OTP, tài khoản này sẽ được nâng cấp thành Tài Khoản Root Tối Cao và gán quyền Admin.
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsRootModalOpen(false)}>Hủy</Button>
                <Button type="submit" disabled={isSendingOtp || !rootEmail} className="bg-indigo-600 hover:bg-indigo-700">
                  {isSendingOtp ? "Đang gửi OTP..." : "Gửi Mã OTP Xác Thực"}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={handleConfirmRoot} className="space-y-4 py-2">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-900">
                Đã gửi mã OTP 6 chữ số tới <strong>{rootEmail}</strong>. Vui lòng kiểm tra hộp thư email (và thư mục Spam/Junk) để nhận mã.
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mã OTP Xác Thực (6 chữ số)</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="123456" 
                    className="pl-9 font-mono text-center tracking-widest text-lg font-bold"
                    maxLength={6}
                    value={rootOtp}
                    onChange={(e) => setRootOtp(e.target.value)}
                    required 
                  />
                </div>
              </div>

              {!existingUserCheck?.exists && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Họ và tên Root Admin</label>
                    <Input 
                      placeholder="Root Super Admin" 
                      value={rootName}
                      onChange={(e) => setRootName(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mật khẩu</label>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      minLength={6}
                      value={rootPassword}
                      onChange={(e) => setRootPassword(e.target.value)}
                      required 
                    />
                  </div>
                </>
              )}

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setRootStep(1)}>Quay lại</Button>
                <Button type="submit" disabled={isConfirmingRoot || rootOtp.length < 6} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {isConfirmingRoot ? "Đang xác thực..." : "Kích Hoạt Root User"}
                </Button>
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
