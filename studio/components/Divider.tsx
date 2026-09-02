import {Box} from '@sanity/ui'

export function Divider() {
  return (
    <Box paddingY={4}>
      <div aria-hidden="true" style={{borderTop: '1px solid var(--card-border-color)'}} />
    </Box>
  )
}
