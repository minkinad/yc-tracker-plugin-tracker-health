export type HealthRuleId =
    'assignee' | 'priority' | 'description' | 'issue-type' | 'estimate' | 'acceptance-criteria';

export type RuleStatus = 'passed' | 'failed' | 'skipped';

export type HealthLevel = 'healthy' | 'warning' | 'critical';

export interface IssueHealthContext {
    id: string;
    key: string;
    summary: string;
    description?: string | null;
    assignee?: {
        id: string;
        displayName: string;
    } | null;
    priority?: {
        id: string;
        name: string;
    } | null;
    issueType?: {
        id: string;
        name: string;
    } | null;
    estimation?: number | null;
}

export interface RuleResult {
    ruleId: HealthRuleId;
    status: RuleStatus;
    weight: number;
    title: string;
    message: string;
    recommendation?: string;
}

export interface HealthRule {
    id: HealthRuleId;
    name: string;
    description: string;
    weight: number;

    evaluate(context: IssueHealthContext): RuleResult;
}

export interface IssueHealthResult {
    score: number;
    level: HealthLevel;
    passedWeight: number;
    totalWeight: number;
    passedRules: number;
    failedRules: number;
    skippedRules: number;
    results: RuleResult[];
}
