import type { HealthRule, RuleResult } from '../types';

const WEIGHT = 15;

export const estimateRule: HealthRule = {
    id: 'estimate',
    name: 'Оценка',
    description: 'У задачи должна быть указана положительная оценка.',
    weight: WEIGHT,

    evaluate(context): RuleResult {
        const { estimation } = context;

        if (estimation !== null && estimation !== undefined && estimation > 0) {
            return {
                ruleId: 'estimate',
                status: 'passed',
                weight: WEIGHT,
                title: 'Оценка указана',
                message: String(estimation),
            };
        }

        return {
            ruleId: 'estimate',
            status: 'failed',
            weight: WEIGHT,
            title: 'Оценка не указана',
            message: 'У задачи отсутствует положительная оценка.',
            recommendation: 'Укажите оценку задачи больше нуля.',
        };
    },
};
