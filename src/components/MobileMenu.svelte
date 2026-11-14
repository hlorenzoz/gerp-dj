<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { NavLink } from './nav';

  interface Props {
    links: NavLink[];
    bookHref: string;
    labels: { menu: string; close: string; nav: string; book: string };
    /** Static markup from Astro (the theme toggle). */
    children?: Snippet;
  }

  let { links, bookHref, labels, children }: Props = $props();
  let dialog: HTMLDialogElement;
</script>

<button
  type="button"
  class="press glass-subtle rounded-full px-4 py-2 text-[15px] font-medium lg:hidden"
  aria-haspopup="dialog"
  onclick={() => dialog.showModal()}>{labels.menu}</button
>

<dialog
  bind:this={dialog}
  class="glass-strong m-0 ml-auto h-dvh max-h-none w-full max-w-sm bg-transparent p-0 text-ink backdrop:bg-ground/60"
  aria-label={labels.menu}
>
  <div class="flex h-full flex-col p-6">
    <div class="flex items-center justify-between gap-4">
      {@render children?.()}
      <button type="button" class="press glass-subtle ml-auto rounded-full px-4 py-2 font-medium" onclick={() => dialog.close()}
        >{labels.close}</button
      >
    </div>
    <!-- Closing on click matters for same-page hash links (#servicios), which do not navigate away. -->
    <nav aria-label={labels.nav} class="mt-10 flex flex-col gap-2">
      {#each links as link (link.href)}
        <a
          href={link.href}
          class="display py-2 text-5xl"
          target={link.external ? '_blank' : undefined}
          rel={link.external ? 'noopener' : undefined}
          onclick={() => dialog.close()}>{link.label}</a
        >
      {/each}
    </nav>
    <a href={bookHref} class="press mt-auto rounded-full bg-acid px-6 py-4 text-center text-lg font-semibold text-on-acid"
      >{labels.book}</a
    >
  </div>
</dialog>
