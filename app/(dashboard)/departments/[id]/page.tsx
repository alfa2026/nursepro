import DepartmentDetailsClient from "./department-client"

export function generateStaticParams() {
  return [
    { id: "icu" },
    { id: "er" },
    { id: "surgery" },
    { id: "pediatrics" },
    { id: "radiology" },
    { id: "lab" },
    { id: "pharmacy" },
    { id: "reception" },
  ]
}

export default async function DepartmentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <DepartmentDetailsClient id={id} />
}
