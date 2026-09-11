import { hasAcceptanceCriteriaSection } from '../hasAcceptanceCriteriaSection';
import type { HealthRule, RuleResult } from '../types';

const WEIGHT = 30;

export const acceptanceCriteriaRule: HealthRule = {
    id: 'acceptance-criteria',
    name: 'Критерии приёмки',
    description: 'В описании задачи должна быть секция критериев приёмки.',
    weight: WEIGHT,

    evaluate(context): RuleResult {
        if (
            context.description !== null &&
            context.description !== undefined &&
            hasAcceptanceCriteriaSection(context.description)
        ) {
            return {
                ruleId: 'acceptance-criteria',
                status: 'passed',
                weight: WEIGHT,
                title: 'Критерии приёмки добавлены',
                message: 'В описании найдена секция критериев приёмки.',
            };
        }

        return {
            ruleId: 'acceptance-criteria',
            status: 'failed',
            weight: WEIGHT,
            title: 'Нет критериев приёмки',
            message: 'В описании не найдена секция критериев приёмки.',
            recommendation: 'Добавьте условия, при которых задача может считаться выполненной.',
        };
    },
};
