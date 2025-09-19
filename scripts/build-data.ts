import { promises as fs } from 'fs';
import path from 'path';

type TrendPoint = {
  month: string;
  value: number;
};

type TableValue = {
  year: number;
  claims: number;
  beneficiaries: number;
};

type Approval = {
  applicationNumber: string;
  approvalDate: string;
  status: string;
  notes?: string;
};

type WarningInfo = {
  boxedWarning?: string;
  warnings: string[];
  approvals: Approval[];
  earliestApprovalDate?: string;
  hasUsApproval: boolean;
};

type FaersInfo = {
  totalReports5y: number;
  topReactions: { name: string; count: number }[];
};

type ClinicalTrialsInfo = {
  total: number;
  last5y: number;
  byStatus: { status: string; count: number }[];
};

type DrugEnriched = {
  slug: string;
  genericName: string;
  brandNames: string[];
  alternateNames: string[];
  activeIngredients: string[];
  rxCui?: string;
  atcClasses: string[];
  molecularFormula?: string;
  searchVolume: number;
  searchTrend: TrendPoint[];
  medicarePartD: TableValue[];
  fda: WarningInfo;
  faers: FaersInfo;
  clinicalTrials: ClinicalTrialsInfo;
  metadata: {
    llmGenerated: boolean;
    sourcesCachedAt: Record<string, string>;
  };
};

type BaseDrug = {
  slug: string;
  name: string;
  altNames: string;
  activeIngredients: string;
};

type StubDrug = {
  genericName: string;
  brandNames: string[];
  atcClasses: string[];
  rxCui: string;
  molecularFormula: string;
  searchVolume: number;
  trendBase: number;
  trendVariance: number;
  medicarePartD: TableValue[];
  fda: WarningInfo;
  faers: FaersInfo;
  clinicalTrials: ClinicalTrialsInfo;
};

const CACHE_TTL_DAYS = 30;
const OUTPUT_FILE = path.join(process.cwd(), 'data', 'build', 'drugs_enriched.json');
const SOURCE_FILE = path.join(process.cwd(), 'data', 'sources', 'drugs_list.json');
const CACHE_ROOT = path.join(process.cwd(), 'data', 'cache');

