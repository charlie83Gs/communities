import { Component, createSignal, Show, Switch, Match } from 'solid-js';
import { MembersList } from '@/components/features/communities/MembersList';
import { InviteUserForm } from '@/components/features/communities/InviteUserForm';
import { InviteLinkForm } from '@/components/features/communities/InviteLinkForm';
import InviteList from '@/components/features/communities/InviteList';
import InviteLinksList from '@/components/features/communities/InviteLinksList';
import { TrustGrantsManager } from '@/components/features/communities/TrustGrantsManager';
import { SectionDisclaimer } from '@/components/common/SectionDisclaimer';
import { FeatureInfo } from '@/components/common/FeatureInfo';
import { makeTranslator } from '@/i18n/makeTranslator';
import { membersTabsDict } from './MembersTabs.i18n';
import { communityFeaturesDict } from '@/pages/protected/community/communityFeatures.i18n';

type MembersTab = 'members' | 'invites' | 'trust-grants';

interface MembersTabsProps {
  communityId: string;
  // Permissions
  canViewMembers: boolean;
  canRemoveMembers: boolean;
  canUpdateRoles: boolean;
  canInviteMembers: boolean;
  isAdmin: boolean;
  // Disclaimers
  disclaimerMembers: string;
  disclaimerInvites: string;
  disclaimerTrustGrants: string;
}

export const MembersTabs: Component<MembersTabsProps> = (props) => {
  const t = makeTranslator(membersTabsDict, 'membersTabs');
  const tFeature = makeTranslator(communityFeaturesDict, 'communityFeatures');
  const [activeTab, setActiveTab] = createSignal<MembersTab>('members');

  // Compute available tabs based on permissions
  const availableTabs = () => {
    const tabs: { id: MembersTab; label: string; visible: boolean }[] = [
      { id: 'members', label: t('tabMembers'), visible: props.canViewMembers },
      { id: 'invites', label: t('tabInvites'), visible: props.canInviteMembers || props.isAdmin },
      { id: 'trust-grants', label: t('tabTrustGrants'), visible: props.isAdmin },
    ];
    return tabs.filter(tab => tab.visible);
  };

  return (
    <div class="space-y-6">
      {/* Tab Navigation */}
      <div class="border-b border-stone-200 dark:border-stone-700">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          {availableTabs().map((tab) => (
            <button
              onClick={() => setActiveTab(tab.id)}
              class={`
                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                ${
                  activeTab() === tab.id
                    ? 'border-ocean-500 text-ocean-600 dark:text-ocean-400'
                    : 'border-transparent text-stone-500 hover:border-stone-300 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300'
                }
              `}
              aria-current={activeTab() === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div class="py-4">
        <Switch fallback={<div class="text-stone-500 dark:text-stone-400">{t('noAccess')}</div>}>
          <Match when={activeTab() === 'members'}>
            <Show when={props.canViewMembers} fallback={<div class="p-4 text-stone-500 dark:text-stone-400">{t('noAccessMembers')}</div>}>
              <div class="space-y-6">
                <FeatureInfo
                  infoLabel={tFeature('featureInfoTitle')}
                  title={tFeature('membersTitle')}
                  purpose={tFeature('membersPurpose')}
                  howToLabel={tFeature('membersHowTo')}
                  howToSteps={[
                    tFeature('membersStep1'),
                    tFeature('membersStep2'),
                    tFeature('membersStep3'),
                  ]}
                  featuresLabel={tFeature('membersFeatures')}
                  features={[
                    tFeature('membersFeature1'),
                    tFeature('membersFeature2'),
                    tFeature('membersFeature3'),
                  ]}
                />
                <SectionDisclaimer>
                  {props.disclaimerMembers}
                </SectionDisclaimer>
                <MembersList
                  communityId={props.communityId}
                  showActions={props.isAdmin}
                  canRemoveMembers={props.canRemoveMembers}
                  canUpdateRoles={props.canUpdateRoles}
                />
              </div>
            </Show>
          </Match>

          <Match when={activeTab() === 'invites'}>
            <Show when={props.canInviteMembers || props.isAdmin} fallback={<div class="p-4 text-stone-500 dark:text-stone-400">{t('noAccessInvites')}</div>}>
              <div class="space-y-6">
                <SectionDisclaimer>
                  {props.disclaimerInvites}
                </SectionDisclaimer>
                <Show when={props.canInviteMembers}>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InviteUserForm communityId={props.communityId} />
                    <InviteLinkForm communityId={props.communityId} />
                  </div>
                </Show>
                <Show when={props.isAdmin}>
                  <InviteList communityId={props.communityId} />
                  <InviteLinksList communityId={props.communityId} />
                </Show>
              </div>
            </Show>
          </Match>

          <Match when={activeTab() === 'trust-grants'}>
            <Show when={props.isAdmin} fallback={<div class="p-4 text-stone-500 dark:text-stone-400">{t('noAccessTrustGrants')}</div>}>
              <div class="space-y-6">
                <SectionDisclaimer>
                  {props.disclaimerTrustGrants}
                </SectionDisclaimer>
                <TrustGrantsManager communityId={props.communityId} />
              </div>
            </Show>
          </Match>
        </Switch>
      </div>
    </div>
  );
};
