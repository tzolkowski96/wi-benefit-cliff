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
  'form.raise': 'Aumento potencial',
  'form.raise.hourly': 'Aumento por hora',
  'form.raise.monthly': 'Aumento mensual',
  'form.monthlyEquivalent': 'equivalente mensual',
  'form.deductionsToggle': 'Opcional: mejorar precisi\u00f3n de FoodShare',
  'form.deductionsHelp': 'Agregar sus costos de vivienda y cuidado infantil puede aumentar su beneficio estimado de FoodShare.',
  'form.rent': 'Alquiler/hipoteca mensual',
  'form.childcare': 'Costos mensuales de cuidado infantil',
  'form.deductionsNote': 'Los costos de servicios p\u00fablicos se estiman usando la Asignaci\u00f3n Est\u00e1ndar de Calefacci\u00f3n de Wisconsin ($538/mes). La deducci\u00f3n por vivienda tiene un l\u00edmite de $712/mes.',
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
  'result.freeToReduced': 'GRATIS \u2192 REDUCIDO',
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

  // Programs
  'program.cutoff': 'L\u00edmite',
  'program.value': 'valor',
  'program.entry': 'Entrada',
  'program.continuation': 'Continuaci\u00f3n',
  'program.entryCutoff': 'L\u00edmite de entrada (para comenzar a recibir)',
  'program.continuationCutoff': 'L\u00edmite de continuaci\u00f3n (para mantener si est\u00e1 inscrito)',
  'program.eligibilityOnly': 'Elegibilidad mostrada \u2014 el valor en d\u00f3lares var\u00eda seg\u00fan el individuo',

  // Tier 2 note
  'tier2.note': 'Los programas marcados como "Elegibilidad mostrada" pueden tener un valor financiero significativo, pero var\u00eda demasiado seg\u00fan las circunstancias individuales para estimarlo. El impacto neto mostrado arriba solo incluye programas con valores calculables.',
  'tier2.optionalNote': 'Opcional. Ingrese sus ahorros mensuales reales para incluirlos en el c\u00e1lculo del impacto neto.',

  // FoodShare note
  'foodshare.note': 'Su cantidad real de FoodShare puede ser mayor si tiene costos altos de alquiler o cuidado infantil. Esta estimaci\u00f3n usa una f\u00f3rmula simplificada.',

  // School meals note
  'schoolMeals.note': 'Los valores de comidas escolares reflejan las tasas de reembolso federal \u2014 el costo de proporcionar comidas, no sus ahorros directos. Sus ahorros reales pueden ser menores si normalmente empaca comidas desde casa.',

  // WHEAP note
  'wheap.note': 'WHEAP es un pago anual \u00fanico que promedia ~$665, mostrado aqu\u00ed como equivalente mensual.',

  // BadgerCare note
  'badgercare.lostNote': 'Necesitar\u00eda cobertura del Mercado ACA. Puede calificar para cr\u00e9ditos fiscales de prima por encima del 100% FPL.',

  // Wisconsin Shares note
  'shares.note': 'El monto del subsidio var\u00eda. Contacte a su agencia local de Wisconsin Shares para su calendario de copagos espec\u00edfico.',

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

  // Disclaimer
  'disclaimer.text': 'Esta calculadora proporciona estimaciones basadas en los umbrales de elegibilidad de ingresos de 2025 publicados por la Divisi\u00f3n de Extensi\u00f3n de UW-Madison. Los valores estimados de beneficios son aproximaciones. La elegibilidad real depende de factores adicionales incluyendo activos, deducciones, composici\u00f3n del hogar y estatus migratorio. Esta herramienta no reemplaza las determinaciones oficiales de elegibilidad.',
  'disclaimer.accessWi': 'Solicite a trav\u00e9s de ACCESS Wisconsin para decisiones oficiales de beneficios.',
  'disclaimer.contact': 'Contacte a su educador financiero del condado o llame al 211 (877-847-2211) para orientaci\u00f3n personalizada.',

  // Accessibility
  'a11y.skipToContent': 'Saltar al contenido',
  'a11y.currentIncome': 'Ingreso actual',
  'a11y.afterRaise': 'Despu\u00e9s del aumento',
  'a11y.eligibilityCutoff': 'L\u00edmite de elegibilidad',
}
