import {Linking, Share} from 'react-native';

import type {EmiResult, LoanBank} from '@/types';
import {formatCurrency} from '@/utils/formatCurrency';
import {showToast} from '@/utils/toast';

export async function callFinanceTeam(bank: LoanBank): Promise<void> {
  if (!bank.phone) { showToast('Phone contact is not available for this lender.'); return; }
  try {
    await Linking.openURL(`tel:${bank.phone}`);
  } catch {
    showToast(`Call ${bank.phone} from your device.`);
  }
}

export async function openWhatsAppForFinanceTeam(
  bank: LoanBank,
  context: string,
): Promise<void> {
  if (!bank.whatsapp) { showToast('WhatsApp contact is not available.'); return; }
  const message = encodeURIComponent(
    `Hi${bank.contactPerson ? ` ${bank.contactPerson}` : ''}, I need help with ${context} from 1SQUARE Property.`,
  );

  try {
    await Linking.openURL(`https://wa.me/91${bank.whatsapp}?text=${message}`);
  } catch {
    showToast('WhatsApp is not available on this device.');
  }
}

export async function shareEmiResult(
  bank: LoanBank | undefined,
  values: {
    loanAmount: number;
    interestRate: number;
    tenureYears: number;
    downPayment: number;
  },
  result: EmiResult,
): Promise<void> {
  const financedAmount = Math.max(values.loanAmount - values.downPayment, 0);
  const message = [
    '1SQUARE Property Loan EMI Estimate',
    bank ? `Preferred Bank: ${bank.name}` : undefined,
    `Property Budget: ${formatCurrency(values.loanAmount)}`,
    `Down Payment: ${formatCurrency(values.downPayment)}`,
    `Loan Amount: ${formatCurrency(financedAmount)}`,
    `Interest Rate: ${values.interestRate}%`,
    `Tenure: ${values.tenureYears} years`,
    `Monthly EMI: ${formatCurrency(result.monthlyEmi)}`,
    `Total Interest: ${formatCurrency(result.totalInterest)}`,
    `Total Payable: ${formatCurrency(result.totalPayable)}`,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    await Share.share({
      title: 'EMI Result',
      message,
    });
  } catch {
    showToast('Unable to share the EMI result right now.');
  }
}
