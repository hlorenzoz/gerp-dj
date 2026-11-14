<script lang="ts">
  import type { Locale } from '../../config/site';
  import { useT } from '../../i18n';
  import Cover from './Cover.svelte';
  import type { Release } from './data';

  interface Props {
    releases: (Release & { links: { href: string; label: string }[] })[];
    locale: Locale;
  }

  let { releases, locale }: Props = $props();
  const t = $derived(useT(locale));
  const types = ['all', 'single', 'remix', 'ep', 'album'] as const;
  let type = $state<(typeof types)[number]>('all');
  const visible = $derived(type === 'all' ? releases : releases.filter((r) => r.type === type));
</script>

<div class="mt-10 flex flex-wrap gap-2" role="group" aria-label={t('aria.typeFilter')}>
  {#each types as ty (ty)}
    <button
      type="button"
      aria-pressed={ty === type}
      class={['press rounded-full px-4 py-2 font-medium', ty === type ? 'bg-acid text-on-acid' : 'glass-subtle hover:bg-ink/15']}
      onclick={() => (type = ty)}>{ty === 'all' ? t('ui.allTypes') : t(`ui.${ty}`)}</button
    >
  {/each}
</div>
<ul class="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
  {#each visible as r (r.id)}
    <li>
      <Cover title={r.title} bg={r.bg} fg={r.fg} />
      <p class="mt-3 text-lg font-semibold">{r.title}</p>
      <p class="text-muted">{t(`ui.${r.type}`)} · {r.year}</p>
      {#if r.links.length}
        <p class="mt-2 flex flex-wrap gap-x-3 text-sm">
          {#each r.links as l (l.href)}
            <a href={l.href} target="_blank" rel="noopener" class="underline hover:text-acid-ink">{l.label}</a>
          {/each}
        </p>
      {/if}
    </li>
  {/each}
</ul>
