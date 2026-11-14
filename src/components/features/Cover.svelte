<script lang="ts">
  import { site } from '../../config/site';

  interface Props {
    title: string;
    bg: string;
    fg: string;
    big?: boolean;
  }

  let { title, bg, fg, big = false }: Props = $props();
</script>

<!-- CSS-drawn cover (no artwork yet), like the prototype's coverHTML. -->
<div class="flex aspect-square w-full flex-col justify-between p-[7%]" style:background={bg} style:color={fg}>
  <span class={['display', big ? 'text-3xl' : 'text-base']}>{site.brand}</span>
  <span class={['display [overflow-wrap:anywhere]', big ? 'text-[clamp(2.5rem,7vw,6rem)]' : 'text-2xl sm:text-3xl']}
    >{title}</span
  >
</div>
