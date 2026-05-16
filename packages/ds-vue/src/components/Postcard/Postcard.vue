<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type PostcardAuthor = { name: string; handle: string; avatar: string };
export type PostcardStats = { likes: number; replies: number; reposts: number };
export type PostcardEmbed = { type: 'image' | 'video' | 'audio'; url: string; aspectRatio: { width: number; height: number } };
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
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = defineProps<Props>();
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "postcard",
  props.type ? `postcard--${props.type}` : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <article :class="classNames" :data-testid="props['data-testid']">
    <div :class="'postcard__header'">
      <div :class="'postcard__userInfo'">
        <span :class="'postcard__displayName'"></span>
        <span :class="'postcard__handle'"></span>
      </div>
      <time :class="'postcard__timestamp'"></time>
    </div>
    <div :class="'postcard__content'">
      <slot />
    </div>
    <div :class="'postcard__footer'">
      <div :class="'postcard__stats'">
        <span :class="'postcard__stat'"></span>
      </div>
    </div>
  </article>
</template>
