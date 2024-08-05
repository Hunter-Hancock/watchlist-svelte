<script lang="ts">
  import { enhance as enhance2 } from "$app/forms";
  import { goto, invalidate } from "$app/navigation";
  import { page } from "$app/stores";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import SuperDebug, { superForm } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { addFormSchema } from "./schema.js";

  let { data } = $props();

  const types = data.types;
  const genres = data.genres;
  let items = $state(data.items);

  $effect(() => {
    items = data.items;
  });

  let open = $state(false);

  const { form, errors, enhance, constraints, delayed } = superForm(data.form, {
    validators: zodClient(addFormSchema),
    async onUpdated({ form }) {
      if (form.valid) {
        open = false;
      }
    },
  });

  const updatePage = async () => {
    await invalidate("custom:items");
  };

  const navigate = (thing1: string, thing2?: string) => {
    let params = new URLSearchParams($page.url.searchParams.toString());

    params.set("test", thing1);
    if (thing2) params.set("genre", thing2);

    goto(`?${params.toString()}`);
  };

  let holdingIndex = $state();
  let holdTimer: NodeJS.Timeout;
  let watchForm: HTMLFormElement | null = $state(null);

  const startHolding = (index: number, form: HTMLFormElement) => {
    holdingIndex = index;
    holdTimer = setTimeout(() => {
      watchForm = form;
      watchForm.requestSubmit();
    }, 1000);
  };

  const mouseDown = (item: (typeof items)[0]) => {
    const f = document.getElementById(`${item.items.id}`) as HTMLFormElement;
    startHolding(item.items.id, f);
  };

  const stopHolding = () => {
    holdingIndex = 0;
    clearTimeout(holdTimer);
  };

  // let selectedType = $derived.by(() => {
  //   return $form.type
  //     ? {
  //         label: $form.type,
  //         value: $form.type,
  //       }
  //     : undefined;
  // });
</script>

{#if $delayed}
  <div
    class="absolute flex items-center justify-center w-12 h-12 rounded-full border-red-500 border-4 border-t-transparent animate-spin"
  ></div>
{/if}

<div class="flex justify-end mb-10">
  <div class="mr-auto space-x-20">
    <Button onclick={() => goto("?")} type="button" size="lg">All</Button>
    {#each types as type}
      <Button onclick={() => navigate(type.name)} type="button" size="lg"
        >{type.name}</Button
      >
    {/each}
    <!-- <Button onclick={() => goto(`?test=${type.name}`)} type="button" size="lg"
        >{type.name}</Button
      >
    {/each} -->
  </div>
  <Dialog.Root bind:open>
    <Dialog.Trigger class={buttonVariants({ variant: "default", size: "lg" })}
      >Add</Dialog.Trigger
    >
    <Dialog.Content class="sm:max-w-[425px]">
      <Dialog.Header>
        <Dialog.Title>Add to Watchlist</Dialog.Title>
        <Dialog.Description>
          Enter Title, Type of media, and genre to add to Watchlist.
        </Dialog.Description>
      </Dialog.Header>
      <form method="POST" action="?/add" use:enhance>
        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="title" class="text-center">Title</Label>
            <Input
              {...$constraints.title}
              name="title"
              placeholder="Enter Title..."
              class="col-span-3"
              bind:value={$form.title}
            />
            {#if $errors.title}
              <small class="col-span-4 text-center text-red-500"
                >{$errors.title}</small
              >
            {/if}
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="type" class="text-center">Type</Label>
            <select
              name="type"
              class="border rounded-sm py-2 px-3 col-span-3"
              bind:value={$form.type}
              {...$constraints.type}
            >
              {#each types as type}
                <option value={type.id}>{type.name}</option>
              {/each}
            </select>
            {#if $errors.type}
              <small class="col-span-4 text-center text-red-500"
                >{$errors.type}</small
              >
            {/if}
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="genre" class="text-center">Genre</Label>
            <select
              name="genre"
              class="border rounded-sm py-2 px-3 col-span-3"
              bind:value={$form.genre}
              {...$constraints.genre}
            >
              {#each genres as genre}
                <option value={genre.id}>{genre.name}</option>
              {/each}
            </select>
            {#if $errors.genre}
              <small class="col-span-4 text-center text-red-500"
                >{$errors.genre}</small
              >
            {/if}
          </div>
        </div>
        <Dialog.Footer>
          <Button onclick={updatePage} type="submit">Add to Watchlist</Button>
        </Dialog.Footer>
      </form>
    </Dialog.Content>
  </Dialog.Root>
</div>

{#if items.length > 0}
  <div
    class="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 justify-items-center items-center gap-20"
  >
    {#each items as item (item.items.id)}
      <div
        class={`border bg-card text-card-foreground w-full max-w-[300px] rounded-lg overflow-hidden shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl ${holdingIndex == item.items.id ? "holding" : ""}`}
        role="button"
        tabindex="0"
        onmousedown={() => mouseDown(item)}
        onmouseup={stopHolding}
        onmouseleave={stopHolding}
        ontouchstart={() => mouseDown(item)}
        ontouchend={stopHolding}
        ontouchmove={stopHolding}
      >
        <img
          src={item.items.image}
          alt={item.items.title}
          width="300"
          height="450"
          class="w-full h-[450px] object-cover"
          style="aspect-ratio: 300 / 450; object-fit: cover;"
        />
        <div class="p-4 bg-background">
          <h3 class="text-lg font-semibold mb-1">{item.items.title}</h3>
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{item.genres.name}</span>
            <div
              data-orientation="vertical"
              role="none"
              class="shrink-0 bg-border w-[1px] h-4"
            ></div>
            <span>{item.types.name}</span>
          </div>
        </div>
        <form
          method="POST"
          action="?/watch"
          use:enhance2
          class="ml-auto hidden"
          id={`${item.items.id}`}
        >
          <input name="id" type="hidden" value={item.watchlist.watchlistId} />
        </form>
      </div>
      <!-- <div
        class="flex flex-col w-[300px] border rounded-t-lg shadow-lg hover: cursor-pointer hover:scale-110 transition-all ease-out delay-50 select-none"
      >
        <img
          class="w-full h-[400px] rounded-t-lg select-none"
          src={item.items.image}
          alt={item.items.title}
        />
        <h1 class="text-3xl text-center p-4 truncate">
          {item.items.title}
        </h1>
        <form method="POST" action="?/watch" use:enhance2 class="ml-auto">
          <input name="id" type="hidden" value={item.watchlist.watchlistId} />
          <Button type="submit">Mark Watched</Button>
        </form>
      </div> -->
    {/each}
  </div>
{:else}
  <h1 class="text-3xl text-center">No Results</h1>
{/if}

<style>
  @keyframes holdAnimation {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  .holding {
    animation: holdAnimation 1s linear forwards;
  }
</style>
