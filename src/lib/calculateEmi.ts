export interface AmortizationRow {
    month: number;
    principalPayment: number;
    interestPayment: number;
    remainingBalance: number;
  }
  
  export function calculateAmortization(
    principal: number,
    rate: number,
    tenure: number,
    frequency: 'monthly' | 'quarterly' | 'semi-annual' | 'yearly'
  ): { emi: number; schedule: AmortizationRow[] } {
    let periodsPerYear;
    switch (frequency) {
      case 'quarterly':
        periodsPerYear = 4;
        break;
      case 'semi-annual':
        periodsPerYear = 2;
        break;
      case 'yearly':
        periodsPerYear = 1;
        break;
      case 'monthly':
      default:
        periodsPerYear = 12;
    }
  
    const periodRate = rate / (100 * periodsPerYear); // Periodic interest rate based on frequency
    const numberOfPayments = tenure * periodsPerYear; // Total number of payments based on tenure and frequency
    const emi =
      (principal * periodRate * Math.pow(1 + periodRate, numberOfPayments)) /
      (Math.pow(1 + periodRate, numberOfPayments) - 1);
  
    let remainingBalance = principal;
    const schedule: AmortizationRow[] = [];
  
    for (let period = 1; period <= numberOfPayments; period++) {
      const interestPayment = remainingBalance * periodRate;
      const principalPayment = emi - interestPayment;
      remainingBalance -= principalPayment;
  
      schedule.push({
        month: period, // Period number (not necessarily a month if frequency changes)
        principalPayment,
        interestPayment,
        remainingBalance: Math.max(remainingBalance, 0), // avoid negative balances
      });
    }
  
    return { emi, schedule };
  }
  