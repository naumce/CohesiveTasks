export function thousandSeparatedFormat(number: number) {
  if (!number) return number
  const locale = window.navigator.language // || window.navigator.userLanguage for IE, but typescript throws error. Need to research further
  return number.toLocaleString(locale)
}

export const formatNumber = (number: number | string, decimal: boolean = true) => {
  let currentNumber = isNaN(Number(number))  ? 0 : decimal ? Math.round(Number(number)) : Number(number);
  let formattedNumber = currentNumber.toLocaleString('de-DE', {
    style: 'decimal',
    minimumFractionDigits: decimal ? 2 : 0,
    maximumFractionDigits: decimal ? 2 : 0,
  });
  return formattedNumber === '-0,00' ? '0,00' : formattedNumber
}