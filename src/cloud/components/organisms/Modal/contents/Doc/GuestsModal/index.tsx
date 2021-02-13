import React from 'react'
import { ModalContainer } from '../../styled'
import { usePage } from '../../../../../../lib/stores/pageStore'
import { mdiArrowRight, mdiBackupRestore } from '@mdi/js'
import CustomButton from '../../../../../atoms/buttons/CustomButton'
import { useModal } from '../../../../../../lib/stores/modal'
import { useSettings } from '../../../../../../lib/stores/settings'
import styled from '../../../../../../lib/styled'
import Icon from '../../../../../atoms/Icon'
import { guestsPerMember } from '../../../../../../lib/subscription'
import plur from 'plur'
import GuestInvitesSection from '../../../../../molecules/GuestInvitesSection'

interface GuestsModalProps {
  docId: string
  teamId: string
}

const GuestsModal = ({ docId, teamId }: GuestsModalProps) => {
  const { subscription, permissions = [], guestsMap } = usePage()
  const { closeModal } = useModal()
  const { openSettingsTab } = useSettings()

  if (subscription == null) {
    return (
      <ModalContainer style={{ padding: 0 }}>
        <NonSubContent>
          <Icon path={mdiBackupRestore} size={60} className='icon' />
          <p>
            Let&apos;s upgrade to the Pro plan now and invite outside
            collaborators to this document.
            <br /> You can try a two-week trial for free!
          </p>
          <CustomButton
            variant='primary'
            onClick={() => {
              openSettingsTab('teamUpgrade')
              closeModal()
            }}
          >
            Start Free Trial
          </CustomButton>
        </NonSubContent>
      </ModalContainer>
    )
  }

  return (
    <ModalContainer>
      <Container>
        <h2>Invite outside guests to this document</h2>
        <p>
          Guests are outsiders who you want to work with on specific documents.
          They can be invited to individual documents but not entire workspaces.
        </p>
        <p>
          {permissions.length > 0
            ? `${
                permissions.length * guestsPerMember - guestsMap.size
              } remaining ${plur('seat', permissions.length)}. `
            : 'No Remaining seats. '}
          <a
            target='_blank'
            rel='noreferrer'
            href='https://intercom.help/boostnote-for-teams/en/articles/4874279'
          >
            See how it works <Icon path={mdiArrowRight} />
          </a>
        </p>
        <GuestInvitesSection teamId={teamId} docId={docId} />
      </Container>
    </ModalContainer>
  )
}

const NonSubContent = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  width: 80%;
  margin: auto;
  height: 100%;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.baseTextColor};
  p {
    text-align: center;
  }
  svg {
    color: ${({ theme }) => theme.secondaryBackgroundColor};
  }
  .icon {
    margin-bottom: 20px;
  }
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`

export default GuestsModal
