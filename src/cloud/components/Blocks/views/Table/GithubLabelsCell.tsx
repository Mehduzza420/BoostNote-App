import styled from '../../../../../design/lib/styled'
import React, { useCallback, useEffect, useState } from 'react'
import { GithubCellProps } from '.'
import { useModal } from '../../../../../design/lib/stores/modal'
import { getAction, postAction } from '../../../../api/integrations'
import FilterableSelectList from '../../../../../design/components/molecules/FilterableSelectList'
import Spinner from '../../../../../design/components/atoms/Spinner'

interface Label {
  name: string
  color: string
  description: string
}

const GithubLabelsCell = ({ data, onUpdate }: GithubCellProps) => {
  const { openContextModal, closeAllModals } = useModal()
  const addLabel = useCallback(
    async (toAdd: Label[]) => {
      const labels = data.labels.concat(toAdd).map((label: Label) => label.name)
      const [owner, repo] = data.repository.full_name.split('/')
      const issue = await postAction(
        { id: data.integrationId },
        'issue:update',
        { owner, repo, issue_number: data.number },
        { labels }
      )
      await onUpdate(issue)
      closeAllModals()
    },
    [data]
  )

  const openSetLabelSelect: React.MouseEventHandler = useCallback(
    (ev) => {
      openContextModal(
        ev,
        <GithubLabelsSelect data={data} onUpdate={addLabel} />
      )
    },
    [data, addLabel]
  )

  return (
    <StyledGithubLabels onClick={openSetLabelSelect}>
      <ul>
        {data.labels.map((label: Label) => (
          <li style={{ backgroundColor: `#${label.color}` }}>{label.name}</li>
        ))}
      </ul>
    </StyledGithubLabels>
  )
}

const StyledGithubLabels = styled.div`
  cursor: pointer;
  min-height: 40px;
  & > ul {
    margin: 0;
    padding: 0;
    display: flex;
    list-style: none;
    & > li {
      margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
      padding: ${({ theme }) => theme.sizes.spaces.xsm}px;
      border-radius: 5px;
      font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
    }
  }
`

interface LabelSelectProps {
  data: GithubCellProps['data']
  onUpdate: (labels: Label[]) => Promise<void>
}

const GithubLabelsSelect = ({ data, onUpdate }: LabelSelectProps) => {
  const [labels, setLabels] = useState<Label[] | null>(null)

  useEffect(() => {
    let cancel = false
    const cb = async () => {
      if (
        data.integrationId != null &&
        data.repository != null &&
        data.repository.full_name != null
      ) {
        const [owner, repo] = data.repository.full_name.split('/')
        const labels = await getAction(
          { id: data.integrationId },
          'repo:labels',
          { owner, repo }
        )
        if (!cancel) {
          setLabels(labels)
        }
      }
    }
    cb()
    return () => {
      cancel = true
    }
  }, [data])

  if (labels == null) {
    return <Spinner />
  }

  return (
    <LabelSelectContainer>
      <h3>Person</h3>
      <FilterableSelectList
        items={labels.map((label) => [
          label.name,
          <div
            className='label__select__item'
            onClick={() => onUpdate([label])}
          >
            <h4>{label.name}</h4>
            <div>{label.description || 'No description'}</div>
          </div>,
        ])}
      />
    </LabelSelectContainer>
  )
}

const LabelSelectContainer = styled.div`
  & h4 {
    margin: ${({ theme }) => theme.sizes.spaces.xsm}px 0;
  }

  & .label__select__item {
    cursor: pointer;
  }
`
export default GithubLabelsCell