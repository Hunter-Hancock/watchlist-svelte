<script lang="ts">
    import { enhance } from "$app/forms";
    import { Button } from "$lib/components/ui/button";

    let { data } = $props();

    let items = $state(data.items);

    $effect(() => {
        items = data.items;
    });

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
        const f = document.getElementById(
            `${item.items.id}`,
        ) as HTMLFormElement;
        startHolding(item.items.id, f);
    };

    const stopHolding = () => {
        holdingIndex = 0;
        clearTimeout(holdTimer);
    };
</script>

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
                <div
                    class="flex items-center gap-2 text-sm text-muted-foreground"
                >
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
                action="?/unwatch"
                use:enhance2
                class="ml-auto hidden"
                id={`${item.items.id}`}
            >
                <input
                    name="id"
                    type="hidden"
                    value={item.watchlist.watchlistId}
                />
            </form>
        </div>
    {/each}
</div>

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
