import { prisma } from "@/lib/db"
import { SettingsForm } from "./settings-form"

export default async function SettingsPage() {
  const settingsData = await prisma.setting.findMany()
  
  const settingsMap: Record<string, string> = {}
  settingsData.forEach(s => {
    settingsMap[s.key] = s.value
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Cài đặt chung</h1>
        </div>
      </div>
      
      <div className="mt-2">
        <SettingsForm initialData={settingsMap} />
      </div>
    </div>
  )
}
