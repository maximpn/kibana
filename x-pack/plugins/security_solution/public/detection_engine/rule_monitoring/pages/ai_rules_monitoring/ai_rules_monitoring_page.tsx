/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useEffect, useMemo, useState } from 'react';
import type { EuiCommentProps } from '@elastic/eui';
import {
  EuiButton,
  EuiCommentList,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingSpinner,
  EuiMarkdownFormat,
  EuiSpacer,
  EuiText,
  EuiSkeletonText,
  EuiButtonIcon,
  EuiCopy,
} from '@elastic/eui';
import { useAiRulesMonitoringContext } from './ai_rules_monitoring_context';
import { RuleMonitoringIntervalSelector } from './rule_monitoring_interval_selector';
import { ConnectorSelector } from './connector_selector';
import * as i18n from './translations';

export function AiRulesMonitoringPage(): JSX.Element {
  const { isInitialLoading, isFetching, hasConnector, connectorPrompt, result, refetch } =
    useAiRulesMonitoringContext();

  const [comments, setComments] = useState<EuiCommentProps[]>([WELCOME_COMMENT]);
  const copyAction = useMemo(
    () => (
      <EuiCopy textToCopy={result ?? ''}>
        {(copy) => (
          <EuiButtonIcon
            aria-label={i18n.COPY_TO_CLIPBOARD}
            color="primary"
            iconType="copyClipboard"
            onClick={copy}
          />
        )}
      </EuiCopy>
    ),
    [result]
  );

  useEffect(() => {
    if (isFetching) {
      setComments([
        WELCOME_COMMENT,
        {
          username: 'Rule Monitoring AI Assistant',
          children: (
            <EuiSkeletonText>
              <EuiText size="m">&nbsp;</EuiText>
            </EuiSkeletonText>
          ),
          event: ' ',
        },
      ]);
    } else if (result) {
      setComments([
        WELCOME_COMMENT,
        {
          username: 'Rule Monitoring AI Assistant',
          children: <EuiMarkdownFormat>{result}</EuiMarkdownFormat>,
          event: ' ',
          actions: copyAction,
        },
      ]);
    }
  }, [isFetching, result, copyAction]);

  if (isInitialLoading) {
    return (
      <EuiFlexGroup justifyContent="center">
        <EuiLoadingSpinner size="xxl" />
      </EuiFlexGroup>
    );
  }

  if (!hasConnector) {
    return (
      <EuiFlexGroup direction="column" alignItems="center">
        <EuiText>
          <p>{i18n.CONNECTOR_NEEDED}</p>
        </EuiText>
        {connectorPrompt}
      </EuiFlexGroup>
    );
  }

  return (
    <>
      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiText size="xs" color="subdued">
              {i18n.INLINE_CONNECTOR_LABEL}
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <ConnectorSelector />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <RuleMonitoringIntervalSelector />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton isLoading={isFetching} onClick={refetch} disabled={isFetching}>
            {'Analyze'}
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="xxl" />
      <EuiFlexGroup direction="column" alignItems="stretch">
        <EuiFlexItem>
          <EuiCommentList comments={comments} aria-label="Comment list example" />
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
}

const WELCOME_BODY = [
  i18n.WELCOME_GENERAL_INFO,
  i18n.WELCOME_EXPLANATION,
  i18n.WELCOME_ACTION,
].join('\n\n');

const WELCOME_COMMENT = {
  username: 'System',
  children: <EuiMarkdownFormat>{WELCOME_BODY}</EuiMarkdownFormat>,
  event: ' ',
};
