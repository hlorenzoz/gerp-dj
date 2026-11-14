<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { Locale } from '../../config/site';
  import { useT } from '../../i18n';
  import { filterByZone, type ZoneFilter, zones } from '../../lib/shows';
  import type { ShowRow } from './data';

  interface Props {
    shows: ShowRow[];
    locale: Locale;
    /** Max rows shown after filtering (home shows 5). */
    limit?: number;
    /** Past shows: no zone filter and no ticket column. Render without a client directive (static). */
    past?: boolean;
    /** Heading placed next to the zone filter (home layout). */
    children?: Snippet;
  }

  let { shows, locale, limit = Number.POSITIVE_INFINITY, past = false, children }: Props = $props();
  const t = $derived(useT(locale));
  let zone = $state<ZoneFilter>('all');
  const visible = $derived(filterByZone(shows, zone).slice(0, limit));
</script>

{#if !past}
  <div class={['flex flex-wrap gap-6', children && 'items-end justify-between']}>
    {@render children?.()}
    <div class="flex flex-wrap gap-2" role="group" aria-label={t('aria.zoneFilter')}>
      {#each zones as z (z)}
        <button
          type="button"
          aria-pressed={z === zone}
          class={['press rounded-full px-4 py-2 font-medium', z === zone ? 'bg-acid text-on-acid' : 'glass-subtle hover:bg-ink/15']}
          onclick={() => (zone = z)}>{t(`ui.${z}`)}</button
        >
      {/each}
    </div>
  </div>
{/if}
<ol class={['grid gap-2', past ? 'mt-6 opacity-80' : children ? 'mt-10' : 'mt-6']}>
  {#each visible as s (s.id)}
    <li
      class="glass grid grid-cols-[4.5rem_1fr] items-center gap-x-4 gap-y-3 rounded-2xl p-5 transition-colors hover:bg-ink/10 sm:grid-cols-[6rem_1fr_auto] sm:p-6"
    >
      <time datetime={s.iso} class="row-span-2 text-center sm:row-span-1">
        <span class="block text-4xl leading-none font-bold tabular-nums">{s.day}</span>
        <span class="text-sm font-semibold text-muted uppercase">{s.month}</span>
      </time>
      <div>
        <p class="text-xl leading-tight font-bold sm:text-2xl">
          {s.city}{#if s.province}<span class="ml-1.5 font-medium text-muted">· {s.province}</span>{/if}
        </p>
        <p class="text-muted">{s.venue} — {s.event}</p>
      </div>
      {#if !past}
        <div class="sm:justify-self-end">
          {#if s.status === 'free'}
            <span class="glass-subtle rounded-full px-5 py-2.5 font-semibold">{t('ui.free')}</span>
          {:else if s.status === 'soldout'}
            <span class="rounded-full bg-signal/15 px-5 py-2.5 font-semibold text-signal">{t('ui.soldout')}</span>
          {:else if s.ticketUrl}
            <a
              href={s.ticketUrl}
              target="_blank"
              rel="noopener"
              class="press rounded-full bg-acid px-5 py-2.5 font-semibold text-on-acid hover:bg-ink hover:text-ground">{t('ui.onsale')}</a
            >
          {:else}
            <span class="rounded-full bg-acid px-5 py-2.5 font-semibold text-on-acid">{t('ui.onsale')}</span>
          {/if}
        </div>
      {/if}
    </li>
  {:else}
    <li class="glass rounded-2xl p-6 text-muted">{t('ui.none')}</li>
  {/each}
</ol>
