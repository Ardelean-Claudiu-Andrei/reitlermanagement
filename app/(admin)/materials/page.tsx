"use client"

import { redirect } from "next/navigation"

// Redirect to assemblies page by default
export default function MaterialsPage() {
  redirect("/materials/assemblies")
}
