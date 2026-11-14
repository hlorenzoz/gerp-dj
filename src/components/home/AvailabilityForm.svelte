<script lang="ts">
  import { site, type Locale } from '../../config/site';
  import { useT } from '../../i18n';
  import { availabilityMessage, eventTypes, waLink, type EventType } from '../../lib/whatsapp';

  interface Props {
    locale: Locale;
  }

  let { locale }: Props = $props();
  const t = $derived(useT(locale));
  const types = $derived(eventTypes(locale));

  // Without JS the plain form still opens the chat (empty message); with JS it sends the prefilled question.
  function onsubmit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = availabilityMessage(locale, {
      date: String(data.get('date')),
      place: String(data.get('place')),
      type: data.get('type') as EventType,
    });
    window.open(waLink(text), '_blank', 'noopener');
  }
</script>

<form
  action={waLink()}
  method="get"
  target="_blank"
  class="glass-strong rounded-3xl p-6 sm:p-7"
  aria-labelledby="avail-h"
  {onsubmit}
>
  <h2 id="avail-h" class="text-3xl leading-tight font-bold">{t('avail.title')}</h2>
  <p class="mt-1 text-muted">{t('avail.p')}</p>
  <div class="mt-5 grid gap-3 sm:grid-cols-2">
    <label class="grid gap-1.5"
      ><span class="text-sm font-medium">{t('f.when')}</span>
      <input
        name="date"
        type="date"
        required
        class="glass-subtle rounded-2xl px-4 py-3 [color-scheme:dark] focus:ring-2 focus:ring-acid focus:outline-none"
      /></label
    >
    <label class="grid gap-1.5"
      ><span class="text-sm font-medium">{t('f.where')}</span>
      <input
        name="place"
        required
        autocomplete="address-level2"
        placeholder={site.location.locality}
        class="glass-subtle rounded-2xl px-4 py-3 placeholder:text-muted focus:ring-2 focus:ring-acid focus:outline-none"
      /></label
    >
    <label class="grid gap-1.5 sm:col-span-2"
      ><span class="text-sm font-medium">{t('f.type')}</span>
      <select
        name="type"
        class="glass-subtle rounded-2xl px-4 py-3 [color-scheme:dark] focus:ring-2 focus:ring-acid focus:outline-none"
      >
        {#each types as type (type.value)}
          <option value={type.value}>{type.label}</option>
        {/each}
      </select></label
    >
  </div>
  <button class="press mt-5 w-full rounded-full bg-ink px-6 py-3 font-semibold text-ground hover:bg-acid"
    >{t('avail.cta')}</button
  >
</form>
