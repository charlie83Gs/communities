import { Component, createSignal, Show, Switch, Match } from 'solid-js';
import { WealthList } from '@/components/features/wealth/WealthList';
import { PoolsList } from '@/components/features/pools/PoolsList';
import { PoolCreateForm } from '@/components/features/pools/PoolCreateForm';
import { NeedsList } from '@/components/features/needs/NeedsList';
import { ContributionProfile } from '@/components/features/contributions/ContributionProfile';
import { LogContributionForm } from '@/components/features/contributions/LogContributionForm';
import { GrantPeerRecognition } from '@/components/features/contributions/GrantPeerRecognition';
import { PendingVerifications } from '@/components/features/contributions/PendingVerifications';
import { SectionDisclaimer } from '@/components/common/SectionDisclaimer';
import { Button } from '@/components/common/Button';
import { FeatureInfo } from '@/components/common/FeatureInfo';
import { InfoTooltip } from '@/components/common/InfoTooltip';
import { useAuth } from '@/hooks/useAuth';
import { makeTranslator } from '@/i18n/makeTranslator';
import { communityWealthTabsDict } from './CommunityWealthTabs.i18n';

type WealthTab = 'sharing' | 'pools' | 'contributions' | 'needs';
type ContributionsSubTab = 'myProfile' | 'logContribution' | 'grantRecognition' | 'verifications';

interface CommunityWealthTabsProps {
  communityId: string;
  // Permissions
  canViewWealth: boolean;
  canCreateWealth: boolean;
  canViewPools: boolean;
  canCreatePools: boolean;
  canViewNeeds: boolean;
  // Feature flags
  isPoolsEnabled: boolean;
  isNeedsEnabled: boolean;
  isContributionsEnabled: boolean;
  // Disclaimers
  disclaimerWealth: string;
  disclaimerPools: string;
  disclaimerNeeds: string;
  // Callbacks
  onCreateWealth: () => void;
  // Data passed from parent (lifted to avoid reactive scope issues)
  managedCouncils: { id: string; name: string }[];
}

