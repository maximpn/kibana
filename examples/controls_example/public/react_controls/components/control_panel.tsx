/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { useState } from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  EuiFlexItem,
  EuiFormControlLayout,
  EuiFormLabel,
  EuiFormRow,
  EuiIcon,
  EuiToolTip,
} from '@elastic/eui';
import { ViewMode } from '@kbn/embeddable-plugin/public';
import { i18n } from '@kbn/i18n';
import {
  apiHasParentApi,
  apiPublishesViewMode,
  useBatchedOptionalPublishingSubjects,
} from '@kbn/presentation-publishing';
import { FloatingActions } from '@kbn/presentation-util-plugin/public';

import { ControlPanelProps, DefaultControlApi } from '../types';
import { ControlError } from './control_error';

import './control_panel.scss';

const DragHandle = ({
  isEditable,
  controlTitle,
  hideEmptyDragHandle,
  ...rest // drag info is contained here
}: {
  isEditable: boolean;
  controlTitle?: string;
  hideEmptyDragHandle: boolean;
}) =>
  isEditable ? (
    <button
      {...rest}
      aria-label={i18n.translate('controls.controlGroup.ariaActions.moveControlButtonAction', {
        defaultMessage: 'Move control {controlTitle}',
        values: { controlTitle: controlTitle ?? '' },
      })}
      className="controlFrame__dragHandle"
    >
      <EuiIcon type="grabHorizontal" />
    </button>
  ) : hideEmptyDragHandle ? null : (
    <EuiIcon size="s" type="empty" />
  );

export const ControlPanel = <ApiType extends DefaultControlApi = DefaultControlApi>({
  Component,
  uuid,
}: ControlPanelProps<ApiType>) => {
  const [api, setApi] = useState<ApiType | null>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isOver,
    isDragging,
    index,
    isSorting,
    activeIndex,
  } = useSortable({
    id: uuid,
  });
  const style = {
    transition,
    transform: isSorting ? undefined : CSS.Translate.toString(transform),
  };

  const viewModeSubject = (() => {
    if (
      apiHasParentApi(api) &&
      apiHasParentApi(api.parentApi) && // api.parentApi => controlGroupApi
      apiPublishesViewMode(api.parentApi.parentApi) // controlGroupApi.parentApi => dashboardApi
    )
      return api.parentApi.parentApi.viewMode; // get view mode from dashboard API
  })();

  const [
    dataLoading,
    blockingError,
    panelTitle,
    defaultPanelTitle,
    grow,
    width,
    labelPosition,
    rawViewMode,
  ] = useBatchedOptionalPublishingSubjects(
    api?.dataLoading,
    api?.blockingError,
    api?.panelTitle,
    api?.defaultPanelTitle,
    api?.grow,
    api?.width,
    api?.parentApi?.labelPosition,
    viewModeSubject
  );
  const usingTwoLineLayout = labelPosition === 'twoLine';

  const [initialLoadComplete, setInitialLoadComplete] = useState(!dataLoading);
  if (!initialLoadComplete && (dataLoading === false || (api && !api.dataLoading))) {
    setInitialLoadComplete(true);
  }

  const viewMode = (rawViewMode ?? ViewMode.VIEW) as ViewMode;
  const isEditable = viewMode === ViewMode.EDIT;

  return (
    <EuiFlexItem
      ref={setNodeRef}
      style={style}
      grow={grow}
      data-control-id={uuid}
      data-test-subj={`control-frame`}
      data-render-complete="true"
      className={classNames('controlFrameWrapper', {
        'controlFrameWrapper--grow': grow,
        'controlFrameWrapper--small': width === 'small',
        'controlFrameWrapper--medium': width === 'medium',
        'controlFrameWrapper--large': width === 'large',
        'controlFrameWrapper-isDragging': isDragging,
        'controlFrameWrapper--insertBefore': isOver && (index ?? -1) < (activeIndex ?? -1),
        'controlFrameWrapper--insertAfter': isOver && (index ?? -1) > (activeIndex ?? -1),
      })}
    >
      <FloatingActions
        api={api}
        className={classNames({
          'controlFrameFloatingActions--twoLine': usingTwoLineLayout,
          'controlFrameFloatingActions--oneLine': !usingTwoLineLayout,
        })}
        viewMode={viewMode}
        disabledActions={[]}
        isEnabled={true}
      >
        <EuiFormRow
          data-test-subj="control-frame-title"
          fullWidth
          label={usingTwoLineLayout ? panelTitle || defaultPanelTitle || '...' : undefined}
        >
          <EuiFormControlLayout
            fullWidth
            isLoading={Boolean(dataLoading)}
            className="controlFrame__formControlLayout"
            prepend={
              <>
                <DragHandle
                  isEditable={isEditable}
                  controlTitle={panelTitle || defaultPanelTitle}
                  hideEmptyDragHandle={usingTwoLineLayout || Boolean(api?.CustomPrependComponent)}
                  {...attributes}
                  {...listeners}
                />

                {api?.CustomPrependComponent ? (
                  <api.CustomPrependComponent />
                ) : usingTwoLineLayout ? null : (
                  <EuiToolTip
                    anchorClassName="controlPanel--labelWrapper"
                    content={panelTitle || defaultPanelTitle}
                  >
                    <EuiFormLabel className="controlPanel--label">
                      {panelTitle || defaultPanelTitle}
                    </EuiFormLabel>
                  </EuiToolTip>
                )}
              </>
            }
          >
            <>
              {blockingError && (
                <ControlError
                  error={
                    blockingError ??
                    i18n.translate('controls.blockingError', {
                      defaultMessage: 'There was an error loading this control.',
                    })
                  }
                />
              )}
              <Component
                className={classNames('controlPanel', {
                  'controlPanel--roundedBorders':
                    !api?.CustomPrependComponent && !isEditable && usingTwoLineLayout,
                  'controlPanel--hideComponent': Boolean(blockingError), // don't want to unmount component on error; just hide it
                })}
                ref={(newApi) => {
                  if (newApi && !api) setApi(newApi);
                }}
              />
            </>
          </EuiFormControlLayout>
        </EuiFormRow>
      </FloatingActions>
    </EuiFlexItem>
  );
};
