export const TransactionStatus = Object.freeze({
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    DISCARDED: 'DISCARDED',
  });

  export const TransactionFinancialType = Object.freeze({
    ORIGINAL_BUDGET: 'ORIGINAL_BUDGET',
    CHANGE_ORDER: 'CHANGE_ORDER',
    ACTUAL_COST: 'ACTUAL_COST',
    REVENUE: 'REVENUE',
  });

export const TransactionsStatusObject = Object.freeze({
    [TransactionStatus.PENDING]: {
      text: 'Pending',
      value: TransactionStatus.PENDING,
    },
    [TransactionStatus.APPROVED]: {
      text: 'Approved',
      value: TransactionStatus.APPROVED,
    },
    [TransactionStatus.REJECTED]: {
      text: 'Rejected',
      value: TransactionStatus.REJECTED,
    },
    [TransactionStatus.DISCARDED]: {
      text: 'Discarded',
      value: TransactionStatus.DISCARDED,
    },
  });

  export const TransactionFinancialTypeObject = Object.freeze({
    [TransactionFinancialType.ACTUAL_COST]: {
      text: 'Actual Cost',
      value: TransactionFinancialType.ACTUAL_COST,
    },
    [TransactionFinancialType.CHANGE_ORDER]: {
      text: 'Change Order',
      value: TransactionFinancialType.CHANGE_ORDER,
    },
    [TransactionFinancialType.ORIGINAL_BUDGET]: {
      text: 'Original Budget',
      value: TransactionFinancialType.ORIGINAL_BUDGET,
    },
    [TransactionFinancialType.REVENUE]: {
      text: 'Revenue',
      value: TransactionFinancialType.REVENUE,
    },
  });