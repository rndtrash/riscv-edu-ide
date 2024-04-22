<script lang="ts">
    export let icon: string;
    export let alt: string;
    export let size: number = 24;
</script>

<picture>
    <source srcset="/icons/{icon}.svg" type="image/svg+xml"/>
    <img src="/icons/{icon}.png" {alt} width={size} height={size}/>
</picture>