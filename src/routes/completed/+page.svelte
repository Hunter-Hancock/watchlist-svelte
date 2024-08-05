<script>
  import { enhance } from "$app/forms";
  import { Button } from "$lib/components/ui/button";

  let { data } = $props();

  let items = $state(data.items);

  $effect(() => {
    items = data.items;
  });
</script>

{#each items as item}
  <div class="w-[300px] border rounded-t-lg shadow-lg">
    <img
      class="w-full rounded-t-lg"
      src={item.items.image}
      alt={item.items.title}
    />
    <h1 class="text-3xl text-center p-4">{item.items.title}</h1>
    <form method="POST" action="?/unwatch" use:enhance class="ml-auto">
      <input name="id" type="hidden" value={item.watchlist.watchlistId} />
      <Button type="submit">Mark Unwatched</Button>
    </form>
  </div>
{/each}
