import { generate } from 'shortid'
import { SerializedQuery } from '../../interfaces/db/smartView'
import {
  PropSubType,
  PropType,
  StaticPropType,
} from '../../interfaces/db/props'
import { isString } from '../utils/string'
import { sortByAttributeAsc } from '../../../design/lib/utils/array'
import { LexoRank } from 'lexorank'
import { getArrayFromRecord } from '../utils/array'

export interface ViewTableData {
  columns: Record<string, Column>
  filter?: SerializedQuery
}

export function makeTablePropColId(name: string, type?: string) {
  return generate() + ':' + name + ':' + type
}

export function getPropTypeFromColId(colId: string) {
  return colId.split(':').pop() as PropSubType | PropType
}

export interface StaticPropCol {
  prop: StaticPropType
}

export interface PropCol {
  type: PropType
  subType?: string
}

export type Column = {
  id: string
  name: string
  order: string
} & (PropCol | StaticPropCol)

export function isColumn(item: any): item is Column {
  return isStaticPropCol(item) || isPropCol(item)
}

export function isPropCol(item: any): item is PropCol {
  return item != null && typeof item.type === 'string'
}

export function isStaticPropCol(item: any): item is StaticPropCol {
  return item != null && typeof item.prop === 'string'
}

export type ViewTable = Column[]

export function isViewTableData(data: any): data is ViewTableData {
  return data.columns != null && Object.values(data.columns).every(isString)
}

export function getInsertedColumnOrder(columns: Record<string, Column>) {
  const colValues = sortByAttributeAsc('order', Object.values(columns))
  if (colValues.length === 0) {
    return LexoRank.middle().toString()
  } else {
    return LexoRank.max()
      .between(LexoRank.parse(colValues[colValues.length - 1].order))
      .toString()
  }
}

export type ColumnMoveType =
  | 'before'
  | 'after'
  | {
      targetId: string
      type: 'before' | 'after'
    }

export function getColumnOrderAfterMove(
  columns: Record<string, Column>,
  movedColumnId: string,
  move: ColumnMoveType
): string | undefined {
  const colValues = sortTableViewColumns(columns)
  const movedColumnIndex = colValues.findIndex(
    (col) => col.id === movedColumnId
  )
  if (colValues.length === 0 || movedColumnIndex === -1) {
    return
  }

  if (move === 'before') {
    if (movedColumnIndex === 0) {
      return colValues[movedColumnIndex].order
    }

    if (movedColumnIndex === 1) {
      return LexoRank.min()
        .between(LexoRank.parse(colValues[movedColumnIndex - 1].order))
        .toString()
    }

    return LexoRank.parse(colValues[movedColumnIndex - 2].order)
      .between(LexoRank.parse(colValues[movedColumnIndex - 1].order))
      .toString()
  } else if (move === 'after') {
    if (movedColumnIndex === colValues.length - 1) {
      return colValues[movedColumnIndex].order
    }

    if (movedColumnIndex === colValues.length - 2) {
      return LexoRank.max()
        .between(LexoRank.parse(colValues[movedColumnIndex + 1].order))
        .toString()
    }
    return LexoRank.parse(colValues[movedColumnIndex + 2].order)
      .between(LexoRank.parse(colValues[movedColumnIndex + 1].order))
      .toString()
  }

  return getColumnOrderAfterMove(columns, move.targetId, move.type)
}

export function sortTableViewColumns(
  columns: Record<string, Column>
): Column[] {
  Object.keys(columns).forEach((key) => {
    if (columns[key].order == null) {
      columns[key].order = LexoRank.middle().toString()
    }
  })

  return sortByAttributeAsc('order', getArrayFromRecord(columns))
}