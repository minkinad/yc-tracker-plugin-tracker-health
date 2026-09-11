import { TriangleExclamation } from '@gravity-ui/icons';
import { Button, Card, Flex, Icon, Loader, Text } from '@gravity-ui/uikit';

import type { IssueHealthResult } from '../../domain/health/types';
import { HealthProgress } from '../HealthProgress';
import { HealthRulesList } from '../HealthRulesList';
import { HealthSummary } from '../HealthSummary';

import styles from './IssueHealthBlock.module.scss';

interface LoadingProps {
    state: 'loading';
}

interface ErrorProps {
    state: 'error';
    onRetry?: () => void;
    retrying?: boolean;
}

interface SuccessProps {
    state: 'success';
    result: IssueHealthResult;
}

export type IssueHealthBlockProps = LoadingProps | ErrorProps | SuccessProps;

export function IssueHealthBlock(props: IssueHealthBlockProps) {
    if (props.state === 'loading') {
        return (
            <Card
                className={styles.root}
                type="container"
                view="outlined"
                role="status"
                aria-live="polite"
            >
                <Flex alignItems="center" gap="2">
                    <Loader size="s" />
                    <Text variant="body-1">Анализируем задачу…</Text>
                </Flex>
            </Card>
        );
    }

    if (props.state === 'error') {
        return (
            <Card
                className={styles.root}
                type="container"
                view="outlined"
                theme="danger"
                role="alert"
            >
                <Flex alignItems="flex-start" gap="2">
                    <Icon
                        className={styles.stateIcon}
                        data={TriangleExclamation}
                        color="danger"
                        aria-hidden="true"
                    />
                    <div className={styles.stateContent}>
                        <Text variant="subheader-1" as="div">
                            Не удалось проанализировать задачу
                        </Text>
                        {props.onRetry ? (
                            <Button
                                className={styles.retry}
                                view="action"
                                size="s"
                                loading={props.retrying}
                                onClick={props.onRetry}
                            >
                                Повторить
                            </Button>
                        ) : null}
                    </div>
                </Flex>
            </Card>
        );
    }

    return (
        <Card className={styles.root} type="container" view="outlined">
            <Flex direction="column" gap="3">
                <HealthSummary
                    score={props.result.score}
                    level={props.result.level}
                    failedRules={props.result.failedRules}
                />
                <HealthProgress score={props.result.score} level={props.result.level} />
                <HealthRulesList results={props.result.results} />
            </Flex>
        </Card>
    );
}
