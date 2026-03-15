/**
 * Spanish translations.
 * Falls back to English for any empty string via the useI18n hook.
 */
import type { I18nKey } from './en.ts'

export const es: Record<I18nKey, string> = {
  // App
  'app.title': 'Calculadora de L\u00edmites de Beneficios',
  'app.subtitle': 'Beneficios P\u00fablicos de Wisconsin',
  'app.description': 'Vea c\u00f3mo un aumento afecta los beneficios totales de su familia en FoodShare, BadgerCare Plus, Wisconsin Shares, WHEAP y comidas escolares.',
  'app.source': 'Basado en los umbrales de elegibilidad de 2025 de UW-Madison Extension.',

  // Form
  'form.sectionLabel': 'Su Hogar',
  'form.householdSize': 'Tama\u00f1o del hogar',
  'form.numberOfChildren': 'Ni\u00f1os menores de 18',
  'form.incomeType': 'Tipo de ingreso',
  'form.incomeType.hourly': 'Por hora',
  'form.incomeType.monthly': 'Mensual',
  'form.hourlyWage': 'Salario por hora actual',
  'form.monthlyIncome': 'Ingreso mensual actual',
  'form.raise.hourly': 'Aumento por hora',
  'form.raise.monthly': 'Aumento mensual',
  'form.deductionsToggle': 'Opcional: mejorar precisi\u00f3n de FoodShare',
  'form.deductionsHelp': 'Agregar sus costos de vivienda y cuidado infantil puede aumentar su beneficio estimado de FoodShare.',
  'form.rent': 'Alquiler/hipoteca mensual',
  'form.childcare': 'Costos mensuales de cuidado infantil',
  'form.deductionsNote': 'Los costos de servicios p\u00fablicos se estiman usando la Asignaci\u00f3n Est\u00e1ndar de Calefacci\u00f3n de Wisconsin ($538/mes). La deducci\u00f3n por vivienda tiene un l\u00edmite de $712/mes.',
  'form.description': 'Ingrese su pago actual y un posible aumento para ver c\u00f3mo afecta sus beneficios.',
  'form.raise.helpHourly': 'Si su pago aument\u00f3, \u00bfcu\u00e1nto m\u00e1s por hora ganar\u00eda?',
  'form.raise.helpMonthly': 'Si su pago aument\u00f3, \u00bfcu\u00e1nto m\u00e1s por mes ganar\u00eda?',
  'form.customValuePrompt': '\u00bfConoce su valor mensual?',

  // Results
  'result.netImpact': 'Impacto Neto',
  'result.raise': 'Aumento',
  'result.lostBenefits': 'Beneficios Perdidos',
  'result.netAnnual': 'Impacto Anual',
  'result.lost': 'PERDIDO',
  'result.keep': 'MANTENER',
  'result.notEligible': 'No elegible',
  'result.na': 'N/A',
  'result.buffer': 'margen',
  'result.noChange': 'sin cambio',
  'result.annualCalcImpact': 'en impacto calculable',
  'result.includesUserEntered': 'incluye {amount} ingresado por usuario',
  'result.notIncluded': 'No incluido arriba:',
  'result.variesByIndividual': 'elegibilidad perdida pero el valor en d\u00f3lares var\u00eda seg\u00fan el individuo.',

  // Cliff type badges
  'cliffType.hard': 'L\u00edmite duro',
  'cliffType.gradual': 'Gradual',
  'cliffType.tier_shift': 'Cambio de nivel',

  // Sections
  'section.chart': 'Ingreso vs. Umbrales de Elegibilidad',
  'section.breakdown': 'Desglose por Programa',
  'section.safeRaise': 'Zonas de Aumento Seguro',
  'section.breakEven': '\u00bfQu\u00e9 aumento necesito?',
  'section.additionalRisks': 'Beneficios Adicionales en Riesgo',

  // Chart
  'chart.current': 'Actual',
  'chart.afterRaise': 'Despu\u00e9s del aumento',
  'chart.cutoff': 'L\u00edmite de elegibilidad',
  'chart.srCaption': 'Posici\u00f3n de ingresos en relaci\u00f3n con los umbrales de elegibilidad de programas de beneficios',

  // Warnings
  'warning.cliffTitle': 'Advertencia de L\u00edmite',
  'warning.cliffBody': 'Este aumento le costar\u00eda a su hogar m\u00e1s en beneficios perdidos de lo que agrega en ingresos.',
  'warning.worseOff': 'peor situaci\u00f3n',
  'warning.headsUp': 'Atenci\u00f3n',
  'warning.stillAhead': 'pero a\u00fan saldr\u00eda ganando',
  'warning.budgetTransition': 'Vale la pena tomarlo, pero presupueste para la transici\u00f3n.',
  'warning.considerSmaller': 'Considere un aumento menor que lo mantenga por debajo del l\u00edmite, o un aumento mayor que supere la brecha.',

  // Safe raise
  'safeRaise.description': 'Aumento m\u00e1ximo que puede tomar sin perder cada beneficio que tiene actualmente:',
  'safeRaise.upTo': 'hasta',
  'safeRaise.bottomLine': 'En resumen',
  'safeRaise.safeMessage': 'Puede tomar con seguridad hasta {amount}/mes sin perder ning\u00fan beneficio actual.',
  'safeRaise.exceedsMessage': 'Su aumento actual excede esto.',
  'safeRaise.atThreshold': 'Est\u00e1 en o por encima del umbral de elegibilidad m\u00e1s bajo. Cualquier aumento puede activar un l\u00edmite.',

  // Break-even
  'breakEven.description': 'Aumento m\u00ednimo para recuperar lo perdido despu\u00e9s de cruzar cada l\u00edmite de beneficio, considerando todas las p\u00e9rdidas simult\u00e1neas:',
  'breakEven.cliffAt': 'l\u00edmite en',
  'breakEven.clearAll': 'Para superar todos los l\u00edmites:',
  'breakEven.raiseAtLeast': 'Un aumento de al menos',
  'breakEven.offsetAll': 'compensar\u00eda todas las p\u00e9rdidas de beneficios.',
  'breakEven.needAtLeast': 'Necesita al menos',
  'breakEven.toBreakEven': 'para recuperar lo perdido despu\u00e9s de cruzar este l\u00edmite.',

  // Program names
  'program.foodshare': 'FoodShare',
  'program.badgercare_adult': 'BadgerCare Plus (Adultos)',
  'program.badgercare_children': 'BadgerCare Plus (Niños)',
  'program.wisconsin_shares': 'Wisconsin Shares',
  'program.wheap': 'WHEAP',
  'program.school_meals_free': 'Comidas Escolares Gratuitas',
  'program.school_meals_reduced': 'Comidas Escolares de Precio Reducido',

  // Programs
  'program.cutoff': 'Límite',
  'program.value': 'valor',
  'program.entry': 'Entrada',
  'program.continuation': 'Continuaci\u00f3n',
  'program.eligibilityOnly': 'Elegibilidad mostrada \u2014 el valor en d\u00f3lares var\u00eda seg\u00fan el individuo',

  // Tier 2 note
  'tier2.note': 'Los programas marcados como "Elegibilidad mostrada" pueden tener un valor financiero significativo, pero var\u00eda demasiado seg\u00fan las circunstancias individuales para estimarlo. El impacto neto mostrado arriba solo incluye programas con valores calculables.',
  'tier2.optionalNote': 'Opcional. Ingrese sus ahorros mensuales reales para incluirlos en el c\u00e1lculo del impacto neto.',

  // Print
  'print.title': 'Resumen del An\u00e1lisis de L\u00edmites de Beneficios',
  'print.generated': 'Generado',
  'print.button': 'Imprimir Resumen',
  'print.householdDetails': 'Detalles del Hogar',
  'print.netImpact': 'Impacto Neto Calculable',
  'print.safeRaise': 'Aumento Seguro M\u00e1ximo',
  'print.breakEven': 'Aumentos de Equilibrio',
  'print.program': 'Programa',
  'print.threshold': 'Umbral',
  'print.type': 'Tipo',
  'print.valueImpact': 'Impacto de Valor',
  'print.status': 'Estado',
  'print.cliffAt': 'L\u00edmite En',
  'print.breakEvenCol': 'Equilibrio',
  'print.hourlyCol': 'Por Hora',
  'print.newMonthlyIncome': 'Nuevo ingreso mensual',
  'print.foodshareLoss': 'FoodShare',
  'print.schoolMealLoss': 'Comidas escolares',
  'print.wheapLoss': 'WHEAP',
  'print.userEnteredLoss': 'Ingresado por usuario',

  // Chart sections
  'section.incomeSweep': 'Impacto Neto por Monto de Aumento',
  'section.waterfall': 'Desglose del Impacto',
  'section.benefitStack': 'Beneficios Totales por Ingreso',
  'section.breakEvenPlot': 'Visualización de Equilibrio',

  // Income Sweep Chart
  'sweep.xAxis': 'Aumento mensual',
  'sweep.yAxis': 'Impacto neto mensual',
  'sweep.currentRaise': 'Su aumento',
  'sweep.tooltipRaise': 'Aumento',
  'sweep.tooltipLoss': 'Pérdida de beneficios',
  'sweep.tooltipNet': 'Impacto neto',
  'sweep.positiveZone': 'Mejor situación',
  'sweep.negativeZone': 'Peor situación',
  'sweep.description': 'Cómo cambia su ingreso neto con cada monto de aumento posible. Las caídas por debajo de cero significan que pierde más en beneficios de lo que gana.',
  'sweep.srCaption': 'Impacto neto mensual para varios montos de aumento, mostrando dónde los límites de beneficios reducen o eliminan las ganancias',

  // Waterfall Chart
  'waterfall.raise': 'Aumento',
  'waterfall.net': 'Impacto Neto',
  'waterfall.srCaption': 'Desglose del monto del aumento menos las pérdidas de beneficios mostrando el impacto neto',

  // Benefit Stack Chart
  'stack.xAxis': 'Ingreso mensual',
  'stack.yAxis': 'Valor mensual de beneficios',
  'stack.currentIncome': 'Actual',
  'stack.afterRaise': 'Con aumento',
  'stack.description': 'Valor total de beneficios calculables en cada nivel de ingreso. El límite es visible donde las bandas caen abruptamente.',
  'stack.srCaption': 'Valor mensual total de beneficios a través de niveles de ingreso mostrando cómo se reducen los beneficios',

  // Break-Even Dot Plot
  'dotPlot.xAxis': 'Aumento mensual',
  'dotPlot.cliffDistance': 'Se activa el límite',
  'dotPlot.breakEven': 'Equilibrio',
  'dotPlot.yourRaise': 'Su aumento',
  'dotPlot.gap': 'Brecha a cubrir',
  'dotPlot.srCaption': 'Montos de aumento de equilibrio comparados con las distancias de límite para cada programa de beneficios',

  // Unit suffixes
  'unit.perMonth': '/mes',
  'unit.perYear': '/a\u00f1o',
  'unit.perHour': '/hr',

  // Labels
  'label.disclaimer': 'Descargo',
  'label.yes': 'S\u00ed',
  'label.no': 'No',
  'label.total': 'Total',
  'label.item': 'Elemento',
  'label.amount': 'Monto',

  // Accessibility (additional)
  'a11y.language': 'Idioma',
  'a11y.customValueFor': 'Valor mensual personalizado para {name}',
  'a11y.breakEvenExceeded': 'El aumento actual excede el punto de equilibrio',

  // Warning (plural-safe)
  'warning.benefitLostSingular': '1 beneficio perdido,',
  'warning.benefitsLostPlural': '{count} beneficios perdidos,',

  // Chart SR
  'chart.tierTo': 'a',

  // Excel Export
  'export.button': 'Exportar Excel',
  'export.sheetSummary': 'Resumen del Escenario',
  'export.sheetPrograms': 'Estado de Programas',
  'export.sheetBreakEven': 'An\u00e1lisis de Equilibrio',
  'export.sheetSensitivity': 'Sensibilidad de Ingresos',
  'export.sheetBenefitLevels': 'Niveles de Beneficios',
  'export.sheetReference': 'Referencia de Programas',
  'export.filename': 'analisis-limites-beneficios',

  // Excel column headers
  'excel.basis': 'Base',
  'excel.eligibleNow': 'Elegible ahora',
  'excel.eligibleAfter': 'Elegible despu\u00e9s',
  'excel.distanceToCliff': 'Distancia al l\u00edmite',
  'excel.currentValue': 'Valor actual (/mes)',
  'excel.newValue': 'Nuevo valor (/mes)',
  'excel.monthlyLoss': 'P\u00e9rdida mensual',
  'excel.cliffDistanceCol': 'Distancia al l\u00edmite (/mes)',
  'excel.breakEvenMo': 'Aumento de equilibrio (/mes)',
  'excel.breakEvenHr': 'Aumento de equilibrio (/hr)',
  'excel.raisePerMo': 'Aumento ($/mes)',
  'excel.raisePerHr': 'Aumento ($/hr)',
  'excel.benefitLossCol': 'P\u00e9rdida de beneficios ($/mes)',
  'excel.netImpactCol': 'Impacto neto ($/mes)',
  'excel.monthlyIncome': 'Ingreso mensual',
  'excel.schoolMeals': 'Comidas escolares',
  'excel.totalBenefits': 'Beneficios totales',
  'excel.thresholdTitle': 'Umbrales de Ingresos Mensuales 2025 por Tama\u00f1o del Hogar',
  'excel.fplTitle': 'Nivel Federal de Pobreza (100% FPL) - Mensual',
  'excel.smiTitle': 'Ingreso Mediano Estatal (SMI) - Mensual',
  'excel.foodshareTitle': 'Constantes de FoodShare (FFY 2025)',
  'excel.maxAllotments': 'Asignaciones m\u00e1ximas',
  'excel.maxAllotment': 'Asignaci\u00f3n m\u00e1xima',
  'excel.standardDeduction': 'Deducci\u00f3n est\u00e1ndar',
  'excel.benefitValueConstants': 'Constantes de Valor de Beneficios',
  'excel.freeMealsLabel': 'Comidas escolares gratuitas (por ni\u00f1o/mes)',
  'excel.reducedMealsLabel': 'Comidas escolares reducidas (por ni\u00f1o/mes)',
  'excel.wheapLabel': 'WHEAP (equivalente mensual)',
  'excel.sources': 'Fuentes:',

  // Disclaimer
  'disclaimer.text': 'Esta calculadora proporciona estimaciones basadas en los umbrales de elegibilidad de ingresos de 2025 publicados por la Divisi\u00f3n de Extensi\u00f3n de UW-Madison. Los valores estimados de beneficios son aproximaciones. La elegibilidad real depende de factores adicionales incluyendo activos, deducciones, composici\u00f3n del hogar y estatus migratorio. Esta herramienta no reemplaza las determinaciones oficiales de elegibilidad.',
  'disclaimer.accessWi': 'Solicite a trav\u00e9s de ACCESS Wisconsin para decisiones oficiales de beneficios.',
  'disclaimer.contact': 'Contacte a su educador financiero del condado o llame al 211 (877-847-2211) para orientaci\u00f3n personalizada.',

  // Error boundary
  'error.title': 'Algo sali\u00f3 mal',
  'error.reload': 'Recargar',
  'error.exportFailed': 'La exportaci\u00f3n fall\u00f3. Por favor int\u00e9ntelo de nuevo.',

  // Excel reference sheet
  'excel.hhPrefix': 'Hogar',
  'excel.fpl100Label': '100% FPL',
  'excel.fpl200Label': '200% FPL',
  'excel.smi60Label': '60% SMI (WHEAP)',
  'excel.smi85Label': '85% SMI (WI Shares)',
  'excel.sourceUW': 'UW-Madison Division of Extension, "Benefit Cliffs for Wisconsin Public Programs" (2025)',
  'excel.sourceDHS': 'Wisconsin DHS, DMS Operations Memo 2024-18 (FoodShare FFY 2025)',
  'excel.sourceUSDA': 'USDA FNS, FR 07/24/2025 (Tasas de reembolso de comidas escolares SY 2025-26)',
  'excel.sourceDCF': 'Wisconsin DCF (Umbrales de entrada/salida de Wisconsin Shares)',

  // Accessibility
  'a11y.skipToContent': 'Saltar al contenido',
}
