// Business simulation engine with realistic financial modeling
export interface BusinessDecision {
  productPrice: number;
  marketingBudget: number;
  rdBudget: number;
  employees: number;
}

export interface BusinessPeriodResult {
  revenue: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  ebitda: number;
  netIncome: number;
  unitsSold: number;
  marketShare: number;
  customerSatisfaction: number;
  cashFlow: number;
}

export interface FinancialStatement {
  incomeStatement: {
    revenue: number;
    cogs: number;
    grossProfit: number;
    grossMargin: number;
    marketingExpense: number;
    rdExpense: number;
    payroll: number;
    operatingExpenses: number;
    ebitda: number;
    depreciation: number;
    ebit: number;
    taxes: number;
    netIncome: number;
    netMargin: number;
  };
  balanceSheet: {
    cash: number;
    inventory: number;
    totalAssets: number;
    totalLiabilities: number;
    equity: number;
    debtToEquity: number;
  };
  cashFlow: {
    operating: number;
    investing: number;
    financing: number;
    net: number;
  };
}

const SALARY_PER_EMPLOYEE = 5000;
const TAX_RATE = 0.21;

export function simulateBusinessPeriod(
  state: {
    cash: number;
    period: number;
    employees: number;
    productPrice: number;
    marketingBudget: number;
    rdBudget: number;
  },
  decisions: BusinessDecision
): BusinessPeriodResult {
  const { period } = state;

  // Market demand elasticity: lower price = more units
  const baseUnits = 1000;
  const priceElasticity = -1.5;
  const optimalPrice = 99;
  const priceEffect = Math.pow(decisions.productPrice / optimalPrice, priceElasticity);

  // Marketing effectiveness (diminishing returns)
  const marketingEffect = 1 + Math.log1p(decisions.marketingBudget / 5000) * 0.5;

  // R&D quality boost (builds over time)
  const rdEffect = 1 + (decisions.rdBudget / 3000) * 0.1 * Math.min(period, 10);

  // Seasonal variation
  const seasonality = 1 + 0.15 * Math.sin((period / 12) * 2 * Math.PI);

  // Employee productivity
  const employeeEffect = Math.min(1.5, 0.5 + decisions.employees * 0.1);

  const unitsSold = Math.floor(
    baseUnits * priceEffect * marketingEffect * rdEffect * seasonality * employeeEffect
  );

  const revenue = unitsSold * decisions.productPrice;
  const cogs = unitsSold * (decisions.productPrice * 0.35);
  const grossProfit = revenue - cogs;

  const payroll = decisions.employees * SALARY_PER_EMPLOYEE;
  const operatingExpenses = decisions.marketingBudget + decisions.rdBudget + payroll + 5000; // 5k overhead
  const ebitda = grossProfit - operatingExpenses;
  const depreciation = 2000;
  const ebit = ebitda - depreciation;
  const taxes = Math.max(0, ebit * TAX_RATE);
  const netIncome = ebit - taxes;

  const marketShare = Math.min(0.25, unitsSold / 10000);
  const customerSatisfaction = Math.min(100, 50 + rdEffect * 20 + (optimalPrice - decisions.productPrice) * 0.1);

  return {
    revenue: Math.round(revenue),
    cogs: Math.round(cogs),
    grossProfit: Math.round(grossProfit),
    operatingExpenses: Math.round(operatingExpenses),
    ebitda: Math.round(ebitda),
    netIncome: Math.round(netIncome),
    unitsSold,
    marketShare: Math.round(marketShare * 1000) / 1000,
    customerSatisfaction: Math.round(customerSatisfaction),
    cashFlow: Math.round(netIncome + depreciation),
  };
}

export function generateFinancialStatements(
  state: {
    cash: number;
    revenue: number;
    expenses: number;
    employees: number;
    productPrice: number;
    marketingBudget: number;
    rdBudget: number;
    history: BusinessPeriodResult[];
  }
): FinancialStatement {
  const payroll = state.employees * SALARY_PER_EMPLOYEE;
  const cogs = state.revenue * 0.35;
  const grossProfit = state.revenue - cogs;
  const operatingExpenses = state.marketingBudget + state.rdBudget + payroll + 5000;
  const ebitda = grossProfit - operatingExpenses;
  const depreciation = 2000;
  const ebit = ebitda - depreciation;
  const taxes = Math.max(0, ebit * TAX_RATE);
  const netIncome = ebit - taxes;

  const inventory = cogs * 0.1;
  const totalAssets = state.cash + inventory + 50000; // fixed assets
  const totalLiabilities = state.cash * 0.3;
  const equity = totalAssets - totalLiabilities;

  return {
    incomeStatement: {
      revenue: Math.round(state.revenue),
      cogs: Math.round(cogs),
      grossProfit: Math.round(grossProfit),
      grossMargin: state.revenue > 0 ? Math.round((grossProfit / state.revenue) * 1000) / 10 : 0,
      marketingExpense: state.marketingBudget,
      rdExpense: state.rdBudget,
      payroll: Math.round(payroll),
      operatingExpenses: Math.round(operatingExpenses),
      ebitda: Math.round(ebitda),
      depreciation,
      ebit: Math.round(ebit),
      taxes: Math.round(taxes),
      netIncome: Math.round(netIncome),
      netMargin: state.revenue > 0 ? Math.round((netIncome / state.revenue) * 1000) / 10 : 0,
    },
    balanceSheet: {
      cash: Math.round(state.cash),
      inventory: Math.round(inventory),
      totalAssets: Math.round(totalAssets),
      totalLiabilities: Math.round(totalLiabilities),
      equity: Math.round(equity),
      debtToEquity: equity > 0 ? Math.round((totalLiabilities / equity) * 100) / 100 : 0,
    },
    cashFlow: {
      operating: Math.round(netIncome + depreciation),
      investing: -5000,
      financing: 0,
      net: Math.round(netIncome + depreciation - 5000),
    },
  };
}
