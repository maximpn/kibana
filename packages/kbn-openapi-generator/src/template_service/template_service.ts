/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import Handlebars from 'handlebars';
import { resolve } from 'path';
import { registerHelpers } from './register_helpers';
import { registerTemplates } from './register_templates';

export const AVAILABLE_TEMPLATES = [
  'zod_operation_schema',
  'route',
  'route_handler_function',
] as const;

export type TemplateName = typeof AVAILABLE_TEMPLATES[number];

export interface ITemplateService {
  compileTemplate: (templateName: TemplateName, context: Record<string, unknown>) => string;
}

/**
 * Initialize the template service. This service encapsulates the handlebars
 * initialization logic and provides helper methods for compiling templates.
 */
export const initTemplateService = async (): Promise<ITemplateService> => {
  // Create a handlebars instance and register helpers and partials
  const handlebars = Handlebars.create();
  registerHelpers(handlebars);
  const templates = await registerTemplates(resolve(__dirname, './templates'), handlebars);

  return {
    compileTemplate: (templateName: TemplateName, context: Record<string, unknown>) => {
      return handlebars.compile(templates[templateName])(context);
    },
  };
};
