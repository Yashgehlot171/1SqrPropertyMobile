import {apiRequest} from '@/api';
import type {EmiResult} from '@/types';
export async function getEmiEstimate(input: {loanAmount: number; downPayment: number; interestRate: number; tenureYears: number}): Promise<EmiResult> {
  const financedAmount = input.loanAmount - input.downPayment;
  if (!Number.isFinite(financedAmount) || financedAmount <= 0 || !Number.isInteger(input.tenureYears) || input.tenureYears <= 0 || input.interestRate <= 0) {
    throw new Error('Enter a positive financed amount, interest rate and whole-year tenure.');
  }
  const response = await apiRequest<{breakdown: {emi: number; interest: number; totalPayment: number}}>({
    endpoint: '/calculators/home-loan-emi', method: 'POST', auth: 'none',
    body: {loanAmount: financedAmount, annualInterestRate: input.interestRate, tenureYears: input.tenureYears},
  });
  return {monthlyEmi: response.breakdown.emi, totalInterest: response.breakdown.interest, totalPayable: response.breakdown.totalPayment};
}
