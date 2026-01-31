import EmployeeForm from "./EmployeeForm";
import EmployeeTable from "./EmployeeTable";

export default function EmployeeListPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1B3A57]">
        Employee Management
      </h1>

      <EmployeeForm />
      <EmployeeTable />
    </div>
  );
}