const stubDrugs: Record<string, StubDrug> = {
  sertraline: {
    genericName: 'Sertraline',
    brandNames: ['Zoloft', 'Lustral'],
    atcClasses: ['N06AB06'],
    rxCui: '36567',
    molecularFormula: 'C17H17Cl2N',
    searchVolume: 74000,
    trendBase: 72000,
    trendVariance: 6000,
    medicarePartD: [
      { year: 2022, claims: 1850000, beneficiaries: 910000 },
      { year: 2021, claims: 1780000, beneficiaries: 880000 },
      { year: 2020, claims: 1690000, beneficiaries: 845000 },
      { year: 2019, claims: 1610000, beneficiaries: 810000 },
      { year: 2018, claims: 1540000, beneficiaries: 775000 }
    ],
    fda: {
      boxedWarning: 'Antidepressants increased the risk compared to placebo of suicidal thinking and behavior in children, adolescents, and young adults.',
      warnings: [
        'Serotonin syndrome risk when combined with other serotonergic drugs.',
        'Potential for activation of mania or hypomania.',
        'Discontinuation may result in withdrawal symptoms.'
      ],
      approvals: [
        {
          applicationNumber: 'NDA020990',
          approvalDate: '1991-12-30',
          status: 'Approved',
          notes: 'Initial approval for major depressive disorder.'
        }
      ],
      earliestApprovalDate: '1991-12-30',
      hasUsApproval: true
    },
    faers: {
      totalReports5y: 12940,
      topReactions: [
        { name: 'Drug ineffective', count: 1550 },
        { name: 'Anxiety', count: 820 },
        { name: 'Nausea', count: 740 }
      ]
    },
    clinicalTrials: {
      total: 312,
      last5y: 44,
      byStatus: [
        { status: 'Completed', count: 188 },
        { status: 'Recruiting', count: 32 },
        { status: 'Active, not recruiting', count: 27 }
      ]
    }
  },
  fluoxetine: {
    genericName: 'Fluoxetine',
    brandNames: ['Prozac', 'Sarafem'],
    atcClasses: ['N06AB03'],
    rxCui: '4493',
    molecularFormula: 'C17H18F3NO',
    searchVolume: 60500,
    trendBase: 59000,
    trendVariance: 5500,
    medicarePartD: [
      { year: 2022, claims: 1320000, beneficiaries: 670000 },
      { year: 2021, claims: 1280000, beneficiaries: 655000 },
      { year: 2020, claims: 1210000, beneficiaries: 620000 },
      { year: 2019, claims: 1170000, beneficiaries: 603000 },
      { year: 2018, claims: 1100000, beneficiaries: 575000 }
    ],
    fda: {
      boxedWarning: 'Antidepressants increased the risk compared to placebo of suicidal thinking and behavior in children, adolescents, and young adults.',
      warnings: [
        'Potential for QT prolongation when combined with other agents.',
        'May cause activation of mania in bipolar disorder.',
        'Risk of serotonin syndrome.'
      ],
      approvals: [
        {
          applicationNumber: 'NDA018936',
          approvalDate: '1987-12-29',
          status: 'Approved',
          notes: 'Initial approval for major depressive disorder.'
        }
      ],
      earliestApprovalDate: '1987-12-29',
      hasUsApproval: true
    },
    faers: {
      totalReports5y: 10120,
      topReactions: [
        { name: 'Drug ineffective', count: 1290 },
        { name: 'Suicidal ideation', count: 640 },
        { name: 'Depression', count: 610 }
      ]
    },
    clinicalTrials: {
      total: 284,
      last5y: 35,
      byStatus: [
        { status: 'Completed', count: 171 },
        { status: 'Recruiting', count: 26 },
        { status: 'Terminated', count: 21 }
      ]
    }
  },
  escitalopram: {
    genericName: 'Escitalopram',
    brandNames: ['Lexapro', 'Cipralex'],
    atcClasses: ['N06AB10'],
    rxCui: '35207',
    molecularFormula: 'C20H21FN2O',
    searchVolume: 56200,
    trendBase: 54000,
    trendVariance: 5200,
    medicarePartD: [
      { year: 2022, claims: 1490000, beneficiaries: 740000 },
      { year: 2021, claims: 1430000, beneficiaries: 710000 },
      { year: 2020, claims: 1350000, beneficiaries: 675000 },
      { year: 2019, claims: 1290000, beneficiaries: 640000 },
      { year: 2018, claims: 1210000, beneficiaries: 605000 }
    ],
    fda: {
      boxedWarning: 'Antidepressants increased the risk compared to placebo of suicidal thinking and behavior in children, adolescents, and young adults.',
      warnings: [
        'Risk of QT prolongation especially at high doses.',
        'Serotonin syndrome when used with other serotonergic drugs.',
        'Monitor for hyponatremia particularly in elderly patients.'
      ],
      approvals: [
        {
          applicationNumber: 'NDA021323',
          approvalDate: '2002-08-14',
          status: 'Approved',
          notes: 'Initial approval for major depressive disorder.'
        }
      ],
      earliestApprovalDate: '2002-08-14',
      hasUsApproval: true
    },
    faers: {
      totalReports5y: 8930,
      topReactions: [
        { name: 'Anxiety', count: 710 },
        { name: 'Nausea', count: 640 },
        { name: 'Headache', count: 580 }
      ]
    },
    clinicalTrials: {
      total: 205,
      last5y: 29,
      byStatus: [
        { status: 'Completed', count: 132 },
        { status: 'Recruiting', count: 19 },
        { status: 'Active, not recruiting', count: 18 }
      ]
    }
  },
  aripiprazole: {
    genericName: 'Aripiprazole',
    brandNames: ['Abilify', 'Abilify Maintena'],
    atcClasses: ['N05AX12'],
    rxCui: '83367',
    molecularFormula: 'C23H27Cl2N3O2',
    searchVolume: 48200,
    trendBase: 47000,
    trendVariance: 4800,
    medicarePartD: [
      { year: 2022, claims: 760000, beneficiaries: 310000 },
      { year: 2021, claims: 735000, beneficiaries: 302000 },
      { year: 2020, claims: 702000, beneficiaries: 289000 },
      { year: 2019, claims: 671000, beneficiaries: 274000 },
      { year: 2018, claims: 640000, beneficiaries: 261000 }
    ],
    fda: {
      boxedWarning: 'Elderly patients with dementia-related psychosis treated with antipsychotic drugs are at an increased risk of death.',
      warnings: [
        'May cause pathologic gambling and other impulse-control problems.',
        'Risk of neuroleptic malignant syndrome.',
        'Monitor for metabolic changes including hyperglycemia.'
      ],
      approvals: [
        {
          applicationNumber: 'NDA021436',
          approvalDate: '2002-11-15',
          status: 'Approved',
          notes: 'Initial approval for schizophrenia.'
        }
      ],
      earliestApprovalDate: '2002-11-15',
      hasUsApproval: true
    },
    faers: {
      totalReports5y: 11220,
      topReactions: [
        { name: 'Weight increased', count: 910 },
        { name: 'Akathisia', count: 870 },
        { name: 'Drug ineffective', count: 690 }
      ]
    },
    clinicalTrials: {
      total: 258,
      last5y: 33,
      byStatus: [
        { status: 'Completed', count: 154 },
        { status: 'Recruiting', count: 24 },
        { status: 'Suspended', count: 9 }
      ]
    }
  },
  quetiapine: {
    genericName: 'Quetiapine',
    brandNames: ['Seroquel', 'Seroquel XR'],
    atcClasses: ['N05AH04'],
    rxCui: '114938',
    molecularFormula: 'C21H25N3O2S',
    searchVolume: 35100,
    trendBase: 34000,
    trendVariance: 4200,
    medicarePartD: [
      { year: 2022, claims: 920000, beneficiaries: 405000 },
      { year: 2021, claims: 901000, beneficiaries: 398000 },
      { year: 2020, claims: 874000, beneficiaries: 384000 },
      { year: 2019, claims: 842000, beneficiaries: 371000 },
      { year: 2018, claims: 810000, beneficiaries: 357000 }
    ],
    fda: {
      boxedWarning: 'Elderly patients with dementia-related psychosis treated with antipsychotic drugs are at an increased risk of death.',
      warnings: [
        'Risk of orthostatic hypotension, especially during dose titration.',
        'Potential for cataract development; eye exams recommended.',
        'May cause metabolic changes including weight gain.'
      ],
      approvals: [
        {
          applicationNumber: 'NDA020639',
          approvalDate: '1997-09-26',
          status: 'Approved',
          notes: 'Initial approval for schizophrenia.'
        }
      ],
      earliestApprovalDate: '1997-09-26',
      hasUsApproval: true
    },
    faers: {
      totalReports5y: 9620,
      topReactions: [
        { name: 'Somnolence', count: 810 },
        { name: 'Weight increased', count: 720 },
        { name: 'Dizziness', count: 610 }
      ]
    },
    clinicalTrials: {
      total: 233,
      last5y: 27,
      byStatus: [
        { status: 'Completed', count: 148 },
        { status: 'Recruiting', count: 18 },
        { status: 'Terminated', count: 16 }
      ]
    }
  },
  olanzapine: {
    genericName: 'Olanzapine',
    brandNames: ['Zyprexa', 'Zyprexa Zydis'],
    atcClasses: ['N05AH03'],
    rxCui: '6130',
    molecularFormula: 'C17H20N4S',
    searchVolume: 29800,
    trendBase: 28500,
    trendVariance: 3900,
    medicarePartD: [
      { year: 2022, claims: 640000, beneficiaries: 259000 },
      { year: 2021, claims: 618000, beneficiaries: 250000 },
      { year: 2020, claims: 592000, beneficiaries: 239000 },
      { year: 2019, claims: 561000, beneficiaries: 226000 },
      { year: 2018, claims: 530000, beneficiaries: 214000 }
    ],
    fda: {
      boxedWarning: 'Elderly patients with dementia-related psychosis treated with antipsychotic drugs are at an increased risk of death.',
      warnings: [
        'May cause severe metabolic changes including hyperglycemia.',
        'Monitor for neuroleptic malignant syndrome.',
        'Associated with weight gain and dyslipidemia.'
      ],
      approvals: [
        {
          applicationNumber: 'NDA020592',
          approvalDate: '1996-09-30',
          status: 'Approved',
          notes: 'Initial approval for schizophrenia.'
        }
      ],
      earliestApprovalDate: '1996-09-30',
      hasUsApproval: true
    },
    faers: {
      totalReports5y: 8450,
      topReactions: [
        { name: 'Weight increased', count: 770 },
        { name: 'Hyperglycemia', count: 520 },
        { name: 'Somnolence', count: 480 }
      ]
    },
    clinicalTrials: {
      total: 221,
      last5y: 24,
      byStatus: [
        { status: 'Completed', count: 142 },
        { status: 'Recruiting', count: 16 },
        { status: 'Withdrawn', count: 8 }
      ]
    }
  }
};

const trendMonthFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit'
});

function generateTrend(base: number, variance: number): TrendPoint[] {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const points: TrendPoint[] = [];
  for (let i = 59; i >= 0; i -= 1) {
    const pointDate = new Date(start);
    pointDate.setMonth(start.getMonth() - i);
    const seasonal = Math.sin((i / 12) * Math.PI * 2) * 0.08;
    const noise = (Math.sin(i * 1.7) + Math.cos(i * 0.5)) * 0.02;
    const deterministic = Math.sin((base + i * 17.23) * 12.9898) * 43758.5453;
    const jitter = deterministic - Math.floor(deterministic);
    const value = Math.max(0, Math.round(base * (1 + seasonal + noise) + (jitter - 0.5) * variance));
    points.push({
      month: trendMonthFormatter.format(pointDate),
      value
    });
  }
  return points;
}

async function readBaseList(): Promise<BaseDrug[]> {
  const raw = await fs.readFile(SOURCE_FILE, 'utf8');
  const parsed = JSON.parse(raw) as BaseDrug[];
  return parsed;
}

async function ensureCacheDir(source: string) {
  const dir = path.join(CACHE_ROOT, source);
  await fs.mkdir(dir, { recursive: true });
}

async function writeCache<T>(source: string, slug: string, data: T) {
  await ensureCacheDir(source);
  const payload = {
    cachedAt: new Date().toISOString(),
    ttlDays: CACHE_TTL_DAYS,
    llmGenerated: true,
    data
  };
  await fs.writeFile(
    path.join(CACHE_ROOT, source, `${slug}.json`),
    JSON.stringify(payload, null, 2)
  );
}

