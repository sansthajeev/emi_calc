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
    <div className="p-10 mx-auto bg-white p-8 shadow-md">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">EMI Calculator</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Your Loan Amount is
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-gray-200 text-gray-700">
                  NPR
                </span>
                <input
                  type="text"
                  id="principal"
                  className="flex-1 p-2 border border-gray-900"
                  value={principal || ""}
                  onChange={(e) => setPrincipal(Number(e.target.value))}
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Loan Rate</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-gray-200 text-gray-700">
                  %
                </span>
                <input
                  type="number"
                  id="rate"
                  value={rate || ""}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="flex-1 p-2 border border-gray-900"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Loan Tenure</label>
              <input
                type="number"
                id="tenure"
                value={tenure || ""}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full p-2 border border-gray-900"
                required
              />
              <div className="mt-2">
                <label className=" p-2 inline-flex items-center">
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
                    className="p-3 mt-1 block w-full border-gray-900 rounded-md shadow-sm"
                    required
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="semi-annual">Semi-Annual</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </label>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
          >
            Calculate EMI
          </button>
        </form>

        <div className="flex flex-col items-center">
          <div className="text-center mb-4">
            <p className="text-gray-700">Loan EMI</p>
            <p className="text-2xl text-gray-900 font-bold">
              NPR {emi !== null ? emi.toFixed(2) : 0}
            </p>
          </div>
          <div className="text-center mb-4">
            <div className="mt-4">
              <h3 className="text-xl text-green-900 font-bold mb-2">EMI Breakdown</h3>
              <Pie data={pieData} />
            </div>
          </div>
        </div>
      </div>
      <h2 className="text-xl font-bold text-gray-700 mt-8 mb-4">
        Monthly breakdown of EMI in{" "}
        <span className="font-bold text-blue-700">Principal</span> and{" "}
        <span className="font-bold text-blue-700">Interest</span> components
      </h2>
      <div className="overflow-x-auto">
        {emi !== null ? (
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 bg-blue-700 items-center text-white">
                  Period
                </th>
                <th className="py-2 px-4 bg-blue-700 items-center text-white">
                  Principal
                </th>
                <th className="py-2 px-4 bg-blue-700 text-white items-center">
                  Interest
                </th>
                <th className="py-2 px-4 bg-blue-700 text-white items-center">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedSchedule?.map((row, index) => (
                <tr
                  key={row.month}
                  className={index % 2 === 0 ? "bg-gray-900" : ""}
                >
                  <td>{row.month}</td>
                  <td>{row.principalPayment.toFixed(2)}</td>
                  <td>{row.interestPayment.toFixed(2)}</td>
                  <td>{row.remainingBalance.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <>No Records to Display</>
        )}
        {/* Pagination controls */}
        <div className="mt-4 flex justify-between">
          <button
            onClick={handlePreviousPage}
            className="px-4 py-2 bg-gray-900 rounded-md hover:bg-gray-300 disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <p>
            Page {currentPage} of {totalPages}
          </p>
          <button
            onClick={handleNextPage}
            className="px-4 py-2 bg-gray-900 rounded-md hover:bg-gray-300 disabled:opacity-50"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
          {/* Rows per page selection */}
          <div className="mb-4">
            <label htmlFor="rowsPerPage" className="block text-sm font-medium">
              Rows per page
            </label>
            <select
              id="rowsPerPage"
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="mt-1 block w-full border-gray-900 rounded-md shadow-sm"
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmiForm;
