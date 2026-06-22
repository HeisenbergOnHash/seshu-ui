const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertLessThanOneThousand(num: number): string {
  if (num === 0) return '';
  
  let result = '';
  
  if (num >= 100) {
    result += ones[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  
  if (num >= 20) {
    result += tens[Math.floor(num / 10)] + ' ';
    num %= 10;
  }
  
  if (num > 0) {
    result += ones[num] + ' ';
  }
  
  return result.trim();
}

export function numberToWords(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return '';
  if (num === 0) return 'Zero Rupees Only';

  const isNegative = num < 0;
  let absoluteNum = Math.abs(num);

  const [rupeesString, paiseString] = absoluteNum.toFixed(2).split('.');
  let rupees = parseInt(rupeesString, 10);
  const paise = parseInt(paiseString, 10);

  if (rupees === 0 && paise === 0) return 'Zero Rupees Only';

  let result = '';

  if (rupees > 0) {
    const crore = Math.floor(rupees / 10000000);
    rupees %= 10000000;
    
    const lakh = Math.floor(rupees / 100000);
    rupees %= 100000;
    
    const thousand = Math.floor(rupees / 1000);
    rupees %= 1000;
    
    const remainder = rupees;

    if (crore > 0) {
      result += convertLessThanOneThousand(crore) + ' Crore ';
    }
    
    if (lakh > 0) {
      result += convertLessThanOneThousand(lakh) + ' Lakh ';
    }
    
    if (thousand > 0) {
      result += convertLessThanOneThousand(thousand) + ' Thousand ';
    }
    
    if (remainder > 0) {
      result += convertLessThanOneThousand(remainder) + ' ';
    }

    result += 'Rupees ';
  }

  if (paise > 0) {
    if (result.length > 0) {
      result += 'and ';
    }
    result += convertLessThanOneThousand(paise) + ' Paise ';
  }

  result += 'Only';

  if (isNegative) {
    result = 'Minus ' + result;
  }

  return result.trim();
}
