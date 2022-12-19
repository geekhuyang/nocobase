import { ISchema, useField, useFieldSchema } from '@formily/react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useKanbanBlockContext } from '../../../block-provider';
import { useCollection } from '../../../collection-manager';
import { useCollectionFilterOptions } from '../../../collection-manager/action-hooks';
import { GeneralSchemaDesigner, SchemaSettings } from '../../../schema-settings';
import { useSchemaTemplate } from '../../../schema-templates';
import { useDesignable } from '../../hooks';
import { useFixedBlock } from '../page';

export const KanbanDesigner = () => {
  const { name, title } = useCollection();
  const field = useField();
  const fieldSchema = useFieldSchema();
  const dataSource = useCollectionFilterOptions(name);
  const { service } = useKanbanBlockContext();
  const { t } = useTranslation();
  const { dn } = useDesignable();
  const defaultFilter = fieldSchema?.['x-decorator-props']?.params?.filter || {};
  const defaultResource = fieldSchema?.['x-decorator-props']?.resource;
  const template = useSchemaTemplate();

  return (
    <GeneralSchemaDesigner template={template} title={title || name}>
      <SchemaSettings.BlockTitleItem />
      <SchemaSettings.ModalItem
        title={t('Set the data scope')}
        schema={
          {
            type: 'object',
            title: t('Set the data scope'),
            properties: {
              filter: {
                default: defaultFilter,
                enum: dataSource,
                'x-component': 'Filter',
                'x-component-props': {},
              },
            },
          } as ISchema
        }
        onSubmit={({ filter }) => {
          const params = field.decoratorProps.params || {};
          params.filter = filter;
          field.decoratorProps.params = params;
          fieldSchema['x-decorator-props']['params'] = params;
          service.run({ ...service.params?.[0], filter });
          dn.emit('patch', {
            schema: {
              ['x-uid']: fieldSchema['x-uid'],
              'x-decorator-props': fieldSchema['x-decorator-props'],
            },
          });
        }}
      />
      <SchemaSettings.SwitchItem
        title={t('Fix block')}
        checked={fieldSchema['x-decorator-props']['fixedBlock']}
        onChange={(fixedBlock) => {
          field.decoratorProps.fixedBlock = fixedBlock;
          fieldSchema['x-decorator-props'].fixedBlock = fixedBlock;
          dn.emit('patch', {
            schema: {
              ['x-uid']: fieldSchema['x-uid'],
              'x-decorator-props': fieldSchema['x-decorator-props'],
            },
          });
        }}
      />
      <SchemaSettings.Divider />
      <SchemaSettings.Template componentName={'Kanban'} collectionName={name} resourceName={defaultResource} />
      <SchemaSettings.Divider />
      <SchemaSettings.Remove
        removeParentsIfNoChildren
        breakRemoveOn={{
          'x-component': 'Grid',
        }}
      />
    </GeneralSchemaDesigner>
  );
};
