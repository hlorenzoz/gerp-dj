<script lang="ts">
  import type { Locale } from '../../config/site';
  import { useT } from '../../i18n';
  import { bookingMessage, eventTypes, waLink, type EventType } from '../../lib/whatsapp';

  let { locale }: { locale: Locale } = $props();

  const t = $derived(useT(locale));
  const types = $derived(eventTypes(locale));
  let sent = $state(false);

  // Without JS the plain GET form still opens the WhatsApp chat (wa.me ignores the fields).
  function onsubmit(e: SubmitEvent & { currentTarget: HTMLFormElement }) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const text = bookingMessage(locale, {
      name: String(f.get('name')),
      date: String(f.get('date')),
      venue: String(f.get('venue')),
      type: f.get('type') as EventType,
      msg: String(f.get('msg') ?? ''),
    });
    window.open(waLink(text), '_blank', 'noopener');
    sent = true;
  }
</script>

<form
  action={waLink()}
  method="get"
  target="_blank"
  {onsubmit}
  class="glass-strong grid gap-5 rounded-3xl p-7 sm:grid-cols-2 sm:p-10"
>
  <label class="grid gap-2"
    ><span class="font-medium">{t('f.name')}</span>
    <input name="name" required autocomplete="name" class="glass-subtle rounded-2xl px-4 py-3 focus:ring-2 focus:ring-acid-ink focus:outline-none" /></label
  >
  <label class="grid gap-2"
    ><span class="font-medium">{t('f.date')}</span>
    <input
      name="date"
      type="date"
      required
      class="glass-subtle rounded-2xl px-4 py-3 focus:ring-2 focus:ring-acid-ink focus:outline-none"
    /></label
  >
  <label class="grid gap-2 sm:col-span-2"
    ><span class="font-medium">{t('f.venue')}</span>
    <input name="venue" required class="glass-subtle rounded-2xl px-4 py-3 focus:ring-2 focus:ring-acid-ink focus:outline-none" /></label
  >
  <fieldset class="sm:col-span-2">
    <legend class="font-medium">{t('f.type')}</legend>
    <div class="mt-3 flex flex-wrap gap-2">
      {#each types as { value, label } (value)}
        <label
          class="glass-subtle cursor-pointer rounded-full px-4 py-2 has-checked:bg-acid has-checked:text-on-acid has-focus-visible:outline-2 has-focus-visible:outline-acid-ink"
          ><input type="radio" name="type" {value} class="sr-only" checked={value === 'popular'} /><span>{label}</span></label
        >
      {/each}
    </div>
  </fieldset>
  <label class="grid gap-2 sm:col-span-2"
    ><span class="font-medium">{t('f.msg')}</span>
    <textarea name="msg" rows="5" class="glass-subtle rounded-2xl px-4 py-3 focus:ring-2 focus:ring-acid-ink focus:outline-none"></textarea></label
  >
  <button class="press rounded-full bg-acid px-7 py-4 text-lg font-semibold text-on-acid hover:bg-ink hover:text-ground sm:col-span-2">{t('f.send')}</button>
  <p class={['font-semibold text-acid-ink sm:col-span-2', { hidden: !sent }]} role="status">{t('f.ok')}</p>
</form>
