// Datei: GridLayout.jsx

import React, {useCallback, forwardRef} from 'react'
import {FormField} from 'sanity'
import {Radio, Card, Grid} from '@sanity/ui'
import {set, unset} from 'sanity'

const GridLayout = forwardRef((props, ref) => {
  const {
    schemaType,
    readOnly,
    compareValue,
    onChange,
    markers,
    presence,
    value,
    onFocus,
    onBlur
  } = props

  const handleChange = useCallback(
    (event) => {
      const inputValue = event.currentTarget.value
      onChange(inputValue ? set(inputValue) : unset())
    },
    [onChange]
  )

  return (
    <FormField
      __unstable_markers={markers}
      __unstable_presence={presence}
      compareValue={compareValue}
      inputId={schemaType.name}
    >
      <Grid columns={[2, 3, 4, 6]} gap={[1, 1, 2, 3]}>
        {/* Option: both */}
        <Card radius={2} shadow={1} padding={4} style={{textAlign: 'center'}}>
          <svg xmlns="http://www.w3.org/2000/svg" width="37.5" height="50" viewBox="0 0 37.5 50">
            <g transform="translate(193.5 169) rotate(180)">
              <g transform="translate(156 119)" fill="#fff" stroke="#262f3d" strokeLinejoin="round" strokeWidth="3">
                <rect width="37.5" height="50" stroke="none"/>
                <rect x="1.5" y="1.5" width="34.5" height="47" fill="none"/>
              </g>
              <line x2="34" transform="translate(157.5 144.5)" fill="none" stroke="#262f3d" strokeWidth="3"/>
            </g>
          </svg>
          <br />
          <Radio
            checked={value === 'both'}
            name="gridLayout"
            onChange={handleChange}
            value="both"
            
            disabled={readOnly}
          />
        </Card>

        {/* Option: top */}
        <Card radius={2} shadow={1} padding={4} style={{textAlign: 'center'}}>
          <svg xmlns="http://www.w3.org/2000/svg" width="37.5" height="50" viewBox="0 0 37.5 50">
            <g transform="translate(-156 -119)">
              <g transform="translate(156 119)" fill="#fff" stroke="#262f3d" strokeLinejoin="round" strokeWidth="3">
                <rect width="37.5" height="50" stroke="none"/>
                <rect x="1" y="1" width="35.5" height="48" fill="none"/>
              </g>
              <line x2="34" transform="translate(157.5 144.5)" fill="none" stroke="#262f3d" strokeWidth="3"/>
              <line y2="23" transform="translate(174.5 144.5)" fill="none" stroke="#262f3d" strokeWidth="3"/>
            </g>
          </svg>
          <br />
          <Radio
            checked={value === 'top'}
            name="gridLayout"
            onChange={handleChange}
            value="top"
            
            disabled={readOnly}
          />
        </Card>

        {/* Option: bottom */}
        <Card radius={2} shadow={1} padding={4} style={{textAlign: 'center'}}>
          <svg xmlns="http://www.w3.org/2000/svg" width="37.5" height="50" viewBox="0 0 37.5 50">
            <g transform="translate(193.5 169) rotate(180)">
              <g transform="translate(156 119)" fill="#fff" stroke="#262f3d" strokeLinejoin="round" strokeWidth="3">
                <rect width="37.5" height="50" stroke="none"/>
                <rect x="1" y="1" width="35.5" height="48" fill="none"/>
              </g>
              <line x2="34" transform="translate(157.5 144.5)" fill="none" stroke="#262f3d" strokeWidth="3"/>
              <line y2="24" transform="translate(174.5 144.5)" fill="none" stroke="#262f3d" strokeWidth="3"/>
            </g>
          </svg>
          <br />
          <Radio
            checked={value === 'bottom'}
            name="gridLayout"
            onChange={handleChange}
            value="bottom"
            disabled={readOnly}
          />
        </Card>

        {/* Option: none */}
        <Card radius={2} shadow={1} padding={4} style={{textAlign: 'center'}}>
          <svg xmlns="http://www.w3.org/2000/svg" width="37.5" height="50" viewBox="0 0 37.5 50">
            <g transform="translate(193.5 169) rotate(180)">
              <g transform="translate(156 119)" fill="#fff" stroke="#262f3d" strokeLinejoin="round" strokeWidth="3">
                <rect width="37.5" height="50" stroke="none"/>
                <rect x="1" y="1" width="35.5" height="48" fill="none"/>
              </g>
              <line x2="34" transform="translate(158 143.5)" fill="none" stroke="#262f3d" strokeWidth="3"/>
              <path d="M0,0V47" transform="translate(175 120.5)" fill="none" stroke="#262f3d" strokeWidth="3"/>
            </g>
          </svg>
          <br />
          <Radio
            checked={value === 'none'}
            name="gridLayout"
            onChange={handleChange}
            value="none"
            
            disabled={readOnly}
          />
        </Card>
      </Grid>
    </FormField>
  )
})

export default GridLayout
