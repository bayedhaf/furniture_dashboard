import ExpenseForm from "./components/ExpenseForm";
import ExpenseTable from "./components/ExpenseTable";
import Link from "next/link";

export default function OperationsPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A57]">
            Operational Expenses
          </h1>
          <p className="text-sm text-neutral-500">
            Record and manage daily operational costs
          </p>
        </div>

        <Link
          href="/manager/operations/summary"
          className="mt-3 sm:mt-0 text-sm font-medium text-[#007B7F] hover:underline"
        >
          View Summary →
        </Link>
      </div>

      {/* Expense Form */}
      <ExpenseForm />

      {/* Expense Table */}
      <ExpenseTable />
    </div>
  );
}
