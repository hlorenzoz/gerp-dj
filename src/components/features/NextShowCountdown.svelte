<script lang="ts">
  import { untrack } from 'svelte';
  import type { Locale } from '../../config/site';
  import { useT } from '../../i18n';
  import { countdownParts } from '../../lib/shows';

  interface Props {
    locale: Locale;
    /** Show start, epoch ms. */
    target: number;
    /** Render time (build). */
    now: number;
    where: string;
    when: string;
    href: string;
    external: boolean;
  }

  let { locale, target, now: renderedAt, where, when, href, external }: Props = $props();
  const t = $derived(useT(locale));
  const units = ['d', 'h', 'm', 's'] as const;
  // Starts from the render time so server HTML and hydration match, then the ticker takes over.
  let now = $state(untrack(() => renderedAt));
  const parts = $derived(countdownParts(target, now));

  // Ticks once a minute under reduced motion.
  function ticker() {
    const step = matchMedia('(prefers-reduced-motion: reduce)').matches ? 60_000 : 1000;
    const tick = () => (now = Date.now());
    tick();
    const id = setInterval(tick, step);
    return () => clearInterval(id);
  }
</script>

<aside class="glass-strong rounded-3xl p-6 sm:p-7" aria-labelledby="next-where" {@attach ticker}>
  <h2 class="text-3xl leading-tight font-bold" id="next-where">{where}</h2>
  <p class="mt-1">
    <span class="font-semibold text-acid">{t('next.title')}</span>
    <span class="text-muted">{when}</span>
  </p>
  <div class="mt-6 grid grid-cols-4 gap-2 text-center" aria-live="off">
    {#each units as u (u)}
      <div class="glass-subtle rounded-2xl py-3">
        <span class={['block text-3xl font-bold tabular-nums', u === 's' && 'text-acid']} data-cd={u}>{parts[u]}</span>
        <span class="text-sm text-muted">{t(`cd.${u}`)}</span>
      </div>
    {/each}
  </div>
  <a
    {href}
    target={external ? '_blank' : undefined}
    rel={external ? 'noopener' : undefined}
    class="press mt-6 block rounded-full bg-ink px-6 py-3 text-center font-semibold text-ground hover:bg-acid"
    >{t('tickets')}</a
  >
</aside>
