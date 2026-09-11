import type { HealthRule, RuleResult } from '../types';

const WEIGHT = 15;

export const assigneeRule: HealthRule = {
    id: 'assignee',
    name: 'Исполнитель',
    description: 'У задачи должен быть назначен исполнитель.',
    weight: WEIGHT,

    evaluate(context): RuleResult {
        if (context.assignee) {
            return {
                ruleId: 'assignee',
                status: 'passed',
                weight: WEIGHT,
                title: 'Исполнитель назначен',
                message: context.assignee.displayName,
            };
        }

        return {
            ruleId: 'assignee',
            status: 'failed',
            weight: WEIGHT,
            title: 'Исполнитель не назначен',
            message: 'У задачи отсутствует исполнитель.',
            recommendation: 'Назначьте ответственного за выполнение задачи.',
        };
    },
};
