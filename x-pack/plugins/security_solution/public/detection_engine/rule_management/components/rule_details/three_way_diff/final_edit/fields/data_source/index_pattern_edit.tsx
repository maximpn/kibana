/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback } from 'react';
import { isEqual } from 'lodash';
import { css } from '@emotion/css';
import { EuiButtonEmpty } from '@elastic/eui';
import type { FieldHook } from '../../../../../../../../shared_imports';
import { useUiSetting$ } from '../../../../../../../../common/lib/kibana';
import { DEFAULT_INDEX_KEY } from '../../../../../../../../../common/constants';
import { Field } from '../../../../../../../../shared_imports';
import * as i18n from './translations';

interface IndexPatternEditProps {
  field: FieldHook<string[] | undefined>;
}

export function IndexPatternEdit({ field }: IndexPatternEditProps): JSX.Element {
  const [defaultIndexPattern] = useUiSetting$<string[]>(DEFAULT_INDEX_KEY);
  const isIndexModified = !isEqual(field.value, defaultIndexPattern);

  const handleResetIndices = useCallback(
    () => field.setValue(defaultIndexPattern),
    [field, defaultIndexPattern]
  );

  return (
    <Field
      field={field as FieldHook<unknown>}
      idAria="indexPatternEdit"
      data-test-subj="indexPatternEdit"
      euiFieldProps={{
        fullWidth: true,
        placeholder: '',
      }}
      labelAppend={
        isIndexModified ? (
          <EuiButtonEmpty
            className={xxsHeight}
            size="xs"
            iconType="refresh"
            onClick={handleResetIndices}
          >
            {i18n.RESET_DEFAULT_INDEX}
          </EuiButtonEmpty>
        ) : undefined
      }
    />
  );
}

const xxsHeight = css`
  height: 16px;
`;
