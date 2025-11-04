import { Component, createSignal, Switch, Match } from 'solid-js';
import { ForumCategories } from './ForumCategories';
import { ForumThreadList } from './ForumThreadList';
import { ForumThreadDetail } from './ForumThreadDetail';

interface ForumContentProps {
  communityId: string;
}

type ForumView =
  | { type: 'categories' }
  | { type: 'threads'; categoryId: string }
  | { type: 'thread'; threadId: string; categoryId: string };

export const ForumContent: Component<ForumContentProps> = (props) => {
  const [view, setView] = createSignal<ForumView>({ type: 'categories' });

  const navigateToCategories = () => {
    setView({ type: 'categories' });
  };

  const navigateToThreads = (categoryId: string) => {
    setView({ type: 'threads', categoryId });
  };

  const navigateToThread = (threadId: string, categoryId: string) => {
    setView({ type: 'thread', threadId, categoryId });
  };

  return (
    <div>
      <Switch>
        <Match when={view().type === 'categories'}>
          <ForumCategories
            communityId={props.communityId}
            onCategoryClick={navigateToThreads}
          />
        </Match>
        <Match when={view().type === 'threads' && (view() as { type: 'threads'; categoryId: string }).categoryId}>
          {(categoryIdAccessor) => (
            <ForumThreadList
              communityId={props.communityId}
              categoryId={(view() as { type: 'threads'; categoryId: string }).categoryId}
              onBackClick={navigateToCategories}
              onThreadClick={navigateToThread}
            />
          )}
        </Match>
        <Match when={view().type === 'thread' && (view() as { type: 'thread'; threadId: string; categoryId: string }).threadId}>
          {(threadIdAccessor) => (
            <ForumThreadDetail
              communityId={props.communityId}
              threadId={(view() as { type: 'thread'; threadId: string; categoryId: string }).threadId}
              categoryId={(view() as { type: 'thread'; threadId: string; categoryId: string }).categoryId}
              onBackClick={() => navigateToThreads((view() as { type: 'thread'; threadId: string; categoryId: string }).categoryId)}
            />
          )}
        </Match>
      </Switch>
    </div>
  );
};
