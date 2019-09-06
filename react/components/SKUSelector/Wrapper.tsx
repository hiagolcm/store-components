import React, { useMemo } from 'react'
import useProduct from 'vtex.product-context/useProduct'
import { pathOr } from 'ramda'

import SKUSelector from './index'
import { ProductItem, Variations, InitialSelectedModes } from './types'

const useVariations = (skuItems: ProductItem[], shouldNotShow: boolean) => {
  const result = useMemo(() => {
    if (shouldNotShow) {
      return {}
    }
    const variations = {} as Variations
    const variationsSet = {} as Record<string, Set<string>>
    for (const skuItem of skuItems) {
      for (const currentVariation of skuItem.variations) {
        const { name, values } = currentVariation
        const value = values[0]
        const currentSet = variationsSet[name] || new Set()
        currentSet.add(value)
        variationsSet[name] = currentSet
      }
    }
    const variationsNames = Object.keys(variationsSet)
    // Transform set back to array
    for (const variationName of variationsNames) {
      const set = variationsSet[variationName]
      variations[variationName] = Array.from(set)
    }
    return variations
  }, [skuItems, shouldNotShow])
  return result
}

interface Props {
  skuItems: ProductItem[]
  skuSelected: ProductItem
  onSKUSelected?: (skuId: string) => void
  maxItems?: number
  seeMoreLabel: string
  hideImpossibleCombinations?: boolean
  showValueNameForImageVariation?: boolean
  initialSelectedMode?: InitialSelectedModes
}

const SKUSelectorWrapper: StorefrontFC<Props> = props => {
  const valuesFromContext = useProduct()
  const skuItems =
    props.skuItems != null
      ? props.skuItems
      : pathOr<ProductItem[]>([], ['product', 'items'], valuesFromContext)

  const skuSelected =
    props.skuSelected != null
      ? props.skuSelected
      : (valuesFromContext.selectedItem as ProductItem)

  const shouldNotShow =
    skuItems.length === 0 ||
    !skuSelected ||
    !skuSelected.variations ||
    skuSelected.variations.length === 0

  const variations = useVariations(skuItems, shouldNotShow)

  if (shouldNotShow) {
    return null
  }

  return (
    <SKUSelector
      onSKUSelected={props.onSKUSelected}
      skuItems={skuItems}
      skuSelected={skuSelected}
      maxItems={props.maxItems}
      seeMoreLabel={props.seeMoreLabel}
      variations={variations}
      hideImpossibleCombinations={props.hideImpossibleCombinations}
      showValueNameForImageVariation={props.showValueNameForImageVariation}
      initialSelectedMode={props.initialSelectedMode}
    />
  )
}

SKUSelectorWrapper.schema = {
  title: 'admin/editor.skuSelector.title',
  description: 'admin/editor.skuSelector.description',
}

export default SKUSelectorWrapper