async function build(): Promise<void> {
  const baseList = await readBaseList();
  const enriched: DrugEnriched[] = [];

  for (const item of baseList) {
    const stub = stubDrugs[item.slug];
    if (!stub) {
      continue;
    }

    const trend = generateTrend(stub.trendBase, stub.trendVariance);
    await writeCache('ahrefs', item.slug, {
      searchVolume: stub.searchVolume,
      trend,
      note: 'LLM-generated Ahrefs-style cache stub.'
    });

    await writeCache('openfda-label', item.slug, {
      warnings: stub.fda.warnings,
      boxedWarning: stub.fda.boxedWarning,
      note: 'LLM-generated openFDA label cache stub.'
    });

    await writeCache('openfda-drugsfda', item.slug, {
      approvals: stub.fda.approvals,
      earliestApprovalDate: stub.fda.earliestApprovalDate,
      hasUsApproval: stub.fda.hasUsApproval,
      note: 'LLM-generated openFDA Drugs@FDA cache stub.'
    });

    await writeCache('faers', item.slug, {
      summary: stub.faers,
      note: 'LLM-generated FAERS cache stub.'
    });

    await writeCache('clinicaltrials', item.slug, {
      summary: stub.clinicalTrials,
      note: 'LLM-generated ClinicalTrials.gov cache stub.'
    });

    await writeCache('cms', item.slug, {
      table: stub.medicarePartD,
      note: 'LLM-generated CMS Part D cache stub.'
    });

    await writeCache('pubchem', item.slug, {
      molecularFormula: stub.molecularFormula,
      note: 'LLM-generated PubChem cache stub.'
    });

    await writeCache('rxnorm', item.slug, {
      rxCui: stub.rxCui,
      atcClasses: stub.atcClasses,
      note: 'LLM-generated RxNorm/RxClass cache stub.'
    });

    const alternateNames = item.altNames
      .split('|')
      .map((name) => name.trim())
      .filter(
        (name) =>
          Boolean(name) &&
          name.toLowerCase() !== stub.genericName.toLowerCase() &&
          !stub.brandNames.some((brand) => brand.toLowerCase() === name.toLowerCase())
      );
    const activeIngredients = item.activeIngredients
      .split('|')
      .map((name) => name.trim())
      .filter(Boolean);

    enriched.push({
      slug: item.slug,
      genericName: stub.genericName,
      brandNames: stub.brandNames,
      alternateNames,
      activeIngredients,
      rxCui: stub.rxCui,
      atcClasses: stub.atcClasses,
      molecularFormula: stub.molecularFormula,
      searchVolume: stub.searchVolume,
      searchTrend: trend,
      medicarePartD: stub.medicarePartD,
      fda: stub.fda,
      faers: stub.faers,
      clinicalTrials: stub.clinicalTrials,
      metadata: {
        llmGenerated: true,
        sourcesCachedAt: {
          ahrefs: new Date().toISOString(),
          openfdaLabel: new Date().toISOString(),
          openfdaDrugsfda: new Date().toISOString(),
          faers: new Date().toISOString(),
          clinicalTrials: new Date().toISOString(),
          cms: new Date().toISOString(),
          pubchem: new Date().toISOString(),
          rxnorm: new Date().toISOString()
        }
      }
    });
  }

  enriched.sort((a, b) => b.searchVolume - a.searchVolume);

  const ranked = enriched.map((drug, index) => ({
    rank: index + 1,
    ...drug
  }));

  const output = {
    generatedAt: new Date().toISOString(),
    cacheTtlDays: CACHE_TTL_DAYS,
    note: 'LLM-generated synthetic dataset for static preview. Replace with live pipeline when available.',
    drugs: ranked
  };

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`Generated dataset with ${ranked.length} drugs.`);
}

build().catch((error) => {
  console.error('Failed to build data set', error);
  process.exitCode = 1;
});
