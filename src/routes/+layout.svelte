<script>
  import * as Avatar from "$lib/components/ui/avatar";
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import "../app.css";

  const { children, data} = $props();
</script>

<svelte:head>
  <title>Watchlist V2</title>
</svelte:head>

<header class="flex w-full px-4 items-center h-16 border-2">
  <a class="text-3xl font-semibold mr-auto" href="/">Watchlist</a>
  <nav>
    <ul class="flex items-center">
      <li class="mr-10">
        <a class="" href="/completed">Completed</a>
      </li>
      {#if data.user}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Avatar.Root class="border-2 border-black">
              <Avatar.Image src={data.user.avatar} />
              <Avatar.Fallback>NA</Avatar.Fallback>
            </Avatar.Root>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Group>
              <DropdownMenu.Item>
                <Button class="w-full" href="/logout">Logout</Button>
              </DropdownMenu.Item>
            </DropdownMenu.Group>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      {:else}
        <li>
          <Button href="/login/discord">Login</Button>
        </li>
      {/if}
    </ul>
  </nav>
</header>

<main class="flex flex-col px-4 py-4 min-h-screen">
  {@render children()}
</main>