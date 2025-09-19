export type TrendPoint = {
  month: string;
  value: number;
};

export type TableValue = {
  year: number;
  claims: number;
  beneficiaries: number;
};

export type Approval = {
  applicationNumber: string;
  approvalDate: string;
  status: string;
  notes?: string;
};

export type WarningInfo = {
  boxedWarning?: string;
  warnings: string[];
  approvals: Approval[];
  earliestApprovalDate?: string;
  hasUsApproval: boolean;
};

export type FaersInfo = {
  totalReports5y: number;
  topReactions: { name: string; count: number }[];
};

export type ClinicalTrialsInfo = {
  total: number;
  last5y: number;
  byStatus: { status: string; count: number }[];
};

export type DrugEnriched = {
  rank: number;
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

export type Dataset = {
  generatedAt: string;
  cacheTtlDays: number;
  note?: string;
  drugs: DrugEnriched[];
};
