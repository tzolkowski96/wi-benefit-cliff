export const en = {
  // App
  'app.title': 'Benefit Cliff Calculator',
  'app.subtitle': 'Wisconsin Public Benefits',
  'app.description': 'See how a raise affects your family\'s total benefits across FoodShare, BadgerCare Plus, Wisconsin Shares, WHEAP, and school meals.',
  'app.source': 'Based on 2025 eligibility thresholds from UW-Madison Extension.',

  // Form
  'form.sectionLabel': 'Your Household',
  'form.householdSize': 'Household size',
  'form.numberOfChildren': 'Children under 18',
  'form.incomeType': 'Income type',
  'form.incomeType.hourly': 'Hourly',
  'form.incomeType.monthly': 'Monthly',
  'form.hourlyWage': 'Current hourly wage',
  'form.monthlyIncome': 'Current monthly income',
  'form.raise': 'Potential raise',
  'form.raise.hourly': 'Hourly raise amount',
  'form.raise.monthly': 'Monthly raise amount',
  'form.monthlyEquivalent': 'monthly equivalent',

  // Results
  'result.netImpact': 'Net Monthly Impact',
  'result.raise': 'Raise',
  'result.lostBenefits': 'Lost Benefits',
  'result.netAnnual': 'Annual Impact',
  'result.lost': 'LOST',
  'result.keep': 'KEEP',
  'result.notEligible': 'Not eligible',
  'result.na': 'N/A',
  'result.buffer': 'buffer',
  'result.freeToReduced': 'FREE \u2192 REDUCED',

  // Sections
  'section.chart': 'Income vs. Eligibility Thresholds',
  'section.breakdown': 'Program Breakdown',
  'section.safeRaise': 'Safe Raise Zones',
  'section.additionalRisks': 'Additional Benefits at Risk',

  // Warnings
  'warning.cliffTitle': 'Cliff Warning',
  'warning.cliffBody': 'This raise would cost your household more in lost benefits than it adds in income.',
  'warning.worseOff': 'worse off',
  'warning.headsUp': 'Heads up',
  'warning.stillAhead': 'but still come out ahead',
  'warning.budgetTransition': 'Worth taking, but budget for the transition.',

  // Safe raise
  'safeRaise.description': 'Maximum raise you can take without losing each benefit you currently have:',
  'safeRaise.upTo': 'up to',
  'safeRaise.bottomLine': 'Bottom line',
  'safeRaise.safeMessage': 'You can safely take up to {amount}/mo without losing any current benefits.',

  // Programs
  'program.cutoff': 'Cutoff',
  'program.value': 'value',
  'program.entryCutoff': 'Entry cutoff (to start receiving)',
  'program.continuationCutoff': 'Continuation cutoff (to keep if enrolled)',
  'program.eligibilityOnly': 'Eligibility shown — dollar value varies by individual',

  // Tier 2 note
  'tier2.note': 'These programs may have significant financial value but it varies too much by individual circumstances to estimate. The net impact shown above only includes programs with calculable values.',

  // FoodShare note
  'foodshare.note': 'Your actual FoodShare amount may be higher if you have high rent or childcare costs. This estimate uses a simplified formula.',

  // School meals note
  'schoolMeals.note': 'School meal values reflect federal reimbursement rates \u2014 the cost of providing meals, not your direct savings. Your actual household savings may be lower if you would otherwise pack meals from home.',

  // WHEAP note
  'wheap.note': 'WHEAP is a one-time annual payment averaging ~$665, shown here as a monthly equivalent.',

  // BadgerCare note
  'badgercare.lostNote': 'Would need ACA Marketplace coverage. You may qualify for premium tax credits above 100% FPL.',

  // Wisconsin Shares note
  'shares.note': 'Subsidy amount varies. Contact your local Wisconsin Shares agency for your specific copay schedule.',

  // Print
  'print.title': 'Benefit Cliff Analysis Summary',
  'print.generated': 'Generated',
  'print.button': 'Print Summary',

  // Disclaimer
  'disclaimer.text': 'This calculator provides estimates based on 2025 income eligibility thresholds published by UW-Madison Division of Extension. Estimated benefit values are approximations. Actual eligibility depends on additional factors including assets, deductions, household composition, and immigration status. This tool does not replace official eligibility determinations.',
  'disclaimer.accessWi': 'Apply through ACCESS Wisconsin for official benefit decisions.',
  'disclaimer.contact': 'Contact your county financial educator or call 211 (877-847-2211) for personalized guidance.',

  // Accessibility
  'a11y.skipToContent': 'Skip to content',
  'a11y.currentIncome': 'Current income',
  'a11y.afterRaise': 'After raise',
  'a11y.eligibilityCutoff': 'Eligibility cutoff',
} as const

export type I18nKey = keyof typeof en
