import type { HealthRule } from '../types';

import { acceptanceCriteriaRule } from './acceptance-criteria.rule';
import { assigneeRule } from './assignee.rule';
import { descriptionRule } from './description.rule';
import { estimateRule } from './estimate.rule';
import { issueTypeRule } from './issue-type.rule';
import { priorityRule } from './priority.rule';

export const defaultRules: HealthRule[] = [
    assigneeRule,
    priorityRule,
    descriptionRule,
    issueTypeRule,
    estimateRule,
    acceptanceCriteriaRule,
];
