"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AddEmployeePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/hr")
  }, [router])

  return null
}
