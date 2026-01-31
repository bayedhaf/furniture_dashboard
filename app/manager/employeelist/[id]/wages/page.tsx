import WageForm from "./WageForm";
import WageTable from "./WageTable";


export default async function EmployeeWagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1B3A57]">Employee Wages</h1>

      <WageForm employeeId={id} />
      <WageTable employeeId={id} />
    </div>
  );
}
