"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, ArrowLeft, CheckCircle2, Shield, AlertCircle } from "lucide-react"
import { requestPasswordReset } from "./actions"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")
    setSuccessMessage("")

    const res = await requestPasswordReset(email)

    if (res.error) {
      setErrorMessage(res.error)
    } else if (res.message) {
      setSuccessMessage(res.message)
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4 text-indigo-400">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Quên Mật Khẩu?</h1>
          <p className="text-sm text-slate-400 mt-2">
            Nhập địa chỉ email đăng ký tài khoản quản trị. Chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu.
          </p>
        </div>

        {successMessage ? (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3 text-emerald-300 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>{successMessage}</div>
            </div>
            <div className="text-center">
              <Link
                href="/admin/login"
                className="inline-flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại Đăng Nhập
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Địa Chỉ Email Đăng Ký
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="email"
                  placeholder="admin@mvpx.vn"
                  className="pl-9 bg-slate-900/60 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition-all"
            >
              {isLoading ? "Đang gửi email..." : "Gửi Link Khôi Phục"}
            </Button>

            <div className="text-center pt-2">
              <Link
                href="/admin/login"
                className="inline-flex items-center text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Quay lại Đăng Nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
