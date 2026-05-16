<script lang="ts">
// @generated:start imports

// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type PostcardAuthor = { name: string; handle: string; avatar: string };
type PostcardStats = { likes: number; replies: number; reposts: number };
type PostcardEmbed = { type: 'image' | 'video' | 'audio'; url: string; aspectRatio: { width: number; height: number } };
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  postId: string;
  author: PostcardAuthor;
  timestamp: string;
  stats: PostcardStats;
  embed?: PostcardEmbed;
  type?: string;
  class?: string;
  children?: import('svelte').Snippet;
}

let { postId, author, timestamp, stats, embed, type, class: className, children }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "postcard",
    type ? `postcard--${type}` : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<article class={classes}>
  <div class={'postcard__header'}>
    <div class={'postcard__userInfo'}>
      <span class={'postcard__displayName'}></span>
      <span class={'postcard__handle'}></span>
    </div>
    <time class={'postcard__timestamp'}></time>
  </div>
  <div class={'postcard__content'}>
    {@render children?.()}
  </div>
  <div class={'postcard__footer'}>
    <div class={'postcard__stats'}>
      <span class={'postcard__stat'}></span>
    </div>
  </div>
</article>
