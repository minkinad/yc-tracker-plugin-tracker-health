import type { HealthRule, RuleResult } from '../types';

const WEIGHT = 20;
const MIN_DESCRIPTION_LENGTH = 100;

export const descriptionRule: HealthRule = {
    id: 'description',
    name: 'Описание',
    description: 'Описание задачи должно содержать минимум 100 символов.',
    weight: WEIGHT,

    evaluate(context): RuleResult {
        const descriptionLength = context.description?.trim().length ?? 0;

        if (descriptionLength >= MIN_DESCRIPTION_LENGTH) {
            return {
                ruleId: 'description',
                status: 'passed',
                weight: WEIGHT,
                title: 'Описание заполнено',
                message: `${descriptionLength} символов`,
            };
        }

        return {
            ruleId: 'description',
            status: 'failed',
            weight: WEIGHT,
            title: 'Описание недостаточно подробное',
            message: `Описание задачи содержит меньше ${MIN_DESCRIPTION_LENGTH} символов.`,
            recommendation: 'Дополните описание задачи необходимыми деталями.',
        };
    },
};
