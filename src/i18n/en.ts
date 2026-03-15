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
  'form.raise.hourly': 'Hourly raise amount',
  'form.raise.monthly': 'Monthly raise amount',
  'form.deductionsToggle': 'Optional: improve FoodShare accuracy',
  'form.deductionsHelp': 'Adding your housing and childcare costs may increase your estimated FoodShare benefit.',
  'form.rent': 'Monthly rent/mortgage',
  'form.childcare': 'Monthly childcare costs',
  'form.deductionsNote': 'Utility costs are estimated using Wisconsin\'s Heating Standard Utility Allowance ($538/mo). The shelter deduction is capped at $712/mo.',
  'form.description': 'Enter your current pay and a potential raise to see how it affects your benefits.',
  'form.raise.helpHourly': 'If your pay went up, how much more per hour would you earn?',
  'form.raise.helpMonthly': 'If your pay went up, how much more per month would you earn?',
  'form.customValuePrompt': 'Know your monthly value?',

  // Results
  'result.netImpact': 'Net Impact',
  'result.raise': 'Raise',
  'result.lostBenefits': 'Lost Benefits',
  'result.netAnnual': 'Annual Impact',
  'result.lost': 'LOST',
  'result.keep': 'KEEP',
  'result.notEligible': 'Not eligible',
  'result.na': 'N/A',
  'result.buffer': 'buffer',
  'result.noChange': 'no change',
  'result.annualCalcImpact': 'in calculable impact',
  'result.includesUserEntered': 'includes {amount} user-entered',
  'result.notIncluded': 'Not included above:',
  'result.variesByIndividual': 'eligibility lost but dollar value varies by individual.',

  // Cliff type badges
  'cliffType.hard': 'Hard cliff',
  'cliffType.gradual': 'Gradual',
  'cliffType.tier_shift': 'Tier shift',

  // Sections
  'section.chart': 'Income vs. Eligibility Thresholds',
  'section.breakdown': 'Program Breakdown',
  'section.safeRaise': 'Safe Raise Zones',
  'section.breakEven': 'What Raise Do I Need?',
  'section.additionalRisks': 'Additional Benefits at Risk',

  // Chart
  'chart.current': 'Current',
  'chart.afterRaise': 'After raise',
  'chart.cutoff': 'Eligibility cutoff',
  'chart.srCaption': 'Income position relative to benefit program eligibility thresholds',

  // Warnings
  'warning.cliffTitle': 'Cliff Warning',
  'warning.cliffBody': 'This raise would cost your household more in lost benefits than it adds in income.',
  'warning.worseOff': 'worse off',
  'warning.headsUp': 'Heads up',
  'warning.stillAhead': 'but still come out ahead',
  'warning.budgetTransition': 'Worth taking, but budget for the transition.',
  'warning.considerSmaller': 'Consider a smaller raise that keeps you below the cliff, or a larger raise that clears the gap.',

  // Safe raise
  'safeRaise.description': 'Maximum raise you can take without losing each benefit you currently have:',
  'safeRaise.upTo': 'up to',
  'safeRaise.bottomLine': 'Bottom line',
  'safeRaise.safeMessage': 'You can safely take up to {amount}/mo without losing any current benefits.',
  'safeRaise.exceedsMessage': 'Your current raise exceeds this.',
  'safeRaise.atThreshold': 'You are at or above the lowest eligibility threshold. Any raise may trigger a cliff.',

  // Break-even
  'breakEven.description': 'Minimum raise to break even after crossing each benefit cliff, accounting for all simultaneous losses:',
  'breakEven.cliffAt': 'cliff at',
  'breakEven.clearAll': 'To clear all cliffs:',
  'breakEven.raiseAtLeast': 'A raise of at least',
  'breakEven.offsetAll': 'would offset all benefit losses.',
  'breakEven.needAtLeast': 'You need at least',
  'breakEven.toBreakEven': 'to break even after crossing this cliff.',

  // Program names
  'program.foodshare': 'FoodShare',
  'program.badgercare_adult': 'BadgerCare Plus (Adults)',
  'program.badgercare_children': 'BadgerCare Plus (Children)',
  'program.wisconsin_shares': 'Wisconsin Shares',
  'program.wheap': 'WHEAP',
  'program.school_meals_free': 'Free School Meals',
  'program.school_meals_reduced': 'Reduced School Meals',

  // Programs
  'program.cutoff': 'Cutoff',
  'program.value': 'value',
  'program.entry': 'Entry',
  'program.continuation': 'Continuation',
  'program.eligibilityOnly': 'Eligibility shown \u2014 dollar value varies by individual',

  // Tier 2 note
  'tier2.note': 'Programs marked "Eligibility shown" may have significant financial value but it varies too much by individual circumstances to estimate. The net impact shown above only includes programs with calculable values.',
  'tier2.optionalNote': 'Optional. Enter your actual monthly savings to include in the net impact calculation.',

  // Print
  'print.title': 'Benefit Cliff Analysis Summary',
  'print.generated': 'Generated',
  'print.button': 'Print Summary',
  'print.householdDetails': 'Household Details',
  'print.netImpact': 'Calculable Net Impact',
  'print.safeRaise': 'Maximum Safe Raise',
  'print.breakEven': 'Break-Even Raises',
  'print.program': 'Program',
  'print.threshold': 'Threshold',
  'print.type': 'Type',
  'print.valueImpact': 'Value Impact',
  'print.status': 'Status',
  'print.cliffAt': 'Cliff At',
  'print.breakEvenCol': 'Break Even',
  'print.hourlyCol': 'Hourly',
  'print.newMonthlyIncome': 'New monthly income',
  'print.foodshareLoss': 'FoodShare',
  'print.schoolMealLoss': 'School meals',
  'print.wheapLoss': 'WHEAP',
  'print.userEnteredLoss': 'User-entered',

  // Chart sections
  'section.incomeSweep': 'Net Impact Across Raise Amounts',
  'section.waterfall': 'Impact Breakdown',
  'section.benefitStack': 'Total Benefits by Income',
  'section.breakEvenPlot': 'Break-Even Visualization',

  // Income Sweep Chart
  'sweep.xAxis': 'Monthly raise',
  'sweep.yAxis': 'Net monthly impact',
  'sweep.currentRaise': 'Your raise',
  'sweep.tooltipRaise': 'Raise',
  'sweep.tooltipLoss': 'Benefit loss',
  'sweep.tooltipNet': 'Net impact',
  'sweep.positiveZone': 'Better off',
  'sweep.negativeZone': 'Worse off',
  'sweep.description': 'How your net income changes at every possible raise amount. Dips below zero mean you lose more in benefits than you gain.',
  'sweep.srCaption': 'Net monthly impact for various raise amounts, showing where benefit cliffs reduce or eliminate gains',

  // Waterfall Chart
  'waterfall.raise': 'Raise',
  'waterfall.net': 'Net Impact',
  'waterfall.srCaption': 'Breakdown of raise amount minus benefit losses showing net impact',

  // Benefit Stack Chart
  'stack.xAxis': 'Monthly income',
  'stack.yAxis': 'Monthly benefit value',
  'stack.currentIncome': 'Current',
  'stack.afterRaise': 'After raise',
  'stack.description': 'Total calculable benefit value at each income level. The cliff is visible where bands drop sharply.',
  'stack.srCaption': 'Total monthly benefit value across income levels showing how benefits phase out',

  // Break-Even Dot Plot
  'dotPlot.xAxis': 'Monthly raise',
  'dotPlot.cliffDistance': 'Cliff triggers',
  'dotPlot.breakEven': 'Break-even',
  'dotPlot.yourRaise': 'Your raise',
  'dotPlot.gap': 'Gap to cover',
  'dotPlot.srCaption': 'Break-even raise amounts compared to cliff distances for each benefit program',

  // Unit suffixes
  'unit.perMonth': '/mo',
  'unit.perYear': '/yr',
  'unit.perHour': '/hr',

  // Labels
  'label.disclaimer': 'Disclaimer',
  'label.yes': 'Yes',
  'label.no': 'No',
  'label.total': 'Total',
  'label.item': 'Item',
  'label.amount': 'Amount',

  // Accessibility (additional)
  'a11y.language': 'Language',
  'a11y.customValueFor': 'Custom monthly value for {name}',
  'a11y.breakEvenExceeded': 'Current raise exceeds break-even',

  // Warning (plural-safe)
  'warning.benefitLostSingular': '1 benefit lost,',
  'warning.benefitsLostPlural': '{count} benefits lost,',

  // Chart SR
  'chart.tierTo': 'to',

  // Excel Export
  'export.button': 'Export Excel',
  'export.sheetSummary': 'Scenario Summary',
  'export.sheetPrograms': 'Program Status',
  'export.sheetBreakEven': 'Break-Even Analysis',
  'export.sheetSensitivity': 'Income Sensitivity',
  'export.sheetBenefitLevels': 'Benefit Levels',
  'export.sheetReference': 'Program Reference',
  'export.filename': 'benefit-cliff-analysis',

  // Excel column headers
  'excel.basis': 'Basis',
  'excel.eligibleNow': 'Eligible Now',
  'excel.eligibleAfter': 'Eligible After',
  'excel.distanceToCliff': 'Distance to Cliff',
  'excel.currentValue': 'Current Value (/mo)',
  'excel.newValue': 'New Value (/mo)',
  'excel.monthlyLoss': 'Monthly Loss',
  'excel.cliffDistanceCol': 'Cliff Distance (/mo)',
  'excel.breakEvenMo': 'Break-Even Raise (/mo)',
  'excel.breakEvenHr': 'Break-Even Raise (/hr)',
  'excel.raisePerMo': 'Raise ($/mo)',
  'excel.raisePerHr': 'Raise ($/hr)',
  'excel.benefitLossCol': 'Benefit Loss ($/mo)',
  'excel.netImpactCol': 'Net Impact ($/mo)',
  'excel.monthlyIncome': 'Monthly Income',
  'excel.schoolMeals': 'School Meals',
  'excel.totalBenefits': 'Total Benefits',
  'excel.thresholdTitle': '2025 Monthly Income Thresholds by Household Size',
  'excel.fplTitle': 'Federal Poverty Level (100% FPL) - Monthly',
  'excel.smiTitle': 'State Median Income (SMI) - Monthly',
  'excel.foodshareTitle': 'FoodShare Constants (FFY 2025)',
  'excel.maxAllotments': 'Max Allotments',
  'excel.maxAllotment': 'Max Allotment',
  'excel.standardDeduction': 'Standard Deduction',
  'excel.benefitValueConstants': 'Benefit Value Constants',
  'excel.freeMealsLabel': 'Free School Meals (per child/mo)',
  'excel.reducedMealsLabel': 'Reduced School Meals (per child/mo)',
  'excel.wheapLabel': 'WHEAP (monthly equivalent)',
  'excel.sources': 'Sources:',

  // Disclaimer
  'disclaimer.text': 'This calculator provides estimates based on 2025 income eligibility thresholds published by UW-Madison Division of Extension. Estimated benefit values are approximations. Actual eligibility depends on additional factors including assets, deductions, household composition, and immigration status. This tool does not replace official eligibility determinations.',
  'disclaimer.accessWi': 'Apply through ACCESS Wisconsin for official benefit decisions.',
  'disclaimer.contact': 'Contact your county financial educator or call 211 (877-847-2211) for personalized guidance.',

  // Error boundary
  'error.title': 'Something went wrong',
  'error.reload': 'Reload',
  'error.exportFailed': 'Export failed. Please try again.',

  // Excel reference sheet
  'excel.hhPrefix': 'HH',
  'excel.fpl100Label': '100% FPL',
  'excel.fpl200Label': '200% FPL',
  'excel.smi60Label': '60% SMI (WHEAP)',
  'excel.smi85Label': '85% SMI (WI Shares)',
  'excel.sourceUW': 'UW-Madison Division of Extension, "Benefit Cliffs for Wisconsin Public Programs" (2025)',
  'excel.sourceDHS': 'Wisconsin DHS, DMS Operations Memo 2024-18 (FoodShare FFY 2025)',
  'excel.sourceUSDA': 'USDA FNS, FR 07/24/2025 (School meal reimbursement rates SY 2025-26)',
  'excel.sourceDCF': 'Wisconsin DCF (Wisconsin Shares entry/exit thresholds)',

  // Accessibility
  'a11y.skipToContent': 'Skip to content',
} as const

export type I18nKey = keyof typeof en
