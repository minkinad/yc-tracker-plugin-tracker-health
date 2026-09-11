import type { HealthRule, RuleResult } from '../types';

const WEIGHT = 10;

export const issueTypeRule: HealthRule = {
    id: 'issue-type',
    name: 'Тип задачи',
    description: 'У задачи должен быть указан тип.',
    weight: WEIGHT,

    evaluate(context): RuleResult {
        if (context.issueType) {
            return {
                ruleId: 'issue-type',
                status: 'passed',
                weight: WEIGHT,
                title: 'Тип задачи указан',
                message: context.issueType.name,
            };
        }

        return {
            ruleId: 'issue-type',
            status: 'failed',
            weight: WEIGHT,
            title: 'Тип задачи не указан',
            message: 'У задачи отсутствует тип.',
            recommendation: 'Укажите тип задачи.',
        };
    },
};