export const CommunityWealthTabs: Component<CommunityWealthTabsProps> = (props) => {
  const t = makeTranslator(communityWealthTabsDict, 'communityWealthTabs');
  const { user } = useAuth();
  const [activeTab, setActiveTab] = createSignal<WealthTab>('sharing');
  const [activeContributionsTab, setActiveContributionsTab] = createSignal<ContributionsSubTab>('myProfile');
  const [showPoolForm, setShowPoolForm] = createSignal(false);

  // Compute available tabs based on permissions and feature flags
  const availableTabs = () => {
    const tabs: { id: WealthTab; label: string; visible: boolean; tooltip: string }[] = [
      { id: 'sharing', label: t('tabSharing'), visible: props.canViewWealth, tooltip: t('tabSharingTooltip') },
      { id: 'pools', label: t('tabPools'), visible: props.canViewPools && props.isPoolsEnabled, tooltip: t('tabPoolsTooltip') },
      { id: 'contributions', label: t('tabContributions'), visible: props.isContributionsEnabled, tooltip: t('tabContributionsTooltip') },
      { id: 'needs', label: t('tabNeeds'), visible: props.canViewNeeds && props.isNeedsEnabled, tooltip: t('tabNeedsTooltip') },
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
                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors flex items-center gap-1.5
                ${
                  activeTab() === tab.id
                    ? 'border-ocean-500 text-ocean-600 dark:text-ocean-400'
                    : 'border-transparent text-stone-500 hover:border-stone-300 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300'
                }
              `}
              aria-current={activeTab() === tab.id ? 'page' : undefined}
            >
              {tab.label}
              <InfoTooltip text={tab.tooltip} position="bottom" />
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div class="py-4">
        <Switch fallback={<div class="text-stone-500 dark:text-stone-400">{t('noAccess')}</div>}>
          <Match when={activeTab() === 'sharing'}>
            <Show when={props.canViewWealth} fallback={<div class="p-4 text-stone-500 dark:text-stone-400">{t('noAccessWealth')}</div>}>
              <div class="space-y-6">
                <FeatureInfo
                  infoLabel={t('featureInfoTitle')}
                  title={t('wealthSharingTitle')}
                  purpose={t('wealthSharingPurpose')}
                  howToLabel={t('wealthSharingHowTo')}
                  howToSteps={[
                    t('wealthSharingStep1'),
                    t('wealthSharingStep2'),
                    t('wealthSharingStep3'),
                  ]}
                  featuresLabel={t('wealthSharingFeatures')}
                  features={[
                    t('wealthSharingFeature1'),
                    t('wealthSharingFeature2'),
                    t('wealthSharingFeature3'),
                  ]}
                />
                <SectionDisclaimer>
                  {props.disclaimerWealth}
                </SectionDisclaimer>
                <Show when={props.canCreateWealth}>
                  <Button onClick={props.onCreateWealth}>
                    {t('createShare')}
                  </Button>
                </Show>
                <WealthList communityId={props.communityId} />
              </div>
            </Show>
          </Match>

          <Match when={activeTab() === 'pools'}>
            <Show when={props.canViewPools && props.isPoolsEnabled} fallback={<div class="p-4 text-stone-500 dark:text-stone-400">{t('noAccessPools')}</div>}>
              <div class="space-y-6">
                <FeatureInfo
                  infoLabel={t('featureInfoTitle')}
                  title={t('poolsTitle')}
                  purpose={t('poolsPurpose')}
                  howToLabel={t('poolsHowTo')}
                  howToSteps={[
                    t('poolsStep1'),
                    t('poolsStep2'),
                    t('poolsStep3'),
                  ]}
                  featuresLabel={t('poolsFeatures')}
                  features={[
                    t('poolsFeature1'),
                    t('poolsFeature2'),
                  ]}
                />
                <SectionDisclaimer>
                  {props.disclaimerPools}
                </SectionDisclaimer>
                <PoolsList
                  communityId={props.communityId}
                  canCreatePool={props.canCreatePools}
                  onCreateClick={() => setShowPoolForm(true)}
                />
              </div>
            </Show>
          </Match>

          <Match when={activeTab() === 'contributions'}>
            <Show when={props.isContributionsEnabled} fallback={<div class="p-4 text-stone-500 dark:text-stone-400">{t('noAccessContributions')}</div>}>
              <div class="space-y-6">
                <FeatureInfo
                  infoLabel={t('featureInfoTitle')}
                  title={t('contributionsTitle')}
                  purpose={t('contributionsPurpose')}
                  note={t('contributionsNote')}
                  howToLabel={t('contributionsFeatures')}
                  howToSteps={[
                    t('contributionsFeature1'),
                    t('contributionsFeature2'),
                    t('contributionsFeature3'),
                  ]}
                  featuresLabel=""
                  features={[]}
                />

                {/* Contributions Sub-Tab Navigation */}
                <div class="border-b border-stone-200 dark:border-stone-700">
                  <nav class="flex space-x-8 overflow-x-auto">
                    <button
                      onClick={() => setActiveContributionsTab('myProfile')}
                      class={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                        activeContributionsTab() === 'myProfile'
                          ? 'border-ocean-500 text-ocean-600 dark:text-ocean-400'
                          : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600'
                      }`}
                    >
                      {t('contributionsTabMyProfile')}
                    </button>
                    <button
                      onClick={() => setActiveContributionsTab('logContribution')}
                      class={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                        activeContributionsTab() === 'logContribution'
                          ? 'border-ocean-500 text-ocean-600 dark:text-ocean-400'
                          : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600'
                      }`}
                    >
                      {t('contributionsTabLogContribution')}
                    </button>
                    <button
                      onClick={() => setActiveContributionsTab('grantRecognition')}
                      class={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                        activeContributionsTab() === 'grantRecognition'
                          ? 'border-ocean-500 text-ocean-600 dark:text-ocean-400'
                          : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600'
                      }`}
                    >
                      {t('contributionsTabGrantRecognition')}
                    </button>
                    <button
                      onClick={() => setActiveContributionsTab('verifications')}
                      class={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                        activeContributionsTab() === 'verifications'
                          ? 'border-ocean-500 text-ocean-600 dark:text-ocean-400'
                          : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600'
                      }`}
                    >
                      {t('contributionsTabVerifications')}
                    </button>
                  </nav>
                </div>

                {/* Contributions Sub-Tab Content */}
                <div class="mt-6">
                  <Show when={activeContributionsTab() === 'myProfile' && user()}>
                    <ContributionProfile communityId={props.communityId} userId={user()!.id} />
                  </Show>

                  <Show when={activeContributionsTab() === 'logContribution'}>
                    <LogContributionForm
                      communityId={props.communityId}
                      onSuccess={() => setActiveContributionsTab('myProfile')}
                    />
                  </Show>

                  <Show when={activeContributionsTab() === 'grantRecognition'}>
                    <GrantPeerRecognition communityId={props.communityId} />
                  </Show>

                  <Show when={activeContributionsTab() === 'verifications'}>
                    <PendingVerifications communityId={props.communityId} />
                  </Show>
                </div>
              </div>
            </Show>
          </Match>

          <Match when={activeTab() === 'needs'}>
            <Show when={props.canViewNeeds && props.isNeedsEnabled} fallback={<div class="p-4 text-stone-500 dark:text-stone-400">{t('noAccessNeeds')}</div>}>
              <div class="space-y-6">
                <FeatureInfo
                  infoLabel={t('featureInfoTitle')}
                  title={t('needsTitle')}
                  purpose={t('needsPurpose')}
                  howToLabel={t('needsHowTo')}
                  howToSteps={[
                    t('needsStep1'),
                    t('needsStep2'),
                    t('needsStep3'),
                  ]}
                  featuresLabel={t('needsFeatures')}
                  features={[
                    t('needsFeature1'),
                    t('needsFeature2'),
                    t('needsFeature3'),
                  ]}
                />
                <SectionDisclaimer>
                  {props.disclaimerNeeds}
                </SectionDisclaimer>
                <NeedsList communityId={props.communityId} />
              </div>
            </Show>
          </Match>
        </Switch>
      </div>

      {/* Pool Creation Modal */}
      <Show when={showPoolForm()}>
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-stone-50 dark:bg-stone-800 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-stone-200 dark:border-stone-700">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">{t('modalTitleCreatePool')}</h3>
              <button
                onClick={() => setShowPoolForm(false)}
                class="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300 text-sm"
              >
                {t('modalClose')}
              </button>
            </div>
            <Show
              when={props.managedCouncils.length > 0}
              fallback={
                <div class="bg-warning-100 dark:bg-warning-900 text-warning-800 dark:text-warning-200 px-6 py-4 rounded-md">
                  <h4 class="font-semibold mb-2">{t('noCouncils')}</h4>
                  <p class="text-sm">{t('noCouncilsDesc')}</p>
                </div>
              }
            >
              <PoolCreateForm
                communityId={props.communityId}
                managedCouncils={props.managedCouncils}
                stayInPlace={true}
                onCreated={() => setShowPoolForm(false)}
                onCancel={() => setShowPoolForm(false)}
              />
            </Show>
          </div>
        </div>
      </Show>
    </div>
  );
};
