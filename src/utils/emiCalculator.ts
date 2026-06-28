import type {EmiResult} from '@/types';

export function calculateEmi(params: {
  loanAmount: number;
  interestRate: number;
  tenureYears: number;
  downPayment: number;
}): EmiResult {
  const principal = Math.max(params.loanAmount - params.downPayment, 0);
  const monthlyRate = params.interestRate / 12 / 100;
  const months = params.tenureYears * 12;

  if (!principal || !monthlyRate || !months) {
    return {
      monthlyEmi: 0,
      totalInterest: 0,
      totalPayable: 0,
    };
  }

  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
  const totalPayable = emi * months;
  const totalInterest = totalPayable - principal;

  return {
    monthlyEmi: Math.round(emi),
    totalInterest: Math.round(totalInterest),
    totalPayable: Math.round(totalPayable),
  };
}
