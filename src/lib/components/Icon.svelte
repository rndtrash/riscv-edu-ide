<script lang="ts">
    export let icon: string;
    export let alt: string;
</script>

<picture>
    <source srcset="/icons/{icon}.svg" type="image/svg+xml"/>
    <img src="/icons/{icon}.png" {alt}/>
</picture>