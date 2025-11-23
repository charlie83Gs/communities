import { Component, createSignal, Show, Switch, Match, For, createMemo } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useCommunity } from '@/contexts/CommunityContext';
import { MembersList } from '@/components/features/communities/MembersList';
import { InviteCreatePanel } from '@/components/features/communities/InviteCreatePanel';
import { PendingInvitesList } from '@/components/features/communities/PendingInvitesList';
import { TrustGrantsManager } from '@/components/features/communities/TrustGrantsManager';
import { CouncilsList } from '@/components/features/councils/CouncilsList';
import { CreateCouncilForm } from '@/components/features/councils/CreateCouncilForm';
import { Modal } from '@/components/common/Modal';
import { InfoTooltip } from '@/components/common/InfoTooltip';
import { makeTranslator } from '@/i18n/makeTranslator';
import { membersTabDict } from './MembersTab.i18n';

type MembersSubTab = 'all-members' | 'invites' | 'trust-grants' | 'councils';

interface MembersTabProps {
  communityId: string;
}

export function MembersTab(props: MembersTabProps) {
  const t = makeTranslator(membersTabDict, 'membersTab');
  const navigate = useNavigate();
  const {
    isAdmin,
    canInviteMembers,
    canRemoveMembers,
    canUpdateMemberRoles,
    canViewCouncils,
    canCreateCouncils,
    isCouncilsEnabled,
  } = useCommunity();

  const [activeSubTab, setActiveSubTab] = createSignal<MembersSubTab>('all-members');
  const [showCreateCouncilModal, setShowCreateCouncilModal] = createSignal(false);

  // Compute available sub-tabs based on permissions
  const availableSubTabs = createMemo(() => {
    const tabs: { id: MembersSubTab; label: string; visible: boolean; tooltip: string }[] = [
      { id: 'all-members', label: t('tabAllMembers'), visible: true, tooltip: t('membersTooltip') },
      { id: 'invites', label: t('tabInvites'), visible: canInviteMembers() || isAdmin(), tooltip: t('invitesTooltip') },
      { id: 'trust-grants', label: t('tabTrustGrants'), visible: isAdmin(), tooltip: t('trustGrantsTooltip') },
      { id: 'councils', label: t('tabCouncils'), visible: isCouncilsEnabled() && canViewCouncils(), tooltip: t('councilsTooltip') },
    ];
    return tabs.filter(tab => tab.visible);
  });

  const handleViewCouncilDetails = (councilId: string) => {
    navigate(`/communities/${props.communityId}/councils/${councilId}`);
  };

  const handleCouncilCreated = () => {
    setShowCreateCouncilModal(false);
  };

  return (
    <div class="space-y-4">
      {/* Sub-tab Navigation - 36px height */}
      <div class="flex items-center gap-1 border-b border-stone-200 dark:border-stone-700 h-9">
        <For each={availableSubTabs()}>
          {(tab) => (
            <button
              onClick={() => setActiveSubTab(tab.id)}
              class={`
                px-3 h-full text-xs font-medium transition-colors flex items-center gap-1
                ${
                  activeSubTab() === tab.id
                    ? 'text-ocean-600 dark:text-ocean-400 border-b-2 border-ocean-500 -mb-px'
                    : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300'
                }
              `}
              aria-current={activeSubTab() === tab.id ? 'page' : undefined}
            >
              {tab.label}
              <InfoTooltip text={tab.tooltip} position="bottom" iconSize="xs" />
            </button>
          )}
        </For>
      </div>

      {/* Sub-tab Content */}
      <div>
        <Switch fallback={<div class="text-stone-500 dark:text-stone-400">{t('noAccess')}</div>}>
          {/* All Members Sub-tab */}
          <Match when={activeSubTab() === 'all-members'}>
            <MembersList
              communityId={props.communityId}
              showActions={isAdmin()}
              canRemoveMembers={canRemoveMembers()}
              canUpdateRoles={canUpdateMemberRoles()}
            />
          </Match>

          {/* Invites Sub-tab */}
          <Match when={activeSubTab() === 'invites'}>
            <Show
              when={canInviteMembers() || isAdmin()}
              fallback={
                <div class="p-4 text-stone-500 dark:text-stone-400">
                  {t('noAccessInvites')}
                </div>
              }
            >
              <div class="space-y-6">
                <Show when={canInviteMembers()}>
                  <InviteCreatePanel communityId={props.communityId} />
                </Show>
                <Show when={isAdmin()}>
                  <PendingInvitesList communityId={props.communityId} />
                </Show>
              </div>
            </Show>
          </Match>

          {/* Trust Grants Sub-tab */}
          <Match when={activeSubTab() === 'trust-grants'}>
            <Show
              when={isAdmin()}
              fallback={
                <div class="p-4 text-stone-500 dark:text-stone-400">
                  {t('noAccessTrustGrants')}
                </div>
              }
            >
              <TrustGrantsManager communityId={props.communityId} />
            </Show>
          </Match>

          {/* Councils Sub-tab */}
          <Match when={activeSubTab() === 'councils'}>
            <Show
              when={canViewCouncils()}
              fallback={
                <div class="p-4 text-stone-500 dark:text-stone-400">
                  {t('noAccessCouncils')}
                </div>
              }
            >
              <div class="space-y-4">
                <CouncilsList
                  communityId={props.communityId}
                  onCreateClick={() => setShowCreateCouncilModal(true)}
                  onViewDetails={handleViewCouncilDetails}
                  canCreateCouncil={canCreateCouncils()}
                />
              </div>

              {/* Create Council Modal */}
              <Modal
                isOpen={showCreateCouncilModal()}
                onClose={() => setShowCreateCouncilModal(false)}
                title={t('createCouncil')}
                size="md"
              >
                <CreateCouncilForm
                  communityId={props.communityId}
                  onSuccess={handleCouncilCreated}
                  onCancel={() => setShowCreateCouncilModal(false)}
                />
              </Modal>
            </Show>
          </Match>
        </Switch>
      </div>
    </div>
  );
}

export default MembersTab;
