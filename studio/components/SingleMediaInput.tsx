import {ArrayOfObjectsInputProps} from 'sanity'

const blockedActions = ['add', 'addBefore', 'addAfter', 'duplicate'] as const

export default function SingleMediaInput(props: ArrayOfObjectsInputProps) {
  if (!props.value?.length) return props.renderDefault(props)

  return props.renderDefault({
    ...props,
    schemaType: {
      ...props.schemaType,
      options: {
        ...props.schemaType.options,
        disableActions: [...new Set([...(props.schemaType.options?.disableActions || []), ...blockedActions])],
      },
    },
  })
}
