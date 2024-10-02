"use client";
import { AmortizationRow, calculateAmortization } from "@/lib/calculateEmi";

import React, { useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const EmiForm = () => {
  const [principal, setPrincipal] = useState<number | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [tenure, setTenure] = useState<number | null>(null);
  const [frequency, setFrequency] = useState<
    "monthly" | "quarterly" | "semi-annual" | "yearly"
  >("monthly");
  const [emi, setEmi] = useState<number | null>(null);
  const [schedule, setSchedule] = useState<AmortizationRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10); // Default rows per page

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!principal || principal <= 0) {
      setError("Please enter a valid principal amount.");
      return;
    }
    if (!rate || rate <= 0) {
      setError("Please enter a valid interest rate.");
      return;
    }
    if (!tenure || tenure <= 0) {
      setError("Please enter a valid tenure.");
      return;
    }

    // Calculate EMI and Amortization
    const { emi: calculatedEmi, schedule } = calculateAmortization(
      principal,
      rate,
      tenure,
      frequency
    );
    setEmi(calculatedEmi);
    setSchedule(schedule);
    setCurrentPage(1); // Reset to the first page
    setError(null);
  };

  // Pie chart data for principal and interest breakdown
  const pieData = {
    labels: ["Principal", "Interest"],
    datasets: [
      {
        label: "EMI Breakdown",
        data: [
          schedule?.reduce((sum, row) => sum + row.principalPayment, 0) || 0,
          schedule?.reduce((sum, row) => sum + row.interestPayment, 0) || 0,
        ],
        backgroundColor: ["#4caf50", "#f44336"],
      },
    ],
  };

  // Pagination logic
  const totalPages = schedule ? Math.ceil(schedule.length / rowsPerPage) : 1;

  const displayedSchedule = schedule
    ? schedule.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    : [];

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4 text-center">EMI Calculator</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="principal" className="block text-sm font-medium">
            Principal Amount (₹)
          </label>
          <input
            type="number"
            id="principal"
            value={principal || ""}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="rate" className="block text-sm font-medium">
            Interest Rate (% per annum)
          </label>
          <input
            type="number"
            id="rate"
            value={rate || ""}
            onChange={(e) => setRate(Number(e.target.value))}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="tenure" className="block text-sm font-medium">
            Loan Tenure (years)
          </label>
          <input
            type="number"
            id="tenure"
            value={tenure || ""}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="frequency" className="block text-sm font-medium">
            Payment Frequency
          </label>
          <select
            id="frequency"
            value={frequency}
            onChange={(e) =>
              setFrequency(
                e.target.value as
                  | "monthly"
                  | "quarterly"
                  | "semi-annual"
                  | "yearly"
              )
            }
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            required
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="semi-annual">Semi-Annual</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
        >
          Calculate EMI
        </button>
      </form>

      {emi !== null && (
        <>
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <p className="text-lg font-semibold">
              Your EMI is: ₹{emi.toFixed(2)}
            </p>
          </div>

          <div className="mt-4">
            <h3 className="text-xl font-bold mb-2">Amortization Schedule</h3>

            {/* Rows per page selection */}
            <div className="mb-4">
              <label
                htmlFor="rowsPerPage"
                className="block text-sm font-medium"
              >
                Rows per page
              </label>
              <select
                id="rowsPerPage"
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              >
                <option value={10}>10</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>

            {/* Amortization table */}
            <table className="min-w-full bg-white rounded-md shadow-md overflow-scroll">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Principal</th>
                  <th>Interest</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {displayedSchedule?.map((row) => (
                  <tr key={row.month}>
                    <td>{row.month}</td>
                    <td>₹{row.principalPayment.toFixed(2)}</td>
                    <td>₹{row.interestPayment.toFixed(2)}</td>
                    <td>₹{row.remainingBalance.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination controls */}
            <div className="mt-4 flex justify-between">
              <button
                onClick={handlePreviousPage}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <p>
                Page {currentPage} of {totalPages}
              </p>
              <button
                onClick={handleNextPage}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-xl font-bold mb-2">EMI Breakdown</h3>
            <Pie data={pieData} />
          </div>
        </>
      )}
    </div>
  );
};

export default EmiForm;
