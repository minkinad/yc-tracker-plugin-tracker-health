import type { HealthRule, RuleResult } from '../types';

const WEIGHT = 10;

export const priorityRule: HealthRule = {
    id: 'priority',
    name: 'Приоритет',
    description: 'У задачи должен быть указан приоритет.',
    weight: WEIGHT,

    evaluate(context): RuleResult {
        if (context.priority) {
            return {
                ruleId: 'priority',
                status: 'passed',
                weight: WEIGHT,
                title: 'Приоритет указан',
                message: context.priority.name,
            };
        }

        return {
            ruleId: 'priority',
            status: 'failed',
            weight: WEIGHT,
            title: 'Приоритет не указан',
            message: 'У задачи отсутствует приоритет.',
            recommendation: 'Укажите приоритет задачи.',
        };
    },
};
